<script setup lang="ts">
import { Eye, EyeOff, ArrowLeft, MapPin, Map as MapIcon, AlertCircle, ChevronDown, Crosshair, Loader2, Check } from 'lucide-vue-next'
import type { UserRole } from '~~/types/auth'
import { useAuthStore } from '~/stores/auth'
import MapLocationModal from '~/components/common/MapLocationModal.vue'

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

const governorates = [
  'الرياض',
  'مكة المكرمة (جدة / الطائف)',
  'المدينة المنورة',
  'المنطقة الشرقية (الدمام / الخبر)',
  'القصيم (بريدة / عنيزة)',
  'عسير (أبها / خميس مشيط)',
  'تبوك',
  'جازان',
  'نجران',
  'حائل',
  'صنعاء',
  'عدن',
  'حضرموت (المكلا / سيئون)',
  'تعز',
  'الحديدة',
]

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

const defaultGovernorateCoords: Record<string, { lat: number; lng: number }> = {
  'صنعاء': { lat: 15.3694, lng: 44.1910 },
  'عدن': { lat: 12.7855, lng: 45.0187 },
  'تعز': { lat: 13.5776, lng: 44.0185 },
  'الحديدة': { lat: 14.7978, lng: 42.9545 },
  'حضرموت (المكلا / سيئون)': { lat: 14.5425, lng: 49.1242 },
  'الرياض': { lat: 24.7136, lng: 46.6753 },
  'مكة المكرمة (جدة / الطائف)': { lat: 21.3891, lng: 39.8579 },
  'المدينة المنورة': { lat: 24.5247, lng: 39.5692 },
  'المنطقة الشرقية (الدمام / الخبر)': { lat: 26.4207, lng: 50.0888 },
  'القصيم (بريدة / عنيزة)': { lat: 26.3260, lng: 43.9750 },
  'عسير (أبها / خميس مشيط)': { lat: 18.2164, lng: 42.5053 },
  'تبوك': { lat: 28.3835, lng: 36.5662 },
  'جازان': { lat: 16.8892, lng: 42.5706 },
  'نجران': { lat: 17.4924, lng: 44.1277 },
  'حائل': { lat: 27.5114, lng: 41.7208 },
}

watch(() => form.governorate, (newGov) => {
  if (newGov) {
    if (!form.locationText || form.locationText.includes('مركز المحافظة') || form.locationText.includes('مركز المدينة') || form.locationText === '') {
      form.locationText = `${newGov} - مركز المحافظة`
    }
    if (defaultGovernorateCoords[newGov]) {
      form.locationCoordinates = defaultGovernorateCoords[newGov]
    }
    if (errorMessage.value.includes('الموقع الجغرافي') || errorMessage.value.includes('المحافظة')) {
      errorMessage.value = ''
    }
  }
})

const isQuickLocating = ref(false)

function findNearestGovFromCoords(lat: number, lng: number): string {
  let nearestGov = form.governorate || 'صنعاء'
  let minDistance = Infinity
  for (const [gov, coords] of Object.entries(defaultGovernorateCoords)) {
    const dist = Math.hypot(coords.lat - lat, coords.lng - lng)
    if (dist < minDistance) {
      minDistance = dist
      nearestGov = gov
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
        if (defaultGovernorateCoords[targetGov]) {
          form.locationCoordinates = defaultGovernorateCoords[targetGov]
          form.locationText = `${targetGov} - مركز المحافظة`
        }
        isQuickLocating.value = false
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
    )
  } else {
    const targetGov = form.governorate || 'صنعاء'
    form.governorate = targetGov
    if (defaultGovernorateCoords[targetGov]) {
      form.locationCoordinates = defaultGovernorateCoords[targetGov]
      form.locationText = `${targetGov} - مركز المحافظة`
    }
    isQuickLocating.value = false
  }
}

function handleLocationSelected(loc: { address: string; lat: number; lng: number; governorate?: string }) {
  form.locationText = loc.address
  form.locationCoordinates = { lat: loc.lat, lng: loc.lng }
  if (loc.governorate) {
    const match = governorates.find(g => g.includes(loc.governorate!) || loc.governorate!.includes(g))
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
  if (!form.email.trim() || !form.email.includes('@')) {
    errorMessage.value = 'يرجى إدخال بريد إلكتروني صحيح'
    return
  }
  if (!form.phone.trim()) {
    errorMessage.value = 'يرجى إدخال رقم الجوال'
    return
  }
  const phoneRegex = /^\+?[0-9]{7,20}$/
  if (!phoneRegex.test(form.phone.trim())) {
    errorMessage.value = 'يرجى إدخال رقم جوال صحيح (بين 7 و 20 رقماً)'
    return
  }

  // Password rules matching Laravel backend: min 8, letters, mixedCase, numbers
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  if (!passwordRegex.test(form.password)) {
    errorMessage.value = 'كلمة المرور يجب أن تتكون من 8 خانات على الأقل، وتحتوي على حرف كبير وحرف صغير ورقم (مثال: SolarHub2026)'
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
  if (!form.locationText) {
    form.locationText = `${form.governorate} - مركز المدينة`
    if (defaultGovernorateCoords[form.governorate]) {
      form.locationCoordinates = defaultGovernorateCoords[form.governorate]
    }
  }

  // Engineer specific
  if (selectedRole.value === 'engineer') {
    if (!form.licenseNumber.trim()) {
      errorMessage.value = 'يرجى إدخال رقم الترخيص المهني أو رقم الاعتماد'
      return
    }
    if (!form.cvFile) {
      errorMessage.value = 'يرجى إرفاق السيرة الذاتية (ملف PDF)'
      return
    }
  }

  // Supplier specific
  if (selectedRole.value === 'supplier') {
    if (!form.companyName.trim()) {
      errorMessage.value = 'يرجى إدخال اسم المتجر / الشركة'
      return
    }
    if (!form.commercialRegistry.trim()) {
      errorMessage.value = 'يرجى إدخال رقم السجل التجاري'
      return
    }
    if (!form.commercialRegisterFile) {
      errorMessage.value = 'يرجى إرفاق السجل التجاري (ملف PDF أو صورة)'
      return
    }
  }

  const result = await authStore.register({
    role: selectedRole.value,
    name: form.name,
    email: form.email,
    phone: form.phone,
    password: form.password,
    password_confirmation: form.confirmPassword,
    governorate: form.governorate,
    location: form.locationCoordinates
      ? { ...form.locationCoordinates, address: form.locationText }
      : undefined,
    companyName: form.companyName,
    licenseNumber: form.licenseNumber,
    commercialRegistry: form.commercialRegistry,
    storeType: form.storeType,
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
    errorMessage.value = result.error || 'تعذر إتمام التسجيل، يرجى المحاولة لاحقاً'
  }
}
</script>

<template>
  <div class="w-full max-w-[520px]">
    <!-- بطاقة إنشاء حساب المطابقة تماماً لتصاميم العميل والمهندس والمورد -->
    <div class="rounded-3xl border border-solar-border-card/70 bg-white p-7 sm:p-10 shadow-xl text-right">
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
        class="mb-6 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs font-semibold text-rose-700 leading-relaxed animate-in fade-in duration-200"
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
            class="h-12 w-full rounded-xl border border-solar-border-card/80 bg-white px-3.5 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted/70 focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all"
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
            class="h-12 w-full rounded-xl border border-solar-border-card/80 bg-white px-3.5 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted/70 focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all text-left"
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
            placeholder="05xxxxxxxx"
            dir="ltr"
            class="h-12 w-full rounded-xl border border-solar-border-card/80 bg-white px-3.5 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted/70 focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all text-left"
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
              placeholder="أدخل كلمة المرور"
              class="h-12 w-full rounded-xl border border-solar-border-card/80 bg-white px-3.5 pl-11 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted/70 focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute left-3.5 top-1/2 -translate-y-1/2 text-solar-text-muted hover:text-solar-navy transition-colors"
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
              class="h-12 w-full rounded-xl border border-solar-border-card/80 bg-white px-3.5 pl-11 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted/70 focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute left-3.5 top-1/2 -translate-y-1/2 text-solar-text-muted hover:text-solar-navy transition-colors"
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
              class="h-12 w-full appearance-none rounded-xl border border-solar-border-card/80 bg-white px-3.5 pl-10 text-xs font-medium text-solar-text-heading focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all cursor-pointer"
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
            <span v-if="form.locationCoordinates" class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200/60">
              <Check class="size-3 text-emerald-600 stroke-[3]" />
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
                class="h-12 w-full rounded-xl border border-solar-border-card/80 bg-white px-3.5 pr-3.5 pl-9 text-xs font-semibold text-solar-text-heading placeholder:text-solar-text-muted/70 focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all text-right"
              />
              <MapPin class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-solar-yellow pointer-events-none" />
            </div>

            <!-- زر فتح نافذة الخريطة التفاعلية -->
            <button
              type="button"
              @click="isMapModalOpen = true"
              class="flex items-center justify-center gap-1.5 h-12 px-3 sm:px-4 rounded-xl bg-[#1b2d42] text-white text-xs font-bold hover:bg-solar-navy-dark active:scale-[0.98] transition-all shrink-0 cursor-pointer shadow-xs"
              title="فتح الخريطة التفاعلية والبحث بالمنطقة"
            >
              <MapIcon class="size-4 text-solar-yellow" />
              <span>الخريطة</span>
            </button>

            <!-- زر التقاط الموقع من الجهاز عبر الـ GPS -->
            <button
              type="button"
              @click="quickLocateUser"
              :disabled="isQuickLocating"
              class="flex items-center justify-center gap-1.5 h-12 px-2.5 sm:px-3 rounded-xl border border-solar-border-card/80 bg-slate-50 text-xs font-bold text-solar-navy-dark hover:bg-slate-100 hover:border-solar-navy active:scale-[0.98] transition-all shrink-0 cursor-pointer disabled:opacity-50 shadow-xs"
              title="تحديد موقعي الآن عبر الـ GPS في جهازي"
            >
              <Loader2 v-if="isQuickLocating" class="size-4 animate-spin text-solar-yellow" />
              <Crosshair v-else class="size-4 text-solar-navy-dark" />
              <span class="hidden sm:inline">{{ isQuickLocating ? 'جاري...' : 'موقعي' }}</span>
            </button>
          </div>

          <!-- تفاصيل الإحداثيات المسجلة -->
          <div v-if="form.locationCoordinates" class="flex items-center justify-between text-[11px] text-solar-text-muted px-1">
            <span class="text-slate-500 font-medium">الإحداثيات الحالية:</span>
            <span class="font-mono text-solar-navy-dark font-bold dir-ltr">
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
              placeholder="مثال: SCE-849201 أو رقم القيد الهندسي"
              class="h-12 w-full rounded-xl border border-solar-border-card/80 bg-white px-3.5 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted/70 focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all"
            />
          </div>

          <FileUploadInput
            v-model="form.cvFile"
            label="السيرة الذاتية (CV / ملف PDF)"
            placeholder="إرفاق السيرة الذاتية (PDF, الحد الأقصى 5MB)"
            accept=".pdf"
            :max-size-mb="5"
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
              class="h-12 w-full rounded-xl border border-solar-border-card/80 bg-white px-3.5 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted/70 focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all"
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
              class="h-12 w-full rounded-xl border border-solar-border-card/80 bg-white px-3.5 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted/70 focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all"
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
                class="h-12 w-full appearance-none rounded-xl border border-solar-border-card/80 bg-white px-3.5 pl-10 text-xs font-medium text-solar-text-heading focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all cursor-pointer"
              >
                <option value="authorized_agent">وكيل رسمي / معتمد</option>
                <option value="wholesaler">موزع معتمد / تاجر جملة</option>
                <option value="retailer">متجر تجزئة / حلول شمسية</option>
              </select>
              <ChevronDown class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-solar-text-muted" />
            </div>
          </div>

          <FileUploadInput
            v-model="form.commercialRegisterFile"
            label="السجل التجاري (ملف PDF أو صورة)"
            placeholder="إرفاق السجل التجاري (PDF أو صورة، الحد الأقصى 10MB)"
            accept=".pdf,.png,.jpg,.jpeg"
            :max-size-mb="10"
            required
          />
        </div>

        <!-- زر إنشاء الحساب الداكن -->
        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1b2d42] text-xs sm:text-sm font-bold text-white shadow-md hover:bg-solar-navy-dark active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          <span v-if="authStore.isLoading" class="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>{{ authStore.isLoading ? 'جاري إنشاء الحساب...' : submitButtonText }}</span>
          <ArrowLeft v-if="!authStore.isLoading" class="size-4" />
        </button>
      </form>

      <!-- صندوق الانتقال لتسجيل الدخول المطابق للتصميم تماماً -->
      <div class="mt-6 rounded-2xl bg-[#F6F8FB] p-3.5 text-center text-xs text-solar-text-body font-medium">
        <span>لديك حساب بالفعل في سولار هب؟ </span>
        <NuxtLink
          to="/auth/login"
          class="font-black text-solar-navy-dark hover:text-solar-yellow transition-colors"
        >
          تسجيل الدخول
        </NuxtLink>
      </div>
    </div>

    <!-- نافذة اختيار وتأكيد الموقع الجغرافي التفاعلية -->
    <MapLocationModal
      :is-open="isMapModalOpen"
      :current-location="form.locationText"
      :initial-coordinates="form.locationCoordinates || (form.governorate ? defaultGovernorateCoords[form.governorate] : undefined) || defaultGovernorateCoords['صنعاء']"
      title="تحديد الموقع الجغرافي للمشروع أو المتجر"
      subtitle="اختر موقعك بدقة على الخريطة لتسهيل التوصيل وتحديد النطاق الجغرافي"
      @close="isMapModalOpen = false"
      @select="handleLocationSelected"
    />
  </div>
</template>
