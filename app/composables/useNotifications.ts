import type { CustomerNotification, CustomerNotificationItem, CustomerNotificationMailbox, CustomerNotificationTab, NotificationOverviewSummary, NotificationLoadStatus, NotificationPreviewMode, NotificationViewState } from '../../types/customer-notification'

function initialMailbox(): CustomerNotificationMailbox {
  return {
    sent: [
      { id: 'sent-panel-quote', direction: 'sent', category: 'quote', status: 'sent', title: 'طلب عرض سعر: لوح شمسي Jinko Tiger Pro 585W', description: 'تم إرسال طلب عرض السعر بنجاح إلى متجر شمس الرياض للمهمات الكهروضوئية، بانتظار تسعير الكمية (24 لوح).', timeLabel: 'منذ 25 دقيقة', action: { label: 'معاينة الطلب', unavailableMessage: 'هذا سجل صادر تجريبي. تفاصيل طلب الألواح غير متاحة حاليًا؛ لم يُرسل طلب فعلي إلى المتجر.' } },
      { id: 'sent-farm-consultation', direction: 'sent', category: 'consultation', status: 'sent', title: 'طلب استشارة هندسية: مشروع مزرعة الخرج 50kW', description: 'تم إرسال تفاصيل المخطط وطلب مراجعة دراسة الجدوى للمهندس م. أحمد الشمري.', timeLabel: 'منذ 3 ساعات', action: { label: 'تفاصيل الاستشارة', unavailableMessage: 'هذا سجل صادر تجريبي. تفاصيل استشارة مزرعة الخرج غير متاحة حاليًا؛ لم تُرسل رسالة أو مخططات إلى المهندس.' } },
    ],
    inbox: [
      { id: 'shipping-SH-8842', direction: 'inbox', category: 'shipping', title: 'شحنتك في طريقها إليك - طلب رقم #SH-8842', description: 'تم تسليم ألواح Jinko Tiger Pro 585W إلى شركة الشحن المعتمدة، ومن المتوقع وصولها إلى موقعك في الرياض غدًا.', timeLabel: 'منذ 15 دقيقة', isRead: false, action: { label: 'تتبع الشحنة', destination: '/customer/orders/SH-8842/track' } },
      { id: 'offer-SR-302', direction: 'inbox', category: 'engineering', title: 'عرض هندسي جديد لمشروعك السكني', description: 'قدم م. أحمد الشمري (مهندس معتمد) عرضًا فنيًا وماليًا لدراسة ومخططات مشروع الطاقة الشمسية بقدرة 15kW.', timeLabel: 'منذ ساعتين', isRead: false, action: { label: 'معاينة العرض', destination: '/customer/services/SR-302' } },
      { id: 'invoice', direction: 'inbox', category: 'financial', title: 'تم تأكيد مواصفات الدفع وتوثيق الفاتورة', description: 'أكد متجر شمس الرياض استلام الدفعة لطلب منظومة البطاريات الهجينة وإصدار الفاتورة الضريبية المعتمدة.', timeLabel: 'منذ 5 ساعات', isRead: false, action: { label: 'عرض الفاتورة', unavailableMessage: 'عرض الفاتورة غير متاح في البيانات التجريبية؛ لم يتم فتح مستند أو جلبه من الخادم.' } },
      { id: 'sbc-report', direction: 'inbox', category: 'building', title: 'اكتمال مراجعة دراسة الجدوى وتوافق كود البناء SBC', description: 'أتمت المهندسة سارة القحطاني مراجعة مخططات الربط بالشبكة الكهربائية وتوليد التقرير الفني النهائي.', timeLabel: 'أمس، 4:30 م', isRead: true, action: { label: 'تحميل التقرير', unavailableMessage: 'ملف التقرير غير متاح في البيانات التجريبية؛ لم يبدأ أي تنزيل.' } },
    ],
  }
}

/** Shared by the header and center. Memory only, with no server synchronization. */
export function useNotificationState() {
  const route = useRoute()
  const mailbox = useState<CustomerNotificationMailbox>('customer-notification-mailbox', initialMailbox)
  // Dev-only view projection. Never mutate fixtures or leak test controls into production.
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
  function markRead(id: CustomerNotification['id']) {
    const item = mailbox.value.inbox.find(item => item.id === id)
    if (item) item.isRead = true
  }
  function markAllRead() { for (const item of mailbox.value.inbox) item.isRead = true }
  return { mailbox, effectiveMailbox, previewMode, totalCount, unreadCount, sentCount, pendingSentCount, markRead, markAllRead }
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
  // Demo data is synchronously available. An approved API can supply this request status later.
  const requestStatus = ref<NotificationLoadStatus>('success')
  const loadStatus = computed<NotificationLoadStatus>(() => state.previewMode.value === 'loading' || state.previewMode.value === 'error' ? state.previewMode.value : requestStatus.value)
  const notifications = computed<CustomerNotificationItem[]>(() => activeTab.value === 'sent' ? state.effectiveMailbox.value.sent : state.effectiveMailbox.value.inbox.filter(item => activeTab.value !== 'unread' || !item.isRead))
  const viewState = computed<NotificationViewState>(() => {
    if (loadStatus.value !== 'success') return loadStatus.value
    if (notifications.value.length) return 'ready'
    return activeTab.value === 'unread' && state.totalCount.value > 0 ? 'filtered-empty' : 'empty'
  })
  const showTabs = computed(() => viewState.value !== 'empty' || state.totalCount.value > 0 || state.sentCount.value > 0)
  const showReadAction = computed(() => activeTab.value !== 'sent' && loadStatus.value === 'success' && state.totalCount.value > 0)
  const overview = computed<NotificationOverviewSummary>(() => activeTab.value === 'sent'
    ? { kind: 'sent', totalCount: state.sentCount.value, pendingCount: state.pendingSentCount.value }
    : { kind: 'inbox', totalCount: state.totalCount.value, unreadCount: state.unreadCount.value })
  function showNotice(message: string) {
    noticeMessage.value = message
    if (noticeTimer) clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => { noticeMessage.value = '' }, 5500)
  }
  function selectTab(tab: CustomerNotificationTab) {
    const query = { ...route.query }
    if (tab === 'inbox') delete query.tab
    else query.tab = tab
    return navigateTo({ path: route.path, query })
  }
  function activateNotification(notification: CustomerNotificationItem) {
    if (notification.direction === 'inbox') state.markRead(notification.id)
    if ('unavailableMessage' in notification.action) showNotice(notification.action.unavailableMessage)
  }
  function markAllRead() {
    if (!showReadAction.value) return
    state.markAllRead()
    showNotice('تم تحديد كل الإشعارات كمقروءة داخل الجلسة فقط؛ لم تتم مزامنة الخادم.')
  }
  function resetFilter() { return selectTab('inbox') }
  async function retryNotifications() {
    // There is no approved endpoint. Retry returns to the intact local demo source.
    const query = { ...route.query }
    if (import.meta.dev) delete query.notificationPreview
    requestStatus.value = 'success'
    await navigateTo({ path: route.path, query })
    showNotice('تمت إعادة تحميل البيانات التجريبية محليًا؛ لم يتم الاتصال بخادم.')
  }
  watch(activeTab, () => { noticeMessage.value = '' })
  onBeforeUnmount(() => { if (noticeTimer) clearTimeout(noticeTimer) })
  return { ...state, activeTab, notifications, overview, viewState, showTabs, showReadAction, noticeMessage, selectTab, activateNotification, markAllRead, resetFilter, retryNotifications }
}
