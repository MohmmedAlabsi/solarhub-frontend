<script setup lang="ts">
import {
  Download,
  Loader2,
  RefreshCw,
  Search,
  Star,
  Store,
  UserRoundCog,
} from 'lucide-vue-next'
import AdminSectionHeading from '../../../components/admin/workspace/AdminSectionHeading.vue'
import AdminPagination from '../../../components/admin/common/AdminPagination.vue'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import type { AdminReview } from '../../../../types/admin'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة التقييمات والمراجعات | SolarHub' })

const {
  supplierReviews,
  engineerReviews,
  isLoading,
  isActionLoading,
  fetchSupplierReviews,
  fetchEngineerReviews,
  toggleSupplierReview,
  toggleEngineerReview,
} = useAdminReviews()

const { notify } = useAdminNotice()
const route = useRoute()
const query = ref('')

const activeTab = computed(() => (route.query.tab === 'engineers' ? 'engineers' : 'suppliers'))

// جلب متزامن لكلا النوعين من التقييمات
const { pending } = useLazyAsyncData('admin_reviews_fetch', async () => {
  await Promise.allSettled([
    fetchSupplierReviews(false),
    fetchEngineerReviews(false),
  ])
  return true
})

const isRefreshing = ref(false)
async function handleRefresh() {
  isRefreshing.value = true
  try {
    if (activeTab.value === 'suppliers') {
      await fetchSupplierReviews(true)
    } else {
      await fetchEngineerReviews(true)
    }
    notify('تم تحديث قائمة التقييمات بنجاح من الخادم.')
  } finally {
    isRefreshing.value = false
  }
}

// الجداول التفاعلية عبر useAdminTable
const suppliersTable = useAdminTable(
  () => supplierReviews.value,
  r => adminMatches(query.value, r.orderId, r.client, r.targetName || ''),
  () => [query.value],
  15
)

const engineersTable = useAdminTable(
  () => engineerReviews.value,
  r => adminMatches(query.value, r.orderId, r.client, r.targetName || ''),
  () => [query.value],
  15
)

const table = computed(() => (activeTab.value === 'suppliers' ? suppliersTable : engineersTable))
const rows = computed(() => table.value.rows.value)

async function selectTab(tab: 'suppliers' | 'engineers') {
  await navigateTo({
    path: route.path,
    query: { ...route.query, tab },
    hash: route.hash,
  })
}

function handleToggleApproval(review: AdminReview) {
  if (activeTab.value === 'suppliers') {
    toggleSupplierReview(review)
  } else {
    toggleEngineerReview(review)
  }
}

function exportCsv() {
  const isSuppliers = activeTab.value === 'suppliers'
  const list = isSuppliers ? suppliersTable.filtered.value : engineersTable.filtered.value
  downloadAdminCsv(
    isSuppliers ? 'تقييمات_المتاجر' : 'تقييمات_المهندسين',
    [
      isSuppliers ? 'رقم الطلب' : 'رقم طلب الخدمة',
      'العميل',
      isSuppliers ? 'المتجر' : 'المهندس',
      'التقييم',
      'التعليق',
      'حالة الاعتماد',
    ],
    list.map(r => [
      `#${r.orderId}`,
      r.client,
      r.targetName || r.targetId,
      `${r.score}/5`,
      r.comment,
      r.approved ? 'معتمد' : 'غير معتمد',
    ])
  )
}
</script>

<template>
  <div class="admin-managed">
    <div class="flex flex-col justify-between gap-4 border-b border-solar-border-card pb-3 lg:flex-row lg:items-end">
      <AdminSectionHeading
        title="إدارة التقييمات والمراجعات"
        description="عرض ومراجعة تقييمات العملاء للمتاجر والموردين والمهندسين الاستشاريين واعتماد ظهورها."
      >
        <button
          class="btn-outline"
          :disabled="isRefreshing || pending"
          @click="handleRefresh"
        >
          <RefreshCw class="size-4" :class="isRefreshing ? 'animate-spin' : ''" />
          تحديث
        </button>
        <button class="btn-outline" @click="exportCsv">
          <Download class="size-4" />
          تصدير القائمة
        </button>
      </AdminSectionHeading>

      <div class="admin-search w-full lg:max-w-sm">
        <Search />
        <input
          v-model="query"
          type="search"
          aria-label="البحث في التقييمات"
          class="solar-input !bg-white"
          placeholder="ابحث برقم الطلب، اسم العميل، المتجر، أو المهندس..."
        />
      </div>
    </div>

    <!-- تبويبات نوع التقييم -->
    <nav class="-mt-3 flex flex-wrap border-b border-solar-border-card" aria-label="تبويبات التقييمات">
      <button
        v-for="tab in (['suppliers', 'engineers'] as const)"
        :key="tab"
        class="inline-flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-solar-yellow cursor-pointer"
        :class="
          activeTab === tab
            ? 'border-solar-yellow font-bold text-solar-navy'
            : 'border-transparent text-solar-text-muted hover:text-solar-navy'
        "
        :aria-current="activeTab === tab ? 'page' : undefined"
        @click="selectTab(tab)"
      >
        <component :is="tab === 'suppliers' ? Store : UserRoundCog" class="size-4" />
        <span>{{ tab === 'suppliers' ? 'تقييمات المتاجر والموردين' : 'تقييمات المهندسين الاستشاريين' }}</span>
        <span
          class="rounded-full px-2 py-0.5 text-xs font-bold"
          :class="activeTab === tab ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'"
        >
          {{ tab === 'suppliers' ? supplierReviews.length : engineerReviews.length }}
        </span>
      </button>
    </nav>

    <!-- مؤشر التحميل -->
    <div v-if="pending || isLoading" class="flex flex-col items-center justify-center py-16">
      <Loader2 class="size-8 animate-spin text-solar-yellow mb-2" />
      <span class="text-xs text-solar-text-muted">جاري تحميل التقييمات من قاعدة البيانات...</span>
    </div>

    <!-- جدول التقييمات -->
    <div v-else class="admin-table-wrap">
      <table class="min-w-[850px]">
        <thead>
          <tr>
            <th>{{ activeTab === 'suppliers' ? 'الطلب المرتبط' : 'طلب الخدمة المرتبط' }}</th>
            <th>العميل</th>
            <th>{{ activeTab === 'suppliers' ? 'المتجر / المورد' : 'المهندس الاستشاري' }}</th>
            <th>التقييم</th>
            <th>نص التقييم والملاحظات</th>
            <th>حالة الاعتماد</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="review in rows" :key="review.id">
            <td class="font-bold whitespace-nowrap">
              <bdi class="text-solar-navy">#{{ review.orderId }}</bdi>
            </td>
            <td>
              <span class="flex min-w-32 items-center gap-2">
                <span class="admin-avatar">{{ adminInitials(review.client) }}</span>
                <span class="font-medium text-solar-navy">{{ review.client }}</span>
              </span>
            </td>
            <td class="min-w-36 font-semibold text-solar-navy">
              {{ review.targetName || review.targetId }}
            </td>
            <td class="whitespace-nowrap">
              <span class="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 font-bold text-amber-900 text-xs">
                <Star class="size-3.5 fill-solar-yellow text-solar-yellow" />
                <bdi>{{ review.score }}/5</bdi>
              </span>
            </td>
            <td class="min-w-64 text-solar-text-muted text-xs leading-5">
              {{ review.comment }}
            </td>
            <td class="whitespace-nowrap">
              <button
                class="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow cursor-pointer"
                :title="review.approved ? 'إلغاء الاعتماد وإخفاء التقييم' : 'اعتماد التقييم وإظهاره في المنصة'"
                @click="handleToggleApproval(review)"
              >
                <AdminBadge
                  :status="review.approved ? 'معتمد' : 'غير معتمد'"
                  :tone="review.approved ? 'success' : 'warning'"
                  :show-dot="true"
                />
              </button>
            </td>
          </tr>

          <tr v-if="!rows.length">
            <td colspan="6" class="admin-empty">
              {{
                (activeTab === 'suppliers' ? supplierReviews.length : engineerReviews.length)
                  ? 'لا توجد تقييمات مطابقة لخيارات البحث.'
                  : 'لا توجد تقييمات مسجلة في هذا القسم بعد.'
              }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="admin-table-footer">
        <AdminPagination
          v-model:current-page="table.page.value"
          :total-pages="table.totalPages.value"
          :total-count="table.filtered.value.length"
          :page-size="table.pageSize"
          item-name="تقييم"
        />
      </div>
    </div>
  </div>
</template>
