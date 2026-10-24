<script setup lang="ts">
import { Eye, EyeOff, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'auth',
})

useSeoMeta({
  title: 'تعيين كلمة المرور الجديدة | منصة سولار هب',
  description: 'قم بتعيين كلمة مرور قوية وجديدة لحسابك في منصة سولار هب.',
})

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const form = reactive({
  email: (route.query.email as string) || '',
  token: (route.query.token as string) || '',
  password: '',
  password_confirmation: '',
})

const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const errorMessage = ref('')
const isSuccess = ref(false)

// Simple password strength calculation
const passwordStrength = computed(() => {
  const pwd = form.password
  if (!pwd) return { score: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd) || /[a-z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  if (score <= 1) return { score: 1, label: 'ضعيفة', color: 'bg-rose-500' }
  if (score === 2) return { score: 2, label: 'متوسطة', color: 'bg-amber-500' }
  if (score === 3) return { score: 3, label: 'جيدة', color: 'bg-blue-500' }
  return { score: 4, label: 'قوية جداً', color: 'bg-emerald-500' }
})

async function handleSubmit() {
  errorMessage.value = ''

  if (!form.email) {
    errorMessage.value = 'يرجى إدخال البريد الإلكتروني'
    return
  }

  if (!form.token) {
    errorMessage.value = 'رمز التحقق (Token) مفقود، يرجى إعادة طلب رابط الاستعادة'
    return
  }

  if (!form.password) {
    errorMessage.value = 'يرجى إدخال كلمة المرور الجديدة'
    return
  }

  if (form.password.length < 8) {
    errorMessage.value = 'كلمة المرور يجب أن لا تقل عن 8 خانات'
    return
  }

  if (form.password !== form.password_confirmation) {
    errorMessage.value = 'كلمتا المرور غير متطابقتين'
    return
  }

  const res = await authStore.resetPassword({
    email: form.email,
    token: form.token,
    password: form.password,
    password_confirmation: form.password_confirmation,
  })

  if (res.success) {
    isSuccess.value = true
  } else {
    errorMessage.value = res.error || 'تعذر إعادة تعيين كلمة المرور، يرجى المحاولة مرة أخرى أو طلب رابط جديد'
  }
}
</script>

<template>
  <div class="w-full max-w-[480px]">
    <div class="rounded-3xl border border-solar-border-card bg-solar-bg-card p-7 sm:p-10 shadow-xl text-right transition-colors duration-200">
      <!-- 1. حالة النجاح -->
      <div v-if="isSuccess" class="flex flex-col items-center text-center animate-in fade-in duration-300">
        <div class="mb-5 flex size-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-xs border border-emerald-500/25">
          <ShieldCheck class="size-10 stroke-[2.2]" />
        </div>

        <h2 class="text-xl sm:text-2xl font-black text-solar-text-heading mb-2">
          تم تغيير كلمة المرور بنجاح!
        </h2>

        <p class="text-xs sm:text-sm text-solar-text-muted leading-relaxed max-w-sm mb-6">
          تم تحديث كلمة المرور الخاصة بحسابك بأمان. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.
        </p>

        <NuxtLink
          to="/auth/login"
          class="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-solar-navy-dark dark:bg-solar-yellow text-white dark:text-solar-navy-dark text-xs sm:text-sm font-black shadow-md hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer"
        >
          <span>تسجيل الدخول الآن</span>
          <ArrowLeft class="size-4" />
        </NuxtLink>
      </div>

      <!-- 2. النموذج الافتراضي -->
      <div v-else>
        <AuthHeader
          title="تعيين كلمة المرور الجديدة"
          subtitle="أدخل كلمة المرور الجديدة وتأكيدها لتتمكن من استعادة حسابك واستخدامه."
        />

        <!-- تنبيه الخطأ إن وجد -->
        <div
          v-if="errorMessage"
          class="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/90 dark:bg-rose-950/40 p-4 text-xs font-semibold text-rose-700 dark:text-rose-300 leading-relaxed animate-in fade-in duration-200"
        >
          <AlertCircle class="size-5 shrink-0 text-rose-500 mt-0.5" />
          <span class="flex-1">{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
          <!-- البريد الإلكتروني -->
          <div class="flex flex-col gap-1.5">
            <label for="reset-email" class="text-xs font-bold text-solar-text-heading flex items-center gap-1">
              <span>البريد الإلكتروني</span>
              <span class="text-rose-500">*</span>
            </label>
            <input
              id="reset-email"
              v-model="form.email"
              type="email"
              placeholder="name@example.com"
              dir="ltr"
              required
              class="h-12 w-full rounded-xl border border-solar-border-card bg-solar-bg-card dark:bg-solar-bg-subtle/50 px-3.5 text-xs font-medium text-solar-text-heading focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 text-left transition-all"
            />
          </div>

          <!-- رمز الاستعادة (إن لم يكن في الرابط يطلبه يدويًا) -->
          <div v-if="!route.query.token" class="flex flex-col gap-1.5">
            <label for="reset-token" class="text-xs font-bold text-solar-text-heading flex items-center gap-1">
              <span>رمز التحقق / الاستعادة (Token)</span>
              <span class="text-rose-500">*</span>
            </label>
            <input
              id="reset-token"
              v-model="form.token"
              type="text"
              placeholder="رمز الاستعادة المرسل لبريدك"
              dir="ltr"
              required
              class="h-12 w-full rounded-xl border border-solar-border-card bg-solar-bg-card dark:bg-solar-bg-subtle/50 px-3.5 text-xs font-mono font-medium text-solar-text-heading focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 text-left transition-all"
            />
          </div>

          <!-- كلمة المرور الجديدة -->
          <div class="flex flex-col gap-1.5">
            <label for="new-password" class="text-xs font-bold text-solar-text-heading flex items-center gap-1">
              <span>كلمة المرور الجديدة</span>
              <span class="text-rose-500">*</span>
            </label>
            <div class="relative flex items-center">
              <input
                id="new-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                dir="ltr"
                required
                class="h-12 w-full rounded-xl border border-solar-border-card bg-solar-bg-card dark:bg-solar-bg-subtle/50 px-3.5 pl-10 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 text-left transition-all"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute left-3 text-solar-text-muted hover:text-solar-navy dark:hover:text-solar-yellow transition-colors cursor-pointer"
                tabindex="-1"
              >
                <EyeOff v-if="showPassword" class="size-4" />
                <Eye v-else class="size-4" />
              </button>
            </div>

            <!-- مقياس قوة كلمة المرور -->
            <div v-if="form.password" class="mt-1 flex items-center gap-2">
              <div class="flex-1 h-1.5 bg-solar-bg-subtle rounded-full overflow-hidden flex gap-0.5 border border-solar-border-card/40">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="h-full flex-1 transition-all duration-300"
                  :class="i <= passwordStrength.score ? passwordStrength.color : 'bg-solar-border-card/30'"
                />
              </div>
              <span class="text-[10px] font-bold text-solar-text-muted">{{ passwordStrength.label }}</span>
            </div>
          </div>

          <!-- تأكيد كلمة المرور الجديدة -->
          <div class="flex flex-col gap-1.5">
            <label for="confirm-password" class="text-xs font-bold text-solar-text-heading flex items-center gap-1">
              <span>تأكيد كلمة المرور الجديدة</span>
              <span class="text-rose-500">*</span>
            </label>
            <div class="relative flex items-center">
              <input
                id="confirm-password"
                v-model="form.password_confirmation"
                :type="showPasswordConfirm ? 'text' : 'password'"
                placeholder="••••••••"
                dir="ltr"
                required
                class="h-12 w-full rounded-xl border border-solar-border-card bg-solar-bg-card dark:bg-solar-bg-subtle/50 px-3.5 pl-10 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 text-left transition-all"
              />
              <button
                type="button"
                @click="showPasswordConfirm = !showPasswordConfirm"
                class="absolute left-3 text-solar-text-muted hover:text-solar-navy dark:hover:text-solar-yellow transition-colors cursor-pointer"
                tabindex="-1"
              >
                <EyeOff v-if="showPasswordConfirm" class="size-4" />
                <Eye v-else class="size-4" />
              </button>
            </div>
            <p v-if="form.password_confirmation && form.password !== form.password_confirmation" class="text-[11px] font-bold text-rose-500 mt-0.5">
              كلمتا المرور غير متطابقتين
            </p>
          </div>

          <!-- زر الحفظ والتأكيد -->
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-solar-navy-dark dark:bg-solar-yellow text-white dark:text-solar-navy-dark text-xs sm:text-sm font-black shadow-md hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            <span v-if="authStore.isLoading" class="size-4 border-2 border-white/30 dark:border-solar-navy/30 border-t-white dark:border-t-solar-navy rounded-full animate-spin" />
            <span>{{ authStore.isLoading ? 'جاري الحفظ وتعيين كلمة المرور...' : 'حفظ كلمة المرور الجديدة' }}</span>
            <ArrowLeft v-if="!authStore.isLoading" class="size-4" />
          </button>
        </form>

        <div class="mt-8 text-center text-xs text-solar-text-body">
          <span>تذكرت كلمة المرور؟ </span>
          <NuxtLink
            to="/auth/login"
            class="font-black text-solar-navy dark:text-solar-yellow hover:underline transition-colors underline decoration-solar-yellow/50 underline-offset-4"
          >
            العودة لتسجيل الدخول
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
