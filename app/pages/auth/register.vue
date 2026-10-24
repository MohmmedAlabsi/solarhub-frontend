<script setup lang="ts">
import { Eye, EyeOff, ArrowLeft, MapPin, Map as MapIcon, AlertCircle, ChevronDown, Crosshair, Loader2, Check } from 'lucide-vue-next'
import type { UserRole } from '~~/types/auth'
import { useAuthStore } from '~/stores/auth'
import { useGovernorates } from '~/composables/useGovernorates'
import MapLocationModal from '~/components/common/MapLocationModal.vue'
import AuthFileUploadInput from '~/components/auth/FileUploadInput.vue'

definePageMeta({
  layout: 'auth',
})

useSeoMeta({
  title: 'إنشاء حساب جديد | منصة سولار هب',
  description: 'انضم كعميل، مهندس معتمد، أو مورد طاقة شمسية في منصة سولار هب الرائدة.',
})

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Initialize role from query if provided (e.g. ?role=engineer or ?role=supplier)
const initialRole = (route.query.role as UserRole) || 'customer'
const selectedRole = ref<UserRole>(initialRole)

// Form fields
const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  governorate: '',
  locationText: '',
  locationCoordinates: null as { lat: number; lng: number } | null,
  companyName: '',
  licenseNumber: '',
  commercialRegistry: '',
  storeType: 'retailer' as 'wholesaler' | 'retailer' | 'authorized_agent',
  cvFile: null as File | null,
  commercialRegisterFile: null as File | null,
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref('')
const isMapModalOpen = ref(false)

const { governorates: govList, loadGovernorates, getGovernorateIdByName, getGovernorateCoords } = useGovernorates()

onMounted(() => {
  loadGovernorates()
})

// Complete Yemeni Governorates matching requirements
const governorates = computed(() => govList.value.map(g => g.name_ar))

const subtitleText = computed(() => {
  if (selectedRole.value === 'supplier') {
    return 'اختر نوع الحساب وأدخل بياناتك للانضمام إلى منصة سولار هب'
  }
  return 'اختر نوع الحساب وأدخل بياناتك للبدء مع منصة سولار هب'
})

const submitButtonText = computed(() => {
  if (selectedRole.value === 'engineer') return 'إنشاء التسجيل'
  if (selectedRole.value === 'supplier') return 'إنشاء حساب'
  return 'إنشاء الحساب'
})

watch(() => form.governorate, (newGov) => {
  if (newGov) {
    if (!form.locationText || form.locationText.includes('مركز المحافظة') || form.locationText.includes('مركز المدينة') || form.locationText === '') {
      form.locationText = `${newGov} - مركز المحافظة`
    }
    form.locationCoordinates = getGovernorateCoords(newGov)
    if (errorMessage.value.includes('الموقع الجغرافي') || errorMessage.value.includes('المحافظة')) {
      errorMessage.value = ''
    }
  }
})

const isQuickLocating = ref(false)

function findNearestGovFromCoords(lat: number, lng: number): string {
  let nearestGov = form.governorate || 'صنعاء'
  let minDistance = Infinity
  for (const gov of govList.value) {
    const dist = Math.hypot(gov.lat - lat, gov.lng - lng)
    if (dist < minDistance) {
      minDistance = dist
      nearestGov = gov.name_ar
    }
  }
  return nearestGov
}

async function quickLocateUser() {
  isQuickLocating.value = true
  errorMessage.value = ''

  if (typeof window !== 'undefined' && 'geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        form.locationCoordinates = { lat, lng }
        const matchedGov = findNearestGovFromCoords(lat, lng)
        form.governorate = matchedGov
        form.locationText = `${matchedGov} - موقع محدد عبر الـ GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`
        isQuickLocating.value = false
      },
      (err) => {
        console.warn('GPS notice:', err)
        const targetGov = form.governorate || 'صنعاء'
        form.governorate = targetGov
        form.locationCoordinates = getGovernorateCoords(targetGov)
        form.locationText = `${targetGov} - مركز المحافظة`
        isQuickLocating.value = false
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
    )
  } else {
    const targetGov = form.governorate || 'صنعاء'
    form.governorate = targetGov
    form.locationCoordinates = getGovernorateCoords(targetGov)
    form.locationText = `${targetGov} - مركز المحافظة`
    isQuickLocating.value = false
  }
}

function handleLocationSelected(loc: { address: string; lat: number; lng: number; governorate?: string }) {
  form.locationText = loc.address
  form.locationCoordinates = { lat: loc.lat, lng: loc.lng }
  if (loc.governorate) {
    const match = governorates.value.find(g => g.includes(loc.governorate!) || loc.governorate!.includes(g))
    if (match) {
      form.governorate = match
    }
  }
  errorMessage.value = ''
}

async function handleSubmit() {
  errorMessage.value = ''

  // Validations
  if (!form.name.trim()) {
    errorMessage.value = 'يرجى إدخال الاسم الكامل'
    return
  }

  if (!form.email.trim()) {
    errorMessage.value = 'يرجى إدخال البريد الإلكتروني'
    return
  }

  if (!form.phone.trim()) {
    errorMessage.value = 'يرجى إدخال رقم الجوال'
    return
  }

  if (!form.password) {
    errorMessage.value = 'يرجى إدخال كلمة المرور'
    return
  }

  if (form.password.length < 8) {
    errorMessage.value = 'كلمة المرور يجب أن لا تقل عن 8 خانات'
    return
  }

  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'كلمتا المرور غير متطابقتين'
    return
  }

  if (!form.governorate) {
    errorMessage.value = 'يرجى اختيار المحافظة / المنطقة'
    return
  }

  if (!form.locationText.trim()) {
    errorMessage.value = 'يرجى تحديد الموقع الجغرافي أو إدخال عنوانك بالتفصيل'
    return
  }

  // Role-specific validations
  if (selectedRole.value === 'engineer') {
    if (!form.licenseNumber.trim()) {
      errorMessage.value = 'يرجى إدخال رقم الترخيص أو الاعتماد المهني للمهندس'
      return
    }
    if (!form.cvFile) {
      errorMessage.value = 'يرجى إرفاق شهادة الاعتماد المهني أو وثيقة السيرة الذاتية (PDF أو صورة)'
      return
    }
  }

  if (selectedRole.value === 'supplier') {
    if (!form.companyName.trim()) {
      errorMessage.value = 'يرجى إدخال اسم المتجر أو الشركة'
      return
    }
    if (!form.commercialRegistry.trim()) {
      errorMessage.value = 'يرجى إدخال رقم السجل التجاري'
      return
    }
    if (!form.commercialRegisterFile) {
      errorMessage.value = 'يرجى رفع صورة أو ملف السجل التجاري بصيغة PDF أو صورة واضحة'
      return
    }
  }

  // Format coordinates into WKT POINT(lng lat) for PostgreSQL PostGIS geography column
  let formattedCoordinates: string | undefined
  if (form.locationCoordinates && form.locationCoordinates.lat && form.locationCoordinates.lng) {
    formattedCoordinates = `POINT(${form.locationCoordinates.lng.toFixed(6)} ${form.locationCoordinates.lat.toFixed(6)})`
  } else {
    const defaultCoords = getGovernorateCoords(form.governorate)
    if (defaultCoords) {
      formattedCoordinates = `POINT(${defaultCoords.lng.toFixed(6)} ${defaultCoords.lat.toFixed(6)})`
    }
  }

  const selectedGovId = getGovernorateIdByName(form.governorate)

  const result = await authStore.register({
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    password: form.password,
    password_confirmation: form.confirmPassword,
    role: selectedRole.value,
    governorate: form.governorate,
    governorate_id: selectedGovId || undefined,
    city: form.governorate,
    default_coordinates: formattedCoordinates,
    location_coordinates: formattedCoordinates,
    company_name: form.companyName.trim() || undefined,
    license_number: form.licenseNumber.trim() || undefined,
    commercial_registry: form.commercialRegistry.trim() || undefined,
    store_type: selectedRole.value === 'supplier' ? form.storeType : undefined,
    addressDetails: `${form.governorate} - ${form.locationText}`,
    cvFile: form.cvFile,
    commercialRegisterFile: form.commercialRegisterFile,
  } as any)

  if (result.success) {
    // Navigate to email OTP verification
    router.push({
      path: '/auth/verify-email',
      query: { email: form.email, role: selectedRole.value },
    })
  } else {
    if (result.errors && Object.keys(result.errors).length > 0) {
      const firstKey = Object.keys(result.errors)[0]
      const firstMsg = result.errors[firstKey]?.[0]
      errorMessage.value = firstMsg || result.error || 'تعذر إتمام التسجيل، يرجى التحقق من صحة البيانات'
    } else {
      errorMessage.value = result.error || 'تعذر إتمام التسجيل، يرجى المحاولة لاحقاً'
    }
  }
}
</script>

<template>
  <div class="w-full max-w-[520px]">
    <!-- بطاقة إنشاء حساب المتوافقة بالكامل مع الوضعين الداكن والنهاري -->
    <div class="rounded-3xl border border-solar-border-card bg-solar-bg-card p-7 sm:p-10 shadow-xl text-right transition-colors duration-200">
      <!-- الشعار والعناوين التفاعلية حسب نوع الحساب -->
      <AuthHeader
        title="إنشاء حساب جديد"
        :subtitle="subtitleText"
      />

      <!-- شريط تبديل نوع الحساب (عميل - مورد - مهندس) -->
      <AuthRoleTabs v-model="selectedRole" />

      <!-- تنبيه الأخطاء -->
      <div
        v-if="errorMessage"
        class="mb-6 flex items-start gap-2.5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/90 dark:bg-rose-950/40 p-3.5 text-xs font-semibold text-rose-700 dark:text-rose-300 leading-relaxed animate-in fade-in duration-200"
      >
        <AlertCircle class="size-4.5 shrink-0 text-rose-500 mt-0.5" />
        <span class="flex-1">{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4.5">
        <!-- الاسم الكامل -->
        <div class="flex flex-col gap-1.5">
          <label for="name" class="text-xs font-bold text-solar-text-heading flex items-center gap-1">
            <span>الاسم الكامل</span>
            <span class="text-rose-500">*</span>
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="مثال: عبدالله محمد"
            class="h-12 w-full rounded-xl border border-solar-border-card bg-solar-bg-card dark:bg-solar-bg-subtle/50 px-3.5 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all"
          />
        </div>

        <!-- البريد الإلكتروني -->
        <div class="flex flex-col gap-1.5">
          <label for="email" class="text-xs font-bold text-solar-text-heading flex items-center gap-1">
            <span>البريد الإلكتروني</span>
            <span class="text-rose-500">*</span>
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="name@example.com"
            dir="ltr"
            class="h-12 w-full rounded-xl border border-solar-border-card bg-solar-bg-card dark:bg-solar-bg-subtle/50 px-3.5 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all text-left"
          />
        </div>

        <!-- رقم الجوال -->
        <div class="flex flex-col gap-1.5">
          <label for="phone" class="text-xs font-bold text-solar-text-heading flex items-center gap-1">
            <span>رقم الجوال</span>
            <span class="text-rose-500">*</span>
          </label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            placeholder="77xxxxxxx أو 71xxxxxxx"
            dir="ltr"
            class="h-12 w-full rounded-xl border border-solar-border-card bg-solar-bg-card dark:bg-solar-bg-subtle/50 px-3.5 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all text-left"
          />
        </div>

        <!-- كلمة المرور -->
        <div class="flex flex-col gap-1.5">
          <label for="password" class="text-xs font-bold text-solar-text-heading flex items-center gap-1">
            <span>{{ selectedRole === 'supplier' ? 'كلمة السر' : 'كلمة المرور' }}</span>
            <span class="text-rose-500">*</span>
          </label>
          <div class="relative flex items-center">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="أدخل كلمة المرور (8 خانات على الأقل)"
              class="h-12 w-full rounded-xl border border-solar-border-card bg-solar-bg-card dark:bg-solar-bg-subtle/50 px-3.5 pl-11 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute left-3.5 top-1/2 -translate-y-1/2 text-solar-text-muted hover:text-solar-navy dark:hover:text-solar-yellow transition-colors cursor-pointer"
            >
              <EyeOff v-if="showPassword" class="size-4.5" />
              <Eye v-else class="size-4.5" />
            </button>
          </div>
        </div>

        <!-- تأكيد كلمة المرور -->
        <div class="flex flex-col gap-1.5">
          <label for="confirm-password" class="text-xs font-bold text-solar-text-heading flex items-center gap-1">
            <span>{{ selectedRole === 'supplier' ? 'تأكيد كلمة السر' : 'تأكيد كلمة المرور' }}</span>
            <span class="text-rose-500">*</span>
          </label>
          <div class="relative flex items-center">
            <input
              id="confirm-password"
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="أعد إدخال كلمة المرور"
              class="h-12 w-full rounded-xl border border-solar-border-card bg-solar-bg-card dark:bg-solar-bg-subtle/50 px-3.5 pl-11 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute left-3.5 top-1/2 -translate-y-1/2 text-solar-text-muted hover:text-solar-navy dark:hover:text-solar-yellow transition-colors cursor-pointer"
            >
              <EyeOff v-if="showConfirmPassword" class="size-4.5" />
              <Eye v-else class="size-4.5" />
            </button>
          </div>
        </div>

        <!-- المحافظة / المنطقة -->
        <div class="flex flex-col gap-1.5">
          <label for="governorate" class="text-xs font-bold text-solar-text-heading flex items-center gap-1">
            <span>المحافظة / المنطقة</span>
            <span class="text-rose-500">*</span>
          </label>
          <div class="relative flex items-center">
            <select
              id="governorate"
              v-model="form.governorate"
              class="h-12 w-full appearance-none rounded-xl border border-solar-border-card bg-solar-bg-card dark:bg-solar-bg-subtle/50 px-3.5 pl-10 text-xs font-medium text-solar-text-heading focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all cursor-pointer"
            >
              <option value="" disabled selected>اختر المحافظة / المنطقة</option>
              <option v-for="gov in governorates" :key="gov" :value="gov">
                {{ gov }}
              </option>
            </select>
            <ChevronDown class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-solar-text-muted" />
          </div>
        </div>

        <!-- الموقع الجغرافي على الخريطة ومحدد الـ GPS -->
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-solar-text-heading flex items-center gap-1">
              <span>الموقع الجغرافي</span>
              <span class="text-rose-500">*</span>
            </label>
            <span v-if="form.locationCoordinates" class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200/60 dark:border-emerald-800/40">
              <Check class="size-3 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
              <span>محدد ومفعل</span>
            </span>
          </div>

          <!-- صف إدخال الموقع مع أزرار الخريطة والـ GPS المباشرة -->
          <div class="flex items-stretch gap-2">
            <div class="relative flex-1">
              <input
                v-model="form.locationText"
                type="text"
                placeholder="انقر على الخريطة أو اكتب عنوانك بالتفصيل"
                class="h-12 w-full rounded-xl border border-solar-border-card bg-solar-bg-card dark:bg-solar-bg-subtle/50 px-3.5 pr-3.5 pl-9 text-xs font-semibold text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all text-right"
              />
              <MapPin class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-solar-yellow pointer-events-none" />
            </div>

            <!-- زر فتح نافذة الخريطة التفاعلية -->
            <button
              type="button"
              @click="isMapModalOpen = true"
              class="flex items-center justify-center gap-1.5 h-12 px-3 sm:px-4 rounded-xl bg-solar-navy-dark dark:bg-solar-yellow text-white dark:text-solar-navy-dark text-xs font-black hover:opacity-90 active:scale-[0.98] transition-all shrink-0 cursor-pointer shadow-xs"
              title="فتح الخريطة التفاعلية والبحث بالمنطقة"
            >
              <MapIcon class="size-4" />
              <span>الخريطة</span>
            </button>

            <!-- زر التقاط الموقع من الجهاز عبر الـ GPS -->
            <button
              type="button"
              @click="quickLocateUser"
              :disabled="isQuickLocating"
              class="flex items-center justify-center gap-1.5 h-12 px-2.5 sm:px-3 rounded-xl border border-solar-border-card bg-solar-bg-subtle text-xs font-bold text-solar-text-heading hover:border-solar-yellow hover:text-solar-yellow active:scale-[0.98] transition-all shrink-0 cursor-pointer disabled:opacity-50 shadow-xs"
              title="تحديد موقعي الآن عبر الـ GPS في جهازي"
            >
              <Loader2 v-if="isQuickLocating" class="size-4 animate-spin text-solar-yellow" />
              <Crosshair v-else class="size-4 text-solar-navy dark:text-solar-yellow" />
              <span class="hidden sm:inline">{{ isQuickLocating ? 'جاري...' : 'موقعي' }}</span>
            </button>
          </div>

          <!-- تفاصيل الإحداثيات المسجلة -->
          <div v-if="form.locationCoordinates" class="flex items-center justify-between text-[11px] text-solar-text-muted px-1">
            <span class="font-medium">الإحداثيات الحالية:</span>
            <span class="font-mono text-solar-text-heading font-bold dir-ltr">
              {{ form.locationCoordinates.lat.toFixed(4) }}, {{ form.locationCoordinates.lng.toFixed(4) }}
            </span>
          </div>
        </div>

        <!-- حقول إضافية للمهندس: رقم الترخيص والسيرة الذاتية -->
        <div v-if="selectedRole === 'engineer'" class="flex flex-col gap-4.5 animate-in fade-in duration-200">
          <div class="flex flex-col gap-1.5">
            <label for="licenseNumber" class="text-xs font-bold text-solar-text-heading flex items-center gap-1">
              <span>رقم الترخيص / الاعتماد المهني</span>
              <span class="text-rose-500">*</span>
            </label>
            <input
              id="licenseNumber"
              v-model="form.licenseNumber"
              type="text"
              placeholder="مثال: رقم القيد أو رخصة مزاولة المهنة"
              class="h-12 w-full rounded-xl border border-solar-border-card bg-solar-bg-card dark:bg-solar-bg-subtle/50 px-3.5 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all"
            />
          </div>

          <AuthFileUploadInput
            v-model="form.cvFile"
            label="شهادة الاعتماد المهني أو السيرة الذاتية"
            placeholder="اضغط لاختيار ملف الشهادة أو السيرة الذاتية (PDF أو صورة)"
            accept=".pdf,application/pdf,image/*,.png,.jpg,.jpeg,.doc,.docx"
            :max-size-mb="5"
            hint="الملفات المقبولة: وثائق PDF الرسمية أو صور الشهادات والاعتمادات (JPG, PNG) حتى 5MB"
            required
          />
        </div>

        <!-- حقول إضافية للمورد: اسم المتجر والسجل التجاري ونوع النشاط -->
        <div v-if="selectedRole === 'supplier'" class="flex flex-col gap-4.5 animate-in fade-in duration-200">
          <div class="flex flex-col gap-1.5">
            <label for="companyName" class="text-xs font-bold text-solar-text-heading flex items-center gap-1">
              <span>اسم المتجر / الشركة</span>
              <span class="text-rose-500">*</span>
            </label>
            <input
              id="companyName"
              v-model="form.companyName"
              type="text"
              placeholder="مثال: متجر الطاقة المتجددة المتقدمة"
              class="h-12 w-full rounded-xl border border-solar-border-card bg-solar-bg-card dark:bg-solar-bg-subtle/50 px-3.5 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="commercialRegistry" class="text-xs font-bold text-solar-text-heading flex items-center gap-1">
              <span>رقم السجل التجاري</span>
              <span class="text-rose-500">*</span>
            </label>
            <input
              id="commercialRegistry"
              v-model="form.commercialRegistry"
              type="text"
              placeholder="مثال: 1010789234"
              class="h-12 w-full rounded-xl border border-solar-border-card bg-solar-bg-card dark:bg-solar-bg-subtle/50 px-3.5 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="storeType" class="text-xs font-bold text-solar-text-heading flex items-center gap-1">
              <span>نوع النشاط التجاري</span>
              <span class="text-rose-500">*</span>
            </label>
            <div class="relative flex items-center">
              <select
                id="storeType"
                v-model="form.storeType"
                class="h-12 w-full appearance-none rounded-xl border border-solar-border-card bg-solar-bg-card dark:bg-solar-bg-subtle/50 px-3.5 pl-10 text-xs font-medium text-solar-text-heading focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all cursor-pointer"
              >
                <option value="authorized_agent">وكيل رسمي / معتمد</option>
                <option value="wholesaler">موزع معتمد / تاجر جملة</option>
                <option value="retailer">متجر تجزئة / حلول شمسية</option>
              </select>
              <ChevronDown class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-solar-text-muted" />
            </div>
          </div>

          <AuthFileUploadInput
            v-model="form.commercialRegisterFile"
            label="وثيقة السجل التجاري أو رخصة المتجر"
            placeholder="اضغط لاختيار ملف السجل التجاري (PDF أو صورة)"
            accept=".pdf,application/pdf,image/*,.png,.jpg,.jpeg"
            :max-size-mb="5"
            hint="الملفات المقبولة: وثيقة السجل التجاري بصيغة PDF أو صورة واضحة (JPG, PNG) حتى 5MB"
            required
          />
        </div>

        <!-- زر إنشاء الحساب المتجاوب بلون بارز في كلا الوضعين -->
        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-solar-navy-dark dark:bg-solar-yellow text-white dark:text-solar-navy-dark text-xs sm:text-sm font-black shadow-md hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          <span v-if="authStore.isLoading" class="size-4 border-2 border-white/30 dark:border-solar-navy/30 border-t-white dark:border-t-solar-navy rounded-full animate-spin" />
          <span>{{ authStore.isLoading ? 'جاري إنشاء الحساب...' : submitButtonText }}</span>
          <ArrowLeft v-if="!authStore.isLoading" class="size-4" />
        </button>
      </form>

      <!-- صندوق الانتقال لتسجيل الدخول -->
      <div class="mt-6 rounded-2xl bg-solar-bg-subtle border border-solar-border-card p-3.5 text-center text-xs text-solar-text-body font-medium transition-colors">
        <span>لديك حساب بالفعل في سولار هب؟ </span>
        <NuxtLink
          to="/auth/login"
          class="font-black text-solar-navy dark:text-solar-yellow hover:underline transition-colors"
        >
          تسجيل الدخول
        </NuxtLink>
      </div>
    </div>

    <!-- نافذة اختيار وتأكيد الموقع الجغرافي التفاعلية -->
    <MapLocationModal
      :is-open="isMapModalOpen"
      :current-location="form.locationText"
      :initial-coordinates="form.locationCoordinates || getGovernorateCoords(form.governorate || 'صنعاء')"
      title="تحديد الموقع الجغرافي للمشروع أو المتجر"
      subtitle="اختر موقعك بدقة على الخريطة لتسهيل التوصيل وتحديد النطاق الجغرافي"
      @close="isMapModalOpen = false"
      @select="handleLocationSelected"
    />
  </div>
</template>
