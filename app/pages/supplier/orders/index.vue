<script setup lang="ts">
import {
  AlertCircle,
  Ban,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Truck,
  XCircle,
} from 'lucide-vue-next'
import OrderDetailsModal from '~/components/supplier/orders/OrderDetailsModal.vue'
import type { SupplierOrderItem, SupplierOrderStatus } from '~/types/supplier-order'

definePageMeta({
  layout: 'supplier',
})

useSeoMeta({
  title: 'طلبات الشراء | بوابة المتجر والمورد SolarHub',
  description: 'متابعة وإدارة طلبات الشراء الواردة لمتجرك من قاعدة البيانات وتحديث حالات تجهيز الشحنات اللوجستية.',
})

const {
  orders,
  isLoading,
  isUpdating,
  errorMessage,
  noticeMessage,
  searchQuery,
  selectedStatus,
  selectedPeriod,
  currentPage,
  totalPages,
  perPage,
  filteredOrders,
  paginatedOrders,
  fetchOrders,
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

async function handleStatusUpdate(newStatus: SupplierOrderStatus, notes?: string) {
  if (!selectedOrder.value) return
  const success = await updateOrderStatus(selectedOrder.value.id, newStatus, notes)
  if (success && selectedOrder.value) {
    selectedOrder.value.status = newStatus
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- مسار التنقل (Breadcrumb) -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/supplier/dashboard" class="hover:text-solar-text-heading transition-colors">
        الرئيسية
      </NuxtLink>
      <span>‹</span>
      <span class="font-bold text-solar-text-heading">طلبات الشراء</span>
    </nav>

    <!-- ترويسة الصفحة وزر التصدير والتحديث -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <span class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow border border-solar-border-card shadow-xs">
          <ShoppingBag class="size-6 stroke-[2.2]" />
        </span>
        <div>
          <h1 class="text-2xl font-black text-solar-text-heading tracking-tight md:text-3xl">
            طلبات الشراء
          </h1>
          <p class="mt-0.5 text-xs sm:text-sm text-solar-text-muted">
            متابعة وإدارة طلبات الشراء الواردة لمتجرك ومطابقتها مباشرة مع جداول قاعدة البيانات
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2.5 self-start sm:self-auto">
        <!-- زر التحديث السريع -->
        <button
          type="button"
          @click="fetchOrders"
          :disabled="isLoading"
          title="تحديث البيانات من الخادم"
          class="flex size-11 items-center justify-center rounded-xl border border-solar-border-card bg-white dark:bg-solar-bg-card text-solar-text-heading hover:bg-solar-bg-subtle active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw class="size-4 text-solar-text-muted" :class="{ 'animate-spin': isLoading }" />
        </button>

        <!-- زر التصدير CSV -->
        <button
          type="button"
          @click="exportOrders"
          class="inline-flex items-center justify-center gap-2 rounded-xl border border-solar-border-card bg-white dark:bg-solar-bg-card px-4 py-2.5 text-xs font-bold text-solar-text-heading hover:bg-solar-bg-subtle shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Download class="size-4 text-solar-text-muted" />
          <span>تصدير البيانات</span>
        </button>
      </div>
    </div>

    <!-- تنبيه الخطأ أو عدم الاتصال -->
    <div
      v-if="errorMessage"
      class="solar-card border-rose-200 bg-rose-50/70 dark:bg-rose-950/30 p-4 flex items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-200 rounded-2xl"
    >
      <div class="flex items-center gap-2.5">
        <AlertCircle class="size-5 shrink-0 text-rose-600 dark:text-rose-400" />
        <span class="font-bold">{{ errorMessage }}</span>
      </div>
      <button
        type="button"
        @click="fetchOrders"
        class="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors shrink-0 cursor-pointer"
      >
        إعادة المحاولة
      </button>
    </div>

    <!-- شريط البحث والفلترة -->
    <section class="solar-card p-3 sm:p-4 rounded-2xl bg-white dark:bg-solar-bg-card border border-solar-border-card shadow-xs" aria-label="أدوات البحث والفلترة">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        <!-- حقل البحث -->
        <div class="lg:col-span-6 relative flex items-center">
          <input
            v-model.trim="searchQuery"
            type="search"
            placeholder="ابحث برقم الطلب، اسم العميل، عنوان الشحن..."
            class="solar-input h-11 w-full pr-10 pl-4 text-xs font-medium rounded-xl"
          />
          <Search class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
        </div>

        <!-- فلتر الحالة -->
        <div class="lg:col-span-3 relative flex items-center">
          <select
            v-model="selectedStatus"
            class="solar-input h-11 w-full appearance-none pr-9 pl-8 cursor-pointer text-xs font-bold rounded-xl"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">بانتظار المعالجة</option>
            <option value="accepted">مقبول وقيد التجهيز</option>
            <option value="shipped">تم الشحن</option>
            <option value="delivered">تم التسليم</option>
            <option value="completed">مكتمل ومؤكد</option>
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
            class="solar-input h-11 w-full appearance-none pr-9 pl-8 cursor-pointer text-xs font-bold rounded-xl"
          >
            <option value="all">جميع الفترات</option>
            <option value="7">آخر 7 أيام</option>
            <option value="30">آخر 30 يوماً</option>
            <option value="90">الربع الحالي</option>
          </select>
          <Calendar class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
          <ChevronDown class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
        </div>
      </div>
    </section>

    <!-- جدول طلبات الشراء المتطابق مع جداول قاعدة البيانات -->
    <section class="solar-card overflow-hidden rounded-2xl bg-white dark:bg-solar-bg-card border border-solar-border-card shadow-xs" aria-labelledby="orders-table-heading">
      <h2 id="orders-table-heading" class="sr-only">قائمة طلبات الشراء</h2>

      <div class="overflow-x-auto">
        <table class="w-full text-right text-xs">
          <!-- الترويسة -->
          <thead class="bg-solar-bg-subtle text-solar-text-muted border-b border-solar-border-card text-[11px] font-bold">
            <tr>
              <th scope="col" class="py-4 px-4 min-w-[140px]">رقم الطلب</th>
              <th scope="col" class="py-4 px-4 text-center">تاريخ الطلب</th>
              <th scope="col" class="py-4 px-4 min-w-[190px]">العميل / وجهة الشحن</th>
              <th scope="col" class="py-4 px-4 min-w-[240px]">المنتجات المطلوبة</th>
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
                <p class="font-bold text-solar-text-heading">جارٍ جلب وتحديث طلبات الشراء من قاعدة البيانات...</p>
              </td>
            </tr>

            <!-- فارغ -->
            <tr v-else-if="filteredOrders.length === 0">
              <td colspan="7" class="py-16 text-center text-solar-text-muted">
                <ShoppingBag class="size-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p class="font-bold text-solar-text-heading">لا توجد طلبات شراء مطابقة للبحث أو الفلتر المختار</p>
                <button
                  type="button"
                  @click="searchQuery = ''; selectedStatus = 'all'; selectedPeriod = 'all'"
                  class="mt-3 inline-flex text-xs font-bold text-solar-yellow-dark hover:underline cursor-pointer"
                >
                  إعادة ضبط الفلاتر
                </button>
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
                      order.status === 'accepted' ? 'bg-blue-500' :
                      order.status === 'shipped' ? 'bg-sky-500' :
                      order.status === 'completed' || order.status === 'delivered' ? 'bg-emerald-500' :
                      'bg-slate-400'
                    ]"
                  />
                  <span>{{ order.orderNumber }}</span>
                </div>
              </td>

              <!-- 2. تاريخ الطلب -->
              <td class="py-4 px-4 text-center font-bold text-solar-text-muted">
                {{ order.createdAt }}
              </td>

              <!-- 3. العميل ووجهة الشحن -->
              <td class="py-4 px-4">
                <div class="font-black text-sm text-solar-text-heading leading-tight">
                  {{ order.clientName }}
                </div>
                <div class="mt-1 flex items-center gap-1 text-[11px] text-solar-text-muted">
                  <MapPin class="size-3 shrink-0 text-solar-yellow-dark" />
                  <span class="truncate max-w-[200px]">{{ order.deliveryAddress }}</span>
                </div>
              </td>

              <!-- 4. عدد المنتجات والتفاصيل -->
              <td class="py-4 px-4">
                <div class="flex items-center gap-2">
                  <span class="shrink-0 rounded-lg bg-solar-bg-subtle px-2 py-1 text-xs font-black text-solar-text-heading border border-solar-border-card font-mono">
                    {{ order.totalItemsCount }} {{ order.unitLabel }}
                  </span>
                  <span class="font-bold text-xs text-solar-text-body truncate max-w-xs">
                    {{ order.itemsSummary }}
                  </span>
                </div>
              </td>

              <!-- 5. حصة المتجر -->
              <td class="py-4 px-4 text-center">
                <div class="font-black text-sm text-solar-text-heading font-mono">
                  {{ order.subtotal.toLocaleString('en-US') }}
                </div>
                <div class="text-[10px] text-solar-text-muted font-bold">ر.س</div>
              </td>

              <!-- 6. حالة الطلب (Pills ملونة ومطابقة تماماً للنظام) -->
              <td class="py-4 px-4 text-center">
                <span
                  v-if="order.status === 'pending'"
                  class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/70"
                >
                  <Clock class="size-3" />
                  <span>بانتظار المعالجة</span>
                </span>

                <span
                  v-else-if="order.status === 'accepted'"
                  class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/70"
                >
                  <CheckCircle2 class="size-3" />
                  <span>مقبول وقيد التجهيز</span>
                </span>

                <span
                  v-else-if="order.status === 'shipped'"
                  class="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-black text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-200/70"
                >
                  <Truck class="size-3" />
                  <span>تم الشحن</span>
                </span>

                <span
                  v-else-if="order.status === 'delivered' || order.status === 'completed'"
                  class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/70"
                >
                  <CheckCircle2 class="size-3" />
                  <span>{{ order.status === 'completed' ? 'مكتمل' : 'تم التسليم' }}</span>
                </span>

                <span
                  v-else-if="order.status === 'rejected'"
                  class="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-black text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/70"
                >
                  <XCircle class="size-3" />
                  <span>مرفوض</span>
                </span>

                <span
                  v-else
                  class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200"
                >
                  <Ban class="size-3" />
                  <span>ملغي</span>
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

        <div v-if="totalPages > 1" class="flex items-center gap-1.5">
          <!-- زر التالي (يسار في RTL) -->
          <button
            type="button"
            @click="changePage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="flex items-center gap-1 rounded-xl border border-solar-border-card px-3 py-1.5 text-xs font-bold text-solar-text-body transition-colors hover:bg-solar-bg-subtle disabled:opacity-40 cursor-pointer"
          >
            <span>التالي</span>
            <ChevronLeft class="size-3.5" />
          </button>

          <!-- أرقام الصفحات -->
          <div class="flex items-center gap-1">
            <button
              v-for="page in totalPages"
              :key="page"
              type="button"
              @click="changePage(page)"
              class="size-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
              :class="currentPage === page ? 'bg-solar-navy-dark text-white dark:bg-solar-yellow dark:text-solar-navy-dark font-black shadow-xs' : 'text-solar-text-muted hover:bg-solar-bg-subtle'"
            >
              {{ page }}
            </button>
          </div>

          <!-- زر السابق (يمين في RTL) -->
          <button
            type="button"
            @click="changePage(currentPage - 1)"
            :disabled="currentPage <= 1"
            class="flex items-center gap-1 rounded-xl border border-solar-border-card px-3 py-1.5 text-xs font-bold text-solar-text-body transition-colors hover:bg-solar-bg-subtle disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight class="size-3.5" />
            <span>السابق</span>
          </button>
        </div>
      </div>
    </section>

    <!-- نافذة تفاصيل طلب الشراء وتتبع التوصيل -->
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
