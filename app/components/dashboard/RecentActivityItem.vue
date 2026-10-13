<script setup lang="ts">
import { FileBadge, Truck, UsersRound } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { RecentActivity } from '../../../types/dashboard'
const props = defineProps<{ activity: RecentActivity }>()
const emit = defineEmits<{ details: [activity: RecentActivity] }>()
const icons: Record<RecentActivity['icon'], Component> = { delivery: Truck, quote: FileBadge, engineering: UsersRound }
const iconTone: Record<RecentActivity['statusTone'], string> = { blue: 'bg-[#dff2ff] text-[#0875aa]', yellow: 'bg-[#fff0d2] text-[#785400]', orange: 'bg-[#ffead8] text-[#a74720]' }
const badgeTone: Record<RecentActivity['statusTone'], string> = { blue: 'bg-[#def3ff] text-[#397794]', yellow: 'bg-[#ffedc6] text-[#88651e]', orange: 'bg-[#ffe6ce] text-[#ae562d]' }
</script>
<template>
  <li class="grid gap-3 px-4 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-5">
    <span class="flex size-10 items-center justify-center rounded-lg" :class="iconTone[activity.statusTone]"><component :is="icons[props.activity.icon]" class="size-5" aria-hidden="true" /></span>
    <div class="min-w-0"><div class="flex flex-wrap items-center gap-2"><p class="font-semibold leading-6 text-[#142f49]">{{ activity.title }}</p><span class="rounded-full px-2.5 py-1 text-xs" :class="badgeTone[activity.statusTone]">{{ activity.status }}</span></div><p class="mt-0.5 text-xs text-[#7a7f86]">{{ activity.time }}</p></div>
    <button type="button" class="justify-self-start text-sm font-semibold text-[#254762] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f8b900] sm:justify-self-end" @click="emit('details', activity)">عرض التفاصيل ←</button>
  </li>
</template>
