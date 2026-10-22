<script setup lang="ts">
import {
  AlertCircle,
  Award,
  Check,
  CheckCircle2,
  ChevronLeft,
  Download,
  FileText,
  Heart,
  Loader2,
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
import { useCustomerProducts, type CustomerProductView, type StoreOfferItem } from '~~/app/composables/useCustomerProducts'
import { useCartStore } from '~~/app/stores/cart.store'

definePageMeta({
  layout: 'customer',
})

const route = useRoute()
const cartStore = useCartStore()
const { fetchProductDetails, isLoading, error } = useCustomerProducts()

const routeProductId = Array.isArray(route.params.id) ? (route.params.id[0] ?? '') : (route.params.id ?? '')

const product = ref<CustomerProductView | null>(null)
const storeOffers = ref<StoreOfferItem[]>([])
const selectedOffer = ref<StoreOfferItem | null>(null)

const quantity = ref(1)
const isAdded = ref(false)
const showRfqModal = ref(false)

useSeoMeta({
  title: () => (product.value ? `${product.value.name} | SolarHub` : 'تفاصيل المنتج | SolarHub'),
  description: () => product.value?.description || 'مواصفات وعروض أسعار معدات الطاقة الشمسية المعتمدة.',
})

// اختيار عرض متجر محدد
function selectOffer(offer: StoreOfferItem) {
  selectedOffer.value = offer
  if (product.value) {
    product.value.price = offer.price
    product.value.storeId = offer.storeId
    product.value.storeName = offer.storeName
    product.value.storeCity = offer.storeCity
    product.value.stockQuantity = offer.stockQuantity
    product.value.minOrderQty = offer.minOrderQty
    product.value.warrantyPeriod = offer.warrantyPeriod || undefined
    product.value.id = offer.id
    product.value.storeProductId = offer.id
    if (quantity.value < offer.minOrderQty) {
      quantity.value = offer.minOrderQty
    }
  }
}

// إضافة المنتج للسلة
async function handleAddToCart() {
  if (!product.value) return

  const itemToAdd = {
    ...product.value,
    id: selectedOffer.value ? selectedOffer.value.id : product.value.id,
    storeProductId: selectedOffer.value ? selectedOffer.value.id : product.value.storeProductId,
    price: selectedOffer.value ? selectedOffer.value.price : product.value.price,
    storeName: selectedOffer.value ? selectedOffer.value.storeName : product.value.storeName,
  }

  await cartStore.addToCart(itemToAdd, quantity.value)
  isAdded.value = true
  setTimeout(() => {
    isAdded.value = false
  }, 2000)
}

onMounted(async () => {
  if (routeProductId) {
    const data = await fetchProductDetails(routeProductId)
    if (data) {
      product.value = data.product
      storeOffers.value = data.offers
      if (data.offers.length > 0) {
        const initial = data.offers.find(o => o.id === data.selectedOfferId) || data.offers[0]
        if (initial) {
          selectOffer(initial)
        }
      } else {
        quantity.value = data.product.minOrderQty || 1
      }
    }
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- فتات الخبز (Breadcrumbs) -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/customer/dashboard" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <NuxtLink to="/customer/products" class="hover:text-solar-text-heading">كتالوج المنتجات</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading truncate max-w-md">
        {{ product?.name || 'تفاصيل المنتج' }}
      </span>
    </nav>

    <!-- مؤشر التحميل -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-24">
      <Loader2 class="size-10 animate-spin text-solar-yellow mb-4" />
      <p class="text-sm font-semibold text-solar-text-muted">جاري تحميل تفاصيل المنتج والمواصفات الفنية وعروض المتاجر...</p>
    </div>

    <!-- رسالة الخطأ عند عدم العثور على المنتج -->
    <div
      v-else-if="error || !product"
      class="flex flex-col items-center justify-center rounded-2xl border border-solar-border-card bg-white p-12 text-center shadow-sm"
    >
      <div class="flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
        <AlertCircle class="size-8" />
      </div>
      <h2 class="text-lg font-bold text-solar-text-heading mb-2">تعذر العثور على المنتج</h2>
      <p class="text-xs text-solar-text-muted max-w-sm mb-6">
        {{ error || 'المنتج المطلوب غير متاح حالياً أو تم حذفه من الكتالوج.' }}
      </p>
      <NuxtLink to="/customer/products" class="btn-primary text-xs px-6 py-2.5">
        العودة إلى كتالوج المنتجات
      </NuxtLink>
    </div>

    <!-- تفاصيل المنتج وعروض المتاجر -->
    <div v-else class="grid gap-8 lg:grid-cols-12">
      <!-- العمود الأيمن: معرض الصور ومعلومات المتجر المعتمد (5 أعمدة) -->
      <div class="lg:col-span-5 flex flex-col gap-4">
        <!-- بطاقة الصورة الرئيسية -->
        <div class="relative flex h-96 w-full items-center justify-center rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm overflow-hidden">
          <span
            v-if="product.badge"
            class="absolute top-4 right-4 rounded-md bg-solar-yellow/20 px-3 py-1 text-xs font-bold text-solar-navy-dark"
          >
            {{ product.badge }}
          </span>

          <img
            :src="product.image || '/images/product-panel.png'"
            :alt="product.name"
            class="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>

        <!-- بطاقة المتجر والمورد المعتمد المحدد -->
        <div class="rounded-2xl border border-solar-border-card bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between border-b border-solar-border-card pb-3">
            <div class="flex items-center gap-3">
              <div class="flex size-10 items-center justify-center rounded-xl bg-solar-navy text-white">
                <Store class="size-5" />
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-bold text-solar-text-heading">{{ product.storeName }}</span>
                <span class="text-[11px] text-solar-text-muted">{{ product.storeCity }}</span>
              </div>
            </div>
            <span class="badge-success text-[11px]">وكيل معتمد</span>
          </div>

          <div class="mt-3 flex items-center justify-between text-xs">
            <div class="flex items-center gap-1 font-bold text-solar-text-heading">
              <Star class="size-3.5 fill-solar-yellow text-solar-yellow" />
              <span>4.9</span>
              <span class="text-solar-text-muted">تقييم المتجر</span>
            </div>
            <NuxtLink
              v-if="product.storeId"
              :to="`/customer/stores/${product.storeId}`"
              class="font-bold text-amber-600 hover:underline"
            >
              عرض ملف المتجر ←
            </NuxtLink>
            <span v-else class="text-solar-text-muted font-medium">مورد مسجل</span>
          </div>
        </div>

        <!-- زر تحميل الداتاشيت الفنية إن وجد -->
        <a
          v-if="product.datasheetUrl"
          :href="product.datasheetUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-between rounded-2xl border border-solar-border-card bg-white p-4 shadow-sm hover:border-solar-yellow transition-all"
        >
          <div class="flex items-center gap-3">
            <div class="flex size-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <FileText class="size-5" />
            </div>
            <div class="flex flex-col text-right">
              <span class="text-xs font-bold text-solar-text-heading">كتيب المواصفات الفنية (Datasheet)</span>
              <span class="text-[11px] text-solar-text-muted">تحميل مستند PDF الأصلي من المصنع</span>
            </div>
          </div>
          <Download class="size-4 text-solar-text-muted" />
        </a>
      </div>

      <!-- العمود الأيسر: تفاصيل المنتج، عروض الأسعار، مقارنة عروض المتاجر، والمواصفات (7 أعمدة) -->
      <div class="lg:col-span-7 flex flex-col gap-6">
        <!-- بطاقة الشراء والبيانات الأساسية -->
        <div class="flex flex-col gap-3 rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-solar-text-muted">
              {{ product.category }} • الماركة: {{ product.brand }}
            </span>

            <button
              type="button"
              @click="cartStore.toggleWishlist(product as any)"
              class="flex size-9 items-center justify-center rounded-xl border border-solar-border-card text-solar-text-muted hover:text-red-500 transition-colors"
              :title="cartStore.isInWishlist(product.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'"
            >
              <Heart
                class="size-4"
                :class="cartStore.isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''"
              />
            </button>
          </div>

          <h1 class="text-xl font-extrabold text-solar-text-heading md:text-2xl leading-snug">
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

          <!-- شريط السعر -->
          <div class="my-3 flex items-baseline gap-2 rounded-xl bg-solar-bg-subtle p-4">
            <template v-if="product.price > 0">
              <span class="text-3xl font-black text-solar-navy-dark">{{ Number(product.price).toLocaleString() }}</span>
              <span class="text-sm font-bold text-solar-text-secondary">{{ product.currency }}</span>
              <span class="text-xs text-solar-text-muted mr-auto">شامل ضريبة القيمة المضافة 15%</span>
            </template>
            <template v-else>
              <span class="text-lg font-bold text-amber-600">السعر حسب طلب عرض السعر والكمية (RFQ)</span>
              <span class="text-xs text-solar-text-muted mr-auto">تسعير خاص للمشاريع والكميات</span>
            </template>
          </div>

          <p v-if="product.description" class="text-xs leading-relaxed text-solar-text-secondary">
            {{ product.description }}
          </p>

          <!-- شريط الإجراءات: إضافة للسلة أو طلب عرض سعر -->
          <div class="mt-4 flex flex-col gap-3 sm:flex-row">
            <div
              v-if="product.price > 0"
              class="flex h-12 items-center justify-between rounded-xl border border-solar-border-card bg-white px-3 text-sm font-bold w-full sm:w-32"
            >
              <button
                type="button"
                @click="quantity > (product.minOrderQty || 1) ? quantity-- : null"
                class="text-solar-text-muted hover:text-solar-text-heading px-2 text-lg"
              >
                -
              </button>
              <span>{{ quantity }}</span>
              <button
                type="button"
                @click="quantity < (product.stockQuantity || 999) ? quantity++ : null"
                class="text-solar-text-muted hover:text-solar-text-heading px-2 text-lg"
              >
                +
              </button>
            </div>

            <button
              v-if="product.price > 0"
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

        <!-- جدول عروض المتاجر المتاحة لهذا المنتج (المسار المعتمد لمقارنة الأسعار) -->
        <div v-if="storeOffers.length > 0" class="rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-bold text-solar-text-heading flex items-center gap-2">
              <Store class="size-4 text-solar-yellow" />
              <span>عروض المتاجر المتاحة لهذا المنتج ({{ storeOffers.length }} عروض)</span>
            </h2>
            <span class="text-xs text-solar-text-muted">اختر المتجر المناسب لإضافته للسلة</span>
          </div>

          <div class="flex flex-col gap-3">
            <div
              v-for="offer in storeOffers"
              :key="offer.id"
              @click="selectOffer(offer)"
              class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border p-3.5 transition-all cursor-pointer"
              :class="selectedOffer?.id === offer.id ? 'border-amber-500 bg-amber-50/40 shadow-sm' : 'border-solar-border-card bg-white hover:border-solar-yellow/60'"
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex size-5 items-center justify-center rounded-full border"
                  :class="selectedOffer?.id === offer.id ? 'border-amber-600 bg-amber-600 text-white' : 'border-gray-300'"
                >
                  <Check v-if="selectedOffer?.id === offer.id" class="size-3" />
                </div>

                <div class="flex flex-col">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-solar-text-heading">{{ offer.storeName }}</span>
                    <span class="text-[10px] text-solar-text-muted">({{ offer.storeCity }})</span>
                  </div>
                  <span class="text-[11px] text-solar-text-muted">
                    الحد الأدنى للطلب: {{ offer.minOrderQty }} • المخزون: {{ offer.stockQuantity }} قطعة
                  </span>
                </div>
              </div>

              <div class="flex items-center justify-between w-full sm:w-auto gap-4">
                <span v-if="offer.warrantyPeriod" class="badge-info text-[11px]">
                  ضمان {{ offer.warrantyPeriod }}
                </span>

                <div class="flex items-baseline gap-1">
                  <span class="text-base font-black text-solar-navy-dark">{{ Number(offer.price).toLocaleString() }}</span>
                  <span class="text-xs font-bold text-solar-text-muted">ر.س</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- جدول المواصفات الفنية المعتمدة -->
        <div class="rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm">
          <h2 class="text-base font-bold text-solar-text-heading mb-4 flex items-center gap-2">
            <Zap class="size-4 text-solar-yellow" />
            <span>المواصفات الفنية والهندسية</span>
          </h2>

          <div
            v-if="Object.keys(product.specs).length > 0"
            class="grid gap-3 sm:grid-cols-2"
          >
            <div
              v-for="(val, label) in product.specs"
              :key="label"
              class="flex items-center justify-between rounded-xl border border-solar-border-card/60 bg-solar-bg-subtle/50 px-4 py-2.5 text-xs"
            >
              <span class="text-solar-text-muted">{{ label }}</span>
              <span class="font-bold text-solar-text-heading">{{ val }}</span>
            </div>
          </div>

          <div v-else class="grid gap-3 sm:grid-cols-2">
            <div class="flex items-center justify-between rounded-xl border border-solar-border-card/60 bg-solar-bg-subtle/50 px-4 py-2.5 text-xs">
              <span class="text-solar-text-muted">العلامة التجارية</span>
              <span class="font-bold text-solar-text-heading">{{ product.brand }}</span>
            </div>
            <div class="flex items-center justify-between rounded-xl border border-solar-border-card/60 bg-solar-bg-subtle/50 px-4 py-2.5 text-xs">
              <span class="text-solar-text-muted">فئة المنتج</span>
              <span class="font-bold text-solar-text-heading">{{ product.category }}</span>
            </div>
            <div class="flex items-center justify-between rounded-xl border border-solar-border-card/60 bg-solar-bg-subtle/50 px-4 py-2.5 text-xs">
              <span class="text-solar-text-muted">الموديل الفني</span>
              <span class="font-bold text-solar-text-heading">{{ product.model }}</span>
            </div>
            <div class="flex items-center justify-between rounded-xl border border-solar-border-card/60 bg-solar-bg-subtle/50 px-4 py-2.5 text-xs">
              <span class="text-solar-text-muted">مدة الضمان المعتمد</span>
              <span class="font-bold text-solar-text-heading">{{ product.warrantyPeriod || '2 سنة مصنعية' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- نافذة طلب عرض السعر المخصص (RFQ) -->
    <CustomerEcommerceRfqModal
      :product="product"
      :is-open="showRfqModal"
      @close="showRfqModal = false"
    />
  </div>
</template>
