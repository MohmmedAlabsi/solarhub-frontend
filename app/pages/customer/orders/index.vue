<script setup lang="ts">
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  Package,
  Search,
  ShoppingBag,
  Store,
  Truck,
  X,
  XCircle,
} from 'lucide-vue-next'
import {
  useCustomerOrders,
  type ApiOrder,
  type ApiQuoteRequest,
} from '~~/app/composables/useCustomerOrders'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'طلباتي وعروض الأسعار | SolarHub',
  description: 'متابعة أوامر الشراء وحالات الشحن والتوصيل وطلبات عروض الأسعار الهندسية.',
})

const route = useRoute()
const router = useRouter()

const activeTab = ref<'orders' | 'quotes'>((route.query.tab as string) === 'quotes' ? 'quotes' : 'orders')
const searchQuery = ref('')

const {
  orders,
  quoteRequests,
  fetchMyOrders,
  fetchMyQuoteRequests,
  cancelOrder,
  acceptQuoteRequest,
  rejectQuoteRequest,
  isLoading,
  isActionLoading,
  error,
} = useCustomerOrders()

const actionNotice = ref<string | null>(null)

function setTab(tab: 'orders' | 'quotes') {
  activeTab.value = tab
  router.push({ query: { ...route.query, tab: tab === 'quotes' ? 'quotes' : undefined } })
}

watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab === 'quotes') {
      activeTab.value = 'quotes'
    } else {
      activeTab.value = 'orders'
    }
  }
)

// تصفية أوامر الشراء
const filteredOrders = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return orders.value
  return orders.value.filter((o) => {
    return (
      o.order_number.toLowerCase().includes(q) ||
      o.delivery_address.toLowerCase().includes(q) ||
      (o.governorate?.name_ar && o.governorate.name_ar.toLowerCase().includes(q))
    )
  })
})

// تصفية طلبات عروض الأسعار
const filteredQuotes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return quoteRequests.value
  return quoteRequests.value.filter((qr) => {
    const title = qr.store_product?.master_product?.title || ''
    const store = qr.store_product?.store?.company_name || ''
    return (
      String(qr.id).includes(q) ||
      title.toLowerCase().includes(q) ||
      store.toLowerCase().includes(q)
    )
  })
})

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return { text: 'قيد الانتظار', class: 'bg-amber-100 text-amber-800 border-amber-200' }
    case 'processing':
    case 'accepted':
      return { text: 'قيد التجهيز', class: 'bg-blue-100 text-blue-800 border-blue-200' }
    case 'shipped':
      return { text: 'في طريقها إليك', class: 'bg-indigo-100 text-indigo-800 border-indigo-200 animate-pulse' }
    case 'delivered':
      return { text: 'تم التسليم بالموقع', class: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
    case 'completed':
      return { text: 'مكتمل ومعتمد', class: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
    case 'cancelled':
    case 'rejected':
      return { text: 'ملغي / مرفوض', class: 'bg-red-100 text-red-800 border-red-200' }
    case 'responded':
      return { text: 'تم استلام عرض السعر', class: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold' }
    default:
      return { text: status, class: 'bg-gray-100 text-gray-800 border-gray-200' }
  }
}

// إلغاء طلب شراء
async function handleCancelOrder(orderId: number) {
  if (!confirm('هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟')) return
  try {
    await cancelOrder(orderId)
    actionNotice.value = 'تم إلغاء الطلب بنجاح.'
    setTimeout(() => { actionNotice.value = null }, 3500)
  } catch (err: any) {
    alert(err?.userMessage || 'تعذر إلغاء الطلب.')
  }
}

// قبول عرض سعر
async function handleAcceptQuote(quoteId: number) {
  if (!confirm('هل توافق على عرض السعر والمواصفات المقدمة من المورد؟')) return
  try {
    await acceptQuoteRequest(quoteId)
    actionNotice.value = 'تم قبول عرض السعر بنجاح، سيقوم المورد بالتواصل لإتمام التجهيز.'
    setTimeout(() => { actionNotice.value = null }, 4000)
  } catch (err: any) {
    alert(err?.userMessage || 'تعذر قبول عرض السعر.')
  }
}

// رفض عرض سعر
async function handleRejectQuote(quoteId: number) {
  if (!confirm('هل أنت متأكد من رفض أو إلغاء طلب عرض السعر هذا؟')) return
  try {
    await rejectQuoteRequest(quoteId)
    actionNotice.value = 'تم تحديث حالة طلب عرض السعر.'
    setTimeout(() => { actionNotice.value = null }, 3500)
  } catch (err: any) {
    alert(err?.userMessage || 'تعذر رفض عرض السعر.')
  }
}

onMounted(async () => {
  await Promise.allSettled([
    fetchMyOrders(),
    fetchMyQuoteRequests(),
  ])
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted">
      <NuxtLink to="/customer/dashboard" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading">طلباتي وعروض الأسعار</span>
    </nav>

    <!-- شريط العنوان والتبويبات -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-solar-text-heading">طلباتي وعروض الأسعار</h1>
        <p class="text-xs text-solar-text-muted">متابعة شحنات المعدات وأوامر الشراء وعروض الأسعار الفنية للمشاريع</p>
      </div>

      <!-- تبديل التبويبات -->
      <div class="flex items-center rounded-xl bg-solar-bg-subtle p-1 border border-solar-border-card text-xs font-bold w-full sm:w-auto">
        <button
          type="button"
          @click="setTab('orders')"
          class="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-lg px-4 py-2 transition-all cursor-pointer"
          :class="activeTab === 'orders' ? 'bg-solar-yellow text-solar-navy-dark shadow-sm' : 'text-solar-text-secondary hover:text-solar-text-heading'"
        >
          <ShoppingBag class="size-4" />
          <span>أوامر الشراء ({{ orders.length }})</span>
        </button>

        <button
          type="button"
          @click="setTab('quotes')"
          class="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-lg px-4 py-2 transition-all cursor-pointer"
          :class="activeTab === 'quotes' ? 'bg-solar-navy text-white shadow-sm' : 'text-solar-text-secondary hover:text-solar-text-heading'"
        >
          <FileText class="size-4" />
          <span>عروض الأسعار RFQ ({{ quoteRequests.length }})</span>
        </button>
      </div>
    </div>

    <!-- إشعار النجاح -->
    <div v-if="actionNotice" class="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs text-emerald-800 border border-emerald-200">
      <CheckCircle2 class="size-5 shrink-0" />
      <span>{{ actionNotice }}</span>
    </div>

    <!-- شريط البحث السريع -->
    <div class="flex items-center gap-3 rounded-2xl border border-solar-border-card bg-white p-3 shadow-sm">
      <Search class="size-4 text-solar-text-muted mr-2" />
      <input
        v-model="searchQuery"
        type="search"
        :placeholder="activeTab === 'orders' ? 'ابحث برقم الطلب، المحافظة، العنوان...' : 'ابحث برقم الطلب، اسم المنتج، اسم المورد...'"
        class="solar-input border-0 bg-transparent py-1 text-xs focus:ring-0"
      />
    </div>

    <!-- مؤشر التحميل الأولي -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <Loader2 class="size-10 animate-spin text-solar-yellow mb-4" />
      <p class="text-sm font-semibold text-solar-text-muted">جاري تحميل السجلات من خادم المنصة...</p>
    </div>

    <!-- 1. تبويب أوامر الشراء (Orders) -->
    <div v-else-if="activeTab === 'orders'" class="flex flex-col gap-4">
      <div v-if="filteredOrders.length > 0" class="flex flex-col gap-3">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-solar-border-card bg-white p-5 shadow-sm transition-all hover:border-solar-yellow/50"
        >
          <!-- تفاصيل الطلب -->
          <div class="flex items-start gap-4 flex-1">
            <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-solar-status-info-bg text-solar-status-info-text">
              <Package class="size-6" />
            </div>

            <div class="flex flex-col gap-1 text-right flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-black text-solar-navy-dark">#{{ order.order_number }}</span>
                <span
                  class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border"
                  :class="getStatusBadge(order.status).class"
                >
                  {{ getStatusBadge(order.status).text }}
                </span>
                <span class="text-xs text-solar-text-muted">
                  {{ new Date(order.created_at).toLocaleDateString('ar-SA') }}
                </span>
              </div>

              <p class="text-xs text-solar-text-body truncate">
                موقع التوصيل: {{ order.governorate?.name_ar || 'اليمن' }} • {{ order.delivery_address }}
              </p>

              <div class="flex items-center gap-3 text-xs text-solar-text-muted mt-0.5">
                <span class="font-bold text-solar-navy-dark text-sm">
                  {{ Number(order.total_amount).toLocaleString() }} ر.س
                </span>
                <span>•</span>
                <span>{{ order.order_stores?.length || 1 }} فروع متاجر معتمدة</span>
              </div>
            </div>
          </div>

          <!-- الأزرار والإجراءات -->
          <div class="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
            <button
              v-if="order.status === 'pending'"
              type="button"
              @click="handleCancelOrder(order.id)"
              :disabled="isActionLoading"
              class="btn-outline text-xs px-3 py-2 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              إلغاء الطلب
            </button>

            <NuxtLink
              :to="`/customer/orders/${order.id}/track`"
              class="btn-primary text-xs px-4 py-2 gap-1.5"
            >
              <Truck class="size-3.5" />
              <span>تتبع الشحنة</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- الحالة الفارغة لأوامر الشراء -->
      <div
        v-else
        class="flex flex-col items-center justify-center rounded-2xl border border-solar-border-card bg-white p-12 text-center shadow-sm"
      >
        <div class="flex size-20 items-center justify-center rounded-full bg-solar-bg-subtle text-solar-text-muted mb-4">
          <ShoppingBag class="size-10 stroke-[1.5]" />
        </div>
        <h3 class="text-lg font-bold text-solar-text-heading mb-1">لا توجد أوامر شراء مسجلة حالياً</h3>
        <p class="text-xs text-solar-text-muted max-w-sm mb-6">
          لم تقم بتأكيد أي طلبات شراء بعد. استكشف كتالوج المنتجات واحصل على أفضل عروض الطاقة الشمسية.
        </p>
        <NuxtLink to="/customer/products" class="btn-primary text-xs px-6 py-2.5 gap-2">
          <span>تصفح كتالوج المنتجات</span>
          <ArrowLeft class="size-4" />
        </NuxtLink>
      </div>
    </div>

    <!-- 2. تبويب طلبات عروض الأسعار (RFQ) -->
    <div v-else-if="activeTab === 'quotes'" class="flex flex-col gap-4">
      <div v-if="filteredQuotes.length > 0" class="flex flex-col gap-3">
        <div
          v-for="quote in filteredQuotes"
          :key="quote.id"
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-solar-border-card bg-white p-5 shadow-sm transition-all hover:border-solar-yellow/50"
        >
          <!-- تفاصيل العرض -->
          <div class="flex items-start gap-4 flex-1">
            <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-solar-bg-subtle text-solar-text-heading">
              <FileText class="size-6 text-amber-600" />
            </div>

            <div class="flex flex-col gap-1 text-right flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-black text-solar-navy-dark">طلب عرض سعر #RFQ-{{ quote.id }}</span>
                <span
                  class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border"
                  :class="getStatusBadge(quote.status).class"
                >
                  {{ getStatusBadge(quote.status).text }}
                </span>
                <span class="text-xs text-solar-text-muted">
                  {{ new Date(quote.created_at).toLocaleDateString('ar-SA') }}
                </span>
              </div>

              <h4 class="text-xs font-bold text-solar-text-heading truncate">
                {{ quote.store_product?.master_product?.title || 'معدة طاقة شمسية' }}
              </h4>

              <div class="flex items-center gap-3 text-xs text-solar-text-muted flex-wrap">
                <span>المورد: <strong class="text-solar-text-heading">{{ quote.store_product?.store?.company_name || 'وكيل معتمد' }}</strong></span>
                <span>•</span>
                <span>الكمية: <strong>{{ quote.quantity }} وحدة</strong></span>
                <span v-if="quote.customer_target_price">•</span>
                <span v-if="quote.customer_target_price">السعر المستهدف: {{ quote.customer_target_price }} ر.س</span>
              </div>

              <!-- عرض السعر المقدم من المورد إن وجد -->
              <div v-if="quote.store_offered_price" class="mt-2 rounded-xl bg-amber-50 p-2.5 border border-amber-200 text-xs">
                <div class="flex items-center justify-between font-bold text-amber-900">
                  <span>السعر المقدم من المورد:</span>
                  <span class="text-sm font-black text-solar-navy-dark">{{ Number(quote.store_offered_price).toLocaleString() }} ر.س</span>
                </div>
                <p v-if="quote.store_notes" class="text-[11px] text-amber-800 mt-1">
                  ملاحظات المورد: {{ quote.store_notes }}
                </p>
              </div>
            </div>
          </div>

          <!-- أزرار الإجراءات للعميل -->
          <div class="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
            <!-- إذا كان المورد قد رد بعرض سعر -->
            <template v-if="quote.status === 'responded'">
              <button
                type="button"
                @click="handleAcceptQuote(quote.id)"
                :disabled="isActionLoading"
                class="btn-primary text-xs px-3.5 py-2 gap-1"
              >
                <Check class="size-3.5" />
                <span>قبول العرض</span>
              </button>

              <button
                type="button"
                @click="handleRejectQuote(quote.id)"
                :disabled="isActionLoading"
                class="btn-outline text-xs px-3 py-2 text-red-600 hover:bg-red-50"
              >
                رفض
              </button>
            </template>

            <!-- إذا كان بانتظار الرد -->
            <button
              v-else-if="quote.status === 'pending'"
              type="button"
              @click="handleRejectQuote(quote.id)"
              :disabled="isActionLoading"
              class="btn-outline text-xs px-3 py-2 text-red-600 hover:bg-red-50"
            >
              إلغاء الطلب
            </button>
          </div>
        </div>
      </div>

      <!-- الحالة الفارغة لعروض الأسعار -->
      <div
        v-else
        class="flex flex-col items-center justify-center rounded-2xl border border-solar-border-card bg-white p-12 text-center shadow-sm"
      >
        <div class="flex size-20 items-center justify-center rounded-full bg-solar-bg-subtle text-solar-text-muted mb-4">
          <FileText class="size-10 stroke-[1.5]" />
        </div>
        <h3 class="text-lg font-bold text-solar-text-heading mb-1">لا توجد طلبات عروض أسعار مسجلة</h3>
        <p class="text-xs text-solar-text-muted max-w-sm mb-6">
          يمكنك طلب عروض أسعار مباشرة ومخصصة لمشاريعك عبر كتالوج المنتجات.
        </p>
        <NuxtLink to="/customer/products" class="btn-primary text-xs px-6 py-2.5 gap-2">
          <span>طلب تسعير من الكتالوج</span>
          <ArrowLeft class="size-4" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
