<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Bell, ChevronDown, Menu, ShoppingCart, User } from 'lucide-vue-next'
import { useCartStore } from '../../stores/cart.store'
import { useAuthStore } from '../../stores/auth'
import { useCustomerNotifications } from '../../composables/useCustomerNotifications'
import ThemeToggle from '../common/ThemeToggle.vue'

withDefaults(
  defineProps<{
    isMobileOpen?: boolean
  }>(),
  {
    isMobileOpen: false,
  },
)

const emit = defineEmits<{
  toggleMobileMenu: []
  unavailable: [label: string]
}>()

const cartStore = useCartStore()
const authStore = useAuthStore()
const { logout } = useAuth()
const route = useRoute()

const { unreadCount } = useCustomerNotifications()

const isUserMenuOpen = ref(false)
const accountMenu = ref<HTMLElement | null>(null)
const accountButton = ref<HTMLButtonElement | null>(null)

const userName = computed(() =>
  authStore.user?.name || 'حساب العميل',
)

const userRole = computed(() =>
  authStore.user?.role === 'customer'
    ? 'عميل'
    : 'حساب SolarHub',
)

const notificationLabel = computed(() => {
  if (unreadCount.value === null) {
    return 'مركز الإشعارات'
  }

  return `مركز الإشعارات، ${unreadCount.value} غير مقروءة`
})

const hasUnreadNotifications = computed(() =>
  unreadCount.value !== null && unreadCount.value > 0,
)

function closeAccountMenu(event: PointerEvent) {
  if (
    event.target instanceof Node
    && !accountMenu.value?.contains(event.target)
  ) {
    isUserMenuOpen.value = false
  }
}

function escapeAccountMenu() {
  isUserMenuOpen.value = false
  accountButton.value?.focus()
}

async function handleLogout() {
  isUserMenuOpen.value = false
  await logout()
}

watch(
  () => route.fullPath,
  () => {
    isUserMenuOpen.value = false
  },
)

onMounted(() => {
  document.addEventListener('pointerdown', closeAccountMenu)
  cartStore.fetchCart()
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', closeAccountMenu)
})
</script>

<template>
  <header
    class="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-solar-border-card bg-solar-bg-card px-3 shadow-sm transition-colors duration-200 sm:h-20 sm:px-6"
  >
    <div class="flex items-center gap-2 sm:gap-4">
      <button
        type="button"
        class="flex size-9 items-center justify-center rounded-lg border border-solar-border-card text-solar-text-heading transition-all hover:bg-solar-bg-subtle active:scale-95 sm:size-10 lg:hidden"
        aria-label="فتح القائمة"
        aria-controls="customer-mobile-navigation"
        :aria-expanded="isMobileOpen"
        @click="emit('toggleMobileMenu')"
      >
        <Menu class="size-5" aria-hidden="true" />
      </button>

      <div class="hidden flex-col sm:flex">
        <p
          class="text-sm font-bold leading-tight text-solar-text-heading sm:text-base"
        >
          بوابة العميل | SolarHub
        </p>

        <p class="text-[11px] text-solar-text-muted">
          المنظومات وحلول الطاقة الكهروضوئية
        </p>
      </div>

      <span
        class="text-xs font-black text-solar-navy-dark dark:text-solar-yellow sm:hidden"
      >
        سولار <span class="text-solar-yellow">هب</span>
      </span>
    </div>

    <div class="flex items-center gap-2 sm:gap-3.5">
      <ThemeToggle />

      <NuxtLink
        to="/customer/notifications"
        class="relative flex size-9 items-center justify-center rounded-xl border border-solar-border-card text-solar-text-body transition-colors hover:border-solar-yellow hover:text-solar-text-heading focus-visible:ring-2 focus-visible:ring-solar-yellow sm:size-10"
        :aria-label="notificationLabel"
      >
        <Bell class="size-4 sm:size-5" aria-hidden="true" />

        <span
          v-if="hasUnreadNotifications"
          class="absolute -left-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-solar-navy-dark ring-2 ring-solar-bg-card"
          aria-hidden="true"
        >
          {{ unreadCount !== null && unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </NuxtLink>

      <NuxtLink
        to="/customer/cart"
        class="relative flex size-9 items-center justify-center rounded-xl border border-solar-border-card text-solar-text-body transition-colors hover:border-solar-yellow hover:text-solar-text-heading focus-visible:ring-2 focus-visible:ring-solar-yellow sm:size-10"
        aria-label="سلة المشتريات"
      >
        <ShoppingCart
          class="size-4 sm:size-5"
          aria-hidden="true"
        />

        <span
          v-if="cartStore.totalItemsCount > 0"
          class="absolute -left-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-solar-yellow px-1 text-[10px] font-bold text-solar-navy-dark shadow-sm"
        >
          {{ cartStore.totalItemsCount }}
        </span>
      </NuxtLink>

      <div
        ref="accountMenu"
        class="relative"
        @keydown.esc.stop="escapeAccountMenu"
      >
        <button
          ref="accountButton"
          type="button"
          class="flex items-center gap-1.5 rounded-xl border border-solar-border-card bg-solar-bg-card p-1 pr-2 transition-colors hover:border-solar-yellow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow sm:gap-2.5 sm:p-1.5 sm:pr-3"
          :aria-expanded="isUserMenuOpen"
          aria-controls="customer-account-menu"
          @click="isUserMenuOpen = !isUserMenuOpen"
        >
          <span
            class="flex size-7 items-center justify-center rounded-lg bg-solar-navy text-white sm:size-8"
          >
            <User
              class="size-3.5 sm:size-4"
              aria-hidden="true"
            />
          </span>

          <span
            class="flex max-w-[120px] flex-col text-right leading-tight"
          >
            <span
              class="truncate text-xs font-bold text-solar-text-heading"
            >
              {{ userName }}
            </span>

            <span
              class="hidden text-[9px] text-solar-text-muted xs:inline sm:text-[10px]"
            >
              {{ userRole }}
            </span>
          </span>

          <ChevronDown
            class="size-3.5 text-solar-text-muted sm:size-4"
            aria-hidden="true"
          />
        </button>

        <div
          v-if="isUserMenuOpen"
          id="customer-account-menu"
          class="absolute left-0 z-50 mt-2 w-48 rounded-xl border border-solar-border-card bg-solar-bg-card p-2 text-right shadow-dropdown"
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

          <NuxtLink
            to="/customer/services/history"
            class="block rounded-lg px-3 py-2 text-xs font-semibold text-solar-text-body hover:bg-solar-bg-subtle"
            @click="isUserMenuOpen = false"
          >
            طلبات الخدمات الهندسية
          </NuxtLink>

          <hr class="my-1 border-solar-border-card">

          <button
            type="button"
            class="block w-full rounded-lg px-3 py-2 text-right text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            @click="handleLogout"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  </header>
</template>