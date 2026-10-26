<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Package,
  Store,
} from 'lucide-vue-next'
import { useAuthStore } from '../../../../stores/auth'

definePageMeta({
  layout: 'customer',
})

interface ApiResponse<T> {
  status: string
  message?: string
  data: T
}

interface OrderItem {
  id: number
  product_title?: string | null
  quantity: number
  unit_price: number | string | null
  total_price: number | string | null
}

interface OrderBranch {
  id: number
  order_id: number
  status: string
  subtotal: number | string | null
  notes?: string | null
  delivered_at?: string | null
  customer_confirmed_at?: string | null
  created_at?: string | null

  store?: {
    id: number
    company_name?: string | null
    whatsapp_number?: string | null
  } | null

  items: OrderItem[]
}

interface OrderDetails {
  id: number
  order_number: string
  status: string
  total_amount: number | string | null
  delivery_address?: string | null
  created_at?: string | null

  customer?: {
    id: number | string
    name?: string | null
    phone?: string | null
  } | null

  governorate?: {
    id?: number | null
    name?: string | null
    name_ar?: string | null
  } | null

  order_stores: OrderBranch[]
}

interface RequestContext {
  id: number
  token: string
  owner: string
  version: number
}

type OrderAction = 'cancel' | number

const route = useRoute()
const authStore = useAuthStore()
const { $api } = useNuxtApp()

const order = ref<OrderDetails | null>(null)

const loading = ref(true)
const loadError = ref('')
const actionError = ref('')
const noticeMessage = ref('')

const needsRefresh = ref(true)
const activeAction = ref<OrderAction | null>(null)

let contextVersion = 0
let loadSequence = 0
let mounted = false
let disposed = false

const orderId = computed<number | null>(() => {
  const raw = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id

  const value = String(raw ?? '')

  if (!/^[1-9]\d*$/.test(value)) return null

  const id = Number(value)

  return Number.isSafeInteger(id) ? id : null
})

const branches = computed(() =>
  order.value?.order_stores || [],
)

const actionBusy = computed(() =>
  activeAction.value !== null,
)

const canAct = computed(() =>
  Boolean(order.value)
  && !loading.value
  && !loadError.value
  && !needsRefresh.value
  && !actionBusy.value,
)

const canCancel = computed(() =>
  canAct.value
  && order.value?.status === 'pending'
  && branches.value.every(branch => branch.status === 'pending'),
)

const completedBranches = computed(() =>
  branches.value.filter(branch => branch.status === 'completed').length,
)

function canConfirmDelivery(branch: OrderBranch): boolean {
  return canAct.value
    && order.value?.status !== 'cancelled'
    && branch.status === 'delivered'
}

function captureContext(): RequestContext | null {
  const id = orderId.value
  const token = authStore.token
  const owner = String(authStore.user?.id ?? '')

  if (id === null || !token || !owner) return null

  return {
    id,
    token,
    owner,
    version: contextVersion,
  }
}

function isCurrent(context: RequestContext): boolean {
  return !disposed
    && context.version === contextVersion
    && orderId.value === context.id
    && authStore.token === context.token
    && String(authStore.user?.id ?? '') === context.owner
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'قيد الانتظار',
    processing: 'قيد التجهيز',
    accepted: 'تم قبول الطلب',
    shipped: 'تم الشحن',
    delivered: 'تم تسجيل التسليم',
    completed: 'مكتمل',
    rejected: 'مرفوض',
    cancelled: 'ملغى',
  }

  return labels[status] || 'حالة غير معروفة'
}

function statusClasses(status: string): string {
  switch (status) {
    case 'completed':
    case 'delivered':
      return 'bg-emerald-50 text-emerald-800'

    case 'cancelled':
    case 'rejected':
      return 'bg-red-50 text-red-800'

    case 'shipped':
    case 'accepted':
    case 'processing':
      return 'bg-blue-50 text-blue-800'

    default:
      return 'bg-amber-50 text-amber-800'
  }
}

function formatAmount(value: unknown): string {
  if (
    value === null
    || value === undefined
    || String(value).trim() === ''
  ) {
    return 'غير متاح'
  }

  const amount = Number(value)

  if (!Number.isFinite(amount) || amount < 0) {
    return 'غير متاح'
  }

  return new Intl.NumberFormat('ar', {
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
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function validateOrder(
  result: OrderDetails,
  context: RequestContext,
) {
  if (
    !result
    || Number(result.id) !== context.id
    || !result.customer
    || String(result.customer.id) !== context.owner
    || !Array.isArray(result.order_stores)
  ) {
    throw new Error('Invalid order response')
  }

  const seen = new Set<number>()

  for (const branch of result.order_stores) {
    const id = Number(branch.id)

    if (
      !Number.isSafeInteger(id)
      || id <= 0
      || Number(branch.order_id) !== context.id
      || !Array.isArray(branch.items)
      || seen.has(id)
    ) {
      throw new Error('Invalid order branch')
    }

    seen.add(id)
  }
}

async function readOrder(): Promise<boolean> {
  const sequence = ++loadSequence
  const context = captureContext()

  loading.value = true
  loadError.value = ''
  needsRefresh.value = true

  if (!context) {
    order.value = null

    loadError.value = orderId.value === null
      ? 'معرّف الطلب غير صالح.'
      : 'سجّل الدخول لعرض طلبك.'

    loading.value = false
    return false
  }

  try {
    const response = await $api<ApiResponse<OrderDetails>>(
      `/my/orders/${context.id}`,
    )

    if (
      sequence !== loadSequence
      || !isCurrent(context)
    ) {
      return false
    }

    if (response.status !== 'success') {
      throw new Error('Order loading failed')
    }

    validateOrder(response.data, context)

    order.value = response.data
    needsRefresh.value = false

    return true
  } catch (failure: unknown) {
    if (
      sequence !== loadSequence
      || !isCurrent(context)
    ) {
      return false
    }

    const requestError = failure as {
      status?: number
      statusCode?: number
    }

    const status =
      requestError.statusCode ?? requestError.status

    if (status === 404) {
      loadError.value = 'الطلب غير موجود.'
    } else if (status === 403) {
      loadError.value = 'لا تملك صلاحية عرض هذا الطلب.'
    } else {
      loadError.value =
        'تعذر تحميل أحدث بيانات الطلب. أعد المحاولة.'
    }

    return false
  } finally {
    if (
      sequence === loadSequence
      && isCurrent(context)
    ) {
      loading.value = false
    }
  }
}

async function refreshOrder() {
  if (loading.value || actionBusy.value) return

  actionError.value = ''
  await readOrder()
}

async function performAction(action: OrderAction) {
  if (!canAct.value) return

  if (action === 'cancel') {
    if (!canCancel.value) return
  } else {
    const branch = branches.value.find(
      item => item.id === action,
    )

    if (!branch || !canConfirmDelivery(branch)) return
  }

  const context = captureContext()

  if (!context || !order.value) return

  activeAction.value = action
  actionError.value = ''
  noticeMessage.value = ''

  try {
    if (action === 'cancel') {
      const response = await $api<
        ApiResponse<Partial<OrderDetails>>
      >(`/my/orders/${context.id}/cancel`, {
        method: 'PATCH',
        retry: 0,
      })

      if (!isCurrent(context)) return

      if (
        response.status !== 'success'
        || !response.data
        || Number(response.data.id) !== context.id
        || response.data.status !== 'cancelled'
      ) {
        throw new Error('Cancellation was not confirmed')
      }

      order.value = {
        ...order.value!,
        ...response.data,
      }

      noticeMessage.value = 'تم إلغاء الطلب.'
    } else {
      const response = await $api<
        ApiResponse<OrderBranch>
      >(`/order-stores/${action}/confirm-delivery`, {
        method: 'PATCH',
        retry: 0,
      })

      if (!isCurrent(context)) return

      const updated = response.data

      if (
        response.status !== 'success'
        || !updated
        || Number(updated.id) !== action
        || Number(updated.order_id) !== context.id
        || updated.status !== 'completed'
      ) {
        throw new Error('Delivery confirmation failed')
      }

      order.value = {
        ...order.value!,
        order_stores: branches.value.map(branch =>
          branch.id === action
            ? { ...branch, ...updated }
            : branch,
        ),
      }

      noticeMessage.value =
        'تم تأكيد استلام منتجات هذا المتجر.'
    }

    // إعادة جلب الحالة الكاملة بعد نجاح الحفظ.
    await readOrder()
  } catch {
    if (!isCurrent(context)) return

    needsRefresh.value = true

    actionError.value =
      'تعذر تأكيد نتيجة العملية. حدّث بيانات الطلب للتحقق قبل المحاولة مجددًا.'
  } finally {
    if (isCurrent(context)) {
      activeAction.value = null
    }
  }
}

async function cancelOrder() {
  if (!canCancel.value) return

  const confirmed = window.confirm(
    'هل تريد إلغاء الطلب لجميع المتاجر؟',
  )

  if (!confirmed) return

  await performAction('cancel')
}

async function confirmDelivery(branch: OrderBranch) {
  if (!canConfirmDelivery(branch)) return

  const confirmed = window.confirm(
    'هل استلمت منتجات هذا المتجر وتريد تأكيد الاستلام؟',
  )

  if (!confirmed) return

  await performAction(branch.id)
}

watch(
  [
    orderId,
    () => authStore.token,
    () => String(authStore.user?.id ?? ''),
  ],
  () => {
    contextVersion++
    loadSequence++

    order.value = null
    activeAction.value = null
    actionError.value = ''
    noticeMessage.value = ''
    loadError.value = ''
    needsRefresh.value = true

    if (mounted) void readOrder()
  },
)

onMounted(() => {
  mounted = true
  void readOrder()
})

onBeforeUnmount(() => {
  disposed = true
  mounted = false
  contextVersion++
  loadSequence++
})

useSeoMeta({
  title: () => order.value
    ? `الطلب ${order.value.order_number} | SolarHub`
    : 'تفاصيل الطلب | SolarHub',
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

      <NuxtLink to="/customer/orders">
        طلباتي
      </NuxtLink>

      <span aria-hidden="true">‹</span>

      <span>تفاصيل الطلب</span>
    </nav>

    <header
      class="flex flex-wrap items-start justify-between gap-4"
    >
      <div>
        <h1 class="text-2xl font-bold text-solar-text-heading">
          تفاصيل الطلب وحالة متاجره
        </h1>

        <p class="mt-2 text-sm leading-7 text-solar-text-muted">
          تابع حالة كل جزء من الطلب بشكل مستقل عند تعدد المتاجر.
        </p>
      </div>

      <button
        type="button"
        :disabled="loading || actionBusy"
        class="rounded-lg border border-solar-border-card bg-white px-4 py-2 text-xs font-bold text-solar-text-heading disabled:opacity-50"
        @click="refreshOrder"
      >
        {{ loading ? 'جارٍ التحديث…' : 'تحديث الحالة' }}
      </button>
    </header>

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
        :disabled="loading || actionBusy"
        class="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-bold text-red-800 disabled:opacity-50"
        @click="refreshOrder"
      >
        التحقق من الحالة
      </button>
    </section>

    <section
      v-if="loading && !order"
      role="status"
      aria-live="polite"
      class="rounded-xl border border-solar-border-card bg-white p-12 text-center"
    >
      <Loader2
        class="mx-auto size-8 animate-spin text-amber-600"
        aria-hidden="true"
      />

      <p class="mt-4 text-sm text-solar-text-muted">
        جارٍ تحميل الطلب…
      </p>
    </section>

    <section
      v-if="loadError"
      role="alert"
      class="rounded-xl border border-red-200 bg-red-50 p-5"
    >
      <p class="text-sm leading-7 text-red-800">
        {{ loadError }}
      </p>

      <div class="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          :disabled="loading || actionBusy"
          class="rounded-lg bg-white px-4 py-2 text-sm font-bold text-red-800 disabled:opacity-50"
          @click="refreshOrder"
        >
          إعادة المحاولة
        </button>

        <NuxtLink
          to="/customer/orders"
          class="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-800"
        >
          سجل طلباتي
        </NuxtLink>
      </div>
    </section>

    <template v-if="order">
      <section class="solar-card p-5 sm:p-7">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 class="text-xl font-bold text-solar-text-heading">
              {{ order.order_number || `الطلب #${order.id}` }}
            </h2>

            <p class="mt-3 text-xs text-solar-text-muted">
              تاريخ الإنشاء: {{ formatDate(order.created_at) }}
            </p>
          </div>

          <span
            class="rounded-full px-3 py-2 text-xs font-bold"
            :class="statusClasses(order.status)"
          >
            الحالة العامة: {{ statusLabel(order.status) }}
          </span>
        </div>

        <dl class="mt-6 grid gap-5 sm:grid-cols-3">
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
              أجزاء الطلب لدى المتاجر
            </dt>

            <dd class="mt-2 font-bold text-solar-text-heading">
              {{ branches.length }}
            </dd>
          </div>

          <div>
            <dt class="text-xs text-solar-text-muted">
              الأجزاء المكتملة
            </dt>

            <dd class="mt-2 font-bold text-solar-text-heading">
              {{ completedBranches }} من {{ branches.length }}
            </dd>
          </div>
        </dl>

        <p class="mt-4 text-xs text-solar-text-muted">
          العملة غير محددة في بيانات الطلب.
        </p>

        <button
          v-if="canCancel || activeAction === 'cancel'"
          type="button"
          :disabled="!canCancel"
          class="mt-5 rounded-lg border border-red-200 bg-red-50 px-5 py-3 text-xs font-bold text-red-800 disabled:opacity-50"
          @click="cancelOrder"
        >
          {{ activeAction === 'cancel' ? 'جارٍ الإلغاء…' : 'إلغاء الطلب' }}
        </button>
      </section>

      <section
        class="solar-card p-5 sm:p-7"
        aria-labelledby="delivery-heading"
      >
        <h2
          id="delivery-heading"
          class="flex items-center gap-2 text-lg font-bold text-solar-text-heading"
        >
          <MapPin class="size-5" aria-hidden="true" />
          بيانات التوصيل
        </h2>

        <dl class="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <dt class="text-xs text-solar-text-muted">
              اسم العميل
            </dt>

            <dd class="mt-2 text-sm text-solar-text-heading">
              {{ order.customer?.name || 'غير متاح' }}
            </dd>
          </div>

          <div>
            <dt class="text-xs text-solar-text-muted">
              الهاتف
            </dt>

            <dd class="mt-2 text-sm text-solar-text-heading">
              <bdi>{{ order.customer?.phone || 'غير متاح' }}</bdi>
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
              العنوان
            </dt>

            <dd
              class="mt-2 whitespace-pre-line break-words text-sm leading-7 text-solar-text-heading"
            >
              {{ order.delivery_address || 'غير متاح' }}
            </dd>
          </div>
        </dl>
      </section>

      <section
        class="flex flex-col gap-5"
        aria-labelledby="branches-heading"
      >
        <h2
          id="branches-heading"
          class="flex items-center gap-2 text-xl font-bold text-solar-text-heading"
        >
          <Package class="size-5" aria-hidden="true" />
          منتجات الطلب وحالة كل متجر
        </h2>

        <div
          v-if="!branches.length"
          class="rounded-xl border border-dashed border-solar-border-card bg-white p-10 text-center text-sm text-solar-text-muted"
        >
          لا تتوفر تفاصيل أجزاء المتاجر لهذا الطلب.
        </div>

        <article
          v-for="branch in branches"
          :key="branch.id"
          class="solar-card min-w-0 p-5 sm:p-6"
          :aria-busy="activeAction === branch.id"
        >
          <header
            class="flex flex-wrap items-start justify-between gap-4"
          >
            <div>
              <h3
                class="flex items-center gap-2 text-base font-bold text-solar-text-heading"
              >
                <Store class="size-4" aria-hidden="true" />
                {{ branch.store?.company_name || 'متجر' }}
              </h3>

              <p class="mt-2 text-xs text-solar-text-muted">
                جزء الطلب #{{ branch.id }}
              </p>

              <p
                v-if="branch.store?.whatsapp_number"
                class="mt-2 text-xs text-solar-text-muted"
              >
                رقم التواصل:
                <bdi>{{ branch.store.whatsapp_number }}</bdi>
              </p>
            </div>

            <span
              class="rounded-full px-3 py-1 text-xs font-bold"
              :class="statusClasses(branch.status)"
            >
              {{ statusLabel(branch.status) }}
            </span>
          </header>

          <div
            v-if="branch.items.length"
            class="mt-5 overflow-x-auto"
          >
            <table class="w-full min-w-[440px] text-right text-xs">
              <thead class="bg-solar-bg-subtle text-solar-text-muted">
                <tr>
                  <th scope="col" class="p-3">المنتج</th>
                  <th scope="col" class="p-3">الكمية</th>
                  <th scope="col" class="p-3">سعر الوحدة</th>
                  <th scope="col" class="p-3">الإجمالي</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="item in branch.items"
                  :key="item.id"
                  class="border-b border-solar-border-card"
                >
                  <td class="p-3 leading-6 text-solar-text-heading">
                    {{ item.product_title || 'اسم المنتج غير متاح' }}
                  </td>

                  <td class="p-3 text-solar-text-body">
                    {{ item.quantity }}
                  </td>

                  <td class="p-3 text-solar-text-body">
                    {{ formatAmount(item.unit_price) }}
                  </td>

                  <td class="p-3 font-bold text-solar-text-heading">
                    {{ formatAmount(item.total_price) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p
            v-else
            class="mt-5 text-sm text-solar-text-muted"
          >
            لا تتوفر عناصر لهذا الجزء من الطلب.
          </p>

          <p class="mt-5 text-sm font-bold text-solar-text-heading">
            إجمالي منتجات المتجر:
            {{ formatAmount(branch.subtotal) }}
          </p>

          <p
            v-if="branch.notes"
            class="mt-4 whitespace-pre-line break-words rounded-lg bg-solar-bg-subtle p-3 text-xs leading-7 text-solar-text-body"
          >
            ملاحظات المتجر: {{ branch.notes }}
          </p>

          <dl class="mt-5 space-y-3 text-xs text-solar-text-muted">
            <div v-if="branch.delivered_at">
              <dt class="inline">تاريخ التسليم المسجل: </dt>
              <dd class="inline">
                {{ formatDate(branch.delivered_at) }}
              </dd>
            </div>

            <div v-if="branch.customer_confirmed_at">
              <dt class="inline">تاريخ تأكيد العميل للاستلام: </dt>
              <dd class="inline">
                {{ formatDate(branch.customer_confirmed_at) }}
              </dd>
            </div>
          </dl>

          <button
            v-if="branch.status === 'delivered'"
            type="button"
            :disabled="!canConfirmDelivery(branch)"
            class="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-solar-yellow px-5 py-3 text-xs font-bold text-solar-navy-dark disabled:opacity-50"
            @click="confirmDelivery(branch)"
          >
            <CheckCircle2 class="size-4" aria-hidden="true" />

            {{
              activeAction === branch.id
                ? 'جارٍ حفظ التأكيد…'
                : 'تأكيد استلام منتجات هذا المتجر'
            }}
          </button>
        </article>
      </section>
    </template>
  </div>
</template>