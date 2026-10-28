<script setup lang="ts">
import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CornerUpLeft,
  Download,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  SlidersHorizontal,
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
  errorMessage,
  noticeMessage,
  searchQuery,
  selectedStatus,
  currentPage,
  totalPages,
  perPage,
  filteredQuotes,
  paginatedQuotes,
  fetchQuotes,
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

    <!-- ترويسة الصفحة وزر التصدير والتحديث -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <span class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-solar-navy-dark dark:text-solar-yellow border border-amber-200/60 shadow-2xs">
          <FileText class="size-6 text-solar-navy-dark dark:text-solar-yellow" />
        </span>
        <div>
          <h1 class="text-2xl font-black text-solar-text-heading md:text-3xl">
            طلبات عروض الأسعار
          </h1>
          <p class="mt-0.5 text-xs sm:text-sm text-solar-text-muted">
            متابعة طلبات التسعير الواردة من العملاء لمنتجات متجرك والرد عليها مباشرة
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto">
        <button
          type="button"
          @click="fetchQuotes"
          :disabled="isLoading"
          class="inline-flex items-center justify-center gap-1.5 rounded-xl border border-solar-border-card bg-white dark:bg-solar-bg-card px-3.5 py-2.5 text-xs font-bold text-solar-text-heading hover:bg-solar-bg-subtle shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          title="تحديث البيانات"
        >
          <RefreshCw class="size-4" :class="{ 'animate-spin': isLoading }" />
          <span class="hidden sm:inline">تحديث</span>
        </button>

        <button
          type="button"
          @click="exportQuotes"
          :disabled="quotes.length === 0"
          class="inline-flex items-center justify-center gap-2 rounded-xl border border-solar-border-card bg-white dark:bg-solar-bg-card px-4 py-2.5 text-xs font-bold text-solar-text-heading hover:bg-solar-bg-subtle shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <Download class="size-4" />
          <span>تصدير البيانات</span>
        </button>
      </div>
    </div>

    <!-- تنبيه الخطأ أو عدم الاتصال -->
    <div
      v-if="errorMessage"
      class="solar-card border-rose-200 bg-rose-50/70 dark:bg-rose-950/30 p-4 flex items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-200"
    >
      <div class="flex items-center gap-2.5">
        <AlertCircle class="size-5 shrink-0 text-rose-600 dark:text-rose-400" />
        <span class="font-bold">{{ errorMessage }}</span>
      </div>
      <button
        type="button"
        @click="fetchQuotes"
        class="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors shrink-0 cursor-pointer"
      >
        إعادة المحاولة
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
            placeholder="ابحث برقم الطلب (مثال: #RFQ-0001)، اسم المنتج، الكود، اسم العميل..."
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
            <option value="all">جميع الحالات ({{ quotes.length }})</option>
            <option value="pending">بانتظار الرد</option>
            <option value="responded">تم الرد</option>
            <option value="accepted">مقبول</option>
            <option value="rejected">مرفوض</option>
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
              <th scope="col" class="py-4 px-4 min-w-[120px]">رقم الطلب</th>
              <th scope="col" class="py-4 px-4 min-w-[260px]">المنتج والموديل</th>
              <th scope="col" class="py-4 px-4 min-w-[160px]">بيانات العميل</th>
              <th scope="col" class="py-4 px-4 text-center">الكمية والمستهدف</th>
              <th scope="col" class="py-4 px-4 text-center">السعر المعروض</th>
              <th scope="col" class="py-4 px-4 text-center">حالة الطلب</th>
              <th scope="col" class="py-4 px-4 text-center w-36">الإجراءات</th>
            </tr>
          </thead>

          <!-- محتوى الجدول -->
          <tbody class="divide-y divide-solar-border-card bg-white dark:bg-solar-bg-card">
            <!-- التحميل -->
            <tr v-if="isLoading">
              <td colspan="7" class="py-16 text-center text-solar-text-muted">
                <Loader2 class="size-8 animate-spin mx-auto text-solar-yellow mb-2" />
                <p class="font-bold text-solar-text-heading">جارٍ جلب طلبات عروض الأسعار من الخادم...</p>
              </td>
            </tr>

            <!-- فارغ -->
            <tr v-else-if="filteredQuotes.length === 0">
              <td colspan="7" class="py-16 text-center text-solar-text-muted">
                <FileText class="size-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p class="font-bold text-solar-text-heading">لا توجد طلبات عروض أسعار مسجلة في المتجر</p>
                <p class="mt-1 text-xs text-solar-text-muted">
                  {{ searchQuery || selectedStatus !== 'all' ? 'جرب تغيير معايير البحث أو تصفية الحالات' : 'ستظهر هنا طلبات عروض الأسعار الواردة من العملاء فور تقديمها' }}
                </p>
              </td>
            </tr>

            <!-- الصفوف -->
            <tr
              v-for="quote in paginatedQuotes"
              :key="quote.id"
              class="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
            >
              <!-- 1. رقم الطلب والتاريخ -->
              <td class="py-4 px-4">
                <div class="font-black font-mono text-xs text-solar-text-heading">
                  {{ quote.quoteRequestNumber }}
                </div>
                <div class="mt-0.5 text-[10px] text-solar-text-muted">
                  {{ quote.requestDate }}
                </div>
              </td>

              <!-- 2. المنتج والموديل والصورة -->
              <td class="py-4 px-4">
                <div class="flex items-center gap-3">
                  <img
                    v-if="quote.productImage"
                    :src="quote.productImage"
                    :alt="quote.productTitle"
                    class="size-11 rounded-lg object-contain bg-white dark:bg-solar-bg-card border border-solar-border-card shrink-0 p-1"
                    @error="(e) => ((e.target as HTMLImageElement).src = '/images/hero-solar.png')"
                  />
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span v-if="quote.productBrand" class="rounded bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 text-[9px] font-bold text-blue-700 dark:text-blue-300">
                        {{ quote.productBrand }}
                      </span>
                      <span v-if="quote.productCategory" class="rounded bg-solar-bg-subtle px-1.5 py-0.2 text-[9px] font-medium text-solar-text-muted">
                        {{ quote.productCategory }}
                      </span>
                    </div>
                    <div class="font-black text-xs text-solar-text-heading leading-tight truncate mt-0.5">
                      {{ quote.productTitle }}
                    </div>
                    <div class="text-[10px] font-mono text-solar-text-muted">
                      {{ quote.productCode }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- 3. بيانات العميل -->
              <td class="py-4 px-4">
                <div class="font-bold text-xs text-solar-text-heading truncate">
                  {{ quote.customer.name }}
                </div>
                <div class="text-[10px] font-mono text-solar-text-muted mt-0.5 dir-ltr text-right">
                  {{ quote.customer.phone || '–' }}
                </div>
              </td>

              <!-- 4. الكمية المطلوبة والسعر المستهدف -->
              <td class="py-4 px-4 text-center">
                <span class="inline-flex rounded-lg bg-solar-bg-subtle px-2.5 py-1 text-xs font-black text-solar-text-heading border border-solar-border-card font-mono">
                  {{ quote.requestedQuantity }} {{ quote.unitLabel }}
                </span>
                <div class="mt-1 text-[10px] text-solar-text-muted font-medium">
                  {{ quote.customerTargetPrice ? `المستهدف: ${quote.customerTargetPrice.toLocaleString('en-US')} ر.س` : 'بدون تحديد' }}
                </div>
              </td>

              <!-- 5. السعر المعروض -->
              <td class="py-4 px-4 text-center">
                <div v-if="quote.offeredUnitPrice" class="font-black font-mono text-xs text-blue-600 dark:text-blue-400">
                  {{ quote.offeredUnitPrice.toLocaleString('en-US') }} ر.س
                  <div class="text-[10px] font-bold text-solar-text-muted">
                    الإجمالي: {{ quote.totalPrice ? quote.totalPrice.toLocaleString('en-US') : '–' }}
                  </div>
                </div>
                <span v-else class="text-[11px] font-medium text-solar-text-muted">
                  بانتظار العرض
                </span>
              </td>

              <!-- 6. حالة الطلب -->
              <td class="py-4 px-4 text-center">
                <span
                  v-if="quote.status === 'pending'"
                  class="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 border border-amber-200/80"
                >
                  بانتظار الرد
                </span>

                <span
                  v-else-if="quote.status === 'responded'"
                  class="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/40 px-3 py-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200/80"
                >
                  تم الرد
                </span>

                <span
                  v-else-if="quote.status === 'accepted'"
                  class="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200/80"
                >
                  مقبول
                </span>

                <span
                  v-else-if="quote.status === 'rejected'"
                  class="inline-flex items-center rounded-full bg-rose-50 dark:bg-rose-950/40 px-3 py-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 border border-rose-200/80"
                >
                  مرفوض
                </span>

                <span
                  v-else
                  class="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[11px] font-bold text-solar-text-muted border border-slate-200 dark:border-slate-700"
                >
                  ملغي
                </span>
              </td>

              <!-- 7. الإجراءات -->
              <td class="py-4 px-4 text-center">
                <!-- زر الرد المباشر إذا كان بانتظار الرد -->
                <button
                  v-if="quote.status === 'pending'"
                  type="button"
                  @click="openRespondModal(quote)"
                  class="inline-flex items-center justify-center gap-1.5 rounded-xl bg-solar-yellow px-3.5 py-2 text-xs font-black text-solar-navy-dark hover:bg-solar-yellow-hover transition-all active:scale-95 shadow-sm cursor-pointer w-full"
                >
                  <span>تقديم السعر</span>
                  <CornerUpLeft class="size-3.5 stroke-[2.5]" />
                </button>

                <!-- زر عرض التفاصيل إذا تمت معالجته -->
                <button
                  v-else
                  type="button"
                  @click="openDetails(quote)"
                  class="inline-flex items-center justify-center gap-1.5 rounded-xl bg-solar-navy-dark text-white px-3.5 py-2 text-xs font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-2xs cursor-pointer w-full"
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
      <div
        v-if="filteredQuotes.length > 0"
        class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-solar-border-card text-xs text-solar-text-muted bg-white dark:bg-solar-bg-card"
      >
        <div>
          عرض <span class="font-bold text-solar-text-heading">{{ (currentPage - 1) * perPage + 1 }} إلى {{ Math.min(currentPage * perPage, filteredQuotes.length) }}</span> من إجمالي
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
