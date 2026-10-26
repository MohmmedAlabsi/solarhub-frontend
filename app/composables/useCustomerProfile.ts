import type {
  CustomerProfileErrors,
  CustomerProfileForm,
  CustomerProfileSaveState,
  CustomerProfileSummary,
  CustomerSession,
} from '~~/types/customer-profile'
import { useAuthStore } from '~/stores/auth'
import { useGovernorates } from '~/composables/useGovernorates'

export const useCustomerProfile = () => {
  const authStore = useAuthStore()
  const { getGovernorateIdByName } = useGovernorates()

  const form = reactive<CustomerProfileForm>({
    fullName: authStore.user?.name || '',
    accountType: authStore.user?.role === 'customer' ? 'عميل (مشاريع سكنية وتجارية)' : authStore.user?.role === 'engineer' ? 'مهندس معتمد' : authStore.user?.role === 'supplier' ? 'مورد / متجر معتمد' : 'حساب مستخدم',
    city: (typeof authStore.user?.governorate === 'object' ? authStore.user?.governorate?.name_ar : authStore.user?.governorate) || 'صنعاء',
    email: authStore.user?.email || '',
    phone: authStore.user?.phone || '',
    address: (authStore.user as any)?.default_coordinates || authStore.user?.location?.address || 'صنعاء - مركز المحافظة',
    twoFactorEnabled: false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const errors = reactive<CustomerProfileErrors>({})
  const saveState = ref<CustomerProfileSaveState>('idle')
  const statusMessage = ref('')
  const terminatingSessions = ref(false)

  // Sync with current authenticated user
  const syncWithAuthUser = () => {
    if (!authStore.user) return
    form.fullName = authStore.user.name || form.fullName
    form.email = authStore.user.email || form.email
    form.phone = authStore.user.phone || form.phone
    
    const gov = typeof authStore.user.governorate === 'object' 
      ? authStore.user.governorate?.name_ar 
      : authStore.user.governorate
    if (gov) form.city = gov

    if (authStore.user.role === 'customer') {
      form.accountType = 'عميل (مشاريع سكنية وتجارية)'
    } else if (authStore.user.role === 'engineer') {
      form.accountType = 'مهندس معتمد'
    } else if (authStore.user.role === 'supplier') {
      form.accountType = 'مورد / متجر معتمد'
    } else if (authStore.user.role === 'admin') {
      form.accountType = 'مسؤول النظام'
    }
  }

  // Load latest profile from API
  const loadProfile = async () => {
    if (authStore.token && !authStore.user) {
      await authStore.initAuth()
    }
    syncWithAuthUser()
  }

  onMounted(() => {
    loadProfile()
  })

  const summary = computed<CustomerProfileSummary>(() => {
    const nameParts = (form.fullName || authStore.user?.name || 'مستخدم').split(' ')
    const initials = nameParts.length >= 2 
      ? `${nameParts[0][0]}.${nameParts[1][0]}` 
      : nameParts[0]?.slice(0, 2) || 'م'

    return {
      initials,
      customerId: `CU-${authStore.user?.id || '90241'}`,
      verified: !!authStore.user?.isVerified,
    }
  })

  const sessions = computed<CustomerSession[]>(() => [
    { 
      id: 'current', 
      browser: 'المتصفح الحالي', 
      operatingSystem: 'جلسة نشطة', 
      location: form.city || 'اليمن', 
      isCurrent: true 
    },
  ])

  const clearErrors = () => {
    for (const key of Object.keys(errors) as Array<keyof CustomerProfileErrors>) {
      delete errors[key]
    }
  }

  const validate = () => {
    clearErrors()
    if (!form.fullName.trim() || form.fullName.trim().length < 3) {
      errors.fullName = 'يرجى إدخال الاسم الكامل (3 أحرف على الأقل).'
    }
    if (!form.city.trim()) {
      errors.city = 'يرجى اختيار المحافظة.'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'يرجى إدخال بريد إلكتروني صحيح.'
    }
    if (!form.phone.trim()) {
      errors.phone = 'يرجى إدخال رقم الجوال.'
    }

    const changingPassword = Boolean(form.currentPassword || form.newPassword || form.confirmPassword)
    if (changingPassword) {
      if (!form.currentPassword) {
        errors.currentPassword = 'أدخل كلمة المرور الحالية لتأكيد التغيير.'
      }
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.newPassword)) {
        errors.newPassword = 'كلمة المرور الجديدة يجب أن تحتوي على 8 خانات على الأقل وحرف كبير وحرف صغير ورقم.'
      }
      if (form.confirmPassword !== form.newPassword) {
        errors.confirmPassword = 'تأكيد كلمة المرور غير مطابق.'
      }
    }
    return Object.keys(errors).length === 0
  }

  const saveProfile = async () => {
    statusMessage.value = ''
    if (!validate()) {
      saveState.value = 'error'
      statusMessage.value = 'يرجى مراجعة وتصحيح الحقول الموضحة أدناه.'
      return false
    }

    saveState.value = 'saving'

    const payload: Record<string, any> = {
      name: form.fullName.trim(),
      phone: form.phone.trim(),
    }

    const govId = getGovernorateIdByName(form.city)
    if (govId) {
      payload.governorate_id = govId
    }

    if (form.address) {
      payload.default_coordinates = form.address
    }

    if (form.currentPassword && form.newPassword) {
      payload.current_password = form.currentPassword
      payload.password = form.newPassword
      payload.password_confirmation = form.confirmPassword
    }

    try {
      const res = await authStore.updateProfile(payload)

      if (res.success) {
        form.currentPassword = ''
        form.newPassword = ''
        form.confirmPassword = ''
        saveState.value = 'success'
        statusMessage.value = res.message || 'تم حفظ وتحديث بيانات الملف الشخصي بنجاح.'
        return true
      } else {
        saveState.value = 'error'
        if (res.errors) {
          if (res.errors.name) errors.fullName = res.errors.name[0]
          if (res.errors.phone) errors.phone = res.errors.phone[0]
          if (res.errors.current_password) errors.currentPassword = res.errors.current_password[0]
          if (res.errors.password) errors.newPassword = res.errors.password[0]
        }
        statusMessage.value = res.error || 'تعذر تحديث البيانات، يرجى التأكد من الحقول والمحاولة مجدداً.'
        return false
      }
    } catch {
      saveState.value = 'error'
      statusMessage.value = 'حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة لاحقاً.'
      return false
    }
  }

  const resetProfile = () => {
    syncWithAuthUser()
    clearErrors()
    saveState.value = 'idle'
    statusMessage.value = ''
  }

  const terminateOtherSessions = async () => {
    terminatingSessions.value = true
    await new Promise(resolve => setTimeout(resolve, 350))
    terminatingSessions.value = false
    statusMessage.value = 'تم إنهاء كافة الجلسات الأخرى بنجاح.'
  }

  watch(form, () => {
    if (saveState.value !== 'saving') saveState.value = 'idle'
    statusMessage.value = ''
  }, { deep: true })

  return {
    form,
    errors,
    saveState,
    statusMessage,
    summary,
    sessions,
    terminatingSessions,
    saveProfile,
    resetProfile,
    terminateOtherSessions,
    loadProfile,
  }
}
