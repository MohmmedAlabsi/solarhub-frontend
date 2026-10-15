<script setup lang="ts">
import { Eye, EyeOff, ArrowLeft, MapPin, Map, AlertCircle, ChevronDown } from 'lucide-vue-next'
import type { UserRole } from '~~/types/auth'
import { useAuthStore } from '~~/app/stores/auth.store'

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

function handleLocationSelected(loc: { address: string; lat: number; lng: number }) {
  form.locationText = loc.address
  form.locationCoordinates = { lat: loc.lat, lng: loc.lng }
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
  if (!form.password || form.password.length < 6) {
    errorMessage.value = 'كلمة المرور يجب أن تتكون من 6 خانات على الأقل'
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
    errorMessage.value = 'يرجى تحديد الموقع الجغرافي على الخريطة'
    return
  }

  // Engineer specific
  if (selectedRole.value === 'engineer' && !form.cvFile) {
    errorMessage.value = 'يرجى إرفاق السيرة الذاتية (ملف PDF)'
    return
  }

  // Supplier specific
  if (selectedRole.value === 'supplier') {
    if (!form.companyName.trim()) {
      errorMessage.value = 'يرجى إدخال اسم المتجر / الشركة'
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

        <!-- الموقع الجغرافي على الخريطة -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-solar-text-heading flex items-center gap-1">
            <span>الموقع الجغرافي</span>
            <span class="text-rose-500">*</span>
          </label>
          <button
            type="button"
            @click="isMapModalOpen = true"
            class="group flex h-12 w-full items-center justify-between rounded-xl border border-solar-border-card/80 bg-white px-3.5 transition-all hover:border-solar-navy/60 focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 text-right cursor-pointer"
          >
            <div class="flex items-center gap-2 overflow-hidden flex-1">
              <span v-if="form.locationText" class="text-xs font-bold text-solar-navy-dark truncate">
                {{ form.locationText }}
              </span>
              <span v-else class="text-xs text-solar-text-muted">
                تحديد الموقع على الخريطة
              </span>
            </div>
            <div class="flex items-center gap-1.5 text-amber-500 shrink-0">
              <MapPin class="size-4.5" />
            </div>
          </button>
        </div>

        <!-- حقول إضافية للمهندس: السيرة الذاتية -->
        <div v-if="selectedRole === 'engineer'" class="animate-in fade-in duration-200">
          <FileUploadInput
            v-model="form.cvFile"
            label="السيرة الذاتية (CV / ملف PDF)"
            placeholder="إرفاق السيرة الذاتية (PDF, الحد الأقصى 5MB)"
            accept=".pdf"
            :max-size-mb="5"
            required
          />
        </div>

        <!-- حقول إضافية للمورد: اسم المتجر والسجل التجاري -->
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

    <!-- نافذة اختيار الموقع الجغرافي -->
    <MapLocationModal
      :is-open="isMapModalOpen"
      :current-location="form.locationText"
      @close="isMapModalOpen = false"
      @select="handleLocationSelected"
    />
  </div>
</template>
