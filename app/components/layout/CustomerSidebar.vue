<script setup lang="ts">
import { Archive, Bell, FileBadge, Heart, Home, LogOut, Settings, ShoppingBag, Store, UsersRound, Wrench } from 'lucide-vue-next'
import type { Component } from 'vue'
interface NavItem { label: string; icon: Component; active?: boolean; divider?: boolean }
defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; unavailable: [label: string] }>()
const items: NavItem[] = [
  { label: 'الرئيسية', icon: Home, active: true }, { label: 'المنتجات', icon: Archive }, { label: 'المهندسون', icon: UsersRound }, { label: 'الموردون', icon: Store },
  { label: 'طلبات عروض الأسعار', icon: FileBadge, divider: true }, { label: 'طلباتي', icon: ShoppingBag }, { label: 'طلبات الخدمات', icon: Wrench }, { label: 'المفضلة', icon: Heart },
  { label: 'الإشعارات', icon: Bell, divider: true }, { label: 'الإعدادات', icon: Settings },
]
const choose = (item: NavItem) => { if (!item.active) emit('unavailable', item.label); emit('close') }
</script>
<template>
  <div v-if="open" class="fixed inset-0 z-40 bg-black/45 lg:hidden" aria-hidden="true" @click="emit('close')" />
  <aside id="customer-sidebar" class="fixed inset-y-0 right-0 z-50 flex w-64 flex-col bg-[#24445f] px-3 pb-5 text-white transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0" :class="open ? 'translate-x-0' : 'translate-x-full'" aria-label="القائمة الجانبية">
    <div class="flex h-[88px] items-center justify-center"><NuxtLink to="/dashboard" aria-label="سولار هب - لوحة التحكم"><img src="/images/sh-logo.png" alt="SolarHub" class="h-[62px] w-[150px] object-contain" /></NuxtLink></div>
    <nav class="min-h-0 flex-1 overflow-y-auto"><ul><li v-for="item in items" :key="item.label" :class="item.divider ? 'mt-3 border-t border-white/55 pt-3' : ''"><button type="button" class="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-right text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f8b900]" :class="item.active ? 'bg-[#fdbb00] font-bold text-[#17324d]' : 'text-[#f1f5f8] hover:bg-white/10'" :aria-current="item.active ? 'page' : undefined" @click="choose(item)"><component :is="item.icon" class="size-5 shrink-0" aria-hidden="true" />{{ item.label }}</button></li></ul></nav>
    <button type="button" class="mt-4 flex items-center gap-3 px-4 py-2 text-sm font-medium hover:text-[#fdbb00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f8b900]" @click="emit('unavailable', 'تسجيل الخروج')"><LogOut class="size-5" aria-hidden="true" />تسجيل الخروج</button>
  </aside>
</template>

<style scoped>
nav { scrollbar-width: none; }
nav::-webkit-scrollbar { display: none; }
</style>
