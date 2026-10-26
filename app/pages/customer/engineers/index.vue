<script setup lang="ts">
import {
  BadgeCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  RefreshCw,
  Search,
  Users,
  X,
} from 'lucide-vue-next'

import type { RouteLocationRaw } from 'vue-router'

import EngineerCard from '../../../components/customer/engineers/EngineerCard.vue'
import { useEngineerDirectory } from '~/composables/useEngineerDirectory'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'دليل المهندسين المعتمدين | SolarHub',
  description:
    'تواصل مع مهندسي ومستشاري الطاقة الشمسية المعتمدين.',
})

const route = useRoute()

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
  loading,
  error,
  loadEngineers,
  applySearch,
  resetFilters,
  setPage,
  requestConsultation,
} = useEngineerDirectory()

const hasFilters = computed(() => {
  return Boolean(
    filters.query ||
      filters.specialty !== 'all' ||
      filters.city !== 'all' ||
      filters.minimumRating > 0,
  )
})

const pageNumbers = computed(() => {
  const count = Math.min(5, totalPages.value)

  const firstPage = Math.max(
    1,
    Math.min(
      currentPage.value - 2,
      totalPages.value - count + 1,
    ),
  )

  return Array.from(
    { length: count },
    (_, index) => firstPage + index,
  )
})

function engineerProfileLocation(
  engineerId: number,
): RouteLocationRaw {
  const query = { ...route.query }

  for (const key of [
    'q',
    'specialty',
    'city',
    'rating',
    'tab',
  ]) {
    delete query[key]
  }

  return {
    path: `/customer/engineers/${engineerId}`,
    query: {
      ...query,
      ...directoryQuery.value,
    },
  }
}
</script>

<template>
  <div class="flex min-w-0 flex-col gap-7">
    <div
      class="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <span
        class="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-700"
      >
        <BadgeCheck class="size-4" aria-hidden="true" />
        مهندسون معتمدون لدى المنصة
      </span>

      <nav
        class="flex flex-wrap items-center gap-2 text-xs text-solar-text-muted"
        aria-label="مسار التنقل"
      >
        <NuxtLink
          to="/customer/dashboard"
          class="hover:text-solar-text-heading"
        >
          الرئيسية
        </NuxtLink>

        <span aria-hidden="true">/</span>

        <span class="font-bold text-solar-text-heading">
          دليل المهندسين المعتمدين
        </span>
      </nav>
    </div>

    <header
      class="rounded-2xl border border-amber-100 bg-gradient-to-l from-white via-white to-amber-50 px-5 py-8 text-center shadow-sm sm:px-8"
    >
      <h1
        class="text-2xl font-black text-solar-text-heading md:text-3xl"
      >
        دليل المهندسين والاستشاريين المعتمدين
      </h1>

      <p
        class="mx-auto mt-3 max-w-3xl text-sm leading-7 text-solar-text-muted"
      >
        ابحث عن مهندس متخصص في الطاقة الشمسية، واطّلع على
        ملفه المهني، وابدأ طلب الخدمة المناسبة لمشروعك.
      </p>
    </header>

    <!-- البحث والتصفية -->
    <section
      class="solar-card p-4 sm:p-5"
      aria-label="البحث والتصفية"
    >
      <form role="search" @submit.prevent="applySearch">
        <fieldset
          :disabled="loading"
          class="min-w-0 disabled:opacity-60"
        >
          <legend class="sr-only">
            خيارات البحث عن المهندسين
          </legend>

          <div class="flex flex-col gap-3 sm:flex-row">
            <label class="relative min-w-0 flex-1">
              <span class="sr-only">
                البحث عن مهندس
              </span>

              <Search
                class="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-solar-text-muted"
                aria-hidden="true"
              />

              <input
                v-model="searchDraft"
                type="search"
                class="solar-input h-12 pr-12"
                placeholder="ابحث باسم المهندس أو التخصص أو المحافظة..."
              />
            </label>

            <button
              type="submit"
              class="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-solar-navy px-8 text-sm font-bold text-white hover:bg-solar-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow"
            >
              <Search class="size-4" aria-hidden="true" />
              بحث
            </button>
          </div>

          <div class="mt-5 grid gap-3 sm:grid-cols-3">
            <label class="relative">
              <span class="sr-only">
                التخصص الهندسي
              </span>

              <select
                v-model="filters.specialty"
                class="solar-input h-11 appearance-none pl-9"
              >
                <option value="all">
                  جميع التخصصات
                </option>

                <option
                  v-for="(label, key) in specialtyLabels"
                  :key="key"
                  :value="key"
                >
                  {{ label }}
                </option>
              </select>

              <ChevronDown
                class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted"
                aria-hidden="true"
              />
            </label>

            <label class="relative">
              <span class="sr-only">
                المحافظة
              </span>

              <select
                v-model="filters.city"
                class="solar-input h-11 appearance-none pl-9"
              >
                <option value="all">
                  جميع المحافظات
                </option>

                <option
                  v-for="city in cities"
                  :key="city"
                  :value="city"
                >
                  {{ city }}
                </option>
              </select>

              <ChevronDown
                class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted"
                aria-hidden="true"
              />
            </label>

            <label class="relative">
              <span class="sr-only">
                الحد الأدنى للتقييم
              </span>

              <select
                v-model.number="filters.minimumRating"
                class="solar-input h-11 appearance-none pl-9"
              >
                <option :value="0">
                  جميع التقييمات
                </option>

                <option :value="5">
                  5 نجوم
                </option>

                <option :value="4.5">
                  4.5 نجوم فأعلى
                </option>

                <option :value="4">
                  4 نجوم فأعلى
                </option>

                <option :value="3">
                  3 نجوم فأعلى
                </option>
              </select>

              <ChevronDown
                class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted"
                aria-hidden="true"
              />
            </label>
          </div>

          <button
            v-if="hasFilters"
            type="button"
            class="mt-4 inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-solar-text-muted hover:text-solar-text-heading focus-visible:ring-2 focus-visible:ring-solar-yellow"
            @click="resetFilters"
          >
            <X class="size-4" aria-hidden="true" />
            مسح الفلاتر
          </button>
        </fieldset>
      </form>
    </section>

    <!-- حالة التحميل -->
    <section
      v-if="loading"
      class="solar-card px-5 py-14 text-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <LoaderCircle
        class="mx-auto size-8 animate-spin text-solar-navy"
        aria-hidden="true"
      />

      <p class="mt-4 text-sm text-solar-text-muted">
        جارٍ تحميل دليل المهندسين...
      </p>
    </section>

    <!-- تعذر تحميل البيانات -->
    <section
      v-else-if="error"
      class="rounded-2xl border border-red-200 bg-red-50 px-5 py-10 text-center"
      role="alert"
    >
      <h2 class="text-lg font-bold text-red-800">
        تعذر تحميل الدليل
      </h2>

      <p class="mt-3 text-sm leading-7 text-red-700">
        {{ error }}
      </p>

      <button
        type="button"
        class="mt-5 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 hover:bg-red-100 focus-visible:ring-2 focus-visible:ring-red-400"
        @click="loadEngineers"
      >
        <RefreshCw class="size-4" aria-hidden="true" />
        إعادة المحاولة
      </button>
    </section>

    <!-- النتائج -->
    <template v-else>
      <section aria-labelledby="results-heading">
        <div
          class="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-solar-text-muted"
        >
          <p id="results-heading" aria-live="polite">
            عرض
            <strong class="text-solar-text-heading">
              {{ displayedEngineers.length }}
            </strong>
            من أصل
            <strong class="text-solar-text-heading">
              {{ resultCount }}
            </strong>
            مهندس
          </p>

          <p>
            الترتيب حسب:
            <strong class="text-solar-text-heading">
              الأعلى تقييمًا
            </strong>
          </p>
        </div>

        <div
          v-if="displayedEngineers.length"
          class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
        >
          <EngineerCard
            v-for="engineer in displayedEngineers"
            :key="engineer.id"
            :engineer="engineer"
            :profile-to="engineerProfileLocation(engineer.id)"
            @consultation="requestConsultation"
          />
        </div>

        <div
          v-else
          class="rounded-2xl border border-dashed border-solar-border-card bg-white px-5 py-14 text-center"
        >
          <Users
            class="mx-auto size-10 text-solar-text-muted"
            aria-hidden="true"
          />

          <h2
            class="mt-4 text-lg font-bold text-solar-text-heading"
          >
            {{
              hasFilters
                ? 'لا توجد نتائج مطابقة'
                : 'لا يوجد مهندسون متاحون حاليًا'
            }}
          </h2>

          <p class="mt-2 text-sm leading-7 text-solar-text-muted">
            {{
              hasFilters
                ? 'جرّب تغيير عبارة البحث أو خيارات التصفية.'
                : 'سيظهر المهندسون هنا بعد اعتماد حساباتهم في المنصة.'
            }}
          </p>

          <button
            v-if="hasFilters"
            type="button"
            class="mt-5 inline-flex items-center gap-2 rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark focus-visible:ring-2 focus-visible:ring-solar-navy"
            @click="resetFilters"
          >
            <X class="size-4" aria-hidden="true" />
            مسح الفلاتر
          </button>
        </div>
      </section>

      <!-- ترقيم الصفحات -->
      <nav
        v-if="totalPages > 1"
        class="flex flex-wrap items-center justify-center gap-2"
        aria-label="صفحات دليل المهندسين"
      >
        <button
          type="button"
          :disabled="currentPage === 1"
          class="inline-flex h-10 items-center gap-1 rounded-lg border border-solar-border-card bg-white px-4 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          @click="setPage(currentPage - 1)"
        >
          <ChevronRight class="size-4" aria-hidden="true" />
          السابق
        </button>

        <button
          v-for="page in pageNumbers"
          :key="page"
          type="button"
          class="size-10 rounded-lg border text-xs font-bold focus-visible:ring-2 focus-visible:ring-solar-yellow"
          :class="
            page === currentPage
              ? 'border-solar-navy bg-solar-navy text-white'
              : 'border-solar-border-card bg-white text-solar-text-body'
          "
          :aria-current="
            page === currentPage ? 'page' : undefined
          "
          :aria-label="`الصفحة ${page}`"
          @click="setPage(page)"
        >
          {{ page }}
        </button>

        <button
          type="button"
          :disabled="currentPage === totalPages"
          class="inline-flex h-10 items-center gap-1 rounded-lg border border-solar-border-card bg-white px-4 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          @click="setPage(currentPage + 1)"
        >
          التالي
          <ChevronLeft class="size-4" aria-hidden="true" />
        </button>
      </nav>

      <p
        v-if="totalPages > 1"
        class="text-center text-xs text-solar-text-muted"
      >
        الصفحة {{ currentPage }} من {{ totalPages }}
      </p>
    </template>
  </div>
</template>