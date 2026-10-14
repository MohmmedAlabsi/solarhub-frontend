<script setup lang="ts">
import { ref, reactive } from 'vue'
import { User, Lock, AlertCircle } from 'lucide-vue-next'
import BaseInput from '~/components/ui/BaseInput.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import SocialAuth from '~/components/auth/SocialAuth.vue'

const form = reactive({
  identifier: '',
  password: '',
  rememberMe: false,
})

const errors = reactive({
  identifier: '',
  password: '',
  general: '',
})

const isLoading = ref(false)

const validateForm = () => {
  let isValid = true
  errors.identifier = ''
  errors.password = ''
  errors.general = ''

  if (!form.identifier.trim()) {
    errors.identifier = 'يرجى إدخال البريد الإلكتروني أو رقم الجوال'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'يرجى إدخال كلمة المرور'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'يجب ألا تقل كلمة المرور عن 6 أحرف'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true
  try {
    // Simulated authentication API call
    await new Promise((resolve) => setTimeout(resolve, 800))
    // On success, redirect to dashboard or home
    await navigateTo('/')
  } catch (err: any) {
    errors.general = 'بيانات تسجيل الدخول غير صحيحة، يرجى المحاولة مرة أخرى.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="w-full text-center" dir="rtl">
    <!-- Header Titles -->
    <div class="mb-7">
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">
        تسجيل الدخول
      </h1>
      <p class="mt-2 text-sm text-slate-500">
        أهلاً بك مجدداً في منصة حلول الطاقة الشمسية
      </p>
    </div>

    <!-- General Error Banner if needed -->
    <div
      v-if="errors.general"
      class="mb-5 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-right text-xs font-medium text-rose-700"
    >
      <AlertCircle class="size-4 shrink-0 text-rose-500" />
      <span>{{ errors.general }}</span>
    </div>

    <!-- Login Form -->
    <form class="space-y-4 text-right" @submit.prevent="handleSubmit">
      <!-- Identifier (Email / Phone) -->
      <BaseInput
        v-model="form.identifier"
        name="identifier"
        label="البريد الإلكتروني أو رقم الجوال"
        placeholder="xxxxxxxxx gl05example@domain.com"
        :error="errors.identifier"
        required
      >
        <template #trailing>
          <User class="size-5 text-slate-400" />
        </template>
      </BaseInput>

      <!-- Password Field with Forgot Password Link -->
      <BaseInput
        v-model="form.password"
        name="password"
        type="password"
        label="كلمة المرور"
        placeholder="أدخل كلمة المرور"
        :error="errors.password"
        required
      >
        <template #label-action>
          <NuxtLink
            to="/auth/forgot-password"
            class="text-xs font-medium text-slate-600 hover:text-[#24374e] transition-colors"
          >
            نسيت كلمة المرور؟
          </NuxtLink>
        </template>
      </BaseInput>

      <!-- Submit Button -->
      <div class="pt-2">
        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          block
          arrow
          :loading="isLoading"
        >
          تسجيل الدخول
        </BaseButton>
      </div>
    </form>

    <!-- Social Authentication Section -->
    <SocialAuth />

    <!-- Registration Link Footer -->
    <div class="pt-2 text-center text-sm text-slate-600">
      <span>ليس لديك حساب في سولار هب؟ </span>
      <NuxtLink
        to="/auth/register"
        class="font-bold text-[#24374e] hover:underline"
      >
        إنشاء حساب جديد
      </NuxtLink>
    </div>
  </div>
</template>
