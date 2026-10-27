<script setup lang="ts">
import {
  Ban,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Loader2,
  MapPin,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Truck,
  XCircle,
} from 'lucide-vue-next'
import OrderDetailsModal from '~/components/supplier/orders/OrderDetailsModal.vue'
import type { SupplierOrderItem } from '~/types/supplier-order'

definePageMeta({
  layout: 'supplier',
})

useSeoMeta({
  title: 'طلبات الشراء | بوابة المتجر والمورد SolarHub',
  description: 'متابعة وإدارة طلبات الشراء الواردة لمتجرك وتحديث حالات تجهيز الشحنات اللوجستية.',
})

const {
  orders,
  isLoading,
  isUpdating,
  noticeMessage,
  searchQuery,
  selectedStatus,
  selectedPeriod,
  currentPage,
  totalPages,
  perPage,
  filteredOrders,
  paginatedOrders,
  changePage,
  updateOrderStatus,
  exportOrders,
} = useSupplierOrders()

const isModalOpen = ref(false)
const selectedOrder = ref<SupplierOrderItem | null>(null)

function openDetails(order: SupplierOrderItem) {
  selectedOrder.value = order
  isModalOpen.value = true
}

async function handleStatusUpdate(newStatus: 'accepted' | 'rejected' | 'shipped' | 'delivered' | 'completed') {
  if (!selectedOrder.value) return
  const success = await updateOrderStatus(selectedOrder.value.id, newStatus)
  if (success && selectedOrder.value) {
    selectedOrder.value.status = newStatus
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- مسار التنقل -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/supplier/dashboard" class="hover:text-solar-text-heading transition-colors">
        الرئيسية
      </NuxtLink>
      <span>‹</span>
      <span class="font-bold text-solar-text-heading">طلبات الشراء</span>
    </nav>

    <!-- ترويسة الصفحة وزر التصدير -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <span class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-solar-navy-dark border border-amber-200/60 shadow-2xs">
          <ShoppingBag class="size-6 text-solar-navy-dark" />
        </span>
        <div>
          <h1 class="text-2xl font-black text-solar-text-heading md:text-3xl">
            طلبات الشراء
          </h1>
          <p class="mt-0.5 text-xs sm:text-sm text-solar-text-muted">
            متابعة وإدارة طلبات الشراء الواردة لمتجرك وتحديث حالات تجهيز الشحنات اللوجستية
          </p>
        </div>
      </div>

      <button
        type="button"
        @click="exportOrders"
        class="inline-flex items-center justify-center gap-2 rounded-xl border border-solar-border-card bg-white dark:bg-solar-bg-card px-4 py-2.5 text-xs font-bold text-solar-text-heading hover:bg-solar-bg-subtle shadow-2xs transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
      >
        <Download class="size-4" />
        <span>تصدير البيانات</span>
      </button>
    </div>

    <!-- شريط البحث والفلترة -->
    <section class="solar-card p-3 sm:p-4" aria-label="أدوات البحث والفلترة">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        <!-- حقل البحث -->
        <div class="lg:col-span-6 relative flex items-center">
          <input
            v-model.trim="searchQuery"
            type="search"
            placeholder="ابحث برقم الطلب، أو اسم العميل..."
            class="solar-input h-11 w-full pr-10 pl-4 text-xs font-medium"
          />
          <Search class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
        </div>

        <!-- فلتر الحالة -->
        <div class="lg:col-span-3 relative flex items-center">
          <select
            v-model="selectedStatus"
            class="solar-input h-11 w-full appearance-none pr-9 pl-8 cursor-pointer text-xs font-semibold"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">بانتظار المعالجة</option>
            <option value="accepted">مقبول</option>
            <option value="shipped">تم الشحن</option>
            <option value="delivered">تم التسليم</option>
            <option value="completed">مكتمل</option>
            <option value="rejected">مرفوض</option>
            <option value="cancelled">ملغي</option>
          </select>
          <SlidersHorizontal class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
          <ChevronDown class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
        </div>

        <!-- فلتر الفترة -->
        <div class="lg:col-span-3 relative flex items-center">
          <select
            v-model="selectedPeriod"
            class="solar-input h-11 w-full appearance-none pr-9 pl-8 cursor-pointer text-xs font-semibold"
          >
            <option value="30">آخر 30 يوماً</option>
            <option value="7">آخر 7 أيام</option>
            <option value="all">جميع الفترات</option>
          </select>
          <Calendar class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
          <ChevronDown class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
        </div>
      </div>
    </section>

    <!-- جدول طلبات الشراء -->
    <section class="solar-card overflow-hidden" aria-labelledby="orders-table-heading">
      <h2 id="orders-table-heading" class="sr-only">قائمة طلبات الشراء</h2>

      <div class="overflow-x-auto">
        <table class="w-full text-right text-xs">
          <!-- الترويسة -->
          <thead class="bg-solar-bg-subtle text-solar-text-muted border-b border-solar-border-card text-[11px] font-bold">
            <tr>
              <th scope="col" class="py-4 px-4 min-w-[140px]">رقم الطلب</th>
              <th scope="col" class="py-4 px-4 text-center">تاريخ الطلب</th>
              <th scope="col" class="py-4 px-4 min-w-[180px]">العميل / وجهة الشحن</th>
              <th scope="col" class="py-4 px-4 min-w-[240px]">عدد المنتجات والتفاصيل</th>
              <th scope="col" class="py-4 px-4 text-center">حصة المتجر</th>
              <th scope="col" class="py-4 px-4 text-center">حالة الطلب</th>
              <th scope="col" class="py-4 px-4 text-center w-28">الإجراءات</th>
            </tr>
          </thead>

          <!-- محتوى الجدول -->
          <tbody class="divide-y divide-solar-border-card bg-white dark:bg-solar-bg-card">
            <!-- التحميل -->
            <tr v-if="isLoading">
              <td colspan="7" class="py-16 text-center text-solar-text-muted">
                <Loader2 class="size-8 animate-spin mx-auto text-solar-yellow mb-2" />
                <p class="font-bold text-solar-text-heading">جارٍ جلب طلبات الشراء...</p>
              </td>
            </tr>

            <!-- فارغ -->
            <tr v-else-if="filteredOrders.length === 0">
              <td colspan="7" class="py-16 text-center text-solar-text-muted">
                <ShoppingBag class="size-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p class="font-bold text-solar-text-heading">لا توجد طلبات شراء مطابقة للبحث أو الفلتر المختار</p>
              </td>
            </tr>

            <!-- الصفوف -->
            <tr
              v-for="order in paginatedOrders"
              :key="order.id"
              class="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
            >
              <!-- 1. رقم الطلب -->
              <td class="py-4 px-4">
                <div class="flex items-center gap-1.5 font-black font-mono text-xs text-solar-text-heading">
                  <span
                    class="size-2 rounded-full"
                    :class="[
                      order.status === 'pending' ? 'bg-amber-400' :
                      order.status === 'accepted' || order.status === 'shipped' ? 'bg-blue-500' :
                      order.status === 'completed' || order.status === 'delivered' ? 'bg-emerald-500' :
                      'bg-slate-400'
                    ]"
                  />
                  <span>{{ order.orderNumber }}</span>
                </div>
              </td>

              <!-- 2. تاريخ الطلب -->
              <td class="py-4 px-4 text-center font-medium text-solar-text-muted">
                {{ order.createdAt }}
              </td>

              <!-- 3. العميل ووجهة الشحن -->
              <td class="py-4 px-4">
                <div class="font-extrabold text-sm text-solar-text-heading leading-tight">
                  {{ order.clientName }}
                </div>
                <div class="mt-1 flex items-center gap-1 text-[11px] text-solar-text-muted">
                  <MapPin class="size-3 shrink-0" />
                  <span class="truncate">{{ order.deliveryAddress }}</span>
                </div>
              </td>

              <!-- 4. عدد المنتجات والتفاصيل -->
              <td class="py-4 px-4">
                <div class="flex items-center gap-2">
                  <span class="shrink-0 rounded-lg bg-solar-bg-subtle px-2 py-1 text-xs font-black text-solar-text-heading border border-solar-border-card">
                    {{ order.totalItemsCount }} {{ order.unitLabel }}
                  </span>
                  <span class="font-medium text-xs text-solar-text-body truncate">
                    {{ order.itemsSummary }}
                  </span>
                </div>
              </td>

              <!-- 5. حصة المتجر -->
              <td class="py-4 px-4 text-center">
                <div class="font-black text-sm text-solar-text-heading font-mono">
                  {{ order.subtotal.toLocaleString('en-US') }}
                </div>
                <div class="text-[10px] text-solar-text-muted">ر.س</div>
              </td>

              <!-- 6. حالة الطلب -->
              <td class="py-4 px-4 text-center">
                <span
                  v-if="order.status === 'pending'"
                  class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700 border border-amber-200/80"
                >
                  <span class="size-1.5 rounded-full bg-amber-500" />
                  بانتظار المعالجة
                </span>

                <span
                  v-else-if="order.status === 'accepted'"
                  class="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700 border border-blue-200/80"
                >
                  مقبول
                </span>

                <span
                  v-else-if="order.status === 'shipped'"
                  class="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-700 border border-indigo-200/80"
                >
                  <Truck class="size-3" />
                  تم الشحن
                </span>

                <span
                  v-else-if="order.status === 'delivered'"
                  class="inline-flex items-center rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-bold text-cyan-700 border border-cyan-200/80"
                >
                  تم التسليم
                </span>

                <span
                  v-else-if="order.status === 'completed'"
                  class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200/80"
                >
                  <CheckCircle2 class="size-3" />
                  مكتمل
                </span>

                <span
                  v-else-if="order.status === 'rejected'"
                  class="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-700 border border-rose-200/80"
                >
                  <XCircle class="size-3" />
                  مرفوض
                </span>

                <span
                  v-else
                  class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600 border border-slate-200"
                >
                  <Ban class="size-3" />
                  ملغي
                </span>
              </td>

              <!-- 7. الإجراءات -->
              <td class="py-4 px-4 text-center">
                <button
                  type="button"
                  @click="openDetails(order)"
                  class="inline-flex items-center gap-1.5 rounded-xl border border-solar-border-card bg-solar-bg-subtle/80 px-3 py-1.5 text-xs font-bold text-solar-text-heading hover:bg-solar-yellow hover:text-solar-navy-dark transition-all active:scale-95 cursor-pointer shadow-2xs"
                >
                  <Eye class="size-3.5" />
                  <span>عرض التفاصيل</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- تذييل الجدول والترقيم -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-solar-border-card text-xs text-solar-text-muted bg-white dark:bg-solar-bg-card">
        <div>
          عرض <span class="font-bold text-solar-text-heading">{{ paginatedOrders.length ? (currentPage - 1) * perPage + 1 : 0 }} - {{ Math.min(currentPage * perPage, filteredOrders.length) }}</span> من أصل
          <span class="font-bold text-solar-text-heading">{{ filteredOrders.length }}</span> طلب شراء
        </div>

        <div class="flex items-center gap-1.5">
          <button
            type="button"
            @click="changePage(currentPage - 1)"
            :disabled="currentPage <= 1"
            class="flex items-center gap-1 rounded-xl border border-solar-border-card px-3 py-1.5 text-xs font-bold text-solar-text-body transition-colors hover:bg-solar-bg-subtle disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight class="size-3.5" />
            <span>السابق</span>
          </button>

          <div class="flex items-center gap-1">
            <button
              v-for="page in totalPages"
              :key="page"
              type="button"
              @click="changePage(page)"
              class="size-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
              :class="currentPage === page ? 'bg-solar-navy-dark text-white shadow-xs' : 'text-solar-text-muted hover:bg-solar-bg-subtle'"
            >
              {{ page }}
            </button>
          </div>

          <button
            type="button"
            @click="changePage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="flex items-center gap-1 rounded-xl border border-solar-border-card px-3 py-1.5 text-xs font-bold text-solar-text-body transition-colors hover:bg-solar-bg-subtle disabled:opacity-40 cursor-pointer"
          >
            <span>التالي</span>
            <ChevronLeft class="size-3.5" />
          </button>
        </div>
      </div>
    </section>

    <!-- نافذة تفاصيل الطلب والشحنة -->
    <OrderDetailsModal
      :is-open="isModalOpen"
      :order="selectedOrder"
      :is-updating="isUpdating"
      @close="isModalOpen = false"
      @update-status="handleStatusUpdate"
    />

    <!-- إشعار العملية -->
    <p
      v-if="noticeMessage"
      class="fixed bottom-5 left-1/2 z-[110] w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-xl bg-solar-navy-dark px-5 py-3 text-center text-xs sm:text-sm font-bold text-white shadow-2xl border border-white/10"
      role="status"
      aria-live="polite"
    >
      {{ noticeMessage }}
    </p>
  </div>
</template>
