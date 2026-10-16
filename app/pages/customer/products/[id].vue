<script setup lang="ts">
import {
  Award,
  CheckCircle2,
  ChevronLeft,
  FileText,
  Heart,
  MessageSquare,
  Package,
  Send,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
  Zap,
} from 'lucide-vue-next'
import { useCartStore } from '~~/app/stores/cart.store'
import type { Product } from '~~/types/ecommerce'

definePageMeta({
  layout: 'customer',
})

const route = useRoute()
const cartStore = useCartStore()

const quantity = ref(1)
const isAdded = ref(false)
const showRfqModal = ref(false)
const routeProductId = Array.isArray(route.params.id) ? (route.params.id[0] ?? '') : (route.params.id ?? '')

// تفاصيل المنتج التجريبية الواقعية
const product = ref({
  id: routeProductId,
  name: 'لوح طاقة شمسية مونوكريستالين Jinko Tiger Pro 585W ثنائي الأوجه عالي الكفاءة',
  category: 'ألواح كهروضوئية',
  brand: 'Jinko Solar',
  model: 'JKM585M-72HL4-BDVP',
  price: 485,
  currency: 'ر.س',
  rating: 4.9,
  reviewsCount: 48,
  image: '/images/product-panel.png',
  badge: 'Tier 1 Global - كفاءة 21.5%',
  description: 'لوح شمسي ثنائي الأوجه فائق الأداء يعتمد على خلايا Half-cell وتكنولوجيا Multi-Busbar المتطورة، يولد طاقة إضافية من الجانب الخلفي تصل إلى 25% مع أداء متفوق في درجات الحرارة العالية بالمملكة.',
  specs: [
    { label: 'القدرة القصوى (Pmax)', value: '585 واط' },
    { label: 'كفاءة اللوح (Module Efficiency)', value: '21.5%' },
    { label: 'نوع الخلايا', value: 'Monocrystalline Half-Cell' },
    { label: 'جهد الدائرة المفتوحة (Voc)', value: '50.28 فولت' },
    { label: 'تيار الدائرة القصيرة (Isc)', value: '14.85 أمبير' },
    { label: 'ضمان المنتج المصنعي', value: '12 سنة' },
    { label: 'ضمان الأداء الخطي', value: '30 سنة بنسبة 84.8%' },
    { label: 'معامل مقاومة الحرارة', value: '-0.35%/°C' },
  ],
  store: {
    id: 'store-1',
    name: 'شركة شمس الرياض للمهمات الكهروضوئية',
    city: 'الرياض - حي الملز',
    verified: true,
    rating: 4.95,
    crNumber: '1010482910',
  },
})

const cartProduct = computed<Product>(() => ({
  id: product.value.id,
  name: product.value.name,
  category: product.value.category,
  categoryType: 'panel',
  brand: product.value.brand,
  model: product.value.model,
  storeName: product.value.store.name,
  storeCity: product.value.store.city,
  price: product.value.price,
  currency: product.value.currency,
  rating: product.value.rating,
  reviewsCount: product.value.reviewsCount,
  image: product.value.image,
  specs: { power: '585W', efficiency: '21.5%', warranty: '30 سنة' },
  badge: product.value.badge,
  inStock: true,
}))

function handleAddToCart() {
  cartStore.addToCart(cartProduct.value, quantity.value)
  isAdded.value = true
  setTimeout(() => {
    isAdded.value = false
  }, 1800)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted">
      <NuxtLink to="/customer/dashboard" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <NuxtLink to="/customer/products" class="hover:text-solar-text-heading">كتالوج المنتجات</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading truncate max-w-md">{{ product.name }}</span>
    </nav>

    <div class="grid gap-8 lg:grid-cols-12">
      <!-- معرض الصور ومعلومات الضمان (5 أعمدة) -->
      <div class="lg:col-span-5 flex flex-col gap-4">
        <div class="relative flex h-96 w-full items-center justify-center rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm">
          <span class="absolute top-4 right-4 rounded-md bg-solar-yellow/20 px-3 py-1 text-xs font-bold text-solar-navy-dark">
            {{ product.badge }}
          </span>
          <img
            :src="product.image"
            :alt="product.name"
            class="h-full w-full object-contain"
          />
        </div>

        <!-- بطاقة المتجر والمورد المعتمد -->
        <div class="rounded-2xl border border-solar-border-card bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between border-b border-solar-border-card pb-3">
            <div class="flex items-center gap-3">
              <div class="flex size-10 items-center justify-center rounded-xl bg-solar-navy text-white">
                <Store class="size-5" />
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-bold text-solar-text-heading">{{ product.store.name }}</span>
                <span class="text-[11px] text-solar-text-muted">{{ product.store.city }}</span>
              </div>
            </div>
            <span class="badge-success text-[11px]">وكيل معتمد</span>
          </div>

          <div class="mt-3 flex items-center justify-between text-xs">
            <div class="flex items-center gap-1 font-bold text-solar-text-heading">
              <Star class="size-3.5 fill-solar-yellow text-solar-yellow" />
              <span>{{ product.store.rating }}</span>
              <span class="text-solar-text-muted">تقييم المتجر</span>
            </div>
            <NuxtLink :to="`/customer/stores/${product.store.id}`" class="font-bold text-amber-600 hover:underline">
              عرض ملف المتجر ←
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- تفاصيل المنتج والأسعار وطلب عرض السعر (7 أعمدة) -->
      <div class="lg:col-span-7 flex flex-col gap-6">
        <div class="flex flex-col gap-3 rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-solar-text-muted">{{ product.category }} • الماركة: {{ product.brand }}</span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="cartStore.toggleWishlist(cartProduct)"
                class="flex size-9 items-center justify-center rounded-xl border border-solar-border-card text-solar-text-muted hover:text-red-500"
              >
                <Heart class="size-4" :class="cartStore.isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''" />
              </button>
            </div>
          </div>

          <h1 class="text-xl font-extrabold text-solar-text-heading md:text-2xl">
            {{ product.name }}
          </h1>

          <div class="flex items-center gap-3 text-xs text-solar-text-muted">
            <span>الموديل: <strong class="text-solar-text-heading">{{ product.model }}</strong></span>
            <span>•</span>
            <div class="flex items-center gap-1 font-bold text-solar-text-heading">
              <Star class="size-3.5 fill-solar-yellow text-solar-yellow" />
              <span>{{ product.rating }}</span>
              <span>({{ product.reviewsCount }} تقييم معتمد)</span>
            </div>
          </div>

          <!-- السعر -->
          <div class="my-3 flex items-baseline gap-2 rounded-xl bg-solar-bg-subtle p-4">
            <span class="text-3xl font-black text-solar-navy-dark">{{ product.price.toLocaleString() }}</span>
            <span class="text-sm font-bold text-solar-text-secondary">{{ product.currency }}</span>
            <span class="text-xs text-solar-text-muted mr-auto">شامل ضريبة القيمة المضافة 15%</span>
          </div>

          <p class="text-xs leading-relaxed text-solar-text-secondary">
            {{ product.description }}
          </p>

          <!-- شريط الإجراءات: إضافة للسلة أو طلب عرض سعر -->
          <div class="mt-4 flex flex-col gap-3 sm:flex-row">
            <div class="flex h-12 items-center justify-between rounded-xl border border-solar-border-card bg-white px-3 text-sm font-bold w-full sm:w-32">
              <button type="button" @click="quantity > 1 ? quantity-- : null" class="text-solar-text-muted hover:text-solar-text-heading px-2 text-lg">-</button>
              <span>{{ quantity }}</span>
              <button type="button" @click="quantity++" class="text-solar-text-muted hover:text-solar-text-heading px-2 text-lg">+</button>
            </div>

            <button
              type="button"
              @click="handleAddToCart"
              class="btn-primary flex-1 h-12 gap-2 text-sm"
              :class="isAdded ? 'bg-emerald-600 text-white' : ''"
            >
              <CheckCircle2 v-if="isAdded" class="size-5" />
              <ShoppingCart v-else class="size-5" />
              <span>{{ isAdded ? 'تمت الإضافة للسلة بنجاح' : 'أضف إلى السلة فوراً' }}</span>
            </button>

            <button
              type="button"
              @click="showRfqModal = true"
              class="btn-dark flex-1 h-12 gap-2 text-sm"
            >
              <Send class="size-4 text-solar-yellow" />
              <span>طلب عرض سعر مخصص (RFQ)</span>
            </button>
          </div>
        </div>

        <!-- جدول المواصفات الفنية المعتمدة -->
        <div class="rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm">
          <h2 class="text-base font-bold text-solar-text-heading mb-4">المواصفات الفنية والهندسية</h2>
          <div class="grid gap-3 sm:grid-cols-2">
            <div
              v-for="spec in product.specs"
              :key="spec.label"
              class="flex items-center justify-between rounded-xl border border-solar-border-card/60 bg-solar-bg-subtle/50 px-4 py-2.5 text-xs"
            >
              <span class="text-solar-text-muted">{{ spec.label }}</span>
              <span class="font-bold text-solar-text-heading">{{ spec.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- نافذة طلب عرض السعر -->
    <CustomerEcommerceRfqModal
      :product="cartProduct"
      :is-open="showRfqModal"
      @close="showRfqModal = false"
    />
  </div>
</template>


