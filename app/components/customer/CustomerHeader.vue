<script setup lang="ts">
import { Bell, ChevronDown, Menu, ShoppingCart, User } from 'lucide-vue-next'
import { useCartStore } from '~~/app/stores/cart.store'
import { useAuthStore } from '~~/app/stores/auth'
import ThemeToggle from '~~/app/components/common/ThemeToggle.vue'

withDefaults(defineProps<{ isMobileOpen?: boolean }>(), { isMobileOpen: false })
const emit = defineEmits<{
  (e: 'toggleMobileMenu'): void
  (e: 'unavailable', label: string): void
}>()

const cartStore = useCartStore()
const authStore = useAuthStore()
const { logout } = useAuth()
const { openLogoutModal } = useCustomerLogoutModal()
const { unreadCount } = useNotificationState()
const isUserMenuOpen = ref(false)
const accountMenu = ref<HTMLElement>()
const accountButton = ref<HTMLButtonElement>()
const route = useRoute()

const userName = computed(() => {
  return authStore.user?.name || 'حساب العميل'
})

const userRole = computed(() => {
  if (authStore.user?.role === 'customer') return 'عميل معتمد'
  return 'عميل SolarHub'
})

function closeAccountMenu(event: PointerEvent) {
  if (event.target instanceof Node && !accountMenu.value?.contains(event.target)) isUserMenuOpen.value = false
}
function escapeAccountMenu() { isUserMenuOpen.value = false; accountButton.value?.focus() }

async function handleLogout() {
  isUserMenuOpen.value = false
  await logout()
}

watch(() => route.fullPath, () => { isUserMenuOpen.value = false })
onMounted(() => {
  document.addEventListener('pointerdown', closeAccountMenu)
  // تحميل عناصر السلة مبكراً لتحديث العداد
  cartStore.fetchCart()
})
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeAccountMenu))
</script>

<template>
  <header class="sticky top-0 z-30 flex w-full shrink-0 items-center justify-between bg-solar-bg-card px-3 sm:px-6 h-16 border-b border-solar-border-card shadow-sm sm:h-20 transition-colors duration-200">
    <!-- الجانب الأيمن (زر القائمة للشاشات الصغيرة + عنوان ترحيبي متجاوب) -->
    <div class="flex items-center gap-2 sm:gap-4">
      <button
        type="button"
        @click="emit('toggleMobileMenu')"
        class="flex size-9 sm:size-10 items-center justify-center rounded-lg border border-solar-border-card text-solar-text-heading lg:hidden hover:bg-solar-bg-subtle active:scale-95 transition-all"
        aria-label="فتح القائمة"
        aria-controls="customer-mobile-navigation"
        :aria-expanded="isMobileOpen"
      >
        <Menu class="size-5" />
      </button>

      <div class="hidden sm:flex flex-col">
        <p class="text-sm sm:text-base font-bold text-solar-text-heading leading-tight">بوابة العميل | SolarHub</p>
        <p class="text-[11px] text-solar-text-muted">المنظومات وحلول الطاقة الكهروضوئية المعتمدة</p>
      </div>

      <!-- شعار مبسط في الهواتف الذكية فقط إذا كان العنوان مخفياً -->
      <span class="text-xs font-black text-solar-navy-dark dark:text-solar-yellow sm:hidden">
        سولار <span class="text-solar-yellow">هب</span>
      </span>
    </div>

    <!-- الجانب الأيسر (الوضع الداكن، الإشعارات، السلة، الحساب الشخصي) متجاوب بالكامل -->
    <div class="flex items-center gap-2 sm:gap-3.5">
      <!-- زر تبديل الوضع الداكن / النهاري -->
      <ThemeToggle />

      <!-- زر الإشعارات -->
      <NuxtLink
        to="/customer/notifications"
        class="relative flex size-9 sm:size-10 items-center justify-center rounded-xl border border-solar-border-card text-solar-text-body transition-colors hover:border-solar-yellow hover:text-solar-text-heading"
        :aria-label="`مركز الإشعارات، ${unreadCount} غير مقروءة`"
      >
        <Bell class="size-4 sm:size-5" />
        <span v-if="unreadCount > 0" class="absolute top-2 left-2 size-2 sm:size-2.5 rounded-full bg-amber-500 ring-2 ring-solar-bg-card" aria-hidden="true" />
      </NuxtLink>

      <!-- أيقونة سلة المشتريات التفاعلية مع العداد -->
      <NuxtLink
        to="/customer/cart"
        class="relative flex size-9 sm:size-10 items-center justify-center rounded-xl border border-solar-border-card text-solar-text-body transition-colors hover:border-solar-yellow hover:text-solar-text-heading"
        aria-label="سلة المشتريات"
      >
        <ShoppingCart class="size-4 sm:size-5" />
        <span
          v-if="cartStore.totalItemsCount > 0"
          class="absolute -top-1.5 -left-1.5 flex min-w-[18px] sm:min-w-[20px] h-4.5 sm:h-5 items-center justify-center rounded-full bg-solar-yellow px-1 text-[10px] sm:text-xs font-bold text-solar-navy-dark shadow-sm"
        >
          {{ cartStore.totalItemsCount }}
        </span>
      </NuxtLink>

      <!-- الملف الشخصي للمستخدم -->
      <div ref="accountMenu" class="relative" @keydown.esc.stop="escapeAccountMenu">
        <button
          ref="accountButton"
          type="button"
          @click="isUserMenuOpen = !isUserMenuOpen"
          class="flex items-center gap-1.5 sm:gap-2.5 p-1 pr-2 rounded-xl border border-solar-border-card bg-solar-bg-card transition-colors hover:border-solar-yellow sm:p-1.5 sm:pr-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow"
          :aria-expanded="isUserMenuOpen"
          aria-controls="customer-account-menu"
        >
          <div class="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-solar-navy text-white">
            <User class="size-3.5 sm:size-4" />
          </div>
          <div class="text-right flex flex-col leading-tight max-w-[120px]">
            <span class="text-xs font-bold text-solar-text-heading truncate">{{ userName }}</span>
            <span class="text-[9px] sm:text-[10px] text-solar-text-muted hidden xs:inline">{{ userRole }}</span>
          </div>
          <ChevronDown class="size-3.5 sm:size-4 text-solar-text-muted" />
        </button>

        <!-- القائمة المنسدلة -->
        <div
          v-if="isUserMenuOpen"
          id="customer-account-menu"
          class="absolute left-0 mt-2 w-48 rounded-xl border border-solar-border-card bg-solar-bg-card p-2 shadow-dropdown z-50 text-right"
        >
          <NuxtLink
            to="/customer/settings"
            class="block rounded-lg px-3 py-2 text-xs font-semibold text-solar-text-body hover:bg-solar-bg-subtle"
            @click="isUserMenuOpen = false"
          >
            الملف الشخصي وإعدادات الحساب
          </NuxtLink>
          <NuxtLink
            to="/customer/orders"
            class="block rounded-lg px-3 py-2 text-xs font-semibold text-solar-text-body hover:bg-solar-bg-subtle"
            @click="isUserMenuOpen = false"
          >
            طلباتي ومشترياتي
          </NuxtLink>
          <hr class="my-1 border-solar-border-card" />
          <button
            type="button"
            class="block w-full rounded-lg px-3 py-2 text-right text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
            @click="handleLogout"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
