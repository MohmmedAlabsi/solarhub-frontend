<script setup lang="ts">
import {
  CheckCircle2,
  Clock,
  Coins,
  Download,
  FileText,
  Landmark,
  Percent,
  RefreshCw,
  Search,
} from 'lucide-vue-next'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import AdminPagination from '../../../components/admin/common/AdminPagination.vue'
import FinanceTabs from '../../../components/admin/finance/FinanceTabs.vue'
import type { AdminPayout } from '../../../../types/admin'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'الإدارة المالية — مستحقات الموردين | لوحة الإدارة العامة' })

const searchQuery = ref('')
const selectedStatus = ref('all')
const currentPage = ref(1)

const payouts = ref<AdminPayout[]>([
  {
    id: '1',
    subOrderId: 'SUB-9021',
    storeName: 'شركة شمس الرياض',
    storeInitials: 'ش',
    bankAccount: {
      bankName: 'بنك الرياض',
      accountType: 'حساب مؤسسي',
      iban: 'SA82 2000 **** 9102',
    },
    totalAmount: 18400.0,
    commissionRate: 2.5,
    commissionAmount: 460.0,
    netAmount: 17940.0,
    payoutStatus: 'مكتمل',
    transferRef: 'TRF-88310',
    payoutDate: '2025-05-14',
  },
  {
    id: '2',
    subOrderId: 'SUB-9018',
    storeName: 'طاقة الصحراء المتقدمة',
    storeInitials: 'ط',
    bankAccount: {
      bankName: 'مصرف الراجحي',
      accountType: 'حساب جاري',
      iban: 'SA44 8000 **** 4410',
    },
    totalAmount: 6250.0,
    commissionRate: 2.5,
    commissionAmount: 156.25,
    netAmount: 6093.75,
    payoutStatus: 'قيد الانتظار',
  },
  {
    id: '3',
    subOrderId: 'SUB-9014',
    storeName: 'مجموعة الأمانة الكهروضوئية',
    storeInitials: 'أ',
    bankAccount: {
      bankName: 'الأهلي التجاري (SNB)',
      accountType: 'حساب أعمال',
      iban: 'SA19 1000 **** 7731',
    },
    totalAmount: 34100.0,
    commissionRate: 2.5,
    commissionAmount: 852.5,
    netAmount: 33247.5,
    payoutStatus: 'قيد الانتظار',
  },
  {
    id: '4',
    subOrderId: 'SUB-9009',
    storeName: 'نيرات الحلول للطاقة',
    storeInitials: 'ن',
    bankAccount: {
      bankName: 'STC Pay أعمال',
      accountType: 'محفظة أعمال',
      iban: '050519****',
    },
    totalAmount: 9800.0,
    commissionRate: 2.5,
    commissionAmount: 245.0,
    netAmount: 9555.0,
    payoutStatus: 'مكتمل',
    transferRef: 'TRF-88102',
    payoutDate: '2025-05-12',
  },
  {
    id: '5',
    subOrderId: 'SUB-8995',
    storeName: 'المتجر السعودي للبطاريات',
    storeInitials: 'س',
    bankAccount: {
      bankName: 'مصرف الراجحي',
      accountType: 'IBAN غير مطابق مع الاسم',
      iban: 'SA44 8000 **** 1290',
    },
    totalAmount: 14500.0,
    commissionRate: 2.5,
    commissionAmount: 362.5,
    netAmount: 14137.5,
    payoutStatus: 'فشل الصرف',
  },
  {
    id: '6',
    subOrderId: 'SUB-8982',
    storeName: 'تقنيات الهجين للتوليد',
    storeInitials: 'هـ',
    bankAccount: {
      bankName: 'الأهلي التجاري (SNB)',
      accountType: 'حساب مؤسسي',
      iban: 'SA03 1000 **** 8812',
    },
    totalAmount: 4200.0,
    commissionRate: 2.5,
    commissionAmount: 105.0,
    netAmount: 4095.0,
    payoutStatus: 'مكتمل',
    transferRef: 'TRF-87991',
    payoutDate: '2025-05-10',
  },
])

const filteredPayouts = computed(() => {
  return payouts.value.filter((item) => {
    const matchesSearch =
      !searchQuery.value ||
      item.subOrderId.includes(searchQuery.value) ||
      item.storeName.includes(searchQuery.value)

    const matchesStatus =
      selectedStatus.value === 'all' || item.payoutStatus === selectedStatus.value

    return matchesSearch && matchesStatus
  })
})
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

      <!-- كروت الإحصائيات الأربعة العلوية لمستحقات الموردين -->
      <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <!-- كارد 1 -->
        <div class="rounded-2xl border border-solar-border-card bg-white p-5 shadow-2xs">
          <div class="flex items-center justify-between text-xs text-solar-text-muted mb-2">
            <span>إجمالي مبالغ الطلبات المؤهلة</span>
            <FileText class="size-4 text-solar-navy" />
          </div>
          <div class="text-xl sm:text-2xl font-black text-solar-text-heading font-mono">
            87,450.00 <span class="text-xs font-bold">ر.س</span>
          </div>
          <p class="mt-2 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <span>↑ 14.2%+</span> مقارنة بالأسبوع الماضي
          </p>
        </div>

        <!-- كارد 2 -->
        <div class="rounded-2xl border border-solar-border-card bg-white p-5 shadow-2xs">
          <div class="flex items-center justify-between text-xs text-solar-text-muted mb-2">
            <span>عمولة المنصة المحتسبة (2.5%)</span>
            <Percent class="size-4 text-amber-600" />
          </div>
          <div class="text-xl sm:text-2xl font-black text-solar-text-heading font-mono">
            2,186.25 <span class="text-xs font-bold">ر.س</span>
          </div>
          <p class="mt-2 text-[11px] text-solar-text-muted">
            إيراد تحصيلي غير مسترد
          </p>
        </div>

        <!-- كارد 3 -->
        <div class="rounded-2xl border border-solar-border-card bg-white p-5 shadow-2xs">
          <div class="flex items-center justify-between text-xs text-solar-text-muted mb-2">
            <span>مستحقات قيد الانتظار</span>
            <Clock class="size-4 text-amber-500" />
          </div>
          <div class="text-xl sm:text-2xl font-black text-amber-700 font-mono">
            47,385.00 <span class="text-xs font-bold">ر.س</span>
          </div>
          <p class="mt-2 text-[11px] font-bold text-amber-700">
            تتطلب اعتماد الصرف البنكي (2 موردين)
          </p>
        </div>

        <!-- كارد 4 -->
        <div class="rounded-2xl border border-solar-border-card bg-white p-5 shadow-2xs">
          <div class="flex items-center justify-between text-xs text-solar-text-muted mb-2">
            <span>تم تحويله هذا الشهر</span>
            <CheckCircle2 class="size-4 text-emerald-600" />
          </div>
          <div class="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
            37,878.75 <span class="text-xs font-bold">ر.س</span>
          </div>
          <p class="mt-2 text-[11px] text-emerald-700 font-bold">
            تسوية 3 دفعات بدون نزاعات
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
          <div class="relative sm:col-span-6">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="البحث برقم الطلب الفرعي أو المورد..."
              class="solar-input h-11 pr-10 text-xs"
            />
            <Search class="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted" />
          </div>

          <div class="sm:col-span-3">
            <select v-model="selectedStatus" class="solar-input h-11 text-xs">
              <option value="all">كل حالات الصرف</option>
              <option value="مكتمل">مكتمل</option>
              <option value="قيد الانتظار">قيد الانتظار</option>
              <option value="فشل الصرف">فشل الصرف</option>
            </select>
          </div>

          <div class="sm:col-span-3">
            <button
              type="button"
              class="solar-input h-11 text-xs flex items-center justify-between bg-white cursor-pointer"
            >
              <span class="flex items-center gap-1.5 text-solar-text-body">
                <Landmark class="size-4 text-solar-text-muted" />
                المحفظة / الحساب البنكي
              </span>
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <button
            type="button"
            class="flex size-10 items-center justify-center rounded-xl border border-solar-border-card text-solar-text-muted hover:bg-solar-bg-subtle transition-colors"
            title="تحديث البيانات"
          >
            <RefreshCw class="size-4" />
          </button>
          <span class="text-xs font-bold text-solar-text-muted">
            إجمالي المستحقات: <span class="text-solar-navy font-black">{{ filteredPayouts.length }}</span> مسجلة
          </span>
        </div>
      </div>

      <!-- جدول مستحقات الموردين -->
      <div class="mt-6 overflow-x-auto rounded-xl border border-solar-border-card/80">
        <table class="w-full text-right text-xs">
          <thead class="bg-solar-bg-subtle/70 text-solar-text-muted font-bold border-b border-solar-border-card">
            <tr>
              <th class="py-3.5 px-4 font-bold">الطلب الفرعي / المتجر</th>
              <th class="py-3.5 px-4 font-bold">المحفظة المستخدمة للتحويل</th>
              <th class="py-3.5 px-4 font-bold">إجمالي المبلغ</th>
              <th class="py-3.5 px-4 font-bold">نسبة العمولة</th>
              <th class="py-3.5 px-4 font-bold">مبلغ العمولة</th>
              <th class="py-3.5 px-4 font-bold">صافي المستحق</th>
              <th class="py-3.5 px-4 font-bold text-center">حالة الصرف</th>
              <th class="py-3.5 px-4 font-bold">مرجع التحويل</th>
              <th class="py-3.5 px-4 font-bold">تاريخ الصرف</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-solar-border-card/60">
            <tr
              v-for="item in filteredPayouts"
              :key="item.id"
              class="transition-colors hover:bg-solar-bg-subtle/30"
            >
              <!-- المتجر والطلب الفرعي -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-solar-bg-subtle text-solar-navy-dark font-black text-xs border border-solar-border-card">
                    {{ item.storeInitials }}
                  </div>
                  <div>
                    <p class="font-extrabold text-solar-text-heading">{{ item.storeName }}</p>
                    <p class="text-[10px] text-solar-text-muted font-mono">{{ item.subOrderId }}</p>
                  </div>
                </div>
              </td>

              <!-- الحساب البنكي -->
              <td class="py-3.5 px-4">
                <div>
                  <p class="font-bold text-solar-text-heading flex items-center gap-1">
                    <Landmark class="size-3.5 text-solar-navy" />
                    {{ item.bankAccount.bankName }}
                  </p>
                  <p class="text-[10px] text-solar-text-muted font-mono">{{ item.bankAccount.iban }}</p>
                  <span v-if="item.bankAccount.accountType.includes('غير مطابق')" class="text-[9px] font-bold text-rose-600 block">
                    {{ item.bankAccount.accountType }}
                  </span>
                </div>
              </td>

              <!-- إجمالي المبلغ -->
              <td class="py-3.5 px-4 font-black font-mono text-solar-text-heading">
                {{ item.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) }} ر.س
              </td>

              <!-- نسبة العمولة -->
              <td class="py-3.5 px-4 font-bold text-solar-text-body font-mono">
                {{ item.commissionRate }}%
              </td>

              <!-- مبلغ العمولة -->
              <td class="py-3.5 px-4 font-mono text-solar-text-muted">
                {{ item.commissionAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) }} ر.س
              </td>

              <!-- صافي المستحق -->
              <td class="py-3.5 px-4 font-black font-mono text-emerald-700 text-sm">
                {{ item.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) }} ر.س
              </td>

              <!-- حالة الصرف -->
              <td class="py-3.5 px-4 text-center">
                <AdminBadge :status="item.payoutStatus" />
              </td>

              <!-- مرجع التحويل -->
              <td class="py-3.5 px-4 font-mono text-solar-text-body">
                {{ item.transferRef || '—' }}
              </td>

              <!-- تاريخ الصرف -->
              <td class="py-3.5 px-4 font-mono text-solar-text-muted text-[11px] whitespace-nowrap">
                {{ item.payoutDate || '—' }}
              </td>
            </tr>

            <tr v-if="!filteredPayouts.length">
              <td colspan="9" class="py-12 text-center text-solar-text-muted">
                لا توجد مستحقات مطابقة لخيارات الفرز.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- الترقيم والتقدم أسفل الجدول -->
      <AdminPagination
        v-model:current-page="currentPage"
        :total-pages="5"
        :total-count="28"
        :page-size="6"
        item-name="عملية تسوية وصرف للموردين"
      />
    </div>
  </div>
</template>
