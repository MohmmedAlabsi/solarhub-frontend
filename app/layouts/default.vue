<script setup lang="ts">
import AuthPromptModal from '~~/app/components/common/AuthPromptModal.vue'
</script>

<template>
  <div dir="rtl" class="flex min-h-screen flex-col bg-solar-bg-page text-solar-text-heading antialiased selection:bg-solar-yellow selection:text-solar-navy-dark">
    <!-- رأس صفحة الزائر الرئيسي -->
    <LayoutNavbar />

    <!-- المحتوى الفعلي للصفحة -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- تذييل الصفحة الموحد للزوار -->
    <LayoutFooter />

    <!-- نافذة تسجيل الدخول المشروطة (AuthPromptModal) لطلب الأسعار والاستشارات -->
    <AuthPromptModal />
  </div>
</template>
