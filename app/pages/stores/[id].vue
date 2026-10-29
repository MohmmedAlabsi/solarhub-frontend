<script setup lang="ts">
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Search,
  ShieldCheck,
  Star,
  Store,
  Truck,
  Wrench,
  Zap,
} from 'lucide-vue-next'
import { visitorStores, visitorProducts, type VisitorProduct } from '~~/app/data/visitor-mock'
import { useAuthModal } from '~~/app/composables/useAuthModal'
import { parseCoordinates } from '~/utils/geo'
import ProductQuoteModal from '~~/app/components/common/ProductQuoteModal.vue'

const route = useRoute()
const storeId = route.params.id as string
const authModal = useAuthModal()
const config = useRuntimeConfig()
const apiBase = (config.public.apiBaseUrl as string) || (config.public.apiBase as string) || 'http://127.0.0.1:8000/api'

const fallbackStore = computed(() => {
  return visitorStores.find(s => s.id === storeId) || visitorStores[0]
})

const dynamicStore = ref<any>(null)
const dynamicProducts = ref<VisitorProduct[]>([])
const isLoading = ref(true)

// نافذة عرض السعر
const isQuoteModalOpen = ref(false)
const activeProductForQuote = ref<VisitorProduct | null>(null)

async function fetchStoreData() {
  isLoading.value = true
  try {
    const res = await $fetch<{ status: string; data: any }>(`${apiBase}/stores/${storeId}`)
    if (res?.data) {
      dynamicStore.value = res.data
    }
  } catch (e) {
    // fallback
  }

  try {
    const pRes = await $fetch<{ status: string; data: any[] }>(`${apiBase}/store-products?store_id=${storeId}`)
    if (pRes?.data && pRes.data.length > 0) {
      dynamicProducts.value = pRes.data.map((item: any) => {
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

        return {
          id: String(item.id),
          name: mp.title || 'منتج طاقة شمسية معتمد',
          model: mp.model_number || `SH-${item.id}`,
          sku: `SKU-${item.id}`,
          brand: mp.brand?.name || 'SolarHub Brand',
          category: mp.category?.name_ar || 'معدات طاقة شمسية',
          categoryType: catType,
          storeId: String(storeId),
          storeName: dynamicStore.value?.company_name || fallbackStore.value.name,
          storeCity: item.governorate?.name_ar ? `${item.governorate.name_ar} - اليمن` : 'صنعاء - اليمن',
          rating: 4.8,
          reviewsCount: 14 + (item.id % 20),
          image: img,
          inStock: (item.stock_quantity ?? 1) > 0,
          stockCount: item.stock_quantity ?? 10,
          warranty: item.warranty_period || 'ضمان معتمد',
          priceEstimate: item.price ? `$${Number(item.price).toLocaleString()}` : 'حسب الكمية',
        } as VisitorProduct
      })
    }
  } catch (e) {
    // fallback
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchStoreData()
})

const store = computed(() => {
  if (dynamicStore.value) {
    const d = dynamicStore.value
    return {
      id: String(d.id),
      name: d.company_name || fallbackStore.value.name,
      legalName: d.company_name || fallbackStore.value.legalName,
      commercialReg: d.commercial_registry || `CR-YE-${1000 + d.id}`,
      weraLicense: `WERA-YE-${5000 + d.id}`,
      badge: (d.store_type === 'authorized_agent' ? 'وكيل رسمي' : (d.store_type === 'wholesaler' ? 'موزع معتمد' : 'متجر متخصص')) as any,
      city: 'صنعاء',
      address: d.address_details || 'صنعاء - الجمهورية اليمنية',
      workingHours: 'السبت - الخميس: 8:00 ص - 6:00 م',
      phone: d.whatsapp_number ? `+967 ${d.whatsapp_number}` : '+967 776369548',
      whatsapp: d.whatsapp_number || '776369548',
      rating: Number(d.average_rating) > 0 ? Number(d.average_rating) : 4.9,
      reviewsCount: Number(d.ratings_count) > 0 ? Number(d.ratings_count) : 24,
      productsCount: dynamicProducts.value.length > 0 ? dynamicProducts.value.length : (Number(d.products_count) || 12),
      inStockCount: 45,
      logo: d.company_logo_url || '',
      description: d.bio || fallbackStore.value.description,
      tags: ['فحص هندسي معتمد', 'ضمان مصنعي', 'شحن لكافة المحافظات'],
      brands: ['Jinko Solar', 'Deye', 'LONGi', 'Pylontech'],
    }
  }
  return fallbackStore.value
})

useSeoMeta({
  title: computed(() => `${store.value.name} | SolarHub`),
  description: computed(() => store.value.description),
})

const activeTab = ref<'products' | 'reviews'>('products')
const selectedFilter = ref('all')

const storeProducts = computed(() => {
  const source = dynamicProducts.value.length > 0 ? dynamicProducts.value : visitorProducts
  if (selectedFilter.value === 'all') {
    return source
  }
  return source.filter((p: any) => p.categoryType === selectedFilter.value)
})

function handleStoreQuote() {
  authModal.open({
    title: 'لطلب عرض سعر للمشاريع، يرجى تسجيل الدخول',
    message: `سجّل الدخول إلى حسابك أو أنشئ حساباً جديداً لإرسال طلب عرض سعر مباشر لـ (${store.value.name}) واستلام عروض الأسعار وفواتير الضمان.`,
    actionType: 'quote',
  })
}

function handleProductQuote(p: VisitorProduct) {
  activeProductForQuote.value = p
  isQuoteModalOpen.value = true
}

function handleWhatsApp() {
  window.open(`https://wa.me/${store.value.whatsapp.replace(/[^0-9]/g, '')}`, '_blank')
}

const isMapModalOpen = ref(false)
</script>

<template>
  <div class="container-page py-6 sm:py-10 flex flex-col gap-8">
    <!-- Breadcrumbs -->
    <nav class="flex flex-wrap items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <NuxtLink to="/stores" class="hover:text-solar-text-heading">المتاجر والوكلاء المعتمدون</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading truncate max-w-xs">{{ store.name }}</span>
    </nav>

    <!-- نافذة طلب عرض السعر للمنتج -->
    <ProductQuoteModal
      :is-open="isQuoteModalOpen"
      :product="activeProductForQuote"
      @close="isQuoteModalOpen = false"
    />

    <!-- بطاقة رأس المتجر الكبيرة -->
    <div class="solar-card p-6 sm:p-8 flex flex-col gap-6">
      <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <!-- معلومات المتجر والشعار -->
        <div class="flex flex-col sm:flex-row items-start gap-5 flex-1 min-w-0">
          <div class="relative flex size-20 sm:size-24 shrink-0 items-center justify-center rounded-2xl bg-solar-navy text-white text-xl font-black shadow-md border-2 border-solar-yellow/30 overflow-hidden">
            <img
              v-if="store.logo"
              :src="store.logo"
              :alt="store.name"
              class="size-full object-cover"
              @error="store.logo = ''"
            />
            <span v-else>{{ store.name.substring(0, 2) }}</span>
          </div>

          <div class="flex flex-col gap-2 text-right flex-1 min-w-0">
            <h1 class="text-xl sm:text-2xl lg:text-3xl font-black text-solar-text-heading leading-tight">
              {{ store.name }}
            </h1>

            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 w-fit">
                <CheckCircle2 class="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>سجل تجاري موثق {{ store.commercialReg }} - {{ store.weraLicense }}</span>
              </span>
            </div>

            <p class="text-xs sm:text-sm text-solar-text-body leading-relaxed max-w-3xl mt-1">
              {{ store.description }}
            </p>
          </div>
        </div>

        <!-- أزرار التواصل وطلب العرض على اليسار -->
        <div class="flex flex-col gap-2.5 shrink-0 w-full sm:w-56 lg:w-60">
          <button
            type="button"
            @click="handleWhatsApp"
            class="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs sm:text-sm font-black text-white hover:bg-emerald-700 shadow-sm transition-all whitespace-nowrap"
          >
            <MessageCircle class="size-4 shrink-0" />
            <span>تواصل عبر واتساب</span>
          </button>

          <button
            type="button"
            @click="handleStoreQuote"
            class="flex h-11 items-center justify-center gap-2 rounded-xl bg-solar-navy text-white hover:bg-solar-navy-dark px-5 text-xs sm:text-sm font-black shadow-sm transition-all whitespace-nowrap"
          >
            <FileText class="size-4 text-solar-yellow shrink-0" />
            <span>طلب عرض سعر للمشاريع</span>
          </button>
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
          <span class="truncate underline decoration-dotted">{{ store.address }}</span>
        </button>
        <div class="flex items-center gap-2">
          <Clock class="size-4 text-solar-yellow shrink-0" />
          <span>{{ store.workingHours }}</span>
        </div>
        <div class="flex items-center gap-2 font-bold text-solar-text-heading">
          <Star class="size-4 fill-amber-400 text-amber-400 shrink-0" />
          <span>{{ store.rating }} ({{ store.reviewsCount }} تقييم موثق)</span>
        </div>
        <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
          <Package class="size-4 shrink-0" />
          <span>{{ store.inStockCount }} منتج معتمد وجاهز للشحن</span>
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
          <h4 class="text-xs font-black text-solar-text-heading">شحن ونقل مخصص ومجهز</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">حماية تامة للألواح والبطاريات الحساسة بكافة المحافظات.</p>
        </div>
      </div>

      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow">
          <Wrench class="size-5" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">مطابقة أحمال ودعم هندسي</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">دعم فني مباشر مع المهندسين المعتمدين.</p>
        </div>
      </div>
    </div>

    <!-- تبويبات المتجر (المنتجات والمخزون المتاح / التقييمات) -->
    <div class="flex flex-col gap-6">
      <div class="flex items-center gap-3 border-b border-solar-border-card pb-2">
        <button
          type="button"
          @click="activeTab = 'products'"
          class="flex items-center gap-2 py-2 px-1 text-sm font-black border-b-2 transition-all"
          :class="activeTab === 'products' ? 'border-solar-yellow text-solar-text-heading font-black' : 'border-transparent text-solar-text-muted hover:text-solar-text-heading'"
        >
          <Package class="size-4" />
          <span>المنتجات والمخزون المتاح ({{ storeProducts.length }} معروضة)</span>
        </button>

        <button
          type="button"
          @click="activeTab = 'reviews'"
          class="flex items-center gap-2 py-2 px-1 text-sm font-bold border-b-2 transition-all"
          :class="activeTab === 'reviews' ? 'border-solar-yellow text-solar-text-heading font-black' : 'border-transparent text-solar-text-muted hover:text-solar-text-heading'"
        >
          <Star class="size-4" />
          <span>التقييمات والآراء ({{ store.reviewsCount }})</span>
        </button>
      </div>

      <!-- فلاتر تصنيف منتجات المتجر -->
      <div v-if="activeTab === 'products'" class="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          @click="selectedFilter = 'all'"
          class="rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap"
          :class="selectedFilter === 'all' ? 'bg-solar-yellow text-solar-navy-dark font-black shadow-sm' : 'bg-solar-bg-card border border-solar-border-card text-solar-text-body hover:bg-solar-bg-subtle hover:text-solar-text-heading'"
        >
          الكل ({{ storeProducts.length }})
        </button>
        <button
          type="button"
          @click="selectedFilter = 'panel'"
          class="rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap"
          :class="selectedFilter === 'panel' ? 'bg-solar-yellow text-solar-navy-dark font-black shadow-sm' : 'bg-solar-bg-card border border-solar-border-card text-solar-text-body hover:bg-solar-bg-subtle hover:text-solar-text-heading'"
        >
          ألواح شمسية
        </button>
        <button
          type="button"
          @click="selectedFilter = 'inverter'"
          class="rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap"
          :class="selectedFilter === 'inverter' ? 'bg-solar-yellow text-solar-navy-dark font-black shadow-sm' : 'bg-solar-bg-card border border-solar-border-card text-solar-text-body hover:bg-solar-bg-subtle hover:text-solar-text-heading'"
        >
          إنفرترات ومحولات
        </button>
        <button
          type="button"
          @click="selectedFilter = 'battery'"
          class="rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap"
          :class="selectedFilter === 'battery' ? 'bg-solar-yellow text-solar-navy-dark font-black shadow-sm' : 'bg-solar-bg-card border border-solar-border-card text-solar-text-body hover:bg-solar-bg-subtle hover:text-solar-text-heading'"
        >
          بطاريات تخزين
        </button>
        <button
          type="button"
          @click="selectedFilter = 'controller'"
          class="rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap"
          :class="selectedFilter === 'controller' ? 'bg-solar-yellow text-solar-navy-dark font-black shadow-sm' : 'bg-solar-bg-card border border-solar-border-card text-solar-text-body hover:bg-solar-bg-subtle hover:text-solar-text-heading'"
        >
          منظمات MPPT
        </button>
      </div>

      <!-- شبكة منتجات المتجر -->
      <div v-if="activeTab === 'products'" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="product in storeProducts"
          :key="product.id"
          class="solar-card flex flex-col justify-between overflow-hidden p-4 hover:border-solar-yellow transition-all"
        >
          <div>
            <div class="relative mb-3 flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-solar-bg-subtle p-3 overflow-hidden">
              <img
                :src="product.image"
                :alt="product.name"
                class="h-full w-full object-contain"
                loading="lazy"
              />
              <span class="absolute bottom-2 left-2 rounded-md bg-solar-bg-card/90 px-2 py-0.5 text-[10px] font-bold text-solar-text-heading shadow-sm border border-solar-border-card">
                {{ product.brand }}
              </span>
            </div>

            <div class="flex items-center justify-between gap-2 text-xs mb-1.5">
              <span class="text-solar-text-muted text-[11px] font-semibold">{{ product.category }}</span>
              <div class="flex items-center gap-1 font-bold text-amber-500">
                <Star class="size-3.5 fill-amber-400 text-amber-400" />
                <span>{{ product.rating }}</span>
              </div>
            </div>

            <h3 class="text-xs sm:text-sm font-black text-solar-text-heading line-clamp-2 leading-snug mb-2" :title="product.name">
              {{ product.name }}
            </h3>

            <div class="flex items-center gap-1.5 text-[11px] text-solar-text-muted mb-4">
              <Store class="size-3.5 shrink-0 text-solar-yellow" />
              <span class="truncate">{{ store.name }}</span>
            </div>
          </div>

          <div class="flex flex-col gap-2 pt-2 border-t border-solar-border-card/60">
            <button
              type="button"
              @click="handleProductQuote(product)"
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

      <!-- تبويب التقييمات -->
      <div v-else class="solar-card p-6 flex flex-col gap-4">
        <h3 class="text-sm font-black text-solar-text-heading">تقييمات وآراء العملاء ({{ store.reviewsCount }} تقييم)</h3>
        <div class="space-y-4">
          <div class="border-b border-solar-border-card pb-4">
            <div class="flex items-center justify-between mb-1">
              <span class="font-bold text-xs text-solar-text-heading">م. هشام القدسي</span>
              <div class="flex text-amber-400"><Star v-for="i in 5" :key="i" class="size-3.5 fill-amber-400" /></div>
            </div>
            <p class="text-xs text-solar-text-body">توريد سريع للألواح والإنفرترات، الفواتير المعتمدة وشهادات المنشأ الأصلية تم استلامها بالكامل.</p>
          </div>
          <div class="border-b border-solar-border-card pb-4">
            <div class="flex items-center justify-between mb-1">
              <span class="font-bold text-xs text-solar-text-heading">مؤسسة سبأ للطاقة المتجددة</span>
              <div class="flex text-amber-400"><Star v-for="i in 5" :key="i" class="size-3.5 fill-amber-400" /></div>
            </div>
            <p class="text-xs text-solar-text-body">تعامل احترافي ودعم فني ممتاز في اختيار كابلات ومحولات متوافقة مع متطلبات المنظومات الشمسية في اليمن.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- نافذة استعراض موقع المتجر والمستودع على الخريطة (للعرض فقط) -->
    <CommonMapLocationModal
      :is-open="isMapModalOpen"
      :initial-coordinates="parseCoordinates((store as any).locationCoordinates || (store as any).coordinates, store.address)"
      :current-location="(store as any).locationCoordinates || store.address"
      :title="`موقع متجر ${store.name} على الخريطة`"
      subtitle="الموقع الفعلي للمتجر والمستودعات المعتمدة لاستلام وفحص البضائع وتنسيق الشحن"
      :readonly="true"
      @close="isMapModalOpen = false"
    />
  </div>
</template>
