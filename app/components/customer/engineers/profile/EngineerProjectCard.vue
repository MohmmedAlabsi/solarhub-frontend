<script setup lang="ts">
import { BadgeCheck, MapPin } from 'lucide-vue-next'
import type { EngineerProject } from '../../../../../types/engineer'

defineProps<{ project: EngineerProject }>()
</script>

<template>
  <article class="overflow-hidden rounded-2xl border border-solar-border-card bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div class="relative bg-solar-bg-subtle">
      <img :src="project.image" :alt="`صورة مشروع ${project.title}`" width="720" height="360" loading="lazy" class="aspect-[2/1] w-full object-cover" />
      <span class="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-2 text-[10px] font-bold text-white shadow"><BadgeCheck class="size-3.5" aria-hidden="true" /> {{ project.statusLabel }}</span>
      <span class="absolute bottom-3 left-3 rounded-lg bg-white px-3 py-2 text-[10px] font-extrabold text-solar-navy shadow" dir="ltr">{{ project.capacityLabel }}</span>
    </div>
    <div class="p-5">
      <h3 class="text-base font-extrabold text-solar-text-heading">{{ project.title }}</h3>
      <p class="mt-2 min-h-12 text-xs leading-6 text-solar-text-body">{{ project.description }}</p>
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-solar-border-card pt-3 text-[11px] text-solar-text-muted">
        <span class="inline-flex items-center gap-1"><MapPin class="size-3.5" aria-hidden="true" /> {{ project.location }}</span>
        <span class="rounded-md bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">تم الإنجاز {{ project.completionYear }}</span>
      </div>
    </div>
  </article>
</template>
