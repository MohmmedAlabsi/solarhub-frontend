<script setup lang="ts">
import {
  Award,
  Building2,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Star,
  Store,
} from 'lucide-vue-next'
import type { Product } from '~~/types/ecommerce'

definePageMeta({
  layout: 'customer',
})

const route = useRoute()
const isMapModalOpen = ref(false)

const config = useRuntimeConfig()
const apiBase = (config.public.apiBaseUrl as string) || (config.public.apiBase as string) || 'http://127.0.0.1:8000/api'

// Fetch live store from backend if available
const { data: apiStoreData } = await useFetch<any>(`${apiBase}/stores/${route.params.id}`, {
  headers: { Accept: 'application/json' },
  lazy: false,
})

const defaultStore = {
  id: route.params.id || 'shams-riyadh',
  name: 'شركة شمس الرياض للمهمات الكهروضوئية',
  legalName: 'شركة شمس الرياض للتجارة والمقاولات الكهروضوئية ذ.م.م',
  city: 'الرياض - حي الملز',
  address: 'شارع صلاح الدين الأيوبي - مقابل الغرفة التجارية',
  locationCoordinates: null as string | null,
  phone: '+966 11 482 9900',
  email: 'info@shams-riyadh.sa',
  workingHours: 'السبت - الخميس: 8:00 ص - 6:00 م',
  rating: 4.95,
  reviewsCount: 142,
  verified: true,
  tierBadge: 'وكيل رئيسي Tier 1 معتمد',
  crNumber: '1010482910',
  vatNumber: '300192847200003',
  description: 'تعتبر شركة شمس الرياض للمهمات الكهروضوئية من الرواد المعتمدين في استيراد وتوزيع مكونات الطاقة الشمسية عالية الجودة في المملكة منذ عام 2017. نوفر حلولاً شاملة تشمل الألواح عالية الكفاءة والمحولات الهجينة وأنظمة الحماية مع ضمانات مصنعية رسمية وإشراف هندسي معتمد.',
}

const store = computed(() => {
  const backend = apiStoreData.value?.data
  if (backend) {
    return {
      id: String(backend.id),
      name: backend.company_name || 'متجر معتمد',
      legalName: backend.company_name || 'متجر معتمد',
      city: backend.address_details?.split('-')[0] || 'اليمن',
      address: backend.address_details || 'صنعاء - اليمن',
      locationCoordinates: backend.location_coordinates || null,
      phone: backend.whatsapp_number || '+966 11 482 9900',
      email: 'store@solarhub.com',
      workingHours: 'السبت - الخميس: 8:00 ص - 6:00 م',
      rating: Number(backend.average_rating) || 5.0,
      reviewsCount: Number(backend.ratings_count) || 14,
      verified: true,
      tierBadge: backend.store_type === 'authorized_agent' ? 'وكيل معتمد' : backend.store_type === 'wholesaler' ? 'مورد جملة' : 'متجر تجزئة',
      crNumber: backend.commercial_registry || '1010482910',
      vatNumber: backend.tax_number || '300192847200003',
      description: backend.bio || defaultStore.description,
    }
  }
  return defaultStore
})

// منتجات المتجر
const storeProducts = ref<Product[]>([
  {
    id: '1',
    name: 'لوح شمسي مونوكريستالين Jinko Tiger Pro 585W ثنائي الأوجه',
    category: 'ألواح كهروضوئية',
    categoryType: 'panel',
    brand: 'Jinko Solar',
    model: 'Tiger Pro 585W',
    storeName: 'شركة شمس الرياض',
    storeCity: 'الرياض',
    price: 485,
    currency: 'ر.س',
    rating: 4.9,
    reviewsCount: 48,
    image: '/images/product-panel.png',
    badge: 'Tier 1 Global',
    specs: { power: '585W', efficiency: '21.5%' },
    inStock: true,
  },
  {
    id: '4',
    name: 'لوح شمسي Longi Hi-MO 6 Explorer 575W تقنية HPBC المتقدمة',
    category: 'ألواح كهروضوئية',
    categoryType: 'panel',
    brand: 'LONGi',
    model: 'Hi-MO 6 575W',
    storeName: 'شركة شمس الرياض',
    storeCity: 'الرياض',
    price: 520,
    currency: 'ر.س',
    rating: 4.9,
    reviewsCount: 104,
    image: '/images/product-kit.png',
    badge: 'تقنية HPBC',
    specs: { power: '575W', efficiency: '22.3%' },
    inStock: true,
  },
  {
    id: '7',
    name: 'إنفرتر ذكي SUN2000-Huawei 10KTL كفاءة ومطابق للكود',
    category: 'محولات هجينة',
    categoryType: 'inverter',
    brand: 'Huawei',
    model: 'SUN2000-10KTL-M1',
    storeName: 'شركة شمس الرياض',
    storeCity: 'الرياض',
    price: 9150,
    currency: 'ر.س',
    rating: 4.95,
    reviewsCount: 42,
    image: '/images/product-inverter.png',
    badge: 'كود سعودي معتمد',
    specs: { power: '10kW', efficiency: '98.6%' },
    inStock: true,
  },
])
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted">
      <NuxtLink to="/customer/dashboard" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <NuxtLink to="/customer/stores" class="hover:text-solar-text-heading">دليل المتاجر</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading truncate">{{ store.name }}</span>
    </nav>

    <!-- بانر ورأس الملف التعريفي للمتجر -->
    <div class="relative overflow-hidden rounded-2xl border border-solar-border-card bg-white shadow-sm">
      <div class="h-36 bg-gradient-to-l from-solar-navy via-solar-navy-dark to-slate-900 px-6 py-4 flex items-end">
        <span class="badge-success text-xs mb-2">{{ store.tierBadge }}</span>
      </div>

      <div class="p-6">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-14 mb-4">
          <div class="flex items-end gap-4">
            <div class="flex size-20 sm:size-24 shrink-0 items-center justify-center rounded-2xl bg-white border-4 border-white shadow-md text-solar-navy">
              <Building2 class="size-10 sm:size-12" />
            </div>
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <h1 class="text-xl sm:text-2xl font-black text-solar-text-heading">{{ store.name }}</h1>
                <ShieldCheck class="size-5 text-emerald-500" title="سجل تجاري معتمد" />
              </div>
              <span class="text-xs text-solar-text-muted">{{ store.legalName }}</span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <a :href="`tel:${store.phone}`" class="btn-primary h-10 px-4 text-xs gap-1.5">
              <Phone class="size-4" />
              <span>اتصال بالمبيعات</span>
            </a>
          </div>
        </div>

        <p class="text-xs leading-relaxed text-solar-text-secondary max-w-4xl pt-2 border-t border-solar-border-card">
          {{ store.description }}
        </p>

        <!-- شبكة بيانات الاتصال والسجل والضريبة -->
        <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 border-t border-solar-border-card pt-4 text-xs">
          <button
            type="button"
            @click="isMapModalOpen = true"
            class="flex items-center gap-2.5 text-solar-text-secondary hover:text-solar-navy-dark transition-colors cursor-pointer group text-right"
            title="عرض موقع المتجر على الخريطة التفاعلية"
          >
            <MapPin class="size-4 text-solar-yellow shrink-0 group-hover:scale-110 transition-transform" />
            <span class="underline decoration-dotted truncate">{{ store.address }}</span>
          </button>

          <div class="flex items-center gap-2.5 text-solar-text-secondary">
            <Clock class="size-4 text-solar-yellow shrink-0" />
            <span>{{ store.workingHours }}</span>
          </div>

          <div class="flex items-center gap-2.5 text-solar-text-secondary">
            <Award class="size-4 text-solar-yellow shrink-0" />
            <span>سجل تجاري: {{ store.crNumber }}</span>
          </div>

          <div class="flex items-center gap-2.5 text-solar-text-secondary">
            <ShieldCheck class="size-4 text-solar-yellow shrink-0" />
            <span>الرقم الضريبي: {{ store.vatNumber }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- قسم المنتجات المعروضة من هذا المتجر -->
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-solar-text-heading">المنتجات والمعدات المعتمدة من هذا المتجر ({{ storeProducts.length }})</h2>
        <span class="text-xs text-solar-text-muted">جميع المنتجات أصلية بضمانات معتمدة</span>
      </div>

      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <CustomerEcommerceProductCard
          v-for="product in storeProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>

    <!-- نافذة استعراض موقع المتجر والمستودع على الخريطة -->
    <CommonMapLocationModal
      :is-open="isMapModalOpen"
      :current-location="store.locationCoordinates || store.address"
      :title="`موقع متجر ${store.name} على الخريطة`"
      subtitle="الموقع الفعلي للمتجر والمستودعات المعتمدة لاستلام وفحص البضائع وتنسيق الشحن"
      @close="isMapModalOpen = false"
      @select="isMapModalOpen = false"
    />
  </div>
</template>
