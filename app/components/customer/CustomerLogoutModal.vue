<script setup lang="ts">
import { AlertCircle, Loader2, LogOut } from 'lucide-vue-next'
import AdminModal from '../admin/common/AdminModal.vue'

const { isOpen, isLoggingOut, closeLogoutModal, confirmLogout } = useCustomerLogoutModal()
</script>

<template>
  <AdminModal
    v-model="isOpen"
    title="تأكيد تسجيل الخروج"
    subtitle="إنهاء جلسة حسابك الحالية في منصة SolarHub"
    :icon="LogOut"
    max-width="md"
    :busy="isLoggingOut"
  >
    <div class="flex flex-col gap-4 text-right">
      <div class="flex items-start gap-3 rounded-xl bg-amber-50 p-4 border border-amber-200/80">
        <AlertCircle class="size-5 text-amber-600 shrink-0 mt-0.5" />
        <p class="text-xs text-amber-900 leading-relaxed font-semibold">
          هل أنت متأكد من رغبتك في تسجيل الخروج من لوحة التحكم؟ ستحتاج إلى إدخال بيانات الدخول مجدداً للوصول إلى حسابك وسلتك وطلباتك.
        </p>
      </div>

      <div class="flex items-center justify-end gap-3 pt-3 border-t border-solar-border-card mt-1">
        <button
          type="button"
          @click="closeLogoutModal"
          :disabled="isLoggingOut"
          class="btn-outline h-10 px-5 text-xs font-bold cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="button"
          @click="confirmLogout"
          :disabled="isLoggingOut"
          class="btn-primary h-10 px-6 text-xs font-bold gap-2 bg-rose-600 text-white hover:bg-rose-700 shadow-md cursor-pointer disabled:opacity-50"
        >
          <Loader2 v-if="isLoggingOut" class="size-4 animate-spin" />
          <LogOut v-else class="size-4" />
          <span>{{ isLoggingOut ? 'جارٍ تسجيل الخروج...' : 'تأكيد تسجيل الخروج' }}</span>
        </button>
      </div>
    </div>
  </AdminModal>
</template>
