<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue'
import { AlertCircle, CheckCircle2, HelpCircle, Mail, ArrowLeft } from 'lucide-vue-next'
import BaseInput from '~/components/ui/BaseInput.vue'
import BaseButton from '~/components/ui/BaseButton.vue'

type Step = 'form' | 'success'

const step = ref<Step>('form')
const identifier = ref('')
const errorMsg = ref('')
const bannerError = ref('')
const isLoading = ref(false)

// Countdown timer for resend
const timeLeft = ref(105) // 01:45
let timerInterval: any = null

const formattedTimer = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval)
  timeLeft.value = 105
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      clearInterval(timerInterval)
    }
  }, 1000)
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const handleSubmit = async () => {
  errorMsg.value = ''
  bannerError.value = ''

  if (!identifier.value.trim()) {
    errorMsg.value = 'البريد الإلكتروني المدخل غير مسجل لدينا في المنصة'
    bannerError.value = 'لم نتمكن من العثور على حساب مرتبط بهذا البريد أو رقم الجوال. يُرجى التحقق وإعادة المحاولة.'
    return
  }

  // Demonstration test for error matching screenshot
  if (identifier.value.includes('unknown') || identifier.value.includes('error')) {
    errorMsg.value = 'البريد الإلكتروني المدخل غير مسجل لدينا في المنصة'
    bannerError.value = 'لم نتمكن من العثور على حساب مرتبط بهذا البريد أو رقم الجوال. يُرجى التحقق وإعادة المحاولة.'
    return
  }

  isLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))
    step.value = 'success'
    startTimer()
  } catch (e) {
    bannerError.value = 'حدث خطأ في النظام، يرجى المحاولة مرة أخرى.'
  } finally {
    isLoading.value = false
  }
}

const handleResend = () => {
  if (timeLeft.value > 0) return
  startTimer()
}
</script>

<template>
  <div class="w-full text-center" dir="rtl">
    <!-- STATE 1 & 2: Form & Error states -->
    <div v-if="step === 'form'">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">
          استعادة كلمة المرور
        </h1>
        <p class="mt-2 text-sm leading-relaxed text-slate-500">
          أدخل البريد الإلكتروني أو رقم الجوال المسجل في حسابك وسنرسل لك رابطاً أو رمز تحقق لإعادة تعيين كلمة المرور بسهولة.
        </p>
      </div>

      <!-- Banner Error State (Matches screenshot) -->
      <div
        v-if="bannerError"
        class="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-[#FFF1F2] p-4 text-right text-sm text-rose-700 animate-fadeIn"
      >
        <AlertCircle class="size-5 shrink-0 text-rose-500 mt-0.5" />
        <span class="leading-relaxed">{{ bannerError }}</span>
      </div>

      <!-- Reset Form -->
      <form class="space-y-4 text-right" @submit.prevent="handleSubmit">
        <BaseInput
          v-model="identifier"
          name="identifier"
          label="البريد الإلكتروني أو رقم الجوال المسجل"
          placeholder="xxxxxxxxx gi05example@domain.com"
          :error="errorMsg"
          required
        />

        <div class="pt-2">
          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            block
            arrow
            :loading="isLoading"
          >
            إرسال رابط / رمز الاستعادة
          </BaseButton>
        </div>
      </form>

      <!-- Return to Login Footer -->
      <div class="mt-8 text-center text-sm text-slate-600">
        <span>تذكرت كلمة المرور؟ </span>
        <NuxtLink
          to="/auth/login"
          class="font-bold text-[#24374e] hover:underline"
        >
          العودة لتسجيل الدخول
        </NuxtLink>
      </div>
    </div>

    <!-- STATE 3: Success State (Matches screenshot) -->
    <div v-else class="space-y-6 animate-fadeIn">
      <!-- Success Icon Badge -->
      <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
        <div class="relative">
          <Mail class="size-8" />
          <CheckCircle2 class="absolute -bottom-1 -right-1 size-4 bg-emerald-50 text-emerald-600 rounded-full" />
        </div>
      </div>

      <!-- Success Titles -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">
          تم إرسال تعليمات الاستعادة بنجاح
        </h1>
        <p class="mt-2 text-sm leading-relaxed text-slate-600">
          أرسلنا رابطاً مؤقتاً ورمز تحقق لإعادة تعيين كلمة المرور إلى البريد الإلكتروني / الجوال:
          <strong class="font-bold text-slate-900 block mt-1" dir="ltr">
            {{ identifier || 'ahmed.solar***@gmail.com' }}
          </strong>
          الرابط صالح لمدة 15 دقيقة.
        </p>
      </div>

      <!-- Resend Box -->
      <div class="rounded-2xl bg-[#EEF2F6]/70 p-5 text-center text-xs text-slate-600 border border-slate-100">
        <p class="font-medium text-slate-700">لم يصلك الرمز؟</p>
        <p class="mt-1 text-slate-500">
          يمكنك طلب إعادة الإرسال خلال <span class="font-semibold text-slate-800" dir="ltr">({{ formattedTimer }})</span>
        </p>
        <button
          type="button"
          :disabled="timeLeft > 0"
          :class="[
            'mt-2.5 font-bold transition-colors inline-block',
            timeLeft > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-amber-500 hover:text-amber-600 cursor-pointer underline'
          ]"
          @click="handleResend"
        >
          إعادة إرسال الرابط / الرمز الآن
        </button>
      </div>

      <!-- Return Button -->
      <div>
        <BaseButton
          to="/auth/login"
          variant="primary"
          size="lg"
          block
          arrow
        >
          العودة لتسجيل الدخول
        </BaseButton>
      </div>

      <!-- Help Link -->
      <div class="pt-2 flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors">
        <HelpCircle class="size-3.5" />
        <span>تحتاج إلى مساعدة إضافية؟ تواصل مع الدعم الفني</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.25s ease-out;
}
</style>
