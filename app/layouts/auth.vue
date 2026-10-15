<template>
  <div
    dir="rtl"
    class="relative flex min-h-screen w-full flex-col items-center justify-center bg-solar-bg-page p-4 sm:p-6 md:p-10 font-sans text-solar-text-heading antialiased selection:bg-solar-yellow selection:text-solar-navy-dark overflow-x-hidden"
  >
    <!-- إضاءة خلفية هادئة مستوحاة من الطاقة والشمس -->
    <div
      class="pointer-events-none absolute -top-40 right-1/2 h-96 w-96 translate-x-1/2 rounded-full bg-solar-yellow/10 blur-3xl"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-solar-navy/5 blur-3xl"
      aria-hidden="true"
    />

    <!-- محتوى شاشة المصادقة -->
    <main class="relative z-10 w-full flex items-center justify-center py-6">
      <slot />
    </main>
  </div>
</template>
