<script setup lang="ts">
import { Plus } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'add'): void
}>()
</script>

<template>
  <div class="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-solar-border-card bg-white p-6 text-center transition-all duration-200 hover:border-solar-yellow hover:bg-solar-bg-subtle/30 shadow-card">
    <!-- أيقونة الإضافة الدائرية -->
    <button
      type="button"
      class="flex size-14 items-center justify-center rounded-full bg-solar-bg-subtle text-solar-navy-dark transition-all duration-200 hover:scale-110 hover:bg-solar-yellow hover:text-solar-navy-dark shadow-sm"
      aria-label="إضافة نموذج عمل جديد"
      @click="emit('add')"
    >
      <Plus class="size-6 stroke-[2.5]" />
    </button>

    <!-- النصوص -->
    <h3 class="mt-4 text-base font-bold text-solar-text-heading">
      إضافة نموذج عمل جديد
    </h3>
    <p class="mt-2 max-w-[240px] text-xs leading-relaxed text-solar-text-muted">
      أرفق مشاريعك السابقة المعتمدة لزيادة فرص استقطاب العملاء والمطورين
    </p>

    <!-- زر بدء الرفع -->
    <button
      type="button"
      class="mt-6 rounded-lg border border-solar-border-card bg-white px-5 py-2 text-xs font-bold text-solar-text-heading shadow-xs transition-all hover:border-solar-yellow hover:bg-solar-yellow hover:text-solar-navy-dark active:scale-95"
      @click="emit('add')"
    >
      بدء الرفع الآن
    </button>
  </div>
</template>
