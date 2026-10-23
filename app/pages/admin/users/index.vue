<script setup lang="ts">
import { Download, Loader2, MapPin, RefreshCw, Search, Trash2, UserPlus } from 'lucide-vue-next'
import AdminSectionHeading from '../../../components/admin/workspace/AdminSectionHeading.vue'
import AdminModal from '../../../components/admin/common/AdminModal.vue'
import AdminPagination from '../../../components/admin/common/AdminPagination.vue'
import AdminDirectoryForm from '../../../components/admin/directory/AdminDirectoryForm.vue'
import type { AdminUser } from '../../../../types/admin'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة المستخدمين | SolarHub' })

const { users, isLoading, fetchUsers, updateUserStatus } = useAdminUsers()
const { notify } = useAdminNotice()

// Non-blocking SSR Data Fetching
const { pending } = useLazyAsyncData('admin_users_fetch', () => fetchUsers(false), {
  default: () => users.value,
})

const isRefreshing = ref(false)
async function handleRefresh() {
  isRefreshing.value = true
  try {
    await fetchUsers(true)
    notify('تم تحديث قائمة المستخدمين بنجاح من الخادم.')
  } finally {
    isRefreshing.value = false
  }
}

const query = ref('')
const status = ref('all')
const addOpen = ref(false)
const deleteOpen = ref(false)
const selected = ref<AdminUser>()

const { page, filtered, rows, totalPages, pageSize } = useAdminTable(
  () => users.value,
  u =>
    adminMatches(query.value, u.name, u.email, u.phone) &&
    (status.value === 'all' || u.active === (status.value === 'active')),
  () => [query.value, status.value],
  10
)

async function changeStatus(user: AdminUser, event: Event) {
  const newActive = (event.target as HTMLSelectElement).value === 'active'
  await updateUserStatus(user.id, newActive)
}

function remove() {
  if (!selected.value) return
  users.value = users.value.filter(u => u.id !== selected.value?.id)
  deleteOpen.value = false
  notify('تم إزالة المستخدم من القائمة.')
}

function exportList() {
  downloadAdminCsv(
    'المستخدمون',
    ['الاسم', 'نوع الحساب', 'البريد', 'الهاتف', 'المنطقة', 'الحالة', 'تاريخ الإنشاء'],
    filtered.value.map(u => [
      u.name,
      u.role,
      u.email,
      u.phone,
      u.city,
      u.active ? 'نشط' : 'غير نشط',
      u.createdAt,
    ])
  )
}
</script>

<template>
  <div class="admin-managed">
    <AdminSectionHeading
      title="إدارة المستخدمين"
      description="عرض وإدارة حسابات المستخدمين المسجلين في منصة SolarHub وتعديل حالات النشاط مباشرة."
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
        إضافة مستخدم
      </button>
    </AdminSectionHeading>

    <div class="admin-filter">
      <div class="admin-search">
        <Search aria-hidden="true" />
        <input
          v-model="query"
          type="search"
          aria-label="البحث عن مستخدم"
          placeholder="ابحث باسم المستخدم، البريد الإلكتروني، أو رقم الهاتف..."
          class="solar-input"
        />
      </div>

      <select v-model="status" class="solar-input" aria-label="حالة الحساب">
        <option value="all">حالة الحساب: الكل</option>
        <option value="active">نشط</option>
        <option value="inactive">غير نشط</option>
      </select>
    </div>

    <!-- مؤشر التحميل -->
    <div v-if="pending || isLoading" class="flex flex-col items-center justify-center py-16">
      <Loader2 class="size-8 animate-spin text-solar-yellow mb-2" />
      <span class="text-xs text-solar-text-muted">جاري مزامنة بيانات المستخدمين من الخادم...</span>
    </div>

    <div v-else class="admin-table-wrap">
      <table class="min-w-[860px]">
        <thead>
          <tr>
            <th>الاسم</th>
            <th>البريد الإلكتروني</th>
            <th>رقم الهاتف</th>
            <th>المحافظة / الموقع</th>
            <th>حالة الحساب</th>
            <th>تاريخ إنشاء الحساب</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in rows" :key="user.id">
            <td>
              <div class="flex items-center gap-2">
                <span class="admin-avatar">{{ adminInitials(user.name) }}</span>
                <div class="min-w-[125px]">
                  <p class="font-bold text-solar-text-heading">{{ user.name }}</p>
                  <p class="text-[11px] text-solar-text-muted">{{ user.role }}</p>
                </div>
              </div>
            </td>
            <td dir="ltr">{{ user.email }}</td>
            <td dir="ltr">{{ user.phone }}</td>
            <td>
              <span class="inline-flex items-center gap-1">
                <MapPin class="size-3 shrink-0" />
                {{ user.city }}
              </span>
            </td>
            <td>
              <select
                :value="user.active ? 'active' : 'inactive'"
                :aria-label="`حالة حساب ${user.name}`"
                class="min-w-24 rounded-md border-0 px-2 py-1 text-xs focus:ring-2 focus:ring-solar-yellow cursor-pointer"
                :class="user.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'"
                @change="changeStatus(user, $event)"
              >
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
            </td>
            <td class="whitespace-nowrap">{{ adminDate(user.createdAt) }}</td>
            <td>
              <button
                type="button"
                class="rounded p-2 text-red-500 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-300 cursor-pointer"
                :aria-label="`حذف ${user.name}`"
                @click="selected = user; deleteOpen = true"
              >
                <Trash2 class="size-4" />
              </button>
            </td>
          </tr>
          <tr v-if="!rows.length">
            <td colspan="7" class="admin-empty">
              {{ users.length ? 'لا يوجد مستخدمون مطابقون للبحث والفلاتر.' : 'لا يوجد مستخدمون مسجلون حالياً.' }}
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
          item-name="مستخدم"
          :show-progress="false"
        />
      </div>
    </div>

    <AdminDirectoryForm v-model="addOpen" kind="user" />

    <AdminModal v-model="deleteOpen" title="تأكيد حذف المستخدم" max-width="md">
      <p class="text-sm leading-7">هل تريد حذف المستخدم <strong>{{ selected?.name }}</strong> من القائمة المعروضة؟</p>
      <template #footer>
        <button class="btn-outline" @click="deleteOpen = false">إلغاء</button>
        <button class="btn-dark bg-red-600 hover:bg-red-700" @click="remove">تأكيد الحذف</button>
      </template>
    </AdminModal>
  </div>
</template>
