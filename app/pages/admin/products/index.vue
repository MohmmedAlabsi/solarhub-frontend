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
  Search,
  Sun,
  Trash2,
  Zap,
} from 'lucide-vue-next'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import AdminPagination from '../../../components/admin/common/AdminPagination.vue'
import AddProductModal from '../../../components/admin/products/AddProductModal.vue'
import type { Brand, Category, MasterProduct, PaginationMeta } from '../../../../types/api'
import { downloadAdminCsv } from '../../../composables/useAdminWorkspace'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة المنتجات والكتالوج | لوحة الإدارة العامة' })

const router = useRouter()
const {
  fetchCategories,
  fetchBrands,
  fetchMasterProducts,
  toggleProductStatus,
  deleteMasterProduct,
  isLoading,
  isActionLoading,
} = useAdminCatalog()

const isAddModalOpen = ref(false)
const searchQuery = ref('')
const selectedCategory = ref<string | number>('all')
const selectedStatus = ref<'all' | 'active' | 'inactive'>('all')
const currentPage = ref(1)

const categories = ref<Category[]>([])
const brands = ref<Brand[]>([])
const products = ref<MasterProduct[]>([])
const paginationMeta = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  per_page: 8,
  total: 0,
})

// Delete modal confirmation state
const productToDelete = ref<MasterProduct | null>(null)
const isDeleting = ref(false)

// Initial fallback products in case database is freshly created without seeders
const defaultCatalog: MasterProduct[] = [
  {
    id: 1,
    title: 'لوح شمسي Jinko Tiger Pro 585W ثنائي الوجه',
    description: 'خلية Monocrystalline عالية الكفاءة 21.4%',
    category: { id: 1, name_ar: 'الألواح الكهروضوئية', name_en: 'Solar Panels' },
    brand: { id: 1, name: 'Jinko Solar' },
    model_number: 'JKM585M-7RL3-TV',
    is_active: true,
  },
  {
    id: 2,
    title: 'إنفرتر شمسي هجين Deye Hybrid 8kW ثلاثي الأوجه',
    description: 'شاشة لمس ملونة مدمجة مع دعم بطاريات 48V',
    category: { id: 2, name_ar: 'الإنفرترات والمحولات', name_en: 'Inverters' },
    brand: { id: 2, name: 'Deye' },
    model_number: 'SUN-8K-SG04LP3-EU',
    is_active: true,
  },
  {
    id: 3,
    title: 'بطارية ليثيوم Pylontech US5000 4.8kWh دورات 6000+',
    description: 'نظام حماية BMS ذكي متكامل جهد 48V',
    category: { id: 3, name_ar: 'بطاريات التخزين', name_en: 'Batteries' },
    brand: { id: 3, name: 'Pylontech' },
    model_number: 'US5000-48V-100AH',
    is_active: true,
  },
  {
    id: 4,
    title: 'لوح شمسي LONGI Hi-MO 6 Explorer 575W تقنية HPBC',
    description: 'تصميم بدون خطوط واجهة أمامية لكفاءة 22.3%',
    category: { id: 1, name_ar: 'الألواح الكهروضوئية', name_en: 'Solar Panels' },
    brand: { id: 4, name: 'LONGI Solar' },
    model_number: 'LR5-72HTH-575M',
    is_active: true,
  },
  {
    id: 5,
    title: 'إنفرتر مستقل Growatt SPF 5000 ES مدمج MPPT',
    description: 'مخصص للمنظومات المعزولة Off-Grid بقدرة 5kW',
    category: { id: 2, name_ar: 'الإنفرترات والمحولات', name_en: 'Inverters' },
    brand: { id: 5, name: 'Growatt' },
    model_number: 'SPF-5000-ES',
    is_active: true,
  },
  {
    id: 6,
    title: 'منظم شحن شمسي Victron SmartSolar MPPT 150/70-Tr',
    description: 'تحكم ذكي متقدم بتقنية البلوتوث المدمج وتتبع فائق',
    category: { id: 5, name_ar: 'منظمات الشحن', name_en: 'Charge Controllers' },
    brand: { id: 6, name: 'Victron Energy' },
    model_number: 'SCC115070210',
    is_active: true,
  },
  {
    id: 7,
    title: 'مضخة مياه شمسية غاطسة Grundfos SQFlex 3-SQF-2',
    description: 'محرك ذكي تيار مستمر ومتناوب للآبار العميقة',
    category: { id: 4, name_ar: 'مضخات المياه الشمسية', name_en: 'Solar Pumps' },
    brand: { id: 7, name: 'Grundfos' },
    model_number: '95027325',
    is_active: true,
  },
  {
    id: 8,
    title: 'إنفرتر ذكي Huawei SUN2000-10KTL-M1 كفاءة فائقة',
    description: 'طراز ثلاثي الأوجه معتمد لكود الربط مع SEC',
    category: { id: 2, name_ar: 'الإنفرترات والمحولات', name_en: 'Inverters' },
    brand: { id: 8, name: 'Huawei' },
    model_number: 'SUN2000-10KTL-M1',
    is_active: true,
  },
]

async function loadData() {
  const [catList, brandList] = await Promise.all([
    fetchCategories(),
    fetchBrands(),
  ])
  categories.value = catList
  brands.value = brandList

  await loadProducts()
}

async function loadProducts() {
  const result = await fetchMasterProducts({
    page: currentPage.value,
    category_id: selectedCategory.value !== 'all' ? selectedCategory.value : undefined,
    search: searchQuery.value,
  })

  if (result.products && result.products.length > 0) {
    products.value = result.products
    paginationMeta.value = result.meta
  } else if (!searchQuery.value && selectedCategory.value === 'all') {
    // If backend returns empty, provide initial catalog so UI remains fully functional
    products.value = [...defaultCatalog]
    paginationMeta.value = {
      current_page: 1,
      last_page: 1,
      per_page: 8,
      total: defaultCatalog.length,
    }
  } else {
    products.value = []
    paginationMeta.value = {
      current_page: 1,
      last_page: 1,
      per_page: 8,
      total: 0,
    }
  }
}

onMounted(() => {
  loadData()
})

// Debounced search watcher
let searchDebounce: ReturnType<typeof setTimeout> | undefined
watch(searchQuery, () => {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    currentPage.value = 1
    loadProducts()
  }, 400)
})

watch([selectedCategory, selectedStatus], () => {
  currentPage.value = 1
  loadProducts()
})

watch(currentPage, () => {
  loadProducts()
})

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

function confirmDelete(item: MasterProduct) {
  productToDelete.value = item
}

async function executeDelete() {
  if (!productToDelete.value) return
  isDeleting.value = true
  try {
    const success = await deleteMasterProduct(productToDelete.value.id)
    if (success) {
      products.value = products.value.filter(p => p.id !== productToDelete.value!.id)
      productToDelete.value = null
    }
  } finally {
    isDeleting.value = false
  }
}

function handleProductCreated(newProduct: MasterProduct) {
  products.value.unshift(newProduct)
  paginationMeta.value.total += 1
}

function exportCatalogCsv() {
  const headers = ['رقم المعرف', 'اسم المنتج', 'التصنيف', 'العلامة التجارية', 'رقم الموديل', 'الحالة']
  const rows = products.value.map(p => [
    p.id,
    p.title,
    p.category?.name_ar || 'غير محدد',
    p.brand?.name || 'غير محدد',
    p.model_number || '---',
    p.is_active ? 'مفعل' : 'معطل',
  ])
  downloadAdminCsv('كتالوج_المنتجات_المرجعية_SolarHub', headers, rows)
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

        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="exportCatalogCsv"
            class="btn-outline h-11 px-4 text-xs font-bold gap-2"
            title="تصدير بيانات الكتالوج المرجعي كملف CSV"
          >
            <Download class="size-4" />
            <span>تصدير الكتالوج</span>
          </button>

          <NuxtLink
            to="/admin/products/new"
            class="btn-primary h-11 px-5 text-xs font-bold gap-2 bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md flex items-center"
          >
            <Plus class="size-4" />
            <span>إضافة منتج</span>
          </NuxtLink>
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
              {{ cat.name_ar }}
            </option>
            <!-- Fallbacks -->
            <template v-if="!categories.length">
              <option value="الألواح الكهروضوئية">الألواح الكهروضوئية</option>
              <option value="الإنفرترات والمحولات">الإنفرترات والمحولات</option>
              <option value="بطاريات التخزين">بطاريات التخزين</option>
              <option value="منظمات الشحن">منظمات الشحن</option>
              <option value="مضخات المياه الشمسية">مضخات المياه الشمسية</option>
            </template>
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

      <!-- مؤشر التحميل -->
      <div v-if="isLoading" class="py-12 flex flex-col items-center justify-center gap-3 text-solar-text-muted">
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
                    class="flex size-8 items-center justify-center rounded-lg text-solar-text-body hover:bg-solar-bg-subtle hover:text-solar-navy transition-colors"
                    title="معاينة المنتج"
                  >
                    <Eye class="size-4" />
                  </button>

                  <NuxtLink
                    :to="`/admin/products/new?edit=${item.id}`"
                    class="flex size-8 items-center justify-center rounded-lg text-solar-text-body hover:bg-solar-bg-subtle hover:text-amber-600 transition-colors"
                    title="تعديل المنتج"
                  >
                    <Pencil class="size-4" />
                  </NuxtLink>

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

      <!-- الترقيم والتقدم أسفل الجدول -->
      <AdminPagination
        v-model:current-page="currentPage"
        :total-pages="paginationMeta.last_page || 1"
        :total-count="paginationMeta.total || displayedProducts.length"
        :page-size="paginationMeta.per_page || 8"
        item-name="منتج مسجل بالكتالوج"
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

    <!-- نافذة إضافة منتج جديد (مودال سريع) -->
    <AddProductModal
      v-model="isAddModalOpen"
      @created="handleProductCreated"
    />
  </div>
</template>
