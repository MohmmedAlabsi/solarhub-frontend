<script setup lang="ts">
import { Download, Eye, Loader2, RefreshCw, Search, ShoppingBag } from 'lucide-vue-next'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import AdminPagination from '../../../components/admin/common/AdminPagination.vue'
import OrderDetailsModal from '../../../components/admin/orders/OrderDetailsModal.vue'
import type { AdminOrder } from '../../../../types/admin'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة طلبات الشراء | لوحة الإدارة العامة' })

const route = useRoute()
const router = useRouter()

const {
  orders,
  isLoading,
  fetchOrders,
  updateOrderStatus,
  exportOrdersCsv,
} = useAdminOrderManagement()

// Non-blocking lazy SSR Data Fetching for instant navigation
const { pending } = useLazyAsyncData('admin_management_orders', () => fetchOrders(false), {
  default: () => orders.value,
})

const isRefreshing = ref(false)

async function handleRefreshOrders() {
  isRefreshing.value = true
  try {
    await fetchOrders(true)
  } finally {
    isRefreshing.value = false
  }
}

const searchQuery = ref((route.query.search as string) || '')
const selectedStatus = ref(String(route.query.status ?? 'all'))
const currentPage = ref(Number(route.query.page) || 1)

watch(() => route.query.status, value => {
  selectedStatus.value = String(value ?? 'all')
})

const selectedOrder = ref<AdminOrder | null>(null)
const isDetailsModalOpen = ref(false)

const filteredOrders = computed(() => {
  return orders.value.filter((item) => {
    const q = searchQuery.value.trim().toLowerCase()
    const matchesSearch =
      !q ||
      item.orderNumber.toLowerCase().includes(q) ||
      item.customerName.toLowerCase().includes(q) ||
      item.city.toLowerCase().includes(q) ||
      item.address.toLowerCase().includes(q)

    const matchesStatus =
      selectedStatus.value === 'all' || item.status === selectedStatus.value

    return matchesSearch && matchesStatus
  })
})

const pageSize = 8
const totalPages = computed(() => Math.max(1, Math.ceil(filteredOrders.value.length / pageSize)))
const visibleOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredOrders.value.slice(start, start + pageSize)
})

watch([searchQuery, selectedStatus], () => {
  currentPage.value = 1
})

watch(totalPages, total => {
  currentPage.value = Math.min(currentPage.value, total)
})

function openOrderDetails(order: AdminOrder) {
  selectedOrder.value = order
  isDetailsModalOpen.value = true
}

async function handleStatusUpdate(orderId: string, newStatus: AdminOrder['status']) {
  await updateOrderStatus(orderId, newStatus)
  if (selectedOrder.value && selectedOrder.value.id === orderId) {
    selectedOrder.value.status = newStatus
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- كارد إدارة طلبات الشراء -->
    <div class="solar-card p-5 sm:p-7">
      <!-- رأس الصفحة -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-solar-border-card/60 pb-6">
        <div class="flex items-center gap-3">
          <div class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-solar-navy text-white shadow-md">
            <ShoppingBag class="size-5" />
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-solar-text-heading">إدارة طلبات الشراء</h1>
            <p class="mt-1 text-xs sm:text-sm text-solar-text-muted">
              عرض ومتابعة طلبات شراء المنتجات متعددة المتاجر، وتفاصيل التوريد والتسليم (إجمالي الطلبات: {{ orders.length }} طلب).
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            @click="handleRefreshOrders"
            :disabled="isRefreshing || pending || isLoading"
            class="btn-outline h-10 px-4 text-xs font-bold gap-2 text-solar-text-body hover:bg-solar-bg-subtle"
            title="تحديث قائمة الطلبات من السيرفر"
          >
            <RefreshCw class="size-4" :class="{ 'animate-spin': isRefreshing || pending || isLoading }" />
            <span>تحديث</span>
          </button>

          <button
            type="button"
            @click="exportOrdersCsv"
            :disabled="!orders.length"
            class="btn-outline h-10 px-4 text-xs font-bold gap-2 text-solar-navy border-solar-navy/30 hover:bg-sky-50"
          >
            <Download class="size-4" />
            <span>تصدير القائمة (CSV)</span>
          </button>
        </div>
      </div>

      <!-- الفلاتر والبحث -->
      <div class="mt-6 grid gap-3 sm:grid-cols-12">
        <div class="relative sm:col-span-8">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ابحث برقم الطلب، اسم العميل، المحافظة، أو العنوان..."
            class="solar-input h-11 pr-10 text-xs w-full"
          />
          <Search class="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted" />
        </div>

        <div class="sm:col-span-4">
          <select v-model="selectedStatus" class="solar-input h-11 text-xs w-full font-bold">
            <option value="all">كافة الحالات</option>
            <option value="قيد المعالجة">قيد المعالجة</option>
            <option value="قيد التجهيز والشحن">قيد التجهيز والشحن</option>
            <option value="تم التسليم">تم التسليم</option>
            <option value="مكتمل">مكتمل</option>
            <option value="ملغي">ملغي</option>
          </select>
        </div>
      </div>

      <!-- حالة التحميل الأولي فقط -->
      <div v-if="pending && orders.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 class="size-8 text-solar-navy animate-spin mb-3" />
        <p class="text-xs font-bold text-solar-text-muted">جاري تحميل طلبات الشراء من السيرفر...</p>
      </div>

      <!-- جدول الطلبات -->
      <div v-else class="mt-6 overflow-x-auto rounded-xl border border-solar-border-card/80">
        <table class="w-full text-right text-xs">
          <thead class="bg-solar-bg-subtle/70 text-solar-text-muted font-bold border-b border-solar-border-card">
            <tr>
              <th class="py-3.5 px-4 font-bold">رقم الطلب</th>
              <th class="py-3.5 px-4 font-bold">العميل</th>
              <th class="py-3.5 px-4 font-bold">محافظة التسليم</th>
              <th class="py-3.5 px-4 font-bold">إجمالي الطلب</th>
              <th class="py-3.5 px-4 font-bold">عنوان التسليم</th>
              <th class="py-3.5 px-4 font-bold text-center">حالة الطلب</th>
              <th class="py-3.5 px-4 font-bold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-solar-border-card/60">
            <tr
              v-for="item in visibleOrders"
              :key="item.id"
              class="transition-colors hover:bg-solar-bg-subtle/30"
            >
              <!-- رقم الطلب -->
              <td class="py-3.5 px-4 font-bold font-mono text-solar-navy-dark text-xs">
                #{{ item.orderNumber }}
              </td>

              <!-- العميل -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-2.5">
                  <div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-solar-yellow/30 text-solar-navy-dark font-black text-[10px]">
                    {{ item.customerAvatarText }}
                  </div>
                  <div>
                    <span class="font-extrabold text-solar-text-heading block">{{ item.customerName }}</span>
                    <span class="text-[10px] text-solar-text-muted font-mono" dir="ltr">{{ item.createdAt.slice(0, 10) }}</span>
                  </div>
                </div>
              </td>

              <!-- محافظة التسليم -->
              <td class="py-3.5 px-4 font-bold text-solar-text-heading">
                {{ item.city }}
              </td>

              <!-- إجمالي الطلب -->
              <td class="py-3.5 px-4 font-black font-mono text-solar-text-heading text-sm">
                {{ item.totalAmount.toLocaleString() }} ر.س
              </td>

              <!-- عنوان التسليم -->
              <td class="py-3.5 px-4 text-solar-text-body max-w-xs truncate" :title="item.address">
                {{ item.address }}
              </td>

              <!-- حالة الطلب -->
              <td class="py-3.5 px-4 text-center">
                <AdminBadge :status="item.status" />
              </td>

              <!-- الإجراءات -->
              <td class="py-3.5 px-4 text-center">
                <button
                  type="button"
                  @click="openOrderDetails(item)"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-solar-border-card bg-white px-3 py-1.5 text-xs font-bold text-solar-text-heading hover:bg-solar-bg-subtle hover:border-solar-navy transition-all shadow-2xs"
                >
                  <Eye class="size-3.5 text-solar-navy" />
                  <span>عرض التفاصيل</span>
                </button>
              </td>
            </tr>

            <tr v-if="!filteredOrders.length">
              <td colspan="7" class="py-12 text-center text-solar-text-muted">
                لا توجد طلبات شراء مطابقة لمعايير البحث الحالية.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- الترقيم والتقدم أسفل الجدول -->
      <AdminPagination
        v-model:current-page="currentPage"
        :total-pages="totalPages"
        :total-count="filteredOrders.length"
        :page-size="pageSize"
        item-name="طلب شراء"
      />
    </div>

    <!-- نافذة تفاصيل طلب الشراء والموردين -->
    <OrderDetailsModal
      v-model="isDetailsModalOpen"
      :order="selectedOrder"
      @update-status="handleStatusUpdate"
    />
  </div>
</template>
