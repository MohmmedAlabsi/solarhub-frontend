<script setup lang="ts">
import { Download, Eye, Search } from 'lucide-vue-next'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import AdminPagination from '../../../components/admin/common/AdminPagination.vue'
import OrderDetailsModal from '../../../components/admin/orders/OrderDetailsModal.vue'
import type { AdminOrder } from '../../../../types/admin'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة طلبات الشراء | لوحة الإدارة العامة' })

const searchQuery = ref('')
const route = useRoute()
const selectedStatus = ref(String(route.query.status ?? 'all'))
watch(() => route.query.status, value => { selectedStatus.value = String(value ?? 'all') })
const currentPage = ref(1)

const selectedOrder = ref<AdminOrder | null>(null)
const isDetailsModalOpen = ref(false)

const orders = useAdminOrders()

const filteredOrders = computed(() => {
  return orders.value.filter((item) => {
    const matchesSearch =
      !searchQuery.value ||
      item.orderNumber.includes(searchQuery.value) ||
      item.customerName.includes(searchQuery.value) ||
      item.city.includes(searchQuery.value)

    const matchesStatus =
      selectedStatus.value === 'all' || item.status === selectedStatus.value

    return matchesSearch && matchesStatus
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredOrders.value.length / 8)))
const visibleOrders = computed(() => filteredOrders.value.slice((currentPage.value - 1) * 8, currentPage.value * 8))
watch([searchQuery, selectedStatus], () => { currentPage.value = 1 })
watch(totalPages, total => { currentPage.value = Math.min(currentPage.value, total) })

function openOrderDetails(order: AdminOrder) {
  selectedOrder.value = order
  isDetailsModalOpen.value = true
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- كارد إدارة طلبات الشراء -->
    <div class="solar-card p-5 sm:p-7">
      <!-- رأس الصفحة -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-solar-border-card/60 pb-6">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-solar-text-heading">إدارة طلبات الشراء</h1>
          <p class="mt-1 text-xs sm:text-sm text-solar-text-muted">
            عرض ومتابعة طلبات الشراء متعددة المتاجر، وتفاصيل التوريد والتسليم.
          </p>
        </div>

        <button
          type="button"
          class="btn-outline h-11 px-4 text-xs font-bold gap-2 self-start sm:self-auto"
        >
          <Download class="size-4" />
          <span>تصدير القائمة</span>
        </button>
      </div>

      <!-- الفلاتر والبحث -->
      <div class="mt-6 grid gap-3 sm:grid-cols-12">
        <div class="relative sm:col-span-8">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ابحث برقم الطلب، اسم العميل، أو المحافظة..."
            class="solar-input h-11 pr-10 text-xs"
          />
          <Search class="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted" />
        </div>

        <div class="sm:col-span-4">
          <select v-model="selectedStatus" class="solar-input h-11 text-xs">
            <option value="all">كافة الحالات</option>
            <option value="قيد المعالجة">قيد المعالجة</option>
            <option value="قيد التجهيز والشحن">قيد التجهيز والشحن</option>
            <option value="تم التسليم">تم التسليم</option>
            <option value="مكتمل">مكتمل</option>
            <option value="ملغي">ملغي</option>
          </select>
        </div>
      </div>

      <!-- جدول الطلبات -->
      <div class="mt-6 overflow-x-auto rounded-xl border border-solar-border-card/80">
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
              <td class="py-3.5 px-4 font-bold font-mono text-solar-navy-dark">
                #{{ item.orderNumber }}
              </td>

              <!-- العميل -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-2.5">
                  <div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-solar-yellow/30 text-solar-navy-dark font-black text-[10px]">
                    {{ item.customerAvatarText }}
                  </div>
                  <span class="font-extrabold text-solar-text-heading">{{ item.customerName }}</span>
                </div>
              </td>

              <!-- محافظة التسليم -->
              <td class="py-3.5 px-4 font-medium text-solar-text-body">
                {{ item.city }}
              </td>

              <!-- إجمالي الطلب -->
              <td class="py-3.5 px-4 font-black font-mono text-solar-text-heading">
                {{ item.totalAmount.toLocaleString() }} ر.س
              </td>

              <!-- عنوان التسليم -->
              <td class="py-3.5 px-4 text-solar-text-muted max-w-xs truncate">
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
                  class="inline-flex items-center gap-1.5 rounded-lg border border-solar-border-card bg-white px-3 py-1.5 text-xs font-bold text-solar-text-heading hover:bg-solar-bg-subtle hover:border-solar-yellow transition-all shadow-2xs"
                >
                  <Eye class="size-3.5" />
                  <span>عرض التفاصيل</span>
                </button>
              </td>
            </tr>

            <tr v-if="!filteredOrders.length">
              <td colspan="7" class="py-12 text-center text-solar-text-muted">
                لا توجد طلبات شراء مطابقة للبحث.
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
        :page-size="8"
        item-name="طلب شراء"
      />
    </div>

    <!-- نافذة تفاصيل طلب الشراء والموردين -->
    <OrderDetailsModal
      v-model="isDetailsModalOpen"
      :order="selectedOrder"
    />
  </div>
</template>
