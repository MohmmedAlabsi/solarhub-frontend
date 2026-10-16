<script setup lang="ts">
const emit = defineEmits<{ (e: 'unavailable', label: string): void }>()
</script>

<template>
  <footer class="mt-auto border-t border-solar-border-card bg-white px-4 py-4 text-xs text-solar-text-muted sm:px-8">
    <div class="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <div class="flex items-center gap-2">
        <p>© 2025 منصة Solar Hub للحلول والطاقة المتجددة. جميع الحقوق محفوظة.</p>
        <span class="hidden sm:inline text-solar-border-card">|</span>
        <span class="hidden sm:inline font-semibold text-solar-text-body">لوحة تحكم المشرف v2.4</span>
      </div>

      <nav class="flex flex-wrap items-center justify-center gap-4 sm:gap-6" aria-label="روابط تذييل الإدارة">
        <NuxtLink to="/terms" class="transition-colors hover:text-solar-yellow">شروط الاستخدام</NuxtLink>
        <NuxtLink to="/privacy" class="transition-colors hover:text-solar-yellow">سياسة الخصوصية</NuxtLink>
        <button type="button" class="transition-colors hover:text-solar-yellow" @click="emit('unavailable', 'الدعم الفني المباشر')">
          الدعم الفني المباشر
        </button>
      </nav>
    </div>
  </footer>
</template>
