<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { Mail, Check, ArrowRight } from 'lucide-vue-next'
import BaseButton from '~/components/ui/BaseButton.vue'

const route = useRoute()
const email = computed(() => (route.query.email as string) || 'user@example.com')

// 6 digits OTP code
const digits = reactive<string[]>(['', '', '', '', '', ''])
const inputRefs = ref<HTMLInputElement[]>([])

// Countdown timer (59s)
const countdown = ref(59)
let timer: any = null

onMounted(() => {
  startCountdown()
  // Auto-focus first input
  if (inputRefs.value[0]) {
    inputRefs.value[0].focus()
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const startCountdown = () => {
  if (timer) clearInterval(timer)
  countdown.value = 59
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(timer)
    }
  }, 1000)
}

const handleInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const val = target.value.replace(/\D/g, '') // only digits
  digits[index] = val ? val[val.length - 1] : ''

  // Move to next input if digit entered
  if (val && index < 5) {
    inputRefs.value[index + 1]?.focus()
  }
}

const handleKeyDown = (index: number, event: KeyboardEvent) => {
  // Move to previous input on backspace if current is empty
  if (event.key === 'Backspace' && !digits[index] && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pasted = event.clipboardData?.getData('text') || ''
  const clean = pasted.replace(/\D/g, '').slice(0, 6)
  clean.split('').forEach((char, i) => {
    digits[i] = char
  })
  const nextIdx = Math.min(clean.length, 5)
  inputRefs.value[nextIdx]?.focus()
}

const handleResend = () => {
  if (countdown.value > 0) return
  startCountdown()
}

const isLoading = ref(false)

const handleVerify = async () => {
  const code = digits.join('')
  if (code.length < 6) return

  isLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))
    await navigateTo('/')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="w-full text-center" dir="rtl">
    <!-- Center Envelope Badge with amber checkmark -->
    <div class="mx-auto mb-5 relative flex size-16 items-center justify-center rounded-full bg-[#EEF2F6]">
      <Mail class="size-8 text-[#24374e]" />
      <span class="absolute bottom-0 right-0 flex size-5 items-center justify-center rounded-full bg-amber-400 text-white shadow-sm ring-2 ring-white">
        <Check class="size-3 stroke-[3]" />
      </span>
    </div>

    <!-- Header Titles -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">
        التحقق من البريد الإلكتروني
      </h1>
      <p class="mt-2 text-sm text-slate-500">
        أدخلنا رمز التحقق المرسل إلى بريدك الإلكتروني
      </p>
      <p class="mt-1 text-sm font-semibold text-slate-800" dir="ltr">
        {{ email }}
      </p>
    </div>

    <!-- 6-digit OTP Inputs -->
    <form @submit.prevent="handleVerify">
      <div class="flex items-center justify-center gap-2 sm:gap-3 my-6" dir="ltr" @paste="handlePaste">
        <input
          v-for="(digit, idx) in digits"
          :key="idx"
          :ref="(el) => { if (el) inputRefs[idx] = el as HTMLInputElement }"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="1"
          :value="digit"
          class="h-14 w-11 sm:w-12 rounded-xl text-center text-xl font-bold transition-all duration-200 outline-none"
          :class="[
            digit
              ? 'border-2 border-amber-400 bg-white text-slate-900 shadow-sm'
              : 'border border-slate-200 bg-[#EEF2F6]/60 text-slate-800 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-400/10'
          ]"
          @input="handleInput(idx, $event)"
          @keydown="handleKeyDown(idx, $event)"
        />
      </div>

      <!-- Resend timer -->
      <div class="mb-6 text-xs text-slate-500">
        <span>لم يصلك الرمز؟ </span>
        <button
          type="button"
          :disabled="countdown > 0"
          :class="[
            'font-medium transition-colors',
            countdown > 0 ? 'text-slate-400' : 'text-amber-500 hover:text-amber-600 font-bold underline cursor-pointer'
          ]"
          @click="handleResend"
        >
          <span v-if="countdown > 0">إعادة الإرسال (خلال {{ countdown }} ثانية)</span>
          <span v-else>إعادة إرسال الرمز الآن</span>
        </button>
      </div>

      <!-- Submit Verification Button -->
      <div class="pt-1">
        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          block
          arrow
          :disabled="digits.join('').length < 6"
          :loading="isLoading"
        >
          تأكيد التحقق والدخول
        </BaseButton>
      </div>
    </form>

    <!-- Footer: Return to Edit Registration Details -->
    <div class="mt-8 pt-6 border-t border-slate-100 text-center">
      <NuxtLink
        to="/auth/register"
        class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-[#24374e] transition-colors"
      >
        <span>العودة لتعديل بيانات التسجيل</span>
        <ArrowRight class="size-4 shrink-0" />
      </NuxtLink>
    </div>
  </div>
</template>
