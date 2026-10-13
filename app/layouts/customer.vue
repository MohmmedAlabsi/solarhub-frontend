<script setup lang="ts">
import AppToast from '../components/common/AppToast.vue'
import CustomerFooter from '../components/layout/CustomerFooter.vue'
import CustomerHeader from '../components/layout/CustomerHeader.vue'
import CustomerSidebar from '../components/layout/CustomerSidebar.vue'
const sidebarOpen = ref(false)
const message = ref('')
let timeoutId: ReturnType<typeof setTimeout> | undefined
const notify = (label: string) => {
  message.value = label === 'تسجيل الخروج' ? 'تسجيل الخروج غير متاح قبل ربط نظام المصادقة.' : `${label} — ستتوفر هذه الصفحة لاحقًا.`
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(() => { message.value = '' }, 3500)
}
onBeforeUnmount(() => { if (timeoutId) clearTimeout(timeoutId) })
</script>
<template>
  <div class="min-h-screen bg-[#f7f8fd] text-[#142f49]" dir="rtl">
    <div class="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
      <CustomerSidebar :open="sidebarOpen" @close="sidebarOpen = false" @unavailable="notify" />
      <div class="flex min-w-0 flex-col"><CustomerHeader @menu="sidebarOpen = true" @unavailable="notify" /><main class="flex-1"><slot /></main><CustomerFooter @unavailable="notify" /></div>
    </div>
    <AppToast :message="message" />
  </div>
</template>

