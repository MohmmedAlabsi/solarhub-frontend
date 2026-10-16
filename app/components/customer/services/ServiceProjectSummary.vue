<script setup lang="ts">
import { FileText, MapPin, SolarPanel, Wrench } from 'lucide-vue-next'
import type { ServiceProject } from '../../../../types/service-request'
import ServiceProjectFile from './ServiceProjectFile.vue'
defineProps<{ project: ServiceProject; statusLabel: string; awarded: boolean }>()
</script>

<template>
  <section class="min-w-0 solar-card p-5 sm:p-8" aria-labelledby="project-title">
    <div class="flex flex-wrap items-center justify-between gap-3 text-xs">
      <div class="flex flex-wrap items-center gap-3"><span class="rounded-lg bg-solar-status-info-bg px-3 py-2 font-mono font-bold text-solar-text-heading">#{{ project.id }}</span><span class="text-[11px] text-solar-text-muted">تم النشر: {{ project.publishedLabel }}</span></div>
      <span class="rounded-full px-3 py-2 text-[11px] font-bold" :class="awarded ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'">● {{ statusLabel }} ({{ project.offers.length }} عروض مقدمة)</span>
    </div>
    <h2 id="project-title" class="mt-5 text-xl font-extrabold leading-relaxed text-solar-text-heading sm:text-2xl">{{ project.title }}</h2>
    <div class="mt-7 grid gap-4 md:grid-cols-3">
      <div class="flex items-center gap-3 rounded-xl bg-solar-status-info-bg/80 p-4"><Wrench class="size-10 shrink-0 rounded-lg bg-slate-200 p-2 text-solar-navy" aria-hidden="true" /><p class="text-xs"><span class="block text-solar-text-muted">نوع الخدمة المطلوبة</span><strong class="mt-1 block text-solar-text-heading">{{ project.serviceLabel }}</strong></p></div>
      <div class="flex items-center gap-3 rounded-xl bg-solar-status-info-bg/80 p-4"><MapPin class="size-10 shrink-0 rounded-lg bg-slate-200 p-2 text-solar-navy" aria-hidden="true" /><p class="text-xs"><span class="block text-solar-text-muted">المحافظة / الموقع</span><strong class="mt-1 block text-solar-text-heading">{{ project.region }} - {{ project.location }}</strong></p></div>
      <div class="flex items-center gap-3 rounded-xl bg-solar-status-info-bg/80 p-4"><SolarPanel class="size-10 shrink-0 rounded-lg bg-amber-100 p-2 text-amber-800" aria-hidden="true" /><p class="text-xs"><span class="block text-solar-text-muted">السعة التقديرية المقترحة</span><strong class="mt-1 block text-solar-text-heading">{{ project.capacity }}</strong></p></div>
    </div>
    <div class="mt-6 rounded-xl bg-solar-bg-page p-5"><h3 class="flex items-center gap-1 text-xs font-bold text-solar-text-heading"><FileText class="size-4" aria-hidden="true" />تفاصيل واحتياج المشروع</h3><p class="mt-2 text-sm leading-7 text-solar-text-muted">{{ project.description }}</p></div>
    <div class="mt-7 flex min-w-0 flex-wrap items-start gap-3"><h3 class="py-2 text-xs font-bold text-solar-text-body">المرفقات والملفات:</h3><ServiceProjectFile v-for="attachment in project.attachments" :key="attachment.id" :attachment="attachment" /><p v-if="!project.attachments.length" class="py-2 text-xs text-solar-text-muted">لا توجد مرفقات لهذا المشروع.</p></div>
  </section>
</template>
