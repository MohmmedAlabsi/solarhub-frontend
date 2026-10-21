<script setup lang="ts">
import { CheckCircle, ClipboardList, FileText, LayoutDashboard } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { EngineerStat } from '~~/app/composables/useEngineerDashboard'

const props = defineProps<{ stat: EngineerStat }>()

const icons: Record<EngineerStat['icon'], Component> = {
  'offers-pending':      FileText,
  'requests-available':  ClipboardList,
  'projects-done':       CheckCircle,
}

const toneClasses: Record<EngineerStat['tone'], { icon: string; count: string }> = {
  yellow: { icon: 'bg-solar-yellow/15 text-solar-navy-dark', count: 'text-solar-navy-dark' },
  blue:   { icon: 'bg-blue-100 text-blue-700',               count: 'text-blue-700' },
  green:  { icon: 'bg-emerald-100 text-emerald-700',         count: 'text-emerald-700' },
}
</script>

<template>
  <NuxtLink
    :to="stat.destination"
    class="solar-card flex flex-col gap-3 p-5 transition-all hover:border-solar-yellow/60 hover:shadow-hover active:scale-[0.99]"
    :aria-label="`${stat.label}: ${stat.count}`"
  >
    <div class="flex items-start justify-between gap-3">
      <!-- الأيقونة -->
      <span
        class="flex size-12 items-center justify-center rounded-xl shrink-0"
        :class="toneClasses[stat.tone].icon"
      >
        <component :is="icons[stat.icon]" class="size-6" aria-hidden="true" />
      </span>
      <!-- العدد -->
      <span class="text-4xl font-black leading-none" :class="toneClasses[stat.tone].count">
        {{ stat.count }}
      </span>
    </div>

    <div class="text-right">
      <p class="text-sm font-bold text-solar-text-heading leading-snug">{{ stat.label }}</p>
      <p class="mt-0.5 text-xs text-solar-text-muted">{{ stat.sublabel }}</p>
    </div>
  </NuxtLink>
</template>
