<script setup lang="ts">
import { Home, Info } from 'lucide-vue-next'
import ServiceRequestForm from '../../../components/customer/services/ServiceRequestForm.vue'

definePageMeta({ layout: 'customer' })
useSeoMeta({ title: 'طلب خدمة هندسية جديدة | SolarHub' })
</script>

<template>
  <div class="service-request-page flex min-w-0 flex-col">
    <nav class="mb-2 flex flex-wrap items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل"><NuxtLink to="/customer/dashboard" class="inline-flex items-center gap-1"><Home class="size-3.5" aria-hidden="true" />الرئيسية</NuxtLink><span>‹</span><NuxtLink to="/customer/engineers">المهندسون</NuxtLink><span>‹</span><span class="text-solar-text-heading">طلب خدمة هندسية جديدة</span></nav>
    <header class="mb-6"><h1 class="text-2xl font-bold leading-[44px] text-solar-text-heading md:text-[32px]">طلب خدمة هندسية جديدة</h1><p class="mt-2 text-sm leading-7 text-solar-text-body">قم بملء بيانات المشروع والخدمة المطلوبة لنشر طلبك وتلقي عروض المهندسين المعتمدين.</p></header>
    <p class="mb-4 flex min-h-[72px] items-center gap-4 rounded-xl bg-solar-status-info-bg px-4 py-4 text-[13px] leading-6 text-solar-text-heading"><Info class="size-10 shrink-0 rounded-full bg-[#deddd9] p-2.5 text-[#856300]" aria-hidden="true" />عند نشر الطلب، سيتمكن المهندسون المؤهلون حسب الموقع والتخصص من تقديم عروضهم المخصصة وتحديد التكاليف والمدد الزمنية بدقة.</p>
    <ServiceRequestForm />
  </div>
</template>
