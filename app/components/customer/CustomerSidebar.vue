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
  (e: 'unavailable', label: string): void
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
    class="relative flex h-screen flex-col justify-between bg-solar-navy transition-all duration-300 ease-in-out z-40 select-none shadow-sidebar"
    :class="[
      isMobile ? 'w-full' : (isCollapsed ? 'w-20' : 'w-64 lg:w-72'),
    ]"
    aria-label="القائمة الجانبية لبوابة العميل"
  >
    <!-- زر طي / فتح السايدبار المكتبي فقط -->
    <button
      v-if="!isMobile"
      type="button"
      @click="emit('toggle')"
      class="absolute top-24 -left-3.5 z-50 flex size-7 items-center justify-center rounded-full bg-solar-yellow text-solar-navy-dark shadow-md transition-transform hover:scale-110 active:scale-95 focus:outline-none cursor-pointer ring-2 ring-white/20"
      :title="isCollapsed ? 'توسيع القائمة' : 'طي القائمة'"
      :aria-label="isCollapsed ? 'توسيع القائمة' : 'طي القائمة'"
    >
      <ChevronRight v-if="isCollapsed" class="size-4 stroke-[2.5]" />
      <ChevronLeft v-else class="size-4 stroke-[2.5]" />
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
    <nav class="flex-1 min-h-0 flex flex-col gap-1 p-2 sm:p-3 overflow-y-auto">
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

          <!-- Tooltip في حالة الطي على سطح المكتب -->
          <div
            v-if="isCollapsed && !isMobile"
            class="pointer-events-none absolute right-full mr-2 z-50 hidden rounded-md bg-solar-navy-dark px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg whitespace-nowrap group-hover:block"
          >
            {{ item.label }}
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

          <div
            v-if="isCollapsed && !isMobile"
            class="pointer-events-none absolute right-full mr-2 z-50 hidden rounded-md bg-solar-navy-dark px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg whitespace-nowrap group-hover:block"
          >
            {{ item.label }}
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

          <div
            v-if="isCollapsed && !isMobile"
            class="pointer-events-none absolute right-full mr-2 z-50 hidden rounded-md bg-solar-navy-dark px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg whitespace-nowrap group-hover:block"
          >
            {{ item.label }}
          </div>
        </NuxtLink>
      </div>
    </nav>

    <!-- زر تسجيل الخروج السفلي -->
    <div class="shrink-0 border-t border-solar-navy-light/40 p-2 sm:p-3">
      <button type="button" @click="emit('unavailable', 'تسجيل الخروج')"
        class="group relative flex items-center transition-all duration-200 text-red-200 hover:bg-red-500/20 hover:text-red-100"
        :class="isCollapsed && !isMobile ? 'justify-center p-3 rounded-xl' : 'gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium'"
      >
        <LogOut class="size-5 shrink-0" />
        <span v-if="!isCollapsed || isMobile" class="truncate">تسجيل الخروج</span>

        <div
          v-if="isCollapsed && !isMobile"
          class="pointer-events-none absolute right-full mr-2 z-50 hidden rounded-md bg-red-950 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg whitespace-nowrap group-hover:block"
        >
          تسجيل الخروج
        </div>
      </button>
    </div>
  </aside>
</template>

