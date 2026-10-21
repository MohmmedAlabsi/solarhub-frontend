<script setup lang="ts">
const emit = defineEmits<{ (e: 'unavailable', label: string): void }>()
</script>

<template>
  <footer class="mt-auto border-t border-solar-navy-light/30 bg-solar-navy px-6 py-4 text-xs text-white/70">
    <div class="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p>© 2025 منصة سولار هب للطاقة الشمسية. جميع الحقوق محفوظة.</p>
      <nav class="flex flex-wrap items-center justify-center gap-3 sm:gap-6" aria-label="روابط مساعدة">
        <button type="button" class="transition-colors hover:text-solar-yellow" @click="emit('unavailable', 'شروط الخدمة للمهندسين')">
          شروط الخدمة للمهندسين
        </button>
        <button type="button" class="transition-colors hover:text-solar-yellow" @click="emit('unavailable', 'دليل الاعتماد المهني')">
          دليل الاعتماد المهني
        </button>
        <button type="button" class="transition-colors hover:text-solar-yellow" @click="emit('unavailable', 'الدعم الفني')">
          الدعم الفني
        </button>
      </nav>
    </div>
  </footer>
</template>
