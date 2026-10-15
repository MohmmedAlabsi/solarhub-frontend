<script setup lang="ts">
import { ArrowLeft, AlertCircle, XCircle, CheckCircle2, Mail, HelpCircle } from 'lucide-vue-next'
import { useAuthStore } from '~~/app/stores/auth.store'

definePageMeta({
  layout: 'auth',
})

useSeoMeta({
  title: 'استعادة كلمة المرور | منصة سولار هب',
  description: 'استعد كلمة المرور الخاصة بحسابك في منصة سولار هب بكل أمان وسهولة.',
})

const authStore = useAuthStore()

const loginInput = ref('')
const currentState = ref<'default' | 'error' | 'success'>('default')
const countdownSeconds = ref(105) // 01:45
let timerInterval: any = null

const formattedTimer = computed(() => {
  const m = Math.floor(countdownSeconds.value / 60)
  const s = countdownSeconds.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const maskedLogin = computed(() => {
  if (!loginInput.value) return 'ahmed.solar***@gmail.com'
  if (loginInput.value.includes('@')) {
    const [user, domain] = loginInput.value.split('@')
    const masked = user.slice(0, 3) + '***'
    return `${masked}@${domain}`
  }
  return loginInput.value.slice(0, 3) + '****' + loginInput.value.slice(-3)
})

function startTimer() {
  countdownSeconds.value = 105
  clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    if (countdownSeconds.value > 0) {
      countdownSeconds.value--
    } else {
      clearInterval(timerInterval)
    }
  }, 1000)
}

onUnmounted(() => {
  clearInterval(timerInterval)
})

async function handleSend() {
  if (!loginInput.value.trim()) {
    currentState.value = 'error'
    return
  }

  // Simulate verification
  const res = await authStore.forgotPassword(loginInput.value)

  if (res.success) {
    currentState.value = 'success'
    startTimer()
  } else {
    currentState.value = 'error'
  }
}

function handleResend() {
  if (countdownSeconds.value === 0) {
    startTimer()
  }
}

function resetToDefault() {
  currentState.value = 'default'
}
</script>

<template>
  <div class="w-full max-w-[480px]">
    <!-- بطاقة استعادة كلمة المرور مع الحالات الثلاث (الافتراضية، الخطأ، نجاح الإرسال) -->
    <div class="rounded-3xl border border-solar-border-card/70 bg-white p-7 sm:p-10 shadow-xl text-right">
      <!-- 1. الحالة الافتراضية وحالة الخطأ -->
      <div v-if="currentState !== 'success'">
        <AuthHeader
          title="استعادة كلمة المرور"
          subtitle="أدخل البريد الإلكتروني أو رقم الجوال المسجل في حسابك وسنرسل لك رابطاً أو رمز تحقق لإعادة تعيين كلمة المرور بسهولة."
        />

        <!-- تنبيه الخطأ العلوي المطابق لـ "استعادة كلمة المرور-خطأ التحقق.png" -->
        <div
          v-if="currentState === 'error'"
          class="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-[#FFF2F2] p-4 text-xs font-semibold text-rose-700 leading-relaxed animate-in fade-in duration-200"
        >
          <AlertCircle class="size-5 shrink-0 text-rose-500 mt-0.5" />
          <span class="flex-1">
            لم نتمكن من العثور على حساب مرتبط بهذا البريد أو رقم الجوال. يُرجى التحقق وإعادة المحاولة.
          </span>
        </div>

        <form @submit.prevent="handleSend" class="flex flex-col gap-4">
          <!-- حقل البريد الإلكتروني أو رقم الجوال المسجل -->
          <div class="flex flex-col gap-1.5">
            <label for="recovery-input" class="text-xs font-bold text-solar-text-heading flex items-center gap-1">
              <span>البريد الإلكتروني أو رقم الجوال المسجل</span>
              <span class="text-rose-500">*</span>
            </label>

            <input
              id="recovery-input"
              v-model="loginInput"
              type="text"
              placeholder="xxxxxxxx gi05example@domain.com"
              dir="ltr"
              @input="resetToDefault"
              class="h-12 w-full rounded-xl border bg-white px-3.5 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted/70 focus:outline-none focus:ring-2 transition-all text-left"
              :class="[
                currentState === 'error'
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-200 text-rose-800'
                  : 'border-solar-border-card/80 focus:border-solar-yellow focus:ring-solar-yellow/20'
              ]"
            />

            <!-- رسالة الخطأ تحت الحقل مباشرة المطابقة للتصميم -->
            <div v-if="currentState === 'error'" class="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 mt-1">
              <XCircle class="size-3.5 shrink-0" />
              <span>البريد الإلكتروني المدخل غير مسجل لدينا في المنصة</span>
            </div>
          </div>

          <!-- زر الإرسال -->
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1b2d42] text-xs sm:text-sm font-bold text-white shadow-md hover:bg-solar-navy-dark active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            <span v-if="authStore.isLoading" class="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>{{ authStore.isLoading ? 'جاري الإرسال...' : 'إرسال رابط / رمز الاستعادة' }}</span>
            <ArrowLeft v-if="!authStore.isLoading" class="size-4" />
          </button>
        </form>

        <!-- التذييل: تذكرت كلمة المرور -->
        <div class="mt-8 text-center text-xs text-solar-text-body">
          <span>تذكرت كلمة المرور؟ </span>
          <NuxtLink
            to="/auth/login"
            class="font-black text-solar-navy hover:text-solar-yellow transition-colors underline decoration-solar-yellow/50 underline-offset-4"
          >
            العودة لتسجيل الدخول
          </NuxtLink>
        </div>
      </div>

      <!-- 2. حالة نجاح الإرسال المطابقة تماماً لـ "استعادة كلمة المرور نجاح الأرسال.png" -->
      <div v-else class="flex flex-col items-center text-center animate-in fade-in duration-300">
        <!-- أيقونة المغلف الأخضر الدائري -->
        <div class="mb-5 flex size-20 items-center justify-center rounded-full bg-[#EAF7EE] text-emerald-600 shadow-xs">
          <Mail class="size-9 stroke-[2.2]" />
        </div>

        <h2 class="text-xl sm:text-2xl font-black text-solar-text-heading mb-2">
          تم إرسال تعليمات الاستعادة بنجاح
        </h2>

        <p class="text-xs sm:text-sm text-solar-text-muted leading-relaxed max-w-sm mb-6">
          أرسلنا رابطاً مؤقتاً ورمز تحقق لإعادة تعيين كلمة المرور إلى البريد الإلكتروني / الجوال:
          <span class="font-bold text-solar-navy-dark dir-ltr inline-block mx-1">{{ maskedLogin }}</span>.
          الرابط صالح لمدة 15 دقيقة.
        </p>

        <!-- صندوق إعادة الإرسال الأزرق الفاتح -->
        <div class="w-full rounded-2xl bg-[#EEF4FB] p-5 mb-6 flex flex-col items-center gap-1.5 text-xs text-solar-text-body">
          <span class="text-solar-text-muted">لم يصلك الرمز؟</span>
          <span v-if="countdownSeconds > 0" class="font-bold text-solar-navy-dark">
            يمكنك طلب إعادة الإرسال خلال ({{ formattedTimer }})
          </span>
          <button
            type="button"
            @click="handleResend"
            class="font-black text-amber-500 hover:text-amber-600 transition-colors mt-1 select-none cursor-pointer"
            :class="{ 'opacity-50 cursor-not-allowed': countdownSeconds > 0 }"
          >
            إعادة إرسال الرابط / الرمز الآن
          </button>
        </div>

        <!-- زر العودة لتسجيل الدخول الداكن -->
        <NuxtLink
          to="/auth/login"
          class="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1b2d42] text-xs sm:text-sm font-bold text-white shadow-md hover:bg-solar-navy-dark active:scale-[0.99] transition-all cursor-pointer"
        >
          <span>العودة لتسجيل الدخول</span>
          <ArrowLeft class="size-4" />
        </NuxtLink>

        <!-- رابط المساعدة والتواصل مع الدعم الفني -->
        <div class="mt-8 border-t border-solar-border-card/60 pt-5 text-center text-xs text-solar-text-muted flex items-center justify-center gap-1.5">
          <HelpCircle class="size-4 text-solar-navy" />
          <span>تحتاج إلى مساعدة إضافية؟ </span>
          <NuxtLink to="/about" class="font-bold text-solar-navy hover:text-solar-yellow transition-colors underline">
            تواصل مع الدعم الفني
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
