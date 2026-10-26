<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue'
import { FileText, Loader2, Package } from 'lucide-vue-next'
import { useAuthStore } from '../../../stores/auth'
import { fetchAllApiRows } from '../../../utils/apiCollection'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'طلباتي وعروض الأسعار | SolarHub',
})

type Tab = 'orders' | 'quotes'
type QuoteDecision = 'accept' | 'reject'

interface ApiResponse<T> {
  status: string
  message?: string
  data: T
}

interface OrderRow {
  id: number
  order_number: string
  status: string
  total_amount: number | string | null
  delivery_address?: string | null
  created_at?: string | null

  governorate?: {
    id?: number | null
    name?: string | null
    name_ar?: string | null
  } | null
}

interface OrderCollectionResponse {
  status: string
  message?: string

  data:
    | OrderRow[]
    | {
        data: OrderRow[]
        last_page?: number
        meta?: { last_page?: number }
      }

  meta?: { last_page?: number }
}

interface QuoteRow {
  id: number
  quantity: number
  status: string

  customer?: {
    id: number | string
    name?: string | null
  } | null

  store_product?: {
    id: number
    title?: string | null
    listed_price?: number | string | null

    store?: {
      id?: number | null
      company_name?: string | null
    } | null
  } | null

  customer_target_price?: number | string | null
  offered_unit_price?: number | string | null
  total_price?: number | string | null

  customer_notes?: string | null
  store_notes?: string | null

  created_at?: string | null
  responded_at?: string | null
  accepted_at?: string | null
}

interface RequestContext {
  token: string
  owner: string
  version: number
}

const route = useRoute()
const authStore = useAuthStore()
const { $api } = useNuxtApp()

const orders = ref<OrderRow[]>([])
const quotes = ref<QuoteRow[]>([])

const loading = reactive<Record<Tab, boolean>>({
  orders: false,
  quotes: false,
})

const loaded = reactive<Record<Tab, boolean>>({
  orders: false,
  quotes: false,
})

const errors = reactive<Record<Tab, string>>({
  orders: '',
  quotes: '',
})

const search = ref('')
const selectedStatus = ref('all')
const currentPage = ref(1)

const noticeMessage = ref('')
const actionError = ref('')
const quotesNeedRefresh = ref(true)

const quoteAction = ref<{
  id: number
  decision: QuoteDecision
} | null>(null)

const pageSize = 12

const sequences: Record<Tab, number> = {
  orders: 0,
  quotes: 0,
}

let contextVersion = 0
let mounted = false
let disposed = false

const orderStatuses: Record<string, string> = {
  pending: 'قيد الانتظار',
  processing: 'قيد التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم تسجيل التسليم',
  completed: 'مكتمل',
  cancelled: 'ملغى',
}

const quoteStatuses: Record<string, string> = {
  pending: 'بانتظار رد المتجر',
  responded: 'وصل عرض المتجر',
  accepted: 'تمت الموافقة على العرض',
  rejected: 'مرفوض / ملغى',
}

const activeTab = computed<Tab>(() => {
  const value = Array.isArray(route.query.tab)
    ? route.query.tab[0]
    : route.query.tab

  return value === 'quotes' ? 'quotes' : 'orders'
})

const actionBusy = computed(() =>
  quoteAction.value !== null,
)

const statusOptions = computed(() =>
  Object.entries(
    activeTab.value === 'orders'
      ? orderStatuses
      : quoteStatuses,
  ).map(([value, label]) => ({ value, label })),
)

const ordersCount = computed(() =>
  loaded.orders && !loading.orders && !errors.orders
    ? orders.value.length
    : null,
)

const quotesCount = computed(() =>
  loaded.quotes && !loading.quotes && !errors.quotes
    ? quotes.value.length
    : null,
)

function captureContext(): RequestContext | null {
  const token = authStore.token
  const owner = String(authStore.user?.id ?? '')

  if (!token || !owner) return null

  return {
    token,
    owner,
    version: contextVersion,
  }
}

function isCurrent(context: RequestContext): boolean {
  return !disposed
    && context.version === contextVersion
    && authStore.token === context.token
    && String(authStore.user?.id ?? '') === context.owner
}

function validId(value: unknown): boolean {
  const id = Number(value)

  return Number.isSafeInteger(id) && id > 0
}

function amountValue(value: unknown): number | null {
  if (
    value === null
    || value === undefined
    || String(value).trim() === ''
  ) {
    return null
  }

  const amount = Number(value)

  return Number.isFinite(amount) && amount >= 0
    ? amount
    : null
}

function formatAmount(value: unknown): string {
  const amount = amountValue(value)

  return amount === null
    ? 'غير متاح'
    : new Intl.NumberFormat('ar', {
        maximumFractionDigits: 2,
      }).format(amount)
}

function formatDate(value?: string | null): string {
  if (!value) return 'غير متاح'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'غير متاح'

  return new Intl.DateTimeFormat('ar', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function statusLabel(status: string, tab: Tab): string {
  const labels = tab === 'orders'
    ? orderStatuses
    : quoteStatuses

  return labels[status] || 'حالة غير معروفة'
}

function statusClasses(status: string): string {
  switch (status) {
    case 'accepted':
    case 'completed':
    case 'delivered':
      return 'bg-emerald-50 text-emerald-800'

    case 'cancelled':
    case 'rejected':
      return 'bg-red-50 text-red-800'

    case 'responded':
    case 'processing':
    case 'shipped':
      return 'bg-blue-50 text-blue-800'

    default:
      return 'bg-amber-50 text-amber-800'
  }
}

function matchesSearch(values: unknown[]): boolean {
  const query = search.value.trim().toLocaleLowerCase('ar')

  if (!query) return true

  return values
    .filter(value => value !== null && value !== undefined)
    .join(' ')
    .toLocaleLowerCase('ar')
    .includes(query)
}

const filteredOrders = computed(() =>
  orders.value.filter(order => {
    if (
      selectedStatus.value !== 'all'
      && order.status !== selectedStatus.value
    ) {
      return false
    }

    return matchesSearch([
      order.id,
      order.order_number,
      order.delivery_address,
      order.governorate?.name,
      order.governorate?.name_ar,
    ])
  }),
)

const filteredQuotes = computed(() =>
  quotes.value.filter(quote => {
    if (
      selectedStatus.value !== 'all'
      && quote.status !== selectedStatus.value
    ) {
      return false
    }

    return matchesSearch([
      quote.id,
      quote.store_product?.title,
      quote.store_product?.store?.company_name,
      quote.customer_notes,
      quote.store_notes,
    ])
  }),
)

const resultCount = computed(() =>
  activeTab.value === 'orders'
    ? filteredOrders.value.length
    : filteredQuotes.value.length,
)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(resultCount.value / pageSize)),
)

const displayedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize

  return filteredOrders.value.slice(start, start + pageSize)
})

const displayedQuotes = computed(() => {
  const start = (currentPage.value - 1) * pageSize

  return filteredQuotes.value.slice(start, start + pageSize)
})

const hasFilters = computed(() =>
  Boolean(search.value.trim()) || selectedStatus.value !== 'all',
)

function selectTab(tab: Tab) {
  const query = { ...route.query }

  if (tab === 'orders') {
    delete query.tab
  } else {
    query.tab = 'quotes'
  }

  return navigateTo({
    path: route.path,
    query,
    hash: route.hash,
  })
}

function resetFilters() {
  search.value = ''
  selectedStatus.value = 'all'
  currentPage.value = 1
}

async function loadTab(tab: Tab): Promise<boolean> {
  const sequence = ++sequences[tab]
  const context = captureContext()

  loading[tab] = true
  loaded[tab] = false
  errors[tab] = ''

  if (tab === 'quotes') {
    quotesNeedRefresh.value = true
  }

  if (!context) {
    errors[tab] = 'سجّل الدخول لعرض سجلات حسابك.'
    loading[tab] = false
    return false
  }

  try {
    if (tab === 'orders') {
      const rows = await fetchAllApiRows<OrderRow>(
        query => $api<OrderCollectionResponse>(
          '/my/orders',
          { query },
        ),
        100,
      )

      if (
        !isCurrent(context)
        || sequence !== sequences[tab]
      ) {
        return false
      }

      if (rows.some(row => !validId(row.id))) {
        throw new Error('Invalid order records')
      }

      orders.value = rows
    } else {
      // هذا المسار يعيد القائمة كاملة دون تقسيم صفحات.
      const response = await $api<ApiResponse<QuoteRow[]>>(
        '/my/quote-requests',
      )

      if (
        !isCurrent(context)
        || sequence !== sequences[tab]
      ) {
        return false
      }

      if (
        response.status !== 'success'
        || !Array.isArray(response.data)
      ) {
        throw new Error('Invalid quotes response')
      }

      const seen = new Set<number>()

      for (const quote of response.data) {
        const id = Number(quote.id)

        if (
          !validId(id)
          || !validId(quote.quantity)
          || !quote.customer
          || String(quote.customer.id) !== context.owner
          || seen.has(id)
        ) {
          throw new Error('Invalid quote record')
        }

        seen.add(id)
      }

      quotes.value = response.data
      quotesNeedRefresh.value = false
    }

    loaded[tab] = true
    return true
  } catch {
    if (
      !isCurrent(context)
      || sequence !== sequences[tab]
    ) {
      return false
    }

    errors[tab] = tab === 'orders'
      ? 'تعذر تحميل سجل الطلبات. أعد المحاولة.'
      : 'تعذر تحميل عروض الأسعار. أعد المحاولة.'

    return false
  } finally {
    if (
      isCurrent(context)
      && sequence === sequences[tab]
    ) {
      loading[tab] = false
    }
  }
}

async function refreshActiveTab() {
  if (actionBusy.value || loading[activeTab.value]) return

  if (activeTab.value === 'quotes') {
    actionError.value = ''
  }

  await loadTab(activeTab.value)
}

async function refreshQuotes() {
  if (actionBusy.value || loading.quotes) return

  actionError.value = ''
  await loadTab('quotes')
}

function quoteActionsAvailable(): boolean {
  return loaded.quotes
    && !loading.quotes
    && !errors.quotes
    && !quotesNeedRefresh.value
    && !actionBusy.value
}

function canAcceptQuote(quote: QuoteRow): boolean {
  const unitPrice = amountValue(quote.offered_unit_price)
  const total = amountValue(quote.total_price)

  return quoteActionsAvailable()
    && quote.status === 'responded'
    && validId(quote.store_product?.id)
    && unitPrice !== null
    && unitPrice > 0
    && total !== null
    && total > 0
}

function canRejectQuote(quote: QuoteRow): boolean {
  return quoteActionsAvailable()
    && ['pending', 'responded'].includes(quote.status)
}

async function decideQuote(
  quote: QuoteRow,
  decision: QuoteDecision,
) {
  if (
    decision === 'accept'
      ? !canAcceptQuote(quote)
      : !canRejectQuote(quote)
  ) {
    return
  }

  const confirmed = window.confirm(
    decision === 'accept'
      ? 'هل تؤكد الموافقة على عرض السعر؟ هذه الموافقة لا تنشئ طلب شراء.'
      : 'هل تريد إغلاق طلب عرض السعر بالرفض أو الإلغاء؟',
  )

  if (!confirmed) return

  const context = captureContext()

  if (!context) return

  quoteAction.value = {
    id: quote.id,
    decision,
  }

  quotesNeedRefresh.value = true
  actionError.value = ''
  noticeMessage.value = ''

  try {
    const response = await $api<ApiResponse<QuoteRow>>(
      `/quote-requests/${quote.id}/${decision}`,
      {
        method: 'PATCH',
        retry: 0,
      },
    )

    if (!isCurrent(context)) return

    const updated = response.data
    const expectedStatus = decision === 'accept'
      ? 'accepted'
      : 'rejected'

    if (
      response.status !== 'success'
      || !updated
      || Number(updated.id) !== Number(quote.id)
      || updated.status !== expectedStatus
      || !updated.customer
      || String(updated.customer.id) !== context.owner
    ) {
      throw new Error('Quote decision was not confirmed')
    }

    quotes.value = quotes.value.map(item =>
      Number(item.id) === Number(quote.id)
        ? { ...item, ...updated }
        : item,
    )

    noticeMessage.value = decision === 'accept'
      ? `تم حفظ الموافقة على عرض السعر #${quote.id}.`
      : `تم إغلاق طلب عرض السعر #${quote.id}.`

    await loadTab('quotes')
  } catch {
    if (!isCurrent(context)) return

    quotesNeedRefresh.value = true

    actionError.value =
      'تعذر تأكيد نتيجة القرار. حدّث عروض الأسعار للتحقق قبل المحاولة مجددًا.'
  } finally {
    if (isCurrent(context)) {
      quoteAction.value = null
    }
  }
}

watch(activeTab, () => {
  resetFilters()
  noticeMessage.value = ''
})

watch([search, selectedStatus], () => {
  currentPage.value = 1
})

watch(totalPages, value => {
  currentPage.value = Math.min(currentPage.value, value)
})

watch(
  [
    () => authStore.token,
    () => String(authStore.user?.id ?? ''),
  ],
  () => {
    contextVersion++
    sequences.orders++
    sequences.quotes++

    orders.value = []
    quotes.value = []

    loading.orders = false
    loading.quotes = false
    loaded.orders = false
    loaded.quotes = false
    errors.orders = ''
    errors.quotes = ''

    quoteAction.value = null
    quotesNeedRefresh.value = true
    actionError.value = ''
    noticeMessage.value = ''

    resetFilters()

    if (mounted) {
      void loadTab('orders')
      void loadTab('quotes')
    }
  },
)

onMounted(() => {
  mounted = true

  void loadTab('orders')
  void loadTab('quotes')
})

onBeforeUnmount(() => {
  disposed = true
  mounted = false
  contextVersion++
  sequences.orders++
  sequences.quotes++
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

      <span>طلباتي وعروض الأسعار</span>
    </nav>

    <header>
      <h1 class="text-2xl font-bold text-solar-text-heading">
        طلباتي وعروض الأسعار
      </h1>

      <p class="mt-2 text-sm leading-7 text-solar-text-muted">
        راجع طلبات الشراء وردود المتاجر على طلبات التسعير.
      </p>
    </header>

    <nav
      class="flex flex-wrap gap-3"
      aria-label="نوع السجلات"
    >
      <button
        type="button"
        :aria-current="activeTab === 'orders' ? 'page' : undefined"
        class="rounded-lg border px-5 py-3 text-sm font-bold"
        :class="
          activeTab === 'orders'
            ? 'border-solar-yellow bg-solar-yellow text-solar-navy-dark'
            : 'border-solar-border-card bg-white text-solar-text-heading'
        "
        @click="selectTab('orders')"
      >
        طلبات الشراء ({{ ordersCount ?? '—' }})
      </button>

      <button
        type="button"
        :aria-current="activeTab === 'quotes' ? 'page' : undefined"
        class="rounded-lg border px-5 py-3 text-sm font-bold"
        :class="
          activeTab === 'quotes'
            ? 'border-solar-yellow bg-solar-yellow text-solar-navy-dark'
            : 'border-solar-border-card bg-white text-solar-text-heading'
        "
        @click="selectTab('quotes')"
      >
        عروض الأسعار ({{ quotesCount ?? '—' }})
      </button>
    </nav>

    <p
      v-if="noticeMessage"
      role="status"
      aria-live="polite"
      class="rounded-xl bg-emerald-50 p-4 text-sm leading-7 text-emerald-800"
    >
      {{ noticeMessage }}
    </p>

    <section
      v-if="actionError"
      role="alert"
      class="rounded-xl border border-red-200 bg-red-50 p-5"
    >
      <p class="text-sm leading-7 text-red-800">
        {{ actionError }}
      </p>

      <button
        type="button"
        :disabled="actionBusy || loading.quotes"
        class="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-bold text-red-800 disabled:opacity-50"
        @click="refreshQuotes"
      >
        تحديث عروض الأسعار
      </button>
    </section>

    <p
      v-if="activeTab === 'quotes'"
      class="rounded-xl bg-solar-status-info-bg p-4 text-sm leading-7 text-solar-text-body"
    >
      قبول العرض يسجل موافقتك على التسعير.
      إنشاء طلب شراء بالسعر المتفاوض عليه غير متاح حاليًا.
    </p>

    <section
      class="grid gap-4 rounded-xl border border-solar-border-card bg-white p-5 sm:grid-cols-2"
      aria-label="البحث والتصفية"
    >
      <label class="flex flex-col gap-2">
        <span class="text-sm font-bold text-solar-text-heading">
          البحث
        </span>

        <input
          v-model="search"
          type="search"
          :placeholder="
            activeTab === 'orders'
              ? 'رقم الطلب أو عنوان التوصيل'
              : 'رقم العرض أو المنتج أو المتجر'
          "
          class="solar-input h-11"
        >
      </label>

      <label class="flex flex-col gap-2">
        <span class="text-sm font-bold text-solar-text-heading">
          الحالة
        </span>

        <select
          v-model="selectedStatus"
          class="solar-input h-11"
        >
          <option value="all">جميع الحالات</option>

          <option
            v-for="option in statusOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </label>
    </section>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-xs text-solar-text-muted">
        العملة غير محددة في البيانات المتاحة.
      </p>

      <button
        type="button"
        :disabled="loading[activeTab] || actionBusy"
        class="rounded-lg border border-solar-border-card bg-white px-4 py-2 text-xs font-bold text-solar-text-heading disabled:opacity-50"
        @click="refreshActiveTab"
      >
        تحديث السجلات
      </button>
    </div>

    <section
      v-if="
        loading[activeTab]
        || (!loaded[activeTab] && !errors[activeTab])
      "
      role="status"
      aria-live="polite"
      class="rounded-xl border border-solar-border-card bg-white p-12 text-center"
    >
      <Loader2
        class="mx-auto size-8 animate-spin text-amber-600"
        aria-hidden="true"
      />

      <p class="mt-4 text-sm text-solar-text-muted">
        جارٍ تحميل السجلات…
      </p>
    </section>

    <section
      v-else-if="errors[activeTab]"
      role="alert"
      class="rounded-xl border border-red-200 bg-red-50 p-5"
    >
      <p class="text-sm leading-7 text-red-800">
        {{ errors[activeTab] }}
      </p>

      <button
        type="button"
        :disabled="actionBusy"
        class="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-bold text-red-800 disabled:opacity-50"
        @click="refreshActiveTab"
      >
        إعادة المحاولة
      </button>
    </section>

    <template v-else>
      <p
        role="status"
        aria-live="polite"
        class="text-sm text-solar-text-muted"
      >
        عدد النتائج: {{ resultCount }}
      </p>

      <section
        v-if="!resultCount"
        class="rounded-xl border border-dashed border-solar-border-card bg-white p-12 text-center"
      >
        <h2 class="text-lg font-bold text-solar-text-heading">
          {{
            hasFilters
              ? 'لا توجد نتائج تطابق البحث'
              : activeTab === 'orders'
                ? 'لا توجد طلبات شراء مسجلة'
                : 'لا توجد طلبات عروض أسعار مسجلة'
          }}
        </h2>

        <button
          v-if="hasFilters"
          type="button"
          class="mt-5 rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark"
          @click="resetFilters"
        >
          إلغاء التصفية
        </button>

        <NuxtLink
          v-else
          to="/customer/products"
          class="mt-5 inline-flex rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark"
        >
          تصفح المنتجات
        </NuxtLink>
      </section>

      <div
        v-else-if="activeTab === 'orders'"
        class="flex flex-col gap-4"
      >
        <article
          v-for="order in displayedOrders"
          :key="order.id"
          class="solar-card p-5"
        >
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0">
              <h2
                class="flex items-center gap-2 text-base font-bold text-solar-text-heading"
              >
                <Package class="size-5 shrink-0" aria-hidden="true" />
                {{ order.order_number || `الطلب #${order.id}` }}
              </h2>

              <p class="mt-3 text-xs text-solar-text-muted">
                تاريخ الإنشاء: {{ formatDate(order.created_at) }}
              </p>
            </div>

            <span
              class="rounded-full px-3 py-1 text-xs font-bold"
              :class="statusClasses(order.status)"
            >
              {{ statusLabel(order.status, 'orders') }}
            </span>
          </div>

          <dl class="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-xs text-solar-text-muted">
                إجمالي الطلب المسجل
              </dt>

              <dd class="mt-2 font-bold text-solar-text-heading">
                {{ formatAmount(order.total_amount) }}
              </dd>
            </div>

            <div>
              <dt class="text-xs text-solar-text-muted">
                المحافظة
              </dt>

              <dd class="mt-2 text-sm text-solar-text-heading">
                {{
                  order.governorate?.name
                    || order.governorate?.name_ar
                    || 'غير محددة'
                }}
              </dd>
            </div>

            <div class="sm:col-span-2">
              <dt class="text-xs text-solar-text-muted">
                عنوان التوصيل
              </dt>

              <dd
                class="mt-2 whitespace-pre-line break-words text-sm leading-7 text-solar-text-heading"
              >
                {{ order.delivery_address || 'غير متاح' }}
              </dd>
            </div>
          </dl>

          <NuxtLink
            :to="`/customer/orders/${order.id}/track`"
            class="mt-5 inline-flex rounded-lg bg-solar-yellow px-5 py-3 text-xs font-bold text-solar-navy-dark"
          >
            التفاصيل والإجراءات
          </NuxtLink>
        </article>
      </div>

      <div v-else class="flex flex-col gap-4">
        <article
          v-for="quote in displayedQuotes"
          :key="quote.id"
          class="solar-card p-5"
          :aria-busy="quoteAction?.id === quote.id"
        >
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2
                class="flex items-center gap-2 text-base font-bold text-solar-text-heading"
              >
                <FileText class="size-5 shrink-0" aria-hidden="true" />
                طلب عرض سعر #{{ quote.id }}
              </h2>

              <p class="mt-3 text-xs text-solar-text-muted">
                تاريخ الطلب: {{ formatDate(quote.created_at) }}
              </p>
            </div>

            <span
              class="rounded-full px-3 py-1 text-xs font-bold"
              :class="statusClasses(quote.status)"
            >
              {{ statusLabel(quote.status, 'quotes') }}
            </span>
          </div>

          <h3
            class="mt-5 break-words text-sm font-bold text-solar-text-heading"
          >
            {{ quote.store_product?.title || 'اسم المنتج غير متاح' }}
          </h3>

          <p class="mt-2 text-xs text-solar-text-muted">
            المتجر:
            {{ quote.store_product?.store?.company_name || 'غير متاح' }}
          </p>

          <p class="mt-2 text-xs text-solar-text-muted">
            الكمية: {{ quote.quantity }}
          </p>

          <p
            v-if="
              quote.customer_target_price !== null
              && quote.customer_target_price !== undefined
            "
            class="mt-2 text-xs text-solar-text-muted"
          >
            السعر المستهدف:
            {{ formatAmount(quote.customer_target_price) }}
          </p>

          <p
            v-if="quote.customer_notes"
            class="mt-4 whitespace-pre-line break-words text-sm leading-7 text-solar-text-body"
          >
            ملاحظاتك: {{ quote.customer_notes }}
          </p>

          <section
            v-if="quote.status !== 'pending'"
            class="mt-5 rounded-xl bg-solar-bg-subtle p-4"
            aria-label="رد المتجر"
          >
            <dl class="grid gap-4 sm:grid-cols-2">
              <div>
                <dt class="text-xs text-solar-text-muted">
                  سعر الوحدة المقدم
                </dt>

                <dd class="mt-2 font-bold text-solar-text-heading">
                  {{ formatAmount(quote.offered_unit_price) }}
                </dd>
              </div>

              <div>
                <dt class="text-xs text-solar-text-muted">
                  إجمالي العرض
                </dt>

                <dd class="mt-2 font-bold text-solar-text-heading">
                  {{ formatAmount(quote.total_price) }}
                </dd>
              </div>
            </dl>

            <p
              v-if="quote.store_notes"
              class="mt-4 whitespace-pre-line break-words text-sm leading-7 text-solar-text-body"
            >
              ملاحظات المتجر: {{ quote.store_notes }}
            </p>

            <p
              v-if="quote.responded_at"
              class="mt-3 text-xs text-solar-text-muted"
            >
              تاريخ الرد: {{ formatDate(quote.responded_at) }}
            </p>

            <p
              v-if="quote.accepted_at"
              class="mt-3 text-xs text-solar-text-muted"
            >
              تاريخ الموافقة: {{ formatDate(quote.accepted_at) }}
            </p>
          </section>

          <div class="mt-5 flex flex-wrap gap-3">
            <button
              v-if="quote.status === 'responded'"
              type="button"
              :disabled="!canAcceptQuote(quote)"
              class="rounded-lg bg-solar-yellow px-5 py-3 text-xs font-bold text-solar-navy-dark disabled:opacity-50"
              @click="decideQuote(quote, 'accept')"
            >
              {{
                quoteAction?.id === quote.id
                && quoteAction.decision === 'accept'
                  ? 'جارٍ الحفظ…'
                  : 'الموافقة على العرض'
              }}
            </button>

            <button
              v-if="['pending', 'responded'].includes(quote.status)"
              type="button"
              :disabled="!canRejectQuote(quote)"
              class="rounded-lg border border-red-200 px-5 py-3 text-xs font-bold text-red-700 disabled:opacity-50"
              @click="decideQuote(quote, 'reject')"
            >
              {{
                quoteAction?.id === quote.id
                && quoteAction.decision === 'reject'
                  ? 'جارٍ الحفظ…'
                  : quote.status === 'pending'
                    ? 'إلغاء طلب التسعير'
                    : 'رفض العرض'
              }}
            </button>
          </div>
        </article>
      </div>

      <nav
        v-if="totalPages > 1"
        class="flex flex-wrap items-center justify-center gap-4"
        aria-label="صفحات السجلات"
      >
        <button
          type="button"
          :disabled="currentPage === 1"
          class="rounded-lg border border-solar-border-card bg-white px-4 py-2 text-sm disabled:opacity-40"
          @click="currentPage--"
        >
          السابق
        </button>

        <span class="text-sm text-solar-text-muted">
          الصفحة {{ currentPage }} من {{ totalPages }}
        </span>

        <button
          type="button"
          :disabled="currentPage === totalPages"
          class="rounded-lg border border-solar-border-card bg-white px-4 py-2 text-sm disabled:opacity-40"
          @click="currentPage++"
        >
          التالي
        </button>
      </nav>
    </template>
  </div>
</template>