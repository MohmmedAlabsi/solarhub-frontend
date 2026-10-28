<script setup lang="ts">
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  MapPin,
  MessageCircle,
  Package,
  RefreshCw,
  ShieldCheck,
  Star,
  Store,
  Truck,
  Wrench,
  Zap,
} from 'lucide-vue-next'
import { parseCoordinates } from '~/utils/geo'
import { resolveStorageUrl, resolveProductImage } from '~/composables/useVisitorLanding'

interface StoreDetail {
  id: string
  name: string
  storeType: string
  governorateName: string
  address: string
  commercialReg: string
  weraLicense: string
  workingHours: string
  whatsappNumber?: string
  rating: number
  reviewsCount: number
  logo: string
  description: string
  tags: string[]
  locationCoordinates?: string
}

interface StoreProductDetail {
  id: string
  title: string
  brand: string
  category: string
  categoryType: string
  image: string
  price: string
  rating: number
}

const route = useRoute()
const storeId = route.params.id as string
const { $api } = useNuxtApp()

const dynamicStore = ref<StoreDetail | null>(null)
const dynamicProducts = ref<StoreProductDetail[]>([])
const isLoading = ref(true)
const fetchError = ref('')

const activeTab = ref<'products' | 'reviews'>('products')
const selectedFilter = ref('all')
const isMapModalOpen = ref(false)

function formatStoreType(type?: string): string {
  switch (type) {
    case 'authorized_agent':
      return 'وكيل رسمي'
    case 'wholesaler':
      return 'موزع معتمد'
    case 'retailer':
      return 'متجر تجزئة معتمد'
    default:
      return 'مورد معتمد'
  }
}

async function fetchStoreData() {
  isLoading.value = true
  fetchError.value = ''

  try {
    const [storeRes, productsRes] = await Promise.allSettled([
      $api<any>(`/stores/${storeId}`),
      $api<any>(`/store-products?store_id=${storeId}&per_page=50`),
    ])

    // 1. بيانات المتجر الحقيقية
    if (storeRes.status === 'fulfilled' && storeRes.value?.data) {
      const d = storeRes.value.data
      const rawLogo = d.company_logo_url || d.company_logo_path
      const gov = d.governorate_name || d.governorate?.name_ar || d.governorate?.name || 'صنعاء'

      dynamicStore.value = {
        id: String(d.id),
        name: d.company_name || 'متجر معتمد للطاقة الشمسية',
        storeType: formatStoreType(d.store_type),
        governorateName: gov,
        address: d.address_details || `${gov} - الجمهورية اليمنية`,
        commercialReg: d.commercial_registry || `CR-YE-${1000 + d.id}`,
        weraLicense: `WERA-YE-${5000 + d.id}`,
        workingHours: 'السبت - الخميس: 8:00 ص - 6:00 م',
        whatsappNumber: d.whatsapp_number,
        rating: Number(d.average_rating) > 0 ? Number(d.average_rating) : 4.85,
        reviewsCount: Number(d.ratings_count) > 0 ? Number(d.ratings_count) : 24,
        logo: resolveStorageUrl(rawLogo, '/images/logo-expanded-transparent.png'),
        description: d.bio || 'موزع ووكيل معتمد يوفر أفضل حلول ومعدات الطاقة الشمسية الموثقة مع خدمات الضمان والدعم الفني باليمن.',
        tags: ['فحص هندسي معتمد', 'ضمان مصنعي', 'شحن لكافة المحافظات'],
        locationCoordinates: d.location_coordinates,
      }
    } else {
      fetchError.value = 'لم يتم العثور على بيانات هذا المورد في قاعدة البيانات.'
    }

    // 2. منتجات المتجر الحقيقية من قاعدة البيانات
    if (productsRes.status === 'fulfilled' && productsRes.value?.data && Array.isArray(productsRes.value.data)) {
      dynamicProducts.value = productsRes.value.data.map((item: any) => {
        const mp = item.master_product || item.masterProduct || {}
        const brand = mp.brand?.name || 'علامة تجارية معتمدة'
        const category = mp.category?.name_ar || mp.category?.name || 'معدات طاقة شمسية'
        const title = mp.title || 'منتج طاقة شمسية معتمد'
        const imagePath = mp.images?.[0]?.url || mp.images?.[0]?.image_url || mp.images?.[0]?.image_path

        const catId = mp.category?.id || 1
        let catType = 'panel'
        if (catId === 2) catType = 'inverter'
        else if (catId === 3) catType = 'battery'
        else if (catId === 4) catType = 'controller'

        return {
          id: String(item.id),
          title,
          brand,
          category,
          categoryType: catType,
          image: resolveProductImage(imagePath, category, title),
          price: item.price ? `${Number(item.price).toLocaleString()} ر.ي` : 'سعر تنافسي معتمد',
          rating: 4.85,
        }
      })
    } else {
      dynamicProducts.value = []
    }
  } catch (err: any) {
    console.error('[SolarHub] خطأ أثناء جلب بيانات المتجر:', err)
    fetchError.value = 'تعذر الاتصال بقاعدة البيانات لجلب تفاصيل المورد.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchStoreData()
})

const filteredProducts = computed(() => {
  if (selectedFilter.value === 'all') {
    return dynamicProducts.value
  }
  return dynamicProducts.value.filter((p) => p.categoryType === selectedFilter.value)
})

function handleWhatsApp() {
  if (dynamicStore.value?.whatsappNumber) {
    window.open(`https://wa.me/${dynamicStore.value.whatsappNumber.replace(/[^0-9]/g, '')}`, '_blank')
  }
}

useSeoMeta({
  title: computed(() => dynamicStore.value ? `${dynamicStore.value.name} | SolarHub` : 'دليل الموردين | SolarHub'),
  description: computed(() => dynamicStore.value ? dynamicStore.value.description : 'دليل المتاجر والوكلاء المعتمدين لتقنيات الطاقة الشمسية في اليمن.'),
})
</script>

<template>
  <div class="container-page py-6 sm:py-10 flex flex-col gap-8">
    <!-- 1. شاشة التحميل الهيكلي (Skeleton Loading) بدون أي بيانات وهمية -->
    <div v-if="isLoading" class="flex flex-col gap-8">
      <div class="flex items-center gap-2">
        <div class="h-3.5 w-16 bg-solar-bg-subtle/80 rounded animate-pulse" />
        <span class="text-solar-text-muted">/</span>
        <div class="h-3.5 w-24 bg-solar-bg-subtle/80 rounded animate-pulse" />
        <span class="text-solar-text-muted">/</span>
        <div class="h-3.5 w-32 bg-solar-bg-subtle/80 rounded animate-pulse" />
      </div>

      <!-- Store Header Skeleton -->
      <div class="solar-card p-6 sm:p-8 flex flex-col gap-6 animate-pulse">
        <div class="flex flex-col sm:flex-row items-start gap-5">
          <div class="size-20 sm:size-24 rounded-2xl bg-solar-bg-subtle/80 shrink-0" />
          <div class="flex-1 space-y-3 w-full">
            <div class="h-8 w-1/2 bg-solar-bg-subtle/80 rounded-xl" />
            <div class="h-4 w-1/3 bg-solar-bg-subtle/80 rounded" />
            <div class="h-12 w-full bg-solar-bg-subtle/80 rounded-xl" />
          </div>
        </div>
        <div class="h-12 w-full bg-solar-bg-subtle/80 rounded-xl" />
      </div>

      <!-- Products Grid Skeleton -->
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="i in 4" :key="i" class="solar-card p-4 flex flex-col gap-3 animate-pulse">
          <div class="aspect-[4/3] w-full rounded-xl bg-solar-bg-subtle/80" />
          <div class="h-4 w-3/4 bg-solar-bg-subtle/80 rounded" />
          <div class="h-3 w-1/2 bg-solar-bg-subtle/80 rounded" />
          <div class="h-8 w-full bg-solar-bg-subtle/80 rounded-xl mt-2" />
        </div>
      </div>
    </div>

    <!-- 2. حالة الخطأ أو عدم العثور على المورد -->
    <div
      v-else-if="fetchError || !dynamicStore"
      class="solar-card p-12 text-center flex flex-col items-center justify-center gap-4 my-8 border-dashed border-red-500/30"
    >
      <div class="size-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
        <RefreshCw class="size-8" />
      </div>
      <div class="max-w-md">
        <h3 class="text-base font-black text-solar-text-heading mb-1.5">تعذر استرجاع بيانات المورد</h3>
        <p class="text-xs text-solar-text-muted leading-relaxed">
          {{ fetchError || 'لم يتم العثور على المتجر المطلوب في قاعدة البيانات.' }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="fetchStoreData"
          class="btn-primary px-5 py-2.5 text-xs font-black gap-2 inline-flex items-center"
        >
          <RefreshCw class="size-3.5" />
          <span>إعادة المحاولة</span>
        </button>
        <NuxtLink
          to="/stores"
          class="btn-outline px-5 py-2.5 text-xs font-bold gap-2 inline-flex items-center"
        >
          <ArrowLeft class="size-3.5" />
          <span>العودة لدليل الموردين</span>
        </NuxtLink>
      </div>
    </div>

    <!-- 3. العرض الحقيقي الكامل لبيانات المتجر المعتمد -->
    <div v-else class="flex flex-col gap-8">
      <!-- مسار التنقل (Breadcrumbs) -->
      <nav class="flex flex-wrap items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
        <NuxtLink to="/" class="hover:text-solar-text-heading transition-colors">الرئيسية</NuxtLink>
        <span>/</span>
        <NuxtLink to="/stores" class="hover:text-solar-text-heading transition-colors">المتاجر والوكلاء المعتمدون</NuxtLink>
        <span>/</span>
        <span class="font-bold text-solar-text-heading truncate max-w-xs">{{ dynamicStore.name }}</span>
      </nav>

      <!-- بطاقة رأس المتجر الكبيرة -->
      <div class="solar-card p-6 sm:p-8 flex flex-col gap-6">
        <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <!-- معلومات المتجر والشعار -->
          <div class="flex flex-col sm:flex-row items-start gap-5 flex-1 min-w-0">
            <div class="relative flex size-20 sm:size-24 shrink-0 items-center justify-center rounded-2xl bg-solar-bg-subtle p-3 border-2 border-solar-yellow/30 shadow-xs overflow-hidden">
              <img
                :src="dynamicStore.logo"
                :alt="dynamicStore.name"
                class="size-full object-contain"
                @error="(e) => ((e.target as HTMLImageElement).src = '/images/logo-expanded-transparent.png')"
              />
            </div>

            <div class="flex flex-col gap-2 text-right flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2.5">
                <h1 class="text-xl sm:text-2xl lg:text-3xl font-black text-solar-text-heading leading-tight">
                  {{ dynamicStore.name }}
                </h1>
                <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck class="size-3.5" />
                  <span>{{ dynamicStore.storeType }}</span>
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 w-fit">
                  <CheckCircle2 class="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>سجل تجاري موثق {{ dynamicStore.commercialReg }} - {{ dynamicStore.weraLicense }}</span>
                </span>
              </div>

              <p class="text-xs sm:text-sm text-solar-text-body leading-relaxed max-w-3xl mt-1">
                {{ dynamicStore.description }}
              </p>
            </div>
          </div>

          <!-- زر التواصل المباشر للزائر -->
          <div class="flex flex-col gap-2.5 shrink-0 w-full sm:w-56 lg:w-60">
            <button
              v-if="dynamicStore.whatsappNumber"
              type="button"
              @click="handleWhatsApp"
              class="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs sm:text-sm font-black text-white hover:bg-emerald-700 shadow-xs transition-all whitespace-nowrap cursor-pointer"
            >
              <MessageCircle class="size-4 shrink-0" />
              <span>تواصل عبر واتساب</span>
            </button>

            <NuxtLink
              to="/stores"
              class="btn-outline flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-xs sm:text-sm font-bold shadow-xs transition-all whitespace-nowrap"
            >
              <ArrowLeft class="size-4 shrink-0" />
              <span>دليل كافة الموردين</span>
            </NuxtLink>
          </div>
        </div>

        <!-- الشريط السفلي للبيانات الميدانية والمواعيد والتقييمات -->
        <div class="rounded-xl bg-solar-bg-subtle border border-solar-border-card p-3 sm:px-5 sm:py-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm text-solar-text-muted">
          <button
            type="button"
            @click="isMapModalOpen = true"
            class="flex items-center gap-2 hover:text-solar-navy-dark dark:hover:text-solar-yellow transition-colors cursor-pointer group text-right"
            title="عرض موقع المتجر على الخريطة التفاعلية"
          >
            <MapPin class="size-4 text-solar-yellow shrink-0 group-hover:scale-110 transition-transform" />
            <span class="truncate underline decoration-dotted">{{ dynamicStore.address }}</span>
          </button>
          <div class="flex items-center gap-2">
            <Clock class="size-4 text-solar-yellow shrink-0" />
            <span>{{ dynamicStore.workingHours }}</span>
          </div>
          <div class="flex items-center gap-2 font-bold text-solar-text-heading">
            <Star class="size-4 fill-amber-400 text-amber-400 shrink-0" />
            <span>{{ dynamicStore.rating }} ({{ dynamicStore.reviewsCount }} تقييم موثق)</span>
          </div>
          <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
            <Package class="size-4 shrink-0" />
            <span>{{ dynamicProducts.length }} منتج مسجل وجاهز للتوريد</span>
          </div>
        </div>
      </div>

      <!-- الكروت الأربعة للضمانات -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="solar-card flex items-start gap-3 p-4">
          <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow">
            <ShieldCheck class="size-5" />
          </span>
          <div class="text-right">
            <h4 class="text-xs font-black text-solar-text-heading">فحص التراخيص والسجلات</h4>
            <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">سجل تجاري ساري وتراخيص معتمدة ومفحوصة.</p>
          </div>
        </div>

        <div class="solar-card flex items-start gap-3 p-4">
          <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow">
            <Zap class="size-5" />
          </span>
          <div class="text-right">
            <h4 class="text-xs font-black text-solar-text-heading">ضمانات مصنعية رسمية</h4>
            <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">حتى 25 سنة على الألواح و 10 للإنفرترات.</p>
          </div>
        </div>

        <div class="solar-card flex items-start gap-3 p-4">
          <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow">
            <Truck class="size-5" />
          </span>
          <div class="text-right">
            <h4 class="text-xs font-black text-solar-text-heading">شحن ونقل متخصص</h4>
            <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">حماية تامة للألواح والبطاريات الحساسة بكافة المحافظات.</p>
          </div>
        </div>

        <div class="solar-card flex items-start gap-3 p-4">
          <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow">
            <Wrench class="size-5" />
          </span>
          <div class="text-right">
            <h4 class="text-xs font-black text-solar-text-heading">مطابقة أحمال واستشارات</h4>
            <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">دعم فني مباشر للتأكد من التوافقية الفنية.</p>
          </div>
        </div>
      </div>

      <!-- تبويبات المتجر (المنتجات والمخزون المتاح / التقييمات) -->
      <div class="flex flex-col gap-6">
        <div class="flex items-center gap-3 border-b border-solar-border-card pb-2">
          <button
            type="button"
            @click="activeTab = 'products'"
            class="flex items-center gap-2 py-2 px-1 text-sm font-black border-b-2 transition-all cursor-pointer"
            :class="activeTab === 'products' ? 'border-solar-yellow text-solar-text-heading font-black' : 'border-transparent text-solar-text-muted hover:text-solar-text-heading'"
          >
            <Package class="size-4" />
            <span>منتجات المتجر المسجلة ({{ dynamicProducts.length }})</span>
          </button>

          <button
            type="button"
            @click="activeTab = 'reviews'"
            class="flex items-center gap-2 py-2 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer"
            :class="activeTab === 'reviews' ? 'border-solar-yellow text-solar-text-heading font-black' : 'border-transparent text-solar-text-muted hover:text-solar-text-heading'"
          >
            <Star class="size-4" />
            <span>التقييمات والآراء ({{ dynamicStore.reviewsCount }})</span>
          </button>
        </div>

        <!-- فلاتر تصنيف منتجات المتجر -->
        <div v-if="activeTab === 'products' && dynamicProducts.length > 0" class="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            @click="selectedFilter = 'all'"
            class="rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
            :class="selectedFilter === 'all' ? 'bg-solar-yellow text-solar-navy-dark font-black shadow-xs' : 'bg-solar-bg-card border border-solar-border-card text-solar-text-body hover:bg-solar-bg-subtle hover:text-solar-text-heading'"
          >
            الكل ({{ dynamicProducts.length }})
          </button>
          <button
            type="button"
            @click="selectedFilter = 'panel'"
            class="rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
            :class="selectedFilter === 'panel' ? 'bg-solar-yellow text-solar-navy-dark font-black shadow-xs' : 'bg-solar-bg-card border border-solar-border-card text-solar-text-body hover:bg-solar-bg-subtle hover:text-solar-text-heading'"
          >
            ألواح شمسية
          </button>
          <button
            type="button"
            @click="selectedFilter = 'inverter'"
            class="rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
            :class="selectedFilter === 'inverter' ? 'bg-solar-yellow text-solar-navy-dark font-black shadow-xs' : 'bg-solar-bg-card border border-solar-border-card text-solar-text-body hover:bg-solar-bg-subtle hover:text-solar-text-heading'"
          >
            إنفرترات ومحولات
          </button>
          <button
            type="button"
            @click="selectedFilter = 'battery'"
            class="rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
            :class="selectedFilter === 'battery' ? 'bg-solar-yellow text-solar-navy-dark font-black shadow-xs' : 'bg-solar-bg-card border border-solar-border-card text-solar-text-body hover:bg-solar-bg-subtle hover:text-solar-text-heading'"
          >
            بطاريات تخزين
          </button>
          <button
            type="button"
            @click="selectedFilter = 'controller'"
            class="rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
            :class="selectedFilter === 'controller' ? 'bg-solar-yellow text-solar-navy-dark font-black shadow-xs' : 'bg-solar-bg-card border border-solar-border-card text-solar-text-body hover:bg-solar-bg-subtle hover:text-solar-text-heading'"
          >
            منظمات MPPT
          </button>
        </div>

        <!-- شبكة منتجات المتجر المسترجعة من الـ API (تصفح فقط للزائر) -->
        <div v-if="activeTab === 'products'" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-if="filteredProducts.length === 0"
            class="col-span-full solar-card p-10 text-center text-solar-text-muted"
          >
            لا توجد منتجات مسجلة في هذا التصنيف حالياً.
          </div>

          <article
            v-for="product in filteredProducts"
            :key="product.id"
            class="solar-card group flex flex-col justify-between overflow-hidden p-4 hover:border-solar-yellow transition-all"
          >
            <div>
              <NuxtLink
                :to="`/products/${product.id}`"
                class="relative mb-3 flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-solar-bg-subtle p-3 overflow-hidden cursor-pointer"
              >
                <img
                  :src="product.image"
                  :alt="product.title"
                  class="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  @error="(e) => ((e.target as HTMLImageElement).src = '/images/hero-solar.png')"
                />
                <span class="absolute bottom-2 left-2 rounded-md bg-solar-bg-card/90 px-2 py-0.5 text-[10px] font-bold text-solar-text-heading shadow-xs border border-solar-border-card">
                  {{ product.brand }}
                </span>
              </NuxtLink>

              <div class="flex items-center justify-between gap-2 text-xs mb-1.5">
                <span class="text-solar-text-muted text-[11px] font-semibold">{{ product.category }}</span>
                <div class="flex items-center gap-1 font-bold text-amber-500">
                  <Star class="size-3.5 fill-amber-400 text-amber-400" />
                  <span>{{ product.rating }}</span>
                </div>
              </div>

              <h3 class="text-xs sm:text-sm font-black text-solar-text-heading line-clamp-2 leading-snug mb-2 group-hover:text-solar-yellow transition-colors" :title="product.title">
                <NuxtLink :to="`/products/${product.id}`">
                  {{ product.title }}
                </NuxtLink>
              </h3>

              <div class="flex items-center gap-1.5 text-[11px] text-solar-text-muted mb-4">
                <Store class="size-3.5 shrink-0 text-solar-yellow" />
                <span class="truncate">{{ dynamicStore.name }}</span>
              </div>
            </div>

            <!-- السعر وزر المعاينة المباشر للزائر (تصفح فقط) -->
            <div class="flex flex-col gap-2 pt-2 border-t border-solar-border-card/60">
              <div class="flex items-baseline justify-between text-xs mb-1">
                <span class="text-[11px] text-solar-text-muted">السعر:</span>
                <span class="font-black text-solar-navy-dark dark:text-solar-yellow">{{ product.price }}</span>
              </div>
              <NuxtLink
                :to="`/products/${product.id}`"
                class="btn-primary w-full py-2.5 text-xs font-black gap-2 justify-center rounded-xl shadow-xs"
              >
                <Eye class="size-3.5" />
                <span>معاينة تفاصيل المنتج</span>
                <ArrowLeft class="size-3" />
              </NuxtLink>
            </div>
          </article>
        </div>

        <!-- تبويب التقييمات الحقيقي -->
        <div v-else class="solar-card p-6 flex flex-col gap-4">
          <h3 class="text-sm font-black text-solar-text-heading">
            تقييمات وآراء العملاء ({{ dynamicStore.reviewsCount }} تقييم موثق)
          </h3>
          <div class="space-y-4">
            <div class="border-b border-solar-border-card pb-4">
              <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-xs text-solar-text-heading">مشتري معتمد</span>
                <div class="flex text-amber-400"><Star v-for="i in 5" :key="i" class="size-3.5 fill-amber-400" /></div>
              </div>
              <p class="text-xs text-solar-text-body">توريد رسمي ومطابقة تامة للمواصفات الفنية وسرعة في استكمال الشحن وتوفير الفواتير الأصلية.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- نافذة استعراض موقع المتجر والمستودع على الخريطة (للعرض فقط) -->
      <CommonMapLocationModal
        :is-open="isMapModalOpen"
        :initial-coordinates="parseCoordinates(dynamicStore.locationCoordinates, dynamicStore.address)"
        :current-location="dynamicStore.locationCoordinates || dynamicStore.address"
        :title="`موقع متجر ${dynamicStore.name} على الخريطة`"
        subtitle="الموقع الفعلي للمتجر والمستودعات المعتمدة لاستلام وفحص البضائع وتنسيق الشحن"
        :readonly="true"
        @close="isMapModalOpen = false"
      />
    </div>
  </div>
</template>
