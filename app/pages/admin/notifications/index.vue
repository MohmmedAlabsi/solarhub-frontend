<script setup lang="ts">
import { Bell, Search, Send, RefreshCw, AlertCircle } from 'lucide-vue-next'
import AdminSectionHeading from '../../../components/admin/workspace/AdminSectionHeading.vue'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import AdminPagination from '../../../components/admin/common/AdminPagination.vue'
import AdminBroadcastForm from '../../../components/admin/notifications/AdminBroadcastForm.vue'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة الإشعارات | SolarHub' })

const { notifications, loading, error, fetchNotifications } = useAdminNotifications()
await useLazyAsyncData('admin_notifications_page', () => fetchNotifications())

const query = ref('')
const audience = ref('all-types')
const read = ref('all')
const open = ref(false)

const { page, filtered, rows, totalPages, pageSize } = useAdminTable(
  () => notifications.value,
  n => adminMatches(query.value, n.title, n.content) &&
    (audience.value === 'all-types' || n.audience === audience.value) &&
    (read.value === 'all' || (read.value === 'read' ? (n.readPercentage ?? 0) > 0 : !(n.readPercentage ?? 0))),
  () => [query.value, audience.value, read.value],
  10,
)
</script>

<template>
  <div class="admin-managed">
    <AdminSectionHeading
      title="إدارة الإشعارات"
      description="متابعة إشعارات وسجلات النظام وإرسال الإشعارات العامة للمستخدمين في المنظومة الشمسية."
    >
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="btn-outline flex items-center gap-1.5"
          :disabled="loading"
          title="تحديث البيانات"
          @click="fetchNotifications"
        >
          <RefreshCw class="size-4" :class="{ 'animate-spin': loading }" />
          <span>تحديث</span>
        </button>
        <button class="btn-dark" @click="page = 1; open = true">
          <Send class="size-4 text-solar-yellow" />
          <span>إرسال إشعار عام</span>
        </button>
      </div>
    </AdminSectionHeading>

    <div v-if="error" class="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
      <AlertCircle class="size-4 shrink-0" />
      <span>{{ error }}</span>
    </div>

    <div class="admin-filter">
      <div class="admin-search">
        <Search />
        <input
          v-model="query"
          type="search"
          aria-label="البحث في الإشعارات"
          class="solar-input"
          placeholder="ابحث بعنوان الإشعار أو المحتوى..."
        />
      </div>
      <select v-model="audience" aria-label="نوع المستلمين" class="solar-input">
        <option value="all-types">نوع المستلمين: الكل</option>
        <option v-for="(label, value) in audienceLabels" :key="value" :value="value">{{ label }}</option>
      </select>
      <select v-model="read" aria-label="حالة القراءة" class="solar-input">
        <option value="all">حالة القراءة: الكل</option>
        <option value="read">تمت القراءة</option>
        <option value="unread">غير مقروء</option>
      </select>
      <span class="inline-flex items-center gap-2 rounded-full bg-solar-status-info-bg px-3 py-2 text-xs font-bold text-solar-navy">
        <Bell class="size-3.5 text-solar-yellow" />
        إجمالي الإشعارات: {{ notifications.length }} إشعار
      </span>
    </div>

    <div class="admin-table-wrap">
      <table class="min-w-[900px]">
        <thead>
          <tr>
            <th>معرف الإشعار</th>
            <th>عنوان الإشعار</th>
            <th>محتوى الإشعار</th>
            <th>المستلمون المستهدفون</th>
            <th>حالة القراءة</th>
            <th>تاريخ الإنشاء والتوقيت</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="notification in rows" :key="notification.id">
            <td class="font-bold">
              <bdi class="text-xs font-mono text-solar-navy" :title="notification.id">
                #{{ notification.id.length > 12 ? notification.id.slice(0, 8) + '...' : notification.id }}
              </bdi>
            </td>
            <td class="min-w-44 font-bold text-solar-navy">
              {{ notification.title }}
            </td>
            <td>
              <p class="max-w-72 truncate text-solar-text-muted text-xs" :title="notification.content">
                {{ notification.content }}
              </p>
            </td>
            <td>
              <span class="inline-flex items-center gap-1 whitespace-nowrap rounded bg-solar-status-info-bg px-2 py-1 text-xs">
                <Send class="size-3 text-solar-navy" />
                {{ audienceLabels[notification.audience] || 'جميع المستخدمين' }}
              </span>
            </td>
            <td>
              <AdminBadge
                :status="notification.readPercentage === null ? 'لا توجد بيانات قراءة' : notification.readPercentage === 0 ? 'غير مقروء' : `تمت القراءة (${notification.readPercentage}%)`"
                :tone="notification.readPercentage === null ? 'neutral' : notification.readPercentage > 0 ? 'success' : 'warning'"
                :show-dot="false"
              />
            </td>
            <td class="whitespace-nowrap text-[11px] text-solar-text-muted">
              {{ adminDate(notification.createdAt, true) }}
            </td>
          </tr>
          <tr v-if="!rows.length">
            <td colspan="6" class="admin-empty">
              {{ loading ? 'جارٍ تحميل الإشعارات...' : (notifications.length ? 'لا توجد إشعارات مطابقة للبحث والفلاتر.' : 'لا توجد إشعارات في النظام بعد.') }}
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
          item-name="إشعار"
          :show-progress="false"
        />
      </div>
    </div>

    <AdminBroadcastForm v-model="open" />
  </div>
</template>
