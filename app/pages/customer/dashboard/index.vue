<script setup lang="ts">
import {
  FileText,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Wrench,
  Zap,
} from 'lucide-vue-next'
import DashboardActionCard from '../../../components/customer/dashboard/DashboardActionCard.vue'
import RecentActivityList from '../../../components/customer/dashboard/RecentActivityList.vue'
import { useAuthStore } from '~/stores/auth'
import { useCustomerDashboard } from '~/composables/useCustomerDashboard'

definePageMeta({ layout: 'customer' })

useSeoMeta({
  title: 'لوحة تحكم العميل | SolarHub',
  description: 'مرحبًا بك في بوابة العميل لمنصة سولار هب لمتابعة مشتريات وخدمات الطاقة الشمسية.',
})

const authStore = useAuthStore()
const {
  actions,
  activities,
  ordersCount,
  quotesCount,
  servicesCount,
  cartItemsCount,
  isLoading,
  loadDashboard,
} = useCustomerDashboard()

const userName = computed(() => authStore.user?.name || 'عميلنا العزيز')

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- رأس لوحة التحكم والترحيب -->
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div class="flex flex-col gap-1.5">
        <h1 class="flex items-center gap-2 text-2xl font-black text-solar-text-heading md:text-3xl">
          <span>مرحبًا بك، {{ userName }}</span>
          <span class="inline-block animate-wave">👋</span>
        </h1>
        <p class="text-xs sm:text-sm text-solar-text-muted">
          استكشف المنتجات والمعدات الشمسية، وتواصل مع المهندسين المعتمدين لتنفيذ ومتابعة مشاريعك بكل سهولة.
        </p>
      </div>

      <button
        type="button"
        @click="loadDashboard"
        :disabled="isLoading"
        class="flex size-10 items-center justify-center rounded-xl border border-solar-border-card bg-white text-solar-text-body hover:bg-solar-bg-subtle transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
        title="تحديث البيانات"
      >
        <RefreshCw class="size-4" :class="{ 'animate-spin': isLoading }" />
      </button>
    </header>

    <!-- شريط الإحصائيات السريعة للعميل -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <!-- أوامر الشراء -->
      <NuxtLink
        to="/customer/orders"
        class="group flex items-center justify-between rounded-2xl border border-solar-border-card bg-white p-4 shadow-xs transition-all hover:border-amber-300 hover:shadow-sm"
      >
        <div class="flex flex-col">
          <span class="text-[11px] text-solar-text-muted">أوامر الشراء</span>
          <span class="text-xl font-black text-solar-text-heading">{{ ordersCount }}</span>
        </div>
        <div class="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
          <ShoppingBag class="size-5" />
        </div>
      </NuxtLink>

      <!-- طلبات عروض الأسعار -->
      <NuxtLink
        to="/customer/orders?tab=quotes"
        class="group flex items-center justify-between rounded-2xl border border-solar-border-card bg-white p-4 shadow-xs transition-all hover:border-amber-300 hover:shadow-sm"
      >
        <div class="flex flex-col">
          <span class="text-[11px] text-solar-text-muted">عروض الأسعار</span>
          <span class="text-xl font-black text-solar-text-heading">{{ quotesCount }}</span>
        </div>
        <div class="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
          <FileText class="size-5" />
        </div>
      </NuxtLink>

      <!-- طلبات الخدمات الهندسية -->
      <NuxtLink
        to="/customer/services"
        class="group flex items-center justify-between rounded-2xl border border-solar-border-card bg-white p-4 shadow-xs transition-all hover:border-amber-300 hover:shadow-sm"
      >
        <div class="flex flex-col">
          <span class="text-[11px] text-solar-text-muted">الخدمات الهندسية</span>
          <span class="text-xl font-black text-solar-text-heading">{{ servicesCount }}</span>
        </div>
        <div class="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
          <Wrench class="size-5" />
        </div>
      </NuxtLink>

      <!-- سلة المشتريات -->
      <NuxtLink
        to="/customer/cart"
        class="group flex items-center justify-between rounded-2xl border border-solar-border-card bg-white p-4 shadow-xs transition-all hover:border-amber-300 hover:shadow-sm"
      >
        <div class="flex flex-col">
          <span class="text-[11px] text-solar-text-muted">منتجات في السلة</span>
          <span class="text-xl font-black text-solar-text-heading">{{ cartItemsCount }}</span>
        </div>
        <div class="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
          <ShoppingCart class="size-5" />
        </div>
      </NuxtLink>
    </div>

    <!-- شبكة بطاقات الإجراءات السريعة -->
    <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardActionCard v-for="action in actions" :key="action.id" :action="action" />
    </div>

    <!-- قسم آخر النشاطات الحقيقية -->
    <section class="flex flex-col gap-4" aria-labelledby="recent-heading">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2 id="recent-heading" class="text-lg font-bold text-solar-text-heading">آخر النشاطات والطلبات</h2>
          <p class="text-xs text-solar-text-muted">متابعة فورية ومباشرة لأحدث طلبات الشراء واستجابات الموردين والمهندسين</p>
        </div>
        <NuxtLink
          to="/customer/orders"
          class="text-xs font-semibold text-solar-text-muted hover:text-solar-text-heading transition-colors"
        >
          عرض سجل الطلبات الكامل ←
        </NuxtLink>
      </div>

      <!-- حالة التحميل -->
      <div
        v-if="isLoading && activities.length === 0"
        class="flex flex-col items-center justify-center rounded-2xl border border-solar-border-card bg-white p-8 text-center shadow-xs"
      >
        <Loader2 class="size-6 animate-spin text-amber-500 mb-2" />
        <p class="text-xs text-solar-text-muted">جارٍ تحميل آخر النشاطات...</p>
      </div>

      <!-- قائمة النشاطات الحقيقية -->
      <RecentActivityList v-else-if="activities.length > 0" :activities="activities" />

      <!-- حالة الخلو من النشاطات -->
      <div
        v-else
        class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-solar-border-card bg-white p-10 text-center"
      >
        <div class="flex size-12 items-center justify-center rounded-full bg-solar-bg-subtle text-solar-text-muted mb-3">
          <Zap class="size-6" />
        </div>
        <h3 class="text-sm font-bold text-solar-text-heading mb-1">لا توجد طلبات أو نشاطات حديثة حتى الآن</h3>
        <p class="max-w-md text-xs text-solar-text-muted mb-4">
          ابدأ بتصفح كتالوج الألواح والبطاريات أو أرسل طلباً لخدمة هندسية لتظهر جميع تحديثاتك هنا مباشرة.
        </p>
        <div class="flex items-center gap-3">
          <NuxtLink to="/customer/products" class="btn-primary text-xs px-4 py-2">
            تصفح المنتجات
          </NuxtLink>
          <NuxtLink to="/customer/services/new" class="btn-outline text-xs px-4 py-2">
            طلب استشارة
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
