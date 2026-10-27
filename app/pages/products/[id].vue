<script setup lang="ts">
import {
  ArrowLeft,
  CheckCircle2,
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
  const localMatch = visitorProducts.find(p => p.id === productId)
  if (localMatch) {
    apiProduct.value = localMatch
    return
  }

  isLoadingProduct.value = true
  try {
    const res = await $fetch<{ status: string; data: any }>(`${apiBase}/store-products/${productId}`)
    if (res?.data) {
      const item = res.data
      const mp = item.master_product || {}
      const img = mp.images?.[0]?.url || mp.images?.[0]?.image_url || '/images/product-panel.png'

      const specsTable = Array.isArray(mp.specifications) && mp.specifications.length > 0
        ? mp.specifications.map((s: any) => ({ label: s.spec_name || s.name, value: s.spec_value || s.value }))
        : [
            { label: 'فترة الضمان', value: item.warranty_period || 'ضمان سنتين معتمد' },
            { label: 'الحد الأدنى للطلب', value: `${item.min_order_qty || 1} وحدة` },
            { label: 'المحافظة والتوفر', value: item.governorate?.name_ar ? `${item.governorate.name_ar} - اليمن` : 'صنعاء' },
            { label: 'حالة المخزون', value: (item.stock_quantity ?? 0) > 0 ? `متوفر (${item.stock_quantity} وحدة)` : 'غير متوفر' },
          ]

      apiProduct.value = {
        id: String(item.id),
        name: mp.title || `منتج رقم ${item.id}`,
        category: mp.category?.name_ar || 'ألواح كهروضوئية',
        categoryType: 'panel',
        brand: mp.brand?.name || 'علامة معتمدة',
        model: mp.model_number || `SH-${item.id}`,
        sku: `SH-PROD-${item.id}`,
        storeName: item.store?.company_name || 'شركة شمس اليمن للمهمات الكهروضوئية',
        storeId: String(item.store?.id || 'shams-yemen'),
        storeCity: item.governorate?.name_ar ? `${item.governorate.name_ar} - اليمن` : 'صنعاء - شارع تعز',
        rating: 4.85,
        reviewsCount: 38,
        image: img,
        gallery: [img, '/images/product-panel.png', '/images/hero-solar.png'],
        badge: item.warranty_period ? `ضمان ${item.warranty_period}` : 'Tier 1 Global',
        tierBadge: 'معتمد رسمياً',
        warranty: item.warranty_period || 'ضمان سنتين معتمد',
        inStock: (item.stock_quantity ?? 0) > 0,
        stockCount: item.stock_quantity ?? 50,
        priceEstimate: item.price ? `${Number(item.price).toLocaleString()} ر.ي` : 'عند طلب العرض',
        specsTable,
      }
    }
  } catch (err) {
    apiProduct.value = visitorProducts[0]
  } finally {
    isLoadingProduct.value = false
  }
}

onMounted(() => {
  fetchProductDetails()
})

// البحث عن المنتج أو استخدام أول منتج كافتراضي
const product = computed(() => {
  return apiProduct.value || visitorProducts.find(p => p.id === productId) || visitorProducts[0]
})

useSeoMeta({
  title: computed(() => `${product.value.name} | SolarHub`),
  description: computed(() => `مواصفات وتفاصيل ${product.value.name} متوفر لدى ${product.value.storeName}`),
})

const selectedImageIndex = ref(0)
const isHovered = ref(false)
const sliderInterval = ref<any>(null)

const gallery = computed(() => {
  return [
    product.value.image,
    '/images/hero-solar.png',
    '/images/product-kit.png',
  ]
})

function nextSlide() {
  if (gallery.value.length <= 1) return
  selectedImageIndex.value = (selectedImageIndex.value + 1) % gallery.value.length
}

onMounted(() => {
  sliderInterval.value = setInterval(() => {
    if (!isHovered.value) {
      nextSlide()
    }
  }, 3500)
})

onUnmounted(() => {
  if (sliderInterval.value) {
    clearInterval(sliderInterval.value)
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
  alert('تم بدء تحميل كتيب المواصفات الرسمية (DataSheet PDF) للمنتج.')
}
</script>

<template>
  <div class="container-page py-6 sm:py-10 flex flex-col gap-10">
    <!-- Breadcrumbs -->
    <nav class="flex flex-wrap items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <NuxtLink to="/products" class="hover:text-solar-text-heading">كتالوج المنتجات</NuxtLink>
      <span>/</span>
      <span class="text-solar-text-muted">{{ product.category }}</span>
      <span>/</span>
      <span class="font-bold text-solar-text-heading truncate max-w-xs">{{ product.name }}</span>
    </nav>

    <!-- منطقة استعراض المنتج الرئيسية (مطابقة لـ visitor_3.png) -->
    <div class="grid gap-8 lg:grid-cols-12 items-start">
      <!-- العمود الأيسر (في RTL هو اليسار، يظهر على اليمين بالإنجليزية): معرض صور المنتج -->
      <div class="flex flex-col gap-4 lg:col-span-6">
        <div
          class="relative flex aspect-square sm:aspect-[4/3] w-full items-center justify-center rounded-3xl border border-solar-border-card bg-solar-bg-card p-6 shadow-sm overflow-hidden"
          @mouseenter="isHovered = true"
          @mouseleave="isHovered = false"
        >
          <!-- بادجات الاعتماد والضمان -->
          <div class="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 text-white px-3 py-1 text-xs font-bold shadow-md">
              <CheckCircle2 class="size-3.5 text-solar-yellow" />
              <span>Tier 1 Global</span>
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-full bg-solar-yellow text-solar-navy-dark px-3 py-1 text-xs font-black shadow-md">
              <ShieldCheck class="size-3.5" />
              <span>ضمان 25 سنة</span>
            </span>
          </div>

          <!-- زر المفضلة -->
          <button
            type="button"
            @click="handleToggleFavorite"
            class="absolute top-4 left-4 flex size-10 items-center justify-center rounded-2xl bg-solar-bg-card border border-solar-border-card text-solar-text-muted hover:text-rose-500 shadow-sm transition-all" :class="isFavorited ? 'text-rose-500 bg-rose-50/95 dark:bg-rose-950/80' : ''"
            aria-label="إضافة للمفضلة"
          >
            <Heart class="size-5" :class="isFavorited ? 'fill-rose-500 text-rose-500' : ''" />
          </button>

          <!-- الصورة المعروضة -->
          <img
            :src="gallery[selectedImageIndex]"
            :alt="product.name"
            class="max-h-[85%] max-w-[85%] object-contain transition-all duration-300"
          />
        </div>

        <!-- الصور المصغرة (Thumbnails) -->
        <div class="flex items-center gap-3">
          <button
            v-for="(img, idx) in gallery"
            :key="idx"
            type="button"
            @click="selectedImageIndex = idx"
            class="flex size-20 sm:size-24 items-center justify-center rounded-2xl border-2 bg-solar-bg-card p-2 transition-all overflow-hidden"
            :class="selectedImageIndex === idx ? 'border-solar-yellow ring-2 ring-solar-yellow/20 shadow-sm' : 'border-solar-border-card hover:border-solar-navy/30'"
          >
            <img :src="img" :alt="`صورة مصغرة ${idx + 1}`" class="h-full w-full object-contain" />
          </button>
        </div>
      </div>

      <!-- العمود الأيمن: تفاصيل وبيانات المنتج -->
      <div class="flex flex-col gap-5 lg:col-span-6">
        <!-- الماركة والموديل والرمز -->
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <span class="rounded-md bg-solar-navy-dark px-2.5 py-1 font-bold text-white shadow-sm">
            {{ product.brand }}
          </span>
          <span class="text-solar-text-muted">موديل: {{ product.model }}</span>
          <span class="text-solar-text-muted">|</span>
          <span class="text-solar-text-muted">SKU: {{ product.sku }}</span>
        </div>

        <!-- العنوان الرئيسي -->
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-black text-solar-text-heading leading-tight">
          {{ product.name }}
        </h1>

        <!-- التقييم والمتجر -->
        <div class="flex flex-wrap items-center gap-4 text-xs pb-3 border-b border-solar-border-card">
          <div class="flex items-center gap-1.5 font-bold text-amber-500">
            <div class="flex">
              <Star v-for="i in 5" :key="i" class="size-4 fill-amber-400 text-amber-400" />
            </div>
            <span class="text-solar-text-heading font-black">{{ product.rating }}</span>
            <span class="text-solar-text-muted">({{ product.reviewsCount }} تقييم)</span>
          </div>

          <span class="text-solar-border-card">|</span>

          <div class="flex items-center gap-2">
            <span class="text-solar-text-muted">المتجر:</span>
            <NuxtLink :to="`/stores/${product.storeId}`" class="font-bold text-solar-navy hover:underline">
              {{ product.storeName }}
            </NuxtLink>
            <span class="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              معتمد
            </span>
          </div>
        </div>

        <!-- بانر توفر المخزون الأخضر (مطابق لـ visitor_3.png) -->
        <div class="flex items-center gap-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 p-3.5 text-xs text-emerald-900 font-bold">
          <span class="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>متوفر في المخزون (1,420 لوح جاهز للشحن الفوري)</span>
        </div>

        <!-- نص الضمان -->
        <div class="flex items-center gap-2 text-xs text-solar-text-body bg-solar-bg-subtle/80 p-3 rounded-xl border border-solar-border-card">
          <ShieldCheck class="size-4 text-solar-navy shrink-0" />
          <span>ضمان المصنع 25 سنة على كفاءة الإنتاج و 12 سنة على المواد والعيوب التصنيعية.</span>
        </div>

        <!-- زر طلب عرض السعر الكبير الأصفر -->
        <button
          type="button"
          @click="handleQuote"
          class="btn-primary h-14 w-full text-base font-black gap-2.5 rounded-2xl shadow-md hover:scale-[1.01] active:scale-95 transition-all"
        >
          <FileText class="size-5" />
          <span>طلب عرض سعر</span>
        </button>

        <!-- بطاقة المتجر المصغرة (مطابقة لـ visitor_3.png) -->
        <div class="flex items-center justify-between rounded-2xl border border-solar-border-card bg-solar-bg-card p-4 shadow-sm mt-2">
          <NuxtLink :to="`/stores/${product.storeId}`" class="btn-outline px-4 py-2 text-xs font-bold gap-1.5 hover:border-solar-yellow">
            <span>عرض ملف المتجر</span>
            <ArrowLeft class="size-3.5" />
          </NuxtLink>

          <div class="flex items-center gap-3 text-right">
            <div>
              <h3 class="text-xs sm:text-sm font-black text-solar-text-heading">{{ product.storeName }}</h3>
              <p class="text-[11px] text-solar-text-muted mt-0.5 flex items-center justify-end gap-1">
                <span>{{ product.storeCity }}</span>
                <span>★ 4.8</span>
              </p>
            </div>
            <div class="flex size-11 items-center justify-center rounded-xl bg-solar-navy text-white font-black text-xs shadow-sm">
              <Store class="size-5" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- قسم المواصفات الفنية المعتمدة (STC) المطابق لـ visitor_3.png -->
    <div class="flex flex-col gap-6 pt-8 border-t border-solar-border-card">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="size-2 rounded-full bg-solar-yellow" />
          <h2 class="text-xl sm:text-2xl font-black text-solar-text-heading">
            المواصفات الفنية المعتمدة (STC)
          </h2>
        </div>

        <!-- زر تحميل كتيب المواصفات الرسمية PDF -->
        <button
          type="button"
          @click="handleDownloadDatasheet"
          class="inline-flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3.5 py-2 rounded-xl transition-colors w-fit"
        >
          <Download class="size-4" />
          <span>تحميل كتيب المواصفات الرسمية (DataSheet PDF)</span>
        </button>
      </div>

      <!-- جدول المواصفات الفنية ذو العمودين المتقابلين (مطابق لـ visitor_3.png) -->
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
              <span
                class="font-mono font-semibold"
                :class="spec.value.includes('22.65%') || spec.value.includes('مطابق') ? 'text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded' : 'text-solar-text-body'"
              >
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
              <span
                class="font-mono font-semibold"
                :class="spec.value.includes('مطابق') ? 'text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded' : 'text-solar-text-body'"
              >
                {{ spec.value }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- نافذة طلب عرض السعر المتوافقة مع الأدوار والصلاحيات -->
    <ProductQuoteModal
      :is-open="isQuoteModalOpen"
      :product="product"
      @close="isQuoteModalOpen = false"
    />

    <!-- التوست السريع -->
    <AppToast :message="toastMessage" />
  </div>
</template>
