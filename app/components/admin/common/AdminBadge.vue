<script setup lang="ts">
const props = defineProps<{
  status: string
  showDot?: boolean
  tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}>()

const badgeConfig = computed(() => {
  if (props.tone) {
    const tones = {
      success: {classes:'bg-emerald-50 text-emerald-700 border-emerald-200/80',dotClass:'bg-emerald-500'},
      warning: {classes:'bg-amber-50 text-amber-700 border-amber-200/80',dotClass:'bg-amber-500'},
      danger: {classes:'bg-rose-50 text-rose-700 border-rose-200/80',dotClass:'bg-rose-500'},
      info: {classes:'bg-sky-50 text-sky-700 border-sky-200/80',dotClass:'bg-sky-500'},
      neutral: {classes:'bg-slate-100 text-slate-600 border-slate-200',dotClass:'bg-slate-400'},
    }
    return tones[props.tone]
  }
  const s = props.status.trim()
  if (s === 'مفعل' || s === 'active' || s === 'تم التسليم' || s === 'مكتمل' || s === 'تم التحقق' || s === 'تم الشحن') {
    return {
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dotClass: 'bg-emerald-500',
    }
  }
  if (s === 'قيد المعالجة' || s === 'قيد المراجعة') {
    return {
      classes: 'bg-sky-50 text-sky-700 border-sky-200/80',
      dotClass: 'bg-sky-500',
    }
  }
  if (s === 'قيد التجهيز والشحن' || s === 'قيد التجهيز' || s === 'قيد الانتظار') {
    return {
      classes: 'bg-amber-50 text-amber-700 border-amber-200/80',
      dotClass: 'bg-amber-500',
    }
  }
  if (s === 'ملغي' || s === 'مرفوض' || s === 'فشل الصرف' || s === 'inactive') {
    return {
      classes: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dotClass: 'bg-rose-500',
    }
  }
  if (s === 'معطل مؤقتاً' || s === 'مسودة') {
    return {
      classes: 'bg-slate-100 text-slate-600 border-slate-200',
      dotClass: 'bg-slate-400',
    }
  }
  return {
    classes: 'bg-slate-50 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400',
  }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none shadow-2xs select-none"
    :class="badgeConfig.classes"
  >
    <span
      v-if="showDot !== false"
      class="size-1.5 rounded-full"
      :class="badgeConfig.dotClass"
      aria-hidden="true"
    />
    <span>{{ status }}</span>
  </span>
</template>
