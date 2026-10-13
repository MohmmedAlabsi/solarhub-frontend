<script setup lang="ts">
import RecentActivityItem from './RecentActivityItem.vue'
import type { RecentActivity } from '../../../types/dashboard'
defineProps<{ activities: RecentActivity[] }>()
const emit = defineEmits<{ details: [activity: RecentActivity] }>()
</script>
<template><ul class="divide-y divide-[#dfe7ef] overflow-hidden rounded-xl border border-[#dfe3ea] bg-white"><RecentActivityItem v-for="activity in activities" :key="activity.id" :activity="activity" @details="emit('details', $event)" /></ul></template>

