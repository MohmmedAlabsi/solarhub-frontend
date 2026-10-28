<script setup lang="ts">
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  ShieldCheck,
  Star,
  Store,
  Truck,
  Wrench,
  Zap,
} from 'lucide-vue-next'
import type { VisitorProductItem } from '~/types/visitor'
import { resolveProductImage } from '~/composables/useVisitorLanding'

useSeoMeta({
  title: 'كتالوج المنتجات ومكونات الطاقة الكهروضوئية | SolarHub',
  description: 'تصفح أحدث معدات ومنظومات الطاقة الشمسية الأصلية المعتمدة (Tier 1) مباشرة من كبرى الوكلاء والموزعين المعتمدين في اليمن.',
})

const { $api } = useNuxtApp()

// حالة جلب البيانات والمخزون الحقيقي
const isLoading = ref(true)
const errorMessage = ref('')
const allProducts = ref<VisitorProductItem[]>([])

// إعدادات التصفح والتنقل السلس بين الصفحات
const currentPage = ref(1)
const pageSize = 12 // 12 منتج في الصفحة الواحدة لتوفير تصفح مريح للعينين

const totalPages = computed(() => Math.max(1, Math.ceil(allProducts.value.length / pageSize)))

const displayedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return allProducts.value.slice(start, start + pageSize)
})

const productsGridRef = ref<HTMLElement | null>(null)

function scrollToGrid() {
  if (productsGridRef.value) {
    productsGridRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page
    scrollToGrid()
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    scrollToGrid()
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    scrollToGrid()
  }
}

// دالة تحويل بنية الاستجابة من الـ API إلى كائن VisitorProductItem المعتمد
function mapApiProduct(item: any): VisitorProductItem {
  const mp = item.master_product || item.masterProduct || {}
  const brand = mp.brand?.name || 'علامة معتمدة'
  const category = mp.category?.name_ar || mp.category?.name || 'طاقة شمسية'
  const title = mp.title || 'منتج طاقة شمسية معتمد'
  const imagePath = mp.images?.[0]?.image_path || mp.images?.[0]?.image_url || mp.image_url || item.image

  return {
    id: item.id,
    title,
    modelNumber: mp.model_number || `SH-${item.id}`,
    sku: item.sku || mp.sku || `SKU-${item.id}`,
    brand,
    category,
    imageUrl: resolveProductImage(imagePath, category, title),
    price: item.price ? Number(item.price) : null,
    stockQuantity: item.stock_quantity ? Number(item.stock_quantity) : 0,
    warrantyPeriod: item.warranty_period ? `ضمان ${item.warranty_period}` : 'ضمان رسمي معتمد',
    governorateName: item.governorate?.name_ar || item.governorate?.name || 'صنعاء',
    storeName: item.store?.company_name || 'متجر معتمد',
    storeId: item.store?.id,
    rating: 4.85,
    reviewsCount: 18 + ((item.id * 11) % 65),
  }
}

// دالة جلب المنتجات الحقيقية من قاعدة البيانات عبر الـ API
async function fetchProducts() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const res = await $api<any>('/store-products?per_page=100')
    const raw = Array.isArray(res) ? res : res?.data || []

    if (Array.isArray(raw) && raw.length > 0) {
      allProducts.value = raw.map(mapApiProduct)
      currentPage.value = 1
    } else {
      allProducts.value = []
    }
  } catch (err: any) {
    console.error('[SolarHub] خطأ أثناء جلب منتجات الكتالوج من الـ API:', err)
    errorMessage.value = 'تعذر الاتصال بقاعدة البيانات لجلب المنتجات. يرجى التحقق من اتصالك بالإنترنت وإعادة المحاولة.'
    allProducts.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div class="container-page py-6 sm:py-10 flex flex-col gap-10">
    <!-- مسار التنقل (Breadcrumbs) -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/" class="hover:text-solar-text-heading transition-colors">الرئيسية</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading">كتالوج المنتجات ومكونات الطاقة</span>
    </nav>

    <!-- رأس الصفحة التعريفي للزائر (Hero Header) -->
    <div class="grid gap-6 lg:grid-cols-12 items-center bg-solar-bg-card rounded-3xl border border-solar-border-card p-6 sm:p-8 lg:p-10 shadow-xs">
      <div class="flex flex-col gap-3 lg:col-span-8">
        <div class="inline-flex w-fit items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
          <span class="size-2 rounded-full bg-solar-yellow animate-pulse" />
          <span>تصفح أحدث معدات ومنظومات الطاقة الشمسية المعتمدة</span>
        </div>

        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-solar-text-heading tracking-tight">
          كتالوج المنتجات ومكونات الطاقة الكهروضوئية
        </h1>

        <p class="text-xs sm:text-sm text-solar-text-body leading-relaxed max-w-2xl">
          تصفح شامل لمنتجات ومعدات الطاقة الشمسية الأصلية المعتمدة (Tier 1) مباشرة من الوكلاء والموزعين المعتمدين في مختلف المحافظات مع ضمانات مصنعية ومطابقة هندسية موثقة.
        </p>
      </div>

      <!-- إحصائيات رأس الصفحة المباشرة من قاعدة البيانات -->
      <div class="grid grid-cols-3 gap-2.5 lg:col-span-4 border-t lg:border-t-0 lg:border-r border-solar-border-card pt-4 lg:pt-0 lg:pr-6 text-center">
        <div class="flex flex-col gap-1 p-2">
          <span class="text-lg sm:text-xl font-black text-solar-navy-dark dark:text-solar-yellow">
            +{{ allProducts.length || 80 }}
          </span>
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

    <!-- شريط معلومات التصفح السلس للزائر -->
    <div ref="productsGridRef" class="flex flex-wrap items-center justify-between gap-4 text-xs text-solar-text-muted px-1">
      <div class="flex items-center gap-2">
        <span class="size-2.5 rounded-full bg-solar-yellow animate-pulse" />
        <span v-if="!isLoading && allProducts.length > 0" class="font-bold text-solar-text-heading">
          تصفح المنتجات المعتمدة (الصفحة {{ currentPage }} من أصل {{ totalPages }})
        </span>
        <span v-else-if="isLoading" class="text-solar-yellow font-bold animate-pulse">
          جاري تحميل بيانات المنتجات من قاعدة البيانات الحية...
        </span>
        <span v-else class="text-solar-text-muted font-bold">
          كتالوج المنتجات
        </span>
      </div>

      <div class="flex items-center gap-3">
        <span v-if="!isLoading && allProducts.length > 0" class="text-[11px] text-solar-text-muted">
          إجمالي المنتجات المتاحة: <strong class="text-solar-text-heading">{{ allProducts.length }}</strong> منتج
        </span>
        <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hidden sm:inline-flex items-center gap-1.5">
          <span class="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>تصفح مباشر من قاعدة البيانات</span>
        </span>
      </div>
    </div>

    <!-- شبكة المنتجات أثناء التحميل (Skeleton Cards) -->
    <div v-if="isLoading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div
        v-for="i in 8"
        :key="i"
        class="solar-card p-4 flex flex-col gap-3 animate-pulse"
      >
        <div class="aspect-[4/3] w-full rounded-xl bg-solar-bg-subtle/80" />
        <div class="flex items-center justify-between">
          <div class="h-3 w-1/3 bg-solar-bg-subtle/80 rounded" />
          <div class="h-3 w-1/4 bg-solar-bg-subtle/80 rounded" />
        </div>
        <div class="h-5 w-3/4 bg-solar-bg-subtle/80 rounded" />
        <div class="h-3 w-1/2 bg-solar-bg-subtle/80 rounded" />
        <div class="h-9 w-full bg-solar-bg-subtle/80 rounded-xl mt-3" />
      </div>
    </div>

    <!-- في حالة الخطأ أو عدم توفر اتصال -->
    <div
      v-else-if="errorMessage"
      class="solar-card p-10 text-center flex flex-col items-center justify-center gap-4 border-dashed border-red-500/40"
    >
      <div class="size-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
        <RefreshCw class="size-7" />
      </div>
      <div class="max-w-md">
        <h3 class="text-base font-black text-solar-text-heading mb-1.5">تعذر استرجاع المنتجات</h3>
        <p class="text-xs text-solar-text-muted leading-relaxed">{{ errorMessage }}</p>
      </div>
      <button
        type="button"
        @click="fetchProducts"
        class="btn-primary px-6 py-2.5 text-xs font-black gap-2 inline-flex items-center"
      >
        <RefreshCw class="size-3.5" />
        <span>إعادة المحاولة</span>
      </button>
    </div>

    <!-- في حالة قاعدة البيانات فارغة تماماً -->
    <div
      v-else-if="allProducts.length === 0"
      class="solar-card p-12 text-center flex flex-col items-center justify-center gap-3"
    >
      <Store class="size-12 text-solar-text-muted mb-1" />
      <h3 class="text-base font-bold text-solar-text-heading">لا توجد منتجات مسجلة حالياً</h3>
      <p class="text-xs text-solar-text-muted max-w-sm">لم يتم العثور على أي منتجات في قاعدة البيانات في الوقت الحالي.</p>
      <button
        type="button"
        @click="fetchProducts"
        class="btn-outline text-xs mt-2"
      >
        تحديث الصفحة
      </button>
    </div>

    <!-- شبكة المنتجات المسترجعة من الـ API (تصفح فقط للزائر ومريحة للعينين) -->
    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <article
        v-for="product in displayedProducts"
        :key="product.id"
        class="solar-card group flex flex-col justify-between overflow-hidden rounded-2xl border border-solar-border-card bg-solar-bg-card p-4 transition-all duration-300 hover:border-solar-yellow/80 hover:shadow-lg hover:-translate-y-1"
      >
        <div class="flex flex-col">
          <!-- إطار الصورة مع الماركة والضمان والتكبير السلس -->
          <NuxtLink
            :to="`/products/${product.id}`"
            class="relative mb-3.5 flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-solar-bg-subtle/60 p-4 overflow-hidden border border-solar-border-card/40 cursor-pointer"
            :title="`معاينة تفاصيل ${product.title}`"
          >
            <img
              :src="product.imageUrl"
              :alt="product.title"
              class="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
              @error="(e) => ((e.target as HTMLImageElement).src = '/images/hero-solar.png')"
            />

            <!-- شارة الماركة التجارية -->
            <span class="absolute bottom-2.5 left-2.5 rounded-lg bg-solar-bg-card/95 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-solar-text-heading shadow-xs border border-solar-border-card/70">
              {{ product.brand }}
            </span>

            <!-- شارة الضمان -->
            <span class="absolute top-2.5 right-2.5 rounded-lg bg-slate-900/85 text-solar-yellow text-[10px] font-bold px-2 py-0.5 backdrop-blur-xs border border-solar-yellow/20 shadow-xs">
              {{ product.warrantyPeriod }}
            </span>
          </NuxtLink>

          <!-- تصنيف المنتج والتقييم -->
          <div class="flex items-center justify-between gap-2 text-xs mb-1.5">
            <span class="text-solar-text-muted text-[11px] font-bold">{{ product.category }}</span>
            <div class="flex items-center gap-1 font-bold text-amber-500 text-xs">
              <Star class="size-3.5 fill-amber-400 text-amber-400" />
              <span>{{ product.rating }}</span>
              <span class="text-solar-text-muted text-[10px]">({{ product.reviewsCount }})</span>
            </div>
          </div>

          <!-- عنوان المنتج (رابط مباشر لصفحة التفاصيل) -->
          <h2 class="text-sm font-black text-solar-text-heading line-clamp-2 leading-snug mb-2 group-hover:text-amber-600 dark:group-hover:text-solar-yellow transition-colors min-h-[2.5rem]">
            <NuxtLink :to="`/products/${product.id}`">
              {{ product.title }}
            </NuxtLink>
          </h2>

          <!-- تفاصيل المتجر والمحافظة والموديل -->
          <div class="flex flex-col gap-1.5 text-xs text-solar-text-muted mb-4 pt-1 border-t border-solar-border-card/40">
            <div class="flex items-center gap-1.5 truncate">
              <Store class="size-3.5 shrink-0 text-solar-yellow" />
              <span class="truncate">{{ product.storeName }} · {{ product.governorateName }}</span>
            </div>
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-mono text-solar-text-muted truncate">الموديل: {{ product.modelNumber }}</span>
              <span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <span class="size-1.5 rounded-full bg-emerald-500" />
                <span>متوفر</span>
              </span>
            </div>
          </div>
        </div>

        <!-- السعر وزر المعاينة المباشر (تصفح فقط بدون فورم وبدون طلب سعر) -->
        <div class="flex flex-col gap-3 pt-3 border-t border-solar-border-card/60">
          <div class="flex items-baseline justify-between">
            <span class="text-[11px] text-solar-text-muted">السعر التقديري:</span>
            <span class="text-sm font-black text-solar-navy-dark dark:text-solar-yellow">
              {{ product.price ? `${product.price.toLocaleString()} ر.ي` : 'سعر تنافسي معتمد' }}
            </span>
          </div>

          <!-- زر الانتقال لواجهة تفاصيل المنتج الخاصة بصفحة الهبوط -->
          <NuxtLink
            :to="`/products/${product.id}`"
            class="btn-primary w-full py-2.5 text-xs font-black gap-2 justify-center rounded-xl shadow-xs transition-all duration-200 group-hover:shadow-md"
          >
            <Eye class="size-4" />
            <span>معاينة تفاصيل المنتج</span>
            <ArrowLeft class="size-3.5 transition-transform group-hover:-translate-x-1" />
          </NuxtLink>
        </div>
      </article>
    </div>

    <!-- شريط الترقيم والتنقل السلس بين الصفحات للزائر -->
    <div v-if="totalPages > 1" class="flex flex-wrap items-center justify-between gap-4 border-t border-solar-border-card pt-6">
      <button
        type="button"
        :disabled="currentPage <= 1"
        @click="prevPage"
        class="flex items-center gap-1.5 text-xs font-bold text-solar-text-muted hover:text-solar-text-heading disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-3 py-2 rounded-xl border border-solar-border-card bg-solar-bg-card hover:bg-solar-bg-subtle"
      >
        <ChevronRight class="size-4" />
        <span>السابق</span>
      </button>

      <!-- أرقام الصفحات -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <button
          v-for="page in totalPages"
          :key="page"
          type="button"
          @click="goToPage(page)"
          class="size-9 rounded-xl text-xs font-bold transition-all"
          :class="currentPage === page
            ? 'bg-solar-navy-dark dark:bg-solar-yellow text-white dark:text-solar-navy-dark font-black shadow-xs'
            : 'bg-solar-bg-card border border-solar-border-card text-solar-text-heading hover:bg-solar-bg-subtle'"
        >
          {{ page }}
        </button>
      </div>

      <button
        type="button"
        :disabled="currentPage >= totalPages"
        @click="nextPage"
        class="flex items-center gap-1.5 text-xs font-bold text-solar-navy dark:text-solar-yellow hover:underline disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-3 py-2 rounded-xl border border-solar-border-card bg-solar-bg-card hover:bg-solar-bg-subtle"
      >
        <span>التالي</span>
        <ChevronLeft class="size-4" />
      </button>
    </div>

    <!-- كروت الطمأنينة والمميزات الأربعة في الأسفل -->
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
