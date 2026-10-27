<script setup lang="ts">
import {
  BatteryCharging,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CornerUpLeft,
  Download,
  Eye,
  FileText,
  Loader2,
  Power,
  Search,
  SlidersHorizontal,
  SunMedium,
  Zap,
} from 'lucide-vue-next'
import QuoteDetailsModal from '~/components/supplier/quotes/QuoteDetailsModal.vue'
import QuoteRespondModal from '~/components/supplier/quotes/QuoteRespondModal.vue'
import type { SupplierQuoteItem, RespondQuoteInput } from '~/types/supplier-quote'

definePageMeta({
  layout: 'supplier',
})

useSeoMeta({
  title: 'طلبات عروض الأسعار | بوابة المتجر والمورد SolarHub',
  description: 'متابعة وإدارة طلبات عروض الأسعار الواردة من العملاء والرد عليها بتسعير مباشر.',
})

const {
  quotes,
  isLoading,
  isResponding,
  noticeMessage,
  searchQuery,
  selectedStatus,
  currentPage,
  totalPages,
  perPage,
  filteredQuotes,
  paginatedQuotes,
  changePage,
  respondToQuote,
  exportQuotes,
} = useSupplierQuotes()

const isDetailsOpen = ref(false)
const isRespondOpen = ref(false)
const selectedQuote = ref<SupplierQuoteItem | null>(null)

function openDetails(quote: SupplierQuoteItem) {
  selectedQuote.value = quote
  isDetailsOpen.value = true
}

function openRespondModal(quote: SupplierQuoteItem) {
  selectedQuote.value = quote
  isDetailsOpen.value = false
  isRespondOpen.value = true
}

async function handleRespondSubmit(data: RespondQuoteInput) {
  const success = await respondToQuote(data)
  if (success) {
    isRespondOpen.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- مسار التنقل -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/supplier/dashboard" class="hover:text-solar-text-heading transition-colors">
        الرئيسية
      </NuxtLink>
      <span>‹</span>
      <span class="font-bold text-solar-text-heading">طلبات عروض الأسعار</span>
    </nav>

    <!-- ترويسة الصفحة وزر التصدير -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <span class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-solar-navy-dark border border-amber-200/60 shadow-2xs">
          <FileText class="size-6 text-solar-navy-dark" />
        </span>
        <div>
          <h1 class="text-2xl font-black text-solar-text-heading md:text-3xl">
            طلبات عروض الأسعار
          </h1>
          <p class="mt-0.5 text-xs sm:text-sm text-solar-text-muted">
            متابعة وإدارة طلبات عروض الأسعار الواردة من العملاء والرد عليها بتسعير مباشر
          </p>
        </div>
      </div>

      <button
        type="button"
        @click="exportQuotes"
        class="inline-flex items-center justify-center gap-2 rounded-xl border border-solar-border-card bg-white dark:bg-solar-bg-card px-4 py-2.5 text-xs font-bold text-solar-text-heading hover:bg-solar-bg-subtle shadow-2xs transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
      >
        <Download class="size-4" />
        <span>تصدير البيانات</span>
      </button>
    </div>

    <!-- شريط البحث والفلترة -->
    <section class="solar-card p-3 sm:p-4" aria-label="أدوات البحث والفلترة">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        <!-- حقل البحث -->
        <div class="lg:col-span-8 relative flex items-center">
          <input
            v-model.trim="searchQuery"
            type="search"
            placeholder="ابحث برقم الطلب (مثلاً #RFQ-2025-3041) أو اسم المنتج..."
            class="solar-input h-11 w-full pr-10 pl-4 text-xs font-medium"
          />
          <Search class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
        </div>

        <!-- فلتر الحالة -->
        <div class="lg:col-span-4 relative flex items-center">
          <select
            v-model="selectedStatus"
            class="solar-input h-11 w-full appearance-none pr-9 pl-8 cursor-pointer text-xs font-semibold"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">بانتظار الرد</option>
            <option value="responded">تم الرد</option>
            <option value="accepted">مقبول</option>
            <option value="rejected">مرفوض</option>
            <option value="cancelled">ملغي</option>
          </select>
          <SlidersHorizontal class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
          <ChevronDown class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
        </div>
      </div>
    </section>

    <!-- جدول طلبات عروض الأسعار -->
    <section class="solar-card overflow-hidden" aria-labelledby="quotes-table-heading">
      <h2 id="quotes-table-heading" class="sr-only">قائمة طلبات عروض الأسعار</h2>

      <div class="overflow-x-auto">
        <table class="w-full text-right text-xs">
          <!-- الترويسة -->
          <thead class="bg-solar-bg-subtle text-solar-text-muted border-b border-solar-border-card text-[11px] font-bold">
            <tr>
              <th scope="col" class="py-4 px-4 min-w-[140px]">رقم الطلب</th>
              <th scope="col" class="py-4 px-4 min-w-[280px]">اسم المنتج والموديل</th>
              <th scope="col" class="py-4 px-4 text-center">الكمية المطلوبة</th>
              <th scope="col" class="py-4 px-4 text-center">تاريخ الطلب</th>
              <th scope="col" class="py-4 px-4 text-center">حالة الطلب</th>
              <th scope="col" class="py-4 px-4 text-center w-36">الإجراءات</th>
            </tr>
          </thead>

          <!-- محتوى الجدول -->
          <tbody class="divide-y divide-solar-border-card bg-white dark:bg-solar-bg-card">
            <!-- التحميل -->
            <tr v-if="isLoading">
              <td colspan="6" class="py-16 text-center text-solar-text-muted">
                <Loader2 class="size-8 animate-spin mx-auto text-solar-yellow mb-2" />
                <p class="font-bold text-solar-text-heading">جارٍ جلب طلبات عروض الأسعار...</p>
              </td>
            </tr>

            <!-- فارغ -->
            <tr v-else-if="filteredQuotes.length === 0">
              <td colspan="6" class="py-16 text-center text-solar-text-muted">
                <FileText class="size-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p class="font-bold text-solar-text-heading">لا توجد طلبات عروض أسعار مطابقة للبحث أو الفلتر المختار</p>
              </td>
            </tr>

            <!-- الصفوف -->
            <tr
              v-for="quote in paginatedQuotes"
              :key="quote.id"
              class="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
            >
              <!-- 1. رقم الطلب -->
              <td class="py-4 px-4">
                <div class="font-black font-mono text-xs text-solar-text-heading">
                  {{ quote.quoteRequestNumber }}
                </div>
              </td>

              <!-- 2. اسم المنتج والموديل مع الأيقونة -->
              <td class="py-4 px-4">
                <div class="flex items-center gap-2.5">
                  <span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-solar-bg-subtle text-solar-navy border border-solar-border-card">
                    <SunMedium v-if="quote.productTitle.includes('لوح') || quote.productTitle.includes('شمسي')" class="size-4 text-solar-yellow stroke-[2.5]" />
                    <Zap v-else-if="quote.productTitle.includes('إنفرتر')" class="size-4 text-amber-500" />
                    <BatteryCharging v-else-if="quote.productTitle.includes('بطارية')" class="size-4 text-emerald-500" />
                    <Power v-else class="size-4 text-solar-navy" />
                  </span>

                  <div>
                    <div class="font-extrabold text-sm text-solar-text-heading leading-tight line-clamp-1">
                      {{ quote.productTitle }}
                    </div>
                    <div class="mt-0.5 text-[10px] font-mono text-solar-text-muted">
                      كود: {{ quote.productCode }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- 3. الكمية المطلوبة -->
              <td class="py-4 px-4 text-center">
                <span class="inline-flex rounded-lg bg-solar-bg-subtle px-2.5 py-1 text-xs font-black text-solar-text-heading border border-solar-border-card">
                  {{ quote.requestedQuantity }} {{ quote.unitLabel }}
                </span>
              </td>

              <!-- 4. تاريخ الطلب -->
              <td class="py-4 px-4 text-center font-medium text-solar-text-muted">
                {{ quote.requestDate }}
              </td>

              <!-- 5. حالة الطلب -->
              <td class="py-4 px-4 text-center">
                <span
                  v-if="quote.status === 'pending'"
                  class="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700 border border-amber-200/80"
                >
                  بانتظار الرد
                </span>

                <span
                  v-else-if="quote.status === 'responded'"
                  class="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700 border border-blue-200/80"
                >
                  تم الرد
                </span>

                <span
                  v-else-if="quote.status === 'accepted'"
                  class="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200/80"
                >
                  مقبول
                </span>

                <span
                  v-else-if="quote.status === 'rejected'"
                  class="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-700 border border-rose-200/80"
                >
                  مرفوض
                </span>

                <span
                  v-else
                  class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600 border border-slate-200"
                >
                  ملغي
                </span>
              </td>

              <!-- 6. الإجراءات -->
              <td class="py-4 px-4 text-center">
                <!-- زر الرد المباشر إذا كان بانتظار الرد -->
                <button
                  v-if="quote.status === 'pending'"
                  type="button"
                  @click="openRespondModal(quote)"
                  class="inline-flex items-center justify-center gap-1.5 rounded-xl bg-solar-yellow px-4 py-2 text-xs font-black text-solar-navy-dark hover:bg-solar-yellow-hover transition-all active:scale-95 shadow-sm cursor-pointer w-full"
                >
                  <span>الرد على الطلب</span>
                  <CornerUpLeft class="size-3.5 stroke-[2.5]" />
                </button>

                <!-- زر عرض التفاصيل إذا تمت معالجته -->
                <button
                  v-else
                  type="button"
                  @click="openDetails(quote)"
                  class="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 text-white px-4 py-2 text-xs font-bold hover:bg-slate-700 transition-all active:scale-95 shadow-2xs cursor-pointer w-full"
                >
                  <Eye class="size-3.5" />
                  <span>عرض التفاصيل</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- تذييل الجدول والترقيم -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-solar-border-card text-xs text-solar-text-muted bg-white dark:bg-solar-bg-card">
        <div>
          عرض <span class="font-bold text-solar-text-heading">{{ paginatedQuotes.length ? (currentPage - 1) * perPage + 1 : 0 }} إلى {{ Math.min(currentPage * perPage, filteredQuotes.length) }}</span> من إجمالي
          <span class="font-bold text-solar-text-heading">{{ filteredQuotes.length }}</span> طلب تسعير
        </div>

        <div class="flex items-center gap-1.5">
          <button
            type="button"
            @click="changePage(currentPage - 1)"
            :disabled="currentPage <= 1"
            class="flex items-center gap-1 rounded-xl border border-solar-border-card px-3 py-1.5 text-xs font-bold text-solar-text-body transition-colors hover:bg-solar-bg-subtle disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight class="size-3.5" />
            <span>السابق</span>
          </button>

          <div class="flex items-center gap-1">
            <button
              v-for="page in totalPages"
              :key="page"
              type="button"
              @click="changePage(page)"
              class="size-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
              :class="currentPage === page ? 'bg-solar-navy-dark text-white shadow-xs' : 'text-solar-text-muted hover:bg-solar-bg-subtle'"
            >
              {{ page }}
            </button>
          </div>

          <button
            type="button"
            @click="changePage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="flex items-center gap-1 rounded-xl border border-solar-border-card px-3 py-1.5 text-xs font-bold text-solar-text-body transition-colors hover:bg-solar-bg-subtle disabled:opacity-40 cursor-pointer"
          >
            <span>التالي</span>
            <ChevronLeft class="size-3.5" />
          </button>
        </div>
      </div>
    </section>

    <!-- النوافذ المنبثقة -->
    <QuoteDetailsModal
      :is-open="isDetailsOpen"
      :quote="selectedQuote"
      @close="isDetailsOpen = false"
      @respond="openRespondModal"
    />

    <QuoteRespondModal
      :is-open="isRespondOpen"
      :quote="selectedQuote"
      :is-submitting="isResponding"
      @close="isRespondOpen = false"
      @submit="handleRespondSubmit"
    />

    <!-- إشعار العملية -->
    <p
      v-if="noticeMessage"
      class="fixed bottom-5 left-1/2 z-[110] w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-xl bg-solar-navy-dark px-5 py-3 text-center text-xs sm:text-sm font-bold text-white shadow-2xl border border-white/10"
      role="status"
      aria-live="polite"
    >
      {{ noticeMessage }}
    </p>
  </div>
</template>
