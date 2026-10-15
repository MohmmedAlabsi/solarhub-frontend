<script setup lang="ts">
definePageMeta({
  layout: 'customer',
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted">
      <NuxtLink to="/customer/dashboard" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading">دليل المهندسين المعتمدين</span>
    </nav>

    <div class="rounded-2xl border border-solar-border-card bg-white p-8 shadow-sm text-center">
      <h1 class="text-xl font-bold text-solar-text-heading mb-2">دليل المهندسين والخبراء المعتمدين</h1>
      <p class="text-sm text-solar-text-muted max-w-md mx-auto">
        قسم المهندسين المعتمدين والخدمات الفنية (نطاق عمل المطور عبد الباقي).
      </p>
    </div>
  </div>
</template>
