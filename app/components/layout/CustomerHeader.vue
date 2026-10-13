<script setup lang="ts">
import { Bell, ChevronDown, Menu, ShoppingCart, UserRound } from 'lucide-vue-next'
const emit = defineEmits<{ menu: []; unavailable: [label: string] }>()
</script>
<template>
  <header class="flex h-[72px] items-center justify-between border-b border-[#e9edf3] bg-white px-4 shadow-sm sm:px-6">
    <button type="button" class="flex size-10 items-center justify-center rounded-lg text-[#17324d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f8b900] lg:hidden" aria-label="فتح القائمة الجانبية" @click="emit('menu')"><Menu class="size-6" aria-hidden="true" /></button>
    <div class="mr-auto flex items-center gap-4 sm:gap-5">
      <button type="button" class="relative text-[#172f48]" aria-label="الإشعارات" @click="emit('unavailable', 'الإشعارات')"><Bell class="size-5" aria-hidden="true" /></button>
      <button type="button" class="relative text-[#172f48]" aria-label="سلة المشتريات، 3 عناصر" @click="emit('unavailable', 'سلة المشتريات')"><ShoppingCart class="size-6" aria-hidden="true" /><span class="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-[#806000] text-[10px] text-white">3</span></button>
      <button type="button" class="flex items-center gap-2 font-semibold text-[#172f48]" aria-label="قائمة حساب وجدان" @click="emit('unavailable', 'الحساب الشخصي')"><span class="flex size-9 items-center justify-center rounded-full bg-[#17324d] text-white"><UserRound class="size-5" aria-hidden="true" /></span><span class="hidden sm:inline">وجدان</span><ChevronDown class="hidden size-4 sm:block" aria-hidden="true" /></button>
    </div>
  </header>
</template>
