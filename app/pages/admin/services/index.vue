<script setup lang="ts">
import { Download, Eye, Loader2, RefreshCw, Search } from 'lucide-vue-next'
import AdminSectionHeading from '../../../components/admin/workspace/AdminSectionHeading.vue'
import AdminPagination from '../../../components/admin/common/AdminPagination.vue'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import AdminServiceDetails from '../../../components/admin/services/AdminServiceDetails.vue'
import type { AdminServiceRequest } from '../../../../types/admin'
import { serviceStatusLabels } from '../../../composables/useAdminWorkspace'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة طلبات الخدمات | SolarHub' })

const { services, isLoading, fetchServices } = useAdminServices()
const { notify } = useAdminNotice()

// Non-blocking SSR Data Fetching
const { pending } = useLazyAsyncData('admin_services_fetch', () => fetchServices(false), {
  default: () => services.value,
})

const isRefreshing = ref(false)
async function handleRefresh() {
  isRefreshing.value = true
  try {
    await fetchServices(true)
    notify('تم تحديث قائمة طلبات الخدمات بنجاح من الخادم.')
  } finally {
    isRefreshing.value = false
  }
}

const query = ref('')
const status = ref('all')
const detailsOpen = ref(false)
const selected = ref<AdminServiceRequest>()

const { page, filtered, rows, totalPages, pageSize } = useAdminTable(
  () => services.value,
  s =>
    adminMatches(query.value, s.id, s.client, s.city) &&
    (status.value === 'all' || s.status === status.value),
  () => [query.value, status.value]
)

function details(request: AdminServiceRequest) {
  selected.value = request
  detailsOpen.value = true
}

function exportList() {
  downloadAdminCsv(
    'طلبات_الخدمات',
    ['رقم الطلب', 'العميل', 'نوع الخدمة', 'المحافظة', 'القدرة kWp', 'الحالة'],
    filtered.value.map(s => [
      s.id,
      s.client,
      s.service,
      s.city,
      s.capacity,
      serviceStatusLabels[s.status],
    ])
  )
}
</script>

<template>
  <div class="admin-managed">
    <AdminSectionHeading
      title="إدارة طلبات الخدمات"
      description="عرض ومتابعة طلبات الخدمات الهندسية ومراجعة عروض الأسعار والمقترحات الفنية المقدمة لكل طلب."
    >
      <button class="btn-outline" :disabled="isRefreshing" @click="handleRefresh">
        <RefreshCw class="size-4" :class="isRefreshing ? 'animate-spin' : ''" />
        تحديث
      </button>
      <button class="btn-outline" @click="exportList">
        <Download class="size-4" />
        تصدير القائمة
      </button>
    </AdminSectionHeading>

    <div class="admin-filter">
      <div class="admin-search">
        <Search />
        <input
          v-model="query"
          aria-label="البحث عن طلب خدمة"
          class="solar-input"
          type="search"
          placeholder="ابحث برقم الطلب، اسم العميل، أو المحافظة..."
        />
      </div>

      <select v-model="status" aria-label="حالة طلب الخدمة" class="solar-input">
        <option value="all">كافة الحالات</option>
        <option v-for="(label, value) in serviceStatusLabels" :key="value" :value="value">
          {{ label }}
        </option>
      </select>
    </div>

    <!-- مؤشر التحميل -->
    <div v-if="pending || isLoading" class="flex flex-col items-center justify-center py-16">
      <Loader2 class="size-8 animate-spin text-solar-yellow mb-2" />
      <span class="text-xs text-solar-text-muted">جاري مزامنة بيانات طلبات الخدمات من الخادم...</span>
    </div>

    <div v-else class="admin-table-wrap">
      <table class="min-w-[820px]">
        <thead>
          <tr>
            <th>العميل</th>
            <th>نوع الخدمة</th>
            <th>المحافظة</th>
            <th>تقدير قدرة النظام</th>
            <th>حالة الطلب</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in rows" :key="request.id">
            <td>
              <div class="flex items-center gap-3">
                <span class="admin-avatar">{{ adminInitials(request.client) }}</span>
                <div class="min-w-32">
                  <p class="font-bold">{{ request.client }}</p>
                  <p class="mt-1 text-[11px] text-solar-text-muted"><bdi>#{{ request.id }}</bdi></p>
                </div>
              </div>
            </td>
            <td class="max-w-48">
              <span class="inline-block rounded-md bg-solar-bg-subtle px-3 py-1 font-semibold">
                {{ request.service }}
              </span>
            </td>
            <td>{{ request.city }}</td>
            <td class="whitespace-nowrap font-bold"><bdi>{{ request.capacity }} kWp</bdi></td>
            <td>
              <AdminBadge
                :status="serviceStatusLabels[request.status]"
                :show-dot="false"
                :tone="request.status === 'open' ? 'info' : request.status === 'completed' ? 'success' : request.status === 'cancelled' ? 'neutral' : 'warning'"
              />
            </td>
            <td>
              <button
                class="btn-outline px-3 py-2 text-xs cursor-pointer"
                :aria-label="`عرض تفاصيل ${request.id}`"
                @click="details(request)"
              >
                <Eye class="size-4" />
                عرض التفاصيل
              </button>
            </td>
          </tr>
          <tr v-if="!rows.length">
            <td colspan="6" class="admin-empty">
              {{ services.length ? 'لا توجد طلبات مطابقة للبحث والفلاتر.' : 'لا توجد طلبات خدمات مسجلة حالياً.' }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="admin-table-footer">
        <AdminPagination
          v-model:current-page="page"
          :total-pages="totalPages"
          :total-count="filtered.length"
          :page-size="pageSize"
          item-name="طلب خدمة"
          :show-progress="false"
        />
      </div>
    </div>

    <AdminServiceDetails v-model="detailsOpen" :request="selected" />
  </div>
</template>
