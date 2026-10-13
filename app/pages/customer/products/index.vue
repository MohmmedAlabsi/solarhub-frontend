<script setup lang="ts">
import {
  Award,
  Box,
  ChevronLeft,
  ChevronRight,
  Filter,
  PackageCheck,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Truck,
  Wrench,
} from 'lucide-vue-next'
import type { Product } from '~~/types/ecommerce'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'كتالوج المنتجات ومكونات الطاقة الكهروضوئية | SolarHub',
  description: 'تصفح وشراء أكثر من 1,240 منتج أصلي من كبرى الماركات العالمية (Tier 1) مع ضمانات وفواتير ضريبية.',
})

// وضع العرض: إما إضافة مباشرة للسلة أو وضع طلب عروض الأسعار
const displayMode = ref<'cart' | 'rfq'>('cart')
const searchQuery = ref('')
const selectedBrand = ref('الكل')
const selectedCity = ref('كافة المناطق')
const selectedCategory = ref('كافة الأنواع')

// نافذة RFQ
const selectedProductForRfq = ref<Product | null>(null)
const isRfqModalOpen = ref(false)

function openRfqModal(product: Product) {
  selectedProductForRfq.value = product
  isRfqModalOpen.value = true
}

// قائمة المنتجات الثمانية المطابقة تماماً لصورة التصميم
const products = ref<Product[]>([
  {
    id: '1',
    name: 'لوح شمسي مونوكريستالين Jinko Tiger Pro 585W عالي الكفاءة',
    category: 'ألواح كهروضوئية',
    categoryType: 'panel',
    brand: 'Jinko Solar',
    model: 'Tiger Pro 585W',
    storeName: 'متجر طاقة الرياض',
    storeCity: 'الرياض',
    price: 465,
    currency: 'ر.س',
    rating: 4.9,
    reviewsCount: 48,
    image: '/images/product-panel.png',
    badge: 'Tier 1 Global',
    specs: { power: '585W', efficiency: '21.5%', warranty: '25 سنة' },
    inStock: true,
  },
  {
    id: '2',
    name: 'إنفرتر شمسي هجين Deye Hybrid 8kW ثلاثي الأوجه مع شاشة تفاعلية',
    category: 'محولات هجينة',
    categoryType: 'inverter',
    brand: 'Deye',
    model: 'SUN-8K-SG04LP3',
    storeName: 'شركة نبراس الحلول',
    storeCity: 'جدة',
    price: 6200,
    currency: 'ر.س',
    rating: 4.8,
    reviewsCount: 63,
    image: '/images/product-inverter.png',
    badge: 'ثلاثي الأوجه 8kW',
    specs: { power: '8000W', voltage: '380V', warranty: '5 سنوات' },
    inStock: true,
  },
  {
    id: '3',
    name: 'بطارية ليثيوم Pylontech US5000 4.8kWh دورات تفريغ فائقة',
    category: 'تخزين ليثيوم',
    categoryType: 'battery',
    brand: 'Pylontech',
    model: 'US5000',
    storeName: 'مؤسسة طاقة الصحراء',
    storeCity: 'الدمام',
    price: 8450,
    currency: 'ر.س',
    rating: 5.0,
    reviewsCount: 89,
    image: '/images/product-battery.png',
    badge: '6000+ دورة',
    specs: { capacity: '4.8kWh', voltage: '48V', warranty: '10 سنوات' },
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
    specs: { power: '575W', efficiency: '22.3%', warranty: '25 سنة' },
    inStock: true,
  },
  {
    id: '5',
    name: 'إنفرتر مستقل ES Growatt SPF 5000 بقدرة 5kW مدمج بمنظم شحن',
    category: 'محولات هجينة',
    categoryType: 'inverter',
    brand: 'Growatt',
    model: 'SPF 5000 ES',
    storeName: 'مجموعة الأمانة',
    storeCity: 'جدة',
    price: 4850,
    currency: 'ر.س',
    rating: 4.7,
    reviewsCount: 34,
    image: '/images/product-inverter.png',
    badge: 'مستقل عن الشبكة',
    specs: { power: '5000W', voltage: '48V', warranty: '5 سنوات' },
    inStock: true,
  },
  {
    id: '6',
    name: 'مضخة مياه غاطسة شمسية Grundfos SQFlex للآبار والمزارع',
    category: 'مضخات مياه',
    categoryType: 'pump',
    brand: 'Grundfos',
    model: 'SQFlex 11-2',
    storeName: 'مجموعة الأمانة',
    storeCity: 'القصيم',
    price: 11200,
    currency: 'ر.س',
    rating: 4.9,
    reviewsCount: 51,
    image: '/images/hero-solar.png',
    badge: 'للآبار العميقة',
    specs: { power: '1400W', origin: 'الدنمارك', warranty: '3 سنوات' },
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
    specs: { power: '10kW', efficiency: '98.6%', warranty: '10 سنوات' },
    inStock: true,
  },
  {
    id: '8',
    name: 'منظم شحن شمسي SmartSolar MPPT 150/70-Tr بلوتوث ذكي',
    category: 'منظمات MPPT',
    categoryType: 'controller',
    brand: 'Victron Energy',
    model: 'SmartSolar 150/70',
    storeName: 'مؤسسة طاقة الصحراء',
    storeCity: 'الدمام',
    price: 2150,
    currency: 'ر.س',
    rating: 5.0,
    reviewsCount: 28,
    image: '/images/product-panel.png',
    badge: 'بلوتوث ذكي',
    specs: { voltage: '150V', current: '70A', warranty: '5 سنوات' },
    inStock: true,
  },
])

// تصفية المنتجات
const filteredProducts = computed(() => {
  return products.value.filter((p) => {
    const matchSearch = !searchQuery.value || p.name.includes(searchQuery.value) || p.brand.includes(searchQuery.value) || p.model.includes(searchQuery.value)
    const matchBrand = selectedBrand.value === 'الكل' || p.brand.includes(selectedBrand.value)
    const matchCity = selectedCity.value === 'كافة المناطق' || p.storeCity.includes(selectedCity.value)
    const matchCategory = selectedCategory.value === 'كافة الأنواع' || p.category.includes(selectedCategory.value)
    return matchSearch && matchBrand && matchCity && matchCategory
  })
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
          تصفح وشراء أكثر من 1,240 منتج أصلي من كبرى الماركات العالمية (Tier 1) مباشرة من الوكلاء والموزعين المعتمدين مع فواتير ضريبية وضمانات مصنعية حتى 25 عاماً.
        </p>
      </div>

      <!-- كبسولات الأرقام والشارات الإحصائية (مثل التصميم) -->
      <div class="flex flex-wrap items-center gap-3 pt-2">
        <span class="inline-flex items-center gap-2 rounded-xl bg-solar-status-info-bg px-3.5 py-1.5 text-xs font-bold text-solar-status-info-text border border-blue-100">
          <Box class="size-4" />
          <span>معدة مسجلة +1,240</span>
        </span>
        <span class="inline-flex items-center gap-2 rounded-xl bg-solar-status-info-bg px-3.5 py-1.5 text-xs font-bold text-solar-status-info-text border border-blue-100">
          <ShieldCheck class="size-4" />
          <span>متجر معتمد 86 متجر</span>
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
        <div class="relative flex-1">
          <Search class="absolute top-3.5 right-3.5 size-4 text-solar-text-muted" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="ابحث باسم المنتج، الموديل، الماركة (مثل: Jinko 585W, Deye 8kW, Pylontech US5000)..."
            class="solar-input pr-10"
          />
        </div>
        <button type="button" class="btn-dark px-6">
          <span>بحث</span>
        </button>

        <!-- زر التبديل التفاعلي بين وضع الشراء المباشر وطلب عرض السعر -->
        <div class="flex items-center rounded-xl bg-solar-bg-subtle p-1 border border-solar-border-card text-xs font-bold">
          <button
            type="button"
            @click="displayMode = 'cart'"
            class="rounded-lg px-3 py-2 transition-all"
            :class="displayMode === 'cart' ? 'bg-solar-yellow text-solar-navy-dark shadow-sm' : 'text-solar-text-secondary hover:text-solar-text-heading'"
          >
            إضافة للسلة
          </button>
          <button
            type="button"
            @click="displayMode = 'rfq'"
            class="rounded-lg px-3 py-2 transition-all"
            :class="displayMode === 'rfq' ? 'bg-solar-navy text-white shadow-sm' : 'text-solar-text-secondary hover:text-solar-text-heading'"
          >
            طلب عروض أسعار
          </button>
        </div>
      </div>

      <!-- الفلاتر المنسدلة (تصفية النتائج) -->
      <div class="flex flex-wrap items-center gap-3 border-t border-solar-border-card pt-3 text-xs">
        <span class="flex items-center gap-1.5 font-bold text-solar-text-heading">
          <SlidersHorizontal class="size-4 text-solar-yellow" />
          تصفية النتائج:
        </span>

        <select v-model="selectedBrand" class="rounded-lg border border-solar-border-input bg-white px-3 py-1.5 text-xs text-solar-text-body focus:outline-none">
          <option value="الكل">الماركة: الكل</option>
          <option value="Jinko">Jinko Solar</option>
          <option value="LONGi">LONGi Solar</option>
          <option value="Deye">Deye Inverters</option>
          <option value="Growatt">Growatt</option>
          <option value="Pylontech">Pylontech</option>
          <option value="Huawei">Huawei</option>
        </select>

        <select v-model="selectedCity" class="rounded-lg border border-solar-border-input bg-white px-3 py-1.5 text-xs text-solar-text-body focus:outline-none">
          <option value="كافة المناطق">المحافظة: كافة المناطق</option>
          <option value="الرياض">منطقة الرياض</option>
          <option value="جدة">منطقة مكة / جدة</option>
          <option value="الدمام">المنطقة الشرقية / الدمام</option>
          <option value="القصيم">منطقة القصيم</option>
        </select>

        <select v-model="selectedCategory" class="rounded-lg border border-solar-border-input bg-white px-3 py-1.5 text-xs text-solar-text-body focus:outline-none">
          <option value="كافة الأنواع">النوع: كافة الأنواع</option>
          <option value="ألواح">ألواح كهروضوئية</option>
          <option value="محولات">محولات وإنفرترات</option>
          <option value="ليثيوم">بطاريات تخزين</option>
          <option value="مضخات">مضخات مياه شمسية</option>
          <option value="منظمات">منظمات شحن MPPT</option>
        </select>
      </div>
    </div>

    <!-- شبكة المنتجات (8 بطاقات) -->
    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <CustomerEcommerceProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
        :mode="displayMode"
        @open-rfq="openRfqModal"
      />
    </div>

    <!-- شريط الترقيم والتنقل بين الصفحات (Pagination) -->
    <div class="flex flex-col items-center justify-between gap-4 rounded-xl border border-solar-border-card bg-white p-4 sm:flex-row">
      <span class="text-xs text-solar-text-muted">
        عرض 1 - {{ filteredProducts.length }} من أصل 1,240 منتج
      </span>

      <div class="flex items-center gap-1.5 text-xs font-bold">
        <button type="button" class="flex size-8 items-center justify-center rounded-lg border border-solar-border-card text-solar-text-muted hover:border-solar-navy-dark hover:text-solar-navy-dark">
          <ChevronRight class="size-4" />
        </button>
        <button type="button" class="flex size-8 items-center justify-center rounded-lg bg-solar-navy-dark text-white">1</button>
        <button type="button" class="flex size-8 items-center justify-center rounded-lg border border-solar-border-card text-solar-text-body hover:bg-solar-bg-subtle">2</button>
        <button type="button" class="flex size-8 items-center justify-center rounded-lg border border-solar-border-card text-solar-text-body hover:bg-solar-bg-subtle">3</button>
        <button type="button" class="flex size-8 items-center justify-center rounded-lg border border-solar-border-card text-solar-text-body hover:bg-solar-bg-subtle">4</button>
        <span class="px-1 text-solar-text-muted">...</span>
        <button type="button" class="flex size-8 items-center justify-center rounded-lg border border-solar-border-card text-solar-text-body hover:bg-solar-bg-subtle">42</button>
        <button type="button" class="flex size-8 items-center justify-center rounded-lg border border-solar-border-card text-solar-text-muted hover:border-solar-navy-dark hover:text-solar-navy-dark">
          <ChevronLeft class="size-4" />
        </button>
      </div>
    </div>

    <!-- بانر مميزات وضمانات سولار هب (موجود أسفل الكتالوج في التصميم) -->
    <section class="grid gap-4 rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm md:grid-cols-2 lg:grid-cols-4">
      <div class="flex items-start gap-3.5">
        <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-solar-status-info-bg text-solar-status-info-text">
          <ShieldCheck class="size-6" />
        </div>
        <div class="flex flex-col gap-1">
          <h2 class="text-sm font-bold text-solar-text-heading">وكلاء وموردون موثقون</h2>
          <p class="text-xs leading-relaxed text-solar-text-muted">سجلات تجارية مفحوصة ومطابقة تامة للكود والمواصفات الخليجية القياسية.</p>
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
          <p class="text-xs leading-relaxed text-solar-text-muted">فواتير إلكترونية ضريبية معتمدة وضمان خطي مباشر مع كل طلبية تشتريها.</p>
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
