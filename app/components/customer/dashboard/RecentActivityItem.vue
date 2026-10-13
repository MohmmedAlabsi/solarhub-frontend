<script setup lang="ts">
import { ChevronLeft, FileBadge, Truck, UsersRound } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { RecentActivity } from '~~/types/dashboard'

const props = defineProps<{ activity: RecentActivity }>()
const icons: Record<RecentActivity['icon'], Component> = { delivery: Truck, quote: FileBadge, engineering: UsersRound }
const iconTone: Record<RecentActivity['statusTone'], string> = { blue: 'bg-solar-status-info-bg text-solar-status-info-text', yellow: 'bg-solar-status-warning-bg text-solar-status-warning-text', orange: 'bg-orange-100 text-orange-700' }
const badgeTone: Record<RecentActivity['statusTone'], string> = { blue: 'bg-solar-status-info-bg text-solar-status-info-text', yellow: 'bg-solar-status-warning-bg text-solar-status-warning-text', orange: 'bg-orange-100 text-orange-700' }
</script>

<template>
  <li class="grid gap-3 rounded-xl px-4 py-4 transition-colors hover:bg-solar-bg-subtle/50 sm:grid-cols-[auto_1fr_auto] sm:items-center">
    <span class="flex size-10 items-center justify-center rounded-xl" :class="iconTone[activity.statusTone]">
      <component :is="icons[props.activity.icon]" class="size-5" aria-hidden="true" />
    </span>
    <div class="min-w-0">
      <div class="flex flex-wrap items-center gap-2">
        <p class="text-xs font-bold leading-6 text-solar-text-heading">{{ activity.title }}</p>
        <span class="rounded-full px-2.5 py-1 text-[10px]" :class="badgeTone[activity.statusTone]">{{ activity.status }}</span>
      </div>
      <p class="mt-0.5 text-[11px] text-solar-text-muted">{{ activity.time }}</p>
    </div>
    <NuxtLink :to="activity.destination" class="flex items-center gap-1 justify-self-start text-xs font-bold text-solar-text-body hover:text-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow sm:justify-self-end">
      عرض التفاصيل <ChevronLeft class="size-3.5" aria-hidden="true" />
    </NuxtLink>
  </li>
</template>
