<script setup lang="ts">
import {
  BatteryCharging,
  Cpu,
  Download,
  Droplets,
  Eye,
  EyeOff,
  Layers,
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
import type { AdminProduct } from '../../../../types/admin'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة المنتجات والكتالوج | لوحة الإدارة العامة' })

const isAddModalOpen = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedStatus = ref('all')
const currentPage = ref(1)

const initialProducts: AdminProduct[] = [
  {
    id: '1',
    name: 'لوح شمسي Jinko Tiger Pro 585W ثنائي الوجه',
    subtitle: 'خلية Monocrystalline عالية الكفاءة 21.4%',
    category: 'الألواح الكهروضوئية',
    categoryType: 'panel',
    brand: 'Jinko Solar',
    modelNumber: 'JKM585M-7RL3-TV',
    status: 'active',
    images: ['/images/product-panel.png'],
    featuredImageIndex: 0,
  },
  {
    id: '2',
    name: 'إنفرتر شمسي هجين Deye Hybrid 8kW ثلاثي الأوجه',
    subtitle: 'شاشة لمس ملونة مدمجة مع دعم بطاريات 48V',
    category: 'الإنفرترات والمحولات',
    categoryType: 'inverter',
    brand: 'Deye',
    modelNumber: 'SUN-8K-SG04LP3-EU',
    status: 'active',
    images: ['/images/product-panel.png'],
    featuredImageIndex: 0,
  },
  {
    id: '3',
    name: 'بطارية ليثيوم Pylontech US5000 4.8kWh دورات 6000+',
    subtitle: 'نظام حماية BMS ذكي متكامل جهد 48V',
    category: 'بطاريات التخزين',
    categoryType: 'battery',
    brand: 'Pylontech',
    modelNumber: 'US5000-48V-100AH',
    status: 'active',
    images: ['/images/product-panel.png'],
    featuredImageIndex: 0,
  },
  {
    id: '4',
    name: 'لوح شمسي LONGI Hi-MO 6 Explorer 575W تقنية HPBC',
    subtitle: 'تصميم بدون خطوط واجهة أمامية لكفاءة 22.3%',
    category: 'الألواح الكهروضوئية',
    categoryType: 'panel',
    brand: 'LONGI Solar',
    modelNumber: 'LR5-72HTH-575M',
    status: 'active',
    images: ['/images/product-panel.png'],
    featuredImageIndex: 0,
  },
  {
    id: '5',
    name: 'إنفرتر مستقل Growatt SPF 5000 ES مدمج MPPT',
    subtitle: 'مخصص للمنظومات المعزولة Off-Grid بقدرة 5kW',
    category: 'الإنفرترات والمحولات',
    categoryType: 'inverter',
    brand: 'Growatt',
    modelNumber: 'SPF-5000-ES',
    status: 'active',
    images: ['/images/product-panel.png'],
    featuredImageIndex: 0,
  },
  {
    id: '6',
    name: 'منظم شحن شمسي Victron SmartSolar MPPT 150/70-Tr',
    subtitle: 'تحكم ذكي متقدم بتقنية البلوتوث المدمج وتتبع فائق',
    category: 'منظمات الشحن',
    categoryType: 'controller',
    brand: 'Victron Energy',
    modelNumber: 'SCC115070210',
    status: 'active',
    images: ['/images/product-panel.png'],
    featuredImageIndex: 0,
  },
  {
    id: '7',
    name: 'مضخة مياه شمسية غاطسة Grundfos SQFlex 3-SQF-2',
    subtitle: 'محرك ذكي تيار مستمر ومتناوب للآبار العميقة',
    category: 'مضخات المياه الشمسية',
    categoryType: 'pump',
    brand: 'Grundfos',
    modelNumber: '95027325',
    status: 'active',
    images: ['/images/product-panel.png'],
    featuredImageIndex: 0,
  },
  {
    id: '8',
    name: 'إنفرتر ذكي Huawei SUN2000-10KTL-M1 كفاءة فائقة',
    subtitle: 'طراز ثلاثي الأوجه معتمد لكود الربط مع SEC',
    category: 'الإنفرترات والمحولات',
    categoryType: 'inverter',
    brand: 'Huawei',
    modelNumber: 'SUN2000-10KTL-M1',
    status: 'active',
    images: ['/images/product-panel.png'],
    featuredImageIndex: 0,
  },
]

const products = ref<AdminProduct[]>([...initialProducts])

const filteredProducts = computed(() => {
  return products.value.filter((item) => {
    const matchesSearch =
      !searchQuery.value ||
      item.name.includes(searchQuery.value) ||
      item.modelNumber.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesCategory =
      selectedCategory.value === 'all' || item.category === selectedCategory.value

    const matchesStatus =
      selectedStatus.value === 'all' || item.status === selectedStatus.value

    return matchesSearch && matchesCategory && matchesStatus
  })
})

function getCategoryIcon(type: string) {
  switch (type) {
    case 'panel': return Sun
    case 'inverter': return Zap
    case 'battery': return BatteryCharging
    case 'pump': return Droplets
    case 'controller': return Cpu
    default: return Layers
  }
}

function handleProductCreated(newProduct: AdminProduct) {
  products.value.unshift(newProduct)
}

function toggleProductStatus(item: AdminProduct) {
  item.status = item.status === 'active' ? 'inactive' : 'active'
}

function deleteProduct(id: string) {
  products.value = products.value.filter(p => p.id !== id)
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
            class="btn-outline h-11 px-4 text-xs font-bold gap-2"
          >
            <Download class="size-4" />
            <span>تصدير الكتالوج</span>
          </button>

          <button
            type="button"
            @click="isAddModalOpen = true"
            class="btn-primary h-11 px-5 text-xs font-bold gap-2 bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md"
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
            <option value="الألواح الكهروضوئية">الألواح الكهروضوئية</option>
            <option value="الإنفرترات والمحولات">الإنفرترات والمحولات</option>
            <option value="بطاريات التخزين">بطاريات التخزين</option>
            <option value="منظمات الشحن">منظمات الشحن</option>
            <option value="مضخات المياه الشمسية">مضخات المياه الشمسية</option>
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

      <!-- جدول المنتجات المرجعية -->
      <div class="mt-6 overflow-x-auto rounded-xl border border-solar-border-card/80">
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
              v-for="item in filteredProducts"
              :key="item.id"
              class="transition-colors hover:bg-solar-bg-subtle/30"
            >
              <!-- اسم المنتج والأيقونة والوصف -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-bg-subtle border border-solar-border-card text-solar-navy-dark">
                    <component :is="getCategoryIcon(item.categoryType)" class="size-5" />
                  </div>
                  <div class="flex flex-col">
                    <span class="font-extrabold text-solar-text-heading text-sm">{{ item.name }}</span>
                    <span class="text-[11px] text-solar-text-muted">{{ item.subtitle }}</span>
                  </div>
                </div>
              </td>

              <!-- التصنيف -->
              <td class="py-3.5 px-4">
                <span class="inline-block rounded-lg bg-solar-bg-subtle border border-solar-border-card px-2.5 py-1 text-xs font-semibold text-solar-text-body">
                  {{ item.category }}
                </span>
              </td>

              <!-- العلامة التجارية -->
              <td class="py-3.5 px-4">
                <span class="font-bold text-solar-navy-dark">{{ item.brand }}</span>
              </td>

              <!-- رقم الموديل -->
              <td class="py-3.5 px-4 font-mono text-solar-text-body">
                {{ item.modelNumber }}
              </td>

              <!-- الإجراءات -->
              <td class="py-3.5 px-4">
                <div class="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    class="flex size-8 items-center justify-center rounded-lg text-solar-text-body hover:bg-solar-bg-subtle hover:text-solar-navy transition-colors"
                    title="معاينة المنتج"
                  >
                    <Eye class="size-4" />
                  </button>
                  <button
                    type="button"
                    class="flex size-8 items-center justify-center rounded-lg text-solar-text-body hover:bg-solar-bg-subtle hover:text-amber-600 transition-colors"
                    title="تعديل المنتج"
                  >
                    <Pencil class="size-4" />
                  </button>
                  <button
                    type="button"
                    @click="toggleProductStatus(item)"
                    class="flex size-8 items-center justify-center rounded-lg text-solar-text-body hover:bg-solar-bg-subtle hover:text-slate-700 transition-colors"
                    :title="item.status === 'active' ? 'تعطيل المنتج' : 'تفعيل المنتج'"
                  >
                    <EyeOff v-if="item.status === 'active'" class="size-4" />
                    <Eye v-else class="size-4 text-emerald-600" />
                  </button>
                  <button
                    type="button"
                    @click="deleteProduct(item.id)"
                    class="flex size-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                    title="حذف المنتج"
                  >
                    <Trash2 class="size-4" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!filteredProducts.length">
              <td colspan="5" class="py-12 text-center text-solar-text-muted">
                لا توجد منتجات مطابقة لخيارات البحث الحالية.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- الترقيم والتقدم أسفل الجدول -->
      <AdminPagination
        v-model:current-page="currentPage"
        :total-pages="16"
        :total-count="124"
        :page-size="8"
        item-name="منتج مسجل بالكتالوج"
      />
    </div>

    <!-- نافذة إضافة منتج جديد -->
    <AddProductModal
      v-model="isAddModalOpen"
      @created="handleProductCreated"
    />
  </div>
</template>
