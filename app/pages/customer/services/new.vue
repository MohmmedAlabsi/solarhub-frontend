<script setup lang="ts">
import { ArrowRight, ChevronRight, Home, Info, Wrench } from 'lucide-vue-next'
import ServiceRequestForm from '../../../components/customer/services/ServiceRequestForm.vue'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'طلب خدمة هندسية جديدة | SolarHub',
  description: 'قم بنشر طلب خدمة هندسية لتلقي عروض الأسعار والدراسات من نخبة المهندسين المعتمدين في SolarHub.',
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- مسار التنقل -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/customer/dashboard" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <NuxtLink to="/customer/services" class="hover:text-solar-text-heading">طلبات الخدمات الهندسية</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading">طلب خدمة جديدة</span>
    </nav>

    <!-- رأس الصفحة -->
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="text-2xl font-black text-solar-text-heading">طلب خدمة هندسية جديدة</h1>
        <p class="mt-1 text-xs text-solar-text-muted">
          أدخل بيانات مشروع الطاقة والخدمة المطلوبة لنشر طلبك للمهندسين وتلقي أفضل العروض الفنية والمالية
        </p>
      </div>

      <NuxtLink
        to="/customer/services"
        class="btn-outline gap-2 h-10 px-4 text-xs font-bold"
      >
        <ArrowRight class="size-4" />
        <span>العودة لطلبات الخدمات</span>
      </NuxtLink>
    </header>

    <!-- شريط معلومات إرشادي -->
    <div class="flex items-start gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-950">
      <Info class="size-5 shrink-0 text-amber-700 mt-0.5" />
      <div class="flex flex-col gap-1">
        <span class="font-bold">نشر وتنافس مفتوح للمهندسين المعتمدين:</span>
        <p class="text-amber-900/90 leading-relaxed text-[11px]">
          عند نشر طلبك، سيتم إشعار المهندسين المعتمدين حسب المحافظة ومجال التخصص ليقدموا عروضهم ومخططاتهم التفصيلية مع تحديد التكلفة ومدة التنفيذ بدقة.
        </p>
      </div>
    </div>

    <!-- نموذج الطلب -->
    <ServiceRequestForm />
  </div>
</template>
