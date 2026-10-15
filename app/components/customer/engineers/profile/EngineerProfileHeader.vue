<script setup lang="ts">
import { BadgeCheck, BriefcaseBusiness, Clock3, MapPin, MessageSquareText, ShieldCheck, Star } from 'lucide-vue-next'
import type { EngineerProfile } from '../../../../../types/engineer'

defineProps<{ engineer: EngineerProfile }>()
defineEmits<{ service: []; message: [] }>()
</script>

<template>
  <section class="rounded-2xl border border-solar-border-card bg-white p-5 shadow-sm sm:p-7" aria-labelledby="engineer-name">
    <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex min-w-0 flex-col items-center gap-5 text-center sm:flex-row sm:text-right">
        <div class="relative shrink-0"><img :src="engineer.image" :alt="`صورة ${engineer.name}`" width="112" height="112" class="size-28 rounded-2xl object-cover" /><span class="absolute -bottom-2 right-2 size-6 rounded-full border-4 border-white bg-emerald-500" aria-label="متاح حاليًا" /></div>
        <div class="min-w-0">
          <div class="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-start"><h1 id="engineer-name" class="text-2xl font-black text-solar-text-heading md:text-3xl">{{ engineer.name }}</h1><span class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-2 text-[11px] font-bold text-emerald-700"><BadgeCheck class="size-4" aria-hidden="true" /> مهندس معتمد ومفحوص 100%</span></div>
          <p class="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-amber-700 sm:justify-start"><Star class="size-4 fill-solar-yellow text-solar-yellow" aria-hidden="true" /> {{ engineer.rating }} <span>({{ engineer.verifiedReviews }} تقييم حقيقي موثق)</span></p>
          <p class="mt-3 max-w-2xl text-sm leading-7 text-solar-text-body">{{ engineer.specialty }} لمحطات طاقة شمسية صناعية وتجارية وزراعية معتمدة.</p>
          <div class="mt-4 flex flex-wrap justify-center gap-2 text-[11px] text-solar-text-body sm:justify-start"><span class="inline-flex items-center gap-1 rounded-lg bg-solar-bg-subtle px-3 py-2"><MapPin class="size-3.5" aria-hidden="true" /> {{ engineer.city }}، المملكة العربية السعودية</span><span class="inline-flex items-center gap-1 rounded-lg bg-solar-bg-subtle px-3 py-2"><BriefcaseBusiness class="size-3.5" aria-hidden="true" /> خبرة +{{ engineer.experienceYears }} سنوات</span><span class="inline-flex items-center gap-1 rounded-lg bg-solar-bg-subtle px-3 py-2"><ShieldCheck class="size-3.5" aria-hidden="true" /> ترخيص الهيئة السعودية: {{ engineer.licenseNumber }}</span></div>
        </div>
      </div>
      <div class="flex shrink-0 items-center justify-center gap-3"><button type="button" class="inline-flex size-11 items-center justify-center rounded-xl bg-solar-bg-subtle text-solar-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow" aria-label="مراسلة المهندس" @click="$emit('message')"><MessageSquareText class="size-5" aria-hidden="true" /></button><button type="button" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-solar-navy px-6 text-sm font-bold text-white hover:bg-solar-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow" @click="$emit('service')"><BriefcaseBusiness class="size-4" aria-hidden="true" /> طلب خدمة هندسية</button></div>
    </div>
    <div class="mt-7 grid gap-3 border-t border-solar-border-card pt-5 sm:grid-cols-2 xl:grid-cols-4">
      <div class="flex items-center gap-3 rounded-xl bg-solar-bg-subtle p-4"><BadgeCheck class="size-6 text-emerald-600" aria-hidden="true" /><p class="text-xs"><strong class="block text-base text-solar-text-heading">+{{ engineer.completedProjects }} مشروع</strong> معتمد ومنجز</p></div>
      <div class="flex items-center gap-3 rounded-xl bg-solar-bg-subtle p-4"><ShieldCheck class="size-6 text-solar-navy" aria-hidden="true" /><p class="text-xs"><strong class="block text-base text-solar-text-heading">100%</strong> مطابقة كود البناء السعودي</p></div>
      <div class="flex items-center gap-3 rounded-xl bg-solar-bg-subtle p-4"><Clock3 class="size-6 text-amber-600" aria-hidden="true" /><p class="text-xs"><strong class="block text-base text-solar-text-heading">{{ engineer.responseTime }}</strong> متوسط سرعة الرد</p></div>
      <div class="flex items-center gap-3 rounded-xl bg-solar-bg-subtle p-4"><ShieldCheck class="size-6 text-solar-navy" aria-hidden="true" /><p class="text-xs"><strong class="block text-base text-solar-text-heading">موثق SCE</strong> تحقق يدوي من المنصة</p></div>
    </div>
  </section>
</template>