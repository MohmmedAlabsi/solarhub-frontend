<script setup lang="ts">
import { BadgeCheck, ChevronDown, ChevronLeft, ChevronRight, Search, Users, X } from 'lucide-vue-next'
import EngineerCard from '../../../components/customer/engineers/EngineerCard.vue'

definePageMeta({ layout: 'customer' })
useSeoMeta({ title: 'دليل المهندسين المعتمدين | SolarHub', description: 'تواصل مع مهندسي ومستشاري الطاقة الشمسية المعتمدين.' })

const { searchDraft, filters, displayedEngineers, resultCount, currentPage, totalPages, cities, specialtyLabels, directoryQuery, noticeMessage, applySearch, resetFilters, setPage, requestConsultation } = useEngineers()
const pageNumbers = computed(() => currentPage.value <= 3 ? [1, 2, 3] : [currentPage.value - 1, currentPage.value, Math.min(currentPage.value + 1, totalPages)])
function openProfile(engineerId: number) { return navigateTo({ path: `/customer/engineers/${engineerId}`, query: directoryQuery.value }) }
</script>

<template>
  <div class="flex flex-col gap-7">
    <div class="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
      <span class="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-700"><BadgeCheck class="size-4" aria-hidden="true" /> تحقق وتأهيل معتمد 100%</span>
      <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل"><NuxtLink to="/customer/dashboard" class="hover:text-solar-text-heading">الرئيسية</NuxtLink><span>/</span><span class="font-bold text-solar-text-heading">دليل المهندسين المعتمدين</span></nav>
    </div>

    <header class="rounded-2xl border border-amber-100 bg-gradient-to-l from-white via-white to-amber-50 px-5 py-8 text-center shadow-sm sm:px-8">
      <h1 class="text-2xl font-black text-solar-text-heading md:text-3xl">دليل المهندسين والاستشاريين المعتمدين</h1>
      <p class="mx-auto mt-3 max-w-3xl text-sm leading-7 text-solar-text-muted">تواصل مع نخبة المهندسين المرخصين في تصميم أنظمة الطاقة الشمسية، دراسات الجدوى والأحمال، والفحص الميداني وفق الكود السعودي.</p>
    </header>

    <section class="rounded-2xl border border-solar-border-card bg-white p-4 shadow-sm sm:p-5" aria-label="البحث والتصفية">
      <form class="flex flex-col gap-3 sm:flex-row" role="search" @submit.prevent="applySearch">
        <label class="relative flex-1"><span class="sr-only">البحث عن مهندس</span><Search class="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-solar-text-muted" aria-hidden="true" /><input v-model="searchDraft" type="search" class="solar-input h-12 pr-12" placeholder="ابحث باسم المهندس، التخصص الهندسي، أو الكلمات المفتاحية (مثل: دراسات أحمال، مضخات، On-Grid)..." /></label>
        <button type="submit" class="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-solar-navy px-8 text-sm font-bold text-white hover:bg-solar-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow"><Search class="size-4" aria-hidden="true" /> بحث</button>
      </form>
      <div class="mt-5 grid gap-3 sm:grid-cols-3">
        <label class="relative"><span class="sr-only">التخصص الهندسي</span><select v-model="filters.specialty" class="solar-input h-11 appearance-none pl-9"><option value="all">التخصص الهندسي</option><option v-for="(label, key) in specialtyLabels" :key="key" :value="key">{{ label }}</option></select><ChevronDown class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted" aria-hidden="true" /></label>
        <label class="relative"><span class="sr-only">المحافظة أو المدينة</span><select v-model="filters.city" class="solar-input h-11 appearance-none pl-9"><option value="all">المحافظة / المدينة</option><option v-for="city in cities" :key="city" :value="city">{{ city }}</option></select><ChevronDown class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted" aria-hidden="true" /></label>
        <label class="relative"><span class="sr-only">الحد الأدنى للتقييم</span><select v-model.number="filters.minimumRating" class="solar-input h-11 appearance-none pl-9"><option :value="0">التقييم</option><option :value="5">5.0 نجوم</option><option :value="4.9">4.9 نجوم فأعلى</option><option :value="4.8">4.8 نجوم فأعلى</option></select><ChevronDown class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted" aria-hidden="true" /></label>
      </div>
    </section>

    <section aria-labelledby="results-heading">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-solar-text-muted">
        <p id="results-heading">عرض <strong class="text-solar-text-heading">{{ displayedEngineers.length }}</strong> من أصل <strong class="text-solar-text-heading">{{ resultCount }}</strong> مهندس معتمد</p>
        <p>الترتيب حسب: <strong class="text-solar-text-heading underline decoration-solar-yellow decoration-2 underline-offset-4">الأعلى تقييمًا</strong></p>
      </div>
      <div v-if="displayedEngineers.length" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <EngineerCard v-for="engineer in displayedEngineers" :key="engineer.id" :engineer="engineer" @consultation="requestConsultation" @profile="engineer => openProfile(engineer.id)" />
      </div>
      <div v-else class="rounded-2xl border border-dashed border-solar-border-card bg-white px-5 py-14 text-center">
        <Users class="mx-auto size-10 text-solar-text-muted" aria-hidden="true" /><h2 class="mt-4 text-lg font-bold text-solar-text-heading">لا توجد نتائج مطابقة</h2><p class="mt-2 text-sm text-solar-text-muted">جرّب تغيير عبارة البحث أو خيارات التصفية.</p><button type="button" class="mt-5 inline-flex items-center gap-2 rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark" @click="resetFilters"><X class="size-4" aria-hidden="true" /> مسح الفلاتر</button>
      </div>
    </section>

    <nav v-if="resultCount > 4" class="flex flex-wrap items-center justify-center gap-2" aria-label="صفحات دليل المهندسين">
      <button type="button" class="inline-flex h-10 items-center gap-1 rounded-lg border border-solar-border-card bg-white px-4 text-xs font-semibold disabled:opacity-50" :disabled="currentPage === 1" @click="setPage(currentPage - 1)"><ChevronRight class="size-4" aria-hidden="true" /> السابق</button>
      <button v-for="page in pageNumbers" :key="page" type="button" class="size-10 rounded-lg border text-xs font-bold" :class="page === currentPage ? 'border-solar-navy bg-solar-navy text-white' : 'border-solar-border-card bg-white text-solar-text-body'" :aria-current="page === currentPage ? 'page' : undefined" @click="setPage(page)">{{ page }}</button>
      <span v-if="currentPage < totalPages - 2" class="px-1 text-solar-text-muted">…</span>
      <button v-if="!pageNumbers.includes(totalPages)" type="button" class="size-10 rounded-lg border border-solar-border-card bg-white text-xs font-bold" @click="setPage(totalPages)">{{ totalPages }}</button>
      <button type="button" class="inline-flex h-10 items-center gap-1 rounded-lg border border-solar-border-card bg-white px-4 text-xs font-semibold disabled:opacity-50" :disabled="currentPage === totalPages" @click="setPage(currentPage + 1)">التالي <ChevronLeft class="size-4" aria-hidden="true" /></button>
    </nav>
    <p v-if="noticeMessage" class="fixed bottom-5 left-1/2 z-[70] w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-xl bg-solar-navy-dark px-5 py-3 text-center text-sm font-medium text-white shadow-xl" role="status" aria-live="polite">{{ noticeMessage }}</p>
  </div>
</template>