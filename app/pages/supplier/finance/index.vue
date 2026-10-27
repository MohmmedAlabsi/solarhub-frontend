<script setup lang="ts">
import {
  AlertCircle,
  ArrowUpRight,
  Banknote,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Wallet,
  XCircle,
} from 'lucide-vue-next'
import WithdrawModal from '~/components/supplier/finance/WithdrawModal.vue'
import type { WithdrawRequestInput } from '~/types/supplier-finance'

definePageMeta({
  layout: 'supplier',
})

useSeoMeta({
  title: 'المستحقات المالية | بوابة المتجر والمورد SolarHub',
  description: 'متابعة مبالغ وعوائد مبيعات المتجر، حساب العمولات، وتتبع حالات التحويل المالي إلى الحساب البنكي.',
})

const {
  settlements,
  loading,
  isWithdrawing,
  noticeMessage,
  searchQuery,
  statusFilter,
  periodFilter,
  currentPage,
  perPage,
  filteredSettlements,
  paginatedSettlements,
  totalPages,
  financialSummary,
  formatCurrency,
  changePage,
  requestWithdraw,
  exportStatement,
} = useSupplierFinance()

const isWithdrawModalOpen = ref(false)

async function handleWithdrawSubmit(data: WithdrawRequestInput) {
  const success = await requestWithdraw(data)
  if (success) {
    isWithdrawModalOpen.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- مسار التنقل (Breadcrumb) -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/supplier/dashboard" class="hover:text-solar-text-heading transition-colors">
        الرئيسية
      </NuxtLink>
      <span>‹</span>
      <span class="font-bold text-solar-text-heading">المستحقات المالية</span>
    </nav>

    <!-- ترويسة الصفحة والأزرار التفاعلية -->
    <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-start gap-3">
        <div class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow mt-0.5 shadow-xs">
          <Banknote class="size-6 stroke-[2.2]" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-solar-text-heading tracking-tight">
            المستحقات المالية
          </h1>
          <p class="mt-1 text-xs sm:text-sm text-solar-text-muted">
            متابعة مبالغ وعوائد مبيعات المتجر، حساب العمولات، وتتبع حالات التحويل المالي إلى الحساب البنكي
          </p>
        </div>
      </div>

      <!-- أزرار الإجراء السريع -->
      <div class="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          @click="exportStatement"
          class="flex items-center gap-2 rounded-xl border border-solar-border-card bg-white dark:bg-solar-bg-card px-4 py-2.5 text-xs font-bold text-solar-text-heading shadow-xs hover:bg-solar-bg-subtle active:scale-95 transition-all cursor-pointer"
        >
          <Download class="size-4 text-solar-text-muted" />
          <span>تصدير كشف الحساب</span>
        </button>

        <button
          type="button"
          @click="isWithdrawModalOpen = true"
          class="flex items-center gap-2 rounded-xl bg-solar-yellow px-4 py-2.5 text-xs font-black text-solar-navy-dark shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowUpRight class="size-4 stroke-[2.5]" />
          <span>طلب سحب الأرباح</span>
        </button>
      </div>
    </header>

    <!-- بطاقات المؤشرات المالية السريعة (Financial KPI Cards) -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="ملخص الأرصدة والمستحقات">
      <!-- 1. الرصيد المتاح للسحب -->
      <div class="solar-card relative overflow-hidden rounded-2xl p-5 border border-solar-border-card bg-white dark:bg-solar-bg-card shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-solar-text-muted">الرصيد المتاح للتحويل</span>
          <div class="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Wallet class="size-4.5" />
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-solar-text-heading font-mono">
            {{ formatCurrency(financialSummary.netAvailable) }}
          </div>
          <p class="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 class="size-3" />
            <span>جاهز للتحويل الفوري لحسابك</span>
          </p>
        </div>
      </div>

      <!-- 2. المستحقات المعلقة -->
      <div class="solar-card relative overflow-hidden rounded-2xl p-5 border border-solar-border-card bg-white dark:bg-solar-bg-card shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-solar-text-muted">مستحقات قيد الدورة القادمة</span>
          <div class="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock class="size-4.5" />
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-solar-text-heading font-mono">
            {{ formatCurrency(financialSummary.totalPending) }}
          </div>
          <p class="text-[11px] font-medium text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
            <Clock class="size-3" />
            <span>بانتظار تأكيد استلام الشحنات</span>
          </p>
        </div>
      </div>

      <!-- 3. إجمالي المبيعات المحولة -->
      <div class="solar-card relative overflow-hidden rounded-2xl p-5 border border-solar-border-card bg-white dark:bg-solar-bg-card shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-solar-text-muted">إجمالي المبيعات المنفذة</span>
          <div class="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <TrendingUp class="size-4.5" />
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-solar-text-heading font-mono">
            {{ formatCurrency(financialSummary.totalSettled + financialSummary.totalCommissions) }}
          </div>
          <p class="text-[11px] font-medium text-solar-text-muted mt-1">
            من إجمالي {{ settlements.length }} عملية بيع مكتملة
          </p>
        </div>
      </div>

      <!-- 4. عمولات المنصة -->
      <div class="solar-card relative overflow-hidden rounded-2xl p-5 border border-solar-border-card bg-white dark:bg-solar-bg-card shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-solar-text-muted">رسوم وعمولات المنصة</span>
          <div class="flex size-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Banknote class="size-4.5" />
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            -{{ formatCurrency(financialSummary.totalCommissions) }}
          </div>
          <p class="text-[11px] font-medium text-solar-text-muted mt-1">
            معدل العمولة المعتمد (5% - 7%)
          </p>
        </div>
      </div>
    </section>

    <!-- شريط البحث والتصفية المتطابق مع التصميم المعتمد -->
    <section class="solar-card rounded-2xl bg-white dark:bg-solar-bg-card p-4 border border-solar-border-card shadow-xs">
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <!-- حقل البحث برقم طلب المتجر -->
        <div class="relative flex-1 md:max-w-md">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ابحث برقم طلب المتجر..."
            class="solar-input w-full pr-10 pl-4 py-2.5 text-xs font-medium rounded-xl"
          />
          <Search class="size-4 text-solar-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <!-- القوائم المنسدلة للتصفية -->
        <div class="flex items-center gap-3 w-full md:w-auto">
          <!-- فلتر الحالات -->
          <div class="relative flex-1 md:flex-initial">
            <select
              v-model="statusFilter"
              class="solar-input w-full md:w-auto py-2.5 pr-3 pl-8 text-xs font-bold rounded-xl appearance-none cursor-pointer min-w-[130px]"
            >
              <option value="all">جميع الحالات</option>
              <option value="completed">مكتمل</option>
              <option value="pending">بانتظار الدفع</option>
              <option value="failed">فشل التحويل</option>
            </select>
            <ChevronDown class="size-3.5 text-solar-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <!-- فلتر الفترات -->
          <div class="relative flex-1 md:flex-initial">
            <Calendar class="size-3.5 text-solar-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              v-model="periodFilter"
              class="solar-input w-full md:w-auto py-2.5 pr-8 pl-8 text-xs font-bold rounded-xl appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="all">جميع الفترات</option>
              <option value="7days">آخر 7 أيام</option>
              <option value="30days">آخر 30 يوم</option>
              <option value="month">هذا الشهر</option>
              <option value="quarter">الربع الحالي</option>
            </select>
            <ChevronDown class="size-3.5 text-solar-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>

    <!-- جدول المستحقات المالية المتطابق بيكسلياً مع المورد - المستحقات.png -->
    <section class="solar-card overflow-hidden rounded-2xl bg-white dark:bg-solar-bg-card border border-solar-border-card shadow-xs">
      <div class="overflow-x-auto">
        <table class="w-full text-right border-collapse text-xs">
          <!-- ترويسة الجدول -->
          <thead class="bg-solar-bg-subtle text-solar-text-muted font-bold border-b border-solar-border-card">
            <tr>
              <th scope="col" class="py-4 pr-6">رقم طلب المتجر</th>
              <th scope="col" class="py-4 text-center font-bold">إجمالي المبلغ (ر.س)</th>
              <th scope="col" class="py-4 text-center font-bold">نسبة العمولة</th>
              <th scope="col" class="py-4 text-center font-bold">مبلغ العمولة (ر.س)</th>
              <th scope="col" class="py-4 text-center font-bold">صافي المستحق (ر.س)</th>
              <th scope="col" class="py-4 text-center font-bold">حالة التحويل</th>
              <th scope="col" class="py-4 pl-6 font-bold">تاريخ الدفع</th>
            </tr>
          </thead>

          <!-- صفوف الجدول -->
          <tbody class="divide-y divide-solar-border-card">
            <tr
              v-for="item in paginatedSettlements"
              :key="item.id"
              class="hover:bg-solar-bg-subtle/50 transition-colors"
            >
              <!-- 1. رقم طلب المتجر -->
              <td class="py-4 pr-6 font-black font-mono text-solar-text-heading text-xs">
                {{ item.orderNumber }}
              </td>

              <!-- 2. إجمالي المبلغ -->
              <td class="py-4 text-center font-bold font-mono text-solar-text-heading text-xs">
                {{ formatCurrency(item.grossAmount) }}
              </td>

              <!-- 3. نسبة العمولة -->
              <td class="py-4 text-center font-bold text-solar-text-muted">
                {{ item.commissionRate }}%
              </td>

              <!-- 4. مبلغ العمولة باللون الأحمر -->
              <td class="py-4 text-center font-black font-mono text-rose-600 dark:text-rose-400 dir-ltr text-xs">
                {{ formatCurrency(item.commissionAmount) }}
              </td>

              <!-- 5. صافي المستحق بخط عريض -->
              <td class="py-4 text-center font-black font-mono text-solar-text-heading text-xs">
                {{ formatCurrency(item.netPayout) }}
              </td>

              <!-- 6. حالة التحويل (Pill بادج مطابق للتصميم) -->
              <td class="py-4 text-center">
                <span
                  v-if="item.status === 'completed'"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                >
                  <span class="size-1.5 rounded-full bg-emerald-500"></span>
                  <span>مكتمل</span>
                </span>

                <span
                  v-else-if="item.status === 'pending'"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60"
                >
                  <span class="size-1.5 rounded-full bg-amber-500"></span>
                  <span>بانتظار الدفع</span>
                </span>

                <span
                  v-else-if="item.status === 'failed'"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60"
                >
                  <span class="size-1.5 rounded-full bg-rose-500"></span>
                  <span>فشل التحويل</span>
                </span>
              </td>

              <!-- 7. تاريخ الدفع أو الملاحظة -->
              <td class="py-4 pl-6 text-xs">
                <span
                  v-if="item.status === 'completed'"
                  class="font-bold text-solar-text-body"
                >
                  {{ item.payoutDate }}
                </span>
                <span
                  v-else-if="item.status === 'pending'"
                  class="font-medium text-solar-text-muted"
                >
                  {{ item.payoutDate }}
                </span>
                <span
                  v-else-if="item.status === 'failed'"
                  class="font-black text-rose-600 dark:text-rose-400"
                >
                  {{ item.payoutDate }}
                </span>
              </td>
            </tr>

            <!-- حالة عدم وجود نتائج مطابقة للبحث -->
            <tr v-if="filteredSettlements.length === 0">
              <td colspan="7" class="py-14 text-center text-solar-text-muted">
                <div class="flex flex-col items-center justify-center gap-2">
                  <Banknote class="size-10 text-solar-text-muted/40 stroke-1" />
                  <p class="font-bold text-sm text-solar-text-heading">لا توجد عمليات تحويل مطابقة لخيارات البحث</p>
                  <p class="text-xs text-solar-text-muted">جرّب تغيير كلمات البحث أو إعادة ضبط خيارات التصفية</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- تذييل الجدول وترقيم الصفحات المتطابق مع التصميم المعتمد -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-solar-border-card text-xs text-solar-text-muted bg-white dark:bg-solar-bg-card">
        <!-- معلومات العرض والإجمالي -->
        <div>
          عرض <span class="font-bold text-solar-text-heading">{{ paginatedSettlements.length ? (currentPage - 1) * perPage + 1 : 0 }} إلى {{ Math.min(currentPage * perPage, filteredSettlements.length) }}</span> من إجمالي <span class="font-bold text-solar-text-heading">{{ filteredSettlements.length }}</span> عملية تحويل
        </div>

        <!-- أزرار الترقيم -->
        <div v-if="totalPages > 1" class="flex items-center gap-1.5">
          <!-- زر التالي (يسار في RTL) -->
          <button
            type="button"
            @click="changePage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="flex items-center gap-1 rounded-xl border border-solar-border-card px-3 py-1.5 text-xs font-bold text-solar-text-body transition-colors hover:bg-solar-bg-subtle disabled:opacity-40 cursor-pointer"
          >
            <span>التالي</span>
            <ChevronLeft class="size-3.5" />
          </button>

          <!-- أرقام الصفحات -->
          <div class="flex items-center gap-1">
            <button
              v-for="page in totalPages"
              :key="page"
              type="button"
              @click="changePage(page)"
              :class="[
                currentPage === page
                  ? 'bg-solar-navy-dark text-white dark:bg-solar-yellow dark:text-solar-navy-dark font-black shadow-2xs'
                  : 'bg-transparent text-solar-text-body hover:bg-solar-bg-subtle font-bold border border-solar-border-card',
                'size-8 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center',
              ]"
            >
              {{ page }}
            </button>
          </div>

          <!-- زر السابق (يمين في RTL) -->
          <button
            type="button"
            @click="changePage(currentPage - 1)"
            :disabled="currentPage <= 1"
            class="flex items-center gap-1 rounded-xl border border-solar-border-card px-3 py-1.5 text-xs font-bold text-solar-text-body transition-colors hover:bg-solar-bg-subtle disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight class="size-3.5" />
            <span>السابق</span>
          </button>
        </div>
      </div>
    </section>

    <!-- مودال طلب سحب الأرباح -->
    <WithdrawModal
      :is-open="isWithdrawModalOpen"
      :available-balance="financialSummary.netAvailable"
      :is-submitting="isWithdrawing"
      @close="isWithdrawModalOpen = false"
      @submit="handleWithdrawSubmit"
    />

    <!-- توست الإشعارات السريعة -->
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
