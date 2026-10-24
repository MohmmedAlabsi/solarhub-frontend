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

const suspendedPreviewButtonText = computed(() =>
  isSuspendedPreview.value
    ? 'إلغاء معاينة الحساب المعلق'
    : 'معاينة تنبيه الحساب المعلق'
)

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

onMounted(() => {
  if (import.meta.client) {
    // 1. إذا كان المستخدم قد سجل خروجه وقام بتحديث الصفحة (Reload)
    if (sessionStorage.getItem('solar_just_logged_out') === '1') {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      const isReload = navEntries.length > 0 && navEntries[0]?.type === 'reload'

      if (isReload) {
        sessionStorage.removeItem('solar_just_logged_out')
        navigateTo('/', { replace: true })
        return
      }

      // 2. اعتراض زر العودة في المتصفح أو الهاتف لإعادته إلى الصفحة الرئيسية صفحة الهبوط
      window.history.pushState({ page: 'login' }, '', window.location.href)
      const handlePopState = () => {
        if (sessionStorage.getItem('solar_just_logged_out') === '1') {
          sessionStorage.removeItem('solar_just_logged_out')
          navigateTo('/', { replace: true })
        }
      }

      window.addEventListener('popstate', handlePopState)
      onBeforeUnmount(() => {
        window.removeEventListener('popstate', handlePopState)
      })
    }
  }
})

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
    const targetPath = authStore.getDashboardPath(result.user.role)
    router.push(targetPath)
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
    <!-- بطاقة تسجيل الدخول المتوافقة بالكامل مع الوضعين الداكن والنهاري -->
    <div class="rounded-3xl border border-solar-border-card bg-solar-bg-card p-7 sm:p-10 shadow-xl text-right transition-colors duration-200">
      <!-- الشعار والعناوين -->
      <AuthHeader
        title="تسجيل الدخول"
        subtitle="أهلاً بك مجدداً في منصة حلول الطاقة الشمسية"
      />

      <!-- رابط المعاينة السريعة للحساب المعلق -->
      <div class="mb-5 text-center">
        <button
          type="button"
          @click="toggleSuspendedPreview"
          class="text-[11px] font-semibold text-solar-text-muted hover:text-solar-navy dark:hover:text-solar-yellow transition-colors select-none cursor-pointer"
        >
          {{ suspendedPreviewButtonText }}
        </button>
      </div>

      <!-- تنبيه نجاح التحقق من البريد -->
      <div
        v-if="isVerifiedSuccess"
        class="mb-6 flex items-start gap-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/90 dark:bg-emerald-950/40 p-3.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 leading-relaxed animate-in fade-in duration-200"
      >
        <CheckCircle2 class="size-4.5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
        <span class="flex-1">تم تفعيل بريدك الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول إلى حسابك.</span>
      </div>

      <!-- تنبيه الخطأ أو التعليق -->
      <div
        v-if="errorMessage"
        class="mb-6 flex items-start gap-2.5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/90 dark:bg-rose-950/40 p-3.5 text-xs font-semibold text-rose-700 dark:text-rose-300 leading-relaxed animate-in fade-in duration-200"
      >
        <AlertCircle class="size-4.5 shrink-0 text-rose-500 mt-0.5" />
        <span class="flex-1 break-words overflow-hidden">{{ errorMessage }}</span>
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
              placeholder="name@example.com أو 77xxxxxxx"
              dir="ltr"
              class="h-12 w-full rounded-xl border border-solar-border-card bg-solar-bg-card dark:bg-solar-bg-subtle/50 px-3.5 pl-11 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all text-left"
              :class="{ 'border-rose-400 ring-1 ring-rose-200 dark:ring-rose-900': errorMessage && !form.login.trim() }"
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
              class="text-xs font-bold text-solar-navy dark:text-solar-yellow hover:underline transition-colors"
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
              class="h-12 w-full rounded-xl border border-solar-border-card bg-solar-bg-card dark:bg-solar-bg-subtle/50 px-3.5 pl-11 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all"
              :class="{ 'border-rose-400 ring-1 ring-rose-200 dark:ring-rose-900': errorMessage && !form.password }"
            />
            <button
              type="button"
              @click="togglePassword"
              class="absolute left-3.5 top-1/2 -translate-y-1/2 text-solar-text-muted hover:text-solar-navy dark:hover:text-solar-yellow transition-colors cursor-pointer"
              :aria-label="showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'"
            >
              <EyeOff v-if="showPassword" class="size-4.5" />
              <Eye v-else class="size-4.5" />
            </button>
          </div>
        </div>

        <!-- زر تسجيل الدخول المتجاوب بلون بارز في كلا الوضعين -->
        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-solar-navy-dark dark:bg-solar-yellow text-white dark:text-solar-navy-dark text-xs sm:text-sm font-black shadow-md hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          <span v-if="authStore.isLoading" class="size-4 border-2 border-white/30 dark:border-solar-navy/30 border-t-white dark:border-t-solar-navy rounded-full animate-spin" />
          <span>{{ authStore.isLoading ? 'جاري التحقق...' : 'تسجيل الدخول' }}</span>
          <ArrowLeft v-if="!authStore.isLoading" class="size-4" />
        </button>
      </form>

      <!-- التذييل: الانتقال لإنشاء حساب -->
      <div class="mt-8 border-t border-solar-border-card/60 pt-5 text-center text-xs text-solar-text-body">
        <span>ليس لديك حساب في سولار هب؟ </span>
        <NuxtLink
          to="/auth/register"
          class="font-black text-solar-navy dark:text-solar-yellow hover:underline transition-colors underline decoration-solar-yellow/50 underline-offset-4"
        >
          إنشاء حساب جديد
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
