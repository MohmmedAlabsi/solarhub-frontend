<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-start gap-3">
        <div class="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mt-1">
          <Icon name="lucide:banknote" class="w-7 h-7" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">المستحقات المالية</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            متابعة مبالغ وعوائد مبيعات المتجر، حساب العمولات، وتتبع حالات التحويل المالي إلى الحساب البنكي
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="exportStatement"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-sm transition-all"
        >
          <Icon name="lucide:download" class="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>تصدير كشف الحساب</span>
        </button>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="solar-card bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 flex flex-col md:flex-row items-center gap-3 justify-between">
      <!-- Search Input -->
      <div class="relative w-full md:w-96">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ابحث برقم طلب المتجر..."
          class="solar-input w-full pr-4 pl-10 py-2.5 text-sm rounded-xl"
        />
        <Icon
          name="lucide:search"
          class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        />
      </div>

      <!-- Dropdown Filters -->
      <div class="flex items-center gap-3 w-full md:w-auto">
        <!-- Status Filter -->
        <div class="relative flex-1 md:flex-initial">
          <select
            v-model="statusFilter"
            class="solar-input py-2.5 px-3 text-sm rounded-xl min-w-[140px] appearance-none cursor-pointer"
          >
            <option value="all">جميع الحالات</option>
            <option value="completed">مكتمل</option>
            <option value="pending">بانتظار الدفع</option>
            <option value="failed">فشل التحويل</option>
          </select>
          <Icon
            name="lucide:chevron-down"
            class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
        </div>

        <!-- Period Filter -->
        <div class="relative flex-1 md:flex-initial">
          <Icon
            name="lucide:calendar"
            class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <select
            v-model="periodFilter"
            class="solar-input py-2.5 pr-9 pl-8 text-sm rounded-xl min-w-[150px] appearance-none cursor-pointer"
          >
            <option value="all">جميع الفترات</option>
            <option value="7days">آخر 7 أيام</option>
            <option value="30days">آخر 30 يوم</option>
            <option value="month">هذا الشهر</option>
            <option value="quarter">الربع الحالي</option>
          </select>
          <Icon
            name="lucide:chevron-down"
            class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
        </div>
      </div>
    </div>

    <!-- Settlements Table Card -->
    <div class="solar-card overflow-hidden bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-right">
          <thead class="bg-slate-50/90 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200/80 dark:border-slate-700">
            <tr>
              <th scope="col" class="py-4 pr-6">رقم طلب المتجر</th>
              <th scope="col" class="py-4 text-center">إجمالي المبلغ (ر.س)</th>
              <th scope="col" class="py-4 text-center">نسبة العمولة</th>
              <th scope="col" class="py-4 text-center">مبلغ العمولة (ر.س)</th>
              <th scope="col" class="py-4 text-center">صافي المستحق (ر.س)</th>
              <th scope="col" class="py-4 text-center">حالة التحويل</th>
              <th scope="col" class="py-4 pl-6">تاريخ الدفع</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-750">
            <tr
              v-for="item in paginatedSettlements"
              :key="item.id"
              class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
            >
              <!-- Order Number -->
              <td class="py-4 pr-6 font-semibold text-slate-900 dark:text-white">
                {{ item.orderNumber }}
              </td>

              <!-- Gross Amount -->
              <td class="py-4 text-center font-medium text-slate-700 dark:text-slate-200">
                {{ formatCurrency(item.grossAmount) }}
              </td>

              <!-- Commission Rate -->
              <td class="py-4 text-center text-slate-600 dark:text-slate-400">
                {{ item.commissionRate }}%
              </td>

              <!-- Commission Amount (Red Font) -->
              <td class="py-4 text-center font-medium text-rose-600 dark:text-rose-400 dir-ltr">
                {{ formatCurrency(item.commissionAmount) }}
              </td>

              <!-- Net Payout (Bold) -->
              <td class="py-4 text-center font-bold text-slate-900 dark:text-white">
                {{ formatCurrency(item.netPayout) }}
              </td>

              <!-- Status Badge -->
              <td class="py-4 text-center">
                <span
                  v-if="item.status === 'completed'"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  مكتمل
                </span>
                <span
                  v-else-if="item.status === 'pending'"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  بانتظار الدفع
                </span>
                <span
                  v-else-if="item.status === 'failed'"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  فشل التحويل
                </span>
              </td>

              <!-- Payout Date / Note -->
              <td class="py-4 pl-6 text-sm">
                <span
                  v-if="item.status === 'completed'"
                  class="text-slate-700 dark:text-slate-300 font-medium"
                >
                  {{ item.payoutDate }}
                </span>
                <span
                  v-else-if="item.status === 'pending'"
                  class="text-slate-500 dark:text-slate-400 text-xs md:text-sm"
                >
                  {{ item.payoutDate }}
                </span>
                <span
                  v-else-if="item.status === 'failed'"
                  class="text-rose-600 dark:text-rose-400 font-medium text-xs md:text-sm"
                >
                  {{ item.payoutDate }}
                </span>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredSettlements.length === 0">
              <td colspan="7" class="py-12 text-center text-slate-500 dark:text-slate-400">
                <div class="flex flex-col items-center justify-center gap-2">
                  <Icon name="lucide:receipt-text" class="w-10 h-10 text-slate-300 dark:text-slate-600" />
                  <p class="font-medium text-base">لا توجد عمليات تحويل مطابقة للبحث</p>
                  <p class="text-xs text-slate-400">جرّب تغيير خيارات التصفية أو البحث برقم طلب آخر</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="p-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <!-- Count Info -->
        <p class="text-sm text-slate-500 dark:text-slate-400">
          عرض
          <span class="font-medium text-slate-800 dark:text-white">
            {{ filteredSettlements.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1 }}
          </span>
          إلى
          <span class="font-medium text-slate-800 dark:text-white">
            {{ Math.min(currentPage * itemsPerPage, filteredSettlements.length) }}
          </span>
          من إجمالي
          <span class="font-medium text-slate-800 dark:text-white">
            {{ filteredSettlements.length }}
          </span>
          عملية تحويل
        </p>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="flex items-center gap-1.5">
          <!-- Prev Button (Right chevron in RTL) -->
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Icon name="lucide:chevron-right" class="w-4 h-4" />
            <span>السابق</span>
          </button>

          <!-- Numeric Pages -->
          <button
            v-for="p in totalPages"
            :key="p"
            @click="currentPage = p"
            :class="[
              currentPage === p
                ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700',
              'w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-colors',
            ]"
          >
            {{ p }}
          </button>

          <!-- Next Button (Left chevron in RTL) -->
          <button
            @click="currentPage++"
            :disabled="currentPage >= totalPages"
            class="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <span>التالي</span>
            <Icon name="lucide:chevron-left" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSupplierFinance } from '../../composables/useSupplierFinance'

definePageMeta({
  layout: 'supplier',
})

useHead({
  title: 'المستحقات المالية - لوحة تحكم المورد',
})

const {
  searchQuery,
  statusFilter,
  periodFilter,
  currentPage,
  itemsPerPage,
  filteredSettlements,
  paginatedSettlements,
  totalPages,
  formatCurrency,
  exportStatement,
} = useSupplierFinance()
</script>
