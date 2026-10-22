<script setup lang="ts">
import { Bell, ChevronDown, ExternalLink, Loader2, LogOut, Menu, Shield, User } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../../stores/auth'

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
const { logout } = useAuth()

const isLoggingOut = ref(false)

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

async function handleLogout() {
  isLoggingOut.value = true
  isUserMenuOpen.value = false
  await logout()
}

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
  <header class="sticky top-0 z-30 flex h-16 sm:h-20 w-full shrink-0 items-center justify-between border-b border-solar-border-card bg-white px-4 sm:px-8 shadow-sm">
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
        <div class="flex size-9 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark">
          <Shield class="size-5 stroke-[2.2]" />
        </div>
        <div class="flex flex-col">
          <p class="text-sm sm:base font-extrabold text-solar-text-heading leading-tight">لوحة الإدارة العامة | SolarHub</p>
          <p class="text-[11px] text-solar-text-muted">التحكم المركزي، الكتالوج والعمليات المالية</p>
        </div>
      </div>

      <span class="text-sm font-black text-solar-navy-dark sm:hidden">
        سولار <span class="text-solar-yellow">هب</span> الإدارة
      </span>
    </div>

    <!-- الجانب الأيسر: زر الإشعارات وملف المشرف العام -->
    <div class="flex items-center gap-3 sm:gap-4">
      <!-- زر إشعارات الأدمن -->
      <NuxtLink
        to="/admin/notifications"
        class="relative flex size-10 items-center justify-center rounded-xl border border-solar-border-card text-solar-text-body transition-colors hover:border-solar-yellow hover:text-solar-text-heading"
        aria-label="إشعارات النظام"
      >
        <Bell class="size-5" />
        <span class="absolute top-2.5 left-2.5 size-2 rounded-full bg-amber-500 ring-2 ring-white" aria-hidden="true" />
      </NuxtLink>

      <!-- بطاقة المشرف العام / المسؤول المسجل دخوله حالياً -->
      <div ref="accountMenu" class="relative">
        <button
          type="button"
          @click="isUserMenuOpen = !isUserMenuOpen"
          class="flex items-center gap-2.5 rounded-xl border border-solar-border-card p-1.5 pr-3 transition-colors hover:border-solar-yellow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow cursor-pointer bg-white"
          :aria-expanded="isUserMenuOpen"
        >
          <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-solar-navy text-white font-bold text-xs select-none shadow-xs">
            {{ userInitial }}
          </div>
          <div class="text-right flex flex-col leading-tight min-w-0 max-w-[130px] sm:max-w-[160px]">
            <span class="text-xs font-bold text-solar-text-heading truncate">{{ userName }}</span>
            <span class="text-[10px] text-solar-text-muted truncate">{{ userRoleLabel }}</span>
          </div>
          <ChevronDown
            class="size-4 text-solar-text-muted transition-transform duration-200"
            :class="{ 'rotate-180': isUserMenuOpen }"
          />
        </button>

        <!-- قائمة المشرف المنسدلة -->
        <div
          v-if="isUserMenuOpen"
          class="absolute left-0 mt-2 w-64 rounded-xl border border-solar-border-card bg-white p-2 shadow-dropdown z-50 text-right"
        >
          <!-- بيانات المشرف المسجل دخوله حالياً -->
          <div class="px-3 py-2 border-b border-solar-border-card/60 mb-1">
            <p class="text-xs font-black text-solar-text-heading truncate">{{ userName }}</p>
            <p class="text-[11px] text-solar-text-muted font-mono truncate text-right mt-0.5" dir="ltr">{{ userEmail }}</p>
            <span class="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold">
              {{ userRoleLabel }}
            </span>
          </div>

          <!-- الروابط الإجرائية -->
          <NuxtLink
            to="/admin/settings"
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-solar-text-body hover:bg-solar-bg-subtle hover:text-solar-navy transition-colors"
            @click="isUserMenuOpen = false"
          >
            <User class="size-4 text-solar-text-muted" />
            <span>الملف الشخصي وإعدادات المنصة</span>
          </NuxtLink>

          <NuxtLink
            to="/customer/dashboard"
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-solar-text-body hover:bg-solar-bg-subtle hover:text-solar-navy transition-colors"
            @click="isUserMenuOpen = false"
          >
            <ExternalLink class="size-4 text-solar-text-muted" />
            <span>الانتقال لبوابة العميل</span>
          </NuxtLink>

          <hr class="my-1 border-solar-border-card" />

          <!-- زر تسجيل الخروج -->
          <button
            type="button"
            :disabled="isLoggingOut"
            class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-right text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
            @click="handleLogout"
          >
            <Loader2 v-if="isLoggingOut" class="size-4 animate-spin text-red-600" />
            <LogOut v-else class="size-4 text-red-600" />
            <span>{{ isLoggingOut ? 'جارٍ تسجيل الخروج...' : 'تسجيل الخروج' }}</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
