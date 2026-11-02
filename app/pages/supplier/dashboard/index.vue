
<script setup lang="ts">
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ClipboardCheck,
  FileClock,
  FileText,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  TriangleAlert
} from 'lucide-vue-next'

definePageMeta({
  layout: 'supplier'
})

useSeoMeta({
  title: 'الرئيسية | بوابة المورد - SolarHub'
})

// استخدام Composable الموجود في المشروع
const dashboard = useSupplierDashboard()

const today = ref('')
const initialLoaded = ref(false)
const lastUpdated = ref('')

const loading = computed(() =>
  !initialLoaded.value ||
  dashboard.isLoading.value
)

// لا نعرض أصفارًا مضللة عند فشل تحميل البيانات
const statsAvailable = computed(() =>
  initialLoaded.value &&
  !dashboard.isLoading.value &&
  !dashboard.error.value
)

// قد تكون قوائم المتابعة جزئية إذا زاد عدد السجلات
const followUpCountsAvailable = computed(() =>
  statsAvailable.value &&
  !dashboard.hasPartialData.value
)

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '—'

  return new Intl.NumberFormat(
    'ar-YE-u-nu-latn'
  ).format(value)
}

function metric(value: number): string {
  return statsAvailable.value
    ? formatNumber(value)
    : '—'
}

function followUpDescription(
  count: number,
  exactMessage: string,
  partialMessage: string
): string {
  if (!followUpCountsAvailable.value) {
    return partialMessage
  }

  return `${formatNumber(count)} ${exactMessage}`
}

async function loadDashboard() {
  try {
    await dashboard.refresh()

    if (!dashboard.error.value) {
      lastUpdated.value =
        new Date().toLocaleTimeString(
          'ar-YE-u-nu-latn',
          {
            hour: 'numeric',
            minute: '2-digit'
          }
        )
    }
  } finally {
    initialLoaded.value = true
  }
}

onMounted(() => {
  today.value =
    new Date().toLocaleDateString(
      'ar-YE-u-nu-latn',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }
    )

  void loadDashboard()
})
</script>

<template>
  <div
    dir="rtl"
    class="mx-auto flex w-full max-w-[1120px]
           min-w-0 flex-col gap-6 pb-6"
  >
    <!-- التاريخ وتحديث البيانات -->
    <div
      class="flex flex-wrap items-center
             justify-between gap-3"
    >
      <div
        class="inline-flex min-h-10 items-center
               gap-2.5 rounded-xl border
               border-[#e1e6f5] bg-solar-bg-card
               px-3.5 py-2 text-xs font-bold
               text-solar-text-body shadow-sm
               dark:border-solar-border-card"
      >
        <CalendarDays
          class="size-4 shrink-0 text-amber-600
                 dark:text-amber-400"
          :stroke-width="2"
          aria-hidden="true"
        />

        <span>
          {{ today || 'جارٍ تحديد التاريخ...' }}
        </span>
      </div>

      <button
        type="button"
        class="inline-flex min-h-10 items-center
               gap-2 rounded-xl border
               border-solar-border-card
               bg-solar-bg-card px-3.5 py-2
               text-xs font-bold
               text-solar-text-heading shadow-sm
               transition-colors
               hover:border-solar-status-info
               hover:bg-solar-status-info-bg
               disabled:cursor-not-allowed
               disabled:opacity-50"
        :disabled="loading"
        @click="loadDashboard"
      >
        <RefreshCw
          class="size-4 text-solar-status-info"
          :class="{
            'animate-spin': loading
          }"
          aria-hidden="true"
        />

        تحديث البيانات
      </button>
    </div>

    <!-- بطاقة الترحيب -->
    <section
      class="relative overflow-hidden
             rounded-[15px] border
             border-[#e0e6fb]
             bg-[linear-gradient(115deg,#ffffff_0%,#f4f5ff_100%)]
             px-5 py-6
             shadow-[0_1px_3px_rgba(12,37,60,0.045)]
             dark:border-solar-border-card
             dark:bg-none dark:bg-solar-bg-card
             sm:px-7 sm:py-7"
    >
      <div
        class="relative z-10 flex flex-wrap
               items-start justify-between gap-4"
      >
        <div class="min-w-0 flex-1">
          <div
            class="flex flex-wrap items-center
                   gap-x-3 gap-y-2"
          >
            <h1
              class="break-words text-xl
                     font-extrabold leading-relaxed
                     text-solar-text-heading
                     sm:text-[25px] lg:text-[27px]"
            >
              مرحباً بك،
              {{ dashboard.storeName.value }}
            </h1>

            <!-- شارة اعتماد المتجر -->
            <span
              v-if="dashboard.isApproved.value"
              class="inline-flex shrink-0
                     items-center gap-1.5
                     rounded-full border
                     border-emerald-200
                     bg-emerald-50 px-2.5 py-1
                     text-[11px] font-bold
                     text-emerald-700
                     dark:border-emerald-900
                     dark:bg-emerald-950/40
                     dark:text-emerald-300"
            >
              <ShieldCheck
                class="size-3.5"
                aria-hidden="true"
              />

              متجر معتمد
            </span>
          </div>

          <p
            class="mt-2 text-xs leading-7
                   text-solar-text-secondary
                   sm:text-sm"
          >
            من هنا يمكنك متابعة أهم مؤشرات
            متجرك ومبيعاتك بسهولة.
          </p>
        </div>

        <!-- أيقونة الترحيب الذهبية -->
        <div
          class="hidden size-12 shrink-0
                 items-center justify-center
                 rounded-2xl border
                 border-amber-200/60
                 bg-solar-yellow-tint
                 text-amber-600
                 dark:border-amber-900
                 dark:bg-amber-950/30
                 dark:text-amber-300 sm:flex"
        >
          <Sparkles
            class="size-6"
            :stroke-width="1.8"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>

    <!-- رسالة الخطأ -->
    <div
      v-if="dashboard.error.value"
      role="alert"
      class="flex flex-wrap items-start
             gap-3 rounded-xl border
             border-solar-status-danger/30
             bg-solar-status-danger-bg
             px-4 py-3.5 text-sm
             text-solar-status-danger-text"
    >
      <TriangleAlert
        class="mt-0.5 size-5 shrink-0"
        aria-hidden="true"
      />

      <p class="min-w-0 flex-1 leading-6">
        {{ dashboard.error.value }}
      </p>

      <button
        type="button"
        class="shrink-0 font-bold underline
               disabled:opacity-50"
        :disabled="loading"
        @click="loadDashboard"
      >
        إعادة المحاولة
      </button>
    </div>

    <!-- تنبيه البيانات الجزئية -->
    <div
      v-if="
        !dashboard.error.value &&
        dashboard.hasPartialData.value
      "
      class="flex items-start gap-2.5
             rounded-xl border border-amber-200
             bg-amber-50 px-4 py-3
             text-xs leading-6 text-amber-800
             dark:border-amber-900
             dark:bg-amber-950/30
             dark:text-amber-300"
    >
      <TriangleAlert
        class="mt-0.5 size-4 shrink-0"
        aria-hidden="true"
      />

      بعض قوائم المتابعة محسوبة من السجلات
      المحمّلة فقط؛ افتح القسم المختص للاطلاع
      على جميع السجلات.
    </div>

    <!-- بطاقات إحصائيات المتجر -->
    <section
      aria-label="إحصائيات المتجر"
      class="grid grid-cols-1 gap-4
             md:grid-cols-3"
    >
      <!-- بطاقة إجمالي المنتجات -->
      <NuxtLink
        to="/supplier/products"
        class="group flex min-h-[112px]
               items-center justify-between
               gap-4 rounded-[14px]
               border border-solar-border-card/45
               bg-solar-bg-card px-5 py-5
               shadow-[0_1px_3px_rgba(12,37,60,0.04)]
               transition-all
               hover:-translate-y-0.5
               hover:border-blue-200
               hover:shadow-card
               focus-visible:outline-none
               focus-visible:ring-2
               focus-visible:ring-solar-yellow"
      >
        <div class="min-w-0">
          <p
            class="text-[12px] font-bold
                   text-solar-text-secondary"
          >
            إجمالي المنتجات
          </p>

          <p
            class="mt-1.5 text-[27px]
                   font-extrabold leading-none
                   tabular-nums
                   text-solar-text-heading"
          >
            {{
              metric(
                dashboard.productCount.value
              )
            }}
          </p>

          <p
            class="mt-1.5 text-[11px]
                   text-solar-text-muted"
          >
            منتج مسجل
          </p>
        </div>

        <!-- أيقونة المنتجات الزرقاء -->
        <span
          class="flex size-12 shrink-0
                 items-center justify-center
                 rounded-[13px]
                 bg-[#e9efff] text-[#2563eb]
                 transition-transform
                 group-hover:scale-105
                 dark:bg-blue-950/40
                 dark:text-blue-300"
        >
          <Package
            class="size-6"
            :stroke-width="1.9"
            aria-hidden="true"
          />
        </span>
      </NuxtLink>

      <!-- بطاقة طلبات الشراء -->
      <NuxtLink
        to="/supplier/orders"
        class="group flex min-h-[112px]
               items-center justify-between
               gap-4 rounded-[14px]
               border border-solar-border-card/45
               bg-solar-bg-card px-5 py-5
               shadow-[0_1px_3px_rgba(12,37,60,0.04)]
               transition-all
               hover:-translate-y-0.5
               hover:border-emerald-200
               hover:shadow-card
               focus-visible:outline-none
               focus-visible:ring-2
               focus-visible:ring-solar-yellow"
      >
        <div class="min-w-0">
          <p
            class="text-[12px] font-bold
                   text-solar-text-secondary"
          >
            طلبات الشراء
          </p>

          <p
            class="mt-1.5 text-[27px]
                   font-extrabold leading-none
                   tabular-nums
                   text-solar-text-heading"
          >
            {{
              metric(
                dashboard.orderCount.value
              )
            }}
          </p>

          <p
            class="mt-1.5 text-[11px]
                   text-solar-text-muted"
          >
            إجمالي الطلبات الواردة
          </p>
        </div>

        <!-- أيقونة الطلبات الخضراء -->
        <span
          class="flex size-12 shrink-0
                 items-center justify-center
                 rounded-[13px]
                 bg-emerald-50 text-emerald-600
                 transition-transform
                 group-hover:scale-105
                 dark:bg-emerald-950/40
                 dark:text-emerald-300"
        >
          <ShoppingBag
            class="size-6"
            :stroke-width="1.9"
            aria-hidden="true"
          />
        </span>
      </NuxtLink>

      <!-- بطاقة عروض الأسعار -->
      <NuxtLink
        to="/supplier/quotes"
        class="group flex min-h-[112px]
               items-center justify-between
               gap-4 rounded-[14px]
               border border-solar-border-card/45
               bg-solar-bg-card px-5 py-5
               shadow-[0_1px_3px_rgba(12,37,60,0.04)]
               transition-all
               hover:-translate-y-0.5
               hover:border-amber-200
               hover:shadow-card
               focus-visible:outline-none
               focus-visible:ring-2
               focus-visible:ring-solar-yellow"
      >
        <div class="min-w-0">
          <p
            class="text-[12px] font-bold
                   text-solar-text-secondary"
          >
            طلبات عروض الأسعار
          </p>

          <p
            class="mt-1.5 text-[27px]
                   font-extrabold leading-none
                   tabular-nums
                   text-solar-text-heading"
          >
            {{
              metric(
                dashboard.quoteCount.value
              )
            }}
          </p>

          <p
            class="mt-1.5 text-[11px]
                   text-solar-text-muted"
          >
            طلبات عروض واردة
          </p>
        </div>

        <!-- أيقونة عروض الأسعار الذهبية -->
        <span
          class="flex size-12 shrink-0
                 items-center justify-center
                 rounded-[13px]
                 bg-amber-50 text-amber-600
                 transition-transform
                 group-hover:scale-105
                 dark:bg-amber-950/40
                 dark:text-amber-300"
        >
          <FileText
            class="size-6"
            :stroke-width="1.9"
            aria-hidden="true"
          />
        </span>
      </NuxtLink>
    </section>

    <!-- قسم متابعة المتجر -->
    <section
      aria-labelledby="supplier-followup-title"
      class="rounded-[15px] border
             border-solar-border-card/45
             bg-solar-bg-card px-4 py-5
             shadow-[0_1px_3px_rgba(12,37,60,0.04)]
             sm:px-6 sm:py-6"
    >
      <!-- عنوان القسم -->
      <div
        class="mb-4 flex flex-wrap
               items-center justify-between
               gap-3 border-b
               border-solar-border-card/60
               pb-4"
      >
        <h2
          id="supplier-followup-title"
          class="text-base font-extrabold
                 text-solar-text-heading
                 sm:text-lg"
        >
          متابعة المتجر
        </h2>

        <div
          class="flex items-center gap-2
                 text-[11px]
                 text-solar-text-muted"
        >
          <BadgeCheck
            class="size-4 text-solar-status-info"
            aria-hidden="true"
          />

          <span
            v-if="
              lastUpdated &&
              !dashboard.error.value
            "
          >
            آخر تحديث: {{ lastUpdated }}
          </span>

          <span v-else>
            أهم المهام التي تحتاج متابعة
          </span>
        </div>
      </div>

      <!-- قائمة المهام -->
      <div class="flex flex-col gap-2.5">
        <!-- الطلبات بانتظار التجهيز -->
        <NuxtLink
          to="/supplier/orders"
          class="group flex min-h-[76px]
                 flex-wrap items-center
                 gap-3.5 rounded-[13px]
                 bg-[#f5f6ff] px-4 py-3.5
                 transition-colors
                 hover:bg-[#edf1ff]
                 focus-visible:outline-none
                 focus-visible:ring-2
                 focus-visible:ring-solar-yellow
                 dark:bg-solar-bg-subtle
                 dark:hover:bg-[#22344b]
                 sm:flex-nowrap"
        >
          <!-- أيقونة الشحن -->
          <span
            class="flex size-11 shrink-0
                   items-center justify-center
                   rounded-xl bg-amber-100
                   text-amber-700
                   dark:bg-amber-950/40
                   dark:text-amber-300"
          >
            <Truck
              class="size-5"
              :stroke-width="1.9"
              aria-hidden="true"
            />
          </span>

          <div class="min-w-0 flex-1">
            <h3
              class="text-xs font-extrabold
                     leading-6
                     text-solar-text-heading
                     sm:text-[13px]"
            >
              طلبات الشراء بانتظار التجهيز
            </h3>

            <p
              class="mt-0.5 text-[11px]
                     leading-5
                     text-solar-text-secondary"
            >
              {{
                followUpDescription(
                  dashboard.pendingOrders.value.length,
                  'طلبات تحتاج تأكيد وشحن للعملاء',
                  'راجع الطلبات الواردة وتأكد من حالة التجهيز والشحن'
                )
              }}
            </p>
          </div>

          <span
            class="mr-auto inline-flex
                   shrink-0 items-center gap-1.5
                   text-[11px] font-extrabold
                   text-amber-700
                   dark:text-amber-300"
          >
            مراجعة

            <ArrowLeft
              class="size-3.5 transition-transform
                     group-hover:-translate-x-1"
              aria-hidden="true"
            />
          </span>
        </NuxtLink>

        <!-- طلبات عروض الأسعار -->
        <NuxtLink
          to="/supplier/quotes"
          class="group flex min-h-[76px]
                 flex-wrap items-center
                 gap-3.5 rounded-[13px]
                 bg-[#f5f6ff] px-4 py-3.5
                 transition-colors
                 hover:bg-[#edf1ff]
                 focus-visible:outline-none
                 focus-visible:ring-2
                 focus-visible:ring-solar-yellow
                 dark:bg-solar-bg-subtle
                 dark:hover:bg-[#22344b]
                 sm:flex-nowrap"
        >
          <!-- أيقونة التسعير -->
          <span
            class="flex size-11 shrink-0
                   items-center justify-center
                   rounded-xl bg-orange-100
                   text-orange-700
                   dark:bg-orange-950/40
                   dark:text-orange-300"
          >
            <FileClock
              class="size-5"
              :stroke-width="1.9"
              aria-hidden="true"
            />
          </span>

          <div class="min-w-0 flex-1">
            <h3
              class="text-xs font-extrabold
                     leading-6
                     text-solar-text-heading
                     sm:text-[13px]"
            >
              طلبات عروض الأسعار الواردة (RFQ)
            </h3>

            <p
              class="mt-0.5 text-[11px]
                     leading-5
                     text-solar-text-secondary"
            >
              {{
                followUpDescription(
                  dashboard.pendingQuotes.value.length,
                  'طلبات تسعير جديدة بانتظار رد المتجر',
                  'راجع طلبات التسعير الواردة وقدّم عروضك للعملاء'
                )
              }}
            </p>
          </div>

          <span
            class="mr-auto inline-flex
                   shrink-0 items-center gap-1.5
                   text-[11px] font-extrabold
                   text-amber-700
                   dark:text-amber-300"
          >
            تقديم تسعير

            <ArrowLeft
              class="size-3.5 transition-transform
                     group-hover:-translate-x-1"
              aria-hidden="true"
            />
          </span>
        </NuxtLink>

        <!-- المنتجات المنخفضة في المخزون -->
        <NuxtLink
          to="/supplier/products"
          class="group flex min-h-[76px]
                 flex-wrap items-center
                 gap-3.5 rounded-[13px]
                 bg-[#f5f6ff] px-4 py-3.5
                 transition-colors
                 hover:bg-[#edf1ff]
                 focus-visible:outline-none
                 focus-visible:ring-2
                 focus-visible:ring-solar-yellow
                 dark:bg-solar-bg-subtle
                 dark:hover:bg-[#22344b]
                 sm:flex-nowrap"
        >
          <!-- أيقونة المخزون -->
          <span
            class="flex size-11 shrink-0
                   items-center justify-center
                   rounded-xl bg-blue-100
                   text-blue-700
                   dark:bg-blue-950/40
                   dark:text-blue-300"
          >
            <ClipboardCheck
              class="size-5"
              :stroke-width="1.9"
              aria-hidden="true"
            />
          </span>

          <div class="min-w-0 flex-1">
            <h3
              class="text-xs font-extrabold
                     leading-6
                     text-solar-text-heading
                     sm:text-[13px]"
            >
              المنتجات المنخفضة في المخزون
            </h3>

            <p
              class="mt-0.5 text-[11px]
                     leading-5
                     text-solar-text-secondary"
            >
              {{
                followUpDescription(
                  dashboard.lowStock.value.length,
                  'منتجات متبقي منها 5 قطع أو أقل',
                  'راجع كميات المنتجات وتأكد من توفر المخزون'
                )
              }}
            </p>
          </div>

          <span
            class="mr-auto inline-flex
                   shrink-0 items-center gap-1.5
                   text-[11px] font-extrabold
                   text-amber-700
                   dark:text-amber-300"
          >
            تحديث المخزون

            <ArrowLeft
              class="size-3.5 transition-transform
                     group-hover:-translate-x-1"
              aria-hidden="true"
            />
          </span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
