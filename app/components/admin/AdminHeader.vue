<script setup lang="ts">
import { Bell, ChevronDown, Home, LogOut, Menu, Shield, User } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../../stores/auth'
import ThemeToggle from '../common/ThemeToggle.vue'

withDefaults(defineProps<{ isMobileOpen?: boolean }>(), { isMobileOpen: false })
const emit = defineEmits<{
  (e: 'toggleMobileMenu'): void
  (e: 'unavailable', label: string): void
}>()

const isUserMenuOpen = ref(false)
const accountMenu = ref<HTMLElement>()
const route = useRoute()

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const { openLogoutModal } = useAdminLogoutModal()

const userName = computed(() => user.value?.name || 'مدير النظام')
const userEmail = computed(() => user.value?.email || 'admin@solarhub.sa')
const userRoleLabel = computed(() => {
  if (user.value?.role === 'admin' || String(user.value?.id) === '1') return 'مدير نظام عام'
  if (user.value?.role === 'supplier') return 'مورد معتمد'
  if (user.value?.role === 'engineer') return 'مهندس معتمد'
  return 'مشرف إداري'
})

const userInitial = computed(() => {
  if (!user.value?.name) return 'م'
  return user.value.name.trim().charAt(0)
})

function closeAccountMenu(event: PointerEvent) {
  if (event.target instanceof Node && !accountMenu.value?.contains(event.target)) {
    isUserMenuOpen.value = false
  }
}

watch(() => route.fullPath, () => {
  isUserMenuOpen.value = false
})

onMounted(() => document.addEventListener('pointerdown', closeAccountMenu))
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeAccountMenu))
</script>

<template>
  <header class="sticky top-0 z-30 flex h-16 sm:h-20 w-full shrink-0 items-center justify-between border-b border-solar-border-card bg-solar-bg-card px-4 sm:px-8 shadow-sm transition-colors duration-200">
    <!-- الجانب الأيمن: زر القائمة للشاشات الصغيرة + عنوان لوحة الإدارة -->
    <div class="flex items-center gap-3 sm:gap-4">
      <button
        type="button"
        @click="emit('toggleMobileMenu')"
        class="flex size-10 items-center justify-center rounded-xl border border-solar-border-card text-solar-text-heading lg:hidden hover:bg-solar-bg-subtle active:scale-95 transition-all cursor-pointer"
        aria-label="فتح القائمة الإدارية"
        aria-controls="admin-mobile-navigation"
        :aria-expanded="isMobileOpen"
      >
        <Menu class="size-5" />
      </button>

      <div class="hidden sm:flex items-center gap-2.5">
        <div class="flex size-9 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow">
          <Shield class="size-5 stroke-[2.2]" />
        </div>
        <div class="flex flex-col">
          <p class="text-sm sm:base font-extrabold text-solar-text-heading leading-tight">لوحة الإدارة العامة | SolarHub</p>
          <p class="text-[11px] text-solar-text-muted">التحكم المركزي، الكتالوج والعمليات المالية</p>
        </div>
      </div>

      <span class="text-sm font-black text-solar-navy-dark dark:text-solar-yellow sm:hidden">
        سولار <span class="text-solar-yellow">هب</span> الإدارة
      </span>
    </div>

    <!-- الجانب الأيسر: زر الوضع الداكن، زر الإشعارات وملف المشرف العام -->
    <div class="flex items-center gap-2.5 sm:gap-4">
      <!-- زر تبديل الوضع الداكن / النهاري -->
      <ThemeToggle />

      <!-- زر إشعارات الأدمن -->
      <NuxtLink
        to="/admin/notifications"
        class="relative flex size-10 items-center justify-center rounded-xl border border-solar-border-card text-solar-text-body transition-colors hover:border-solar-yellow hover:text-solar-text-heading"
        aria-label="إشعارات النظام"
      >
        <Bell class="size-5" />
        <span class="absolute top-2.5 left-2.5 size-2 rounded-full bg-amber-500 ring-2 ring-solar-bg-card" aria-hidden="true" />
      </NuxtLink>

      <!-- بطاقة المشرف العام / المسؤول المسجل دخوله حالياً -->
      <div ref="accountMenu" class="relative">
        <button
          type="button"
          @click="isUserMenuOpen = !isUserMenuOpen"
          class="flex items-center gap-2.5 rounded-xl border border-solar-border-card p-1.5 pr-3 transition-colors hover:border-solar-yellow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow cursor-pointer bg-solar-bg-card"
          :aria-expanded="isUserMenuOpen"
        >
          <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-solar-navy text-white font-bold text-xs select-none shadow-xs">
            {{ userInitial }}
          </div>
          <div class="hidden md:flex flex-col text-right leading-tight max-w-[140px]">
            <span class="text-xs font-bold text-solar-text-heading truncate">{{ userName }}</span>
            <span class="text-[10px] text-solar-text-muted truncate">{{ userRoleLabel }}</span>
          </div>
          <ChevronDown class="size-4 text-solar-text-muted transition-transform duration-200" :class="{ 'rotate-180': isUserMenuOpen }" />
        </button>

        <!-- القائمة المنسدلة لحساب الأدمن -->
        <div
          v-if="isUserMenuOpen"
          class="absolute left-0 mt-2 w-56 rounded-2xl border border-solar-border-card bg-solar-bg-card p-2 shadow-dropdown z-50 text-right animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div class="px-3 py-2 border-b border-solar-border-card/60 mb-1">
            <p class="text-xs font-bold text-solar-text-heading truncate">{{ userName }}</p>
            <p class="text-[10px] text-solar-text-muted truncate font-mono mt-0.5">{{ userEmail }}</p>
          </div>

          <NuxtLink
            to="/"
            class="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-solar-text-body hover:bg-solar-bg-subtle hover:text-solar-navy dark:hover:text-solar-yellow transition-colors"
            @click="isUserMenuOpen = false"
          >
            <Home class="size-4" />
            <span>معاينة الواجهة الرئيسية</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/settings"
            class="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-solar-text-body hover:bg-solar-bg-subtle hover:text-solar-navy dark:hover:text-solar-yellow transition-colors"
            @click="isUserMenuOpen = false"
          >
            <User class="size-4" />
            <span>إعدادات النظام والملف الشخصي</span>
          </NuxtLink>

          <hr class="my-1.5 border-solar-border-card/60" />

          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-right text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
            @click="() => { isUserMenuOpen = false; openLogoutModal(); }"
          >
            <LogOut class="size-4" />
            <span>تسجيل الخروج من الإدارة</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
