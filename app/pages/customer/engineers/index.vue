<script setup lang="ts">
import {
  BadgeCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
  Users,
  X,
} from 'lucide-vue-next'
import EngineerCard from '../../../components/customer/engineers/EngineerCard.vue'
import type { RouteLocationRaw } from 'vue-router'
import { useEngineers } from '~~/app/composables/useEngineers'

definePageMeta({ layout: 'customer' })
useSeoMeta({
  title: 'دليل المهندسين المعتمدين | SolarHub',
  description: 'تواصل مع نخبة مهندسي ومستشاري الطاقة الشمسية المعتمدين في اليمن.',
})

const {
  searchDraft,
  filters,
  displayedEngineers,
  resultCount,
  currentPage,
  totalPages,
  cities,
  specialtyLabels,
  directoryQuery,
  noticeMessage,
  isLoading,
  error,
  fetchEngineers,
  applySearch,
  resetFilters,
  setPage,
  requestConsultation,
} = useEngineers()

const route = useRoute()

const pageNumbers = computed(() => {
  const total = typeof totalPages === 'object' ? totalPages.value : totalPages
  if (total <= 3) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  if (currentPage.value <= 2) {
    return [1, 2, 3]
  }
  return [currentPage.value - 1, currentPage.value, Math.min(currentPage.value + 1, total)]
})

function engineerProfileLocation(engineerId: number): RouteLocationRaw {
  const query = { ...route.query }
  for (const key of ['q', 'specialty', 'city', 'rating', 'tab']) delete query[key]
  return { path: `/customer/engineers/${engineerId}`, query: { ...query, ...directoryQuery.value } }
}
</script>

<template>
  <div class="flex flex-col gap-7">
    <!-- شريط التحقق ومسار التنقل -->
    <div class="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
      <span class="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-800">
        <BadgeCheck class="size-4" aria-hidden="true" />
        <span>مهندسون مرخصون ومعتمدون 100%</span>
      </span>
      <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
        <NuxtLink to="/customer/dashboard" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
        <span>/</span>
        <span class="font-bold text-solar-text-heading">دليل المهندسين المعتمدين</span>
      </nav>
    </div>

    <!-- رأس الصفحة -->
    <header class="rounded-2xl border border-amber-100 bg-gradient-to-l from-white via-white to-amber-50 px-5 py-8 text-center shadow-xs sm:px-8">
      <h1 class="text-2xl font-black text-solar-text-heading md:text-3xl">دليل المهندسين والاستشاريين المعتمدين</h1>
      <p class="mx-auto mt-2 max-w-3xl text-xs sm:text-sm leading-relaxed text-solar-text-muted">
        تواصل مع نخبة المهندسين المرخصين في تصميم أنظمة الطاقة الشمسية، دراسات الجدوى والأحمال، والفحص الميداني لمشروعك.
      </p>
    </header>

    <!-- شريط البحث والتصفية المباشرة -->
    <section class="solar-card p-4 sm:p-5" aria-label="البحث والتصفية">
      <form class="flex flex-col gap-3 sm:flex-row" role="search" @submit.prevent="applySearch">
        <label class="relative flex-1">
          <span class="sr-only">البحث عن مهندس</span>
          <Search class="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-solar-text-muted" aria-hidden="true" />
          <input
            v-model="searchDraft"
            type="search"
            class="solar-input h-12 pr-12 text-xs sm:text-sm"
            placeholder="ابحث باسم المهندس، التخصص الهندسي، أو الكلمات المفتاحية (مثل: دراسات أحمال، مضخات، بطاريات)..."
          />
        </label>
        <button
          type="submit"
          class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-solar-navy px-8 text-xs font-bold text-white hover:bg-solar-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow transition-all cursor-pointer"
        >
          <Search class="size-4" aria-hidden="true" />
          <span>بحث</span>
        </button>
      </form>

      <div class="mt-4 grid gap-3 sm:grid-cols-3">
        <!-- التخصص -->
        <div class="relative">
          <select v-model="filters.specialty" class="solar-input h-11 w-full appearance-none pr-3.5 pl-9 text-xs cursor-pointer bg-white">
            <option value="all">كافة التخصصات الهندسية</option>
            <option v-for="(label, key) in specialtyLabels" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
          <ChevronDown class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted" aria-hidden="true" />
        </div>

        <!-- المحافظة -->
        <div class="relative">
          <select v-model="filters.city" class="solar-input h-11 w-full appearance-none pr-3.5 pl-9 text-xs cursor-pointer bg-white">
            <option value="all">كافة المحافظات والمناطق</option>
            <option v-for="city in cities" :key="city" :value="city">
              {{ city }}
            </option>
          </select>
          <ChevronDown class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted" aria-hidden="true" />
        </div>

        <!-- التقييم -->
        <div class="relative">
          <select v-model.number="filters.minimumRating" class="solar-input h-11 w-full appearance-none pr-3.5 pl-9 text-xs cursor-pointer bg-white">
            <option :value="0">جميع التقييمات</option>
            <option :value="5">5.0 نجوم (ممتاز)</option>
            <option :value="4.5">4.5 نجوم فأعلى</option>
            <option :value="4.0">4.0 نجوم فأعلى</option>
          </select>
          <ChevronDown class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted" aria-hidden="true" />
        </div>
      </div>
    </section>

    <!-- نتائج البحث والمهندسون -->
    <section aria-labelledby="results-heading">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-solar-text-muted">
        <p id="results-heading">
          عرض <strong class="text-solar-text-heading">{{ displayedEngineers.length }}</strong> من أصل <strong class="text-solar-text-heading">{{ resultCount }}</strong> مهندس معتمد
        </p>

        <button
          type="button"
          @click="fetchEngineers"
          :disabled="isLoading"
          class="flex items-center gap-1.5 text-xs text-solar-text-muted hover:text-solar-text-heading transition-colors cursor-pointer"
        >
          <RefreshCw class="size-3.5" :class="{ 'animate-spin': isLoading }" />
          <span>تحديث القائمة</span>
        </button>
      </div>

      <!-- حالة التحميل -->
      <div v-if="isLoading && displayedEngineers.length === 0" class="flex flex-col items-center justify-center rounded-2xl border border-solar-border-card bg-white p-12 text-center shadow-xs">
        <Loader2 class="size-8 animate-spin text-amber-500 mb-3" />
        <p class="text-xs font-semibold text-solar-text-muted">جارٍ تحميل دليل المهندسين المعتمدين...</p>
      </div>

      <!-- شبكة بطاقات المهندسين -->
      <div v-else-if="displayedEngineers.length > 0" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <EngineerCard
          v-for="engineer in displayedEngineers"
          :key="engineer.id"
          :engineer="engineer"
          :profile-to="engineerProfileLocation(engineer.id)"
          @consultation="requestConsultation"
        />
      </div>

      <!-- حالة عدم وجود نتائج -->
      <div v-else class="rounded-2xl border border-dashed border-solar-border-card bg-white px-5 py-14 text-center">
        <Users class="mx-auto size-10 text-solar-text-muted" aria-hidden="true" />
        <h2 class="mt-4 text-base font-bold text-solar-text-heading">لا توجد نتائج مطابقة لبحثك</h2>
        <p class="mt-1 text-xs text-solar-text-muted">جرّب تغيير كلمات البحث أو تخفيف خيارات التصفية.</p>
        <button
          type="button"
          class="mt-4 inline-flex items-center gap-2 rounded-xl bg-solar-yellow px-5 py-2.5 text-xs font-bold text-solar-navy-dark hover:bg-solar-yellow/90 transition-all cursor-pointer shadow-xs"
          @click="resetFilters"
        >
          <X class="size-4" aria-hidden="true" />
          <span>مسح الفلاتر والبحث</span>
        </button>
      </div>
    </section>

    <!-- شريط الصفحات (Pagination) -->
    <nav v-if="totalPages > 1" class="flex flex-wrap items-center justify-center gap-2" aria-label="صفحات دليل المهندسين">
      <button
        type="button"
        class="inline-flex h-9 items-center gap-1 rounded-xl border border-solar-border-card bg-white px-3 text-xs font-semibold disabled:opacity-50 cursor-pointer"
        :disabled="currentPage === 1"
        @click="setPage(currentPage - 1)"
      >
        <ChevronRight class="size-4" aria-hidden="true" />
        <span>السابق</span>
      </button>

      <button
        v-for="page in pageNumbers"
        :key="page"
        type="button"
        class="size-9 rounded-xl border text-xs font-bold cursor-pointer transition-all"
        :class="page === currentPage ? 'border-solar-navy bg-solar-navy text-white shadow-xs' : 'border-solar-border-card bg-white text-solar-text-body hover:bg-solar-bg-subtle'"
        :aria-current="page === currentPage ? 'page' : undefined"
        @click="setPage(page)"
      >
        {{ page }}
      </button>

      <button
        type="button"
        class="inline-flex h-9 items-center gap-1 rounded-xl border border-solar-border-card bg-white px-3 text-xs font-semibold disabled:opacity-50 cursor-pointer"
        :disabled="currentPage === totalPages"
        @click="setPage(currentPage + 1)"
      >
        <span>التالي</span>
        <ChevronLeft class="size-4" aria-hidden="true" />
      </button>
    </nav>

    <!-- رسالة إشعار مؤقتة إن وجدت -->
    <p
      v-if="noticeMessage"
      class="fixed bottom-5 left-1/2 z-[70] w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-2xl bg-solar-navy-dark px-5 py-3 text-center text-xs font-bold text-white shadow-2xl border border-white/10"
      role="status"
      aria-live="polite"
    >
      {{ noticeMessage }}
    </p>
  </div>
</template>
