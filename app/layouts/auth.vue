<script setup lang="ts">
import { Sun, ArrowRight } from 'lucide-vue-next'

// Ensure RTL and Arabic page attributes are active
useHead({
  htmlAttrs: {
    lang: 'ar',
    dir: 'rtl',
  },
})
</script>

<template>
  <div class="min-h-screen bg-[#F6F8FB] text-slate-800 flex flex-col justify-between relative selection:bg-brand-400 selection:text-ink overflow-x-hidden font-sans" dir="rtl">
    <!-- Subtle background solar aura accents -->
    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div class="absolute -top-40 right-1/2 translate-x-1/2 w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-3xl" />
      <div class="absolute bottom-0 left-0 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl" />
    </div>

    <!-- Top Navigation / Return Home -->
    <header class="relative z-10 w-full px-4 sm:px-8 py-5 flex items-center justify-between max-w-7xl mx-auto">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-[#24374e] transition-colors py-1.5 px-3 rounded-lg hover:bg-white/80"
      >
        <ArrowRight class="size-4 shrink-0" />
        <span>العودة إلى الرئيسية</span>
      </NuxtLink>

      <div class="flex items-center gap-2 text-xs text-slate-400">
        <Sun class="size-3.5 text-brand-500" />
        <span>منصة الطاقة الشمسية الموثوقة</span>
      </div>
    </header>

    <!-- Main Content: Centered Auth Card Container -->
    <main class="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
      <div class="w-full max-w-[520px]">
        <div class="bg-white rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(15,23,42,0.04)] p-6 sm:p-9 transition-all duration-300">
          <!-- Prominent Official SolarHub Logo -->
          <div class="flex flex-col items-center justify-center mb-6">
            <NuxtLink to="/" class="group transition-transform active:scale-95" aria-label="سولار هب - SolarHub">
              <img
                src="/images/solarhub-logo.png"
                alt="SolarHub Logo"
                class="h-14 sm:h-16 w-auto object-contain transition-opacity group-hover:opacity-90"
              />
            </NuxtLink>
          </div>

          <!-- Page Content Slot -->
          <slot />
        </div>
      </div>
    </main>

    <!-- Footer Copyright -->
    <footer class="relative z-10 py-5 text-center text-xs text-slate-400">
      <p>© {{ new Date().getFullYear() }} سولار هب (SolarHub). جميع الحقوق محفوظة.</p>
    </footer>
  </div>
</template>
