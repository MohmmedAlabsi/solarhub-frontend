<script setup lang="ts">
import {
  Bell,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  Star,
  User,
  X,
} from 'lucide-vue-next'
import EngineerSidebarLink from './EngineerSidebarLink.vue'

const props = withDefaults(
  defineProps<{
    isCollapsed: boolean
    isMobile?: boolean
  }>(),
  { isMobile: false }
)

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'closeMobile'): void
  (e: 'unavailable', label: string): void
}>()

const route = useRoute()

// مجموعات روابط التنقل كما في التصميم
const mainNav = [
  { label: 'الرئيسية',        to: '/engineer/dashboard',        icon: Home },
  { label: 'طلبات الخدمات',   to: '/engineer/service-requests', icon: ClipboardList },
  { label: 'عروضي',           to: '/engineer/offers',           icon: FileText },
  { label: 'الملف المهني',    to: '/engineer/profile',          icon: Briefcase },
  { label: 'أعمالي السابقة',  to: '/engineer/past-work',        icon: Star },
  { label: 'التقييمات',       to: '/engineer/reviews',          icon: Star },
  { label: 'الملف الشخصي',    to: '/engineer/settings',         icon: User },
  { label: 'الإشعارات',       to: '/engineer/notifications',    icon: Bell },
]

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}
function handleLinkClick() {
  if (props.isMobile) emit('closeMobile')
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
    aria-label="القائمة الجانبية لبوابة المهندسين"
  >
    <!-- زر طي / فتح الشريط الجانبي (سطح المكتب) -->
    <button
      v-if="!isMobile"
      type="button"
      @click="emit('toggle')"
      class="absolute top-24 -left-3.5 z-50 flex size-7 items-center justify-center rounded-full bg-solar-yellow text-solar-navy-dark shadow-md transition-transform hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-solar-navy cursor-pointer ring-2 ring-white/20 hover:ring-solar-yellow/50"
      :title="isCollapsed ? 'توسيع الشريط (Ctrl+B)' : 'طي الشريط (Ctrl+B)'"
      :aria-label="isCollapsed ? 'توسيع الشريط الجانبي' : 'طي الشريط الجانبي'"
    >
      <ChevronLeft v-if="isCollapsed" class="size-4 stroke-[2.5]" />
      <ChevronRight v-else class="size-4 stroke-[2.5]" />
    </button>

    <!-- زر إغلاق على الجوال -->
    <button
      v-if="isMobile"
      type="button"
      @click="emit('closeMobile')"
      class="absolute top-5 left-4 z-50 flex size-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow"
      aria-label="إغلاق القائمة الجانبية"
      data-drawer-close
    >
      <X class="size-5" />
    </button>

    <!-- شعار Solar Hub -->
    <div class="flex shrink-0 items-center justify-center px-4 transition-all duration-300 h-20 border-b border-solar-navy-light/40 sm:h-24">
      <NuxtLink to="/engineer/dashboard" class="flex items-center justify-center" @click="handleLinkClick">
        <img
          v-if="isCollapsed && !isMobile"
          src="/images/SH-logo.png"
          alt="SolarHub SH"
          class="h-10 sm:h-12 w-10 sm:w-12 object-contain transition-all duration-300 drop-shadow"
        />
        <img
          v-else
          src="/images/logo-expanded-transparent.png"
          alt="Solar Hub - بوابة المهندسين"
          class="h-12 sm:h-14 w-auto max-w-[180px] sm:max-w-[210px] object-contain transition-all duration-300"
        />
      </NuxtLink>
    </div>

    <!-- روابط التنقل -->
    <nav class="flex-1 min-h-0 flex flex-col gap-1 overflow-y-auto p-2 sm:p-3" aria-label="قائمة تنقل المهندس">
      <div class="flex flex-col gap-1">
        <EngineerSidebarLink
          v-for="item in mainNav"
          :key="item.to"
          :label="item.label"
          :to="item.to"
          :icon="item.icon"
          :collapsed="isCollapsed && !isMobile"
          :active="isActive(item.to)"
          @navigate="handleLinkClick"
        />
      </div>
    </nav>

    <!-- زر تسجيل الخروج -->
    <div class="shrink-0 p-3 border-t border-solar-navy-light/40">
      <button
        type="button"
        @click="emit('unavailable', 'تسجيل الخروج')"
        aria-label="تسجيل الخروج"
        class="group relative flex items-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow text-red-200 hover:bg-red-500/20 hover:text-red-100"
        :class="[isCollapsed && !isMobile ? 'justify-center p-3 rounded-xl' : 'gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium']"
      >
        <LogOut class="size-5 shrink-0" />
        <span v-if="!isCollapsed || isMobile" class="truncate">تسجيل الخروج</span>

        <!-- Tooltip عند التصغير -->
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
