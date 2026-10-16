<script setup lang="ts">
import { ArrowRight, Info, Tags } from 'lucide-vue-next'
import ServiceProjectSummary from '../../../components/customer/services/ServiceProjectSummary.vue'
import ServiceEngineerOffer from '../../../components/customer/services/ServiceEngineerOffer.vue'

definePageMeta({ layout: 'customer' })
const { project, offers, acceptedOfferId, pendingOffer, statusLabel, noticeMessage, requestAcceptance, cancelAcceptance, confirmAcceptance } = useServiceProject()
useSeoMeta({ title: () => project.value ? `${project.value.title} | SolarHub` : 'المشروع غير موجود | SolarHub' })
</script>

<template>
  <div class="flex min-w-0 flex-col gap-6">
    <nav class="flex flex-wrap items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل"><NuxtLink to="/customer/dashboard">الرئيسية</NuxtLink><span>‹</span><NuxtLink to="/customer/services">طلبات الخدمات</NuxtLink><span>‹</span><span class="font-bold text-solar-text-heading">تفاصيل المشروع وعروض المهندسين</span></nav>
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 class="text-2xl font-black leading-relaxed text-solar-text-heading md:text-3xl">تفاصيل المشروع وعروض المهندسين</h1><p class="mt-2 text-sm leading-7 text-solar-text-muted">مراجعة بيانات الخدمة الهندسية ومقارنة العروض الفنية والمالية المقدمة من نخبة المهندسين المعتمدين</p></div><NuxtLink to="/customer/services" class="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-solar-border-card bg-white px-4 py-3 text-xs font-bold text-solar-text-heading focus-visible:ring-2 focus-visible:ring-solar-yellow"><ArrowRight class="size-4" aria-hidden="true" />العودة إلى المشاريع</NuxtLink></header>
    <template v-if="project">
      <ServiceProjectSummary :project="project" :status-label="statusLabel" :awarded="!!acceptedOfferId" />
      <section class="flex min-w-0 flex-col gap-5" aria-labelledby="offers-heading">
        <div class="flex flex-col gap-3 rounded-xl bg-indigo-50/80 p-5 sm:flex-row sm:items-center sm:justify-between"><h2 id="offers-heading" class="flex flex-wrap items-center gap-2 text-lg font-extrabold text-solar-text-heading"><Tags class="size-5" aria-hidden="true" />عروض المهندسين المعتمدين<span class="rounded-full bg-solar-navy-dark px-3 py-1 text-[10px] text-white">{{ offers.length }} عروض</span></h2><p class="flex items-center gap-2 text-[11px] leading-6 text-solar-text-muted"><Info class="size-4 shrink-0 text-amber-700" aria-hidden="true" />قبول أي عرض يغلق المشروع ويعتمده للبدء الفوري</p></div>
        <p class="text-[11px] leading-6 text-solar-text-muted">بيانات وإجراءات تجريبية للعرض فقط. لا تُنفذ تعاقدًا فعليًا، وتحديث الصفحة يعيد الحالة الأصلية.</p>
        <p v-if="noticeMessage" role="status" aria-live="polite" class="rounded-xl bg-emerald-50 p-4 text-sm leading-7 text-emerald-800">{{ noticeMessage }}</p>
        <ServiceEngineerOffer v-for="offer in offers" :key="offer.id" :offer="offer" :accepted="acceptedOfferId === offer.id" :locked="!!acceptedOfferId" :confirming="pendingOffer?.id === offer.id" @accept="requestAcceptance(offer.id)" @cancel="cancelAcceptance" @confirm="confirmAcceptance" />
        <div v-if="!offers.length" class="rounded-2xl border border-dashed border-solar-border-card bg-white px-5 py-14 text-center"><Tags class="mx-auto size-10 text-solar-text-muted" aria-hidden="true" /><h3 class="mt-4 text-lg font-bold text-solar-text-heading">لا توجد عروض حتى الآن</h3><p class="mt-2 text-sm text-solar-text-muted">ستظهر عروض المهندسين هنا عند توفرها.</p></div>
      </section>
    </template>
    <section v-else class="rounded-2xl border border-dashed border-solar-border-card bg-white px-5 py-16 text-center"><h2 class="text-xl font-extrabold text-solar-text-heading">المشروع غير موجود</h2><p class="mt-3 text-sm text-solar-text-muted">تعذر العثور على مشروع بهذا المعرّف ضمن البيانات التجريبية.</p><NuxtLink to="/customer/services" class="mt-6 inline-flex rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark">العودة إلى طلبات الخدمات</NuxtLink></section>
  </div>
</template>
