<script setup lang="ts">
import {
  Check,
  CreditCard,
  Download,
  Eye,
  Paperclip,
  Search,
  X,
} from 'lucide-vue-next'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import AdminPagination from '../../../components/admin/common/AdminPagination.vue'
import FinanceTabs from '../../../components/admin/finance/FinanceTabs.vue'
import type { AdminPayment } from '../../../../types/admin'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'الإدارة المالية — مدفوعات العملاء | لوحة الإدارة العامة' })

const searchQuery = ref('')
const selectedStatus = ref('all')
const selectedWallet = ref('all')
const currentPage = ref(1)

const payments = ref<AdminPayment[]>([
  {
    id: '1',
    orderNumber: 'ORD-8842',
    walletProvider: 'STC Pay',
    amount: 12450,
    transactionRef: 'TXN-994821',
    receiptImage: '/images/receipt-sample.png',
    status: 'تم التحقق',
    verifierName: 'م. فهد السديري',
    paymentDate: '2025-05-14 10:30 ص',
    verificationDate: '2025-05-14 11:15 ص',
  },
  {
    id: '2',
    orderNumber: 'ORD-8840',
    walletProvider: 'تحويل الراجحي',
    amount: 4850,
    transactionRef: 'TXN-881204',
    receiptImage: '/images/receipt-sample.png',
    status: 'قيد المراجعة',
    paymentDate: '2025-05-14 01:20 م',
  },
  {
    id: '3',
    orderNumber: 'ORD-8839',
    walletProvider: 'مدى (Mada)',
    amount: 8200,
    transactionRef: 'TXN-773199',
    receiptImage: '/images/receipt-sample.png',
    status: 'تم التحقق',
    verifierName: 'أحمد العتيبي',
    paymentDate: '2025-05-13 04:12 م',
    verificationDate: '2025-05-13 04:45 م',
  },
  {
    id: '4',
    orderNumber: 'ORD-8835',
    walletProvider: 'بنك الرياض',
    amount: 3120,
    transactionRef: 'TXN-662901',
    receiptImage: '/images/receipt-sample.png',
    status: 'مرفوض',
    verifierName: 'م. فهد السديري',
    paymentDate: '2025-05-13 11:00 ص',
    verificationDate: '2025-05-13 11:30 ص',
  },
  {
    id: '5',
    orderNumber: 'ORD-8831',
    walletProvider: 'STC Pay',
    amount: 19500,
    transactionRef: 'TXN-554128',
    receiptImage: '/images/receipt-sample.png',
    status: 'تم التحقق',
    verifierName: 'سارة القحطاني',
    paymentDate: '2025-05-12 09:15 ص',
    verificationDate: '2025-05-12 09:40 ص',
  },
  {
    id: '6',
    orderNumber: 'ORD-8828',
    walletProvider: 'تحويل الراجحي',
    amount: 7600,
    transactionRef: 'TXN-441920',
    receiptImage: '/images/receipt-sample.png',
    status: 'قيد المراجعة',
    paymentDate: '2025-05-12 02:40 م',
  },
])

const filteredPayments = computed(() => {
  return payments.value.filter((item) => {
    const matchesSearch =
      !searchQuery.value ||
      item.orderNumber.includes(searchQuery.value) ||
      item.transactionRef.includes(searchQuery.value)

    const matchesStatus =
      selectedStatus.value === 'all' || item.status === selectedStatus.value

    const matchesWallet =
      selectedWallet.value === 'all' || item.walletProvider.includes(selectedWallet.value)

    return matchesSearch && matchesStatus && matchesWallet
  })
})

function approvePayment(item: AdminPayment) {
  item.status = 'تم التحقق'
  item.verifierName = 'م. فهد السديري'
  item.verificationDate = 'الآن'
}

function rejectPayment(item: AdminPayment) {
  item.status = 'مرفوض'
  item.verifierName = 'م. فهد السديري'
  item.verificationDate = 'الآن'
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="solar-card p-5 sm:p-7">
      <!-- رأس الإدارة المالية -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-solar-border-card/60 pb-6">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-solar-text-heading">الإدارة المالية</h1>
          <p class="mt-1 text-xs sm:text-sm text-solar-text-muted">
            متابعة وإدارة مدفوعات العملاء، مستحقات الموردين، وإعدادات الضرائب والعمليات المالية.
          </p>
        </div>

        <button
          type="button"
          class="btn-outline h-11 px-4 text-xs font-bold gap-2 self-start sm:self-auto"
        >
          <Download class="size-4" />
          <span>تصدير كشف حساب</span>
        </button>
      </div>

      <!-- تبويبات الإدارة المالية -->
      <div class="mt-6">
        <FinanceTabs />
      </div>

      <!-- الفلاتر والبحث وعداد النتائج -->
      <div class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="grid w-full gap-3 sm:grid-cols-12 flex-1">
          <div class="relative sm:col-span-6">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="البحث برقم الطلب أو المرجع..."
              class="solar-input h-11 pr-10 text-xs"
            />
            <Search class="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted" />
          </div>

          <div class="sm:col-span-3">
            <select v-model="selectedStatus" class="solar-input h-11 text-xs">
              <option value="all">كل حالات الدفع</option>
              <option value="تم التحقق">تم التحقق</option>
              <option value="قيد المراجعة">قيد المراجعة</option>
              <option value="مرفوض">مرفوض</option>
            </select>
          </div>

          <div class="sm:col-span-3">
            <select v-model="selectedWallet" class="solar-input h-11 text-xs">
              <option value="all">جميع طرق الدفع</option>
              <option value="STC Pay">STC Pay</option>
              <option value="الراجحي">تحويل الراجحي</option>
              <option value="مدى">مدى (Mada)</option>
              <option value="الرياض">بنك الرياض</option>
            </select>
          </div>
        </div>

        <span class="text-xs font-bold text-solar-text-muted shrink-0">
          إجمالي المدفوعات المعروضة: <span class="text-solar-navy font-black">{{ filteredPayments.length }}</span> مدفوعات
        </span>
      </div>

      <!-- جدول مدفوعات العملاء -->
      <div class="mt-6 overflow-x-auto rounded-xl border border-solar-border-card/80">
        <table class="w-full text-right text-xs">
          <thead class="bg-solar-bg-subtle/70 text-solar-text-muted font-bold border-b border-solar-border-card">
            <tr>
              <th class="py-3.5 px-4 font-bold">الطلب المرتبط</th>
              <th class="py-3.5 px-4 font-bold">مزود المحفظة / طريقة الدفع</th>
              <th class="py-3.5 px-4 font-bold">مبلغ الدفع</th>
              <th class="py-3.5 px-4 font-bold font-mono">مرجع العملية</th>
              <th class="py-3.5 px-4 font-bold text-center">صورة الإيصال</th>
              <th class="py-3.5 px-4 font-bold text-center">حالة الدفع</th>
              <th class="py-3.5 px-4 font-bold">المتحقق</th>
              <th class="py-3.5 px-4 font-bold">تاريخ الدفع</th>
              <th class="py-3.5 px-4 font-bold">تاريخ التحقق</th>
              <th class="py-3.5 px-4 font-bold text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-solar-border-card/60">
            <tr
              v-for="item in filteredPayments"
              :key="item.id"
              class="transition-colors hover:bg-solar-bg-subtle/30"
            >
              <!-- الطلب المرتبط -->
              <td class="py-3.5 px-4 font-bold font-mono text-solar-navy-dark">
                #{{ item.orderNumber }}
              </td>

              <!-- مزود المحفظة -->
              <td class="py-3.5 px-4 font-bold text-solar-text-heading">
                <span class="inline-block rounded-md bg-solar-bg-subtle px-2.5 py-1 text-xs">
                  {{ item.walletProvider }}
                </span>
              </td>

              <!-- مبلغ الدفع -->
              <td class="py-3.5 px-4 font-black font-mono text-solar-text-heading">
                {{ item.amount.toLocaleString() }} ر.س
              </td>

              <!-- مرجع العملية -->
              <td class="py-3.5 px-4 font-mono text-solar-text-body">
                {{ item.transactionRef }}
              </td>

              <!-- صورة الإيصال -->
              <td class="py-3.5 px-4 text-center">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-solar-border-card bg-white px-2.5 py-1 text-xs font-bold text-solar-text-body hover:bg-solar-bg-subtle transition-colors shadow-2xs"
                >
                  <Paperclip class="size-3.5" />
                  <span>معاينة الإيصال</span>
                </button>
              </td>

              <!-- حالة الدفع -->
              <td class="py-3.5 px-4 text-center">
                <AdminBadge :status="item.status" />
              </td>

              <!-- المتحقق -->
              <td class="py-3.5 px-4 text-solar-text-muted">
                {{ item.verifierName || '—' }}
              </td>

              <!-- تاريخ الدفع -->
              <td class="py-3.5 px-4 text-[11px] text-solar-text-muted font-mono whitespace-nowrap">
                {{ item.paymentDate }}
              </td>

              <!-- تاريخ التحقق -->
              <td class="py-3.5 px-4 text-[11px] text-solar-text-muted font-mono whitespace-nowrap">
                {{ item.verificationDate || '—' }}
              </td>

              <!-- الإجراءات -->
              <td class="py-3.5 px-4 text-center">
                <div v-if="item.status === 'قيد المراجعة'" class="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    @click="approvePayment(item)"
                    class="inline-flex items-center gap-1 rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                    title="اعتماد التحقق"
                  >
                    <Check class="size-3.5" />
                    <span>اعتماد التحقق</span>
                  </button>
                  <button
                    type="button"
                    @click="rejectPayment(item)"
                    class="inline-flex items-center gap-1 rounded-lg bg-rose-600 text-white px-2 py-1 text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs"
                    title="رفض الإيصال"
                  >
                    <X class="size-3.5" />
                    <span>رفض</span>
                  </button>
                </div>
                <div v-else>
                  <NuxtLink
                    to="/admin/orders"
                    class="inline-block rounded-lg border border-solar-border-card bg-white px-3 py-1 text-xs font-bold text-solar-text-body hover:bg-solar-bg-subtle transition-colors"
                  >
                    عرض الطلب
                  </NuxtLink>
                </div>
              </td>
            </tr>

            <tr v-if="!filteredPayments.length">
              <td colspan="10" class="py-12 text-center text-solar-text-muted">
                لا توجد مدفوعات مطابقة لمعايير البحث.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ترقيم الصفحات -->
      <AdminPagination
        v-model:current-page="currentPage"
        :total-pages="6"
        :total-count="34"
        :page-size="6"
        item-name="مدفوعات"
      />
    </div>
  </div>
</template>
