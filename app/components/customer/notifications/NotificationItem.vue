<script setup lang="ts">
import { ArrowLeft, Clock, CloudDownload, Download, FileText, ReceiptText, Send, Truck, UsersRound } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { CustomerNotificationItem, CustomerNotificationCategory } from '../../../../types/customer-notification'

defineProps<{ notification: CustomerNotificationItem }>()
defineEmits<{ activate: [notification: CustomerNotificationItem] }>()
const categories: Record<CustomerNotificationCategory, { label: string; icon: Component; iconClass: string; badgeClass: string; dotClass: string }> = {
  quote: { label: 'طلب سعر', icon: Send, iconClass: 'bg-solar-status-info-bg text-solar-navy-dark', badgeClass: 'bg-solar-status-info-bg text-solar-navy-dark', dotClass: '' },
  consultation: { label: 'استشارة هندسية', icon: UsersRound, iconClass: 'bg-amber-50 text-solar-status-warning-text', badgeClass: 'bg-amber-50 text-solar-status-warning-text', dotClass: '' },
  shipping: { label: 'تحديث الشحن', icon: Truck, iconClass: 'bg-indigo-100 text-solar-navy-dark', badgeClass: 'bg-solar-status-info-bg text-solar-navy-dark', dotClass: 'bg-solar-navy ring-slate-100' },
  engineering: { label: 'عرض هندسي', icon: UsersRound, iconClass: 'bg-amber-50 text-solar-status-warning-text', badgeClass: 'bg-amber-50 text-solar-status-warning-text', dotClass: 'bg-solar-yellow ring-amber-100' },
  financial: { label: 'توثيق مالي', icon: ReceiptText, iconClass: 'bg-emerald-50 text-emerald-700', badgeClass: 'bg-emerald-50 text-emerald-700', dotClass: 'bg-emerald-400 ring-emerald-100' },
  building: { label: 'كود البناء', icon: FileText, iconClass: 'bg-solar-status-info-bg text-slate-600', badgeClass: 'bg-solar-status-info-bg text-slate-600', dotClass: 'bg-solar-navy ring-slate-100' },
}
</script>

<template>
  <li class="solar-card flex min-w-0 flex-col gap-3 p-5 sm:flex-row sm:items-start sm:gap-5 sm:p-6" :class="notification.direction === 'inbox' && notification.isRead ? 'bg-white/75' : 'bg-white'">
    <span class="flex size-12 shrink-0 items-center justify-center rounded-xl" :class="categories[notification.category].iconClass"><component :is="categories[notification.category].icon" class="size-6" aria-hidden="true" /></span>
    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-2"><span class="rounded-full px-2.5 py-1 text-[10px]" :class="categories[notification.category].badgeClass">{{ categories[notification.category].label }}</span><h2 class="text-base font-extrabold leading-7" :class="notification.direction === 'inbox' && notification.isRead ? 'text-solar-navy' : 'text-solar-text-heading'">{{ notification.title }}</h2></div>
      <p class="mt-2 text-xs leading-7 text-solar-text-muted">{{ notification.description }}</p>
      <div class="mt-3">
        <NuxtLink v-if="'destination' in notification.action" :to="notification.action.destination" class="inline-flex items-center gap-2 rounded-lg px-1 py-1 text-sm font-bold text-solar-text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow hover:underline" @click="$emit('activate', notification)">{{ notification.action.label }}<ArrowLeft v-if="notification.direction === 'sent'" class="size-4" aria-hidden="true" /><CloudDownload v-else class="size-4" aria-hidden="true" /></NuxtLink>
        <button v-else type="button" class="inline-flex items-center gap-2 rounded-lg py-1 text-solar-text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow" :class="notification.category === 'building' ? 'bg-solar-status-info-bg px-3 text-xs font-bold' : 'px-1 text-sm font-bold'" @click="$emit('activate', notification)">{{ notification.action.label }}<ArrowLeft v-if="notification.direction === 'sent'" class="size-4" aria-hidden="true" /><Download v-else-if="notification.category === 'building'" class="size-3.5" aria-hidden="true" /><CloudDownload v-else class="size-4" aria-hidden="true" /></button>
      </div>
    </div>
    <div class="flex shrink-0 items-center gap-3 text-[10px] text-solar-text-muted sm:flex-row-reverse sm:pt-1"><template v-if="notification.direction === 'inbox'"><span v-if="!notification.isRead" class="size-2 shrink-0 rounded-full ring-4" :class="categories[notification.category].dotClass" role="img" aria-label="غير مقروء" /><span v-else class="sr-only">مقروء</span></template><span class="inline-flex items-center gap-1"><Clock class="size-3" aria-hidden="true" />{{ notification.timeLabel }}</span></div>
  </li>
</template>
