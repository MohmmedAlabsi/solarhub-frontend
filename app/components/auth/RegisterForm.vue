<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Map,
  ChevronDown,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle
} from 'lucide-vue-next'
import BaseInput from '~/components/ui/BaseInput.vue'
import BaseButton from '~/components/ui/BaseButton.vue'

type AccountType = 'client' | 'supplier' | 'engineer'

const accountType = ref<AccountType>('client')

const accountTypes = [
  { id: 'client' as const, label: 'عميل' },
  { id: 'supplier' as const, label: 'مورد' },
  { id: 'engineer' as const, label: 'مهندس' },
]

// Available governorates in Yemen
const governorates = [
  'صنعاء',
  'عدن',
  'تعز',
  'حضرموت',
  'الحديدة',
  'إب',
  'ذمار',
  'مأرب',
  'شبوة',
  'المهرة',
  'لحج',
  'أبين',
  'عمران',
  'صعدة',
  'حجة',
  'البيضاء',
  'ريمة',
  'المحويت',
  'الضالع',
  'سقطرى',
]

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  governorate: '',
  location: '',
  // Supplier specific
  storeName: '',
  commercialRegisterFile: null as File | null,
  commercialRegisterName: '',
  // Engineer specific
  cvFile: null as File | null,
  cvFileName: '',
})

const errors = reactive({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  governorate: '',
  location: '',
  storeName: '',
  commercialRegisterFile: '',
  cvFile: '',
  general: '',
})

const isLoading = ref(false)
const isLocating = ref(false)
const commercialInputRef = ref<HTMLInputElement | null>(null)
const cvInputRef = ref<HTMLInputElement | null>(null)

// Computed button label matching exact screenshots
const submitButtonLabel = computed(() => {
  switch (accountType.value) {
    case 'engineer':
      return 'إنشاء التسجيل'
    case 'supplier':
      return 'إنشاء حساب'
    case 'client':
    default:
      return 'إنشاء الحساب'
  }
})

// Subtitle text nuance in screenshots
const subtitleText = computed(() => {
  if (accountType.value === 'supplier') {
    return 'اختر نوع الحساب وأدخل بياناتك للانضمام إلى منصة سولار هب'
  }
  return 'اختر نوع الحساب وأدخل بياناتك للبدء مع منصة سولار هب'
})

// Location picker action
const handlePickLocation = () => {
  isLocating.value = true
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.location = `تم تحديد الإحداثيات (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`
        errors.location = ''
        isLocating.value = false
      },
      () => {
        // Fallback default Yemeni location
        form.location = form.governorate ? `${form.governorate} - الموقع الجغرافي المحدد` : 'اليمن - الموقع الحالي'
        errors.location = ''
        isLocating.value = false
      },
      { timeout: 5000 }
    )
  } else {
    form.location = 'تم تحديد الموقع'
    errors.location = ''
    isLocating.value = false
  }
}

// File handlers
const handleCommercialFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    form.commercialRegisterFile = target.files[0]
    form.commercialRegisterName = target.files[0].name
    errors.commercialRegisterFile = ''
  }
}

const handleCvFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    form.cvFile = target.files[0]
    form.cvFileName = target.files[0].name
    errors.cvFile = ''
  }
}

// Validation logic
const validateForm = () => {
  let valid = true
  Object.keys(errors).forEach((key) => {
    (errors as any)[key] = ''
  })

  if (!form.fullName.trim()) {
    errors.fullName = 'يرجى إدخال الاسم الكامل'
    valid = false
  }

  if (!form.email.trim()) {
    errors.email = 'يرجى إدخال البريد الإلكتروني'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'البريد الإلكتروني غير صالح'
    valid = false
  }

  if (!form.phone.trim()) {
    errors.phone = 'يرجى إدخال رقم الجوال'
    valid = false
  }

  if (!form.password) {
    errors.password = 'يرجى إدخال كلمة المرور'
    valid = false
  } else if (form.password.length < 6) {
    errors.password = 'يجب ألا تقل كلمة المرور عن 6 أحرف'
    valid = false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'يرجى تأكيد كلمة المرور'
    valid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'كلمتا المرور غير متطابقتين'
    valid = false
  }

  if (!form.governorate) {
    errors.governorate = 'يرجى اختيار المحافظة / المنطقة'
    valid = false
  }

  if (accountType.value === 'supplier') {
    if (!form.storeName.trim()) {
      errors.storeName = 'يرجى إدخال اسم المتجر أو الشركة'
      valid = false
    }
    if (!form.commercialRegisterFile && !form.commercialRegisterName) {
      errors.commercialRegisterFile = 'يرجى إرفاق السجل التجاري'
      valid = false
    }
  }

  if (accountType.value === 'engineer') {
    if (!form.cvFile && !form.cvFileName) {
      errors.cvFile = 'يرجى إرفاق السيرة الذاتية'
      valid = false
    }
  }

  return valid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true
  try {
    // Simulated registration delay
    await new Promise((resolve) => setTimeout(resolve, 800))
    // Move to verify email page upon registration
    await navigateTo({
      path: '/auth/verify-email',
      query: { email: form.email },
    })
  } catch (err: any) {
    errors.general = 'حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة لاحقاً'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="w-full text-center" dir="rtl">
    <!-- Header Titles -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">
        إنشاء حساب جديد
      </h1>
      <p class="mt-2 text-sm text-slate-500">
        {{ subtitleText }}
      </p>
    </div>

    <!-- Account Type Tabs -->
    <div class="mb-6 text-right">
      <label v-if="accountType === 'supplier'" class="block mb-2 text-sm font-medium text-slate-800">
        نوع الحساب <span class="text-rose-500">*</span>
      </label>
      <div class="grid grid-cols-3 gap-1 rounded-2xl bg-[#EEF2F6] p-1.5 shadow-inner">
        <button
          v-for="item in accountTypes"
          :key="item.id"
          type="button"
          :class="[
            'py-2 px-3 text-sm font-semibold rounded-xl transition-all duration-200 select-none text-center',
            accountType === item.id
              ? 'bg-[#24374e] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          ]"
          @click="accountType = item.id"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <!-- General Error Banner -->
    <div
      v-if="errors.general"
      class="mb-5 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-right text-xs font-medium text-rose-700"
    >
      <AlertCircle class="size-4 shrink-0 text-rose-500" />
      <span>{{ errors.general }}</span>
    </div>

    <!-- Registration Form -->
    <form class="space-y-4 text-right" @submit.prevent="handleSubmit">
      <!-- Full Name -->
      <BaseInput
        v-model="form.fullName"
        name="fullName"
        label="الاسم الكامل"
        placeholder="مثال: عبدالله محمد"
        :error="errors.fullName"
        required
      />

      <!-- Email Address -->
      <BaseInput
        v-model="form.email"
        name="email"
        type="email"
        label="البريد الإلكتروني"
        placeholder="name@example.com"
        :error="errors.email"
        required
      />

      <!-- Phone Number -->
      <BaseInput
        v-model="form.phone"
        name="phone"
        type="tel"
        label="رقم الجوال"
        placeholder="05xxxxxxxx"
        :error="errors.phone"
        required
      />

      <!-- Password -->
      <BaseInput
        v-model="form.password"
        name="password"
        type="password"
        :label="accountType === 'supplier' ? 'كلمة السر' : 'كلمة المرور'"
        placeholder="أدخل كلمة المرور"
        :error="errors.password"
        required
      />

      <!-- Confirm Password -->
      <BaseInput
        v-model="form.confirmPassword"
        name="confirmPassword"
        type="password"
        :label="accountType === 'supplier' ? 'تأكيد كلمة السر' : 'تأكيد كلمة المرور'"
        placeholder="أعد إدخال كلمة المرور"
        :error="errors.confirmPassword"
        required
      />

      <!-- Governorate / Region Dropdown -->
      <div>
        <label class="block mb-2 text-sm font-medium text-slate-800">
          {{ accountType === 'supplier' ? 'المحافظة' : 'المحافظة / المنطقة' }}
          <span class="text-rose-500">*</span>
        </label>
        <div class="relative">
          <select
            v-model="form.governorate"
            class="w-full appearance-none rounded-xl border bg-white py-3 pr-4 pl-10 text-sm text-slate-800 transition-all duration-200 outline-none hover:border-slate-300 focus:border-[#24374e] focus:ring-4 focus:ring-[#24374e]/10"
            :class="errors.governorate ? 'border-rose-400 text-rose-900' : 'border-slate-200'"
          >
            <option value="" disabled selected>اختر المحافظة / المنطقة</option>
            <option v-for="gov in governorates" :key="gov" :value="gov">
              {{ gov }}
            </option>
          </select>
          <div class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <ChevronDown class="size-5" />
          </div>
        </div>
        <div v-if="errors.governorate" class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
          <AlertCircle class="size-3.5 shrink-0" />
          <span>{{ errors.governorate }}</span>
        </div>
      </div>

      <!-- Geolocation Field -->
      <div>
        <label class="block mb-2 text-sm font-medium text-slate-800">
          الموقع الجغرافي <span class="text-rose-500">*</span>
        </label>
        <div
          role="button"
          tabindex="0"
          class="flex items-center justify-between w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm text-slate-800 cursor-pointer hover:border-slate-300 transition-colors"
          :class="errors.location ? 'border-rose-400' : ''"
          @click="handlePickLocation"
          @keydown.enter.prevent="handlePickLocation"
        >
          <div class="flex items-center gap-2 text-slate-500">
            <MapPin class="size-4 text-amber-500 shrink-0" />
            <span :class="form.location ? 'text-slate-800 font-medium' : 'text-slate-400'">
              {{ form.location || 'تحديد الموقع على الخريطة' }}
            </span>
          </div>
          <Map class="size-4 text-slate-400 shrink-0" />
        </div>
        <div v-if="errors.location" class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
          <AlertCircle class="size-3.5 shrink-0" />
          <span>{{ errors.location }}</span>
        </div>
      </div>

      <!-- Extra for Supplier: Store Name -->
      <BaseInput
        v-if="accountType === 'supplier'"
        v-model="form.storeName"
        name="storeName"
        label="اسم المتجر / الشركة"
        placeholder="مثال: متجر الطاقة المتجددة المتقدمة"
        :error="errors.storeName"
        required
      />

      <!-- Extra for Supplier: Commercial Register File Upload -->
      <div v-if="accountType === 'supplier'">
        <label class="block mb-2 text-sm font-medium text-slate-800">
          السجل التجاري (ملف PDF أو صورة) <span class="text-rose-500">*</span>
        </label>
        <input
          ref="commercialInputRef"
          type="file"
          accept=".pdf,image/*"
          class="hidden"
          @change="handleCommercialFileChange"
        />
        <div
          class="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 transition-colors"
          :class="errors.commercialRegisterFile ? 'border-rose-400' : ''"
        >
          <div class="flex items-center gap-2 text-xs text-slate-500 truncate pr-2">
            <FileText class="size-4 text-amber-500 shrink-0" />
            <span class="truncate">
              {{ form.commercialRegisterName || 'إرفاق السجل التجاري (PDF أو صورة، الحد الأقصى 10MB)' }}
            </span>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors"
            @click="commercialInputRef?.click()"
          >
            استعراض
          </button>
        </div>
        <div v-if="errors.commercialRegisterFile" class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
          <AlertCircle class="size-3.5 shrink-0" />
          <span>{{ errors.commercialRegisterFile }}</span>
        </div>
      </div>

      <!-- Extra for Engineer: CV / PDF file upload -->
      <div v-if="accountType === 'engineer'">
        <label class="block mb-2 text-sm font-medium text-slate-800">
          السيرة الذاتية (CV / ملف PDF) <span class="text-rose-500">*</span>
        </label>
        <input
          ref="cvInputRef"
          type="file"
          accept=".pdf"
          class="hidden"
          @change="handleCvFileChange"
        />
        <div
          class="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 transition-colors"
          :class="errors.cvFile ? 'border-rose-400' : ''"
        >
          <div class="flex items-center gap-2 text-xs text-slate-500 truncate pr-2">
            <FileText class="size-4 text-amber-500 shrink-0" />
            <span class="truncate">
              {{ form.cvFileName || 'إرفاق السيرة الذاتية (PDF، الحد الأقصى 5MB)' }}
            </span>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors"
            @click="cvInputRef?.click()"
          >
            استعراض
          </button>
        </div>
        <div v-if="errors.cvFile" class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
          <AlertCircle class="size-3.5 shrink-0" />
          <span>{{ errors.cvFile }}</span>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="pt-3">
        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          block
          arrow
          :loading="isLoading"
        >
          {{ submitButtonLabel }}
        </BaseButton>
      </div>
    </form>

    <!-- Bottom Container Footer -->
    <div class="mt-6 rounded-2xl bg-[#F8FAFC] py-3.5 px-4 text-center text-sm text-slate-600 border border-slate-100">
      <span>لديك حساب بالفعل في سولار هب؟ </span>
      <NuxtLink
        to="/auth/login"
        class="font-bold text-[#24374e] hover:underline"
      >
        تسجيل الدخول
      </NuxtLink>
    </div>
  </div>
</template>
