import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
} from 'vue'
import { useAuthStore } from '../stores/auth'
import type {
  CustomerProfileErrors,
  CustomerProfileForm,
  CustomerProfileSaveState,
  CustomerProfileSummary,
  CustomerSession,
} from '../../types/customer-profile'

interface ApiResponse<T> {
  status: string
  message?: string
  data: T
}

interface ApiGovernorate {
  id: number
  name?: string | null
  name_ar?: string | null
  name_en?: string | null
}

interface ApiProfile {
  id: number | string
  name: string
  email: string
  phone: string
  role?: string | null
  default_coordinates?: string | null

  governorate?: {
    id: number | null
    name_ar?: string | null
  } | null
}

interface SelectedLocation {
  address: string
  lat: number
  lng: number
  governorate?: string
}

interface ApiFailure {
  data?: {
    message?: string
    errors?: Record<string, string[] | string>
  }
}

function governorateName(governorate: ApiGovernorate): string {
  return governorate.name_ar
    || governorate.name
    || governorate.name_en
    || ''
}

function normalizeRegion(value: string): string {
  return value
    .replace(/محافظة/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function useCustomerProfile() {
  const authStore = useAuthStore()
  const { $api } = useNuxtApp()

  const form = reactive<CustomerProfileForm>({
    fullName: '',
    accountType: '',
    city: '',
    email: '',
    phone: '',
    address: '',
    coordinates: '',
    twoFactorEnabled: false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const errors = reactive<CustomerProfileErrors>({})
  const saveState = ref<CustomerProfileSaveState>('idle')
  const statusMessage = ref('')

  const loading = ref(true)
  const loadError = ref('')
  const profileLoaded = ref(false)

  const governorates = ref<ApiGovernorate[]>([])
  const coordinatesChanged = ref(false)

  // للتوافق المؤقت مع صفحة الإعدادات الحالية.
  // الباك إند لا يوفر قائمة جلسات أو إنهاء جلسات أخرى.
  const sessions = computed<CustomerSession[]>(() => [])
  const terminatingSessions = ref(false)

  let snapshot: CustomerProfileForm | null = null
  let requestVersion = 0

  const governorateOptions = computed(() =>
    governorates.value.map(governorate => ({
      value: String(governorate.id),
      label: governorateName(governorate),
    })),
  )

  const summary = computed<CustomerProfileSummary>(() => {
    const parts = form.fullName.trim().split(/\s+/).filter(Boolean)

    return {
      initials: parts
        .slice(0, 2)
        .map(part => part.charAt(0))
        .join('.') || 'م',

      customerId: String(authStore.user?.id ?? 'غير متاح'),
      verified: Boolean(authStore.user?.isVerified),
    }
  })

  function clearErrors() {
    for (const key of Object.keys(errors)) {
      delete errors[key as keyof CustomerProfileErrors]
    }
  }

  function isCurrent(version: number, token: string): boolean {
    return requestVersion === version
      && authStore.token === token
  }

  function applyProfile(profile: ApiProfile, address = '') {
    const roleLabels: Record<string, string> = {
      customer: 'عميل',
      engineer: 'مهندس',
      supplier: 'مورد',
      admin: 'مسؤول النظام',
    }

    Object.assign(form, {
      fullName: profile.name || '',
      accountType:
        roleLabels[authStore.user?.role || ''] || 'حساب مستخدم',
      city: profile.governorate?.id
        ? String(profile.governorate.id)
        : '',
      email: profile.email || '',
      phone: profile.phone || '',
      address,
      coordinates: authStore.user?.default_coordinates || '',
      twoFactorEnabled: false,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })

    snapshot = { ...form }
    coordinatesChanged.value = false
  }

  async function loadProfile() {
    if (saveState.value === 'saving') return

    const version = ++requestVersion
    const token = authStore.token
    const ownerId = authStore.user?.id

    loading.value = true
    loadError.value = ''
    profileLoaded.value = false
    statusMessage.value = ''
    clearErrors()

    if (!token) {
      loading.value = false
      loadError.value = 'سجّل الدخول لعرض بيانات حسابك.'
      return
    }

    try {
      const [profileResponse, governoratesResponse] = await Promise.all([
        $api<ApiResponse<ApiProfile>>('/auth/me'),
        $api<ApiResponse<ApiGovernorate[]>>('/governorates'),
      ])

      if (!isCurrent(version, token)) return

      if (
        profileResponse.status !== 'success'
        || !profileResponse.data
        || !profileResponse.data.id
        || governoratesResponse.status !== 'success'
        || !Array.isArray(governoratesResponse.data)
      ) {
        throw new Error('Invalid profile response')
      }

      if (
        ownerId !== undefined
        && ownerId !== null
        && String(profileResponse.data.id) !== String(ownerId)
      ) {
        throw new Error('Account mismatch')
      }

      governorates.value = governoratesResponse.data

      // يعتمد على تصحيح setUser في الخطوة السابقة.
      authStore.setUser(profileResponse.data)

      applyProfile(profileResponse.data)

      profileLoaded.value = true
      saveState.value = 'idle'
    } catch {
      if (!isCurrent(version, token)) return

      loadError.value =
        'تعذر تحميل بيانات الحساب والمحافظات. أعد المحاولة.'
    } finally {
      if (isCurrent(version, token)) {
        loading.value = false
      }
    }
  }

  function setProfileLocation(location: SelectedLocation) {
    if (
      loading.value
      || !profileLoaded.value
      || saveState.value === 'saving'
    ) {
      return
    }

    if (
      !Number.isFinite(location.lat)
      || !Number.isFinite(location.lng)
      || location.lat < -90
      || location.lat > 90
      || location.lng < -180
      || location.lng > 180
    ) {
      errors.address = 'الموقع المحدد غير صالح.'
      return
    }

    form.address = location.address.trim()
    form.coordinates = `POINT(${location.lng} ${location.lat})`
    coordinatesChanged.value = true

    delete errors.address

    if (location.governorate) {
      const region = normalizeRegion(location.governorate)

      const matched = governorates.value.find(governorate =>
        normalizeRegion(governorateName(governorate)) === region,
      )

      if (matched) {
        form.city = String(matched.id)
        delete errors.city
      }
    }

    saveState.value = 'idle'
    statusMessage.value = ''
  }

  function validate(): boolean {
    clearErrors()

    const name = form.fullName.trim()
    const phone = form.phone.trim()

    if (!name || name.length > 150) {
      errors.fullName = 'أدخل الاسم، بحد أقصى 150 حرفًا.'
    }

    if (!phone || phone.length > 30) {
      errors.phone = 'أدخل رقم الجوال، بحد أقصى 30 حرفًا.'
    }

    if (
      form.city
      && !governorates.value.some(
        governorate => String(governorate.id) === form.city,
      )
    ) {
      errors.city = 'اختر محافظة من القائمة.'
    }

    if (snapshot && form.email !== snapshot.email) {
      errors.email = 'تغيير البريد الإلكتروني غير متاح من هذه الصفحة.'
    }

    if (
      snapshot
      && form.address !== snapshot.address
      && !coordinatesChanged.value
    ) {
      errors.address = 'حدد الموقع من الخريطة لحفظ إحداثياته.'
    }

    if (coordinatesChanged.value) {
      const match = String(form.coordinates || '').match(
        /^POINT\((-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)\)$/,
      )

      const longitude = match ? Number(match[1]) : NaN
      const latitude = match ? Number(match[2]) : NaN

      if (
        !Number.isFinite(longitude)
        || !Number.isFinite(latitude)
        || longitude < -180
        || longitude > 180
        || latitude < -90
        || latitude > 90
      ) {
        errors.address = 'حدد موقعًا صالحًا من الخريطة.'
      }
    }

    if (form.twoFactorEnabled) {
      statusMessage.value =
        'تفعيل التحقق بخطوتين غير متاح حاليًا.'
      return false
    }

    const changingPassword = Boolean(
      form.currentPassword
      || form.newPassword
      || form.confirmPassword,
    )

    if (changingPassword) {
      if (!form.currentPassword) {
        errors.currentPassword = 'أدخل كلمة المرور الحالية.'
      }

      if (form.newPassword.length < 8) {
        errors.newPassword =
          'كلمة المرور الجديدة يجب أن تحتوي على 8 أحرف على الأقل.'
      }

      if (form.confirmPassword !== form.newPassword) {
        errors.confirmPassword = 'تأكيد كلمة المرور غير مطابق.'
      }
    }

    return Object.keys(errors).length === 0
  }

  async function saveProfile(): Promise<boolean> {
    if (
      loading.value
      || loadError.value
      || !profileLoaded.value
      || saveState.value === 'saving'
    ) {
      return false
    }

    statusMessage.value = ''

    if (!validate()) {
      saveState.value = 'error'

      if (!statusMessage.value) {
        statusMessage.value = 'راجع الحقول الموضحة قبل الحفظ.'
      }

      return false
    }

    const token = authStore.token
    const ownerId = authStore.user?.id
    const version = requestVersion

    if (!token || ownerId === undefined || ownerId === null) {
      saveState.value = 'error'
      statusMessage.value = 'سجّل الدخول قبل حفظ التعديلات.'
      return false
    }

    const payload: Record<string, string | number | null> = {
      name: form.fullName.trim(),
      phone: form.phone.trim(),
      governorate_id: form.city ? Number(form.city) : null,
    }

    // لا نرسل الإحداثيات إلا عند اختيار موقع جديد.
    if (coordinatesChanged.value) {
      payload.default_coordinates = form.coordinates || null
    }

    if (form.newPassword) {
      payload.current_password = form.currentPassword
      payload.password = form.newPassword
      payload.password_confirmation = form.confirmPassword
    }

    saveState.value = 'saving'

    try {
      const response = await $api<ApiResponse<ApiProfile>>(
        '/my/profile',
        {
          method: 'PUT',
          body: payload,
          retry: 0,
        },
      )

      if (!isCurrent(version, token)) return false

      if (
        response.status !== 'success'
        || !response.data
        || String(response.data.id) !== String(ownerId)
      ) {
        throw new Error('Profile update was not confirmed')
      }

      const selectedAddress = form.address

      authStore.setUser(response.data)
      applyProfile(response.data, selectedAddress)

      saveState.value = 'success'
      statusMessage.value = 'تم حفظ بيانات الحساب بنجاح.'

      return true
    } catch (failure: unknown) {
      if (!isCurrent(version, token)) return false

      const response = (failure as ApiFailure)?.data
      const fieldErrors = response?.errors || {}

      const fieldMap: Record<string, keyof CustomerProfileForm> = {
        name: 'fullName',
        phone: 'phone',
        governorate_id: 'city',
        default_coordinates: 'address',
        current_password: 'currentPassword',
        password: 'newPassword',
        password_confirmation: 'confirmPassword',
      }

      for (const [apiField, formField] of Object.entries(fieldMap)) {
        const messages = fieldErrors[apiField]
        const message = Array.isArray(messages)
          ? messages[0]
          : messages

        if (typeof message === 'string') {
          errors[formField] = message
        }
      }

      if (
        response?.message === 'The current password is incorrect.'
      ) {
        errors.currentPassword = 'كلمة المرور الحالية غير صحيحة.'
      }

      saveState.value = 'error'

      statusMessage.value = Object.keys(errors).length
        ? 'تعذر الحفظ. راجع الحقول الموضحة.'
        : 'تعذر تأكيد الحفظ. أعد تحميل بيانات الحساب للتحقق قبل المحاولة مجددًا.'

      return false
    }
  }

  function resetProfile() {
    if (saveState.value === 'saving' || !snapshot) return

    Object.assign(form, snapshot)

    coordinatesChanged.value = false
    clearErrors()
    saveState.value = 'idle'
    statusMessage.value = ''
  }

  function terminateOtherSessions() {
    saveState.value = 'error'
    statusMessage.value =
      'إدارة الجلسات الأخرى غير متاحة حاليًا.'
  }

  onMounted(() => {
    void loadProfile()
  })

  onBeforeUnmount(() => {
    requestVersion++
  })

  return {
    form,
    errors,
    loading,
    loadError,
    profileLoaded,
    governorateOptions,
    coordinatesChanged,
    saveState,
    statusMessage,
    summary,
    sessions,
    terminatingSessions,
    loadProfile,
    setProfileLocation,
    saveProfile,
    resetProfile,
    terminateOtherSessions,
  }
}