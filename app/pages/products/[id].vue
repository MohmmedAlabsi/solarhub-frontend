<script setup lang="ts">
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Heart,
  Package,
  ShieldCheck,
  Star,
  Store,
} from 'lucide-vue-next'
import { visitorProducts } from '~~/app/data/visitor-mock'
import { useAuthModal } from '~~/app/composables/useAuthModal'
import { useAuthStore } from '~~/app/stores/auth'
import ProductQuoteModal from '~~/app/components/common/ProductQuoteModal.vue'
import AppToast from '~~/app/components/common/AppToast.vue'
import { resolveStorageUrl, resolveProductImage } from '~/composables/useVisitorLanding'

const route = useRoute()
const productId = route.params.id as string
const authModal = useAuthModal()
const authStore = useAuthStore()

const isQuoteModalOpen = ref(false)
const isFavorited = ref(false)
const toastMessage = ref('')
let toastTimeout: any = null

function showToast(msg: string) {
  toastMessage.value = msg
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    toastMessage.value = ''
  }, 3500)
}

const config = useRuntimeConfig()
const apiBase = (config.public.apiBaseUrl as string) || (config.public.apiBase as string) || 'http://127.0.0.1:8000/api'

const apiProduct = ref<any>(null)
const isLoadingProduct = ref(false)

async function fetchProductDetails() {
  isLoadingProduct.value = true
  try {
    const res = await $fetch<{ status: string; data: any }>(`${apiBase}/store-products/${productId}`)
    if (res?.data) {
      const item = res.data
      const mp = item.master_product || {}

      // استخراج كافة صور المنتج الحقيقية من قاعدة البيانات
      const rawGallery: string[] = []
      if (Array.isArray(mp.images) && mp.images.length > 0) {
        mp.images.forEach((im: any) => {
          const raw = im.url || im.image_url || im.image_path
          if (raw) {
            rawGallery.push(resolveStorageUrl(raw, '/images/hero-solar.png'))
          }
        })
      }

      const primaryImg = rawGallery[0] || resolveProductImage(null, mp.category?.name_ar || '', mp.title || '')
      if (rawGallery.length === 0) {
        rawGallery.push(primaryImg)
      }

      // إضافة صور توضيحية للمنظومة في حال توفر صورة واحدة فقط لإتاحة تصفح السلايدر
      if (rawGallery.length === 1) {
        rawGallery.push('/images/hero-solar.png')
        rawGallery.push('/images/product-panel.png')
      }

      const specsTable = Array.isArray(mp.specifications) && mp.specifications.length > 0
        ? mp.specifications.map((s: any) => ({
            label: s.name || s.spec_name || 'المواصفة',
            value: s.unit ? `${s.value} ${s.unit}` : s.value,
          }))
        : [
            { label: 'فترة الضمان', value: item.warranty_period ? `ضمان ${item.warranty_period}` : 'ضمان سنتين معتمد' },
            { label: 'الحد الأدنى للطلب', value: `${item.min_order_qty || 1} وحدة` },
            { label: 'المحافظة والتوفر', value: item.governorate?.name_ar ? `${item.governorate.name_ar} - اليمن` : 'صنعاء' },
            { label: 'حالة المخزون', value: (item.stock_quantity ?? 0) > 0 ? `متوفر (${item.stock_quantity} وحدة)` : 'متوفر عند الطلب' },
          ]

      apiProduct.value = {
        id: String(item.id),
        name: mp.title || `منتج رقم ${item.id}`,
        category: mp.category?.name_ar || 'ألواح كهروضوئية',
        categoryType: 'panel',
        brand: mp.brand?.name || 'علامة معتمدة',
        model: mp.model_number || `SH-${item.id}`,
        sku: item.sku || mp.sku || `SH-PROD-${item.id}`,
        storeName: item.store?.company_name || 'شركة شمس اليمن للمهمات الكهروضوئية',
        storeId: String(item.store?.id || '1'),
        storeCity: item.governorate?.name_ar ? `${item.governorate.name_ar} - اليمن` : 'صنعاء - شارع تعز',
        rating: 4.85,
        reviewsCount: 38,
        image: primaryImg,
        gallery: rawGallery,
        badge: item.warranty_period ? `ضمان ${item.warranty_period}` : 'Tier 1 Global',
        tierBadge: 'معتمد رسمياً',
        warranty: item.warranty_period ? `ضمان ${item.warranty_period}` : 'ضمان رسمي معتمد',
        inStock: (item.stock_quantity ?? 0) > 0,
        stockCount: item.stock_quantity ?? 50,
        priceEstimate: item.price ? `${Number(item.price).toLocaleString()} ر.ي` : 'عند التعاقد',
        specsTable,
      }
    }
  } catch (err) {
    const localMatch = visitorProducts.find(p => p.id === productId)
    if (localMatch) {
      apiProduct.value = {
        ...localMatch,
        gallery: [localMatch.image, '/images/hero-solar.png', '/images/product-panel.png'],
      }
    }
  } finally {
    isLoadingProduct.value = false
  }
}

onMounted(() => {
  fetchProductDetails()
})

const product = computed(() => {
  return (
    apiProduct.value || {
      id: productId,
      name: 'منتج طاقة شمسية معتمد',
      category: 'طاقة كهروضوئية',
      brand: 'علامة معتمدة',
      model: `SH-${productId}`,
      sku: `SKU-${productId}`,
      storeName: 'متجر معتمد',
      storeId: '1',
      storeCity: 'صنعاء - الجمهورية اليمنية',
      rating: 4.85,
      reviewsCount: 25,
      image: '/images/hero-solar.png',
      gallery: ['/images/hero-solar.png', '/images/product-panel.png'],
      badge: 'ضمان معتمد',
      warranty: 'ضمان معتمد',
      inStock: true,
      stockCount: 20,
      priceEstimate: 'عند التعاقد',
      specsTable: [
        { label: 'الضمان', value: 'ضمان معتمد' },
        { label: 'التوفر', value: 'متوفر للشحن' },
      ],
    }
  )
})

useSeoMeta({
  title: computed(() => `${product.value.name} | سولار هب`),
  description: computed(() => `مواصفات وتفاصيل ${product.value.name} متوفر لدى ${product.value.storeName}`),
})

// حالة سلايدر الصور الفاخر والمتحكمات
const selectedImageIndex = ref(0)
const isHovered = ref(false)
const slideDirection = ref<'next' | 'prev'>('next')
let sliderInterval: ReturnType<typeof setInterval> | null = null

const gallery = computed<string[]>(() => {
  if (Array.isArray(product.value.gallery) && product.value.gallery.length > 0) {
    return product.value.gallery
  }
  return [product.value.image || '/images/hero-solar.png']
})

function nextSlide() {
  if (gallery.value.length <= 1) return
  slideDirection.value = 'next'
  selectedImageIndex.value = (selectedImageIndex.value + 1) % gallery.value.length
}

function prevSlide() {
  if (gallery.value.length <= 1) return
  slideDirection.value = 'prev'
  selectedImageIndex.value = (selectedImageIndex.value - 1 + gallery.value.length) % gallery.value.length
}

function setSlide(idx: number) {
  slideDirection.value = idx > selectedImageIndex.value ? 'next' : 'prev'
  selectedImageIndex.value = idx
}

onMounted(() => {
  sliderInterval = setInterval(() => {
    if (!isHovered.value && gallery.value.length > 1) {
      nextSlide()
    }
  }, 4500)
})

onUnmounted(() => {
  if (sliderInterval) {
    clearInterval(sliderInterval)
  }
})

function handleQuote() {
  isQuoteModalOpen.value = true
}

function handleToggleFavorite() {
  if (!authStore.isAuthenticated) {
    authModal.open({
      title: 'لحفظ المنتج في المفضلة، يرجى تسجيل الدخول',
      message: `سجّل الدخول إلى حسابك أو أنشئ حساباً لتتمكن من إضافة (${product.value.name}) إلى قائمة المفضلة والرجوع إليه لاحقاً.`,
      actionType: 'general',
    })
    return
  }

  isFavorited.value = !isFavorited.value
  if (isFavorited.value) {
    showToast(`تمت إضافة "${product.value.name}" إلى قائمة المفضلة بنجاح`)
  } else {
    showToast(`تمت إزالة "${product.value.name}" من المفضلة`)
  }
}

function handleDownloadDatasheet() {
  alert('تم بدء تحميل كتيب المواصفات الفنية الرسمية (DataSheet PDF) للمنتج.')
}
</script>

<template>
  <div class="container-page py-6 sm:py-10 flex flex-col gap-10">
    <!-- مسار التنقل (Breadcrumbs) -->
    <nav class="flex flex-wrap items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/" class="hover:text-solar-text-heading transition-colors">الرئيسية</NuxtLink>
      <span>/</span>
      <NuxtLink to="/products" class="hover:text-solar-text-heading transition-colors">كتالوج المنتجات</NuxtLink>
      <span>/</span>
      <span class="text-solar-text-muted">{{ product.category }}</span>
      <span>/</span>
      <span class="font-bold text-solar-text-heading truncate max-w-xs">{{ product.name }}</span>
    </nav>

    <!-- منطقة استعراض تفاصيل المنتج الرئيسية -->
    <div class="grid gap-8 lg:grid-cols-12 items-start">
      <!-- العمود الأيمن (في RTL): سلايدر صور المنتج الفاخر والمتحكمات السلسة -->
      <div class="flex flex-col gap-4 lg:col-span-6">
        <!-- إطار الصورة الرئيسي مع تأثيرات الانتقال السلسة والمتحكمات -->
        <div
          class="group relative flex aspect-square sm:aspect-[4/3] w-full items-center justify-center rounded-3xl border border-solar-border-card bg-solar-bg-card p-6 shadow-sm overflow-hidden select-none"
          @mouseenter="isHovered = true"
          @mouseleave="isHovered = false"
        >
          <!-- شارات الجودة والضمان -->
          <div class="absolute top-4 right-4 flex flex-col gap-2 z-20 pointer-events-none">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 dark:bg-slate-800/95 text-white px-3 py-1 text-xs font-bold shadow-md backdrop-blur-xs">
              <CheckCircle2 class="size-3.5 text-solar-yellow" />
              <span>{{ product.brand }}</span>
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-full bg-solar-yellow text-solar-navy-dark px-3 py-1 text-xs font-black shadow-md">
              <ShieldCheck class="size-3.5" />
              <span>{{ product.warranty }}</span>
            </span>
          </div>

          <!-- زر المفضلة -->
          <button
            type="button"
            @click="handleToggleFavorite"
            class="absolute top-4 left-4 z-20 flex size-10 items-center justify-center rounded-2xl bg-solar-bg-card/90 backdrop-blur-xs border border-solar-border-card text-solar-text-muted hover:text-rose-500 shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
            :class="isFavorited ? 'text-rose-500 bg-rose-50/95 dark:bg-rose-950/80 border-rose-300' : ''"
            aria-label="إضافة للمفضلة"
          >
            <Heart class="size-5" :class="isFavorited ? 'fill-rose-500 text-rose-500' : ''" />
          </button>

          <!-- زر الصورة السابقة (سلس وأنيق يظهر عند التمرير) -->
          <button
            v-if="gallery.length > 1"
            type="button"
            @click.stop="prevSlide"
            class="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 flex size-11 items-center justify-center rounded-2xl bg-solar-bg-card/85 text-solar-text-heading shadow-lg border border-solar-border-card/60 hover:bg-solar-yellow hover:text-solar-navy-dark transition-all duration-200 cursor-pointer opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95"
            title="الصورة السابقة"
            aria-label="السابق"
          >
            <ChevronRight class="size-6 stroke-[2.5]" />
          </button>

          <!-- زر الصورة التالية -->
          <button
            v-if="gallery.length > 1"
            type="button"
            @click.stop="nextSlide"
            class="absolute left-3.5 top-1/2 -translate-y-1/2 z-20 flex size-11 items-center justify-center rounded-2xl bg-solar-bg-card/85 text-solar-text-heading shadow-lg border border-solar-border-card/60 hover:bg-solar-yellow hover:text-solar-navy-dark transition-all duration-200 cursor-pointer opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95"
            title="الصورة التالية"
            aria-label="التالي"
          >
            <ChevronLeft class="size-6 stroke-[2.5]" />
          </button>

          <!-- الصورة النشطة مع تأثير Transition فائق السلاسة -->
          <Transition name="gallery-fade" mode="out-in">
            <div
              :key="selectedImageIndex"
              class="h-full w-full flex items-center justify-center p-2"
            >
              <img
                :src="gallery[selectedImageIndex]"
                :alt="`${product.name} - صورة ${selectedImageIndex + 1}`"
                class="max-h-[90%] max-w-[90%] object-contain select-none transition-transform duration-500 ease-out group-hover:scale-105"
                loading="eager"
                @error="(e) => ((e.target as HTMLImageElement).src = '/images/hero-solar.png')"
              />
            </div>
          </Transition>

          <!-- مؤشر عدد الصور (مثال: 2 / 3) -->
          <div
            v-if="gallery.length > 1"
            class="absolute bottom-4 left-4 z-20 rounded-full bg-slate-900/75 px-3 py-1 text-[11px] font-mono font-bold text-white shadow-sm backdrop-blur-xs"
          >
            {{ selectedImageIndex + 1 }} / {{ gallery.length }}
          </div>

          <!-- مؤشرات النقاط السفلية التفاعلية للسلايدر -->
          <div
            v-if="gallery.length > 1"
            class="absolute bottom-4 inset-x-0 z-20 flex justify-center items-center gap-1.5"
          >
            <button
              v-for="(_, idx) in gallery"
              :key="`dot-${idx}`"
              type="button"
              @click.stop="setSlide(idx)"
              class="h-2 rounded-full transition-all duration-300 cursor-pointer"
              :class="selectedImageIndex === idx ? 'w-6 bg-solar-yellow' : 'w-2 bg-slate-300 dark:bg-slate-600 hover:bg-solar-yellow/60'"
              :aria-label="`الانتقال إلى الشريحة ${idx + 1}`"
            />
          </div>
        </div>

        <!-- شريط الصور المصغرة (Thumbnails) -->
        <div v-if="gallery.length > 1" class="flex items-center gap-3 overflow-x-auto py-1 no-scrollbar">
          <button
            v-for="(img, idx) in gallery"
            :key="idx"
            type="button"
            @click="setSlide(idx)"
            class="relative flex size-20 sm:size-24 shrink-0 items-center justify-center rounded-2xl border-2 bg-solar-bg-card p-2 transition-all duration-300 overflow-hidden cursor-pointer hover:scale-105"
            :class="selectedImageIndex === idx
              ? 'border-solar-yellow ring-2 ring-solar-yellow/30 shadow-md scale-105'
              : 'border-solar-border-card hover:border-solar-yellow/60 opacity-70 hover:opacity-100'"
          >
            <img :src="img" :alt="`صورة مصغرة ${idx + 1}`" class="h-full w-full object-contain" />
          </button>
        </div>
      </div>

      <!-- العمود الأيسر: بيانات وتفاصيل المنتج الفنية -->
      <div class="flex flex-col gap-5 lg:col-span-6">
        <!-- الماركة والموديل والرمز -->
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <span class="rounded-md bg-solar-navy-dark dark:bg-solar-yellow dark:text-solar-navy-dark px-2.5 py-1 font-bold text-white shadow-sm">
            {{ product.brand }}
          </span>
          <span class="text-solar-text-muted font-mono">الموديل: {{ product.model }}</span>
          <span class="text-solar-text-muted">•</span>
          <span class="text-solar-text-muted font-mono">الرمز: {{ product.sku }}</span>
        </div>

        <!-- اسم المنتج الرئيسي -->
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-black text-solar-text-heading leading-tight">
          {{ product.name }}
        </h1>

        <!-- التقييم والمتجر والموقع -->
        <div class="flex flex-wrap items-center gap-4 text-xs pb-3 border-b border-solar-border-card">
          <div class="flex items-center gap-1.5 font-bold text-amber-500">
            <div class="flex">
              <Star v-for="i in 5" :key="i" class="size-4 fill-amber-400 text-amber-400" />
            </div>
            <span class="text-solar-text-heading font-black">{{ product.rating }}</span>
            <span class="text-solar-text-muted">({{ product.reviewsCount }} تقييم معتمد)</span>
          </div>

          <span class="text-solar-border-card">|</span>

          <div class="flex items-center gap-2">
            <span class="text-solar-text-muted">المتجر:</span>
            <NuxtLink :to="`/stores/${product.storeId}`" class="font-bold text-solar-navy dark:text-solar-yellow hover:underline">
              {{ product.storeName }}
            </NuxtLink>
            <span class="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              معتمد
            </span>
          </div>
        </div>

        <!-- حالة توفر المخزون -->
        <div class="flex items-center gap-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50 p-3.5 text-xs text-emerald-900 dark:text-emerald-300 font-bold">
          <span class="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{{ product.inStock ? 'متوفر بالمخزون وجاهز للتوريد والشحن المباشر' : 'متوفر عند الطلب المباشر' }}</span>
        </div>

        <!-- تفاصيل الضمان المصنعي -->
        <div class="flex items-center gap-2 text-xs text-solar-text-body bg-solar-bg-subtle/80 p-3.5 rounded-2xl border border-solar-border-card">
          <ShieldCheck class="size-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{{ product.warranty }}: كفالة رسمية من المصنع مباشرة وفواتير ضريبية نظامية معتمدة.</span>
        </div>

        <!-- السعر الاسترشادي والطلب -->
        <div class="p-4 rounded-2xl bg-solar-bg-card border border-solar-border-card shadow-xs flex items-center justify-between">
          <div>
            <span class="text-[11px] text-solar-text-muted block">السعر التقديري للمنتج:</span>
            <span class="text-xl font-black font-mono text-solar-navy-dark dark:text-solar-yellow">
              {{ product.priceEstimate }}
            </span>
          </div>

          <button
            type="button"
            @click="handleQuote"
            class="btn-primary px-6 py-2.5 text-xs font-black gap-2 shadow-sm cursor-pointer"
          >
            <FileText class="size-4" />
            <span>طلب تسعير المنظومة</span>
          </button>
        </div>

        <!-- بطاقة المتجر المعتمد المصغرة -->
        <div class="flex items-center justify-between rounded-2xl border border-solar-border-card bg-solar-bg-card p-4 shadow-sm">
          <NuxtLink :to="`/stores/${product.storeId}`" class="btn-outline px-4 py-2 text-xs font-bold gap-1.5 hover:border-solar-yellow">
            <span>ملف المتجر</span>
            <ArrowLeft class="size-3.5" />
          </NuxtLink>

          <div class="flex items-center gap-3 text-right">
            <div>
              <h3 class="text-xs sm:text-sm font-black text-solar-text-heading">{{ product.storeName }}</h3>
              <p class="text-[11px] text-solar-text-muted mt-0.5 flex items-center justify-end gap-1">
                <span>{{ product.storeCity }}</span>
                <span class="text-amber-500 font-bold">★ 4.85</span>
              </p>
            </div>
            <div class="flex size-11 items-center justify-center rounded-xl bg-solar-navy-dark text-solar-yellow font-black text-xs shadow-sm">
              <Store class="size-5" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- قسم المواصفات الفنية المعتمدة للمنتج -->
    <div class="flex flex-col gap-6 pt-8 border-t border-solar-border-card">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="size-2 rounded-full bg-solar-yellow" />
          <h2 class="text-xl sm:text-2xl font-black text-solar-text-heading">
            المواصفات الفنية المعتمدة
          </h2>
        </div>

        <!-- زر تحميل كتيب المواصفات الرسمية PDF -->
        <button
          type="button"
          @click="handleDownloadDatasheet"
          class="inline-flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 border border-red-200 dark:border-red-900/50 px-3.5 py-2 rounded-xl transition-colors w-fit cursor-pointer"
        >
          <Download class="size-4" />
          <span>تحميل كتيب المواصفات الرسمية (DataSheet PDF)</span>
        </button>
      </div>

      <!-- جدول المواصفات الفنية -->
      <div class="overflow-hidden rounded-2xl border border-solar-border-card bg-solar-bg-card shadow-sm">
        <div class="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-solar-border-card text-xs">
          <!-- العمود الأيمن من المواصفات -->
          <div class="flex flex-col divide-y divide-solar-border-card">
            <div
              v-for="(spec, idx) in product.specsTable?.slice(0, Math.ceil((product.specsTable?.length || 0) / 2))"
              :key="idx"
              class="flex items-center justify-between p-4 hover:bg-solar-bg-subtle transition-colors"
            >
              <span class="font-bold text-solar-text-heading">{{ spec.label }}</span>
              <span class="font-mono font-semibold text-solar-text-body">
                {{ spec.value }}
              </span>
            </div>
          </div>

          <!-- العمود الأيسر من المواصفات -->
          <div class="flex flex-col divide-y divide-solar-border-card">
            <div
              v-for="(spec, idx) in product.specsTable?.slice(Math.ceil((product.specsTable?.length || 0) / 2))"
              :key="idx"
              class="flex items-center justify-between p-4 hover:bg-solar-bg-subtle transition-colors"
            >
              <span class="font-bold text-solar-text-heading">{{ spec.label }}</span>
              <span class="font-mono font-semibold text-solar-text-body">
                {{ spec.value }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- نافذة طلب عرض السعر التفاعلية -->
    <ProductQuoteModal
      :is-open="isQuoteModalOpen"
      :product="product"
      @close="isQuoteModalOpen = false"
    />

    <!-- نافذة التوست السريعة -->
    <AppToast :message="toastMessage" />
  </div>
</template>

<style scoped>
/* تأثير الانتقال السلس لصور السلايدر */
.gallery-fade-enter-active,
.gallery-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.gallery-fade-enter-from {
  opacity: 0;
  transform: scale(0.96);
}

.gallery-fade-leave-to {
  opacity: 0;
  transform: scale(1.04);
}
</style>
