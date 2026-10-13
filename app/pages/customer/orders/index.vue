<script setup lang="ts">
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Package,
  Search,
  ShoppingBag,
  Store,
  Truck,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'طلباتي وعروض الأسعار | SolarHub',
  description: 'متابعة أوامر الشراء وحالات الشحن والتوصيل وطلبات عروض الأسعار الهندسية.',
})

const route = useRoute()
const activeTab = ref<'orders' | 'quotes'>((route.query.tab as string) === 'quotes' ? 'quotes' : 'orders')

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

// أوامر الشراء المطابقة للتصميم
const orders = ref([
  {
    id: 'SH-8842',
    date: 'منذ 15 دقيقة',
    productName: 'لوح طاقة شمسية Jinko Tiger Pro 585W ثنائي الأوجه (عدد 2)',
    storeName: 'شركة شمس الرياض للمهمات الكهروضوئية',
    totalPrice: 4120,
    status: 'in_transit',
    statusLabel: 'شحنتك في طريقها إليك',
    badgeClass: 'badge-info',
  },
  {
    id: 'SH-8730',
    date: 'منذ 3 أيام',
    productName: 'بطارية ليثيوم Pylontech US5000 48V 4.8kWh',
    storeName: 'مؤسسة طاقة الصحراء للتوريدات',
    totalPrice: 6450,
    status: 'delivered',
    statusLabel: 'تم التسليم بنجاح',
    badgeClass: 'badge-success',
  },
  {
    id: 'SH-8612',
    date: '10 سبتمبر 2026',
    productName: 'إنفرتر شمسي هجين Growatt SPF 5000 ES',
    storeName: 'مجموعة الأمانة للطاقة',
    totalPrice: 3150,
    status: 'delivered',
    statusLabel: 'تم التسليم بنجاح',
    badgeClass: 'badge-success',
  },
])

// طلبات عروض الأسعار المطابقة للتصميم
const quotes = ref([
  {
    id: 'RFQ-1049',
    date: 'قبل ساعتين',
    productName: 'إنفرتر هجين Deye 8kW ثلاثي الأوجه',
    storeName: 'مؤسسة طاقة الصحراء للتوريدات المتقدمة',
    quantity: 4,
    status: 'received',
    statusLabel: 'تم استلام عرض السعر',
    badgeClass: 'badge-warning',
    offeredPrice: '23,800 ر.س',
  },
  {
    id: 'RFQ-1033',
    date: 'أمس',
    productName: 'منظومة ضخ مياه شمسية Grundfos SQFlex متكاملة',
    storeName: 'شركة نبراس الحلول',
    quantity: 2,
    status: 'reviewing',
    statusLabel: 'قيد المراجعة الفنية',
    badgeClass: 'badge-warning',
    offeredPrice: 'بانتظار العرض الفني',
  },
])
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted">
      <NuxtLink to="/customer/dashboard" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading">طلباتي وعروض الأسعار</span>
    </nav>

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-solar-text-heading">إدارة الطلبات وعروض الأسعار</h1>
        <p class="text-xs text-solar-text-muted">متابعة أوامر الشراء المباشرة وعروض الأسعار التنافسية من المتاجر</p>
      </div>

      <!-- تبويبات التبديل المتجاوبة -->
      <div class="flex items-center rounded-xl bg-white p-1 border border-solar-border-card text-xs font-bold shadow-sm w-full sm:w-auto overflow-x-auto">
        <button
          type="button"
          @click="activeTab = 'orders'"
          class="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-lg px-3 sm:px-4 py-2 transition-all whitespace-nowrap"
          :class="activeTab === 'orders' ? 'bg-solar-yellow text-solar-navy-dark shadow-sm font-black' : 'text-solar-text-muted hover:text-solar-text-heading'"
        >
          <ShoppingBag class="size-4 shrink-0" />
          <span>طلبات الشراء ({{ orders.length }})</span>
        </button>

        <button
          type="button"
          @click="activeTab = 'quotes'"
          class="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-lg px-3 sm:px-4 py-2 transition-all whitespace-nowrap"
          :class="activeTab === 'quotes' ? 'bg-solar-yellow text-solar-navy-dark shadow-sm font-black' : 'text-solar-text-muted hover:text-solar-text-heading'"
        >
          <FileText class="size-4 shrink-0" />
          <span>طلبات عروض الأسعار (RFQ) ({{ quotes.length }})</span>
        </button>
      </div>
    </div>

    <!-- تبويب 1: أوامر الشراء (طلباتي) -->
    <div v-if="activeTab === 'orders'" class="flex flex-col gap-4">
      <div
        v-for="order in orders"
        :key="order.id"
        class="flex flex-col gap-4 rounded-2xl border border-solar-border-card bg-white p-4 sm:p-5 shadow-sm transition-all hover:border-solar-yellow/50"
      >
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-solar-border-card pb-3">
          <div class="flex items-center gap-3">
            <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-bg-subtle text-solar-navy">
              <Package class="size-5" />
            </span>
            <div class="flex flex-col">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-black text-solar-navy-dark">طلب شراء #{{ order.id }}</span>
                <span :class="order.badgeClass" class="text-[10px]">{{ order.statusLabel }}</span>
              </div>
              <span class="text-[11px] text-solar-text-muted">{{ order.date }}</span>
            </div>
          </div>

          <div class="flex items-baseline gap-1 mr-auto sm:mr-0">
            <span class="text-base sm:text-lg font-black text-solar-navy-dark">{{ order.totalPrice.toLocaleString() }}</span>
            <span class="text-xs font-bold text-solar-text-muted">ر.س</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex flex-col gap-1 text-xs">
            <span class="font-bold text-solar-text-heading">{{ order.productName }}</span>
            <span class="text-solar-text-muted flex items-center gap-1">
              <Store class="size-3.5 shrink-0" />
              {{ order.storeName }}
            </span>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <NuxtLink
              :to="`/customer/orders/${order.id}/track`"
              class="btn-primary h-9 px-4 text-xs gap-1.5 w-full sm:w-auto justify-center"
            >
              <Truck class="size-4" />
              <span>تتبع مسار الشحنة</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- تبويب 2: عروض الأسعار (RFQ) -->
    <div v-else class="flex flex-col gap-4">
      <div
        v-for="quote in quotes"
        :key="quote.id"
        class="flex flex-col gap-4 rounded-2xl border border-solar-border-card bg-white p-4 sm:p-5 shadow-sm transition-all hover:border-solar-yellow/50"
      >
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-solar-border-card pb-3">
          <div class="flex items-center gap-3">
            <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <FileText class="size-5" />
            </span>
            <div class="flex flex-col">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-black text-solar-navy-dark">طلب عرض سعر #{{ quote.id }}</span>
                <span :class="quote.badgeClass" class="text-[10px]">{{ quote.statusLabel }}</span>
              </div>
              <span class="text-[11px] text-solar-text-muted">{{ quote.date }}</span>
            </div>
          </div>

          <div class="flex items-baseline gap-1 mr-auto sm:mr-0">
            <span class="text-sm sm:text-base font-bold text-solar-navy-dark">{{ quote.offeredPrice }}</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div class="flex flex-col gap-1">
            <span class="font-bold text-solar-text-heading">{{ quote.productName }} (الكمية: {{ quote.quantity }})</span>
            <span class="text-solar-text-muted flex items-center gap-1">
              <Store class="size-3.5 shrink-0" />
              المورد: {{ quote.storeName }}
            </span>
          </div>

          <button type="button" class="btn-dark h-9 px-4 text-xs w-full sm:w-auto justify-center">
            <span>استعراض كراسة العرض</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
