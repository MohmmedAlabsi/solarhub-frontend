<script setup lang="ts">
import {
  BatteryCharging,
  Cpu,
  Download,
  Droplets,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sun,
  Trash2,
  Zap,
} from 'lucide-vue-next'
import AdminPagination from '../../../components/admin/common/AdminPagination.vue'
import AddProductModal from '../../../components/admin/products/AddProductModal.vue'
import type { Brand, Category, MasterProduct, PaginationMeta } from '../../../../types/api'
import { downloadAdminCsv } from '../../../composables/useAdminWorkspace'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة المنتجات والكتالوج | لوحة الإدارة العامة' })

const route = useRoute()
const router = useRouter()

const {
  fetchCategories,
  fetchBrands,
  fetchMasterProducts,
  toggleProductStatus,
  deleteMasterProduct,
} = useAdminCatalog()

// Query states synced with URL for SSR & bookmarking
const page = computed(() => Number(route.query.page) || 1)
const searchQuery = ref((route.query.search as string) || '')
const selectedCategory = ref<string | number>((route.query.category_id as string) || 'all')
const selectedStatus = ref<'all' | 'active' | 'inactive'>('all')

// Modal state
const isProductModalOpen = ref(false)
const editingProduct = ref<MasterProduct | null>(null)

// Delete modal confirmation state
const productToDelete = ref<MasterProduct | null>(null)
const isDeleting = ref(false)

// Non-blocking SSR Data Fetching with useLazyAsyncData for instant sidebar navigation
const {
  data: catalogData,
  pending: isLoading,
  refresh: refreshCatalog,
} = useLazyAsyncData(
  'admin_master_catalog',
  async () => {
    const [productsRes, catList, brandList] = await Promise.all([
      fetchMasterProducts({
        page: page.value,
        category_id: selectedCategory.value !== 'all' ? selectedCategory.value : undefined,
        search: searchQuery.value.trim() || undefined,
      }),
      fetchCategories(),
      fetchBrands(),
    ])

    return {
      products: productsRes.products,
      meta: productsRes.meta,
      categories: catList,
      brands: brandList,
    }
  },
  {
    watch: [page],
  }
)

const categories = computed<Category[]>(() => catalogData.value?.categories || [])
const brands = computed<Brand[]>(() => catalogData.value?.brands || [])
const products = computed<MasterProduct[]>(() => catalogData.value?.products || [])
const paginationMeta = computed<PaginationMeta>(() => catalogData.value?.meta || {
  current_page: page.value,
  last_page: 5,
  per_page: 20,
  total: 100,
})

// Debounced search watcher to sync URL query
let searchDebounce: ReturnType<typeof setTimeout> | undefined
watch(searchQuery, (newVal) => {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    updateQuery({ search: newVal.trim() || undefined, page: 1 })
  }, 400)
})

// Watch category selection to sync URL query
watch(selectedCategory, (newCat) => {
  updateQuery({
    category_id: newCat !== 'all' ? newCat : undefined,
    page: 1,
  })
})

function updateQuery(newParams: Record<string, any>) {
  const current = { ...route.query }
  Object.keys(newParams).forEach((key) => {
    if (newParams[key] === undefined || newParams[key] === null || newParams[key] === '') {
      delete current[key]
    } else {
      current[key] = String(newParams[key])
    }
  })
  router.push({ query: current })
  // Trigger async refresh if query changes
  setTimeout(() => refreshCatalog(), 50)
}

function onPageChange(newPage: number) {
  updateQuery({ page: newPage })
}

const displayedProducts = computed(() => {
  if (selectedStatus.value === 'all') return products.value
  const activeBool = selectedStatus.value === 'active'
  return products.value.filter(p => !!p.is_active === activeBool)
})

function getCategoryIcon(catName?: string) {
  if (!catName) return Layers
  if (catName.includes('ألواح') || catName.includes('لوح') || catName.toLowerCase().includes('panel')) return Sun
  if (catName.includes('إنفرتر') || catName.includes('محول') || catName.toLowerCase().includes('inverter')) return Zap
  if (catName.includes('بطار') || catName.toLowerCase().includes('battery')) return BatteryCharging
  if (catName.includes('مضخ') || catName.toLowerCase().includes('pump')) return Droplets
  if (catName.includes('شحن') || catName.toLowerCase().includes('controller')) return Cpu
  return Layers
}

async function handleToggleStatus(item: MasterProduct) {
  await toggleProductStatus(item)
}

// Open modal for editing with product data populated
function openEditModal(item: MasterProduct) {
  editingProduct.value = item
  isProductModalOpen.value = true
}

// Open modal for adding a new product
function openCreateModal() {
  editingProduct.value = null
  isProductModalOpen.value = true
}

function handleProductCreated(newProduct: MasterProduct) {
  if (catalogData.value?.products) {
    catalogData.value.products.unshift(newProduct)
    if (catalogData.value.meta) {
      catalogData.value.meta.total = (catalogData.value.meta.total || 0) + 1
    }
  }
}

function handleProductUpdated(updatedProduct: MasterProduct) {
  if (catalogData.value?.products) {
    const idx = catalogData.value.products.findIndex(p => p.id === updatedProduct.id)
    if (idx !== -1) {
      catalogData.value.products[idx] = { ...catalogData.value.products[idx], ...updatedProduct }
    }
  }
}

function confirmDelete(item: MasterProduct) {
  productToDelete.value = item
}

async function executeDelete() {
  if (!productToDelete.value) return
  isDeleting.value = true
  const id = productToDelete.value.id
  try {
    const success = await deleteMasterProduct(id)
    if (success) {
      if (catalogData.value?.products) {
        catalogData.value.products = catalogData.value.products.filter(p => p.id !== id)
        if (catalogData.value.meta) {
          catalogData.value.meta.total = Math.max(0, (catalogData.value.meta.total || 1) - 1)
        }
      }
      productToDelete.value = null
    }
  } finally {
    isDeleting.value = false
  }
}

function exportCatalogCsv() {
  const headers = ['رقم المعرف', 'اسم المنتج', 'التصنيف', 'العلامة التجارية', 'رقم الموديل', 'الحالة']
  const rows = displayedProducts.value.map(p => [
    p.id,
    p.title,
    p.category?.name_ar || 'غير محدد',
    p.brand?.name || 'غير محدد',
    p.model_number || '---',
    p.is_active ? 'مفعل' : 'معطل',
  ])
  downloadAdminCsv(`كتالوج_المنتجات_المرجعية_SolarHub_صفحة_${page.value}`, headers, rows)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- كارد الصفحة الرئيسي -->
    <div class="solar-card p-5 sm:p-7">
      <!-- الهيدر وعناوين الصفحة وأزرار الإجراءات الرئيسية -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-solar-border-card/60 pb-6">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-solar-text-heading">إدارة المنتجات والكتالوج</h1>
          <p class="mt-1 text-xs sm:text-sm text-solar-text-muted">
            عرض وإدارة منتجات الكتالوج المرجعي الموحد، تصنيفاتها ومواصفاتها القياسية في منصة Solar Hub.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="() => refreshCatalog()"
            :disabled="isLoading"
            class="btn-outline h-11 px-4 text-xs font-bold gap-2 text-solar-text-body hover:bg-solar-bg-subtle"
            title="تحديث بيانات الكتالوج من السيرفر"
          >
            <RefreshCw class="size-4" :class="{ 'animate-spin': isLoading }" />
            <span>تحديث</span>
          </button>

          <button
            type="button"
            @click="exportCatalogCsv"
            class="btn-outline h-11 px-4 text-xs font-bold gap-2"
            title="تصدير بيانات الصفحة الحالية كملف CSV"
          >
            <Download class="size-4" />
            <span>تصدير الكتالوج</span>
          </button>

          <button
            type="button"
            @click="openCreateModal"
            class="btn-primary h-11 px-5 text-xs font-bold gap-2 bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md flex items-center"
          >
            <Plus class="size-4" />
            <span>إضافة منتج</span>
          </button>
        </div>
      </div>

      <!-- شريط البحث والتصفية -->
      <div class="mt-6 grid gap-3 sm:grid-cols-12">
        <div class="relative sm:col-span-6">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ابحث باسم المنتج، الموديل، أو العلامة التجارية..."
            class="solar-input h-11 pr-10 text-xs"
          />
          <Search class="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted" />
        </div>

        <div class="sm:col-span-3">
          <select v-model="selectedCategory" class="solar-input h-11 text-xs">
            <option value="all">كافة التصنيفات (الكل)</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name_ar }} {{ cat.name_en ? `(${cat.name_en})` : '' }}
            </option>
          </select>
        </div>

        <div class="sm:col-span-3">
          <select v-model="selectedStatus" class="solar-input h-11 text-xs">
            <option value="all">حالة التفعيل: الكل</option>
            <option value="active">مفعل (نشط بالكتالوج)</option>
            <option value="inactive">معطل (مسودة)</option>
          </select>
        </div>
      </div>

      <!-- مؤشر التحميل أثناء تحديث البيانات -->
      <div v-if="isLoading" class="py-16 flex flex-col items-center justify-center gap-3 text-solar-text-muted">
        <Loader2 class="size-8 animate-spin text-solar-navy" />
        <span class="text-xs font-bold">جارٍ جلب وتحديث منتجات الكتالوج...</span>
      </div>

      <!-- جدول المنتجات المرجعية -->
      <div v-else class="mt-6 overflow-x-auto rounded-xl border border-solar-border-card/80">
        <table class="w-full text-right text-xs">
          <thead class="bg-solar-bg-subtle/70 text-solar-text-muted font-bold border-b border-solar-border-card">
            <tr>
              <th class="py-3.5 px-4 font-bold">اسم المنتج</th>
              <th class="py-3.5 px-4 font-bold">التصنيف</th>
              <th class="py-3.5 px-4 font-bold">العلامة التجارية</th>
              <th class="py-3.5 px-4 font-bold font-mono">رقم الموديل</th>
              <th class="py-3.5 px-4 font-bold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-solar-border-card/60">
            <tr
              v-for="item in displayedProducts"
              :key="item.id"
              class="transition-colors hover:bg-solar-bg-subtle/30"
            >
              <!-- اسم المنتج والأيقونة والوصف -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-bg-subtle border border-solar-border-card text-solar-navy-dark">
                    <component :is="getCategoryIcon(item.category?.name_ar)" class="size-5" />
                  </div>
                  <div class="flex flex-col">
                    <span class="font-extrabold text-solar-text-heading text-sm">{{ item.title }}</span>
                    <span class="text-[11px] text-solar-text-muted">{{ item.description || 'منتج قياسي معتمد' }}</span>
                  </div>
                </div>
              </td>

              <!-- التصنيف -->
              <td class="py-3.5 px-4">
                <span class="inline-block rounded-lg bg-solar-bg-subtle border border-solar-border-card px-2.5 py-1 text-xs font-semibold text-solar-text-body">
                  {{ item.category?.name_ar || 'عام' }}
                </span>
              </td>

              <!-- العلامة التجارية -->
              <td class="py-3.5 px-4">
                <span class="font-bold text-solar-navy-dark">{{ item.brand?.name || '---' }}</span>
              </td>

              <!-- رقم الموديل -->
              <td class="py-3.5 px-4 font-mono text-solar-text-body">
                {{ item.model_number || '---' }}
              </td>

              <!-- الإجراءات -->
              <td class="py-3.5 px-4">
                <div class="flex items-center justify-center gap-1">
                  <!-- رابط ملف المواصفات Datasheet إذا وجد -->
                  <a
                    v-if="item.datasheet_url"
                    :href="item.datasheet_url"
                    target="_blank"
                    class="flex size-8 items-center justify-center rounded-lg text-solar-text-body hover:bg-solar-bg-subtle hover:text-solar-navy transition-colors"
                    title="تحميل المواصفات الفنية PDF"
                  >
                    <Eye class="size-4" />
                  </a>
                  <button
                    v-else
                    type="button"
                    @click="openEditModal(item)"
                    class="flex size-8 items-center justify-center rounded-lg text-solar-text-body hover:bg-solar-bg-subtle hover:text-solar-navy transition-colors"
                    title="معاينة المنتج"
                  >
                    <Eye class="size-4" />
                  </button>

                  <!-- زر التعديل المباشر: يقوم بتعبئة واجهة التعديل ببيانات السجل -->
                  <button
                    type="button"
                    @click="openEditModal(item)"
                    class="flex size-8 items-center justify-center rounded-lg text-solar-text-body hover:bg-amber-50 hover:text-amber-600 transition-colors"
                    title="تعديل بيانات المنتج"
                  >
                    <Pencil class="size-4" />
                  </button>

                  <button
                    type="button"
                    @click="handleToggleStatus(item)"
                    class="flex size-8 items-center justify-center rounded-lg text-solar-text-body hover:bg-solar-bg-subtle hover:text-slate-700 transition-colors"
                    :title="item.is_active ? 'تعطيل المنتج' : 'تفعيل المنتج'"
                  >
                    <EyeOff v-if="item.is_active" class="size-4 text-emerald-600" />
                    <Eye v-else class="size-4 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    @click="confirmDelete(item)"
                    class="flex size-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                    title="حذف المنتج"
                  >
                    <Trash2 class="size-4" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!displayedProducts.length">
              <td colspan="5" class="py-12 text-center text-solar-text-muted">
                لا توجد منتجات مطابقة لخيارات البحث الحالية في الكتالوج.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- الترقيم وشريط التقدم الديناميكي مع دعم كامل للتنقل بين الصفحات -->
      <AdminPagination
        :current-page="paginationMeta.current_page || 1"
        :total-pages="paginationMeta.last_page || 1"
        :total-count="paginationMeta.total || 100"
        :page-size="paginationMeta.per_page || 20"
        item-name="منتج مسجل بالكتالوج"
        @update:current-page="onPageChange"
      />
    </div>

    <!-- نافذة تأكيد حذف المنتج -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="productToDelete"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-solar-border-card flex flex-col gap-4">
            <div class="flex items-center gap-3 text-rose-600">
              <div class="flex size-10 items-center justify-center rounded-xl bg-rose-100">
                <Trash2 class="size-5" />
              </div>
              <h3 class="text-base font-bold text-solar-text-heading">تأكيد حذف المنتج</h3>
            </div>

            <p class="text-xs text-solar-text-body leading-relaxed">
              هل أنت متأكد من رغبتك في حذف المنتج:
              <strong class="text-solar-text-heading">"{{ productToDelete.title }}"</strong> من الكتالوج المرجعي؟
              هذا الإجراء نهائي ولا يمكن التراجع عنه.
            </p>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-solar-border-card/60">
              <button
                type="button"
                :disabled="isDeleting"
                @click="productToDelete = null"
                class="btn-outline h-10 px-4 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="button"
                :disabled="isDeleting"
                @click="executeDelete"
                class="btn-primary h-10 px-5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2"
              >
                <Loader2 v-if="isDeleting" class="size-3.5 animate-spin" />
                <span>{{ isDeleting ? 'جارٍ الحذف...' : 'نعم، احذف المنتج' }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- نافذة إضافة / تعديل منتج (يتم تعبئتها ببيانات السجل تلقائياً عند النقر على أيقونة التعديل) -->
    <AddProductModal
      v-model="isProductModalOpen"
      :edit-product="editingProduct"
      @created="handleProductCreated"
      @updated="handleProductUpdated"
    />
  </div>
</template>
