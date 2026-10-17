<script setup lang="ts">
import { Bell, ChevronDown, Menu, Shield, User } from 'lucide-vue-next'

withDefaults(defineProps<{ isMobileOpen?: boolean }>(), { isMobileOpen: false })
const emit = defineEmits<{
  (e: 'toggleMobileMenu'): void
  (e: 'unavailable', label: string): void
}>()

const isUserMenuOpen = ref(false)
const accountMenu = ref<HTMLElement>()
const route = useRoute()

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
        class="flex size-10 items-center justify-center rounded-xl border border-solar-border-card text-solar-text-heading lg:hidden hover:bg-solar-bg-subtle active:scale-95 transition-all"
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
          <p class="text-sm sm:text-base font-extrabold text-solar-text-heading leading-tight">لوحة الإدارة العامة | SolarHub</p>
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

      <!-- بطاقة المشرف العام / المسؤول -->
      <div ref="accountMenu" class="relative">
        <button
          type="button"
          @click="isUserMenuOpen = !isUserMenuOpen"
          class="flex items-center gap-2.5 rounded-xl border border-solar-border-card p-1.5 pr-3 transition-colors hover:border-solar-yellow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow"
          :aria-expanded="isUserMenuOpen"
        >
          <div class="flex size-8 items-center justify-center rounded-lg bg-solar-navy text-white font-bold text-xs">
            ف
          </div>
          <div class="text-right flex flex-col leading-tight">
            <span class="text-xs font-bold text-solar-text-heading">م. فهد السديري</span>
            <span class="text-[10px] text-solar-text-muted">مدير النظام العام</span>
          </div>
          <ChevronDown class="size-4 text-solar-text-muted" />
        </button>

        <!-- قائمة المشرف المنسدلة -->
        <div
          v-if="isUserMenuOpen"
          class="absolute left-0 mt-2 w-52 rounded-xl border border-solar-border-card bg-white p-2 shadow-dropdown z-50 text-right"
        >
          <div class="px-3 py-2 border-b border-solar-border-card/60 mb-1">
            <p class="text-xs font-bold text-solar-text-heading">م. فهد السديري</p>
            <p class="text-[10px] text-solar-text-muted">admin@solarhub.sa</p>
          </div>
          <NuxtLink
            to="/admin/settings"
            class="block rounded-lg px-3 py-2 text-xs font-semibold text-solar-text-body hover:bg-solar-bg-subtle"
            @click="isUserMenuOpen = false"
          >
            إعدادات المنصة
          </NuxtLink>
          <NuxtLink
            to="/customer/dashboard"
            class="block rounded-lg px-3 py-2 text-xs font-semibold text-solar-text-body hover:bg-solar-bg-subtle"
            @click="isUserMenuOpen = false"
          >
            الانتقال لبوابة العميل
          </NuxtLink>
          <hr class="my-1 border-solar-border-card" />
          <button
            type="button"
            class="block w-full rounded-lg px-3 py-2 text-right text-xs font-semibold text-red-600 hover:bg-red-50"
            @click="isUserMenuOpen = false; emit('unavailable', 'تسجيل الخروج')"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
