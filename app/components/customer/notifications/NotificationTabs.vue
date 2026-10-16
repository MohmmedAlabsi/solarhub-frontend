<script setup lang="ts">
import type { CustomerNotificationTab } from '../../../../types/customer-notification'
import { Inbox, Mail, Send } from 'lucide-vue-next'
const props = defineProps<{ activeTab: CustomerNotificationTab; totalCount: number; sentCount: number; unreadCount: number }>()
defineEmits<{ select: [tab: CustomerNotificationTab] }>()
const tabs: Array<{ id: CustomerNotificationTab; label: string }> = [{ id: 'inbox', label: 'الواردة' }, { id: 'sent', label: 'الصادرة' }, { id: 'unread', label: 'غير المقروءة' }]
const orderedTabs = computed(() => props.activeTab === 'sent' ? [tabs[1]!, tabs[0]!, tabs[2]!] : tabs)
</script>

<template>
  <nav class="flex flex-wrap gap-2" aria-label="تصنيف الإشعارات">
    <button v-for="tab in orderedTabs" :key="tab.id" type="button" class="inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow" :class="activeTab === tab.id ? 'bg-solar-navy font-bold text-white' : 'bg-white text-solar-text-body shadow-sm hover:bg-solar-status-info-bg'" :aria-current="activeTab === tab.id ? 'page' : undefined" @click="$emit('select', tab.id)"><component :is="tab.id === 'sent' ? Send : tab.id === 'inbox' ? Inbox : Mail" v-if="activeTab === 'sent'" class="size-4" aria-hidden="true" />{{ tab.label }}<span class="flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px]" :class="activeTab === tab.id ? (tab.id === 'sent' ? 'bg-solar-yellow text-solar-navy-dark' : 'bg-solar-navy-dark text-white') : 'bg-solar-status-info-bg text-solar-text-heading'">{{ tab.id === 'inbox' ? totalCount : tab.id === 'sent' ? sentCount : unreadCount }}</span></button>
  </nav>
</template>
