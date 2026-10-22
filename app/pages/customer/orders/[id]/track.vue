<script setup lang="ts">
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  ShieldCheck,
  Store,
  Truck,
  User,
  XCircle,
} from 'lucide-vue-next'
import { useCustomerOrders, type ApiOrder, type ApiOrderStore } from '~~/app/composables/useCustomerOrders'

definePageMeta({
  layout: 'customer',
})

const route = useRoute()
const orderId = Array.isArray(route.params.id) ? (route.params.id[0] ?? '') : (route.params.id ?? '')

const {
  fetchOrderDetails,
  confirmDelivery,
  cancelOrder,
  isLoading,
  isActionLoading,
  error,
} = useCustomerOrders()

const order = ref<ApiOrder | null>(null)
const actionSuccessMessage = ref<string | null>(null)
const actionErrorMessage = ref<string | null>(null)

// حساب مراحل التتبع وفقاً للحالة الحقيقية للطلب في قاعدة البيانات
const trackingSteps = computed(() => {
  if (!order.value) return []

  const status = order.value.status
  const isCancelled = status === 'cancelled'

  if (isCancelled) {
    return [
      {
        title: 'تم إنشاء الطلب',
        time: order.value.created_at ? new Date(order.value.created_at).toLocaleDateString('ar-SA') : 'مكتمل',
        description: 'تم تسجيل الطلب في المنصة.',
        status: 'completed',
      },
      {
        title: 'تم إلغاء الطلب',
        time: 'طلب ملغي',
        description: 'تم إلغاء هذا الطلب ولا يمكن استكمال إجراءات شحنه.',
        status: 'cancelled',
      },
    ]
  }

  const steps = [
    {
      title: 'تم تأكيد الطلب وحجزه إلكترونياً',
      time: order.value.created_at ? new Date(order.value.created_at).toLocaleString('ar-SA') : '',
      description: 'تم تسجيل طلب الشراء وإرساله للمتاجر والمستودعات المعتمدة.',
      status: 'completed',
    },
    {
      title: 'تجهيز الشحنة وفحص الجودة بالمستودع',
      time: status !== 'pending' ? 'مكتمل' : 'قيد الإجراء',
      description: 'فحص الألواح والمحولات ومطابقة كود السلامة وضمان التغليف.',
      status: status === 'pending' ? 'current' : 'completed',
    },
    {
      title: 'تسليم الشحنة للناقل المعتمد',
      time: ['shipped', 'delivered', 'completed'].includes(status) ? 'مكتمل' : 'قيد التجهيز',
      description: 'نقل آمن بواسطة أسطول مجهز ومؤمن ضد الكسر والاهتزاز.',
      status: ['shipped', 'delivered', 'completed'].includes(status) ? 'completed' : status === 'processing' ? 'current' : 'upcoming',
    },
    {
      title: 'الشحنة في طريقها إلى موقعك',
      time: ['delivered', 'completed'].includes(status) ? 'تم الوصول' : status === 'shipped' ? 'جاري التوصيل' : 'بانتظار التحرك',
      description: `مندوب الشحن يتجه إلى العنوان: ${order.value.delivery_address}`,
      status: ['delivered', 'completed'].includes(status) ? 'completed' : status === 'shipped' ? 'current' : 'upcoming',
    },
    {
      title: 'التسليم النهائي واعتماد المطابقة',
      time: status === 'completed' ? 'تمت المطابقة' : 'المرحلة الأخيرة',
      description: 'فحص الصناديق وسلامة الأختام والتوقيع على استلام الطلبية.',
      status: status === 'completed' ? 'completed' : status === 'delivered' ? 'current' : 'upcoming',
    },
  ]

  return steps
})

// نص ولون شارة الحالة
const statusBadge = computed(() => {
  if (!order.value) return { text: 'جاري التحميل', class: 'badge-info' }
  switch (order.value.status) {
    case 'pending':
      return { text: 'بانتظار بدء التجهيز', class: 'badge-warning' }
    case 'processing':
      return { text: 'قيد التجهيز بالمستودع', class: 'badge-info' }
    case 'shipped':
      return { text: 'الشحنة في طريقها إليك', class: 'badge-info animate-pulse' }
    case 'delivered':
      return { text: 'تم التسليم بالموقع', class: 'badge-success' }
    case 'completed':
      return { text: 'مكتمل ومعتمد', class: 'badge-success' }
    case 'cancelled':
      return { text: 'تم إلغاء الطلب', class: 'badge-error' }
    default:
      return { text: order.value.status, class: 'badge-info' }
  }
})

// تأكيد استلام فرع المتجر
async function handleConfirmDelivery(orderStoreId: number) {
  if (!confirm('هل تأكدت من استلام كافة المعدات ومطابقتها وترغب في اعتماد التسليم النهائي؟')) {
    return
  }

  actionErrorMessage.value = null
  actionSuccessMessage.value = null

  try {
    await confirmDelivery(orderStoreId)
    actionSuccessMessage.value = 'تم تأكيد استلام الشحنة واعتماد الطلب بنجاح!'
    // إعادة تحميل تفاصيل الطلب
    order.value = await fetchOrderDetails(orderId)
  } catch (err: any) {
    actionErrorMessage.value = err?.userMessage || err?.message || 'حدث خطأ أثناء تأكيد الاستلام.'
  }
}

// إلغاء الطلب
async function handleCancelOrder() {
  if (!order.value) return
  if (!confirm('هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟')) return

  actionErrorMessage.value = null
  actionSuccessMessage.value = null

  try {
    const updated = await cancelOrder(order.value.id)
    order.value = updated
    actionSuccessMessage.value = 'تم إلغاء الطلب بنجاح.'
  } catch (err: any) {
    actionErrorMessage.value = err?.userMessage || err?.message || 'تعذر إلغاء الطلب.'
  }
}

onMounted(async () => {
  if (orderId) {
    order.value = await fetchOrderDetails(orderId)
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/customer/dashboard" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <NuxtLink to="/customer/orders" class="hover:text-solar-text-heading">طلباتي</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading">تتبع الطلب #{{ order?.order_number || orderId }}</span>
    </nav>

    <!-- مؤشر التحميل -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-24">
      <Loader2 class="size-10 animate-spin text-solar-yellow mb-4" />
      <p class="text-sm font-semibold text-solar-text-muted">جاري تحميل بيانات الشحنة والمسار اللحظي...</p>
    </div>

    <!-- رسالة الخطأ -->
    <div
      v-else-if="error || !order"
      class="flex flex-col items-center justify-center rounded-2xl border border-solar-border-card bg-white p-12 text-center shadow-sm"
    >
      <div class="flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
        <AlertCircle class="size-8" />
      </div>
      <h2 class="text-lg font-bold text-solar-text-heading mb-2">تعذر العثور على بيانات هذا الطلب</h2>
      <p class="text-xs text-solar-text-muted max-w-sm mb-6">
        {{ error || 'الطلب المطلوب غير موجود أو ليس لديك صلاحية الاطلاع عليه.' }}
      </p>
      <NuxtLink to="/customer/orders" class="btn-primary text-xs px-6 py-2.5">
        العودة لسجل طلباتي
      </NuxtLink>
    </div>

    <!-- بطاقة التتبع الحية -->
    <div v-else class="flex flex-col gap-6">
      <!-- تنبيهات النجاح والخطأ في الإجراءات -->
      <div v-if="actionSuccessMessage" class="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs text-emerald-800 border border-emerald-200">
        <CheckCircle2 class="size-5 shrink-0" />
        <span>{{ actionSuccessMessage }}</span>
      </div>
      <div v-if="actionErrorMessage" class="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs text-red-800 border border-red-200">
        <AlertCircle class="size-5 shrink-0" />
        <span>{{ actionErrorMessage }}</span>
      </div>

      <!-- بطاقة رأس التتبع وحالة الشحنة -->
      <div class="rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-solar-border-card pb-4">
          <div class="flex items-center gap-3">
            <div class="flex size-12 items-center justify-center rounded-2xl bg-solar-status-info-bg text-solar-status-info-text">
              <Truck class="size-6" :class="order.status === 'shipped' ? 'animate-pulse' : ''" />
            </div>
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <h1 class="text-xl font-black text-solar-navy-dark">تتبع الشحنة #{{ order.order_number }}</h1>
                <span class="text-xs font-bold px-2.5 py-1 rounded-lg" :class="statusBadge.class">
                  {{ statusBadge.text }}
                </span>
              </div>
              <span class="text-xs text-solar-text-muted">
                تاريخ الطلب: {{ new Date(order.created_at).toLocaleDateString('ar-SA') }} • الإجمالي: {{ Number(order.total_amount).toLocaleString() }} ر.س
              </span>
            </div>
          </div>

          <!-- أزرار الإجراءات السريعة -->
          <div class="flex items-center gap-2">
            <!-- زر إلغاء الطلب إن كان قيد الانتظار -->
            <button
              v-if="order.status === 'pending'"
              type="button"
              @click="handleCancelOrder"
              :disabled="isActionLoading"
              class="btn-outline h-9 px-3.5 text-xs text-red-600 hover:bg-red-50 hover:border-red-300 gap-1.5"
            >
              <XCircle class="size-3.5" />
              <span>إلغاء الطلب</span>
            </button>
          </div>
        </div>

        <!-- الخط الزمني لمراحل التتبع (Timeline) -->
        <div class="relative mt-8 pr-4">
          <div class="absolute top-3 bottom-3 right-7 w-0.5 bg-solar-border-card" />

          <div class="flex flex-col gap-8">
            <div
              v-for="(step, index) in trackingSteps"
              :key="index"
              class="relative flex items-start gap-5 pr-8"
            >
              <!-- أيقونة المرحلة -->
              <div
                class="absolute right-0 z-10 flex size-6 items-center justify-center rounded-full border-2 bg-white"
                :class="[
                  step.status === 'completed' ? 'border-emerald-500 bg-emerald-500 text-white' : '',
                  step.status === 'current' ? 'border-solar-yellow bg-solar-yellow text-solar-navy-dark ring-4 ring-solar-yellow/20' : '',
                  step.status === 'upcoming' ? 'border-gray-300 text-gray-300' : '',
                  step.status === 'cancelled' ? 'border-red-500 bg-red-500 text-white' : '',
                ]"
              >
                <CheckCircle2 v-if="step.status === 'completed'" class="size-4" />
                <Clock v-else-if="step.status === 'current'" class="size-3.5" />
                <span v-else-if="step.status === 'cancelled'" class="text-xs font-bold">✕</span>
                <span v-else class="size-2 rounded-full bg-gray-300" />
              </div>

              <!-- تفاصيل المرحلة -->
              <div class="flex flex-col gap-1 text-right flex-1">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span
                    class="text-sm font-bold"
                    :class="[
                      step.status === 'completed' || step.status === 'current' ? 'text-solar-text-heading' : 'text-solar-text-muted',
                      step.status === 'cancelled' ? 'text-red-600' : '',
                    ]"
                  >
                    {{ step.title }}
                  </span>
                  <span class="text-xs text-solar-text-muted">{{ step.time }}</span>
                </div>
                <p class="text-xs leading-relaxed text-solar-text-secondary">
                  {{ step.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- شبكة تفاصيل المنتجات والموردين وعنوان الاستلام -->
      <div class="grid gap-6 lg:grid-cols-12">
        <!-- المنتجات والمتاجر المشاركة في الطلب (8 أعمدة) -->
        <div class="lg:col-span-8 flex flex-col gap-4">
          <div class="rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm">
            <h2 class="text-base font-bold text-solar-text-heading mb-4 flex items-center gap-2">
              <Package class="size-5 text-solar-yellow" />
              <span>محتويات الشحنة والموردون المعتمدون</span>
            </h2>

            <div v-if="order.order_stores && order.order_stores.length > 0" class="flex flex-col gap-4">
              <div
                v-for="storeBranch in order.order_stores"
                :key="storeBranch.id"
                class="rounded-xl border border-solar-border-card p-4 flex flex-col gap-3"
              >
                <div class="flex items-center justify-between border-b border-solar-border-card pb-2.5">
                  <div class="flex items-center gap-2">
                    <Store class="size-4 text-solar-navy-dark" />
                    <span class="text-xs font-bold text-solar-text-heading">
                      المورد: {{ storeBranch.store?.company_name || 'متجر معتمد' }}
                    </span>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="text-[11px] font-bold px-2 py-0.5 rounded" :class="storeBranch.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'">
                      {{ storeBranch.status }}
                    </span>

                    <!-- زر تأكيد الاستلام لهذا الفرع -->
                    <button
                      v-if="['shipped', 'delivered'].includes(storeBranch.status)"
                      type="button"
                      @click="handleConfirmDelivery(storeBranch.id)"
                      :disabled="isActionLoading"
                      class="btn-primary text-xs px-3 py-1 gap-1"
                    >
                      <CheckCircle2 class="size-3.5" />
                      <span>تأكيد الاستلام</span>
                    </button>
                  </div>
                </div>

                <!-- عناصر المشتريات التابعة لهذا المتجر -->
                <div v-if="storeBranch.items" class="flex flex-col gap-2">
                  <div
                    v-for="it in storeBranch.items"
                    :key="it.id"
                    class="flex items-center justify-between text-xs py-1"
                  >
                    <div class="flex items-center gap-2">
                      <span class="size-5 rounded bg-solar-bg-subtle flex items-center justify-center font-bold text-[10px]">
                        {{ it.quantity }}x
                      </span>
                      <span class="font-semibold text-solar-text-heading">
                        {{ it.store_product?.master_product?.title || 'معدة طاقة شمسية' }}
                      </span>
                    </div>
                    <span class="font-bold text-solar-navy-dark">
                      {{ Number(it.total_price).toLocaleString() }} ر.س
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-xs text-solar-text-muted py-4">
              تم تسجيل هذا الطلب بنجاح، جاري تحضير عناصر الشحنة.
            </div>
          </div>
        </div>

        <!-- معلومات التوصيل والتواصل (4 أعمدة) -->
        <div class="lg:col-span-4 flex flex-col gap-4">
          <!-- بطاقة موقع التوصيل -->
          <div class="rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm flex flex-col gap-3">
            <h3 class="text-sm font-bold text-solar-text-heading flex items-center gap-2 border-b border-solar-border-card pb-2">
              <MapPin class="size-4 text-solar-yellow" />
              <span>موقع وعنوان التسليم</span>
            </h3>

            <div class="flex flex-col gap-1 text-xs">
              <span class="text-solar-text-muted">المنطقة / المحافظة:</span>
              <span class="font-bold text-solar-text-heading">{{ order.governorate?.name_ar || 'اليمن' }}</span>
            </div>

            <div class="flex flex-col gap-1 text-xs">
              <span class="text-solar-text-muted">العنوان التفصيلي:</span>
              <span class="font-semibold text-solar-text-heading">{{ order.delivery_address }}</span>
            </div>
          </div>

          <!-- بطاقة الضمان والدعم المباشر -->
          <div class="rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm flex flex-col gap-3">
            <h3 class="text-sm font-bold text-solar-text-heading flex items-center gap-2 border-b border-solar-border-card pb-2">
              <ShieldCheck class="size-4 text-emerald-600" />
              <span>حماية المشتري وضمان SolarHub</span>
            </h3>

            <p class="text-xs text-solar-text-muted leading-relaxed">
              أموالك محفوظة في حساب الضمان حتى تقوم بمعاينة وتأكيد استلام كافة المعدات بالموقع والتوقيع على نموذج المطابقة الفنية.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
