<script setup lang="ts">
import type { CustomerNotificationTab } from '../../../../types/customer-notification'
import { Bell, Inbox, Send } from 'lucide-vue-next'

defineProps<{ activeTab: CustomerNotificationTab; totalCount: number; sentCount: number; unreadCount: number }>()
defineEmits<{ select: [tab: CustomerNotificationTab] }>()
const tabs: Array<{ id: CustomerNotificationTab; label: string }> = [
  { id: 'inbox', label: 'الواردة' },
  { id: 'sent', label: 'الصادرة' },
  { id: 'unread', label: 'غير المقروءة' },
]
</script>

<template>
  <nav class="flex flex-wrap items-center gap-2" aria-label="تصنيف الإشعارات">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      class="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow focus-visible:ring-offset-2 cursor-pointer"
      :class="activeTab === tab.id
        ? 'bg-solar-yellow text-solar-navy-dark font-black shadow-sm'
        : 'bg-solar-bg-card border border-solar-border-card text-solar-text-body hover:bg-solar-bg-subtle hover:text-solar-text-heading'"
      :aria-current="activeTab === tab.id ? 'page' : undefined"
      @click="$emit('select', tab.id)"
    >
      <component :is="tab.id === 'inbox' ? Inbox : tab.id === 'sent' ? Send : Bell" class="size-4 shrink-0" aria-hidden="true" />
      <span>{{ tab.label }}</span>
      <span
        class="flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] transition-colors duration-200 font-bold"
        :class="activeTab === tab.id ? 'bg-solar-navy-dark/15 text-solar-navy-dark' : 'bg-solar-bg-subtle text-solar-text-heading border border-solar-border-card'"
      >{{ tab.id === 'inbox' ? totalCount : tab.id === 'sent' ? sentCount : unreadCount }}</span>
    </button>
  </nav>
</template>
