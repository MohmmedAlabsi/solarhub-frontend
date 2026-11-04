<script setup lang="ts">
import { ChevronLeft, ChevronRight, Loader2, MessageSquare, Star } from 'lucide-vue-next'
import { useEngineerReviews } from '~~/app/composables/useEngineerReviews'

definePageMeta({ layout: 'engineer' })
useSeoMeta({
  title: 'تقييمات المهندس | SolarHub - بوابة المهندسين',
  description: 'آراء وتقييمات العملاء المعتمدة للأعمال والخدمات الهندسية.',
})

const {
  reviews,
  isLoading,
  error,
  currentPage,
  totalReviews,
  totalPages,
  pageSize,
  setPage,
} = useEngineerReviews()

const startIndex = computed(() => (currentPage.value - 1) * pageSize + 1)
const endIndex = computed(() => Math.min(currentPage.value * pageSize, totalReviews.value))
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- رأس الصفحة -->
    <header class="flex flex-col gap-1 text-right">
      <h1 class="text-2xl font-black text-solar-text-heading md:text-3xl">
        تقييمات المهندس
      </h1>
      <p class="text-xs sm:text-sm text-solar-text-secondary">
        آراء وتقييمات العملاء المعتمدة للأعمال والخدمات الهندسية
      </p>
    </header>

    <!-- حالة التحميل -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 text-solar-text-muted">
      <Loader2 class="size-8 animate-spin text-solar-navy mb-3" />
      <span class="text-sm font-semibold">جاري تحميل التقييمات...</span>
    </div>

    <!-- حالة الخطأ -->
    <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
      {{ error }}
    </div>

    <!-- حالة عدم وجود تقييمات -->
    <div
      v-else-if="totalReviews === 0"
      class="rounded-2xl border border-dashed border-solar-border-card bg-white p-12 text-center shadow-card"
    >
      <div class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-solar-bg-subtle text-solar-text-muted mb-4">
        <MessageSquare class="size-7" />
      </div>
      <h3 class="text-base font-bold text-solar-text-heading">لا توجد تقييمات مسجلة حتى الآن</h3>
      <p class="mt-1.5 text-xs text-solar-text-muted max-w-md mx-auto leading-relaxed">
        ستظهر تقييمات وآراء العملاء المعتمدة هنا فور اكتمال مشاريعك واستشاراتك الهندسية بنجاح على منصة SolarHub.
      </p>
    </div>

    <!-- قائمة التقييمات الفعلية -->
    <div v-else class="space-y-4">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="rounded-2xl border border-solar-border-card bg-white p-5 sm:p-6 shadow-card transition-all hover:border-solar-yellow/50"
      >
        <div class="flex items-start justify-between gap-4">
          <!-- النجوم حسب التقييم الفعلي -->
          <div class="flex items-center gap-1 text-solar-yellow">
            <Star
              v-for="i in 5"
              :key="i"
              class="size-4"
              :class="i <= review.rating ? 'fill-solar-yellow text-solar-yellow' : 'fill-gray-200 text-gray-200'"
            />
          </div>

          <!-- تفاصيل العميل والرمز الدائري -->
          <div class="flex items-center gap-3 text-right">
            <div>
              <h3 class="text-sm font-bold text-solar-text-heading">
                {{ review.client_name }}
              </h3>
              <span class="text-[11px] text-solar-text-muted">
                {{ review.date }}
              </span>
            </div>
            <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-solar-bg-subtle text-xs font-bold text-solar-navy-dark">
              {{ review.client_initials }}
            </div>
          </div>
        </div>

        <!-- نص التعليق -->
        <p class="mt-4 text-xs sm:text-sm leading-relaxed text-solar-text-body text-right">
          {{ review.comment }}
        </p>
      </div>
    </div>

    <!-- الترقيم والتنقل (Pagination) -->
    <div
      v-if="!isLoading && totalReviews > 0"
      class="mt-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-solar-border-card/60 pt-4 text-xs text-solar-text-muted"
    >
      <!-- أزرار الصفحات -->
      <div class="flex items-center justify-center gap-1.5 self-center sm:self-auto">
        <button
          type="button"
          class="flex items-center gap-1 rounded-lg border border-solar-border-card px-2.5 py-1.5 text-xs font-semibold text-solar-text-body hover:border-solar-navy disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          :disabled="currentPage === 1"
          @click="setPage(currentPage - 1)"
        >
          <ChevronRight class="size-3.5" />
          <span>السابق</span>
        </button>

        <button
          v-for="page in totalPages"
          :key="page"
          type="button"
          class="size-8 rounded-lg border text-xs font-bold transition-colors"
          :class="currentPage === page ? 'border-solar-navy-dark bg-solar-navy-dark text-white' : 'border-solar-border-card text-solar-text-body hover:border-solar-navy'"
          @click="setPage(page)"
        >
          {{ page }}
        </button>

        <button
          type="button"
          class="flex items-center gap-1 rounded-lg border border-solar-border-card px-2.5 py-1.5 text-xs font-semibold text-solar-text-body hover:border-solar-navy disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          :disabled="currentPage === totalPages"
          @click="setPage(currentPage + 1)"
        >
          <span>التالي</span>
          <ChevronLeft class="size-3.5" />
        </button>
      </div>

      <!-- نص الإجمالي -->
      <span class="text-center sm:text-right">
        عرض {{ startIndex }}-{{ endIndex }} من إجمالي {{ totalReviews }} تقييم معتمد
      </span>
    </div>
  </div>
</template>
