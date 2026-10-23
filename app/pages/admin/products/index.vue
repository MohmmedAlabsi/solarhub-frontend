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
import AdminSectionHeading from '../../../components/admin/workspace/AdminSectionHeading.vue'
import AdminPagination from '../../../components/admin/common/AdminPagination.vue'
import AddProductModal from '../../../components/admin/products/AddProductModal.vue'
import type { Brand, Category, MasterProduct } from '../../../../types/api'
import { downloadAdminCsv, useAdminTable, adminMatches } from '../../../composables/useAdminWorkspace'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة المنتجات والكتالوج | SolarHub' })

const {
  products,
  categories,
  brands,
  isLoading,
  fetchAllMasterProducts,
  fetchCategories,
  fetchBrands,
  toggleProductStatus,
  deleteMasterProduct,
} = useAdminCatalog()

const { notify } = useAdminNotice()

// Non-blocking SSR Data Fetching مطابق تماماً لواجهة المستخدمين لضمان سرعة فائقة
const { pending } = useLazyAsyncData(
  'admin_master_catalog',
  async () => {
    return await Promise.all([
      fetchAllMasterProducts(false),
      fetchCategories(false),
      fetchBrands(false),
    ])
  },
  {
    default: () => [products.value, categories.value, brands.value],
  }
)

const isRefreshing = ref(false)
async function handleRefresh() {
  isRefreshing.value = true
  try {
    await Promise.all([
      fetchAllMasterProducts(true),
      fetchCategories(true),
      fetchBrands(true),
    ])
    notify('تم تحديث قائمة المنتجات والكتالوج بنجاح.')
  } finally {
    isRefreshing.value = false
  }
}

const searchQuery = ref('')
const selectedCategory = ref<string | number>('all')
const selectedStatus = ref<'all' | 'active' | 'inactive'>('all')

// جدول فوري وسريع في الذاكرة مع حصر دقيق بـ 20 سجلاً لكل صفحة
const { page, filtered, rows, totalPages, pageSize } = useAdminTable(
  () => products.value,
  item => {
    const matchesSearch = adminMatches(
      searchQuery.value,
      item.title,
      item.model_number || '',
      item.brand?.name || '',
      item.category?.name_ar || ''
    )
    const matchesCategory =
      selectedCategory.value === 'all' ||
      String(item.category_id || item.category?.id) === String(selectedCategory.value)
    const matchesStatus =
      selectedStatus.value === 'all' ||
      (selectedStatus.value === 'active' ? !!item.is_active : !item.is_active)

    return matchesSearch && matchesCategory && matchesStatus
  },
  () => [searchQuery.value, selectedCategory.value, selectedStatus.value],
  20 // بالضبط 20 منتج في كل صفحة
)

// Modal states
const isProductModalOpen = ref(false)
const editingProduct = ref<MasterProduct | null>(null)
const productToDelete = ref<MasterProduct | null>(null)
const isDeleting = ref(false)

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

function openEditModal(item: MasterProduct) {
  editingProduct.value = item
  isProductModalOpen.value = true
}

function openCreateModal() {
  editingProduct.value = null
  isProductModalOpen.value = true
}

function handleProductCreated(newProduct: MasterProduct) {
  // تم إضافته مسبقاً في الـ Composable
}

function handleProductUpdated(updatedProduct: MasterProduct) {
  // تم تحديثه مسبقاً في الـ Composable
}

function confirmDelete(item: MasterProduct) {
  productToDelete.value = item
}

async function executeDelete() {
  if (!productToDelete.value) return
  isDeleting.value = true
  try {
    const ok = await deleteMasterProduct(productToDelete.value.id)
    if (ok) {
      productToDelete.value = null
    }
  } finally {
    isDeleting.value = false
  }
}

function exportList() {
  downloadAdminCsv(
    'منتجات_الكتالوج_المرجعي',
    ['اسم المنتج', 'التصنيف', 'العلامة التجارية', 'رقم الموديل', 'الحالة'],
    filtered.value.map(p => [
      p.title,
      p.category?.name_ar || 'عام',
      p.brand?.name || '---',
      p.model_number || '---',
      p.is_active ? 'نشط' : 'معطل',
    ])
  )
}
</script>

<template>
  <div class="admin-managed">
    <!-- عنوان القسم والأزرار الرئيسية -->
    <AdminSectionHeading
      title="إدارة المنتجات والكتالوج المرجعي"
      description="عرض وإدارة الكتالوج الشمسي المرجعي الموحد، والمواصفات الفنية المعتمدة للمنتجات في SolarHub."
    >
      <button class="btn-outline" :disabled="isRefreshing" @click="handleRefresh">
        <RefreshCw class="size-4" :class="isRefreshing ? 'animate-spin' : ''" />
        تحديث
      </button>
      <button class="btn-outline" @click="exportList">
        <Download class="size-4" />
        تصدير القائمة
      </button>
      <button class="btn-dark" @click="openCreateModal">
        <Plus class="size-4" />
        إضافة منتج جديد
      </button>
    </AdminSectionHeading>

    <!-- شريط الفلاتر والبحث اللحظي -->
    <div class="admin-filter">
      <div class="admin-search">
        <Search aria-hidden="true" />
        <input
          v-model="searchQuery"
          type="search"
          aria-label="البحث في الكتالوج"
          placeholder="ابحث باسم المنتج، رقم الموديل، التصنيف أو الماركة..."
          class="solar-input"
        />
      </div>

      <!-- فلتر التصنيف -->
      <select v-model="selectedCategory" class="solar-input" aria-label="تصفية حسب التصنيف">
        <option value="all">كافة التصنيفات (الكل)</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name_ar }}
        </option>
      </select>

      <!-- فلتر حالة النشاط -->
      <select v-model="selectedStatus" class="solar-input" aria-label="تصفية حسب الحالة">
        <option value="all">كافة الحالات</option>
        <option value="active">نشط</option>
        <option value="inactive">معطل</option>
      </select>
    </div>

    <!-- مؤشر التحميل الأولي -->
    <div v-if="pending || isLoading" class="flex flex-col items-center justify-center py-16">
      <Loader2 class="size-8 animate-spin text-solar-yellow mb-2" />
      <span class="text-xs text-solar-text-muted">جاري تحميل بيانات الكتالوج المرجعي بسرعة فائقة...</span>
    </div>

    <!-- جدول المنتجات السريع -->
    <div v-else class="admin-table-wrap">
      <table class="min-w-[1000px] text-right">
        <thead>
          <tr>
            <th>اسم المنتج</th>
            <th>التصنيف</th>
            <th>العلامة التجارية</th>
            <th class="font-mono">رقم الموديل</th>
            <th class="text-center">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in rows"
            :key="item.id"
            class="transition-colors hover:bg-solar-bg-subtle/30"
          >
            <!-- اسم المنتج والأيقونة والوصف -->
            <td class="py-3 px-4">
              <div class="flex items-center gap-3">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-bg-subtle border border-solar-border-card text-solar-navy-dark">
                  <component :is="getCategoryIcon(item.category?.name_ar)" class="size-5" />
                </div>
                <div class="flex flex-col">
                  <span class="font-extrabold text-solar-text-heading text-sm">{{ item.title }}</span>
                  <span class="text-[11px] text-solar-text-muted line-clamp-1 max-w-sm">{{ item.description || 'منتج قياسي معتمد' }}</span>
                </div>
              </div>
            </td>

            <!-- التصنيف -->
            <td class="py-3 px-4">
              <span class="inline-block rounded-lg bg-solar-bg-subtle border border-solar-border-card px-2.5 py-1 text-xs font-semibold text-solar-text-body">
                {{ item.category?.name_ar || 'عام' }}
              </span>
            </td>

            <!-- العلامة التجارية -->
            <td class="py-3 px-4">
              <span class="font-bold text-solar-navy-dark">{{ item.brand?.name || '---' }}</span>
            </td>

            <!-- رقم الموديل -->
            <td class="py-3 px-4 font-mono text-solar-text-body">
              {{ item.model_number || '---' }}
            </td>

            <!-- الإجراءات -->
            <td class="py-3 px-4">
              <div class="flex items-center justify-center gap-1">
                <!-- تحميل المواصفات الفنية Datasheet إذا وجد -->
                <a
                  v-if="item.datasheet_url"
                  :href="item.datasheet_url"
                  target="_blank"
                  class="flex size-8 items-center justify-center rounded-lg text-solar-text-body hover:bg-solar-bg-subtle hover:text-solar-navy transition-colors cursor-pointer"
                  title="تحميل المواصفات الفنية PDF"
                >
                  <Eye class="size-4" />
                </a>
                <button
                  v-else
                  type="button"
                  @click="openEditModal(item)"
                  class="flex size-8 items-center justify-center rounded-lg text-solar-text-body hover:bg-solar-bg-subtle hover:text-solar-navy transition-colors cursor-pointer"
                  title="معاينة المنتج"
                >
                  <Eye class="size-4" />
                </button>

                <!-- زر التعديل المباشر -->
                <button
                  type="button"
                  @click="openEditModal(item)"
                  class="flex size-8 items-center justify-center rounded-lg text-solar-text-body hover:bg-amber-50 hover:text-amber-600 transition-colors cursor-pointer"
                  title="تعديل بيانات المنتج"
                >
                  <Pencil class="size-4" />
                </button>

                <!-- تفعيل / تعطيل -->
                <button
                  type="button"
                  @click="handleToggleStatus(item)"
                  class="flex size-8 items-center justify-center rounded-lg text-solar-text-body hover:bg-solar-bg-subtle hover:text-slate-700 transition-colors cursor-pointer"
                  :title="item.is_active ? 'تعطيل المنتج' : 'تفعيل المنتج'"
                >
                  <EyeOff v-if="item.is_active" class="size-4 text-emerald-600" />
                  <Eye v-else class="size-4 text-slate-400" />
                </button>

                <!-- زر الحذف -->
                <button
                  type="button"
                  @click="confirmDelete(item)"
                  class="flex size-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="حذف المنتج"
                >
                  <Trash2 class="size-4" />
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="!rows.length">
            <td colspan="5" class="admin-empty">
              {{ products.length ? 'لا توجد منتجات مطابقة لخيارات البحث والفلاتر.' : 'لا توجد منتجات مسجلة في الكتالوج.' }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- الترقيم الدقيق المطابق لعدد السجلات 20 سجلاً لكل صفحة بدون صفحات فارغة -->
      <div class="admin-table-footer">
        <AdminPagination
          v-model:current-page="page"
          :total-pages="totalPages"
          :total-count="filtered.length"
          :page-size="pageSize"
          item-name="منتج"
        />
      </div>
    </div>

    <!-- نافذة إضافة وتعديل المنتج -->
    <AddProductModal
      v-model="isProductModalOpen"
      :edit-product="editingProduct"
      @created="handleProductCreated"
      @updated="handleProductUpdated"
    />

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
                class="btn-dark bg-rose-600 hover:bg-rose-700 h-10 px-4 text-xs font-bold text-white border-none flex items-center gap-2"
              >
                <Loader2 v-if="isDeleting" class="size-4 animate-spin" />
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
