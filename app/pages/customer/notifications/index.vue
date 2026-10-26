<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Bell, CheckCheck, Inbox, Send } from 'lucide-vue-next'
import NotificationItem from '../../../components/customer/notifications/NotificationItem.vue'
import {
  useCustomerNotifications,
  type CustomerApiNotification,
} from '../../../composables/useCustomerNotifications'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'مركز الإشعارات | SolarHub',
})

type NotificationTab = 'inbox' | 'unread' | 'sent'

const route = useRoute()

const {
  inbox,
  outbox,
  inboxLoaded,
  outboxLoaded,
  inboxLoading,
  outboxLoading,
  inboxError,
  outboxError,
  mutationError,
  inboxCount,
  unreadCount,
  sentCount,
  markingId,
  markingAll,
  mutationBusy,
  loadInbox,
  loadOutbox,
  markRead,
  markAllRead: saveAllRead,
  clearMutationError,
} = useCustomerNotifications()

const noticeMessage = ref('')

const tabs: Array<{
  id: NotificationTab
  label: string
}> = [
  { id: 'inbox', label: 'الواردة' },
  { id: 'unread', label: 'غير المقروءة' },
  { id: 'sent', label: 'الصادرة' },
]

const activeTab = computed<NotificationTab>(() => {
  const value = Array.isArray(route.query.tab)
    ? route.query.tab[0]
    : route.query.tab

  return value === 'unread' || value === 'sent'
    ? value
    : 'inbox'
})

const activeLoading = computed(() =>
  activeTab.value === 'sent'
    ? outboxLoading.value
    : inboxLoading.value,
)

const activeLoaded = computed(() =>
  activeTab.value === 'sent'
    ? outboxLoaded.value
    : inboxLoaded.value,
)

const activeError = computed(() =>
  activeTab.value === 'sent'
    ? outboxError.value
    : inboxError.value,
)

const notifications = computed(() => {
  if (activeTab.value === 'sent') {
    return outbox.value
  }

  if (activeTab.value === 'unread') {
    return inbox.value.filter(item => !item.is_read)
  }

  return inbox.value
})

const emptyTitle = computed(() => {
  switch (activeTab.value) {
    case 'sent':
      return 'لا توجد إشعارات صادرة'
    case 'unread':
      return 'لا توجد إشعارات غير مقروءة'
    default:
      return 'لا توجد إشعارات واردة'
  }
})

const canMarkAllRead = computed(() =>
  activeTab.value !== 'sent'
  && inboxLoaded.value
  && !inboxLoading.value
  && !inboxError.value
  && !mutationBusy.value
  && unreadCount.value !== null
  && unreadCount.value > 0,
)

function tabCount(tab: NotificationTab): number | null {
  switch (tab) {
    case 'sent':
      return sentCount.value
    case 'unread':
      return unreadCount.value
    default:
      return inboxCount.value
  }
}

function selectTab(tab: NotificationTab) {
  const query = { ...route.query }

  if (tab === 'inbox') {
    delete query.tab
  } else {
    query.tab = tab
  }

  return navigateTo({
    path: route.path,
    query,
    hash: route.hash,
  })
}

function notificationDestination(
  value?: string | null,
): string | null {
  const path = value?.trim()

  if (!path) return null

  // روابط الخدمات التي يصدرها الباك إند.
  const serviceMatch = path.match(
    /^\/service-requests\/([1-9]\d*)(?:\/offers)?\/?$/,
  )

  if (serviceMatch) {
    return `/customer/services/${serviceMatch[1]}`
  }

  // صفحة تتبع الطلب الموجودة في الواجهة.
  const orderMatch = path.match(
    /^\/orders\/([1-9]\d*)\/?$/,
  )

  if (orderMatch) {
    return `/customer/orders/${orderMatch[1]}/track`
  }

  // قبول الروابط الداخلية المطابقة للصفحات المدعومة فقط.
  if (
    /^\/customer\/services\/[1-9]\d*$/.test(path)
    || /^\/customer\/orders\/[1-9]\d*\/track$/.test(path)
  ) {
    return path
  }

  return null
}

function activateNotification(
  notification: CustomerApiNotification,
) {
  if (mutationBusy.value) return

  const destination = notificationDestination(
    notification.action_url,
  )

  if (!destination) {
    noticeMessage.value =
      'لا توجد صفحة تفاصيل متاحة لهذا الإشعار.'
    return
  }

  return navigateTo(destination)
}

async function readNotification(
  notification: CustomerApiNotification,
) {
  if (mutationBusy.value) return

  noticeMessage.value = ''

  const saved = await markRead(notification.id)

  if (saved) {
    noticeMessage.value =
      'تم حفظ الإشعار كمقروء.'
  }
}

async function markAllRead() {
  if (!canMarkAllRead.value) return

  noticeMessage.value = ''

  const saved = await saveAllRead()

  if (saved) {
    noticeMessage.value =
      'تم حفظ جميع الإشعارات الواردة كمقروءة.'
  }
}

async function refreshNotifications() {
  if (mutationBusy.value || activeLoading.value) return

  noticeMessage.value = ''
  clearMutationError()

  if (activeTab.value === 'sent') {
    await loadOutbox(true)
  } else {
    await loadInbox(true)
  }
}

watch(activeTab, tab => {
  noticeMessage.value = ''
  clearMutationError()

  if (tab === 'sent') {
    void loadOutbox()
  } else {
    void loadInbox()
  }
})

onMounted(() => {
  // تحميل الصادر أيضًا لتجهيز عداده.
  // الوارد يُحمّل تلقائيًا داخل الملف المشترك.
  void loadOutbox()
})
</script>

<template>
  <div dir="rtl" class="flex min-w-0 flex-col gap-6">
    <nav
      class="flex flex-wrap items-center gap-2 text-xs text-solar-text-muted"
      aria-label="مسار التنقل"
    >
      <NuxtLink to="/customer/dashboard">
        الرئيسية
      </NuxtLink>

      <span aria-hidden="true">‹</span>

      <span class="text-solar-text-heading">
        مركز الإشعارات
      </span>
    </nav>

    <header
      class="rounded-2xl bg-solar-navy-dark p-6 text-white sm:p-8"
    >
      <h1 class="text-2xl font-bold sm:text-3xl">
        مركز الإشعارات
      </h1>

      <p class="mt-3 text-sm leading-7 text-slate-300">
        تابع تحديثات طلباتك وعروض المهندسين وحالة القراءة.
      </p>

      <dl class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div class="rounded-xl bg-white/10 p-4 text-center">
          <dt class="text-xs text-slate-300">
            الواردة
          </dt>
          <dd class="mt-2 text-2xl font-bold">
            {{ inboxCount ?? '—' }}
          </dd>
        </div>

        <div class="rounded-xl bg-white/10 p-4 text-center">
          <dt class="text-xs text-slate-300">
            غير المقروءة
          </dt>
          <dd class="mt-2 text-2xl font-bold text-amber-200">
            {{ unreadCount ?? '—' }}
          </dd>
        </div>

        <div class="rounded-xl bg-white/10 p-4 text-center">
          <dt class="text-xs text-slate-300">
            السجلات الصادرة
          </dt>
          <dd class="mt-2 text-2xl font-bold">
            {{ sentCount ?? '—' }}
          </dd>
        </div>
      </dl>
    </header>

    <div class="flex flex-wrap items-center justify-between gap-4">
      <nav
        class="flex flex-wrap gap-2"
        aria-label="تصنيف الإشعارات"
      >
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          :aria-current="activeTab === tab.id ? 'page' : undefined"
          class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold focus-visible:ring-2 focus-visible:ring-solar-yellow"
          :class="
            activeTab === tab.id
              ? 'border-solar-yellow bg-solar-yellow text-solar-navy-dark'
              : 'border-solar-border-card bg-white text-solar-text-body'
          "
          @click="selectTab(tab.id)"
        >
          <Inbox
            v-if="tab.id === 'inbox'"
            class="size-4"
            aria-hidden="true"
          />

          <Send
            v-else-if="tab.id === 'sent'"
            class="size-4"
            aria-hidden="true"
          />

          <Bell
            v-else
            class="size-4"
            aria-hidden="true"
          />

          {{ tab.label }}

          <span class="rounded-full bg-black/5 px-2 py-0.5">
            {{ tabCount(tab.id) ?? '—' }}
          </span>
        </button>
      </nav>

      <div class="flex flex-wrap gap-2">
        <button
          v-if="activeTab !== 'sent'"
          type="button"
          :disabled="!canMarkAllRead"
          class="inline-flex items-center gap-2 rounded-lg bg-solar-navy px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          @click="markAllRead"
        >
          <CheckCheck class="size-4" aria-hidden="true" />
          {{ markingAll ? 'جارٍ الحفظ…' : 'تحديد الكل كمقروء' }}
        </button>

        <button
          type="button"
          :disabled="activeLoading || mutationBusy"
          class="rounded-lg border border-solar-border-card bg-white px-4 py-2 text-xs font-bold text-solar-text-heading disabled:cursor-not-allowed disabled:opacity-50"
          @click="refreshNotifications"
        >
          تحديث
        </button>
      </div>
    </div>

    <p
      v-if="noticeMessage"
      role="status"
      aria-live="polite"
      class="rounded-xl bg-emerald-50 p-4 text-sm leading-7 text-emerald-800"
    >
      {{ noticeMessage }}
    </p>

    <p
      v-if="mutationError"
      role="alert"
      class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-800"
    >
      {{ mutationError }}
    </p>

    <p
      v-if="activeTab === 'sent'"
      class="rounded-xl bg-solar-status-info-bg p-4 text-xs leading-7 text-solar-text-body"
    >
      الصادرة تعرض سجلات الإشعارات وعدد المستلمين؛
      حالة قراءة المستلمين غير متاحة.
    </p>

    <section
      v-if="activeLoading || (!activeLoaded && !activeError)"
      role="status"
      aria-live="polite"
      class="rounded-xl border border-solar-border-card bg-white px-5 py-14 text-center text-sm text-solar-text-muted"
    >
      جارٍ تحميل الإشعارات…
    </section>

    <section
      v-else-if="activeError"
      role="alert"
      class="rounded-xl border border-red-200 bg-red-50 p-5"
    >
      <p class="text-sm leading-7 text-red-800">
        {{ activeError }}
      </p>

      <button
        type="button"
        :disabled="mutationBusy"
        class="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-bold text-red-800 disabled:opacity-50"
        @click="refreshNotifications"
      >
        إعادة المحاولة
      </button>
    </section>

    <ul
      v-else-if="notifications.length"
      class="flex min-w-0 flex-col gap-4"
      :aria-label="
        activeTab === 'sent'
          ? 'الإشعارات الصادرة'
          : 'الإشعارات الواردة'
      "
    >
      <NotificationItem
        v-for="notification in notifications"
        :key="notification.id"
        :notification="notification"
        :direction="activeTab === 'sent' ? 'sent' : 'inbox'"
        :action-available="
          notificationDestination(notification.action_url) !== null
        "
        :busy="mutationBusy"
        :reading="
          activeTab !== 'sent'
          && (markingAll || markingId === String(notification.id))
        "
        @activate="activateNotification"
        @read="readNotification"
      />
    </ul>

    <section
      v-else
      class="rounded-xl border border-dashed border-solar-border-card bg-white px-5 py-14 text-center"
    >
      <Bell
        class="mx-auto size-10 text-solar-text-muted"
        aria-hidden="true"
      />

      <h2 class="mt-4 text-lg font-bold text-solar-text-heading">
        {{ emptyTitle }}
      </h2>

      <button
        v-if="activeTab === 'unread'"
        type="button"
        class="mt-5 rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark"
        @click="selectTab('inbox')"
      >
        عرض جميع الواردة
      </button>
    </section>
  </div>
</template>