<script setup lang="ts">
import { Info } from 'lucide-vue-next'
import ServiceRequestForm from '../../../components/customer/services/ServiceRequestForm.vue'

definePageMeta({ layout: 'customer' })
useSeoMeta({ title: 'طلب خدمة هندسية جديدة | SolarHub' })
</script>

<template>
  <div class="flex min-w-0 flex-col gap-4">
    <nav class="flex flex-wrap items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل"><NuxtLink to="/customer/dashboard">الرئيسية</NuxtLink><span>‹</span><NuxtLink to="/customer/engineers">المهندسون</NuxtLink><span>‹</span><span class="text-solar-text-heading">طلب خدمة هندسية جديدة</span></nav>
    <header class="mb-3"><h1 class="text-2xl font-black text-solar-text-heading md:text-3xl">طلب خدمة هندسية جديدة</h1><p class="mt-3 text-sm leading-7 text-solar-text-body">قم بملء بيانات المشروع والخدمة المطلوبة لنشر طلبك وتلقي عروض المهندسين المعتمدين.</p></header>
    <p class="flex items-center gap-4 rounded-xl bg-solar-status-info-bg px-5 py-4 text-xs leading-7 text-solar-text-heading sm:px-6"><Info class="size-10 shrink-0 rounded-full bg-amber-100/60 p-2 text-solar-status-warning-text" aria-hidden="true" />عند نشر الطلب، سيتمكن المهندسون المؤهلون حسب الموقع والتخصص من تقديم عروضهم المخصصة وتحديد التكاليف والمدد الزمنية بدقة.</p>
    <ServiceRequestForm />
  </div>
</template>
