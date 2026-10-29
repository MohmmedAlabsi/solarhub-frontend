
<script setup lang="ts">
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  CalendarDays,
  CheckCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Inbox,
  PackageCheck,
  Star,
  Wallet
} from 'lucide-vue-next'

import {
  safeSupplierDestination,
  supplierDate,
  supplierError,
  supplierList,
  supplierRelativeTime
} from '~/utils/supplierPortal'

definePageMeta({
  layout: 'supplier'
})

useSeoMeta({
  title: 'إشعارات المتجر | SolarHub'
})

type Category =
  | 'orders'
  | 'quotes'
  | 'finance'
  | 'reviews'
  | 'general'

type FilterTab = 'all' | 'unread'

interface StoreNotification {
  id: string
  title: string
  body: string
  createdAt: string
  isRead: boolean
  category: Category
  destination: string | null
  actionLabel: string
  acceptedQuote: boolean
}

const { $api } = useNuxtApp()
const sharedNotifications = useNotificationState()

const notifications = ref<StoreNotification[]>([])

const total = ref(0)
const loaded = ref(false)
const loading = ref(false)
const saving = ref(false)

const error = ref('')
const success = ref('')

const activeTab = ref<FilterTab>('all')
const currentPage = ref(1)

const pageSize = 5

// أسماء تصنيفات الإشعارات
const categoryLabels: Record<Category, string> = {
  orders: 'طلبات الشراء',
  quotes: 'عروض الأسعار',
  finance: 'المالية',
  reviews: 'التقييمات',
  general: 'إشعار عام'
}

// أيقونات الإشعارات
const categoryIcons = {
  orders: PackageCheck,
  quotes: FileText,
  finance: Wallet,
  reviews: Star,
  general: Bell
}

// عدد الإشعارات غير المقروءة
const unreadCount = computed(() =>
  notifications.value.filter(item => !item.isRead).length
)

// تصفية الإشعارات
const filteredNotifications = computed(() =>
  activeTab.value === 'unread'
    ? notifications.value.filter(item => !item.isRead)
    : notifications.value
)

// عدد الصفحات
const pageCount = computed(() =>
  Math.max(
    1,
    Math.ceil(filteredNotifications.value.length / pageSize)
  )
)

// الإشعارات الظاهرة في الصفحة
const visibleNotifications = computed(() =>
  filteredNotifications.value.slice(
    (currentPage.value - 1) * pageSize,
    currentPage.value * pageSize
  )
)

const firstVisible = computed(() =>
  visibleNotifications.value.length
    ? (currentPage.value - 1) * pageSize + 1
    : 0
)

const lastVisible = computed(() =>
  firstVisible.value
    ? firstVisible.value + visibleNotifications.value.length - 1
    : 0
)

// معرفة ما إذا كانت هناك إشعارات إضافية على الخادم
const hasMoreOnServer = computed(() =>
  total.value > notifications.value.length
)

// أرقام الصفحات
const pageNumbers = computed<Array<number | '…'>>(() => {
  const candidates = [...new Set([
    1,
    pageCount.value,
    currentPage.value - 1,
    currentPage.value,
    currentPage.value + 1
  ])]
    .filter(value => value >= 1 && value <= pageCount.value)
    .sort((a, b) => a - b)

  const result: Array<number | '…'> = []

  candidates.forEach((value, index) => {
    if (
      index > 0 &&
      value - candidates[index - 1]! > 1
    ) {
      result.push('…')
    }

    result.push(value)
  })

  return result
})

watch(pageCount, count => {
  if (currentPage.value > count) {
    currentPage.value = count
  }
})

// معرفة نوع الإشعار من بيانات Laravel
function notificationCategory(
  raw: any,
  data: any
): Category {
  const text = [
    raw?.type,
    raw?.title,
    data?.type,
    data?.category,
    data?.title
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (/quote|rfq|عرض سعر|تسعير/.test(text)) {
    return 'quotes'
  }

  if (/order|purchase|shipping|ship|شراء|شحن/.test(text)) {
    return 'orders'
  }

  if (
    /payment|payout|wallet|financial|مستحق|مالية|تحويل|دفع|إيداع/
      .test(text)
  ) {
    return 'finance'
  }

  if (/review|rating|تقييم/.test(text)) {
    return 'reviews'
  }

  return 'general'
}

// تحويل بيانات API إلى بيانات الواجهة
function normalizeNotification(
  raw: any
): StoreNotification | null {
  if (
    raw?.id === null ||
    raw?.id === undefined
  ) {
    return null
  }

  let data = raw.data || {}

  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch {
      data = {}
    }
  }

  if (
    !data ||
    typeof data !== 'object' ||
    Array.isArray(data)
  ) {
    data = {}
  }

  const category = notificationCategory(raw, data)

  const title = String(
    raw.title ||
    data.title ||
    'إشعار جديد'
  )

  const acceptedQuote =
    category === 'quotes' &&
    /قبول|موافقة|اعتماد|accepted|approved/i.test(title)

  const fallbackDestination: Record<
    Category,
    string | null
  > = {
    orders: '/supplier/orders',
    quotes: '/supplier/quotes',
    finance: '/supplier/finance',
    reviews: '/supplier/reviews',
    general: null
  }

  const actionLabels: Record<Category, string> = {
    orders: 'متابعة الطلب والتجهيز',
    quotes: acceptedQuote
      ? 'عرض تفاصيل الاعتماد'
      : 'عرض تفاصيل الطلب',
    finance: 'عرض كشف الحساب',
    reviews: 'عرض التقييم',
    general: 'عرض التفاصيل'
  }

  return {
    id: String(raw.id),

    title,

    body: String(
      raw.body ||
      raw.description ||
      data.body ||
      data.message ||
      ''
    ),

    createdAt: String(
      raw.created_at ||
      data.created_at ||
      ''
    ),

    isRead: Boolean(
      raw.read_at ||
      raw.is_read === true ||
      raw.is_read === 1 ||
      raw.is_read === '1'
    ),

    category,

    destination:
      safeSupplierDestination(
        raw.action_url || data.action_url
      ) || fallbackDestination[category],

    actionLabel: actionLabels[category],

    acceptedQuote
  }
}

// تنسيق تاريخ الإشعار
function displayTime(value: string): string {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  const age = Date.now() - date.getTime()

  if (
    age >= 0 &&
    age < 24 * 60 * 60 * 1000
  ) {
    const clock = date.toLocaleTimeString('ar-YE', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })

    return `${supplierRelativeTime(value)} (${clock})`
  }

  return supplierDate(value)
}

// تغيير التبويب
function changeTab(tab: FilterTab) {
  activeTab.value = tab
  currentPage.value = 1
}

// تغيير الصفحة
function changePage(target: number) {
  if (
    target < 1 ||
    target > pageCount.value ||
    loading.value
  ) {
    return
  }

  currentPage.value = target
}

// جلب الإشعارات من Laravel
async function fetchNotifications() {
  if (loading.value) return

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await $api<any>(
      '/my/notifications/inbox',
      {
        query: {
          page: 1,
          per_page: 100
        }
      }
    )

    const payload = response?.data ?? response

    const hasList =
      Array.isArray(payload) ||
      Array.isArray(payload?.data) ||
      Array.isArray(payload?.notifications) ||
      Array.isArray(payload?.items) ||
      Array.isArray(payload?.results) ||
      Array.isArray(payload?.data?.data)

    if (
      response?.success === false ||
      !hasList
    ) {
      throw new Error(
        'صيغة استجابة الإشعارات غير متوقعة.'
      )
    }

    const parsed = supplierList<any>(response)

    notifications.value = parsed.items
      .map(normalizeNotification)
      .filter(
        (
          item: StoreNotification | null
        ): item is StoreNotification =>
          item !== null
      )

    total.value = Math.max(
      parsed.total,
      notifications.value.length
    )

    currentPage.value = 1
    loaded.value = true
  } catch (err: any) {
    error.value = supplierError(
      err,
      'تعذر تحميل إشعارات المتجر.'
    )
  } finally {
    loading.value = false
  }
}

// تحديد إشعار كمقروء
async function markRead(
  item: StoreNotification
): Promise<boolean> {
  if (item.isRead) return true
  if (saving.value) return false

  saving.value = true
  error.value = ''

  try {
    await $api(
      `/my/notifications/${encodeURIComponent(item.id)}/read`,
      {
        method: 'PATCH'
      }
    )

    item.isRead = true

    // مزامنة جرس الإشعارات في الهيدر
    const shared =
      sharedNotifications.mailbox.value.inbox.find(
        entry => entry.id === item.id
      )

    if (shared) {
      shared.isRead = true
    } else {
      void sharedNotifications.fetchNotifications(true)
    }

    return true
  } catch (err) {
    error.value = supplierError(
      err,
      'تعذر تحديد الإشعار كمقروء.'
    )

    return false
  } finally {
    saving.value = false
  }
}

// تحديد جميع الإشعارات كمقروءة
async function markAllRead() {
  if (
    !unreadCount.value ||
    saving.value ||
    loading.value
  ) {
    return
  }

  saving.value = true
  error.value = ''
  success.value = ''

  try {
    await $api(
      '/my/notifications/read-all',
      {
        method: 'PATCH'
      }
    )

    notifications.value.forEach(item => {
      item.isRead = true
    })

    sharedNotifications.mailbox.value.inbox.forEach(
      item => {
        item.isRead = true
      }
    )

    success.value =
      'تم تحديد جميع الإشعارات كمقروءة.'
  } catch (err) {
    error.value = supplierError(
      err,
      'تعذر تحديث حالة الإشعارات.'
    )
  } finally {
    saving.value = false
  }
}

// فتح تفاصيل الإشعار
async function openNotification(
  item: StoreNotification
) {
  const updated = await markRead(item)

  if (!updated) return

  if (item.destination) {
    await navigateTo(item.destination)
  }
}

onMounted(() => {
  void fetchNotifications()
})
</script>

<template>
  <div
    dir="rtl"
    class="mx-auto flex w-full max-w-[1100px]
           min-w-0 flex-col gap-7 pb-4"
  >
    <!-- عنوان الصفحة -->
    <section
      class="rounded-xl border border-solar-border-card/40
             bg-solar-bg-card px-5 py-4 shadow-sm
             sm:px-6 sm:py-5"
    >
      <h1
        class="text-xl font-extrabold tracking-tight
               text-solar-text-heading sm:text-[23px]"
      >
        إشعارات المتجر
      </h1>

      <p
        class="mt-1.5 text-xs leading-6
               text-solar-text-secondary sm:text-[13px]"
      >
        متابعة تنبيهات طلبات الشراء، عروض الأسعار
        والمستحقات المالية الواردة
      </p>
    </section>

    <!-- التبويبات وتحديد الكل كمقروء -->
    <div
      class="flex flex-wrap items-center
             justify-between gap-4"
    >
      <div
        role="group"
        aria-label="تصفية الإشعارات"
        class="inline-flex items-center gap-1 rounded-xl
               bg-[#eef1fb] p-1 dark:bg-solar-bg-subtle"
      >
        <!-- تبويب الكل -->
        <button
          type="button"
          :aria-pressed="activeTab === 'all'"
          class="inline-flex min-h-9 items-center gap-2
                 rounded-lg px-3.5 py-1.5 text-xs
                 font-bold transition-all"
          :class="
            activeTab === 'all'
              ? 'bg-solar-bg-card text-solar-text-heading shadow-sm'
              : 'text-solar-text-secondary hover:text-solar-text-heading'
          "
          @click="changeTab('all')"
        >
          الكل

          <span
            class="flex min-w-5 items-center justify-center
                   rounded-full bg-[#e5e9f6]
                   px-1.5 py-0.5 text-[10px]
                   text-solar-text-body"
          >
            {{ total }}
          </span>
        </button>

        <!-- تبويب غير المقروءة -->
        <button
          type="button"
          :aria-pressed="activeTab === 'unread'"
          class="inline-flex min-h-9 items-center gap-2
                 rounded-lg px-3.5 py-1.5 text-xs
                 font-bold transition-all"
          :class="
            activeTab === 'unread'
              ? 'bg-solar-bg-card text-solar-text-heading shadow-sm'
              : 'text-solar-text-secondary hover:text-solar-text-heading'
          "
          @click="changeTab('unread')"
        >
          غير المقروءة

          <span
            class="flex min-w-5 items-center justify-center
                   rounded-full bg-solar-yellow px-1.5
                   py-0.5 text-[10px] font-extrabold
                   text-solar-navy-dark"
          >
            {{ unreadCount }}
          </span>
        </button>
      </div>

      <!-- زر تحديد الكل -->
      <button
        type="button"
        :disabled="loading || saving || !unreadCount"
        class="inline-flex min-h-10 items-center gap-2
               rounded-lg border border-solar-border-card
               bg-solar-bg-card px-4 py-2 text-xs
               font-bold text-solar-text-heading shadow-sm
               transition-all hover:border-solar-yellow
               disabled:cursor-not-allowed
               disabled:opacity-50"
        @click="markAllRead"
      >
        <span>تحديد الكل كمقروء</span>

        <CheckCheck
          class="size-4"
          aria-hidden="true"
        />
      </button>
    </div>

    <!-- الأخطاء -->
    <div
      v-if="error"
      role="alert"
      class="rounded-xl border border-solar-status-danger
             bg-solar-status-danger-bg px-4 py-3
             text-sm text-solar-status-danger-text"
    >
      {{ error }}

      <button
        type="button"
        class="mr-3 font-bold underline"
        :disabled="loading"
        @click="fetchNotifications"
      >
        إعادة المحاولة
      </button>
    </div>

    <!-- رسالة النجاح -->
    <div
      v-if="success"
      role="status"
      class="rounded-xl border border-solar-status-success
             bg-solar-status-success-bg px-4 py-3
             text-sm text-solar-status-success-text"
    >
      {{ success }}
    </div>

    <!-- إشعار النتائج الجزئية -->
    <div
      v-if="hasMoreOnServer"
      class="rounded-xl border border-solar-status-warning
             bg-solar-status-warning-bg px-4 py-3
             text-xs text-solar-status-warning-text"
    >
      يتم عرض {{ notifications.length }} إشعارًا
      من أصل {{ total }}. تصفية غير المقروءة
      تخص الإشعارات المحمّلة فقط.
    </div>

    <!-- قائمة الإشعارات -->
    <section
      class="flex flex-col gap-3.5"
      aria-label="قائمة إشعارات المتجر"
      :aria-busy="loading"
    >
      <!-- حالة التحميل -->
      <template v-if="loading && !loaded">
        <div
          v-for="number in 5"
          :key="number"
          class="h-[145px] animate-pulse rounded-[14px]
                 bg-solar-bg-card px-5 py-5 shadow-sm"
        >
          <div class="flex items-start gap-4">
            <div
              class="size-12 rounded-xl bg-solar-bg-subtle"
            />

            <div class="flex-1 space-y-3 pt-1">
              <div
                class="h-3 w-2/3 rounded bg-solar-bg-subtle"
              />
              <div
                class="h-3 w-full rounded bg-solar-bg-subtle"
              />
              <div
                class="h-3 w-1/3 rounded bg-solar-bg-subtle"
              />
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="loaded">
        <!-- بطاقة الإشعار -->
        <article
          v-for="notification in visibleNotifications"
          :key="notification.id"
          class="group min-h-[145px] rounded-[14px]
                 bg-solar-bg-card px-4 py-5
                 shadow-[0_1px_3px_rgba(12,37,60,0.045)]
                 transition-shadow hover:shadow-card
                 sm:px-5"
          :class="
            notification.isRead
              ? 'border-r-[3px] border-transparent'
              : 'border-r-[3px] border-solar-yellow'
          "
        >
          <div
            class="flex flex-col gap-4 sm:flex-row
                   sm:items-stretch sm:justify-between
                   sm:gap-5"
          >
            <!-- المحتوى الأيمن -->
            <div
              class="flex min-w-0 flex-1
                     items-start gap-3.5 sm:gap-4"
            >
              <!-- أيقونة الإشعار -->
              <div
                class="flex size-12 shrink-0
                       items-center justify-center
                       rounded-xl bg-[#e9efff]
                       text-solar-navy-dark
                       dark:bg-solar-bg-subtle
                       dark:text-solar-text-heading"
              >
                <component
                  :is="
                    notification.acceptedQuote
                      ? BadgeCheck
                      : categoryIcons[notification.category]
                  "
                  class="size-5"
                  aria-hidden="true"
                />
              </div>

              <!-- عنوان ووصف الإشعار -->
              <div class="min-w-0 flex-1">
                <div
                  class="flex flex-wrap items-center
                         gap-x-2 gap-y-1.5"
                >
                  <!-- النقطة الصفراء -->
                  <span
                    v-if="!notification.isRead"
                    class="size-2 shrink-0 rounded-full
                           bg-solar-yellow"
                    aria-label="إشعار غير مقروء"
                  />

                  <h2
                    class="break-words text-[13px]
                           font-extrabold leading-6
                           text-solar-text-heading
                           sm:text-sm"
                  >
                    {{ notification.title }}
                  </h2>

                  <!-- نوع الإشعار -->
                  <span
                    class="inline-flex shrink-0 items-center
                           rounded-full bg-[#edf1fa]
                           px-2.5 py-0.5 text-[10px]
                           font-semibold text-solar-text-body
                           dark:bg-solar-bg-subtle"
                  >
                    {{
                      categoryLabels[notification.category]
                    }}
                  </span>
                </div>

                <!-- الوصف -->
                <p
                  class="mt-2 break-words whitespace-pre-wrap
                         text-xs leading-7
                         text-solar-text-secondary
                         sm:text-[13px]"
                >
                  {{
                    notification.body ||
                    'لا توجد تفاصيل إضافية لهذا الإشعار.'
                  }}
                </p>

                <!-- عرض التفاصيل -->
                <button
                  v-if="notification.destination"
                  type="button"
                  :disabled="saving"
                  class="mt-2.5 inline-flex items-center
                         gap-1.5 text-xs font-extrabold
                         text-solar-text-heading
                         transition-colors
                         hover:text-solar-navy
                         hover:underline
                         disabled:opacity-50"
                  @click="openNotification(notification)"
                >
                  {{ notification.actionLabel }}

                  <ArrowLeft
                    class="size-3.5"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>

            <!-- التاريخ وحالة القراءة على اليسار -->
            <div
              class="flex shrink-0 items-center
                     justify-between gap-3
                     sm:min-w-[136px] sm:flex-col
                     sm:items-end sm:gap-5"
            >
              <!-- التاريخ -->
              <time
                :datetime="
                  notification.createdAt || undefined
                "
                class="inline-flex items-center gap-1
                       whitespace-nowrap text-[10px]
                       text-solar-text-muted sm:text-[11px]"
              >
                <Clock3
                  v-if="
                    displayTime(notification.createdAt)
                      .startsWith('منذ') ||
                    displayTime(notification.createdAt)
                      === 'الآن'
                  "
                  class="size-3.5"
                  aria-hidden="true"
                />

                <CalendarDays
                  v-else
                  class="size-3.5"
                  aria-hidden="true"
                />

                {{
                  displayTime(notification.createdAt)
                }}
              </time>

              <!-- إشعار مقروء -->
              <span
                v-if="notification.isRead"
                class="inline-flex items-center gap-1
                       rounded-md bg-[#eef1fb]
                       px-2.5 py-1 text-[10px]
                       font-semibold text-solar-text-muted
                       dark:bg-solar-bg-subtle"
              >
                <CheckCheck
                  class="size-3.5"
                  aria-hidden="true"
                />
                مقروء
              </span>

              <!-- تحديد إشعار كمقروء -->
              <button
                v-else
                type="button"
                :disabled="saving"
                class="flex size-8 items-center
                       justify-center rounded-full
                       text-solar-text-secondary
                       transition-colors
                       hover:bg-solar-bg-subtle
                       hover:text-solar-navy-dark
                       disabled:opacity-50"
                :aria-label="
                  `تحديد الإشعار ${notification.title} كمقروء`
                "
                title="تحديد كمقروء"
                @click="markRead(notification)"
              >
                <CheckCircle2
                  class="size-5"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </article>

        <!-- الحالة الفارغة -->
        <div
          v-if="!visibleNotifications.length"
          class="flex min-h-64 flex-col
                 items-center justify-center
                 rounded-[14px] bg-solar-bg-card
                 px-5 py-10 text-center shadow-sm"
        >
          <div
            class="flex size-14 items-center
                   justify-center rounded-2xl
                   bg-[#e9efff] text-solar-navy-dark"
          >
            <Inbox
              class="size-7"
              aria-hidden="true"
            />
          </div>

          <h2
            class="mt-4 text-sm font-extrabold
                   text-solar-text-heading"
          >
            {{
              activeTab === 'unread'
                ? 'جميع إشعاراتك مقروءة'
                : 'لا توجد إشعارات حتى الآن'
            }}
          </h2>

          <p
            class="mt-1.5 text-xs leading-6
                   text-solar-text-secondary"
          >
            {{
              activeTab === 'unread'
                ? 'لا توجد إشعارات غير مقروءة في الوقت الحالي.'
                : 'ستظهر هنا تنبيهات الطلبات وعروض الأسعار عند وصولها.'
            }}
          </p>
        </div>
      </template>
    </section>

    <!-- أسفل الصفحة -->
    <footer
      v-if="loaded && filteredNotifications.length"
      class="flex flex-col gap-4 pt-2
             sm:flex-row sm:items-center
             sm:justify-between"
    >
      <!-- عدد الإشعارات -->
      <p class="text-xs text-solar-text-secondary">
        عرض
        <strong class="font-bold text-solar-text-heading">
          {{ firstVisible }} - {{ lastVisible }}
        </strong>

        من إجمالي

        <strong class="font-bold text-solar-text-heading">
          {{
            activeTab === 'all' && !hasMoreOnServer
              ? total
              : filteredNotifications.length
          }}
        </strong>

        إشعار
      </p>

      <!-- أزرار الصفحات -->
      <nav
        v-if="pageCount > 1"
        aria-label="التنقل بين صفحات الإشعارات"
        class="flex flex-wrap items-center gap-1.5"
      >
        <button
          type="button"
          class="inline-flex min-h-9 items-center
                 gap-1 rounded-lg border
                 border-solar-border-card
                 bg-solar-bg-card px-3 text-[11px]
                 font-semibold text-solar-text-heading
                 disabled:opacity-40"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          <ChevronRight class="size-3.5" />
          السابق
        </button>

        <template
          v-for="(number, index) in pageNumbers"
          :key="`${number}-${index}`"
        >
          <span
            v-if="number === '…'"
            class="px-1 text-xs text-solar-text-muted"
          >
            …
          </span>

          <button
            v-else
            type="button"
            class="flex size-9 items-center
                   justify-center rounded-lg border
                   text-xs font-bold transition-colors"
            :class="
              number === currentPage
                ? 'border-solar-navy-dark bg-solar-navy-dark text-white'
                : 'border-solar-border-card bg-solar-bg-card text-solar-text-heading hover:border-solar-navy'
            "
            :aria-current="
              number === currentPage
                ? 'page'
                : undefined
            "
            @click="changePage(number)"
          >
            {{ number }}
          </button>
        </template>

        <button
          type="button"
          class="inline-flex min-h-9 items-center
                 gap-1 rounded-lg border
                 border-solar-border-card
                 bg-solar-bg-card px-3 text-[11px]
                 font-semibold text-solar-text-heading
                 disabled:opacity-40"
          :disabled="currentPage === pageCount"
          @click="changePage(currentPage + 1)"
        >
          التالي
          <ChevronLeft class="size-3.5" />
        </button>
      </nav>
    </footer>
  </div>
</template>
