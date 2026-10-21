<script setup lang="ts">
import { Bell, ChevronDown, Menu, User } from 'lucide-vue-next'
import { useAuthStore } from '~~/app/stores/auth.store'

withDefaults(defineProps<{ isMobileOpen?: boolean }>(), { isMobileOpen: false })
const emit = defineEmits<{
  (e: 'toggleMobileMenu'): void
  (e: 'unavailable', label: string): void
}>()

const authStore = useAuthStore()
const isUserMenuOpen = ref(false)
const accountMenu = ref<HTMLElement>()
const accountButton = ref<HTMLButtonElement>()
const route = useRoute()

// اسم المهندس من الـ store أو بيانات تجريبية
// TODO: استبدل بـ useFetch('/api/engineer/me') عند ربط الـ API
const engineerName = computed(() => authStore.user?.name ?? 'م. أحمد الشمري')

function closeAccountMenu(event: PointerEvent) {
  if (event.target instanceof Node && !accountMenu.value?.contains(event.target)) isUserMenuOpen.value = false
}
function escapeAccountMenu() { isUserMenuOpen.value = false; accountButton.value?.focus() }

watch(() => route.fullPath, () => { isUserMenuOpen.value = false })
onMounted(() => document.addEventListener('pointerdown', closeAccountMenu))
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeAccountMenu))
</script>

<template>
  <header class="sticky top-0 z-30 flex w-full shrink-0 items-center justify-between bg-white px-3 sm:px-6 h-16 border-b border-solar-border-card shadow-sm sm:h-20">

    <!-- يسار الهيدر: زر الجوال + اسم المنصة -->
    <div class="flex items-center gap-2 sm:gap-4">
      <button
        type="button"
        @click="emit('toggleMobileMenu')"
        class="flex size-9 sm:size-10 items-center justify-center rounded-lg border border-solar-border-card text-solar-text-heading lg:hidden hover:bg-solar-bg-subtle active:scale-95 transition-all"
        aria-label="فتح القائمة الجانبية"
        :aria-expanded="isMobileOpen"
      >
        <Menu class="size-5" />
      </button>

      <div class="hidden sm:flex flex-col">
        <p class="text-sm sm:text-base font-bold text-solar-text-heading leading-tight">بوابة المهندسين | SolarHub</p>
        <p class="text-[11px] text-solar-text-muted">منصة الخدمات الهندسية والمشاريع الشمسية المعتمدة</p>
      </div>

      <span class="text-xs font-black text-solar-navy-dark sm:hidden">
        سولار <span class="text-solar-yellow">هب</span>
      </span>
    </div>

    <!-- يمين الهيدر: إشعارات + حساب المستخدم -->
    <div class="flex items-center gap-2 sm:gap-3.5">
      <!-- أيقونة الإشعارات -->
      <NuxtLink
        to="/engineer/notifications"
        class="relative flex size-9 sm:size-10 items-center justify-center rounded-xl border border-solar-border-card text-solar-text-body transition-colors hover:border-solar-yellow hover:text-solar-text-heading"
        aria-label="الإشعارات"
      >
        <Bell class="size-4 sm:size-5" />
        <!-- نقطة إشعار تجريبية -->
        <!-- TODO: استبدل بعداد الإشعارات الحقيقي -->
        <span class="absolute top-2 left-2 size-2 sm:size-2.5 rounded-full bg-amber-500 ring-2 ring-white" aria-hidden="true" />
      </NuxtLink>

      <!-- قائمة حساب المستخدم -->
      <div ref="accountMenu" class="relative" @keydown.esc.stop="escapeAccountMenu">
        <button
          ref="accountButton"
          type="button"
          @click="isUserMenuOpen = !isUserMenuOpen"
          class="flex items-center gap-1.5 sm:gap-2.5 p-1 pr-2 rounded-xl border border-solar-border-card transition-colors hover:border-solar-yellow sm:p-1.5 sm:pr-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow"
          :aria-expanded="isUserMenuOpen"
        >
          <div class="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-solar-navy text-white">
            <User class="size-3.5 sm:size-4" />
          </div>
          <div class="text-right flex flex-col leading-tight">
            <span class="text-xs font-bold text-solar-text-heading">{{ engineerName }}</span>
            <span class="text-[9px] sm:text-[10px] text-solar-yellow font-semibold">مهندس معتمد</span>
          </div>
          <ChevronDown class="size-3.5 sm:size-4 text-solar-text-muted" />
        </button>

        <!-- القائمة المنسدلة -->
        <div
          v-if="isUserMenuOpen"
          class="absolute left-0 mt-2 w-52 rounded-xl border border-solar-border-card bg-white p-2 shadow-dropdown z-50 text-right"
        >
          <NuxtLink
            to="/engineer/settings"
            class="block rounded-lg px-3 py-2 text-xs font-semibold text-solar-text-body hover:bg-solar-bg-subtle"
            @click="isUserMenuOpen = false"
          >
            الملف الشخصي والإعدادات
          </NuxtLink>
          <NuxtLink
            to="/engineer/profile"
            class="block rounded-lg px-3 py-2 text-xs font-semibold text-solar-text-body hover:bg-solar-bg-subtle"
            @click="isUserMenuOpen = false"
          >
            الملف المهني
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
