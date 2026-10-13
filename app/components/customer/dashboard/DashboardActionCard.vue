<script setup lang="ts">
import { Archive, BriefcaseBusiness, FileBadge, ShoppingBag } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { DashboardAction } from '~~/types/dashboard'

const props = defineProps<{ action: DashboardAction }>()
const icons: Record<DashboardAction['icon'], Component> = {
  products: Archive,
  service: BriefcaseBusiness,
  quotes: FileBadge,
  orders: ShoppingBag,
}
</script>

<template>
  <article class="flex min-h-48 flex-col items-center rounded-2xl border border-solar-border-card bg-white px-5 py-5 text-center shadow-sm transition-all hover:border-solar-yellow/60 hover:shadow-hover">
    <span class="mb-2 flex size-11 items-center justify-center rounded-xl bg-solar-status-info-bg text-solar-navy">
      <component :is="icons[props.action.icon]" class="size-5" aria-hidden="true" />
    </span>
    <h2 class="text-base font-bold text-solar-text-heading">{{ action.title }}</h2>
    <p class="mt-1 max-w-52 text-xs leading-6 text-solar-text-muted">{{ action.description }}</p>
    <NuxtLink
      :to="action.destination"
      class="mt-auto w-full rounded-lg px-4 py-2 text-xs font-bold transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow focus-visible:ring-offset-2"
      :class="action.tone === 'yellow' ? 'bg-solar-yellow text-solar-navy-dark hover:bg-solar-yellow-hover' : 'bg-solar-navy-dark text-white hover:bg-solar-navy-hover'"
    >
      {{ action.buttonLabel }}
    </NuxtLink>
  </article>
</template>
