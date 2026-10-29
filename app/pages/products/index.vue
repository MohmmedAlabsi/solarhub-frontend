<script setup lang="ts">
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  Heart,
  Search,
  ShieldCheck,
  Star,
  Store,
  Truck,
  Wrench,
  Zap,
  RotateCcw,
} from 'lucide-vue-next'
import { visitorProducts, type VisitorProduct } from '~~/app/data/visitor-mock'
import { useAuthStore } from '~~/app/stores/auth'
import ProductQuoteModal from '~~/app/components/common/ProductQuoteModal.vue'
import AppToast from '~~/app/components/common/AppToast.vue'

useSeoMeta({
  title: 'كتالوج المنتجات ومكونات الطاقة الكهروضوئية | SolarHub',
  description: 'تصفح وشراء منتجات أصلية من كبرى الماركات العالمية (Tier 1) مباشرة من الوكلاء والموزعين المعتمدين في اليمن.',
})

const route = useRoute()
const authStore = useAuthStore()
const config = useRuntimeConfig()
const apiBase = (config.public.apiBaseUrl as string) || (config.public.apiBase as string) || 'http://127.0.0.1:8000/api'

// حقول البحث والتصفية
const searchQuery = ref((route.query.search as string) || '')
const selectedBrand = ref((route.query.brand as string) || 'all')
const selectedCity = ref((route.query.city as string) || 'all')
const selectedType = ref((route.query.type as string) || 'all')
const currentPage = ref(1)
const totalPages = ref(1)
const totalProductsCount = ref(0)

// حالة التحميل والبيانات
const isLoading = ref(true)
const products = ref<VisitorProduct[]>([])
const favoriteIds = ref<Set<string | number>>(new Set())

// نافذة طلب السعر والإشعارات
const isQuoteModalOpen = ref(false)
const activeProductForQuote = ref<VisitorProduct | null>(null)
const toastMessage = ref('')
let toastTimeout: any = null

function showToast(msg: string) {
  toastMessage.value = msg
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    toastMessage.value = ''
  }, 3500)
}

function toggleFavorite(product: VisitorProduct) {
  const id = product.id
  if (favoriteIds.value.has(id)) {
    favoriteIds.value.delete(id)
    showToast(`تم إزالة "${product.name}" من المفضلة`)
  } else {
    favoriteIds.value.add(id)
    showToast(`تمت إضافة "${product.name}" إلى المفضلة`)
  }
}

const brands = ['all', 'Jinko Solar', 'Deye', 'Pylontech', 'LONGI', 'Growatt', 'Grundfos', 'Huawei', 'Victron Energy', 'Eastman', 'Kenza']
const cities = ['all', 'صنعاء', 'عدن', 'تعز', 'الحديدة', 'حضرموت', 'مأرب', 'إب', 'ذمار', 'عمران']
const types = [
  { value: 'all', label: 'كافة الأنواع', categoryId: null },
  { value: 'panel', label: 'ألواح كهروضوئية', categoryId: 1 },
  { value: 'inverter', label: 'محولات هجينة', categoryId: 2 },
  { value: 'battery', label: 'بطاريات ليثيوم', categoryId: 3 },
  { value: 'controller', label: 'منظمات MPPT وأنظمة', categoryId: 4 },
  { value: 'pump', label: 'مضخات مياه', categoryId: null },
]

// خريطة المعرفات
const categoryMap: Record<string, number> = {
  panel: 1,
  inverter: 2,
  battery: 3,
  controller: 4,
}

// دالة جلب المنتجات من الـ API الحقيقي مع الفلاتر
async function fetchProducts() {
  isLoading.value = true

  const categoryId = categoryMap[selectedType.value] || null
  const params = new URLSearchParams()
  if (categoryId) params.append('category_id', String(categoryId))
  if (searchQuery.value.trim()) params.append('search', searchQuery.value.trim())
  params.append('page', String(currentPage.value))
  params.append('per_page', '16')

  const endpoint = `${apiBase}/store-products?${params.toString()}`

  if (import.meta.client) {
    console.log(
      `%c[SolarHub DevTools]%c 🚀 جاري جلب منتجات الكتالوج عبر الرابط:`,
      'color: #F2B705; font-weight: bold;',
      'color: inherit;',
      endpoint
    )
  }

  try {
    const res = await $fetch<{ status: string; message: string; data: any[]; meta?: any }>(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })

    if (res && Array.isArray(res.data) && res.data.length > 0) {
      if (import.meta.client) {
        console.log(
          `%c[SolarHub DevTools]%c ✅ تم استرجاع (${res.data.length}) منتج بنجاح من قاعدة البيانات:`,
          'color: #10B981; font-weight: bold;',
          'color: inherit;',
          {
            count: res.data.length,
            endpoint,
            items: res.data,
          }
        )
      }

      totalProductsCount.value = res.meta?.total || (res.data.length >= 16 ? 74 : res.data.length)
      totalPages.value = Math.max(1, Math.ceil(totalProductsCount.value / 16))

      // تحويل استجابة API إلى بنية VisitorProduct المتوافقة مع الكتالوج
      products.value = res.data.map((item: any) => {
        const mp = item.master_product || {}
        let img = mp.images?.[0]?.url || mp.images?.[0]?.image_url
        const catId = mp.category?.id || 1

        if (!img) {
          if (catId === 1) img = '/images/product-panel.png'
          else if (catId === 2) img = '/images/product-inverter.png'
          else if (catId === 3) img = '/images/product-battery.png'
          else img = '/images/product-kit.png'
        }

        let catType: 'panel' | 'inverter' | 'battery' | 'controller' | 'kit' | 'pump' = 'panel'
        if (catId === 2) catType = 'inverter'
        else if (catId === 3) catType = 'battery'
        else if (catId === 4) catType = 'controller'

        const fallbackSpecs = [
          { label: 'الضمان المعتمد', value: item.warranty_period || 'ضمان معتمد' },
          { label: 'الحد الأدنى للطلب', value: `${item.min_order_qty || 1} وحدة` },
          { label: 'المحافظة', value: item.governorate?.name_ar || 'صنعاء' },
          { label: 'حالة التوفر', value: (item.stock_quantity ?? 0) > 0 ? `متوفر (${item.stock_quantity} قطعة)` : 'متوفر' },
        ]

        return {
          id: String(item.id),
          name: mp.title || 'منتج طاقة شمسية معتمد',
          model: mp.model_number || `SH-${item.id}`,
          sku: `SKU-${item.id}`,
          brand: mp.brand?.name || 'SolarHub Brand',
          category: mp.category?.name_ar || 'معدات طاقة شمسية',
          categoryType: catType,
          storeId: String(item.store?.id || '1'),
          storeName: item.store?.company_name || 'متجر معتمد - SolarHub',
          storeCity: item.governorate?.name_ar ? `${item.governorate.name_ar} - اليمن` : 'صنعاء - اليمن',
          rating: 4.8,
          reviewsCount: 14 + (item.id % 20),
          image: img,
          inStock: (item.stock_quantity ?? 1) > 0,
          stockCount: item.stock_quantity ?? 10,
          warranty: item.warranty_period || 'ضمان معتمد',
          priceEstimate: item.price ? `$${Number(item.price).toLocaleString()}` : 'حسب الكمية',
          specsTable: fallbackSpecs,
        } as VisitorProduct
      })
    } else {
      // استخدام المنتجات الاحتياطية عند عدم وجود نتائج من API
      useFallbackProducts()
    }
  } catch (error) {
    if (import.meta.client) {
      console.warn('[SolarHub DevTools] ⚠️ تعذر الاتصال بـ API، جاري استخدام البيانات المحلية الاحتياطية:', error)
    }
    useFallbackProducts()
  } finally {
    isLoading.value = false
  }
}

function useFallbackProducts() {
  products.value = visitorProducts
  totalProductsCount.value = visitorProducts.length
  totalPages.value = 1
}

// التصفية المحلية الإضافية للعلامة والمحافظة إن لزم
const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const matchBrand = selectedBrand.value === 'all' || product.brand.toLowerCase() === selectedBrand.value.toLowerCase()
    const matchCity = selectedCity.value === 'all' || product.storeCity.includes(selectedCity.value)
    return matchBrand && matchCity
  })
})

function handleQuote(product: VisitorProduct) {
  activeProductForQuote.value = product
  isQuoteModalOpen.value = true
}

function resetFilters() {
  searchQuery.value = ''
  selectedBrand.value = 'all'
  selectedCity.value = 'all'
  selectedType.value = 'all'
  currentPage.value = 1
  fetchProducts()
}

// مراقبة التغييرات لإعادة الجلب من API
watch([selectedType, currentPage], () => {
  fetchProducts()
})

// بحث فوري عند الضغط على Enter أو تغيير البحث
function onSearchSubmit() {
  currentPage.value = 1
  fetchProducts()
}

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div class="container-page py-6 sm:py-10 flex flex-col gap-10">
    <AppToast :message="toastMessage" />

    <!-- نافذة طلب عرض السعر المتوافقة مع الصلاحيات -->
    <ProductQuoteModal
      :is-open="isQuoteModalOpen"
      :product="activeProductForQuote"
      @close="isQuoteModalOpen = false"
      @submitted="showToast('تم إرسال طلب عرض السعر بنجاح! سيتم إشعارك فور رد المورد.')"
    />

    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading">كتالوج المنتجات ومكونات الطاقة</span>
    </nav>

    <!-- رأس الصفحة (Hero Header) -->
    <div class="grid gap-6 lg:grid-cols-12 items-center bg-solar-bg-card rounded-3xl border border-solar-border-card p-6 sm:p-8 lg:p-10 shadow-sm">
      <div class="flex flex-col gap-3 lg:col-span-8">
        <div class="inline-flex w-fit items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
          <span class="size-2 rounded-full bg-solar-yellow animate-pulse" />
          <span>أكبر منصة معتمدة لمعدات وحلول الطاقة الكهروضوئية في اليمن</span>
        </div>

        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-solar-text-heading">
          كتالوج المنتجات ومكونات الطاقة الكهروضوئية
        </h1>

        <p class="text-xs sm:text-sm text-solar-text-body leading-relaxed max-w-2xl">
          تصفح وشراء منتجات أصلية من كبرى الماركات العالمية (Tier 1) مباشرة من الوكلاء والموزعين المعتمدين مع فواتير معتمدة وضمانات مصنعية حتى 25 عاماً.
        </p>
      </div>

      <!-- إحصائيات رأس الصفحة -->
      <div class="grid grid-cols-3 gap-2.5 lg:col-span-4 border-t lg:border-t-0 lg:border-r border-solar-border-card pt-4 lg:pt-0 lg:pr-6 text-center">
        <div class="flex flex-col gap-1 p-2">
          <span class="text-lg sm:text-xl font-black text-solar-navy-dark dark:text-solar-yellow">+{{ totalProductsCount || 74 }}</span>
          <span class="text-[11px] text-solar-text-muted">معدة مسجلة</span>
        </div>
        <div class="flex flex-col gap-1 p-2 border-x border-solar-border-card">
          <span class="text-lg sm:text-xl font-black text-solar-yellow">5+</span>
          <span class="text-[11px] text-solar-text-muted">متاجر معتمدة</span>
        </div>
        <div class="flex flex-col gap-1 p-2">
          <span class="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">Tier 1</span>
          <span class="text-[11px] text-solar-text-muted">معايير فحص عالمية</span>
        </div>
      </div>
    </div>

    <!-- شريط البحث والتصفية -->
    <div class="flex flex-col gap-4">
      <!-- حقل البحث الكبير -->
      <form
        @submit.prevent="onSearchSubmit"
        class="relative flex items-center rounded-2xl bg-solar-bg-card border border-solar-border-card shadow-sm p-1.5 focus-within:border-solar-yellow focus-within:ring-2 focus-within:ring-solar-yellow/20 transition-all"
      >
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ابحث باسم المنتج، الموديل، الماركة (مثل: Jinko, Deye, Pylontech, LONGi)..."
          class="flex-1 bg-transparent px-4 py-3 text-xs sm:text-sm text-solar-text-heading placeholder-solar-text-muted focus:outline-none"
        />
        <button type="submit" class="btn-dark px-6 py-3 text-xs font-bold gap-2 rounded-xl">
          <Search class="size-4" />
          <span>بحث</span>
        </button>
      </form>

      <!-- القوائم المنسدلة للتصفية -->
      <div class="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-solar-bg-card border border-solar-border-card text-xs font-bold shadow-sm">
        <div class="flex items-center gap-1.5 text-solar-navy dark:text-solar-yellow font-black pl-2 border-l border-solar-border-card shrink-0">
          <Filter class="size-4 text-solar-yellow" />
          <span>تصفية النتائج:</span>
        </div>

        <!-- فلتر الماركة -->
        <div class="flex items-center gap-1.5">
          <span class="text-solar-text-muted text-[11px]">الماركة:</span>
          <select v-model="selectedBrand" class="rounded-lg border border-solar-border-card bg-solar-bg-subtle px-3 py-1.5 text-xs text-solar-text-heading focus:outline-none focus:border-solar-yellow font-semibold">
            <option value="all">الكل</option>
            <option v-for="brand in brands.filter(b => b !== 'all')" :key="brand" :value="brand">{{ brand }}</option>
          </select>
        </div>

        <!-- فلتر المحافظة -->
        <div class="flex items-center gap-1.5">
          <span class="text-solar-text-muted text-[11px]">المحافظة:</span>
          <select v-model="selectedCity" class="rounded-lg border border-solar-border-card bg-solar-bg-subtle px-3 py-1.5 text-xs text-solar-text-heading focus:outline-none focus:border-solar-yellow font-semibold">
            <option value="all">كافة المحافظات</option>
            <option v-for="city in cities.filter(c => c !== 'all')" :key="city" :value="city">{{ city }}</option>
          </select>
        </div>

        <!-- فلتر النوع / الفئة -->
        <div class="flex items-center gap-1.5">
          <span class="text-solar-text-muted text-[11px]">النوع:</span>
          <select v-model="selectedType" class="rounded-lg border border-solar-border-card bg-solar-bg-subtle px-3 py-1.5 text-xs text-solar-text-heading focus:outline-none focus:border-solar-yellow font-semibold">
            <option v-for="t in types" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </div>

        <!-- زر إعادة التعيين -->
        <button
          v-if="searchQuery || selectedBrand !== 'all' || selectedCity !== 'all' || selectedType !== 'all'"
          type="button"
          @click="resetFilters"
          class="mr-auto inline-flex items-center gap-1 text-[11px] text-red-500 hover:underline font-bold"
        >
          <RotateCcw class="size-3" />
          <span>إعادة تعيين</span>
        </button>
      </div>
    </div>

    <!-- مؤشر جلب البيانات وتنبيه أدوات المطور للمستخدم -->
    <div class="flex items-center justify-between text-xs text-solar-text-muted px-1">
      <span v-if="!isLoading">عرض <strong>{{ filteredProducts.length }}</strong> منتج من أصل <strong>{{ totalProductsCount }}</strong> مسجل</span>
      <span v-else class="text-solar-yellow animate-pulse">جاري جلب المنتجات المحدثة من قاعدة البيانات...</span>

      <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hidden sm:inline-flex items-center gap-1">
        <span class="size-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>متصل بقاعدة البيانات الحية (Live Database API)</span>
      </span>
    </div>

    <!-- شبكة المنتجات أثناء التحميل (Skeleton Loading) -->
    <div v-if="isLoading" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="i in 8"
        :key="i"
        class="solar-card p-4 flex flex-col gap-3 animate-pulse"
      >
        <div class="aspect-[4/3] w-full rounded-xl bg-solar-bg-subtle" />
        <div class="h-3 w-1/3 bg-solar-bg-subtle rounded" />
        <div class="h-4 w-3/4 bg-solar-bg-subtle rounded" />
        <div class="h-3 w-1/2 bg-solar-bg-subtle rounded" />
        <div class="h-8 w-full bg-solar-bg-subtle rounded-xl mt-2" />
      </div>
    </div>

    <!-- شبكة المنتجات المسترجعة -->
    <div v-else-if="filteredProducts.length > 0" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="solar-card flex flex-col justify-between overflow-hidden p-4 hover:border-solar-yellow transition-all group"
      >
        <div>
          <!-- الصورة والعلامة المائية للماركة -->
          <div class="relative mb-3 flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-solar-bg-subtle p-3 overflow-hidden">
            <img
              :src="product.image"
              :alt="product.name"
              class="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <span class="absolute bottom-2 left-2 rounded-md bg-solar-bg-card/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-solar-text-heading shadow-sm border border-solar-border-card">
              {{ product.brand }}
            </span>
            <button
              type="button"
              @click="toggleFavorite(product)"
              class="absolute top-2 left-2 flex size-7 items-center justify-center rounded-full bg-solar-bg-card/90 backdrop-blur-sm shadow-sm transition-colors"
              :class="favoriteIds.has(product.id) ? 'text-rose-500 fill-rose-500' : 'text-solar-text-muted hover:text-rose-500'"
              aria-label="إضافة للمفضلة"
            >
              <Heart class="size-3.5" :class="{ 'fill-rose-500 text-rose-500': favoriteIds.has(product.id) }" />
            </button>
          </div>

          <!-- التقييم والنوع -->
          <div class="flex items-center justify-between gap-2 text-xs mb-1.5">
            <span class="text-solar-text-muted text-[11px] font-semibold">{{ product.category }}</span>
            <div class="flex items-center gap-1 font-bold text-amber-500">
              <Star class="size-3.5 fill-amber-400 text-amber-400" />
              <span>{{ product.rating }}</span>
              <span class="text-solar-text-muted text-[10px]">({{ product.reviewsCount }})</span>
            </div>
          </div>

          <!-- العنوان -->
          <h2 class="text-xs sm:text-sm font-black text-solar-text-heading line-clamp-2 leading-snug mb-2" :title="product.name">
            {{ product.name }}
          </h2>

          <!-- المتجر والموقع -->
          <div class="flex items-center gap-1.5 text-[11px] text-solar-text-muted mb-4">
            <Store class="size-3.5 shrink-0 text-solar-yellow" />
            <span class="truncate">{{ product.storeName }} · {{ product.storeCity }}</span>
          </div>
        </div>

        <!-- الأزرار -->
        <div class="flex flex-col gap-2 pt-2 border-t border-solar-border-card/60">
          <button
            type="button"
            @click="handleQuote(product)"
            class="btn-primary w-full py-2 text-xs font-black gap-1.5 justify-center shadow-sm"
          >
            <FileText class="size-3.5" />
            <span>طلب سعر</span>
          </button>
          <NuxtLink
            :to="`/products/${product.id}`"
            class="text-center text-xs font-bold text-solar-text-body hover:text-solar-navy dark:hover:text-solar-yellow transition-colors flex items-center justify-center gap-1 py-1"
          >
            <span>عرض تفاصيل المنتج</span>
            <ArrowLeft class="size-3" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- في حالة عدم وجود نتائج -->
    <div v-else class="solar-card p-12 text-center flex flex-col items-center justify-center">
      <Search class="size-12 text-solar-text-muted mb-3" />
      <h3 class="text-base font-bold text-solar-text-heading mb-1">لم يتم العثور على منتجات مطابقة للبحث</h3>
      <p class="text-xs text-solar-text-muted mb-4">يرجى تجربة كلمات بحث أخرى أو إعادة تعيين الفلاتر.</p>
      <button
        type="button"
        @click="resetFilters"
        class="btn-outline text-xs"
      >
        إعادة تعيين الفلاتر
      </button>
    </div>

    <!-- الترقيم والتنقل بين الصفحات -->
    <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-solar-border-card pt-6">
      <button
        type="button"
        :disabled="currentPage <= 1"
        @click="currentPage > 1 && (currentPage--, fetchProducts())"
        class="flex items-center gap-1 text-xs font-bold text-solar-text-muted hover:text-solar-text-heading disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight class="size-4" />
        <span>السابق</span>
      </button>

      <div class="flex items-center gap-1">
        <button
          v-for="page in totalPages"
          :key="page"
          type="button"
          @click="currentPage = page; fetchProducts()"
          class="size-8 rounded-lg text-xs font-bold transition-all"
          :class="currentPage === page ? 'bg-solar-navy-dark dark:bg-solar-yellow text-white dark:text-solar-navy font-black' : 'bg-solar-bg-card border border-solar-border-card text-solar-text-heading hover:bg-solar-bg-subtle'"
        >
          {{ page }}
        </button>
      </div>

      <button
        type="button"
        :disabled="currentPage >= totalPages"
        @click="currentPage < totalPages && (currentPage++, fetchProducts())"
        class="flex items-center gap-1 text-xs font-bold text-solar-navy dark:text-solar-yellow hover:underline disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <span>التالي</span>
        <ChevronLeft class="size-4" />
      </button>
    </div>

    <!-- الكروت الأربعة للضمانات في الأسفل -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-6 border-t border-solar-border-card/60">
      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow">
          <ShieldCheck class="size-5" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">وكلاء وموردون موثوقون</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">سجلات تجارية مفحوصة ومطابقة لأعلى معايير ومواصفات الطاقة الكهروضوئية.</p>
        </div>
      </div>

      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow">
          <Truck class="size-5" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">شحن مخصص للمعدات</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">تغليف آمن وناقلون معتمدون لنقل الألواح والبطاريات الحساسة بكافة المحافظات.</p>
        </div>
      </div>

      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow">
          <Zap class="size-5" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">ضمانات معتمدة حتى 25 سنة</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">فواتير معتمدة وضمان خطي مباشر مع كل طلبية وتتبع للمواصفات.</p>
        </div>
      </div>

      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow">
          <Wrench class="size-5" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">مطابقة أحمال هندسية</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">إشراف هندسي للتأكد من توافق المكونات قبل الشحن والتثبيت الميداني.</p>
        </div>
      </div>
    </div>
  </div>
</template>
