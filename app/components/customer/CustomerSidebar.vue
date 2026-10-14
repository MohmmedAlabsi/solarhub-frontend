<script setup lang="ts">
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  Home,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Users,
  Wrench,
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
}>()

const route = useRoute()

// الروابط مقسمة وفقاً لمجموعات التصميم المعتمدة في سولار هب
const mainNav = [
  { label: 'الرئيسية', to: '/customer/dashboard', icon: Home },
  { label: 'المنتجات', to: '/customer/products', icon: Package },
  { label: 'المهندسون', to: '/customer/engineers', icon: Users },
  { label: 'الموردون', to: '/customer/stores', icon: Store },
]

const commerceNav = [
  { label: 'طلبات عروض الأسعار', to: '/customer/orders?tab=quotes', icon: FileText },
  { label: 'طلباتي', to: '/customer/orders', icon: ShoppingBag },
  { label: 'طلبات الخدمات', to: '/customer/services', icon: Wrench },
  { label: 'المفضلة', to: '/customer/wishlist', icon: Heart },
]

const settingsNav = [
  { label: 'الإشعارات', to: '/customer/notifications', icon: Bell },
  { label: 'الإعدادات', to: '/customer/settings', icon: Settings },
]

function isActive(path: string) {
  if (path.includes('?')) {
    const [basePath, queryStr] = path.split('?')
    const queryParams = new URLSearchParams(queryStr)
    const currentTab = route.query.tab
    return route.path === basePath && currentTab === queryParams.get('tab')
  }
  return route.path.startsWith(path) && (path !== '/customer/orders' || !route.query.tab)
}

function handleLinkClick() {
  if (props.isMobile) {
    emit('closeMobile')
  }
}
</script>

<template>
  <aside
    class="relative flex flex-col justify-between bg-solar-navy transition-all duration-300 ease-in-out z-50 select-none shadow-2xl border border-white/10 overflow-visible"
    :class="[
      isMobile ? 'h-full w-full' : (isCollapsed ? 'h-[calc(100vh-1.5rem)] w-20 rounded-2xl' : 'h-[calc(100vh-1.5rem)] w-64 lg:w-72 rounded-2xl'),
    ]"
    aria-label="القائمة الجانبية لبوابة العميل"
  >
    <!-- زر طي / فتح السايدبار المكتبي فقط -->
    <button
      v-if="!isMobile"
      type="button"
      @click="emit('toggle')"
      class="absolute top-24 -left-3.5 z-50 flex size-7 items-center justify-center rounded-full bg-solar-yellow text-solar-navy-dark shadow-md transition-transform hover:scale-110 active:scale-95 focus:outline-none cursor-pointer ring-2 ring-white/20 hover:ring-solar-yellow/50"
      :title="isCollapsed ? 'توسيع القائمة (Ctrl+B)' : 'طي القائمة (Ctrl+B)'"
      :aria-label="isCollapsed ? 'توسيع القائمة' : 'طي القائمة'"
    >
      <!-- في اتجاه RTL: عند الطي يشير السهم لليسار نحو الصفحة للتوسيع، وعند الفتح يشير لليمين للطي -->
      <ChevronLeft v-if="isCollapsed" class="size-4 stroke-[2.5]" />
      <ChevronRight v-else class="size-4 stroke-[2.5]" />
    </button>

    <!-- زر إغلاق القائمة في الهواتف الذكية -->
    <button
      v-if="isMobile"
      type="button"
      @click="emit('closeMobile')"
      class="absolute top-5 left-4 z-50 flex size-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 active:scale-95"
      aria-label="إغلاق القائمة"
    >
      <X class="size-5" />
    </button>

    <!-- رأس السايدبار والشعار الشفاف المعتمد -->
    <div class="flex h-20 sm:h-24 shrink-0 items-center justify-center border-b border-solar-navy-light/40 px-4 transition-all duration-300">
      <NuxtLink to="/customer/dashboard" class="flex items-center justify-center" @click="handleLinkClick">
        <!-- الشعار المدمج SH-logo.png في حالة الطي -->
        <img
          v-if="isCollapsed && !isMobile"
          src="/images/SH-logo.png"
          alt="SolarHub SH"
          class="h-10 sm:h-12 w-10 sm:w-12 object-contain transition-all duration-300 drop-shadow"
        />
        <!-- الشعار الكبير الشفاف الأصلي في الحالة الطبيعية المفتوحة -->
        <img
          v-else
          src="/images/logo-expanded-transparent.png"
          alt="Solar Hub - Your Hub For Solar Solutions"
          class="h-12 sm:h-14 w-auto max-w-[180px] sm:max-w-[210px] object-contain transition-all duration-300"
        />
      </NuxtLink>
    </div>

    <!-- قائمة الروابط الرئيسية -->
    <nav
      class="flex-1 min-h-0 flex flex-col gap-1 p-2 sm:p-3"
      :class="isCollapsed && !isMobile ? 'overflow-visible' : 'overflow-y-auto'"
    >
      <!-- المجموعة 1 -->
      <div class="flex flex-col gap-1">
        <NuxtLink
          v-for="item in mainNav"
          :key="item.to"
          :to="item.to"
          @click="handleLinkClick"
          class="group relative flex items-center transition-all duration-200"
          :class="[
            isCollapsed && !isMobile ? 'justify-center p-3 rounded-xl' : 'gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium',
            isActive(item.to)
              ? 'bg-solar-yellow text-solar-navy-dark font-bold shadow-sm'
              : 'text-white/80 hover:bg-white/10 hover:text-white',
          ]"
        >
          <component :is="item.icon" class="size-5 shrink-0" />
          <span v-if="!isCollapsed || isMobile" class="truncate">{{ item.label }}</span>

          <!-- Tooltip يطفو فوق واجهة الصفحة بدون قص أو حجب -->
          <div
            v-if="isCollapsed && !isMobile"
            class="pointer-events-none absolute right-full mr-3.5 top-1/2 -translate-y-1/2 z-[100] hidden group-hover:flex items-center rounded-lg bg-solar-navy-dark px-3 py-1.5 text-xs font-bold text-white shadow-2xl border border-white/10 whitespace-nowrap drop-shadow-xl"
          >
            <span>{{ item.label }}</span>
            <span class="absolute -right-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-solar-navy-dark" />
          </div>
        </NuxtLink>
      </div>

      <!-- فاصل 1 -->
      <hr class="my-1.5 sm:my-2 border-solar-navy-light/40" />

      <!-- المجموعة 2 (المتجر والطلبات) -->
      <div class="flex flex-col gap-1">
        <NuxtLink
          v-for="item in commerceNav"
          :key="item.to"
          :to="item.to"
          @click="handleLinkClick"
          class="group relative flex items-center transition-all duration-200"
          :class="[
            isCollapsed && !isMobile ? 'justify-center p-3 rounded-xl' : 'gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium',
            isActive(item.to)
              ? 'bg-solar-yellow text-solar-navy-dark font-bold shadow-sm'
              : 'text-white/80 hover:bg-white/10 hover:text-white',
          ]"
        >
          <component :is="item.icon" class="size-5 shrink-0" />
          <span v-if="!isCollapsed || isMobile" class="truncate">{{ item.label }}</span>

          <!-- Tooltip يطفو فوق واجهة الصفحة بدون قص أو حجب -->
          <div
            v-if="isCollapsed && !isMobile"
            class="pointer-events-none absolute right-full mr-3.5 top-1/2 -translate-y-1/2 z-[100] hidden group-hover:flex items-center rounded-lg bg-solar-navy-dark px-3 py-1.5 text-xs font-bold text-white shadow-2xl border border-white/10 whitespace-nowrap drop-shadow-xl"
          >
            <span>{{ item.label }}</span>
            <span class="absolute -right-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-solar-navy-dark" />
          </div>
        </NuxtLink>
      </div>

      <!-- فاصل 2 -->
      <hr class="my-1.5 sm:my-2 border-solar-navy-light/40" />

      <!-- المجموعة 3 (الإعدادات والإشعارات) -->
      <div class="flex flex-col gap-1">
        <NuxtLink
          v-for="item in settingsNav"
          :key="item.to"
          :to="item.to"
          @click="handleLinkClick"
          class="group relative flex items-center transition-all duration-200"
          :class="[
            isCollapsed && !isMobile ? 'justify-center p-3 rounded-xl' : 'gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium',
            isActive(item.to)
              ? 'bg-solar-yellow text-solar-navy-dark font-bold shadow-sm'
              : 'text-white/80 hover:bg-white/10 hover:text-white',
          ]"
        >
          <component :is="item.icon" class="size-5 shrink-0" />
          <span v-if="!isCollapsed || isMobile" class="truncate">{{ item.label }}</span>

          <!-- Tooltip يطفو فوق واجهة الصفحة بدون قص أو حجب -->
          <div
            v-if="isCollapsed && !isMobile"
            class="pointer-events-none absolute right-full mr-3.5 top-1/2 -translate-y-1/2 z-[100] hidden group-hover:flex items-center rounded-lg bg-solar-navy-dark px-3 py-1.5 text-xs font-bold text-white shadow-2xl border border-white/10 whitespace-nowrap drop-shadow-xl"
          >
            <span>{{ item.label }}</span>
            <span class="absolute -right-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-solar-navy-dark" />
          </div>
        </NuxtLink>
      </div>
    </nav>

    <!-- زر تسجيل الخروج السفلي -->
    <div class="shrink-0 border-t border-solar-navy-light/40 p-2 sm:p-3 overflow-visible">
      <NuxtLink
        to="/auth/login"
        @click="handleLinkClick"
        class="group relative flex items-center transition-all duration-200 text-red-200 hover:bg-red-500/20 hover:text-red-100"
        :class="isCollapsed && !isMobile ? 'justify-center p-3 rounded-xl' : 'gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium'"
      >
        <LogOut class="size-5 shrink-0" />
        <span v-if="!isCollapsed || isMobile" class="truncate">تسجيل الخروج</span>

        <!-- Tooltip لتسجيل الخروج -->
        <div
          v-if="isCollapsed && !isMobile"
          class="pointer-events-none absolute right-full mr-3.5 top-1/2 -translate-y-1/2 z-[100] hidden group-hover:flex items-center rounded-lg bg-rose-950 px-3 py-1.5 text-xs font-bold text-rose-100 shadow-2xl border border-rose-500/20 whitespace-nowrap drop-shadow-xl"
        >
          <span>تسجيل الخروج</span>
          <span class="absolute -right-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-rose-950" />
        </div>
      </NuxtLink>
    </div>
  </aside>
</template>
