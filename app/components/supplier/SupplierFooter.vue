<script setup lang="ts">
const emit = defineEmits<{ (e: 'unavailable', label: string): void }>()
</script>

<template>
  <footer class="mt-auto border-t border-solar-navy-light/30 bg-solar-navy px-6 py-4 text-xs text-white/70">
    <div class="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p>© 2025 سولار هب (Solar Hub) - بوابة الموردين والمتاجر المعتمدة.</p>
      <nav class="flex flex-wrap items-center justify-center gap-3 sm:gap-6" aria-label="روابط التذييل">
        <NuxtLink to="/terms" class="transition-colors hover:text-solar-yellow">شروط التجارة والتوريد</NuxtLink>
        <NuxtLink to="/privacy" class="transition-colors hover:text-solar-yellow">سياسة الخصوصية</NuxtLink>
        <button type="button" class="transition-colors hover:text-solar-yellow cursor-pointer" @click="emit('unavailable', 'مركز مساعدة ودعم الموردين')">
          دعم الموردين
        </button>
      </nav>
    </div>
  </footer>
</template>
