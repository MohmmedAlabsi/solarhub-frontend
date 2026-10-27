<script setup lang="ts">
import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
} from 'lucide-vue-next'
import AddProductModal from '~/components/supplier/products/AddProductModal.vue'
import EditProductModal from '~/components/supplier/products/EditProductModal.vue'
import type {
  SupplierProductItem,
  CreateSupplierProductInput,
  UpdateSupplierProductInput,
} from '~/types/supplier-product'

definePageMeta({
  layout: 'supplier',
})

useSeoMeta({
  title: 'إدارة المنتجات | بوابة المتجر والمورد SolarHub',
  description: 'إدارة وتحديث أسعار ومخزون منتجات متجرك المعروضة في المنصة المرتبطة بقاعدة البيانات.',
})

const {
  products,
  masterCatalog,
  categories,
  brands,
  governorates,
  isLoading,
  isActionLoading,
  isCatalogLoading,
  errorMessage,
  noticeMessage,
  searchQuery,
  selectedCategory,
  selectedBrand,
  selectedGovernorate,
  selectedStatus,
  currentPage,
  perPage,
  totalPages,
  filteredProducts,
  paginatedProducts,
  fetchMyProducts,
  changePage,
  createProduct,
  updateProduct,
  toggleStatus,
  deleteProduct,
} = useSupplierProducts()

// النوافذ المنبثقة
const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const selectedProduct = ref<SupplierProductItem | null>(null)
const previewImage = ref<string | null>(null)

function openEditModal(product: SupplierProductItem) {
  selectedProduct.value = product
  isEditModalOpen.value = true
}

async function handleAddSubmit(data: CreateSupplierProductInput) {
  const success = await createProduct(data)
  if (success) {
    isAddModalOpen.value = false
  }
}

async function handleEditSubmit(data: { id: number; input: UpdateSupplierProductInput }) {
  const success = await updateProduct(data.id, data.input)
  if (success) {
    isEditModalOpen.value = false
  }
}

async function handleDelete(id: number) {
  if (confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج من متجرك في قاعدة البيانات؟')) {
    await deleteProduct(id)
  }
}

function handleImageError(e: Event, product: SupplierProductItem) {
  const target = e.target as HTMLImageElement
  const cat = (product.category || '').toLowerCase()
  if (cat.includes('لوح') || cat.includes('panel')) {
    target.src = '/images/product-panel.png'
  } else if (cat.includes('إنفرتر') || cat.includes('inverter') || cat.includes('محول')) {
    target.src = '/images/product-inverter.png'
  } else if (cat.includes('بطارية') || cat.includes('battery')) {
    target.src = '/images/product-battery.png'
  } else {
    target.src = '/images/hero-solar.png'
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
      <span class="font-bold text-solar-text-heading">إدارة المنتجات</span>
    </nav>

    <!-- ترويسة الصفحة وأزرار الإجراءات السريعة -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <span class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow border border-solar-border-card shadow-xs">
          <Package class="size-6 stroke-[2.2]" />
        </span>
        <div>
          <h1 class="text-2xl font-black text-solar-text-heading tracking-tight md:text-3xl">
            إدارة المنتجات
          </h1>
          <p class="mt-0.5 text-xs sm:text-sm text-solar-text-muted">
            إدارة وتحديث أسعار ومخزون منتجات متجرك وقراءة البيانات مباشرة من وإلى قاعدة البيانات
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2.5 self-start sm:self-auto">
        <!-- زر التحديث السريع من قاعدة البيانات -->
        <button
          type="button"
          @click="fetchMyProducts"
          :disabled="isLoading"
          title="تحديث البيانات من الخادم"
          class="flex size-11 items-center justify-center rounded-xl border border-solar-border-card bg-white dark:bg-solar-bg-card text-solar-text-heading hover:bg-solar-bg-subtle active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw class="size-4 text-solar-text-muted" :class="{ 'animate-spin': isLoading }" />
        </button>

        <!-- زر إضافة منتج للمتجر -->
        <button
          type="button"
          @click="isAddModalOpen = true"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-solar-yellow px-5 py-3 text-xs sm:text-sm font-black text-solar-navy-dark hover:brightness-105 shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Plus class="size-4 stroke-[3]" />
          <span>إضافة منتج للمتجر</span>
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
        @click="fetchMyProducts"
        class="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors shrink-0 cursor-pointer"
      >
        إعادة المحاولة
      </button>
    </div>

    <!-- شريط البحث والفلترة متعدد المعايير -->
    <section class="solar-card p-3 sm:p-4 rounded-2xl bg-white dark:bg-solar-bg-card border border-solar-border-card shadow-xs" aria-label="أدوات البحث والفلترة">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        <!-- 1. حقل البحث النصي -->
        <div class="lg:col-span-4 relative flex items-center">
          <input
            v-model.trim="searchQuery"
            type="search"
            placeholder="ابحث باسم المنتج، الموديل SKU، الماركة..."
            class="solar-input h-11 w-full pr-10 pl-4 text-xs font-medium rounded-xl"
          />
          <Search class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
        </div>

        <!-- 2. فلتر التصنيفات من قاعدة البيانات -->
        <div class="lg:col-span-2 relative flex items-center">
          <select
            v-model="selectedCategory"
            class="solar-input h-11 w-full appearance-none pr-9 pl-8 cursor-pointer text-xs font-bold rounded-xl"
          >
            <option value="all">جميع التصنيفات</option>
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
          <Layers class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
          <ChevronDown class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
        </div>

        <!-- 3. فلتر الماركات من قاعدة البيانات -->
        <div class="lg:col-span-2 relative flex items-center">
          <select
            v-model="selectedBrand"
            class="solar-input h-11 w-full appearance-none pr-9 pl-8 cursor-pointer text-xs font-bold rounded-xl"
          >
            <option value="all">جميع الماركات</option>
            <option v-for="b in brands" :key="b" :value="b">
              {{ b }}
            </option>
          </select>
          <ShieldCheck class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
          <ChevronDown class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
        </div>

        <!-- 4. فلتر المحافظات -->
        <div class="lg:col-span-2 relative flex items-center">
          <select
            v-model="selectedGovernorate"
            class="solar-input h-11 w-full appearance-none pr-9 pl-8 cursor-pointer text-xs font-bold rounded-xl"
          >
            <option value="all">كافة المحافظات</option>
            <option v-for="gov in governorates" :key="gov.id" :value="gov.id">
              {{ gov.name_ar }}
            </option>
          </select>
          <MapPin class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
          <ChevronDown class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
        </div>

        <!-- 5. فلتر الحالة -->
        <div class="lg:col-span-2 relative flex items-center">
          <select
            v-model="selectedStatus"
            class="solar-input h-11 w-full appearance-none pr-9 pl-8 cursor-pointer text-xs font-bold rounded-xl"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="out_of_stock">نفد المخزون</option>
            <option value="inactive">غير نشط</option>
          </select>
          <SlidersHorizontal class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
          <ChevronDown class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
        </div>
      </div>
    </section>

    <!-- جدول عرض المنتجات المتطابق مع حقول جداول قاعدة البيانات -->
    <section class="solar-card overflow-hidden rounded-2xl bg-white dark:bg-solar-bg-card border border-solar-border-card shadow-xs" aria-labelledby="products-table-heading">
      <h2 id="products-table-heading" class="sr-only">قائمة منتجات المتجر</h2>

      <div class="overflow-x-auto">
        <table class="w-full text-right text-xs">
          <!-- ترويسة الجدول -->
          <thead class="bg-solar-bg-subtle text-solar-text-muted border-b border-solar-border-card text-[11px] font-bold">
            <tr>
              <th scope="col" class="py-4 px-4 text-center w-20">صورة المنتج</th>
              <th scope="col" class="py-4 px-4 min-w-[240px]">اسم المنتج والموديل (SKU)</th>
              <th scope="col" class="py-4 px-4 text-center">الماركة والتصنيف</th>
              <th scope="col" class="py-4 px-4 text-center">نطاق التوصيل</th>
              <th scope="col" class="py-4 px-4 text-center">السعر الفردي</th>
              <th scope="col" class="py-4 px-4 text-center">المخزون المتوفر</th>
              <th scope="col" class="py-4 px-4 text-center">الحد الأدنى</th>
              <th scope="col" class="py-4 px-4 text-center">الضمان</th>
              <th scope="col" class="py-4 px-4 text-center">الحالة</th>
              <th scope="col" class="py-4 px-4 text-center w-28">الإجراءات</th>
            </tr>
          </thead>

          <!-- محتوى الجدول -->
          <tbody class="divide-y divide-solar-border-card bg-white dark:bg-solar-bg-card">
            <!-- حالة التحميل -->
            <tr v-if="isLoading">
              <td colspan="10" class="py-16 text-center text-solar-text-muted">
                <Loader2 class="size-8 animate-spin mx-auto text-solar-yellow mb-2" />
                <p class="font-bold text-solar-text-heading">جارٍ جلب وتحديث المنتجات من قاعدة البيانات...</p>
              </td>
            </tr>

            <!-- حالة عدم وجود نتائج -->
            <tr v-else-if="filteredProducts.length === 0">
              <td colspan="10" class="py-16 text-center text-solar-text-muted">
                <Package class="size-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p class="font-bold text-solar-text-heading">لا توجد منتجات مطابقة لخيارات البحث أو الفلتر الحالية</p>
                <button
                  type="button"
                  @click="searchQuery = ''; selectedCategory = 'all'; selectedBrand = 'all'; selectedGovernorate = 'all'; selectedStatus = 'all'"
                  class="mt-3 inline-flex text-xs font-bold text-solar-yellow-dark hover:underline cursor-pointer"
                >
                  إعادة ضبط الفلاتر
                </button>
              </td>
            </tr>

            <!-- صفوف المنتجات الحقيقية -->
            <tr
              v-for="product in paginatedProducts"
              :key="product.id"
              class="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
            >
              <!-- 1. صورة المنتج مع دعم الروابط الحقيقية والبدائل -->
              <td class="py-3.5 px-4 text-center">
                <div
                  @click="previewImage = product.image"
                  class="size-14 mx-auto rounded-xl border border-solar-border-card bg-solar-bg-subtle p-1 flex items-center justify-center overflow-hidden cursor-zoom-in hover:scale-105 transition-transform"
                  title="انقر لتكبير الصورة"
                >
                  <img
                    :src="product.image"
                    :alt="product.title"
                    @error="handleImageError($event, product)"
                    class="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>
              </td>

              <!-- 2. الاسم والموديل (SKU) -->
              <td class="py-3.5 px-4">
                <div class="font-black text-sm text-solar-text-heading leading-tight line-clamp-2">
                  {{ product.title }}
                </div>
                <div class="mt-1 font-mono text-[11px] text-solar-text-muted font-bold">
                  {{ product.sku }}
                </div>
              </td>

              <!-- 3. الماركة والتصنيف -->
              <td class="py-3.5 px-4 text-center">
                <div class="font-bold text-xs text-solar-text-heading">
                  {{ product.brand }}
                </div>
                <div class="text-[10px] text-solar-text-muted mt-0.5">
                  {{ product.category }}
                </div>
              </td>

              <!-- 4. نطاق التوصيل / المحافظة -->
              <td class="py-3.5 px-4 text-center">
                <span class="inline-flex items-center gap-1 rounded-lg bg-solar-bg-subtle px-2 py-0.5 text-[11px] font-bold text-solar-text-muted border border-solar-border-card">
                  <MapPin class="size-3 text-solar-yellow-dark" />
                  <span>{{ product.governorate_name || 'شامل' }}</span>
                </span>
              </td>

              <!-- 5. السعر الفردي -->
              <td class="py-3.5 px-4 text-center">
                <div class="font-black text-sm text-solar-text-heading font-mono">
                  {{ product.unitPrice.toLocaleString('en-US') }}
                </div>
                <div class="text-[10px] text-solar-text-muted font-bold">ر.س</div>
              </td>

              <!-- 6. المخزون المتوفر -->
              <td class="py-3.5 px-4 text-center">
                <span
                  v-if="product.stockQuantity <= 0"
                  class="font-black text-xs text-rose-600 dark:text-rose-400"
                >
                  0 (نفد المخزون)
                </span>
                <span v-else class="font-black text-solar-text-heading font-mono">
                  {{ product.stockQuantity }} <span class="text-[10px] font-sans text-solar-text-muted">{{ product.unitLabel || 'وحدة' }}</span>
                </span>
              </td>

              <!-- 7. الحد الأدنى للطلب -->
              <td class="py-3.5 px-4 text-center font-bold text-solar-text-muted font-mono">
                {{ product.minOrderQty }}
              </td>

              <!-- 8. الضمان -->
              <td class="py-3.5 px-4 text-center font-bold text-xs text-solar-text-heading">
                {{ product.warrantyPeriod || '–' }}
              </td>

              <!-- 9. الحالة -->
              <td class="py-3.5 px-4 text-center">
                <span
                  v-if="product.status === 'active'"
                  class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/70"
                >
                  <span class="size-1.5 rounded-full bg-emerald-500"></span>
                  <span>نشط</span>
                </span>
                <span
                  v-else-if="product.status === 'out_of_stock'"
                  class="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-black text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/70"
                >
                  <span class="size-1.5 rounded-full bg-rose-500"></span>
                  <span>نفد</span>
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200"
                >
                  <span class="size-1.5 rounded-full bg-slate-400"></span>
                  <span>غير نشط</span>
                </span>
              </td>

              <!-- 10. الإجراءات السريعة -->
              <td class="py-3.5 px-4 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <!-- زر تبديل النشاط السريع -->
                  <button
                    type="button"
                    @click="toggleStatus(product.id)"
                    :title="product.status === 'active' ? 'إخفاء المنتج مؤقتاً' : 'تفعيل ونشر المنتج'"
                    class="p-1.5 rounded-lg text-solar-text-muted hover:text-solar-text-heading hover:bg-solar-bg-subtle transition-colors cursor-pointer"
                  >
                    <Eye v-if="product.status === 'active'" class="size-4" />
                    <EyeOff v-else class="size-4 text-slate-400" />
                  </button>

                  <!-- زر التعديل -->
                  <button
                    type="button"
                    @click="openEditModal(product)"
                    title="تعديل بيانات المنتج"
                    class="p-1.5 rounded-lg text-solar-text-muted hover:text-solar-navy-dark hover:bg-solar-bg-subtle transition-colors cursor-pointer"
                  >
                    <Edit3 class="size-4" />
                  </button>

                  <!-- زر الحذف -->
                  <button
                    type="button"
                    @click="handleDelete(product.id)"
                    title="حذف المنتج من المتجر"
                    class="p-1.5 rounded-lg text-solar-text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 class="size-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- تذييل الجدول وترقيم الصفحات -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-solar-border-card text-xs text-solar-text-muted bg-white dark:bg-solar-bg-card">
        <div>
          الصفحة <span class="font-bold text-solar-text-heading">{{ currentPage }}</span> من
          <span class="font-bold text-solar-text-heading">{{ totalPages }}</span> صفحات
          (إجمالي <span class="font-bold text-solar-text-heading">{{ filteredProducts.length }}</span> منتج)
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

    <!-- النوافذ المنبثقة للإضافة والتعديل -->
    <AddProductModal
      :is-open="isAddModalOpen"
      :catalog="masterCatalog"
      :governorates="governorates"
      :is-submitting="isActionLoading"
      @close="isAddModalOpen = false"
      @submit="handleAddSubmit"
    />

    <EditProductModal
      :is-open="isEditModalOpen"
      :product="selectedProduct"
      :governorates="governorates"
      :is-submitting="isActionLoading"
      @close="isEditModalOpen = false"
      @submit="handleEditSubmit"
    />

    <!-- نافذة تكبير ومعاينة الصورة الحقيقية للمنتج -->
    <Teleport to="body">
      <div
        v-if="previewImage"
        class="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-solar-navy-dark/80 backdrop-blur-sm cursor-zoom-out"
        @click="previewImage = null"
      >
        <div class="relative max-w-xl max-h-[80vh] rounded-3xl bg-white p-4 shadow-2xl border border-white/20">
          <img
            :src="previewImage"
            alt="معاينة صورة المنتج"
            class="max-h-[70vh] w-auto object-contain mx-auto rounded-2xl"
          />
          <button
            type="button"
            @click="previewImage = null"
            class="absolute top-2 left-2 size-8 rounded-full bg-slate-900/80 text-white flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      </div>
    </Teleport>

    <!-- إشعار العملية المنبثق السريع -->
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
