<script setup lang="ts">
import { Mail, Check, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useTheme } from '~/composables/useTheme'

definePageMeta({
  layout: 'auth',
})

useSeoMeta({
  title: 'التحقق من البريد الإلكتروني | منصة سولار هب',
  description: 'أدخل رمز التحقق المرسل لتفعيل حسابك في منصة سولار هب.',
})

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { isDark } = useTheme()

const email = computed(() => (route.query.email as string) || 'user@example.com')
const role = computed(() => (route.query.role as string) || 'customer')

// 6 OTP digits
const otp = ref(['', '', '', '', '', ''])
const inputRefs = ref<HTMLInputElement[]>([])
const activeIndex = ref(0)
const errorMessage = ref('')

// Countdown timer 59s
const countdown = ref(59)
let timerInterval: any = null

function startTimer() {
  countdown.value = 59
  clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(timerInterval)
    }
  }, 1000)
}

onMounted(() => {
  startTimer()
  nextTick(() => {
    inputRefs.value[0]?.focus()
  })
})

onUnmounted(() => {
  clearInterval(timerInterval)
})

function handleInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  const val = target.value.replace(/\D/g, '')

  errorMessage.value = ''

  if (val.length > 0) {
    otp.value[index] = val.slice(-1)
    if (index < 5) {
      activeIndex.value = index + 1
      inputRefs.value[index + 1]?.focus()
    }
  } else {
    otp.value[index] = ''
  }
}

function handleKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !otp.value[index] && index > 0) {
    activeIndex.value = index - 1
    inputRefs.value[index - 1]?.focus()
  }
}

function handlePaste(event: ClipboardEvent) {
  event.preventDefault()
  const pasted = event.clipboardData?.getData('text') || ''
  const digits = pasted.replace(/\D/g, '').slice(0, 6).split('')

  digits.forEach((d, i) => {
    if (i < 6) otp.value[i] = d
  })

  const nextIdx = Math.min(digits.length, 5)
  activeIndex.value = nextIdx
  inputRefs.value[nextIdx]?.focus()
}

const resendSuccessMessage = ref('')

async function handleResend() {
  if (countdown.value === 0) {
    errorMessage.value = ''
    resendSuccessMessage.value = ''
    const res = await authStore.resendOtp(email.value)
    if (res.success) {
      resendSuccessMessage.value = 'تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني.'
      startTimer()
    } else {
      errorMessage.value = res.error || 'تعذر إعادة إرسال الرمز، يرجى المحاولة لاحقاً'
    }
  }
}

async function handleVerify() {
  const code = otp.value.join('')
  errorMessage.value = ''
  resendSuccessMessage.value = ''

  if (code.length < 6) {
    errorMessage.value = 'يرجى إدخال رمز التحقق كاملاً المكون من 6 أرقام'
    return
  }

  const result = await authStore.verifyOtp({
    email: email.value,
    code,
  })

  if (result.success) {
    router.push({
      path: '/auth/login',
      query: { email: email.value, verified: 'true' },
    })
  } else {
    errorMessage.value = result.error || 'رمز التحقق غير صحيح أو منتهي الصلاحية'
  }
}
</script>

<template>
  <div class="w-full max-w-[480px]">
    <!-- بطاقة التحقق من البريد الإلكتروني المتوافقة بالكامل مع الوضعين -->
    <div class="rounded-3xl border border-solar-border-card bg-solar-bg-card p-7 sm:p-10 shadow-xl text-center flex flex-col items-center transition-colors duration-200">
      <!-- شعار سولار هب المعتمد الشفاف -->
      <NuxtLink to="/" class="mb-5 inline-block transition-transform hover:scale-105" title="الرئيسية">
        <img
          v-if="!isDark"
          src="/images/logo-expanded-dark-transparent.png"
          alt="Solar Hub"
          class="h-10 sm:h-12 w-auto object-contain drop-shadow-xs"
        />
        <img
          v-else
          src="/images/logo-expanded-transparent.png"
          alt="Solar Hub"
          class="h-10 sm:h-12 w-auto object-contain drop-shadow-xs"
        />
      </NuxtLink>

      <!-- أيقونة المغلف مع الشارة الصفراء -->
      <div class="relative mb-5 flex size-20 items-center justify-center rounded-full bg-solar-bg-subtle text-solar-navy dark:text-solar-yellow border border-solar-border-card shadow-xs">
        <Mail class="size-8 stroke-[2.2]" />
        <!-- الشارة الصفراء بعلامة التحقق -->
        <span class="absolute bottom-1 right-1 flex size-5.5 items-center justify-center rounded-full bg-solar-yellow text-solar-navy-dark ring-2 ring-solar-bg-card shadow-xs">
          <Check class="size-3.5 stroke-[3]" />
        </span>
      </div>

      <h1 class="text-xl sm:text-2xl font-black text-solar-text-heading tracking-tight mb-2">
        التحقق من البريد الإلكتروني
      </h1>

      <p class="text-xs sm:text-sm text-solar-text-muted leading-relaxed max-w-sm mb-1">
        أدخل رمز التحقق المرسل إلى بريدك الإلكتروني
      </p>

      <span class="text-xs sm:text-sm font-black text-solar-text-heading dir-ltr mb-7">
        {{ email }}
      </span>

      <!-- تنبيه نجاح إعادة الإرسال -->
      <div
        v-if="resendSuccessMessage"
        class="w-full mb-6 flex items-start gap-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/90 dark:bg-emerald-950/40 p-3.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 leading-relaxed text-right animate-in fade-in duration-200"
      >
        <Check class="size-4.5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
        <span class="flex-1">{{ resendSuccessMessage }}</span>
      </div>

      <!-- تنبيه الخطأ -->
      <div
        v-if="errorMessage"
        class="w-full mb-6 flex items-start gap-2.5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/90 dark:bg-rose-950/40 p-3.5 text-xs font-semibold text-rose-700 dark:text-rose-300 leading-relaxed text-right animate-in fade-in duration-200"
      >
        <AlertCircle class="size-4.5 shrink-0 text-rose-500 mt-0.5" />
        <span class="flex-1">{{ errorMessage }}</span>
      </div>

      <!-- مربعات رمز OTP الستة المتوافقة مع الوضعين -->
      <form @submit.prevent="handleVerify" class="w-full flex flex-col items-center gap-6">
        <div class="flex items-center justify-center gap-2.5 sm:gap-3 dir-ltr" @paste="handlePaste">
          <input
            v-for="(digit, idx) in otp"
            :key="idx"
            :ref="el => inputRefs[idx] = el as HTMLInputElement"
            v-model="otp[idx]"
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="h-14 w-11 sm:h-16 sm:w-13 rounded-2xl text-center text-lg sm:text-xl font-black text-solar-text-heading transition-all focus:outline-none"
            :class="[
              activeIndex === idx
                ? 'border-2 border-solar-yellow bg-solar-bg-card shadow-sm ring-4 ring-solar-yellow/20'
                : 'border border-solar-border-card bg-solar-bg-subtle hover:border-solar-yellow/50'
            ]"
            @input="e => handleInput(idx, e)"
            @keydown="e => handleKeydown(idx, e)"
            @focus="activeIndex = idx"
          />
        </div>

        <!-- مؤقت إعادة الإرسال -->
        <div class="text-xs text-solar-text-body font-medium flex items-center justify-center gap-1">
          <span class="text-solar-text-muted">لم يصلك الرمز؟</span>
          <button
            type="button"
            @click="handleResend"
            class="font-black text-solar-navy dark:text-solar-yellow hover:underline transition-colors select-none cursor-pointer"
            :class="{ 'opacity-60 cursor-not-allowed': countdown > 0 }"
          >
            إعادة الإرسال
            <span v-if="countdown > 0" class="text-solar-text-muted font-bold">(خلال {{ countdown }} ثانية)</span>
          </button>
        </div>

        <!-- زر تأكيد التحقق والدخول -->
        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-solar-navy-dark dark:bg-solar-yellow text-white dark:text-solar-navy-dark text-xs sm:text-sm font-black shadow-md hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          <span v-if="authStore.isLoading" class="size-4 border-2 border-white/30 dark:border-solar-navy/30 border-t-white dark:border-t-solar-navy rounded-full animate-spin" />
          <span>{{ authStore.isLoading ? 'جاري التأكيد...' : 'تأكيد التحقق والدخول' }}</span>
          <ArrowLeft v-if="!authStore.isLoading" class="size-4" />
        </button>
      </form>

      <!-- زر العودة لتعديل بيانات التسجيل -->
      <div class="mt-8 border-t border-solar-border-card/60 pt-5 w-full">
        <NuxtLink
          to="/auth/register"
          class="inline-flex items-center gap-1.5 text-xs font-bold text-solar-text-body hover:text-solar-navy dark:hover:text-solar-yellow transition-colors"
        >
          <span>العودة لتعديل بيانات التسجيل</span>
          <ArrowRight class="size-3.5" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
