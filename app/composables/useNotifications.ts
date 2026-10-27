import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import type {
  CustomerNotification,
  CustomerNotificationItem,
  SentCustomerNotification,
  CustomerNotificationMailbox,
  CustomerNotificationCategory,
  CustomerNotificationTab,
  NotificationOverviewSummary,
  NotificationLoadStatus,
  NotificationPreviewMode,
  NotificationViewState,
} from '../../types/customer-notification'

function mapCategory(type?: string, title?: string): CustomerNotificationCategory {
  const t = (type || '').toLowerCase()
  const tit = (title || '').toLowerCase()
  if (t.includes('ship') || t.includes('order') || tit.includes('شحن') || tit.includes('طلب رقم') || tit.includes('شحنتك')) return 'shipping'
  if (t.includes('quote') || tit.includes('عرض سعر') || tit.includes('تسعير')) return 'quote'
  if (t.includes('service') || t.includes('offer') || t.includes('engineer') || tit.includes('هندسي') || tit.includes('خدمة') || tit.includes('استشارة')) return 'engineering'
  if (t.includes('payment') || t.includes('invoice') || t.includes('wallet') || tit.includes('دفع') || tit.includes('فاتورة') || tit.includes('محفظة')) return 'financial'
  if (tit.includes('كود') || tit.includes('بناء') || tit.includes('تقرير')) return 'building'
  return 'quote'
}

function formatArabicRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return 'الآن'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const now = new Date()
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diffSec < 60) return 'الآن'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `منذ ${diffHours} ساعة`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'أمس'
  if (diffDays < 7) return `منذ ${diffDays} أيام`
  return date.toLocaleDateString('ar-YE', { month: 'short', day: 'numeric' })
}

function mapApiNotification(item: any, direction: 'inbox' | 'sent'): CustomerNotificationItem {
  const category = mapCategory(item.type, item.title)
  const actionDestination = item.action_url || (item.data && item.data.action_url) || null
  const base = {
    id: String(item.id),
    category,
    title: item.title || (direction === 'sent' ? 'إشعار صادر' : 'إشعار جديد'),
    description: item.body || item.description || '',
    timeLabel: formatArabicRelativeTime(item.created_at),
    action: actionDestination
      ? { label: 'عرض التفاصيل', destination: actionDestination }
      : { label: 'معاينة', unavailableMessage: 'لا توجد إجراءات إضافية متاحة لهذا الإشعار.' },
  }

  if (direction === 'inbox') {
    return {
      ...base,
      direction: 'inbox',
      isRead: Boolean(item.is_read || item.read_at),
    } as CustomerNotification
  } else {
    return {
      ...base,
      direction: 'sent',
      status: 'sent',
    } as SentCustomerNotification
  }
}

export function useNotificationState() {
  const route = useRoute()
  const { $api } = useNuxtApp()
  const mailbox = useState<CustomerNotificationMailbox>('customer-notification-mailbox', () => ({
    sent: [],
    inbox: [],
  }))
  const isFetching = useState<boolean>('customer-notifications-fetching', () => false)
  const hasLoaded = useState<boolean>('customer-notifications-loaded', () => false)

  const previewMode = computed<NotificationPreviewMode | undefined>(() => {
    if (!import.meta.dev) return undefined
    const value = Array.isArray(route.query.notificationPreview) ? route.query.notificationPreview[0] : route.query.notificationPreview
    return value === 'empty' || value === 'empty-inbox' || value === 'empty-sent' || value === 'loading' || value === 'error' ? value : undefined
  })

  const effectiveMailbox = computed<CustomerNotificationMailbox>(() => ({
    inbox: previewMode.value === 'empty' || previewMode.value === 'empty-inbox' ? [] : mailbox.value.inbox,
    sent: previewMode.value === 'empty' || previewMode.value === 'empty-sent' ? [] : mailbox.value.sent,
  }))

  const totalCount = computed(() => effectiveMailbox.value.inbox.length)
  const unreadCount = computed(() => effectiveMailbox.value.inbox.filter(item => !item.isRead).length)
  const sentCount = computed(() => effectiveMailbox.value.sent.length)
  const pendingSentCount = computed(() => effectiveMailbox.value.sent.filter(item => item.status === 'pending').length)

  async function fetchNotifications(force = false) {
    if (isFetching.value) return
    if (hasLoaded.value && !force) return
    isFetching.value = true

    try {
      const [inboxRes, outboxRes] = await Promise.allSettled([
        $api<any>('/my/notifications/inbox?per_page=50'),
        $api<any>('/my/notifications/outbox?per_page=50'),
      ])

      if (inboxRes.status === 'fulfilled' && inboxRes.value) {
        const raw = inboxRes.value
        const items = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []
        mailbox.value.inbox = items.map((item: any) => mapApiNotification(item, 'inbox') as CustomerNotification)
      }

      if (outboxRes.status === 'fulfilled' && outboxRes.value) {
        const raw = outboxRes.value
        const items = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []
        mailbox.value.sent = items.map((item: any) => mapApiNotification(item, 'sent') as SentCustomerNotification)
      }

      hasLoaded.value = true
    } catch (err) {
      console.warn('Failed to load notifications from API:', err)
    } finally {
      isFetching.value = false
    }
  }

  async function markRead(id: CustomerNotification['id']) {
    const item = mailbox.value.inbox.find(item => item.id === id)
    if (item && !item.isRead) {
      item.isRead = true
      try {
        await $api(`/my/notifications/${id}/read`, { method: 'PATCH' })
      } catch (err) {
        console.warn(`Failed to mark notification #${id} as read on server:`, err)
      }
    }
  }

  async function markAllRead() {
    let unreadFound = false
    for (const item of mailbox.value.inbox) {
      if (!item.isRead) {
        item.isRead = true
        unreadFound = true
      }
    }
    if (unreadFound) {
      try {
        await $api('/my/notifications/read-all', { method: 'PATCH' })
      } catch (err) {
        console.warn('Failed to mark all notifications as read on server:', err)
      }
    }
  }

  return {
    mailbox,
    effectiveMailbox,
    previewMode,
    totalCount,
    unreadCount,
    sentCount,
    pendingSentCount,
    isFetching,
    hasLoaded,
    fetchNotifications,
    markRead,
    markAllRead,
  }
}

export function useNotifications() {
  const route = useRoute()
  const state = useNotificationState()
  const noticeMessage = ref('')
  let noticeTimer: ReturnType<typeof setTimeout> | undefined

  const activeTab = computed<CustomerNotificationTab>(() => {
    const tab = Array.isArray(route.query.tab) ? route.query.tab[0] : route.query.tab
    return tab === 'sent' || tab === 'unread' ? tab : 'inbox'
  })

  const requestStatus = ref<NotificationLoadStatus>('success')

  const loadStatus = computed<NotificationLoadStatus>(() => {
    if (state.previewMode.value === 'loading' || state.previewMode.value === 'error') {
      return state.previewMode.value
    }
    if (state.isFetching.value && !state.hasLoaded.value) {
      return 'loading'
    }
    return requestStatus.value
  })

  const notifications = computed<CustomerNotificationItem[]>(() => {
    if (activeTab.value === 'sent') {
      return state.effectiveMailbox.value.sent
    }
    return state.effectiveMailbox.value.inbox.filter(item => activeTab.value !== 'unread' || !item.isRead)
  })

  const viewState = computed<NotificationViewState>(() => {
    if (loadStatus.value !== 'success') return loadStatus.value
    if (notifications.value.length) return 'ready'
    return activeTab.value === 'unread' && state.totalCount.value > 0 ? 'filtered-empty' : 'empty'
  })

  const showTabs = computed(() => viewState.value !== 'empty' || state.totalCount.value > 0 || state.sentCount.value > 0)
  const showReadAction = computed(() => activeTab.value !== 'sent' && loadStatus.value === 'success' && state.totalCount.value > 0)

  const overview = computed<NotificationOverviewSummary>(() =>
    activeTab.value === 'sent'
      ? { kind: 'sent', totalCount: state.sentCount.value, pendingCount: state.pendingSentCount.value }
      : { kind: 'inbox', totalCount: state.totalCount.value, unreadCount: state.unreadCount.value }
  )

  function showNotice(message: string) {
    noticeMessage.value = message
    if (noticeTimer) clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => { noticeMessage.value = '' }, 4500)
  }

  function selectTab(tab: CustomerNotificationTab) {
    const query = { ...route.query }
    if (tab === 'inbox') delete query.tab
    else query.tab = tab
    return navigateTo({ path: route.path, query })
  }

  async function activateNotification(notification: CustomerNotificationItem) {
    if (notification.direction === 'inbox') {
      await state.markRead(notification.id)
    }
    if ('unavailableMessage' in notification.action) {
      showNotice(notification.action.unavailableMessage)
    }
  }

  async function markAllRead() {
    if (!showReadAction.value) return
    await state.markAllRead()
    showNotice('تم تحديد كافة الإشعارات كمقروءة بنجاح.')
  }

  function resetFilter() {
    return selectTab('inbox')
  }

  async function retryNotifications() {
    const query = { ...route.query }
    if (import.meta.dev) delete query.notificationPreview
    requestStatus.value = 'loading'
    try {
      await state.fetchNotifications(true)
      requestStatus.value = 'success'
      showNotice('تم تحديث قائمة الإشعارات.')
    } catch {
      requestStatus.value = 'error'
    }
    await navigateTo({ path: route.path, query })
  }

  onMounted(() => {
    state.fetchNotifications()
  })

  watch(activeTab, () => {
    noticeMessage.value = ''
  })

  onBeforeUnmount(() => {
    if (noticeTimer) clearTimeout(noticeTimer)
  })

  return {
    ...state,
    activeTab,
    notifications,
    overview,
    viewState,
    showTabs,
    showReadAction,
    noticeMessage,
    selectTab,
    activateNotification,
    markAllRead,
    resetFilter,
    retryNotifications,
  }
}
