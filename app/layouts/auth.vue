<script setup lang="ts">
import { Home } from 'lucide-vue-next'
import ThemeToggle from '~/components/common/ThemeToggle.vue'
</script>

<template>
  <div
    dir="rtl"
    class="relative flex min-h-screen w-full flex-col items-center justify-center bg-solar-bg-page p-4 sm:p-6 md:p-10 font-sans text-solar-text-heading antialiased selection:bg-solar-yellow selection:text-solar-navy-dark overflow-x-hidden transition-colors duration-200"
  >
    <!-- عناصر الزاوية العلوية: زر تبديل الوضع الداكن وزر العودة للرئيسية -->
    <div class="absolute top-4 sm:top-6 left-4 sm:left-6 z-20 flex items-center gap-2">
      <ThemeToggle />
      <NuxtLink
        to="/"
        class="flex size-9 sm:size-10 items-center justify-center rounded-xl border border-solar-border-card bg-solar-bg-card text-solar-text-heading hover:bg-solar-bg-subtle hover:border-solar-yellow transition-all duration-200 shadow-sm"
        title="العودة للصفحة الرئيسية"
        aria-label="العودة للصفحة الرئيسية"
      >
        <Home class="size-4.5 text-solar-navy dark:text-solar-yellow" />
      </NuxtLink>
    </div>

    <!-- إضاءة خلفية هادئة مستوحاة من الطاقة والشمس تتكيف مع الوضعين -->
    <div
      class="pointer-events-none absolute -top-40 right-1/2 h-96 w-96 translate-x-1/2 rounded-full bg-solar-yellow/10 dark:bg-solar-yellow/5 blur-3xl"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-solar-navy/5 dark:bg-blue-600/5 blur-3xl"
      aria-hidden="true"
    />

    <!-- محتوى شاشة المصادقة -->
    <main class="relative z-10 w-full flex items-center justify-center py-6">
      <slot />
    </main>
  </div>
</template>
