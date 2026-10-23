<script setup lang="ts">
import { ChevronDown, Download, Eye, Loader2, RefreshCw, Search, Trash2, UserPlus } from 'lucide-vue-next'
import AdminSectionHeading from '../../../components/admin/workspace/AdminSectionHeading.vue'
import AdminPagination from '../../../components/admin/common/AdminPagination.vue'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import AdminModal from '../../../components/admin/common/AdminModal.vue'
import AdminDirectoryForm from '../../../components/admin/directory/AdminDirectoryForm.vue'
import AdminSupplierDetails from '../../../components/admin/directory/AdminSupplierDetails.vue'
import type { AdminSupplier } from '../../../../types/admin'
import { approvalLabels } from '../../../composables/useAdminWorkspace'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة الموردين والمتاجر | SolarHub' })

const { stores, isLoading, fetchStores } = useAdminStores()
const { notify } = useAdminNotice()
const route = useRoute()

// Non-blocking SSR Data Fetching
const { pending } = useLazyAsyncData('admin_stores_fetch', () => fetchStores(false), {
  default: () => stores.value,
})

const isRefreshing = ref(false)
async function handleRefresh() {
  isRefreshing.value = true
  try {
    await fetchStores(true)
    notify('تم تحديث قائمة المتاجر بنجاح من الخادم.')
  } finally {
    isRefreshing.value = false
  }
}

const query = ref('')
const status = ref(String(route.query.status ?? 'all'))
const storeType = ref('all')
const addOpen = ref(false)
const detailsOpen = ref(false)
const deleteOpen = ref(false)
const selected = ref<AdminSupplier>()

watch(() => route.query.status, value => {
  status.value = String(value ?? 'all')
})

const { page, filtered, rows, totalPages, pageSize } = useAdminTable(
  () => stores.value,
  s =>
    adminMatches(query.value, s.name, s.owner, s.email, s.commercialNumber) &&
    (status.value === 'all' || s.approval === status.value) &&
    (storeType.value === 'all' || s.storeType === storeType.value),
  () => [query.value, status.value, storeType.value]
)

function details(record: AdminSupplier) {
  selected.value = record
  detailsOpen.value = true
}

function remove() {
  if (!selected.value) return
  stores.value = stores.value.filter(s => s.id !== selected.value?.id)
  deleteOpen.value = false
  notify('تم حذف المتجر من القائمة المعروضة.')
}

function exportList() {
  downloadAdminCsv(
    'الموردون',
    ['الشركة', 'السجل التجاري', 'صاحب الحساب', 'البريد', 'الهاتف', 'نوع المتجر', 'المنطقة', 'الحالة'],
    filtered.value.map(s => [
      s.name,
      s.commercialNumber,
      s.owner,
      s.email,
      s.phone,
      s.storeType,
      s.city,
      approvalLabels[s.approval],
    ])
  )
}
</script>

<template>
  <div class="admin-managed">
    <AdminSectionHeading
      title="إدارة الموردين والمتاجر"
      description="عرض وإدارة حسابات الموردين والمتاجر المعتمدة ومراجعة طلبات الانضمام في منصة SolarHub."
    >
      <button class="btn-outline" :disabled="isRefreshing" @click="handleRefresh">
        <RefreshCw class="size-4" :class="isRefreshing ? 'animate-spin' : ''" />
        تحديث
      </button>
      <button class="btn-outline" @click="exportList">
        <Download class="size-4" />
        تصدير القائمة
      </button>
      <button class="btn-dark" @click="page = 1; addOpen = true">
        <UserPlus class="size-4" />
        إضافة مورد جديد
      </button>
    </AdminSectionHeading>

    <div class="admin-filter">
      <div class="admin-search">
        <Search />
        <input
          v-model="query"
          aria-label="البحث عن مورد"
          class="solar-input"
          type="search"
          placeholder="ابحث باسم الشركة، اسم المالك، السجل التجاري، أو البريد الإلكتروني..."
        />
      </div>

      <select v-model="status" class="solar-input" aria-label="حالة اعتماد المورد">
        <option value="all">حالة الاعتماد: الكل</option>
        <option value="approved">معتمد</option>
        <option value="pending">قيد المراجعة</option>
        <option value="rejected">مرفوض</option>
      </select>

      <select v-model="storeType" class="solar-input" aria-label="نوع المتجر">
        <option value="all">نوع المتجر: الكل</option>
        <option>وكيل معتمد</option>
        <option>متجر متخصص</option>
        <option>موزع رئيسي</option>
        <option>موزع معتمد</option>
      </select>
    </div>

    <!-- مؤشر التحميل -->
    <div v-if="pending || isLoading" class="flex flex-col items-center justify-center py-16">
      <Loader2 class="size-8 animate-spin text-solar-yellow mb-2" />
      <span class="text-xs text-solar-text-muted">جاري مزامنة بيانات الموردين والمتاجر من الخادم...</span>
    </div>

    <div v-else class="admin-table-wrap">
      <table class="min-w-[1100px]">
        <thead>
          <tr>
            <th>اسم الشركة</th>
            <th>صاحب الحساب</th>
            <th>البريد الإلكتروني</th>
            <th>رقم الهاتف</th>
            <th>نوع المتجر</th>
            <th>المحافظة / العنوان</th>
            <th>حالة الاعتماد</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="supplier in rows" :key="supplier.id">
            <td>
              <div class="flex items-center gap-3">
                <span class="admin-avatar !rounded-lg">{{ adminInitials(supplier.name) }}</span>
                <div class="min-w-40">
                  <p class="font-bold">{{ supplier.name }}</p>
                  <p class="mt-1 text-[11px] text-solar-text-muted">س.ت: <bdi>{{ supplier.commercialNumber }}</bdi></p>
                </div>
              </div>
            </td>
            <td class="min-w-28">{{ supplier.owner }}</td>
            <td dir="ltr" class="max-w-40 break-words">{{ supplier.email }}</td>
            <td dir="ltr">{{ supplier.phone }}</td>
            <td>
              <span class="inline-block rounded-md bg-solar-status-info-bg px-2 py-1 text-xs font-semibold">
                {{ supplier.storeType }}
              </span>
            </td>
            <td class="min-w-24">{{ supplier.city }}، {{ supplier.address }}</td>
            <td>
              <button
                class="rounded-lg focus-visible:ring-2 focus-visible:ring-solar-yellow cursor-pointer"
                :aria-label="`مراجعة اعتماد ${supplier.name}`"
                @click="details(supplier)"
              >
                <AdminBadge
                  :status="approvalLabels[supplier.approval]"
                  :show-dot="false"
                  :tone="supplier.approval === 'approved' ? 'success' : supplier.approval === 'pending' ? 'warning' : 'danger'"
                />
                <ChevronDown class="ms-1 inline size-3" />
              </button>
            </td>
            <td>
              <div class="flex items-center gap-2">
                <button
                  class="btn-outline px-3 py-2 text-xs"
                  :aria-label="`عرض تفاصيل ${supplier.name}`"
                  @click="details(supplier)"
                >
                  <Eye class="size-4" />
                  عرض التفاصيل
                </button>
                <button
                  :aria-label="`حذف ${supplier.name}`"
                  class="rounded p-2 text-red-500 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-300 cursor-pointer"
                  @click="selected = supplier; deleteOpen = true"
                >
                  <Trash2 class="size-4" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!rows.length">
            <td colspan="8" class="admin-empty">
              {{ stores.length ? 'لا يوجد موردون مطابقون للبحث والفلاتر.' : 'لا يوجد موردون مسجلون حالياً.' }}
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
          item-name="مورد"
        />
      </div>
    </div>

    <AdminDirectoryForm v-model="addOpen" kind="supplier" />
    <AdminSupplierDetails v-model="detailsOpen" :record="selected" />

    <AdminModal v-model="deleteOpen" title="تأكيد حذف المورد" max-width="md">
      <p class="text-sm leading-7">هل تريد حذف المتجر <strong>{{ selected?.name }}</strong> من القائمة المعروضة؟</p>
      <template #footer>
        <button class="btn-outline" @click="deleteOpen = false">إلغاء</button>
        <button class="btn-dark bg-red-600 hover:bg-red-700" @click="remove">تأكيد الحذف</button>
      </template>
    </AdminModal>
  </div>
</template>
