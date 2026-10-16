<script setup lang="ts">
import { FileText, Package, ShoppingBag, Wrench } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { DashboardAction } from '~~/types/dashboard'

const props = defineProps<{ action: DashboardAction }>()
const icons: Record<DashboardAction['icon'], Component> = {
  products: Package,
  service: Wrench,
  quotes: FileText,
  orders: ShoppingBag,
}
</script>

<template>
  <article class="solar-card flex min-h-48 flex-col items-center p-6 text-center transition-all hover:border-solar-yellow/60 sm:p-6">
    <span class="mb-4 flex size-14 items-center justify-center rounded-2xl bg-solar-bg-subtle text-solar-navy">
      <component :is="icons[props.action.icon]" class="size-6" aria-hidden="true" />
    </span>
    <h2 class="text-base font-bold text-solar-text-heading">{{ action.title }}</h2>
    <p class="mt-1 max-w-52 text-xs leading-6 text-solar-text-muted">{{ action.description }}</p>
    <NuxtLink
      :to="action.destination"
      class="mt-6 h-10 w-full text-xs"
      :class="action.tone === 'yellow' ? 'btn-primary' : 'btn-dark'"
    >
      {{ action.buttonLabel }}
    </NuxtLink>
  </article>
</template>
