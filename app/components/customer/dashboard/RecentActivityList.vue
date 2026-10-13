<script setup lang="ts">
import RecentActivityItem from './RecentActivityItem.vue'
import type { RecentActivity } from '~~/types/dashboard'
defineProps<{ activities: RecentActivity[] }>()
</script>

<template>
  <ul class="divide-y divide-solar-border-card overflow-hidden rounded-2xl border border-solar-border-card bg-white p-2 shadow-sm">
    <RecentActivityItem v-for="activity in activities" :key="activity.id" :activity="activity" />
  </ul>
</template>
