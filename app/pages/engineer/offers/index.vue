<script setup lang="ts">
import { Download, Search } from 'lucide-vue-next'
import OfferDetailModal from '../../../components/engineer/offers/OfferDetailModal.vue'
import OfferRow from '../../../components/engineer/offers/OfferRow.vue'
import type { EngineerOffer } from '~~/app/composables/useEngineerOffers'

definePageMeta({ layout: 'engineer' })
useSeoMeta({
  title: 'عروضي | SolarHub - بوابة المهندسين',
  description: 'متابعة العروض الهندسية الفنية والمالية المقدمة على طلبات الخدمات وحالات اعتمادها.',
})

const {
  search,
  statusFilter,
  paginated,
  currentPage,
  totalPages,
  total,
  pageSize,
  setPage,
  statusLabels,
  statusClasses,
} = useEngineerOffers()

// حالة المودال
const selectedOffer = ref<EngineerOffer | null>(null)
const showDetailModal = ref(false)

function openDetail(offer: EngineerOffer) {
  selectedOffer.value = offer
  showDetailModal.value = true
}

const startIndex = computed(() => (currentPage.value - 1) * pageSize + 1)
const endIndex = computed(() => Math.min(currentPage.value * pageSize, total.value))

const filterOptions = [
  { value: 'all',             label: 'جميع الحالات' },
  { value: 'pending_review',  label: 'قيد المراجعة' },
  { value: 'approved',        label: 'مقبول' },
  { value: 'rejected',        label: 'مرفوض' },
] as const
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- رأس الصفحة -->
    <header class="flex flex-col gap-1 text-right">
      <h1 class="text-2xl font-black text-solar-text-heading md:text-3xl">عروضي</h1>
      <p class="text-sm text-solar-text-secondary">
        متابعة العروض الهندسية الفنية والمالية المقدمة على طلبات الخدمات وحالات اعتمادها.
      </p>
    </header>

    <!-- شريط الأدوات -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- البحث -->
      <div class="relative flex-1 min-w-[200px] max-w-sm">
        <Search class="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" aria-hidden="true" />
        <input
          v-model="search"
          type="search"
          placeholder="ابحث برقم العرض أو طلب الخدمة..."
          class="w-full rounded-lg border border-solar-border-input bg-white py-2 pr-9 pl-3 text-sm text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-colors"
        />
      </div>

      <!-- فلتر الحالة -->
      <div class="relative">
        <select
          v-model="statusFilter"
          class="appearance-none rounded-lg border border-solar-border-input bg-white py-2 pr-3 pl-8 text-sm text-solar-text-heading focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-colors cursor-pointer"
          aria-label="فلترة حسب حالة العرض"
        >
          <option v-for="opt in filterOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <svg class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
        </svg>
      </div>

      <!-- زر التصدير -->
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg bg-solar-navy-dark px-4 py-2 text-sm font-semibold text-white hover:bg-solar-navy transition-colors"
      >
        <Download class="size-4" aria-hidden="true" />
        تصدير البيانات
      </button>
    </div>

    <!-- الجدول -->
    <div class="overflow-x-auto rounded-xl border border-solar-border-card bg-white shadow-card">
      <table class="w-full min-w-[760px] text-right" aria-label="جدول العروض الهندسية المقدمة">
        <thead>
          <tr class="border-b border-solar-border-card bg-solar-bg-subtle text-xs font-bold text-solar-text-muted">
            <th scope="col" class="py-3.5 px-4 text-right">رقم العرض</th>
            <th scope="col" class="py-3.5 px-4 text-right">طلب الخدمة المرتبط بالعرض</th>
            <th scope="col" class="py-3.5 px-4 text-center">التكلفة المقترحة</th>
            <th scope="col" class="py-3.5 px-4 text-center">مدة التنفيذ</th>
            <th scope="col" class="py-3.5 px-4 text-center">حالة العرض</th>
            <th scope="col" class="py-3.5 px-4 text-center">تاريخ تقديم العرض</th>
            <th scope="col" class="py-3.5 px-4 text-right">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <OfferRow
            v-for="offer in paginated"
            :key="offer.id"
            :offer="offer"
            :status-labels="statusLabels"
            :status-classes="statusClasses"
            @view="openDetail"
          />
          <!-- حالة فارغة -->
          <tr v-if="paginated.length === 0">
            <td colspan="7" class="py-16 text-center text-sm text-solar-text-muted">
              لا توجد عروض تطابق بحثك الحالي.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="total > 0" class="flex items-center justify-between gap-4 text-sm">
      <p class="text-xs text-solar-text-muted">
        عرض {{ startIndex }} إلى {{ endIndex }} من إجمالي {{ total }} عروض مقدمة
      </p>
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          @click="setPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="flex size-8 items-center justify-center rounded-lg border border-solar-border-card text-solar-text-body hover:border-solar-yellow hover:text-solar-navy-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="الصفحة السابقة"
        >
          <svg class="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
          </svg>
        </button>

        <button
          v-for="page in totalPages"
          :key="page"
          type="button"
          @click="setPage(page)"
          class="flex size-8 items-center justify-center rounded-lg border text-xs font-bold transition-colors"
          :class="page === currentPage
            ? 'border-solar-navy-dark bg-solar-navy-dark text-white'
            : 'border-solar-border-card text-solar-text-body hover:border-solar-yellow hover:text-solar-navy-dark'"
          :aria-current="page === currentPage ? 'page' : undefined"
        >
          {{ page }}
        </button>

        <button
          type="button"
          @click="setPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="flex size-8 items-center justify-center rounded-lg border border-solar-border-card text-solar-text-body hover:border-solar-yellow hover:text-solar-navy-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="الصفحة التالية"
        >
          <svg class="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <!-- مودال تفاصيل العرض -->
    <OfferDetailModal v-model="showDetailModal" :offer="selectedOffer" />
  </div>
</template>
