<script setup lang="ts">
import AdminSidebarLink from './AdminSidebarLink.vue'
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Database,
  FileText,
  Home,
  Loader2,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Star,
  Store,
  UserCheck,
  Users,
  ShieldCheck,
  X,
} from 'lucide-vue-next'

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
const { hasPermission } = useAdminPermissions()
const { logout } = useAuth()
const isLoggingOut = ref(false)

async function handleLogout() {
  isLoggingOut.value = true
  await logout()
}

const navItems = [
  { label: 'الرئيسية', to: '/admin', icon: Home, matchPrefixes: ['/admin/dashboard'] },
  { label: 'إدارة المستخدمين', to: '/admin/users', icon: Users, matchPrefixes: ['/admin/users'], permissions: ['users.manage'] },
  { label: 'إدارة الموردين', to: '/admin/stores', icon: Store, matchPrefixes: ['/admin/stores'], permissions: ['stores.view-pending', 'stores.approve', 'stores.reject', 'stores.create', 'stores.update', 'stores.delete'] },
  { label: 'إدارة المهندسين', to: '/admin/engineers', icon: UserCheck, matchPrefixes: ['/admin/engineers'], permissions: ['engineers.view-pending', 'engineers.approve', 'engineers.reject', 'engineer-profiles.approve', 'engineer-profiles.update', 'engineer-certificates.create', 'engineer-certificates.delete', 'portfolio-items.create', 'portfolio-items.update', 'portfolio-items.delete'] },
  { label: 'إدارة المنتجات والكتالوج', to: '/admin/products', icon: Package, matchPrefixes: ['/admin/products'], permissions: ['catalog.manage', 'store-products.create', 'store-products.update', 'store-products.delete'] },
  { label: 'إدارة البيانات الأساسية', to: '/admin/master-data/categories', icon: Database, matchPrefixes: ['/admin/master-data'], permissions: ['catalog.manage'] },
  { label: 'إدارة طلبات الخدمات', to: '/admin/services', icon: FileText, matchPrefixes: ['/admin/services'], permissions: ['service-requests.view-open', 'service-requests.create', 'service-requests.update', 'service-requests.cancel', 'quote-requests.create', 'quote-requests.respond', 'quote-requests.accept', 'quote-requests.reject', 'offers.create', 'offers.update', 'offers.accept'] },
  { label: 'إدارة طلبات الشراء', to: '/admin/orders', icon: ShoppingBag, matchPrefixes: ['/admin/orders'], permissions: ['orders.view', 'orders.manage-status', 'orders.cancel', 'orders.create'] },
  { label: 'الإدارة المالية', to: '/admin/finance/payments', icon: CreditCard, matchPrefixes: ['/admin/finance'], permissions: ['order-payments.verify', 'store-payouts.manage', 'wallet-providers.manage'] },
  { label: 'إدارة الصلاحيات', to: '/admin/roles', icon: ShieldCheck, matchPrefixes: ['/admin/roles', '/admin/permissions'], permissions: ['users.manage'] },
  { label: 'إدارة التقييمات', to: '/admin/reviews', icon: Star, matchPrefixes: ['/admin/reviews'], permissions: ['store-ratings.create', 'store-ratings.update', 'store-ratings.delete', 'engineer-ratings.create', 'engineer-ratings.update', 'engineer-ratings.delete'] },
  { label: 'الإشعارات', to: '/admin/notifications', icon: Bell, matchPrefixes: ['/admin/notifications'], permissions: ['notification-templates.manage'] },
  { label: 'إعدادات النظام', to: '/admin/settings', icon: Settings, matchPrefixes: ['/admin/settings'], permissions: ['settings.manage'] },
]

// تطبيق وتصفية الروابط الجانبية ديناميكياً وفق الصلاحيات الحية للأدمن المسجل دخوله
const filteredNavItems = computed(() => {
  return navItems.filter((item) => {
    if (!item.permissions || item.permissions.length === 0) return true
    return hasPermission(item.permissions)
  })
})

function isLinkActive(item: typeof navItems[0]) {
  if (route.path === item.to) return true
  return item.matchPrefixes.some(prefix => route.path.startsWith(prefix))
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
      isMobile
        ? 'h-full w-full'
        : isCollapsed
          ? 'h-[calc(100dvh-1.5rem)] w-20 rounded-2xl'
          : 'h-[calc(100dvh-1.5rem)] w-64 rounded-2xl lg:w-72',
    ]"
    aria-label="القائمة الجانبية للوحة تحكم الأدمن"
  >
    <!-- زر طي / فتح السايدبار المكتبي فقط -->
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

    <!-- رأس السايدبار والشعار الشفاف -->
    <div class="flex shrink-0 items-center justify-center px-4 transition-all duration-300 h-20 border-b border-solar-navy-light/40 sm:h-24">
      <NuxtLink to="/admin/dashboard" class="flex items-center justify-center" @click="handleLinkClick">
        <!-- الشعار المدمج SH-logo.png في حالة الطي -->
        <img
          v-if="isCollapsed && !isMobile"
          src="/images/SH-logo.png"
          alt="SolarHub SH"
          class="h-10 sm:h-12 w-10 sm:w-12 object-contain transition-all duration-300 drop-shadow"
        />
        <!-- الشعار الكبير الشفاف في الحالة الطبيعية المفتوحة -->
        <img
          v-else
          src="/images/logo-expanded-transparent.png"
          alt="Solar Hub Admin"
          class="h-12 sm:h-14 w-auto max-w-[180px] sm:max-w-[210px] object-contain transition-all duration-300"
        />
      </NuxtLink>
    </div>

    <!-- قائمة الروابط الإدارية النشطة وفق الصلاحيات -->
    <nav class="flex-1 min-h-0 flex flex-col gap-1 overflow-y-auto p-2 sm:p-3 scrollbar-thin scrollbar-thumb-white/10" aria-label="التنقل في لوحة الإدارة">
      <div class="flex flex-col gap-1">
        <AdminSidebarLink
          v-for="item in filteredNavItems"
          :key="item.to"
          :label="item.label"
          :to="item.to"
          :icon="item.icon"
          :collapsed="isCollapsed && !isMobile"
          :active="isLinkActive(item)"
          @navigate="handleLinkClick"
        />
      </div>
    </nav>

    <!-- زر تسجيل الخروج السفلي -->
    <div class="shrink-0 p-3 border-t border-solar-navy-light/40">
      <button
        type="button"
        @click="handleLogout"
        :disabled="isLoggingOut"
        aria-label="تسجيل الخروج"
        class="group relative flex items-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow text-red-200 hover:bg-red-500/20 hover:text-red-100 cursor-pointer disabled:opacity-50"
        :class="[isCollapsed && !isMobile ? 'justify-center p-3 rounded-xl' : 'gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium w-full']"
      >
        <Loader2 v-if="isLoggingOut" class="size-5 shrink-0 animate-spin text-red-300" />
        <LogOut v-else class="size-5 shrink-0" />
        <span v-if="!isCollapsed || isMobile" class="truncate">{{ isLoggingOut ? 'جارٍ تسجيل الخروج...' : 'تسجيل الخروج' }}</span>

        <!-- Tooltip لتسجيل الخروج -->
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
