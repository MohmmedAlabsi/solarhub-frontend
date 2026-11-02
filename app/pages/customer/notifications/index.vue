<script setup lang="ts">
import { CheckCheck } from 'lucide-vue-next'
import NotificationEmptyState from '../../../components/customer/notifications/NotificationEmptyState.vue'
import NotificationLoadState from '../../../components/customer/notifications/NotificationLoadState.vue'
import NotificationItem from '../../../components/customer/notifications/NotificationItem.vue'
import NotificationOverview from '../../../components/customer/notifications/NotificationOverview.vue'
import NotificationTabs from '../../../components/customer/notifications/NotificationTabs.vue'

definePageMeta({ layout: 'customer' })
useSeoMeta({ title: 'مركز الإشعارات | SolarHub' })
const { notifications, totalCount, unreadCount, sentCount, activeTab, overview, viewState, showTabs, showReadAction, noticeMessage, selectTab, activateNotification, markAllRead, resetFilter, retryNotifications } = useNotifications()
</script>

<template>
  <div class="flex min-w-0 flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-3"><nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل"><NuxtLink to="/customer/dashboard">الرئيسية</NuxtLink><span>‹</span><span class="font-bold text-solar-text-heading">مركز الإشعارات</span></nav><button v-if="activeTab !== 'sent' && showReadAction" type="button" :disabled="!unreadCount" class="btn-dark text-xs disabled:opacity-50" @click="markAllRead"><CheckCheck class="size-4" aria-hidden="true" />تحديد الكل كمقروء</button></div>
    <NotificationOverview :summary="overview" />
    <NotificationTabs v-if="showTabs" :active-tab="activeTab" :total-count="totalCount" :unread-count="unreadCount" :sent-count="sentCount" @select="selectTab" />
    <NotificationLoadState v-if="viewState === 'loading' || viewState === 'error'" :status="viewState" @retry="retryNotifications" />
    <ul v-else-if="viewState === 'ready'" class="flex min-w-0 flex-col gap-3" :aria-label="activeTab === 'sent' ? 'الإشعارات الصادرة' : 'الإشعارات الواردة'"><NotificationItem v-for="notification in notifications" :key="notification.id" :notification="notification" @activate="activateNotification" /></ul>
    <NotificationEmptyState v-else :filtered="viewState === 'filtered-empty'" :class="viewState === 'empty' ? 'mt-4' : ''" @reset="resetFilter" />
    <p v-if="noticeMessage" class="rounded-xl bg-solar-status-info-bg p-4 text-xs leading-7 text-solar-text-heading" role="status" aria-live="polite">{{ noticeMessage }}</p>
    <p v-if="viewState !== 'empty'" class="text-[10px] text-solar-text-muted">يتم مزامنة حالة الإشعارات وتحديثها تلقائياً مع خادم منصة SolarHub.</p>
  </div>
</template>
