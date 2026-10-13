<script setup lang="ts">
import { Archive, BriefcaseBusiness, FileBadge, ShoppingBag } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { DashboardAction } from '../../../types/dashboard'
const props = defineProps<{ action: DashboardAction }>()
const emit = defineEmits<{ select: [action: DashboardAction] }>()
const icons: Record<DashboardAction['icon'], Component> = { products: Archive, service: BriefcaseBusiness, quotes: FileBadge, orders: ShoppingBag }
</script>
<template>
  <article class="flex min-h-48 flex-col items-center rounded-xl border border-[#dfe3ea] bg-white px-5 py-5 text-center">
    <span class="mb-1 flex size-11 items-center justify-center rounded-lg bg-[#e8efff] text-[#17324d]"><component :is="icons[props.action.icon]" class="size-5" aria-hidden="true" /></span>
    <h2 class="text-lg font-bold text-[#112c47]">{{ action.title }}</h2>
    <p class="mt-1 max-w-52 text-sm leading-6 text-[#6d6d72]">{{ action.description }}</p>
    <button type="button" class="mt-auto w-full rounded-lg px-4 py-2 text-sm font-semibold transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f8b900] focus-visible:ring-offset-2" :class="action.tone === 'yellow' ? 'bg-[#fdbb00] text-[#102a43]' : 'bg-[#203e59] text-white'" @click="emit('select', action)">{{ action.buttonLabel }}</button>
  </article>
</template>
