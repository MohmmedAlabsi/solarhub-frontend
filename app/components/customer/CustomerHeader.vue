<script setup lang="ts">
import { Bell, ChevronDown, Menu, ShoppingCart, User } from 'lucide-vue-next'
import { useCartStore } from '~~/app/stores/cart.store'

const emit = defineEmits<{
  (e: 'toggleMobileMenu'): void
}>()

const cartStore = useCartStore()
const isUserMenuOpen = ref(false)
</script>

<template>
  <header class="sticky top-0 z-30 flex h-16 sm:h-20 w-full items-center justify-between border-b border-solar-border-card bg-white px-3 sm:px-6 shadow-sm">
    <!-- الجانب الأيمن (زر القائمة للشاشات الصغيرة + عنوان ترحيبي متجاوب) -->
    <div class="flex items-center gap-2 sm:gap-4">
      <button
        type="button"
        @click="emit('toggleMobileMenu')"
        class="flex size-9 sm:size-10 items-center justify-center rounded-lg border border-solar-border-card text-solar-text-heading lg:hidden hover:bg-solar-bg-subtle active:scale-95 transition-all"
        aria-label="فتح القائمة"
      >
        <Menu class="size-5" />
      </button>

      <div class="hidden sm:flex flex-col">
        <h1 class="text-sm sm:text-base font-bold text-solar-text-heading leading-tight">بوابة العميل | SolarHub</h1>
        <p class="text-[11px] text-solar-text-muted">المنظومات وحلول الطاقة الكهروضوئية المعتمدة</p>
      </div>

      <!-- شعار مبسط في الهواتف الذكية فقط إذا كان العنوان مخفياً -->
      <span class="text-xs font-black text-solar-navy-dark sm:hidden">
        سولار <span class="text-solar-yellow">هب</span>
      </span>
    </div>

    <!-- الجانب الأيسر (الإشعارات، السلة، الحساب الشخصي) متجاوب بالكامل -->
    <div class="flex items-center gap-2 sm:gap-3.5">
      <!-- زر الإشعارات -->
      <NuxtLink
        to="/customer/notifications"
        class="relative flex size-9 sm:size-10 items-center justify-center rounded-xl border border-solar-border-card text-solar-text-body transition-colors hover:border-solar-yellow hover:text-solar-text-heading"
        aria-label="مركز الإشعارات"
      >
        <Bell class="size-4 sm:size-5" />
        <span class="absolute top-2 left-2 size-2 sm:size-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
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
      <div class="relative">
        <button
          type="button"
          @click="isUserMenuOpen = !isUserMenuOpen"
          class="flex items-center gap-1.5 sm:gap-2.5 rounded-xl border border-solar-border-card p-1 sm:p-1.5 pr-2 sm:pr-3 transition-colors hover:border-solar-yellow focus:outline-none"
        >
          <div class="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-solar-navy text-white">
            <User class="size-3.5 sm:size-4" />
          </div>
          <div class="text-right flex flex-col leading-tight">
            <span class="text-xs font-bold text-solar-text-heading">وجدان</span>
            <span class="text-[9px] sm:text-[10px] text-solar-text-muted hidden xs:inline">عميل مميز</span>
          </div>
          <ChevronDown class="size-3.5 sm:size-4 text-solar-text-muted" />
        </button>

        <!-- القائمة المنسدلة -->
        <div
          v-if="isUserMenuOpen"
          class="absolute left-0 mt-2 w-48 rounded-xl border border-solar-border-card bg-white p-2 shadow-dropdown z-50 text-right"
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
          <NuxtLink
            to="/auth/login"
            class="block rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
            @click="isUserMenuOpen = false"
          >
            تسجيل الخروج
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>
