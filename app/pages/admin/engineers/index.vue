<script setup lang="ts">
import { ChevronDown, Download, Eye, Loader2, RefreshCw, Trash2, UserPlus } from 'lucide-vue-next'
import AdminSectionHeading from '../../../components/admin/workspace/AdminSectionHeading.vue'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import AdminModal from '../../../components/admin/common/AdminModal.vue'
import AdminPagination from '../../../components/admin/common/AdminPagination.vue'
import AdminDirectoryForm from '../../../components/admin/directory/AdminDirectoryForm.vue'
import AdminEngineerDetails from '../../../components/admin/directory/AdminEngineerDetails.vue'
import type { AdminEngineer } from '../../../../types/admin'
import { approvalLabels } from '../../../composables/useAdminWorkspace'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة المهندسين | SolarHub' })

const { engineers, isLoading, fetchEngineers } = useAdminEngineers()
const { notify } = useAdminNotice()
const route = useRoute()

// Non-blocking SSR Data Fetching
const { pending } = useLazyAsyncData('admin_engineers_fetch', () => fetchEngineers(false), {
  default: () => engineers.value,
})

const isRefreshing = ref(false)
async function handleRefresh() {
  isRefreshing.value = true
  try {
    await fetchEngineers(true)
    notify('تم تحديث قائمة المهندسين بنجاح من الخادم.')
  } finally {
    isRefreshing.value = false
  }
}

const status = ref(String(route.query.status ?? 'all'))
const addOpen = ref(false)
const detailsOpen = ref(false)
const deleteOpen = ref(false)
const selected = ref<AdminEngineer>()

watch(() => route.query.status, value => {
  status.value = String(value ?? 'all')
})

const { page, filtered, rows, totalPages, pageSize } = useAdminTable(
  () => engineers.value,
  e => status.value === 'all' || e.approval === status.value,
  () => [status.value]
)

function details(record: AdminEngineer) {
  selected.value = record
  detailsOpen.value = true
}

function remove() {
  if (!selected.value) return
  engineers.value = engineers.value.filter(e => e.id !== selected.value?.id)
  deleteOpen.value = false
  notify('تم حذف السجل من القائمة.')
}

function exportList() {
  downloadAdminCsv(
    'المهندسون',
    ['الاسم', 'البريد', 'الهاتف', 'الترخيص', 'سنوات الخبرة', 'التخصصات', 'حالة الاعتماد'],
    filtered.value.map(e => [
      e.name,
      e.email,
      e.phone,
      e.license,
      e.experience,
      e.specialties.join('، '),
      approvalLabels[e.approval],
    ])
  )
}
</script>

<template>
  <div class="admin-managed">
    <AdminSectionHeading
      title="إدارة المهندسين"
      description="عرض وإدارة حسابات المهندسين الاستشاريين المعتمدين ومراجعة طلبات الانضمام في منصة SolarHub."
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
        إضافة مهندس
      </button>
    </AdminSectionHeading>

    <div v-if="status !== 'all'" class="flex flex-wrap items-center gap-3 text-sm">
      <span>فلتر الاعتماد: {{ approvalLabels[status as keyof typeof approvalLabels] || status }}</span>
      <NuxtLink to="/admin/engineers" class="btn-outline text-xs">عرض جميع المهندسين</NuxtLink>
    </div>

    <!-- مؤشر التحميل -->
    <div v-if="pending || isLoading" class="flex flex-col items-center justify-center py-16">
      <Loader2 class="size-8 animate-spin text-solar-yellow mb-2" />
      <span class="text-xs text-solar-text-muted">جاري مزامنة بيانات المهندسين من الخادم...</span>
    </div>

    <div v-else class="admin-table-wrap">
      <table class="min-w-[1100px]">
        <thead>
          <tr>
            <th>اسم المهندس</th>
            <th>البريد الإلكتروني</th>
            <th>رقم الهاتف</th>
            <th>رقم الترخيص</th>
            <th>سنوات الخبرة</th>
            <th>التخصصات</th>
            <th>حالة الاعتماد</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="engineer in rows" :key="engineer.id">
            <td>
              <div class="flex items-center gap-3">
                <span class="admin-avatar">{{ adminInitials(engineer.name) }}</span>
                <div class="min-w-28">
                  <p class="font-bold">{{ engineer.name }}</p>
                  <p class="mt-1 text-[11px] text-solar-text-muted">{{ engineer.title }}</p>
                </div>
              </div>
            </td>
            <td dir="ltr" class="max-w-44 break-words">{{ engineer.email }}</td>
            <td dir="ltr">{{ engineer.phone }}</td>
            <td><bdi>{{ engineer.license }}</bdi></td>
            <td>{{ engineer.experience }} سنوات</td>
            <td>
              <div class="flex min-w-32 flex-wrap gap-1">
                <span
                  v-for="specialty in engineer.specialties"
                  :key="specialty"
                  class="rounded bg-solar-bg-subtle px-2 py-0.5 text-[11px]"
                >
                  {{ specialty }}
                </span>
              </div>
            </td>
            <td>
              <button
                class="rounded focus-visible:ring-2 focus-visible:ring-solar-yellow cursor-pointer"
                :aria-label="`مراجعة اعتماد ${engineer.name}`"
                @click="details(engineer)"
              >
                <AdminBadge
                  :status="approvalLabels[engineer.approval]"
                  :show-dot="false"
                  :tone="engineer.approval === 'approved' ? 'success' : engineer.approval === 'pending' ? 'warning' : 'danger'"
                />
                <ChevronDown class="ms-1 inline size-3" />
              </button>
            </td>
            <td>
              <div class="flex items-center gap-1">
                <button
                  class="btn-outline px-3 py-2 text-xs"
                  :aria-label="`عرض تفاصيل ${engineer.name}`"
                  @click="details(engineer)"
                >
                  <Eye class="size-4" />
                  عرض التفاصيل
                </button>
                <button
                  :aria-label="`حذف ${engineer.name}`"
                  class="rounded p-2 text-red-500 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-300 cursor-pointer"
                  @click="selected = engineer; deleteOpen = true"
                >
                  <Trash2 class="size-4" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!rows.length">
            <td colspan="8" class="admin-empty">
              {{ engineers.length ? 'لا يوجد مهندسون مطابقون للفلتر المحدد.' : 'لا يوجد مهندسون مسجلون حالياً.' }}
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
          item-name="مهندس"
        />
      </div>
    </div>

    <AdminDirectoryForm v-model="addOpen" kind="engineer" />
    <AdminEngineerDetails v-model="detailsOpen" :record="selected" />

    <AdminModal v-model="deleteOpen" title="تأكيد حذف المهندس" max-width="md">
      <p class="text-sm leading-7">
        هل تريد حذف المهندس <strong>{{ selected?.name }}</strong>؟ ستبقى السجلات والعروض السابقة مؤرشفة.
      </p>
      <template #footer>
        <button class="btn-outline" @click="deleteOpen = false">إلغاء</button>
        <button class="btn-dark bg-red-600 hover:bg-red-700" @click="remove">تأكيد الحذف</button>
      </template>
    </AdminModal>
  </div>
</template>
