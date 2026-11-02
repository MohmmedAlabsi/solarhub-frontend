<script setup lang="ts">
import { Bell, ChevronDown, Menu, Store, User } from 'lucide-vue-next'
import { useAuthStore } from '~~/app/stores/auth'
import ThemeToggle from '~~/app/components/common/ThemeToggle.vue'

withDefaults(defineProps<{ isMobileOpen?: boolean }>(), { isMobileOpen: false })
const emit = defineEmits<{
  (e: 'toggleMobileMenu'): void
  (e: 'unavailable', label: string): void
}>()

const authStore = useAuthStore()
const { openLogoutModal } = useCustomerLogoutModal()
const { unreadCount, fetchNotifications } = useNotificationState()
const isUserMenuOpen = ref(false)
const accountMenu = ref<HTMLElement>()
const accountButton = ref<HTMLButtonElement>()
const route = useRoute()

const storeName = computed(() => {
  return (authStore.user as any)?.store?.company_name || authStore.user?.name || 'متجر معتمد'
})

const userRole = computed(() => {
  if (authStore.user?.role === 'supplier') return 'مورد معتمد'
  return 'مورد SolarHub'
})

function closeAccountMenu(event: PointerEvent) {
  if (event.target instanceof Node && !accountMenu.value?.contains(event.target)) {
    isUserMenuOpen.value = false
  }
}

function escapeAccountMenu() {
  isUserMenuOpen.value = false
  accountButton.value?.focus()
}

function handleLogoutClick() {
  isUserMenuOpen.value = false
  openLogoutModal()
}

watch(() => route.fullPath, () => {
  isUserMenuOpen.value = false
})

onMounted(() => {
  document.addEventListener('pointerdown', closeAccountMenu)
  fetchNotifications()
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', closeAccountMenu)
})
</script>

<template>
  <header class="sticky top-0 z-30 flex w-full shrink-0 items-center justify-between bg-solar-bg-card px-3 sm:px-6 h-16 border-b border-solar-border-card shadow-sm sm:h-20 transition-colors duration-200">
    <!-- الجانب الأيمن (زر القائمة للشاشات الصغيرة + عنوان ترحيبي متجاوب) -->
    <div class="flex items-center gap-2 sm:gap-4">
      <button
        type="button"
        @click="emit('toggleMobileMenu')"
        class="flex size-9 sm:size-10 items-center justify-center rounded-lg border border-solar-border-card text-solar-text-heading lg:hidden hover:bg-solar-bg-subtle active:scale-95 transition-all cursor-pointer"
        aria-label="فتح القائمة"
        aria-controls="supplier-mobile-navigation"
        :aria-expanded="isMobileOpen"
      >
        <Menu class="size-5" />
      </button>

      <div class="hidden sm:flex flex-col">
        <p class="text-sm sm:text-base font-bold text-solar-text-heading leading-tight">بوابة المتجر والمورد | SolarHub</p>
        <p class="text-[11px] text-solar-text-muted">المنظومات وحلول الطاقة الكهروضوئية المعتمدة</p>
      </div>

      <!-- شعار مبسط للهواتف الذكية -->
      <span class="text-xs font-black text-solar-navy-dark dark:text-solar-yellow sm:hidden">
        سولار <span class="text-solar-yellow">هب | مورد</span>
      </span>
    </div>

    <!-- الجانب الأيسر (الوضع الداكن، الإشعارات، الحساب الشخصي للمتجر) -->
    <div class="flex items-center gap-2 sm:gap-3.5">
      <!-- زر تبديل الوضع الداكن / النهاري -->
      <ThemeToggle />

      <!-- زر الإشعارات -->
      <NuxtLink
        to="/supplier/notifications"
        class="relative flex size-9 sm:size-10 items-center justify-center rounded-xl border border-solar-border-card text-solar-text-body transition-colors hover:border-solar-yellow hover:text-solar-text-heading"
        :aria-label="`مركز الإشعارات، ${unreadCount} غير مقروءة`"
      >
        <Bell class="size-4 sm:size-5" />
        <span
          v-if="unreadCount > 0"
          class="absolute top-2 left-2 size-2 sm:size-2.5 rounded-full bg-amber-500 ring-2 ring-solar-bg-card"
          aria-hidden="true"
        />
      </NuxtLink>

      <!-- حساب المتجر المنسدل -->
      <div ref="accountMenu" class="relative" @keydown.esc.stop="escapeAccountMenu">
        <button
          ref="accountButton"
          type="button"
          @click="isUserMenuOpen = !isUserMenuOpen"
          class="flex items-center gap-1.5 sm:gap-2.5 p-1 pr-2 rounded-xl border border-solar-border-card bg-solar-bg-card transition-colors hover:border-solar-yellow sm:p-1.5 sm:pr-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow cursor-pointer"
          :aria-expanded="isUserMenuOpen"
          aria-controls="supplier-account-menu"
        >
          <div class="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-solar-navy text-white">
            <Store class="size-3.5 sm:size-4" />
          </div>
          <div class="text-right flex flex-col leading-tight max-w-[140px]">
            <span class="text-xs font-bold text-solar-text-heading truncate">{{ storeName }}</span>
            <span class="text-[9px] sm:text-[10px] text-solar-text-muted hidden xs:inline">{{ userRole }}</span>
          </div>
          <ChevronDown class="size-3.5 sm:size-4 text-solar-text-muted" />
        </button>

        <!-- القائمة المنسدلة -->
        <div
          v-if="isUserMenuOpen"
          id="supplier-account-menu"
          class="absolute left-0 mt-2 w-52 rounded-xl border border-solar-border-card bg-solar-bg-card p-2 shadow-dropdown z-50 text-right"
        >
          <NuxtLink
            to="/supplier/store"
            class="block rounded-lg px-3 py-2 text-xs font-semibold text-solar-text-body hover:bg-solar-bg-subtle"
            @click="isUserMenuOpen = false"
          >
            بيانات وهوية المتجر
          </NuxtLink>
          <NuxtLink
            to="/supplier/finance"
            class="block rounded-lg px-3 py-2 text-xs font-semibold text-solar-text-body hover:bg-solar-bg-subtle"
            @click="isUserMenuOpen = false"
          >
            المستحقات والأرصدة
          </NuxtLink>
          <NuxtLink
            to="/supplier/settings"
            class="block rounded-lg px-3 py-2 text-xs font-semibold text-solar-text-body hover:bg-solar-bg-subtle"
            @click="isUserMenuOpen = false"
          >
            الملف الشخصي وإعدادات الأمان
          </NuxtLink>
          <hr class="my-1 border-solar-border-card" />
          <button
            type="button"
            class="block w-full rounded-lg px-3 py-2 text-right text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
            @click="handleLogoutClick"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
