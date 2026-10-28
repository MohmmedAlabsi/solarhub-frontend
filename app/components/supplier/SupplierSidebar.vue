<script setup lang="ts">
import SupplierSidebarLink from './SupplierSidebarLink.vue'
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Star,
  Store,
  Wallet,
  X,
} from 'lucide-vue-next'

interface NavItem {
  label: string
  to: string
  icon: any
  badge?: number | string
}

const props = withDefaults(
  defineProps<{
    isCollapsed: boolean
    isMobile?: boolean
  }>(),
  {
    isMobile: false,
  }
)

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'closeMobile'): void
  (e: 'unavailable', label: string): void
}>()

const route = useRoute()
const { openLogoutModal } = useCustomerLogoutModal()

// 1. الرئيسية
const mainNav: NavItem[] = [
  { label: 'الرئيسية', to: '/supplier/dashboard', icon: Home },
]

// 2. العمليات التجارية والمالية (مهام المطور محمد)
const commercialNav: NavItem[] = [
  { label: 'إدارة المنتجات', to: '/supplier/products', icon: Package },
  { label: 'طلبات الشراء', to: '/supplier/orders', icon: ShoppingBag },
  { label: 'عروض الأسعار', to: '/supplier/quotes', icon: FileText },
  { label: 'المستحقات المالية', to: '/supplier/finance', icon: Wallet },
]

// 3. الإدارة العامة والتقييمات (مهام المطور عبد الباقي)
const managementNav: NavItem[] = [
  { label: 'بيانات المتجر', to: '/supplier/store', icon: Store },
  { label: 'التقييمات والآراء', to: '/supplier/reviews', icon: Star },
  { label: 'مركز الإشعارات', to: '/supplier/notifications', icon: Bell },
  { label: 'إعدادات الحساب', to: '/supplier/settings', icon: Settings },
]

const navigationGroups = computed<NavItem[][]>(() => [mainNav, commercialNav, managementNav])

function isActive(path: string) {
  if (path === '/supplier/dashboard') {
    return route.path === '/supplier/dashboard' || route.path === '/supplier'
  }
  return route.path === path || route.path.startsWith(path + '/')
}

function handleLinkClick() {
  if (props.isMobile) {
    emit('closeMobile')
  }
}
</script>

<template>
  <aside
    class="group/sidebar relative z-50 flex flex-col justify-between overflow-visible border border-white/10 bg-solar-navy shadow-2xl transition-all duration-300 ease-in-out select-none"
    :class="[
      isMobile ? 'h-full w-full' : (isCollapsed ? 'h-[calc(100dvh-1.5rem)] w-20 rounded-2xl' : 'h-[calc(100dvh-1.5rem)] w-64 rounded-2xl lg:w-72'),
    ]"
    aria-label="القائمة الجانبية لبوابة المورد"
  >
    <!-- زر طي / فتح السايدبار المكتبي -->
    <button
      v-if="!isMobile"
      type="button"
      @click="emit('toggle')"
      class="absolute top-24 -left-3.5 z-50 flex size-7 items-center justify-center rounded-full bg-solar-yellow text-solar-navy-dark shadow-md transition-transform hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-solar-navy cursor-pointer ring-2 ring-white/20 hover:ring-solar-yellow/50"
      :title="isCollapsed ? 'توسيع القائمة (Ctrl+B)' : 'طي القائمة (Ctrl+B)'"
      :aria-label="isCollapsed ? 'توسيع القائمة' : 'طي القائمة'"
    >
      <ChevronLeft v-if="isCollapsed" class="size-4 stroke-[2.5]" />
      <ChevronRight v-else class="size-4 stroke-[2.5]" />
    </button>

    <!-- زر إغلاق القائمة في الهواتف الذكية -->
    <button
      v-if="isMobile"
      type="button"
      @click="emit('closeMobile')"
      class="absolute top-5 left-4 z-50 flex size-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow"
      aria-label="إغلاق القائمة"
      data-drawer-close
    >
      <X class="size-5" />
    </button>

    <!-- رأس السايدبار وشعار المنصة -->
    <div class="flex shrink-0 items-center justify-center px-4 transition-all duration-300 h-20 border-b border-solar-navy-light/40 sm:h-24">
      <NuxtLink to="/supplier/dashboard" class="flex items-center justify-center" @click="handleLinkClick">
        <!-- الشعار المدمج في حالة الطي -->
        <img
          v-if="isCollapsed && !isMobile"
          src="/images/SH-logo.png"
          alt="SolarHub SH"
          class="h-10 sm:h-12 w-10 sm:w-12 object-contain transition-all duration-300 drop-shadow"
        />
        <!-- الشعار الكبير الشفاف في الحالة المفتوحة -->
        <img
          v-else
          src="/images/logo-expanded-transparent.png"
          alt="Solar Hub - Your Hub For Solar Solutions"
          class="h-12 sm:h-14 w-auto max-w-[180px] sm:max-w-[210px] object-contain transition-all duration-300"
        />
      </NuxtLink>
    </div>

    <!-- قائمة الروابط الرئيسية -->
    <nav class="flex-1 min-h-0 flex flex-col gap-1 overflow-y-auto p-2 sm:p-3" aria-label="التنقل في بوابة المورد">
      <template v-for="(group, index) in navigationGroups" :key="index">
        <hr v-if="index" class="my-1.5 border-solar-navy-light/40 sm:my-2" />
        <div class="flex flex-col gap-1">
          <SupplierSidebarLink
            v-for="item in group"
            :key="item.to"
            :label="item.label"
            :to="item.to"
            :icon="item.icon"
            :badge="item.badge"
            :collapsed="isCollapsed && !isMobile"
            :active="isActive(item.to)"
            @navigate="handleLinkClick"
          />
        </div>
      </template>
    </nav>

    <!-- زر تسجيل الخروج السفلي -->
    <div class="shrink-0 p-3 border-t border-solar-navy-light/40">
      <button
        type="button"
        @click="openLogoutModal"
        aria-label="تسجيل الخروج"
        class="group relative flex w-full items-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow text-red-200 hover:bg-red-500/20 hover:text-red-100 cursor-pointer"
        :class="[isCollapsed && !isMobile ? 'justify-center p-3 rounded-xl' : 'gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium']"
      >
        <LogOut class="size-5 shrink-0" />
        <span v-if="!isCollapsed || isMobile" class="truncate">تسجيل الخروج</span>

        <!-- Tooltip لتسجيل الخروج في وضع الطي -->
        <div
          v-if="isCollapsed && !isMobile"
          class="pointer-events-none absolute right-full mr-3.5 top-1/2 -translate-y-1/2 z-[100] hidden group-hover:flex items-center rounded-lg bg-rose-950 px-3 py-1.5 text-xs font-bold text-rose-100 shadow-2xl border border-rose-500/20 whitespace-nowrap drop-shadow-xl"
        >
          <span>تسجيل الخروج</span>
          <span class="absolute -right-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-rose-950" />
        </div>
      </button>
    </div>
  </aside>
</template>
