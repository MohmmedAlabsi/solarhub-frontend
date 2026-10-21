<script setup lang="ts">
import { User, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'auth',
})

useSeoMeta({
  title: 'تسجيل الدخول | منصة سولار هب',
  description: 'سجّل الدخول إلى منصة سولار هب لمتابعة طلباتك، مشترياتك، وعروض الأسعار.',
})

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({
  login: (route.query.email as string) || '',
  password: '',
  remember: false,
})

const showPassword = ref(false)
const errorMessage = ref('')
const isSuspendedPreview = ref(false)
const isVerifiedSuccess = computed(() => route.query.verified === 'true')

function togglePassword() {
  showPassword.value = !showPassword.value
}

function toggleSuspendedPreview() {
  isSuspendedPreview.value = !isSuspendedPreview.value
  if (isSuspendedPreview.value) {
    errorMessage.value = 'تم تعليق هذا الحساب مؤقتاً لمراجعة الوثائق. يرجى التواصل مع إدارة الدعم الفني لحل المشكلة.'
  } else {
    errorMessage.value = ''
  }
}

async function handleSubmit() {
  errorMessage.value = ''

  if (!form.login.trim()) {
    errorMessage.value = 'يرجى إدخال البريد الإلكتروني أو رقم الجوال'
    return
  }

  if (!form.password) {
    errorMessage.value = 'يرجى إدخال كلمة المرور'
    return
  }

  if (isSuspendedPreview.value) {
    errorMessage.value = 'تم تعليق هذا الحساب مؤقتاً لمراجعة الوثائق. يرجى التواصل مع إدارة الدعم الفني لحل المشكلة.'
    return
  }

  const result = await authStore.login({
    login: form.login,
    password: form.password,
    remember: form.remember,
  })

  if (result.success && result.user) {
    // Redirect based on role
    if (result.user.role === 'customer') {
      router.push('/customer/dashboard')
    } else if (result.user.role === 'engineer') {
      router.push('/customer/dashboard') // or engineer dashboard
    } else if (result.user.role === 'supplier') {
      router.push('/customer/dashboard') // or supplier dashboard
    } else {
      router.push('/admin/dashboard')
    }
  } else {
    if (result.status === 403 && (result.error?.includes('verify') || result.error?.includes('التحقق'))) {
      errorMessage.value = 'يرجى التحقق من بريدك الإلكتروني أولاً. جاري توجيهك لصفحة التحقق...'
      setTimeout(() => {
        router.push({
          path: '/auth/verify-email',
          query: { email: form.login },
        })
      }, 1200)
    } else {
      errorMessage.value = result.error || 'تعذر تسجيل الدخول، يرجى التأكد من صحة البيانات'
    }
  }
}
</script>

<template>
  <div class="w-full max-w-[480px]">
    <!-- بطاقة تسجيل الدخول المطابقة تماماً لتصميم تسجيل الدخول.png -->
    <div class="rounded-3xl border border-solar-border-card/70 bg-white p-7 sm:p-10 shadow-xl text-right">
      <!-- الشعار والعناوين -->
      <AuthHeader
        title="تسجيل الدخول"
        subtitle="أهلاً بك مجدداً في منصة حلول الطاقة الشمسية"
      />

      <!-- رابط المعاينة السريعة للحساب المعلق (كما هو موضح في التصميم الأصلي) -->
      <div class="mb-5 text-center">
        <button
          type="button"
          @click="toggleSuspendedPreview"
          class="text-[11px] font-semibold text-solar-text-muted hover:text-solar-navy transition-colors select-none"
        >
          [{{ isSuspendedPreview ? 'إلغاء معاينة الحساب المعلق' : 'معاينة تنبيه الحساب المعلق' }}]
        </button>
      </div>

      <!-- تنبيه نجاح التحقق من البريد -->
      <div
        v-if="isVerifiedSuccess"
        class="mb-6 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs font-semibold text-emerald-800 leading-relaxed animate-in fade-in duration-200"
      >
        <CheckCircle2 class="size-4.5 shrink-0 text-emerald-600 mt-0.5" />
        <span class="flex-1">تم تفعيل بريدك الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول إلى حسابك.</span>
      </div>

      <!-- تنبيه الخطأ أو التعليق -->
      <div
        v-if="errorMessage"
        class="mb-6 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs font-semibold text-rose-700 leading-relaxed animate-in fade-in duration-200"
      >
        <AlertCircle class="size-4.5 shrink-0 text-rose-500 mt-0.5" />
        <span class="flex-1">{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-5">
        <!-- حقل البريد الإلكتروني أو رقم الجوال -->
        <div class="flex flex-col gap-1.5">
          <label for="login-input" class="text-xs font-bold text-solar-text-heading flex items-center gap-1">
            <span>البريد الإلكتروني أو رقم الجوال</span>
            <span class="text-rose-500">*</span>
          </label>

          <div class="relative flex items-center">
            <input
              id="login-input"
              v-model="form.login"
              type="text"
              placeholder="xxxxxxx gl05example@domain.com"
              dir="ltr"
              class="h-12 w-full rounded-xl border border-solar-border-card/80 bg-white px-3.5 pl-11 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted/70 focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all text-left"
              :class="{ 'border-rose-400 ring-1 ring-rose-200': errorMessage && !form.login.trim() }"
            />
            <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-solar-text-muted pointer-events-none">
              <User class="size-4.5" />
            </div>
          </div>
        </div>

        <!-- حقل كلمة المرور -->
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <label for="password-input" class="text-xs font-bold text-solar-text-heading flex items-center gap-1">
              <span>كلمة المرور</span>
              <span class="text-rose-500">*</span>
            </label>

            <!-- رابط نسيت كلمة المرور على الجانب الأيسر -->
            <NuxtLink
              to="/auth/forgot-password"
              class="text-xs font-bold text-solar-navy hover:text-solar-yellow transition-colors"
            >
              نسيت كلمة المرور؟
            </NuxtLink>
          </div>

          <div class="relative flex items-center">
            <input
              id="password-input"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="أدخل كلمة المرور"
              class="h-12 w-full rounded-xl border border-solar-border-card/80 bg-white px-3.5 pl-11 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted/70 focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all"
              :class="{ 'border-rose-400 ring-1 ring-rose-200': errorMessage && !form.password }"
            />
            <button
              type="button"
              @click="togglePassword"
              class="absolute left-3.5 top-1/2 -translate-y-1/2 text-solar-text-muted hover:text-solar-navy transition-colors"
              :aria-label="showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'"
            >
              <EyeOff v-if="showPassword" class="size-4.5" />
              <Eye v-else class="size-4.5" />
            </button>
          </div>
        </div>

        <!-- زر تسجيل الدخول الداكن -->
        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1b2d42] text-xs sm:text-sm font-bold text-white shadow-md hover:bg-solar-navy-dark active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          <span v-if="authStore.isLoading" class="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>{{ authStore.isLoading ? 'جاري التحقق...' : 'تسجيل الدخول' }}</span>
          <ArrowLeft v-if="!authStore.isLoading" class="size-4" />
        </button>
      </form>

      <!-- التذييل: الانتقال لإنشاء حساب -->
      <div class="mt-8 border-t border-solar-border-card/60 pt-5 text-center text-xs text-solar-text-body">
        <span>ليس لديك حساب في سولار هب؟ </span>
        <NuxtLink
          to="/auth/register"
          class="font-black text-solar-navy hover:text-solar-yellow transition-colors underline decoration-solar-yellow/50 underline-offset-4"
        >
          إنشاء حساب جديد
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
