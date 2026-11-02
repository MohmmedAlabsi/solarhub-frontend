<script setup lang="ts">
import {
  Award,
  Box,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  PackageCheck,
  PackageSearch,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Truck,
  Wrench,
} from 'lucide-vue-next'
import { useCustomerProducts, type CustomerProductView } from '~~/app/composables/useCustomerProducts'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'كتالوج المنتجات ومكونات الطاقة الشمسية | SolarHub',
  description: 'تصفح وشراء منتجات ومعدات الطاقة الكهروضوئية المعتمدة (Tier 1) من الموردين والوكلاء المعتمدين.',
})

const {
  categories,
  brands,
  governorates,
  fetchCategories,
  fetchBrands,
  fetchGovernorates,
  fetchStoreProducts,
  fetchMasterProducts,
} = useCustomerProducts()

// أنماط العرض: إضافة للسلة (شراء فوري) أو طلب عرض سعر (RFQ)
const displayMode = ref<'cart' | 'rfq'>('cart')
const searchQuery = ref('')
const selectedBrand = ref<string | number>('all')
const selectedGovernorate = ref<string | number>('all')
const selectedCategory = ref<string | number>('all')

const isLoading = ref(true)
const storeProductsList = ref<CustomerProductView[]>([])
const masterProductsList = ref<CustomerProductView[]>([])

// ترقيم الصفحات
const currentPage = ref(1)
const totalItems = ref(0)
const lastPage = ref(1)

// نافذة RFQ
const selectedProductForRfq = ref<any | null>(null)
const isRfqModalOpen = ref(false)

function openRfqModal(product: any) {
  selectedProductForRfq.value = product
  isRfqModalOpen.value = true
}

// جلب البيانات الأولية
const loadInitialFilters = async () => {
  await Promise.allSettled([
    fetchCategories(),
    fetchBrands(),
    fetchGovernorates(),
  ])
}

// جلب المنتجات وفقاً للوضع والفلاتر
const loadProducts = async () => {
  isLoading.value = true
  try {
    if (displayMode.value === 'cart') {
      // وضع الشراء الفوري والسلة: جلب عروض المتاجر المتاحة
      const items = await fetchStoreProducts({
        category_id: selectedCategory.value === 'all' ? undefined : selectedCategory.value,
        governorate_id: selectedGovernorate.value === 'all' ? undefined : selectedGovernorate.value,
      })
      storeProductsList.value = items
      totalItems.value = filteredStoreProducts.value.length
      lastPage.value = Math.max(1, Math.ceil(filteredStoreProducts.value.length / 12))
    } else {
      // وضع عروض الأسعار: جلب الكتالوج المرجعي الشامل
      const result = await fetchMasterProducts({
        page: currentPage.value,
        per_page: 12,
        category_id: selectedCategory.value === 'all' ? undefined : selectedCategory.value,
        brand_id: selectedBrand.value === 'all' ? undefined : selectedBrand.value,
        search: searchQuery.value,
      })
      masterProductsList.value = result.products
      totalItems.value = result.meta.total
      lastPage.value = result.meta.last_page
      currentPage.value = result.meta.current_page
    }
  } catch (err) {
    console.error('Error loading customer products:', err)
  } finally {
    isLoading.value = false
  }
}

// مراقبة التبديل بين الأنماط وإعادة التحميل
watch(displayMode, () => {
  currentPage.value = 1
  loadProducts()
})

// تصفية نتائج المتجر محلياً حسب البحث والموديل والماركة
const filteredStoreProducts = computed(() => {
  return storeProductsList.value.filter((p) => {
    const q = searchQuery.value.trim().toLowerCase()
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.model.toLowerCase().includes(q) ||
      p.storeName.toLowerCase().includes(q)

    const matchBrand =
      selectedBrand.value === 'all' ||
      String(p.brand).toLowerCase().includes(String(selectedBrand.value).toLowerCase())

    return matchSearch && matchBrand
  })
})

// تحديث إجمالي العناصر والصفحات عند تغير الفلترة في وضع السلة
watch([filteredStoreProducts, displayMode], () => {
  if (displayMode.value === 'cart') {
    totalItems.value = filteredStoreProducts.value.length
    lastPage.value = Math.max(1, Math.ceil(filteredStoreProducts.value.length / 12))
    if (currentPage.value > lastPage.value) {
      currentPage.value = 1
    }
  }
})

// المنتجات المعروضة في الصفحة الحالية
const displayedProducts = computed(() => {
  if (displayMode.value === 'rfq') {
    return masterProductsList.value
  }

  // في وضع السلة (store products): تقطيع حسب الصفحة الحالية (12 منتج لكل صفحة)
  const pageSize = 12
  const start = (currentPage.value - 1) * pageSize
  return filteredStoreProducts.value.slice(start, start + pageSize)
})

// أرقام الصفحات المعروضة بشكل نافذة منزلقة
const visiblePages = computed(() => {
  const pages: number[] = []
  const maxButtons = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxButtons / 2))
  let end = Math.min(lastPage.value, start + maxButtons - 1)

  if (end - start + 1 < maxButtons) {
    start = Math.max(1, end - maxButtons + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

function handleSearchSubmit() {
  currentPage.value = 1
  loadProducts()
}

function handlePageChange(page: number) {
  if (page < 1 || page > lastPage.value) return
  currentPage.value = page
  if (displayMode.value === 'rfq') {
    loadProducts()
  }
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

onMounted(async () => {
  await loadInitialFilters()
  await loadProducts()
})
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- فتات الخبز (Breadcrumbs) -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/customer/dashboard" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading">كتالوج المنتجات ومكونات الطاقة</span>
    </nav>

    <!-- رأس الصفحة وبطاقات الإحصاءات المعتمدة -->
    <header class="flex flex-col gap-4 text-center sm:text-right">
      <div class="flex flex-col gap-2">
        <h1 class="text-2xl font-extrabold text-solar-text-heading md:text-3xl">
          كتالوج المنتجات ومكونات الطاقة الكهروضوئية
        </h1>
        <p class="max-w-4xl text-sm leading-relaxed text-solar-text-secondary">
          تصفح وشراء أكثر من 240 منتج أصلي من كبرى الماركات العالمية (Tier 1) مباشرة من الوكلاء والموزعين المعتمدين مع فواتير ضريبية وضمانات مصنعية حتى 25 عاماً.
        </p>
      </div>

      <!-- كبسولات الأرقام والشارات الإحصائية -->
      <div class="flex flex-wrap items-center gap-3 pt-2">
        <span class="inline-flex items-center gap-2 rounded-xl bg-solar-status-info-bg px-3.5 py-1.5 text-xs font-bold text-solar-status-info-text border border-blue-100">
          <Box class="size-4" />
          <span>معدة مسجلة +245</span>
        </span>
        <span class="inline-flex items-center gap-2 rounded-xl bg-solar-status-info-bg px-3.5 py-1.5 text-xs font-bold text-solar-status-info-text border border-blue-100">
          <ShieldCheck class="size-4" />
          <span>وكلاء معتمدون</span>
        </span>
        <span class="inline-flex items-center gap-2 rounded-xl bg-solar-status-info-bg px-3.5 py-1.5 text-xs font-bold text-solar-status-info-text border border-blue-100">
          <Award class="size-4" />
          <span>معايير فحص Tier 1 عالمية</span>
        </span>
      </div>
    </header>

    <!-- شريط البحث السريع والتبديل بين وضعي الشراء وطلب عرض السعر -->
    <div class="flex flex-col gap-4 rounded-2xl border border-solar-border-card bg-white p-4 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row">
        <!-- حقل البحث -->
        <form @submit.prevent="handleSearchSubmit" class="relative flex-1">
          <Search class="absolute top-3.5 right-3.5 size-4 text-solar-text-muted" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="ابحث باسم المنتج، الموديل، الماركة (مثل: Jinko, Deye, Pylontech)..."
            class="solar-input pr-10"
          />
        </form>

        <button type="button" @click="handleSearchSubmit" class="btn-dark px-6">
          <span>بحث</span>
        </button>

        <!-- زر التبديل التفاعلي بين وضع الشراء المباشر وطلب عرض السعر -->
        <div class="flex items-center rounded-xl bg-solar-bg-subtle p-1 border border-solar-border-card text-xs font-bold">
          <button
            type="button"
            @click="displayMode = 'cart'"
            class="rounded-lg px-3 py-2 transition-all cursor-pointer flex items-center gap-1.5"
            :class="displayMode === 'cart' ? 'bg-solar-yellow text-solar-navy-dark shadow-sm' : 'text-solar-text-secondary hover:text-solar-text-heading'"
          >
            <span>عروض المتاجر (شراء فوري)</span>
            <span
              class="rounded-full px-1.5 py-0.5 text-[10px] font-black"
              :class="displayMode === 'cart' ? 'bg-solar-navy text-white' : 'bg-solar-border-card text-solar-text-muted'"
            >
              {{ storeProductsList.length }}
            </span>
          </button>
          <button
            type="button"
            @click="displayMode = 'rfq'"
            class="rounded-lg px-3 py-2 transition-all cursor-pointer flex items-center gap-1.5"
            :class="displayMode === 'rfq' ? 'bg-solar-navy text-white shadow-sm' : 'text-solar-text-secondary hover:text-solar-text-heading'"
          >
            <span>كتالوج المعدات الشامل (RFQ)</span>
            <span
              class="rounded-full px-1.5 py-0.5 text-[10px] font-black"
              :class="displayMode === 'rfq' ? 'bg-solar-yellow text-solar-navy-dark' : 'bg-solar-border-card text-solar-text-muted'"
            >
              245+
            </span>
          </button>
        </div>
      </div>

      <!-- الفلاتر المنسدلة (تصفية النتائج) -->
      <div class="flex flex-wrap items-center gap-3 border-t border-solar-border-card pt-3 text-xs">
        <span class="flex items-center gap-1.5 font-bold text-solar-text-heading">
          <SlidersHorizontal class="size-4 text-solar-yellow" />
          تصفية النتائج:
        </span>

        <!-- فلتر التصنيف -->
        <select
          v-model="selectedCategory"
          @change="loadProducts"
          class="rounded-lg border border-solar-border-input bg-white px-3 py-1.5 text-xs text-solar-text-body focus:outline-none"
        >
          <option value="all">التصنيف: كافة الأنواع</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name_ar || cat.name_en }}
          </option>
        </select>

        <!-- فلتر الماركة -->
        <select
          v-model="selectedBrand"
          @change="loadProducts"
          class="rounded-lg border border-solar-border-input bg-white px-3 py-1.5 text-xs text-solar-text-body focus:outline-none"
        >
          <option value="all">الماركة: الكل</option>
          <option v-for="b in brands" :key="b.id" :value="b.id || b.name">
            {{ b.name }}
          </option>
        </select>

        <!-- فلتر المحافظة (في وضع السلة والمتاجر) -->
        <select
          v-if="displayMode === 'cart'"
          v-model="selectedGovernorate"
          @change="loadProducts"
          class="rounded-lg border border-solar-border-input bg-white px-3 py-1.5 text-xs text-solar-text-body focus:outline-none"
        >
          <option value="all">المحافظة: كافة المناطق</option>
          <option v-for="gov in governorates" :key="gov.id" :value="gov.id">
            {{ gov.name_ar }}
          </option>
        </select>
      </div>
    </div>

    <!-- مؤشر التحميل أثناء جلب المنتجات -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <Loader2 class="size-10 animate-spin text-solar-yellow mb-4" />
      <p class="text-sm font-semibold text-solar-text-muted">جاري تحميل المنتجات من قاعدة البيانات المعتمدة...</p>
    </div>

    <!-- شبكة المنتجات عند اكتمال التحميل -->
    <div v-else-if="displayedProducts.length > 0" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <CustomerEcommerceProductCard
        v-for="product in displayedProducts"
        :key="product.id"
        :product="product"
        :mode="displayMode"
        @open-rfq="openRfqModal"
      />
    </div>

    <!-- الحالة الفارغة عند عدم العثور على نتائج -->
    <div
      v-else
      class="flex flex-col items-center justify-center rounded-2xl border border-solar-border-card bg-white p-12 text-center shadow-sm"
    >
      <div class="flex size-20 items-center justify-center rounded-full bg-solar-bg-subtle text-solar-text-muted mb-4">
        <PackageSearch class="size-10 stroke-[1.5]" />
      </div>
      <h3 class="text-lg font-bold text-solar-text-heading mb-1">لا توجد منتجات مطابقة لخيارات التصفية</h3>
      <p class="text-xs text-solar-text-muted max-w-sm mb-5">
        لم نتمكن من العثور على منتجات تطابق الفلاتر المحددة حالياً. حاول إعادة ضبط خيارات البحث أو التصفية.
      </p>
      <button
        type="button"
        @click="selectedCategory = 'all'; selectedBrand = 'all'; selectedGovernorate = 'all'; searchQuery = ''; loadProducts()"
        class="btn-primary text-xs px-5 py-2"
      >
        إعادة ضبط خيارات الفلترة
      </button>
    </div>

    <!-- شريط الترقيم والتنقل بين الصفحات (Pagination) -->
    <div
      v-if="!isLoading && lastPage > 1"
      class="flex flex-col items-center justify-between gap-4 rounded-xl border border-solar-border-card bg-white p-4 sm:flex-row"
    >
      <span class="text-xs text-solar-text-muted">
        صفحة {{ currentPage }} من {{ lastPage }} (إجمالي {{ totalItems }} منتج مسجل)
      </span>

      <div class="flex items-center gap-1.5 text-xs font-bold">
        <button
          type="button"
          @click="handlePageChange(currentPage - 1)"
          :disabled="currentPage === 1"
          class="flex size-8 items-center justify-center rounded-lg border border-solar-border-card text-solar-text-muted hover:border-solar-navy-dark hover:text-solar-navy-dark disabled:opacity-40 disabled:cursor-not-allowed"
          title="الصفحة السابقة"
        >
          <ChevronRight class="size-4" />
        </button>

        <button
          v-if="visiblePages[0] > 1"
          type="button"
          @click="handlePageChange(1)"
          class="flex size-8 items-center justify-center rounded-lg border border-solar-border-card text-xs text-solar-text-body hover:bg-solar-bg-subtle"
        >
          1
        </button>
        <span v-if="visiblePages[0] > 2" class="px-1 text-solar-text-muted">...</span>

        <button
          v-for="p in visiblePages"
          :key="p"
          type="button"
          @click="handlePageChange(p)"
          class="flex size-8 items-center justify-center rounded-lg border text-xs"
          :class="currentPage === p ? 'bg-solar-navy-dark text-white border-solar-navy-dark font-black' : 'border-solar-border-card text-solar-text-body hover:bg-solar-bg-subtle'"
        >
          {{ p }}
        </button>

        <span v-if="visiblePages[visiblePages.length - 1] < lastPage - 1" class="px-1 text-solar-text-muted">...</span>
        <button
          v-if="visiblePages[visiblePages.length - 1] < lastPage"
          type="button"
          @click="handlePageChange(lastPage)"
          class="flex size-8 items-center justify-center rounded-lg border border-solar-border-card text-xs text-solar-text-body hover:bg-solar-bg-subtle"
        >
          {{ lastPage }}
        </button>

        <button
          type="button"
          @click="handlePageChange(currentPage + 1)"
          :disabled="currentPage === lastPage"
          class="flex size-8 items-center justify-center rounded-lg border border-solar-border-card text-solar-text-muted hover:border-solar-navy-dark hover:text-solar-navy-dark disabled:opacity-40 disabled:cursor-not-allowed"
          title="الصفحة التالية"
        >
          <ChevronLeft class="size-4" />
        </button>
      </div>
    </div>

    <!-- بانر مميزات وضمانات سولار هب -->
    <section class="grid gap-4 rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm md:grid-cols-2 lg:grid-cols-4">
      <div class="flex items-start gap-3.5">
        <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-solar-status-info-bg text-solar-status-info-text">
          <ShieldCheck class="size-6" />
        </div>
        <div class="flex flex-col gap-1">
          <h2 class="text-sm font-bold text-solar-text-heading">وكلاء وموردون موثقون</h2>
          <p class="text-xs leading-relaxed text-solar-text-muted">سجلات تجارية مفحوصة ومطابقة تامة للكود والمواصفات القياسية المعتمدة.</p>
        </div>
      </div>

      <div class="flex items-start gap-3.5">
        <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-solar-status-info-bg text-solar-status-info-text">
          <Truck class="size-6" />
        </div>
        <div class="flex flex-col gap-1">
          <h2 class="text-sm font-bold text-solar-text-heading">شحن مخصص للمعدات</h2>
          <p class="text-xs leading-relaxed text-solar-text-muted">تغليف آمن وناقلون معتمدون لنقل الألواح والبطاريات الحساسة بدون مخاطر.</p>
        </div>
      </div>

      <div class="flex items-start gap-3.5">
        <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-solar-status-info-bg text-solar-status-info-text">
          <PackageCheck class="size-6" />
        </div>
        <div class="flex flex-col gap-1">
          <h2 class="text-sm font-bold text-solar-text-heading">ضمانات معتمدة حتى 25 سنة</h2>
          <p class="text-xs leading-relaxed text-solar-text-muted">فواتير إلكترونية معتمدة وضمان خطي مباشر مع كل طلبية تشتريها.</p>
        </div>
      </div>

      <div class="flex items-start gap-3.5">
        <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-solar-status-info-bg text-solar-status-info-text">
          <Wrench class="size-6" />
        </div>
        <div class="flex flex-col gap-1">
          <h2 class="text-sm font-bold text-solar-text-heading">مطابقة أحمال هندسية</h2>
          <p class="text-xs leading-relaxed text-solar-text-muted">إشراف هندسي للتأكد من توافق المكونات قبل الشحن واعتماد التثبيت الميداني.</p>
        </div>
      </div>
    </section>

    <!-- النافذة المنبثقة لطلب عرض السعر -->
    <CustomerEcommerceRfqModal
      :product="selectedProductForRfq"
      :is-open="isRfqModalOpen"
      @close="isRfqModalOpen = false"
    />
  </div>
</template>
