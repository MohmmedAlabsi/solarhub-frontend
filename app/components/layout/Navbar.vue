<script setup lang="ts">
import { Menu, Sun, X } from 'lucide-vue-next'

const links = [
  { label: 'الرئيسية', to: '/', active: true },
  { label: 'المنتجات', to: '#products' },
  { label: 'الموردين', to: '#stores' },
  { label: 'المهندسين', to: '#consultants' },
  { label: 'عن المنصة', to: '#services' },
]

const isOpen = ref(false)
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-surface-line bg-white/90 backdrop-blur">
    <nav class="container-page flex h-16 items-center justify-between gap-6" aria-label="التنقل الرئيسي">
      <NuxtLink to="/" class="flex items-center gap-2" aria-label="سولار هب - الرئيسية">
        <span class="flex size-9 items-center justify-center rounded-lg bg-brand-400 text-ink">
          <Sun class="size-5" aria-hidden="true" />
        </span>
        <span class="text-lg font-bold text-ink">سولار <span class="text-brand-600">هب</span></span>
      </NuxtLink>

      <ul class="hidden items-center gap-8 lg:flex">
        <li v-for="link in links" :key="link.label">
          <NuxtLink
            :to="link.to"
            class="relative py-5 text-sm font-medium transition-colors"
            :class="link.active ? 'text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-brand-400' : 'text-ink-500 hover:text-ink'"
            :aria-current="link.active ? 'page' : undefined"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>

      <div class="hidden items-center gap-3 lg:flex">
        <NuxtLink to="/auth/login" class="btn-outline px-4 py-2">تسجيل الدخول</NuxtLink>
        <NuxtLink to="/auth/register" class="btn-dark px-4 py-2">إنشاء حساب</NuxtLink>
      </div>

      <button
        type="button"
        class="flex size-10 items-center justify-center rounded-lg border border-surface-line text-ink lg:hidden"
        :aria-expanded="isOpen"
        aria-controls="mobile-menu"
        @click="isOpen = !isOpen"
      >
        <span class="sr-only">{{ isOpen ? 'إغلاق القائمة' : 'فتح القائمة' }}</span>
        <X v-if="isOpen" class="size-5" aria-hidden="true" />
        <Menu v-else class="size-5" aria-hidden="true" />
      </button>
    </nav>

    <div v-show="isOpen" id="mobile-menu" class="border-t border-surface-line bg-white lg:hidden">
      <ul class="container-page flex flex-col gap-1 py-4">
        <li v-for="link in links" :key="link.label">
          <NuxtLink
            :to="link.to"
            class="block rounded-lg px-3 py-2.5 text-sm font-medium"
            :class="link.active ? 'bg-brand-50 text-ink' : 'text-ink-500 hover:bg-surface'"
            @click="isOpen = false"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
        <li class="mt-3 grid grid-cols-2 gap-3">
          <NuxtLink to="/auth/login" class="btn-outline">تسجيل الدخول</NuxtLink>
          <NuxtLink to="/auth/register" class="btn-dark">إنشاء حساب</NuxtLink>
        </li>
      </ul>
    </div>
  </header>
</template>
