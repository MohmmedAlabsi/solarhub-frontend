<script setup lang="ts">
import {
  Check,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  Download,
  FileText,
  Landmark,
  Loader2,
  Percent,
  Plus,
  RefreshCw,
  Search,
  Wallet,
  X,
} from 'lucide-vue-next'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import AdminPagination from '../../../components/admin/common/AdminPagination.vue'
import AdminModal from '../../../components/admin/common/AdminModal.vue'
import FinanceTabs from '../../../components/admin/finance/FinanceTabs.vue'
import type { StorePayout } from '../../../../types/api'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'الإدارة المالية — مستحقات الموردين | لوحة الإدارة العامة' })

const {
  payouts,
  isLoading,
  isActionLoading,
  fetchPayouts,
  updatePayoutStatus,
  eligiblePayouts,
  fetchEligiblePayouts,
  createPayout,
} = useAdminFinance()

onMounted(() => { fetchEligiblePayouts() })

// ===== إنشاء مستحقات لمورد (طلب فرعي أكّد العميل استلامه) =====
const isCreateModalOpen = ref(false)
const createOrderStoreId = ref<number | null>(null)
const createCommissionRate = ref<number | null>(null)
const createWalletId = ref<number | null>(null)
const createError = ref('')

const selectedEligible = computed(() => eligiblePayouts.value.find(e => e.order_store_id === createOrderStoreId.value) || null)
const createPreview = computed(() => {
  const e = selectedEligible.value
  const rate = Number(createCommissionRate.value)
  if (!e || createCommissionRate.value === null || Number.isNaN(rate)) return null
  const commission = Math.round(e.subtotal * rate) / 100
  return { commission, net: Math.round((e.subtotal - commission) * 100) / 100 }
})

watch(createOrderStoreId, () => {
  createWalletId.value = selectedEligible.value?.wallets.find(w => w.is_default)?.id ?? selectedEligible.value?.wallets[0]?.id ?? null
})

async function openCreateModal(orderStoreId?: number) {
  createError.value = ''
  createCommissionRate.value = null
  await fetchEligiblePayouts()
  createOrderStoreId.value = orderStoreId ?? eligiblePayouts.value[0]?.order_store_id ?? null
  isCreateModalOpen.value = true
}

async function handleCreatePayout() {
  createError.value = ''
  if (!createOrderStoreId.value) { createError.value = 'اختر الطلب الفرعي.'; return }
  const rate = Number(createCommissionRate.value)
  if (createCommissionRate.value === null || Number.isNaN(rate) || rate < 0 || rate > 100) {
    createError.value = 'أدخل نسبة عمولة المنصة بين 0 و100.'
    return
  }
  const res = await createPayout({ order_store_id: createOrderStoreId.value, commission_rate: rate, user_wallet_id: createWalletId.value })
  if (res.ok) isCreateModalOpen.value = false
  else createError.value = res.message || 'تعذر إنشاء المستحقات'
}

// Non-blocking lazy SSR Data Fetching
const { pending } = useLazyAsyncData('admin_finance_payouts', () => fetchPayouts(false), {
  default: () => payouts.value,
})

const isRefreshing = ref(false)
const searchQuery = ref('')
const selectedStatus = ref('all')
const currentPage = ref(1)
const pageSize = 10

// Payout Modal State
const isDisburseModalOpen = ref(false)
const selectedPayout = ref<StorePayout | null>(null)
const transferRefInput = ref('')

function mapPayoutStatusToArabic(status: string) {
  switch (status) {
    case 'completed': return 'مكتمل'
    case 'pending': return 'قيد الانتظار'
    case 'failed': return 'فشل الصرف'
    default: return 'قيد الانتظار'
  }
}

// Statistics computed dynamically from real database payouts
const totalEligibleAmount = computed(() => {
  return payouts.value.reduce((acc, p) => acc + Number(p.total_amount || 0), 0)
})

const totalCommissionAmount = computed(() => {
  return payouts.value.reduce((acc, p) => acc + Number(p.commission_amount || 0), 0)
})

const pendingPayoutsAmount = computed(() => {
  return payouts.value
    .filter(p => p.status === 'pending')
    .reduce((acc, p) => acc + Number(p.net_amount || 0), 0)
})

const completedPayoutsAmount = computed(() => {
  return payouts.value
    .filter(p => p.status === 'completed')
    .reduce((acc, p) => acc + Number(p.net_amount || 0), 0)
})

const filteredPayouts = computed(() => {
  return payouts.value.filter((item) => {
    const q = searchQuery.value.trim().toLowerCase()
    const storeName = item.order_store?.store?.company_name || item.store_name || ''
    const subOrderId = `SUB-${item.order_store_id}`
    const orderNum = item.order_store?.order?.order_number || ''
    const transferRef = item.transfer_reference || ''

    const matchesSearch =
      !q ||
      storeName.toLowerCase().includes(q) ||
      subOrderId.toLowerCase().includes(q) ||
      orderNum.toLowerCase().includes(q) ||
      transferRef.toLowerCase().includes(q)

    const matchesStatus =
      selectedStatus.value === 'all' || item.status === selectedStatus.value

    return matchesSearch && matchesStatus
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredPayouts.value.length / pageSize)))
const visiblePayouts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredPayouts.value.slice(start, start + pageSize)
})

watch([searchQuery, selectedStatus], () => {
  currentPage.value = 1
})

async function handleRefreshPayouts() {
  isRefreshing.value = true
  try {
    await fetchPayouts(true)
  } finally {
    isRefreshing.value = false
  }
}

function openDisburseModal(payout: StorePayout) {
  selectedPayout.value = payout
  // رقم المرجع يُدخله المدير من إشعار التحويل الفعلي (لا نولّد رقماً وهمياً)
  transferRefInput.value = payout.transfer_reference || ''
  isDisburseModalOpen.value = true
}

async function handleConfirmDisburse() {
  if (!selectedPayout.value) return
  await updatePayoutStatus(selectedPayout.value.id, 'completed', transferRefInput.value.trim())
  isDisburseModalOpen.value = false
}

async function handleMarkFailed(payout: StorePayout) {
  await updatePayoutStatus(payout.id, 'failed')
}

function exportPayoutsCsv() {
  if (!payouts.value.length) return
  const headers = ['رقم السجل', 'المتجر / المورد', 'الطلب الفرعي', 'إجمالي الطلب', 'نسبة العمولة (%)', 'مبلغ العمولة', 'صافي المستحق للمورد', 'الحالة', 'المرجع البنكي']
  const rows = payouts.value.map(p => [
    p.id,
    `"${(p.order_store?.store?.company_name || p.store_name || 'متجر معتمد').replace(/"/g, '""')}"`,
    `"SUB-${p.order_store_id}"`,
    p.total_amount,
    p.commission_rate,
    p.commission_amount,
    p.net_amount,
    `"${mapPayoutStatusToArabic(p.status)}"`,
    `"${(p.transfer_reference || '—').replace(/"/g, '""')}"`,
  ])

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `solarhub-payouts-${new Date().toISOString().slice(0, 10)}.csv`)
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
            متابعة وإدارة مدفوعات العملاء، مستحقات الموردين، وإعدادات الضرائب والعمليات المالية.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            data-testid="create-payout-btn"
            class="btn-primary h-10 px-4 text-xs font-bold gap-2"
            :disabled="!eligiblePayouts.length"
            :title="eligiblePayouts.length ? 'إنشاء مستحقات لطلب أكّد العميل استلامه' : 'لا توجد طلبات مكتملة بانتظار إنشاء مستحقات'"
            @click="openCreateModal()"
          >
            <Plus class="size-4" />
            <span>إنشاء مستحقات</span>
            <span v-if="eligiblePayouts.length" class="rounded-full bg-white/80 px-2 text-[11px] font-black text-solar-navy-dark">{{ eligiblePayouts.length }}</span>
          </button>

          <button
            type="button"
            @click="handleRefreshPayouts(); fetchEligiblePayouts()"
            :disabled="isRefreshing || pending || isLoading"
            class="btn-outline h-10 px-4 text-xs font-bold gap-2 text-solar-text-body hover:bg-solar-bg-subtle"
            title="تحديث قائمة المستحقات من السيرفر"
          >
            <RefreshCw class="size-4" :class="{ 'animate-spin': isRefreshing || pending || isLoading }" />
            <span>تحديث</span>
          </button>

          <button
            type="button"
            @click="exportPayoutsCsv"
            :disabled="!payouts.length"
            class="btn-outline h-10 px-4 text-xs font-bold gap-2 text-solar-navy border-solar-navy/30 hover:bg-sky-50"
            title="تصدير كشف حساب المستحقات"
          >
            <Download class="size-4" />
            <span>تصدير كشف المستحقات (CSV)</span>
          </button>
        </div>
      </div>

      <!-- كروت الإحصائيات الأربعة العلوية لمستحقات الموردين (بيانات حقيقية من قاعدة البيانات) -->
      <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <!-- كارد 1 -->
        <div class="rounded-2xl border border-solar-border-card bg-white p-5 shadow-2xs">
          <div class="flex items-center justify-between text-xs text-solar-text-muted mb-2">
            <span>إجمالي مبالغ الطلبات المؤهلة</span>
            <FileText class="size-4 text-solar-navy" />
          </div>
          <div class="text-xl sm:text-2xl font-black text-solar-text-heading font-mono">
            {{ totalEligibleAmount.toLocaleString() }} <span class="text-xs font-bold">ر.ي</span>
          </div>
          <p class="mt-2 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <span>مجموع مبيعات المتاجر النشطة</span>
          </p>
        </div>

        <!-- كارد 2 -->
        <div class="rounded-2xl border border-solar-border-card bg-white p-5 shadow-2xs">
          <div class="flex items-center justify-between text-xs text-solar-text-muted mb-2">
            <span>عمولة المنصة المحتسبة (5%)</span>
            <Percent class="size-4 text-amber-600" />
          </div>
          <div class="text-xl sm:text-2xl font-black text-solar-text-heading font-mono">
            {{ totalCommissionAmount.toLocaleString() }} <span class="text-xs font-bold">ر.ي</span>
          </div>
          <p class="mt-2 text-[11px] text-solar-text-muted">
            إيراد منصة سولار هب المحقق
          </p>
        </div>

        <!-- كارد 3 -->
        <div class="rounded-2xl border border-solar-border-card bg-white p-5 shadow-2xs">
          <div class="flex items-center justify-between text-xs text-solar-text-muted mb-2">
            <span>مستحقات قيد الانتظار</span>
            <Clock class="size-4 text-amber-500" />
          </div>
          <div class="text-xl sm:text-2xl font-black text-amber-700 font-mono">
            {{ pendingPayoutsAmount.toLocaleString() }} <span class="text-xs font-bold">ر.ي</span>
          </div>
          <p class="mt-2 text-[11px] font-bold text-amber-700">
            تتطلب اعتماد الصرف المالي
          </p>
        </div>

        <!-- كارد 4 -->
        <div class="rounded-2xl border border-solar-border-card bg-white p-5 shadow-2xs">
          <div class="flex items-center justify-between text-xs text-solar-text-muted mb-2">
            <span>تم صرفه وتحويله للموردين</span>
            <CheckCircle2 class="size-4 text-emerald-600" />
          </div>
          <div class="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
            {{ completedPayoutsAmount.toLocaleString() }} <span class="text-xs font-bold">ر.ي</span>
          </div>
          <p class="mt-2 text-[11px] text-emerald-700 font-bold">
            تسويات مكتملة وموثقة برقم مرجعي
          </p>
        </div>
      </div>

      <!-- تبويبات الإدارة المالية -->
      <div class="mt-8">
        <FinanceTabs />
      </div>

      <!-- فلاتر البحث ومحفظة البنك -->
      <div class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="grid w-full gap-3 sm:grid-cols-12 flex-1">
          <div class="relative sm:col-span-8">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="البحث باسم المتجر، رقم الطلب الفرعي، أو المرجع..."
              class="solar-input h-11 pr-10 text-xs w-full"
            />
            <Search class="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted" />
          </div>

          <div class="sm:col-span-4">
            <select v-model="selectedStatus" class="solar-input h-11 text-xs w-full font-bold">
              <option value="all">كل حالات الصرف</option>
              <option value="completed">مكتمل (Completed)</option>
              <option value="pending">قيد الانتظار (Pending)</option>
              <option value="failed">فشل الصرف (Failed)</option>
            </select>
          </div>
        </div>

        <span class="text-xs font-bold text-solar-text-muted shrink-0">
          إجمالي المستحقات: <span class="text-solar-navy font-black">{{ payouts.length }}</span> سجل
        </span>
      </div>

      <!-- حالة التحميل الأولي فقط -->
      <div v-if="(pending || isRefreshing) && payouts.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 class="size-8 text-solar-navy animate-spin mb-3" />
        <p class="text-xs font-bold text-solar-text-muted">جاري تحميل مستحقات الموردين من السيرفر...</p>
      </div>

      <!-- جدول مستحقات الموردين -->
      <div v-else class="mt-6 overflow-x-auto rounded-xl border border-solar-border-card/80">
        <table class="w-full text-right text-xs">
          <thead class="bg-solar-bg-subtle/70 text-solar-text-muted font-bold border-b border-solar-border-card">
            <tr>
              <th class="py-3.5 px-4 font-bold">المتجر / المورد</th>
              <th class="py-3.5 px-4 font-bold">الطلب الفرعي</th>
              <th class="py-3.5 px-4 font-bold">محفظة الاستلام</th>
              <th class="py-3.5 px-4 font-bold">إجمالي المبيعات</th>
              <th class="py-3.5 px-4 font-bold">العمولة ({{ payouts[0]?.commission_rate || 5 }}%)</th>
              <th class="py-3.5 px-4 font-bold">الصافي للمورد</th>
              <th class="py-3.5 px-4 font-bold text-center">حالة الصرف</th>
              <th class="py-3.5 px-4 font-bold">مرجع التحويل</th>
              <th class="py-3.5 px-4 font-bold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-solar-border-card/60">
            <tr
              v-for="item in visiblePayouts"
              :key="item.id"
              class="transition-colors hover:bg-solar-bg-subtle/30"
            >
              <!-- المتجر / المورد -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-2.5">
                  <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-solar-navy text-white text-xs font-bold">
                    {{ (item.order_store?.store?.company_name || item.store_name || 'م')[0] }}
                  </div>
                  <div>
                    <span class="font-extrabold text-solar-text-heading block">
                      {{ item.order_store?.store?.company_name || item.store_name || 'متجر معتمد' }}
                    </span>
                    <span class="text-[10px] text-solar-text-muted font-mono" dir="ltr">
                      {{ item.order_store?.store?.commercial_registry || '' }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- الطلب الفرعي -->
              <td class="py-3.5 px-4 font-mono font-bold text-solar-navy-dark">
                SUB-{{ item.order_store_id }}
                <span v-if="item.order_store?.order?.order_number" class="block text-[10px] text-solar-text-muted font-mono">
                  #{{ item.order_store.order.order_number }}
                </span>
              </td>

              <!-- محفظة الاستلام -->
              <td class="py-3.5 px-4">
                <div class="flex flex-col gap-0.5">
                  <span class="font-bold text-solar-text-heading flex items-center gap-1">
                    <Wallet class="size-3 text-solar-navy" />
                    <span>{{ item.user_wallet?.wallet_provider?.name_ar || 'محفظة جوالي' }}</span>
                  </span>
                  <span class="text-[10px] font-mono text-solar-text-muted" dir="ltr">
                    {{ item.user_wallet?.account_number || '770000000' }} ({{ item.user_wallet?.account_name || 'حساب المتجر' }})
                  </span>
                </div>
              </td>

              <!-- إجمالي المبيعات -->
              <td class="py-3.5 px-4 font-black font-mono text-solar-text-heading">
                {{ Number(item.total_amount).toLocaleString() }} ر.ي
              </td>

              <!-- العمولة -->
              <td class="py-3.5 px-4 font-mono text-amber-700 font-bold">
                {{ Number(item.commission_amount).toLocaleString() }} ر.ي
              </td>

              <!-- الصافي للمورد -->
              <td class="py-3.5 px-4 font-black font-mono text-emerald-700 text-sm">
                {{ Number(item.net_amount).toLocaleString() }} ر.ي
              </td>

              <!-- حالة الصرف -->
              <td class="py-3.5 px-4 text-center">
                <AdminBadge :status="mapPayoutStatusToArabic(item.status)" />
              </td>

              <!-- مرجع التحويل -->
              <td class="py-3.5 px-4 font-mono text-xs text-solar-text-muted">
                {{ item.transfer_reference || 'قيد المعالجة' }}
              </td>

              <!-- الإجراءات -->
              <td class="py-3.5 px-4 text-center">
                <div class="inline-flex items-center justify-center gap-1">
                  <!-- صرف المستحقات -->
                  <button
                    v-if="item.status !== 'completed'"
                    type="button"
                    @click="openDisburseModal(item)"
                    :disabled="isActionLoading"
                    class="btn-primary h-8 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                  >
                    <Check class="size-3.5" />
                    <span>اعتماد الصرف</span>
                  </button>

                  <span v-else class="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    تم الصرف
                  </span>
                </div>
              </td>
            </tr>

            <tr v-if="!filteredPayouts.length">
              <td colspan="9" class="py-12 text-center text-solar-text-muted">
                لا توجد مستحقات موردين مطابقة لمعايير البحث الحالية.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- الترقيم والتقدم أسفل الجدول -->
      <AdminPagination
        v-model:current-page="currentPage"
        :total-pages="totalPages"
        :total-count="filteredPayouts.length"
        :page-size="pageSize"
        item-name="مستحق مورد"
      />
    </div>

    <!-- نافذة إنشاء مستحقات لمورد -->
    <AdminModal
      v-model="isCreateModalOpen"
      title="إنشاء مستحقات للمورد"
      subtitle="لطلب فرعي أكّد العميل استلامه. العمولة والصافي يحسبهما الخادم من إجمالي الطلب."
      :icon="Coins"
      max-width="md"
      :busy="isActionLoading"
    >
      <form class="flex flex-col gap-4" data-testid="create-payout-form" @submit.prevent="handleCreatePayout">
        <label class="flex flex-col gap-1.5 text-xs font-bold text-solar-text-body">
          الطلب الفرعي المكتمل *
          <select v-model="createOrderStoreId" class="solar-input h-11 text-xs w-full">
            <option v-for="e in eligiblePayouts" :key="e.order_store_id" :value="e.order_store_id">
              {{ e.order_number || `SUB-${e.order_store_id}` }} — {{ e.store_name }} — {{ e.subtotal.toLocaleString('ar-YE') }} ر.ي{{ e.previous_payout_failed ? ' (إعادة بعد فشل)' : '' }}
            </option>
          </select>
        </label>

        <label class="flex flex-col gap-1.5 text-xs font-bold text-solar-text-body">
          نسبة عمولة المنصة (%) *
          <input v-model.number="createCommissionRate" type="number" min="0" max="100" step="0.01" required dir="ltr" class="solar-input h-11 text-xs w-full font-mono text-left" placeholder="مثال: 5" />
        </label>

        <label class="flex flex-col gap-1.5 text-xs font-bold text-solar-text-body">
          محفظة التحويل
          <select v-model="createWalletId" class="solar-input h-11 text-xs w-full" :disabled="!selectedEligible?.wallets.length">
            <option v-if="!selectedEligible?.wallets.length" :value="null">لم يُضف المورد أي محفظة فعّالة</option>
            <option v-for="w in selectedEligible?.wallets || []" :key="w.id" :value="w.id">
              {{ w.provider || 'محفظة' }} — {{ w.account_name }} — ****{{ w.account_last4 }}{{ w.is_default ? ' (الافتراضية)' : '' }}
            </option>
          </select>
        </label>

        <div v-if="selectedEligible" class="p-4 rounded-xl bg-solar-bg-subtle border border-solar-border-card text-xs flex flex-col gap-2" data-testid="create-payout-preview">
          <div class="flex items-center justify-between">
            <span class="text-solar-text-muted">إجمالي الطلب الفرعي:</span>
            <span class="font-bold font-mono">{{ selectedEligible.subtotal.toLocaleString('ar-YE') }} ر.ي</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-solar-text-muted">عمولة المنصة:</span>
            <span class="font-bold font-mono">{{ createPreview ? createPreview.commission.toLocaleString('ar-YE') + ' ر.ي' : '—' }}</span>
          </div>
          <div class="flex items-center justify-between border-t border-solar-border-card/60 pt-2 font-black text-sm">
            <span>صافي المستحق للمورد:</span>
            <span class="text-emerald-700 font-mono">{{ createPreview ? createPreview.net.toLocaleString('ar-YE') + ' ر.ي' : '—' }}</span>
          </div>
        </div>

        <p v-if="createError" class="text-xs font-bold text-red-600" role="alert">{{ createError }}</p>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-solar-border-card mt-2">
          <button type="button" class="btn-outline h-10 px-5 text-xs font-bold" :disabled="isActionLoading" @click="isCreateModalOpen = false">إلغاء</button>
          <button type="submit" class="btn-primary h-10 px-6 text-xs font-bold gap-2" :disabled="isActionLoading || !createOrderStoreId">
            <Loader2 v-if="isActionLoading" class="size-4 animate-spin" />
            <span>إنشاء المستحقات</span>
          </button>
        </div>
      </form>
    </AdminModal>

    <!-- نافذة تأكيد واعتماد صرف المستحقات للمورد -->
    <AdminModal
      v-model="isDisburseModalOpen"
      :title="`اعتماد صرف مستحقات #${selectedPayout?.id || ''}`"
      subtitle="تأكيد التحويل البنكي وتوثيق رقم المرجع الحسابي"
      :icon="Landmark"
      max-width="md"
    >
      <form v-if="selectedPayout" @submit.prevent="handleConfirmDisburse" class="flex flex-col gap-4">
        <div class="p-4 rounded-xl bg-solar-bg-subtle border border-solar-border-card text-xs flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="text-solar-text-muted">المتجر المستفيد:</span>
            <span class="font-bold text-solar-text-heading">{{ selectedPayout.order_store?.store?.company_name || selectedPayout.store_name }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-solar-text-muted">محفظة التحويل:</span>
            <span class="font-mono font-bold text-solar-navy">{{ selectedPayout.user_wallet ? `${selectedPayout.user_wallet.wallet_provider?.name_ar || 'محفظة'} - ${selectedPayout.user_wallet.account_number}` : 'لا توجد محفظة محددة للمورد' }}</span>
          </div>
          <div class="flex items-center justify-between border-t border-solar-border-card/60 pt-2 font-black text-sm">
            <span>صافي المبلغ المحول:</span>
            <span class="text-emerald-700 font-mono">{{ Number(selectedPayout.net_amount).toLocaleString() }} ر.ي</span>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">رقم مرجع الحوالة / إشعار الصرف *</label>
          <input
            v-model="transferRefInput"
            type="text"
            required
            dir="ltr"
            placeholder="مثال: TRX-8831092"
            class="solar-input h-11 text-xs w-full font-mono text-left"
          />
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-solar-border-card mt-2">
          <button
            type="button"
            @click="isDisburseModalOpen = false"
            :disabled="isActionLoading"
            class="btn-outline h-10 px-5 text-xs font-bold"
          >
            إلغاء
          </button>
          <button
            type="submit"
            :disabled="isActionLoading"
            class="btn-primary h-10 px-6 text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
          >
            <Loader2 v-if="isActionLoading" class="size-4 animate-spin" />
            <span>تأكيد الصرف</span>
          </button>
        </div>
      </form>
    </AdminModal>
  </div>
</template>
