<script setup lang="ts">
withDefaults(defineProps<{ flat?: boolean }>(), { flat: false })
const emit = defineEmits<{ (e: 'unavailable', label: string): void }>()
</script>

<template>
  <footer class="mt-auto border-t border-solar-navy-light/30 bg-solar-navy px-6 text-xs text-white/70" :class="flat ? 'min-h-12 py-3 lg:px-6' : 'py-4'">
    <div class="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p>© 2025 سولار هب (Solar Hub). جميع الحقوق محفوظة.</p>
      <nav class="flex flex-wrap items-center justify-center gap-3 sm:gap-6" aria-label="روابط التذييل">
        <NuxtLink v-if="flat" to="/terms" class="transition-colors hover:text-solar-yellow">شروط الخدمة</NuxtLink>
        <button v-else type="button" class="transition-colors hover:text-solar-yellow" @click="emit('unavailable', 'الشروط والأحكام')">الشروط والأحكام</button>
        <NuxtLink v-if="flat" to="/privacy" class="transition-colors hover:text-solar-yellow">سياسة الخصوصية</NuxtLink>
        <button v-else type="button" class="transition-colors hover:text-solar-yellow" @click="emit('unavailable', 'سياسة الخصوصية')">سياسة الخصوصية</button>
        <button type="button" class="transition-colors hover:text-solar-yellow" @click="emit('unavailable', 'الدعم الفني والضمان')">{{ flat ? 'الدعم الفني' : 'الدعم الفني والضمان' }}</button>
      </nav>
    </div>
  </footer>
</template>
