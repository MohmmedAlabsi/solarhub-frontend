<script setup lang="ts">
import {
  Check,
  CreditCard,
  Download,
  Eye,
  Loader2,
  Paperclip,
  RefreshCw,
  Search,
  X,
} from 'lucide-vue-next'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import AdminPagination from '../../../components/admin/common/AdminPagination.vue'
import AdminModal from '../../../components/admin/common/AdminModal.vue'
import FinanceTabs from '../../../components/admin/finance/FinanceTabs.vue'
import type { OrderPayment } from '../../../../types/api'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'الإدارة المالية — مدفوعات العملاء | لوحة الإدارة العامة' })

const {
  payments,
  isLoading,
  isActionLoading,
  fetchPayments,
  updatePaymentStatus,
} = useAdminFinance()

// Non-blocking lazy SSR Data Fetching
const { pending } = useLazyAsyncData('admin_finance_payments', () => fetchPayments(false), {
  default: () => payments.value,
})

const isRefreshing = ref(false)
const searchQuery = ref('')
const selectedStatus = ref('all')
const selectedWallet = ref('all')
const currentPage = ref(1)
const pageSize = 10

// Receipt preview modal state
const isReceiptModalOpen = ref(false)
const selectedPayment = ref<OrderPayment | null>(null)

// Status mapper helpers
function mapStatusToArabic(status: string) {
  switch (status) {
    case 'verified': return 'تم التحقق'
    case 'rejected': return 'مرفوض'
    case 'pending': return 'قيد المراجعة'
    default: return 'قيد المراجعة'
  }
}

// Available wallet names for filter
const uniqueWalletNames = computed(() => {
  const set = new Set<string>()
  for (const p of payments.value) {
    const name = p.wallet_provider?.name_ar || p.wallet_provider?.name_en || p.wallet_provider_name
    if (name) set.add(name)
  }
  return Array.from(set)
})

const filteredPayments = computed(() => {
  return payments.value.filter((item) => {
    const q = searchQuery.value.trim().toLowerCase()
    const orderNum = item.order?.order_number || String(item.order_id)
    const refNum = item.transaction_reference || ''
    const customerName = item.order?.customer?.name || ''

    const matchesSearch =
      !q ||
      orderNum.toLowerCase().includes(q) ||
      refNum.toLowerCase().includes(q) ||
      customerName.toLowerCase().includes(q)

    const matchesStatus =
      selectedStatus.value === 'all' || item.status === selectedStatus.value

    const walletName = item.wallet_provider?.name_ar || item.wallet_provider?.name_en || item.wallet_provider_name || ''
    const matchesWallet =
      selectedWallet.value === 'all' || walletName.includes(selectedWallet.value)

    return matchesSearch && matchesStatus && matchesWallet
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredPayments.value.length / pageSize)))
const visiblePayments = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredPayments.value.slice(start, start + pageSize)
})

watch([searchQuery, selectedStatus, selectedWallet], () => {
  currentPage.value = 1
})

async function handleRefreshPayments() {
  isRefreshing.value = true
  try {
    await fetchPayments(true)
  } finally {
    isRefreshing.value = false
  }
}

async function approvePayment(item: OrderPayment) {
  await updatePaymentStatus(item.id, 'verified')
}

async function rejectPayment(item: OrderPayment) {
  await updatePaymentStatus(item.id, 'rejected')
}

function openReceiptModal(payment: OrderPayment) {
  selectedPayment.value = payment
  isReceiptModalOpen.value = true
}

function exportPaymentsCsv() {
  if (!payments.value.length) return
  const headers = ['رقم المعاملة', 'رقم الطلب', 'العميل', 'المحفظة', 'المبلغ (ريال)', 'المرجع البنكي', 'الحالة', 'تاريخ الدفع']
  const rows = payments.value.map(p => [
    p.id,
    p.order?.order_number || `ORD-${p.order_id}`,
    `"${(p.order?.customer?.name || 'عميل مسجل').replace(/"/g, '""')}"`,
    `"${(p.wallet_provider?.name_ar || p.wallet_provider?.name_en || 'محفظة').replace(/"/g, '""')}"`,
    p.amount,
    `"${(p.transaction_reference || '—').replace(/"/g, '""')}"`,
    `"${mapStatusToArabic(p.status)}"`,
    p.paid_at || p.created_at?.slice(0, 10) || '',
  ])

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `solarhub-payments-${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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
            متابعة وإدارة مدفوعات العملاء، مستحقات الموردين، وإعدادات الضرائب والعمليات المالية في المنظومة.
          </p>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            @click="handleRefreshPayments"
            :disabled="isRefreshing || pending || isLoading"
            class="btn-outline h-10 px-4 text-xs font-bold gap-2 text-solar-text-body hover:bg-solar-bg-subtle"
            title="تحديث قائمة المدفوعات من السيرفر"
          >
            <RefreshCw class="size-4" :class="{ 'animate-spin': isRefreshing || pending || isLoading }" />
            <span>تحديث</span>
          </button>

          <button
            type="button"
            @click="exportPaymentsCsv"
            :disabled="!payments.length"
            class="btn-outline h-10 px-4 text-xs font-bold gap-2 text-solar-navy border-solar-navy/30 hover:bg-sky-50"
            title="تصدير كشف حساب المدفوعات"
          >
            <Download class="size-4" />
            <span>تصدير كشف المدفوعات (CSV)</span>
          </button>
        </div>
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
              placeholder="البحث برقم الطلب، المرجع، أو اسم العميل..."
              class="solar-input h-11 pr-10 text-xs w-full"
            />
            <Search class="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted" />
          </div>

          <div class="sm:col-span-3">
            <select v-model="selectedStatus" class="solar-input h-11 text-xs w-full font-bold">
              <option value="all">كل حالات الدفع</option>
              <option value="verified">تم التحقق (Verified)</option>
              <option value="pending">قيد المراجعة (Pending)</option>
              <option value="rejected">مرفوض (Rejected)</option>
            </select>
          </div>

          <div class="sm:col-span-3">
            <select v-model="selectedWallet" class="solar-input h-11 text-xs w-full font-bold">
              <option value="all">جميع طرق والمحافظ</option>
              <option v-for="w in uniqueWalletNames" :key="w" :value="w">{{ w }}</option>
            </select>
          </div>
        </div>

        <span class="text-xs font-bold text-solar-text-muted shrink-0">
          إجمالي المدفوعات المسجلة: <span class="text-solar-navy font-black">{{ payments.length }}</span> عملية
        </span>
      </div>

      <!-- حالة التحميل الأولي فقط -->
      <div v-if="(pending || isRefreshing) && payments.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 class="size-8 text-solar-navy animate-spin mb-3" />
        <p class="text-xs font-bold text-solar-text-muted">جاري تحميل سجلات المدفوعات من السيرفر...</p>
      </div>

      <!-- جدول مدفوعات العملاء -->
      <div v-else class="mt-6 overflow-x-auto rounded-xl border border-solar-border-card/80">
        <table class="w-full text-right text-xs">
          <thead class="bg-solar-bg-subtle/70 text-solar-text-muted font-bold border-b border-solar-border-card">
            <tr>
              <th class="py-3.5 px-4 font-bold">الطلب المرتبط</th>
              <th class="py-3.5 px-4 font-bold">العميل</th>
              <th class="py-3.5 px-4 font-bold">مزود المحفظة / طريقة الدفع</th>
              <th class="py-3.5 px-4 font-bold">مبلغ الدفع</th>
              <th class="py-3.5 px-4 font-bold font-mono">مرجع العملية</th>
              <th class="py-3.5 px-4 font-bold text-center">الإيصال</th>
              <th class="py-3.5 px-4 font-bold text-center">حالة الدفع</th>
              <th class="py-3.5 px-4 font-bold">تاريخ الدفع</th>
              <th class="py-3.5 px-4 font-bold text-center">إجراءات التحقق</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-solar-border-card/60">
            <tr
              v-for="item in visiblePayments"
              :key="item.id"
              class="transition-colors hover:bg-solar-bg-subtle/30"
            >
              <!-- الطلب المرتبط -->
              <td class="py-3.5 px-4 font-bold font-mono text-solar-navy-dark">
                #{{ item.order?.order_number || item.order_id }}
              </td>

              <!-- العميل -->
              <td class="py-3.5 px-4">
                <span class="font-extrabold text-solar-text-heading block">{{ item.order?.customer?.name || 'عميل مسجل' }}</span>
                <span class="text-[10px] text-solar-text-muted font-mono" dir="ltr">{{ item.order?.customer?.phone || '' }}</span>
              </td>

              <!-- مزود المحفظة -->
              <td class="py-3.5 px-4 font-bold text-solar-text-heading">
                <span class="inline-flex items-center gap-1.5 rounded-md bg-solar-bg-subtle px-2.5 py-1 text-xs border border-solar-border-card">
                  <CreditCard class="size-3 text-solar-navy" />
                  <span>{{ item.wallet_provider?.name_ar || item.wallet_provider?.name_en || item.wallet_provider_name || 'محفظة إلكترونية' }}</span>
                </span>
              </td>

              <!-- مبلغ الدفع -->
              <td class="py-3.5 px-4 font-black font-mono text-solar-text-heading text-sm">
                {{ Number(item.amount).toLocaleString() }} ر.ي
              </td>

              <!-- مرجع العملية -->
              <td class="py-3.5 px-4 font-mono text-xs text-solar-navy font-bold">
                {{ item.transaction_reference || '—' }}
              </td>

              <!-- صورة الإيصال -->
              <td class="py-3.5 px-4 text-center">
                <button
                  type="button"
                  @click="openReceiptModal(item)"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-solar-border-card bg-white px-2.5 py-1 text-xs font-bold text-solar-text-body hover:bg-solar-bg-subtle hover:border-solar-navy transition-colors shadow-2xs"
                >
                  <Paperclip class="size-3.5 text-solar-navy" />
                  <span>معاينة</span>
                </button>
              </td>

              <!-- حالة الدفع -->
              <td class="py-3.5 px-4 text-center">
                <AdminBadge :status="mapStatusToArabic(item.status)" />
              </td>

              <!-- تاريخ الدفع -->
              <td class="py-3.5 px-4 font-mono text-[11px] text-solar-text-muted" dir="ltr">
                {{ item.paid_at ? item.paid_at.slice(0, 16).replace('T', ' ') : item.created_at.slice(0, 10) }}
              </td>

              <!-- إجراءات التحقق المباشرة -->
              <td class="py-3.5 px-4 text-center">
                <div class="inline-flex items-center justify-center gap-1">
                  <!-- تأكيد وقبول الدفعة -->
                  <button
                    v-if="item.status !== 'verified'"
                    type="button"
                    @click="approvePayment(item)"
                    :disabled="isActionLoading"
                    class="size-8 inline-flex items-center justify-center rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 transition-colors border border-emerald-100"
                    title="تأكيد واعتماد الدفعة"
                  >
                    <Check class="size-4" />
                  </button>

                  <!-- رفض الدفعة -->
                  <button
                    v-if="item.status !== 'rejected'"
                    type="button"
                    @click="rejectPayment(item)"
                    :disabled="isActionLoading"
                    class="size-8 inline-flex items-center justify-center rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 transition-colors border border-rose-100"
                    title="رفض الدفعة"
                  >
                    <X class="size-4" />
                  </button>

                  <span v-if="item.status === 'verified'" class="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    معتمد
                  </span>
                </div>
              </td>
            </tr>

            <tr v-if="!filteredPayments.length">
              <td colspan="9" class="py-12 text-center text-solar-text-muted">
                لا توجد سجلات مدفوعات مطابقة لمعايير البحث الحالية.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- الترقيم والتقدم أسفل الجدول -->
      <AdminPagination
        v-model:current-page="currentPage"
        :total-pages="totalPages"
        :total-count="filteredPayments.length"
        :page-size="pageSize"
        item-name="دفعة مالية"
      />
    </div>

    <!-- نافذة معاينة إيصال الدفع البنكي -->
    <AdminModal
      v-model="isReceiptModalOpen"
      :title="`معاينة إيصال الدفع #${selectedPayment?.id || ''}`"
      subtitle="التحقق من إشعار السداد ومرجع العملية المرفقة من العميل"
      :icon="CreditCard"
      max-width="md"
    >
      <div v-if="selectedPayment" class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-3 p-3 rounded-xl bg-solar-bg-subtle text-xs border border-solar-border-card">
          <div>
            <span class="text-solar-text-muted block text-[11px]">رقم الطلب</span>
            <span class="font-mono font-bold text-solar-text-heading text-sm">#{{ selectedPayment.order?.order_number || selectedPayment.order_id }}</span>
          </div>
          <div>
            <span class="text-solar-text-muted block text-[11px]">مبلغ العملية</span>
            <span class="font-mono font-black text-solar-navy text-sm">{{ Number(selectedPayment.amount).toLocaleString() }} ر.ي</span>
          </div>
          <div>
            <span class="text-solar-text-muted block text-[11px]">المحفظة</span>
            <span class="font-bold text-solar-text-heading">{{ selectedPayment.wallet_provider?.name_ar || 'محفظة إلكترونية' }}</span>
          </div>
          <div>
            <span class="text-solar-text-muted block text-[11px]">المرجع</span>
            <span class="font-mono font-bold text-solar-text-heading">{{ selectedPayment.transaction_reference || '—' }}</span>
          </div>
        </div>

        <div class="p-4 rounded-xl border border-solar-border-card bg-slate-50 text-center">
          <p class="text-xs font-bold text-solar-text-muted mb-2">مستند إشعار التحويل البنكي:</p>
          <div class="inline-flex items-center justify-center p-6 bg-white border border-dashed border-slate-300 rounded-xl w-full">
            <div class="flex flex-col items-center text-slate-500">
              <Paperclip class="size-8 text-solar-navy mb-2" />
              <p class="font-mono text-xs font-bold">{{ selectedPayment.receipt_image || selectedPayment.receipt_path || 'receipts/default.jpg' }}</p>
              <p class="text-[10px] text-solar-text-muted mt-1">سند إلكتروني موثق في نظام الدفع</p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-solar-border-card">
          <div class="flex items-center gap-2">
            <button
              v-if="selectedPayment.status !== 'verified'"
              type="button"
              @click="approvePayment(selectedPayment); isReceiptModalOpen = false"
              class="btn-primary h-9 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              اعتماد الدفعة
            </button>
            <button
              v-if="selectedPayment.status !== 'rejected'"
              type="button"
              @click="rejectPayment(selectedPayment); isReceiptModalOpen = false"
              class="btn-outline h-9 px-4 text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              رفض الدفعة
            </button>
          </div>

          <button
            type="button"
            @click="isReceiptModalOpen = false"
            class="btn-outline h-9 px-4 text-xs font-bold"
          >
            إغلاق
          </button>
        </div>
      </div>
    </AdminModal>
  </div>
</template>
