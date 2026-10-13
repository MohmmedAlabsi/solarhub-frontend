<script setup lang="ts">
const emit = defineEmits<{ (e: 'unavailable', label: string): void }>()
</script>

<template>
  <footer class="mt-auto border-t border-solar-navy-light/30 bg-solar-navy py-4 px-6 text-xs text-white/70">
    <div class="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p>© 2025 سولار هب (Solar Hub). جميع الحقوق محفوظة.</p>
      <nav class="flex items-center gap-6" aria-label="روابط التذييل">
        <button type="button" class="transition-colors hover:text-solar-yellow" @click="emit('unavailable', 'الشروط والأحكام')">الشروط والأحكام</button>
        <button type="button" class="transition-colors hover:text-solar-yellow" @click="emit('unavailable', 'سياسة الخصوصية')">سياسة الخصوصية</button>
        <button type="button" class="transition-colors hover:text-solar-yellow" @click="emit('unavailable', 'الدعم الفني والضمان')">الدعم الفني والضمان</button>
      </nav>
    </div>
  </footer>
</template>
