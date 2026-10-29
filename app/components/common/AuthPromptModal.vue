<script setup lang="ts">
import { Lock, LogIn, UserPlus, X } from 'lucide-vue-next'
import { useAuthModal } from '~~/app/composables/useAuthModal'

const { isOpen, title, message, close } = useAuthModal()

function handleLogin() {
  close()
  navigateTo('/auth/login')
}

function handleRegister() {
  close()
  navigateTo('/auth/register')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <!-- خلفية معتمة -->
        <div
          class="fixed inset-0 bg-solar-navy-dark/70 backdrop-blur-sm transition-opacity"
          @click="close"
        />

        <!-- نافذة المودال المطابقة لتصميم visitor_9.png -->
        <div class="relative w-full max-w-sm rounded-3xl bg-solar-bg-card p-6 sm:p-7 shadow-2xl border border-solar-border-card text-center z-10">
          <!-- زر الإغلاق -->
          <button
            type="button"
            @click="close"
            class="absolute top-4 left-4 flex size-8 items-center justify-center rounded-xl bg-solar-bg-subtle text-solar-text-muted transition-colors hover:bg-solar-border-card hover:text-solar-text-heading"
            aria-label="إغلاق النافذة"
          >
            <X class="size-4" />
          </button>

          <!-- الأيقونة التنبيهية الذهبية -->
          <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-sm">
            <Lock class="size-7" />
          </div>

          <!-- العنوان والرسالة -->
          <h2 id="auth-modal-title" class="text-base sm:text-lg font-black text-solar-text-heading mb-2 leading-tight">
            {{ title }}
          </h2>
          <p class="text-xs text-solar-text-muted leading-relaxed mb-6">
            {{ message }}
          </p>

          <!-- أزرار الإجراءات -->
          <div class="flex flex-col gap-2.5">
            <button
              type="button"
              @click="handleLogin"
              class="btn-dark w-full py-2.5 text-xs font-bold gap-2 justify-center shadow-sm"
            >
              <LogIn class="size-4" />
              <span>تسجيل الدخول</span>
            </button>

            <button
              type="button"
              @click="handleRegister"
              class="btn-outline w-full py-2.5 text-xs font-bold gap-2 justify-center"
            >
              <UserPlus class="size-4" />
              <span>إنشاء حساب</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
