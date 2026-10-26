<script setup lang="ts">
import { ClipboardList, Home, Info } from 'lucide-vue-next'
import ServiceRequestForm from '../../../components/customer/services/ServiceRequestForm.vue'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'طلب خدمة هندسية جديدة | SolarHub',
})
</script>

<template>
  <div dir="rtl" class="flex min-w-0 flex-col">
    <nav
      class="mb-4 flex flex-wrap items-center gap-2 text-xs text-solar-text-muted"
      aria-label="مسار التنقل"
    >
      <NuxtLink
        to="/customer/dashboard"
        class="inline-flex items-center gap-1"
      >
        <Home class="size-3.5" aria-hidden="true" />
        الرئيسية
      </NuxtLink>

      <span aria-hidden="true">‹</span>

      <NuxtLink to="/customer/services/history">
        طلباتي
      </NuxtLink>

      <span aria-hidden="true">‹</span>

      <span class="text-solar-text-heading">
        طلب خدمة هندسية جديدة
      </span>
    </nav>

    <header
      class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start"
    >
      <div>
        <h1
          class="text-2xl font-bold leading-relaxed text-solar-text-heading md:text-3xl"
        >
          طلب خدمة هندسية جديدة
        </h1>

        <p class="mt-2 text-sm leading-7 text-solar-text-body">
          أدخل بيانات المشروع والخدمة المطلوبة لنشر طلبك وتلقي عروض المهندسين.
        </p>
      </div>

      <NuxtLink
        to="/customer/services/history"
        class="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-solar-border-card bg-white px-5 py-3 text-sm font-bold text-solar-text-heading focus-visible:ring-2 focus-visible:ring-solar-yellow"
      >
        <ClipboardList class="size-4" aria-hidden="true" />
        طلباتي
      </NuxtLink>
    </header>

    <aside
      class="mb-5 flex items-start gap-3 rounded-xl bg-solar-status-info-bg p-4"
      aria-label="معلومات نشر الطلب"
    >
      <Info
        class="mt-1 size-5 shrink-0 text-amber-700"
        aria-hidden="true"
      />

      <p class="text-sm leading-7 text-solar-text-body">
        بعد نشر الطلب، يمكن للمهندسين المعتمدين تقديم عروضهم.
        افتح «طلباتي» لمتابعة حالة الطلب ومراجعة العروض والمقارنة بينها.
      </p>
    </aside>

    <ServiceRequestForm />
  </div>
</template>