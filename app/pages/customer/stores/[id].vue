<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  Loader2,
  Package,
  ShoppingCart,
} from 'lucide-vue-next'
import {
  useCustomerProducts,
  type CustomerProductKind,
  type CustomerProductView,
  type StoreOfferItem,
} from '../../../composables/useCustomerProducts'
import { useCartStore } from '../../../stores/cart.store'
import RfqModal from '../../../components/customer/ecommerce/RfqModal.vue'

definePageMeta({
  layout: 'customer',
})

const route = useRoute()
const cartStore = useCartStore()

const {
  fetchProductDetails,
  error,
  offersError,
  detailsWarning,
} = useCustomerProducts()

const product = ref<CustomerProductView | null>(null)
const offers = ref<StoreOfferItem[]>([])
const selectedOfferId = ref<number | null>(null)

const loading = ref(true)
const loadError = ref('')
const actionError = ref('')
const noticeMessage = ref('')

const quantity = ref<number | string>(1)
const adding = ref(false)
const updatingWishlist = ref(false)
const added = ref(false)
const showRfqModal = ref(false)

const activeImageIndex = ref(0)
const failedImages = ref<Record<string, boolean>>({})

let pageVersion = 0
let mounted = false
let disposed = false
let successTimer: ReturnType<typeof setTimeout> | undefined

function positiveId(value: unknown): number | null {
  const id = Number(value)

  return Number.isSafeInteger(id) && id > 0
    ? id
    : null
}

const productId = computed(() => {
  const raw = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id

  return positiveId(raw)
})

const productKind = computed<CustomerProductKind | null>(() => {
  const raw = Array.isArray(route.query.kind)
    ? route.query.kind[0]
    : route.query.kind

  // الروابط القديمة دون kind تخص عروض المتاجر.
  if (raw === undefined) return 'store'

  return raw === 'store' || raw === 'master'
    ? raw
    : null
})

const selectedOffer = computed(() =>
  offers.value.find(
    offer => Number(offer.id) === selectedOfferId.value,
  ) || null,
)

const selectedProduct = computed<CustomerProductView | null>(() => {
  const selected = selectedOffer.value?.product

  if (
    !selected
    || !product.value
    || selected.kind !== 'store'
    || Number(selected.masterProductId)
      !== Number(product.value.masterProductId)
    || Number(selected.storeProductId)
      !== Number(selectedOffer.value?.id)
  ) {
    return null
  }

  return selected
})

const selectedStoreProductId = computed(() =>
  positiveId(selectedProduct.value?.storeProductId),
)

const pageBusy = computed(() =>
  loading.value
  || adding.value
  || updatingWishlist.value
  || cartStore.isLoading,
)

const cartBlocked = computed(() =>
  !cartStore.isInitialized
  && Boolean(cartStore.errorMessage),
)

const isFavorite = computed(() =>
  selectedStoreProductId.value !== null
  && cartStore.isInWishlist(selectedStoreProductId.value),
)

const minimumQuantity = computed(() =>
  selectedProduct.value?.minOrderQty || 1,
)

const stockQuantity = computed(() =>
  selectedProduct.value?.stockQuantity ?? null,
)

const hasFixedPrice = computed(() =>
  selectedProduct.value?.priceKnown === true
  && selectedProduct.value.price !== null
  && selectedProduct.value.price > 0,
)

const quantityError = computed(() => {
  if (!selectedProduct.value) return ''

  const value = Number(quantity.value)

  if (
    String(quantity.value).trim() === ''
    || !Number.isSafeInteger(value)
    || value <= 0
  ) {
    return 'أدخل كمية صحيحة أكبر من صفر.'
  }

  if (value < minimumQuantity.value) {
    return `الحد الأدنى للطلب ${minimumQuantity.value}.`
  }

  if (
    stockQuantity.value !== null
    && value > stockQuantity.value
  ) {
    return `الكمية المتاحة ${stockQuantity.value}.`
  }

  return ''
})

const canAdd = computed(() =>
  selectedProduct.value !== null
  && selectedStoreProductId.value !== null
  && selectedOffer.value?.status === 'active'
  && selectedProduct.value.inStock
  && hasFixedPrice.value
  && stockQuantity.value !== null
  && !quantityError.value
  && !pageBusy.value
  && !showRfqModal.value
  && !cartBlocked.value
  && !added.value,
)

const canRequestQuote = computed(() =>
  selectedProduct.value !== null
  && selectedStoreProductId.value !== null
  && selectedOffer.value?.status === 'active'
  && !pageBusy.value
  && !showRfqModal.value,
)

const productImages = computed(() => {
  const images = product.value?.images.length
    ? product.value.images
    : product.value?.image
      ? [product.value.image]
      : []

  return images.filter(image => !failedImages.value[image])
})

const currentImage = computed(() =>
  productImages.value[activeImageIndex.value] || null,
)

function formatAmount(value: unknown): string {
  if (
    value === null
    || value === undefined
    || String(value).trim() === ''
  ) {
    return 'غير متاح'
  }

  const amount = Number(value)

  if (!Number.isFinite(amount) || amount < 0) {
    return 'غير متاح'
  }

  return new Intl.NumberFormat('ar', {
    maximumFractionDigits: 2,
  }).format(amount)
}

function clearSuccess() {
  if (successTimer) {
    clearTimeout(successTimer)
    successTimer = undefined
  }

  added.value = false
}

function nextImage() {
  const count = productImages.value.length

  if (count < 2) return

  activeImageIndex.value =
    (activeImageIndex.value + 1) % count
}

function previousImage() {
  const count = productImages.value.length

  if (count < 2) return

  activeImageIndex.value =
    (activeImageIndex.value - 1 + count) % count
}

function handleImageError(event: Event) {
  const image = event.target

  if (image instanceof HTMLImageElement) {
    failedImages.value[image.currentSrc || image.src] = true
  }
}

function selectOffer(offer: StoreOfferItem) {
  if (
    pageBusy.value
    || showRfqModal.value
    || offer.status !== 'active'
    || !product.value
    || Number(offer.product.masterProductId)
      !== Number(product.value.masterProductId)
  ) {
    return
  }

  selectedOfferId.value = Number(offer.id)
}

async function loadProduct() {
  const version = ++pageVersion
  const id = productId.value
  const kind = productKind.value

  loading.value = true
  loadError.value = ''
  actionError.value = ''
  noticeMessage.value = ''

  product.value = null
  offers.value = []
  selectedOfferId.value = null

  showRfqModal.value = false
  adding.value = false
  updatingWishlist.value = false

  failedImages.value = {}
  activeImageIndex.value = 0

  clearSuccess()

  if (id === null || kind === null) {
    loadError.value = 'رابط المنتج أو نوعه غير صالح.'
    loading.value = false
    return
  }

  try {
    const result = await fetchProductDetails(id, kind)

    if (disposed || version !== pageVersion) return

    if (!result) {
      loadError.value =
        error.value || 'تعذر تحميل تفاصيل المنتج.'
      return
    }

    product.value = result.product
    offers.value = result.offers

    // عرض المتجر الموجود في الرابط يُحدد مباشرة.
    // المنتج المرجعي ينتظر اختيار المستخدم.
    if (
      result.selectedOfferId !== undefined
      && result.offers.some(
        offer => Number(offer.id) === Number(result.selectedOfferId),
      )
    ) {
      selectedOfferId.value = Number(result.selectedOfferId)
    }
  } catch {
    if (disposed || version !== pageVersion) return

    loadError.value = 'تعذر تحميل المنتج. أعد المحاولة.'
  } finally {
    if (!disposed && version === pageVersion) {
      loading.value = false
    }
  }
}

async function refreshProduct() {
  if (pageBusy.value || showRfqModal.value) return

  await loadProduct()
}

async function handleAdd() {
  if (
    !canAdd.value
    || !selectedProduct.value
    || selectedStoreProductId.value === null
  ) {
    return
  }

  const version = pageVersion
  const selected = selectedProduct.value
  const id = selectedStoreProductId.value

  adding.value = true
  actionError.value = ''
  clearSuccess()

  try {
    const saved = await cartStore.addToCart(
      {
        ...selected,
        id,
        storeProductId: id,
      },
      Number(quantity.value),
    )

    if (disposed || version !== pageVersion) return

    if (saved !== true) {
      throw new Error('Addition was not confirmed')
    }

    added.value = true

    successTimer = setTimeout(() => {
      added.value = false
      successTimer = undefined
    }, 2000)
  } catch (failure: unknown) {
    if (disposed || version !== pageVersion) return

    const requestError = failure as {
      userMessage?: string
    }

    actionError.value =
      requestError.userMessage
      || cartStore.errorMessage
      || 'تعذر إضافة المنتج إلى السلة.'
  } finally {
    if (!disposed && version === pageVersion) {
      adding.value = false
    }
  }
}

async function toggleFavorite() {
  if (
    pageBusy.value
    || cartStore.wishlistLoading
    || !selectedProduct.value
    || selectedStoreProductId.value === null
  ) {
    return
  }

  const version = pageVersion
  const selected = selectedProduct.value
  const id = selectedStoreProductId.value

  updatingWishlist.value = true
  actionError.value = ''

  try {
    await cartStore.toggleWishlist({
      ...selected,
      id,
      storeProductId: id,
    })
  } catch (failure: unknown) {
    if (disposed || version !== pageVersion) return

    const requestError = failure as {
      userMessage?: string
    }

    actionError.value =
      requestError.userMessage
      || cartStore.wishlistError
      || 'تعذر تحديث المفضلة.'
  } finally {
    if (!disposed && version === pageVersion) {
      updatingWishlist.value = false
    }
  }
}

async function refreshCart() {
  if (pageBusy.value) return

  actionError.value = ''

  try {
    const loaded = await cartStore.fetchCart()

    if (!loaded) {
      actionError.value =
        cartStore.errorMessage || 'تعذر تحديث السلة.'
    }
  } catch {
    actionError.value = 'تعذر تحديث السلة.'
  }
}

function openRfq() {
  if (!canRequestQuote.value) return

  actionError.value = ''
  showRfqModal.value = true
}

function handleRfqSubmitted() {
  noticeMessage.value = 'تم حفظ طلب التسعير.'
}

watch(selectedProduct, selected => {
  quantity.value = selected?.minOrderQty || 1
  actionError.value = ''
  clearSuccess()
})

watch(quantity, () => {
  actionError.value = ''
  clearSuccess()
})

watch(
  () => productImages.value.length,
  length => {
    activeImageIndex.value = length
      ? Math.min(activeImageIndex.value, length - 1)
      : 0
  },
)

watch([productId, productKind], () => {
  if (mounted) void loadProduct()
})

onMounted(() => {
  mounted = true
  void loadProduct()
})

onBeforeUnmount(() => {
  disposed = true
  mounted = false
  pageVersion++
  clearSuccess()
})

useSeoMeta({
  title: () => product.value
    ? `${product.value.name} | SolarHub`
    : 'تفاصيل المنتج | SolarHub',

  description: () =>
    product.value?.description || 'مواصفات المنتج وعروض المتاجر.',
})
</script>

<template>
  <div dir="rtl" class="flex min-w-0 flex-col gap-6">
    <nav
      class="flex flex-wrap items-center gap-2 text-xs text-solar-text-muted"
      aria-label="مسار التنقل"
    >
      <NuxtLink to="/customer/dashboard">
        الرئيسية
      </NuxtLink>

      <span aria-hidden="true">‹</span>

      <NuxtLink to="/customer/products">
        المنتجات
      </NuxtLink>

      <span aria-hidden="true">‹</span>

      <span>تفاصيل المنتج</span>
    </nav>

    <section
      v-if="loading"
      role="status"
      aria-live="polite"
      class="rounded-xl border border-solar-border-card bg-white p-12 text-center"
    >
      <Loader2
        class="mx-auto size-8 animate-spin text-amber-600"
        aria-hidden="true"
      />

      <p class="mt-4 text-sm text-solar-text-muted">
        جارٍ تحميل المنتج وعروض المتاجر…
      </p>
    </section>

    <section
      v-else-if="loadError || !product"
      role="alert"
      class="rounded-xl border border-red-200 bg-red-50 p-6"
    >
      <p class="text-sm leading-7 text-red-800">
        {{ loadError || 'المنتج غير متاح.' }}
      </p>

      <button
        type="button"
        class="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-bold text-red-800"
        @click="refreshProduct"
      >
        إعادة المحاولة
      </button>
    </section>

    <template v-else>
      <header
        class="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <span
            class="rounded-full bg-solar-status-info-bg px-3 py-1 text-xs text-solar-text-heading"
          >
            {{
              productKind === 'master'
                ? 'منتج من الكتالوج'
                : 'عرض متجر'
            }}
          </span>

          <h1
            class="mt-4 break-words text-2xl font-bold text-solar-text-heading"
          >
            {{ product.name }}
          </h1>
        </div>

        <button
          type="button"
          :disabled="pageBusy || showRfqModal"
          class="rounded-lg border border-solar-border-card bg-white px-4 py-2 text-xs font-bold text-solar-text-heading disabled:opacity-50"
          @click="refreshProduct"
        >
          تحديث البيانات
        </button>
      </header>

      <p
        v-if="detailsWarning"
        role="status"
        class="rounded-xl bg-amber-50 p-4 text-sm leading-7 text-amber-900"
      >
        {{ detailsWarning }}
      </p>

      <section
        v-if="noticeMessage"
        role="status"
        class="rounded-xl bg-emerald-50 p-4 text-sm leading-7 text-emerald-800"
      >
        <p>{{ noticeMessage }}</p>

        <NuxtLink
          to="/customer/orders?tab=quotes"
          class="mt-2 inline-flex text-xs font-bold underline"
        >
          عرض طلبات التسعير
        </NuxtLink>
      </section>

      <div class="grid items-start gap-6 lg:grid-cols-2">
        <section
          class="solar-card p-5"
          aria-label="صور المنتج"
        >
          <div
            class="flex h-80 items-center justify-center rounded-xl bg-solar-bg-subtle p-5"
          >
            <img
              v-if="currentImage"
              :key="currentImage"
              :src="currentImage"
              :alt="product.name"
              class="size-full object-contain"
              @error="handleImageError"
            >

            <Package
              v-else
              class="size-16 text-slate-400"
              aria-hidden="true"
            />
          </div>

          <div
            v-if="productImages.length > 1"
            class="mt-4 flex items-center justify-between gap-3"
          >
            <button
              type="button"
              aria-label="الصورة السابقة"
              class="rounded-lg border border-solar-border-card p-2 text-solar-text-heading"
              @click="previousImage"
            >
              <ChevronRight class="size-5" aria-hidden="true" />
            </button>

            <span class="text-xs text-solar-text-muted">
              {{ activeImageIndex + 1 }} / {{ productImages.length }}
            </span>

            <button
              type="button"
              aria-label="الصورة التالية"
              class="rounded-lg border border-solar-border-card p-2 text-solar-text-heading"
              @click="nextImage"
            >
              <ChevronLeft class="size-5" aria-hidden="true" />
            </button>
          </div>

          <div
            v-if="productImages.length > 1"
            class="mt-4 flex gap-2 overflow-x-auto pb-2"
          >
            <button
              v-for="(image, index) in productImages"
              :key="image"
              type="button"
              :aria-label="`عرض الصورة ${index + 1}`"
              :aria-pressed="activeImageIndex === index"
              class="size-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white p-1"
              :class="
                activeImageIndex === index
                  ? 'border-amber-500'
                  : 'border-solar-border-card'
              "
              @click="activeImageIndex = index"
            >
              <img
                :src="image"
                alt=""
                class="size-full object-contain"
                @error="handleImageError"
              >
            </button>
          </div>
        </section>

        <section class="solar-card p-5">
          <dl class="grid gap-5 sm:grid-cols-2">
            <div>
              <dt class="text-xs text-solar-text-muted">
                التصنيف
              </dt>
              <dd class="mt-2 text-sm text-solar-text-heading">
                {{ product.category }}
              </dd>
            </div>

            <div>
              <dt class="text-xs text-solar-text-muted">
                العلامة التجارية
              </dt>
              <dd class="mt-2 text-sm text-solar-text-heading">
                {{ product.brand || 'غير محددة' }}
              </dd>
            </div>

            <div>
              <dt class="text-xs text-solar-text-muted">
                الموديل
              </dt>
              <dd class="mt-2 text-sm text-solar-text-heading">
                {{ product.model || 'غير محدد' }}
              </dd>
            </div>
          </dl>

          <p
            v-if="product.description"
            class="mt-5 whitespace-pre-line break-words text-sm leading-7 text-solar-text-body"
          >
            {{ product.description }}
          </p>

          <a
            v-if="product.datasheetUrl"
            :href="product.datasheetUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-5 inline-flex items-center gap-2 rounded-lg border border-solar-border-card px-4 py-3 text-xs font-bold text-solar-text-heading"
          >
            <FileText class="size-4" aria-hidden="true" />
            فتح مستند المواصفات
          </a>
        </section>
      </div>

      <section
        class="solar-card p-5"
        aria-labelledby="offers-heading"
      >
        <h2
          id="offers-heading"
          class="text-xl font-bold text-solar-text-heading"
        >
          {{
            offersError
              ? 'عروض المتاجر المحمّلة'
              : 'عروض المتاجر'
          }}
          ({{ offers.length }})
        </h2>

        <p class="mt-2 text-sm leading-7 text-solar-text-muted">
          اختر عرض المتجر الذي ترغب في الشراء منه أو طلب تسعيرته.
        </p>

        <div
          v-if="offersError"
          role="alert"
          class="mt-5 rounded-xl bg-amber-50 p-4"
        >
          <p class="text-sm leading-7 text-amber-900">
            {{ offersError }}
          </p>

          <button
            type="button"
            :disabled="pageBusy || showRfqModal"
            class="mt-3 rounded-lg bg-white px-4 py-2 text-xs font-bold text-amber-900 disabled:opacity-50"
            @click="refreshProduct"
          >
            إعادة تحميل العروض
          </button>
        </div>

        <div
          v-if="offers.length"
          class="mt-5 grid gap-3 md:grid-cols-2"
        >
          <button
            v-for="offer in offers"
            :key="offer.id"
            type="button"
            :aria-pressed="selectedOfferId === Number(offer.id)"
            :disabled="
              pageBusy
              || showRfqModal
              || offer.status !== 'active'
            "
            class="rounded-xl border p-4 text-right disabled:opacity-50"
            :class="
              selectedOfferId === Number(offer.id)
                ? 'border-amber-500 bg-amber-50'
                : 'border-solar-border-card bg-white'
            "
            @click="selectOffer(offer)"
          >
            <span
              class="flex items-center justify-between gap-3 text-sm font-bold text-solar-text-heading"
            >
              {{ offer.storeName || 'متجر' }}

              <Check
                v-if="selectedOfferId === Number(offer.id)"
                class="size-4 shrink-0 text-emerald-700"
                aria-hidden="true"
              />
            </span>

            <span class="mt-2 block text-xs text-solar-text-muted">
              {{ offer.storeCity || 'المحافظة غير محددة' }}
            </span>

            <span
              class="mt-3 block text-sm font-bold text-solar-text-heading"
            >
              السعر: {{ formatAmount(offer.price) }}
            </span>

            <span class="mt-2 block text-xs text-solar-text-muted">
              المخزون: {{ offer.stockQuantity ?? 'غير معروف' }}
              — الحد الأدنى: {{ offer.minOrderQty }}
            </span>
          </button>
        </div>

        <p
          v-else-if="!offersError"
          class="mt-5 rounded-lg bg-solar-bg-subtle p-4 text-sm leading-7 text-solar-text-muted"
        >
          لا توجد عروض متاجر متاحة لهذا المنتج حاليًا.
        </p>
      </section>

      <section
        v-if="selectedProduct"
        class="solar-card p-5"
        aria-labelledby="selected-offer-heading"
      >
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2
              id="selected-offer-heading"
              class="text-xl font-bold text-solar-text-heading"
            >
              العرض المختار: {{ selectedProduct.storeName || 'متجر' }}
            </h2>

            <NuxtLink
              v-if="selectedProduct.storeId"
              :to="`/customer/stores/${selectedProduct.storeId}`"
              class="mt-3 inline-flex text-xs font-bold text-solar-text-heading underline"
            >
              عرض ملف المتجر
            </NuxtLink>
          </div>

          <button
            type="button"
            :disabled="pageBusy || cartStore.wishlistLoading"
            :aria-pressed="isFavorite"
            :aria-label="
              isFavorite
                ? 'إزالة العرض من المفضلة'
                : 'إضافة العرض إلى المفضلة'
            "
            class="flex size-10 items-center justify-center rounded-lg border border-solar-border-card disabled:opacity-50"
            @click="toggleFavorite"
          >
            <Heart
              class="size-5"
              :class="
                isFavorite
                  ? 'fill-red-500 text-red-500'
                  : 'text-solar-text-muted'
              "
              aria-hidden="true"
            />
          </button>
        </div>

        <dl class="mt-5 grid gap-5 sm:grid-cols-3">
          <div>
            <dt class="text-xs text-solar-text-muted">
              السعر المعلن
            </dt>
            <dd class="mt-2 font-bold text-solar-text-heading">
              {{
                hasFixedPrice
                  ? formatAmount(selectedProduct.price)
                  : 'اطلب تسعيرة'
              }}
            </dd>
          </div>

          <div>
            <dt class="text-xs text-solar-text-muted">
              الكمية المتاحة
            </dt>
            <dd class="mt-2 font-bold text-solar-text-heading">
              {{ stockQuantity ?? 'غير معروفة' }}
            </dd>
          </div>

          <div>
            <dt class="text-xs text-solar-text-muted">
              الضمان
            </dt>
            <dd class="mt-2 text-sm text-solar-text-heading">
              {{ selectedProduct.warrantyPeriod || 'غير محدد' }}
            </dd>
          </div>
        </dl>

        <p class="mt-4 text-xs leading-7 text-solar-text-muted">
          العملة والضريبة غير محددتين في بيانات العرض.
        </p>

        <div v-if="hasFixedPrice" class="mt-5">
          <label
            for="product-purchase-quantity"
            class="text-xs font-bold text-solar-text-heading"
          >
            كمية الشراء
          </label>

          <input
            id="product-purchase-quantity"
            v-model.number="quantity"
            type="number"
            inputmode="numeric"
            step="1"
            :min="minimumQuantity"
            :max="stockQuantity ?? undefined"
            :disabled="pageBusy || showRfqModal"
            :aria-invalid="Boolean(quantityError)"
            class="solar-input mt-2 h-11 w-36"
          >

          <p
            v-if="quantityError"
            class="mt-2 text-xs leading-6 text-red-700"
          >
            {{ quantityError }}
          </p>
        </div>

        <div
          v-if="cartBlocked"
          class="mt-5 rounded-lg bg-amber-50 p-4"
        >
          <p class="text-xs leading-7 text-amber-900">
            حدّث السلة للتحقق من حالتها قبل إضافة منتج آخر.
          </p>

          <button
            type="button"
            :disabled="pageBusy"
            class="mt-3 rounded-lg bg-white px-4 py-2 text-xs font-bold text-amber-900 disabled:opacity-50"
            @click="refreshCart"
          >
            تحديث السلة
          </button>
        </div>

        <p
          v-if="actionError"
          role="alert"
          class="mt-5 rounded-lg bg-red-50 p-4 text-sm leading-7 text-red-800"
        >
          {{ actionError }}
        </p>

        <div class="mt-5 flex flex-wrap gap-3">
          <button
            v-if="hasFixedPrice"
            type="button"
            :disabled="!canAdd"
            class="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold disabled:opacity-50"
            :class="
              added
                ? 'bg-emerald-700 text-white'
                : 'bg-solar-yellow text-solar-navy-dark'
            "
            @click="handleAdd"
          >
            <Check
              v-if="added"
              class="size-4"
              aria-hidden="true"
            />

            <ShoppingCart
              v-else
              class="size-4"
              aria-hidden="true"
            />

            {{
              adding
                ? 'جارٍ الإضافة…'
                : added
                  ? 'تمت الإضافة للسلة'
                  : 'أضف إلى السلة'
            }}
          </button>

          <button
            type="button"
            :disabled="!canRequestQuote"
            class="rounded-lg bg-solar-navy px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
            @click="openRfq"
          >
            طلب عرض سعر من هذا المتجر
          </button>

          <NuxtLink
            to="/customer/cart"
            class="rounded-lg border border-solar-border-card px-5 py-3 text-sm font-bold text-solar-text-heading"
          >
            عرض السلة
          </NuxtLink>
        </div>

        <p v-if="added" role="status" class="sr-only">
          تمت إضافة العرض المختار إلى السلة.
        </p>
      </section>

      <section
        v-else-if="offers.length"
        class="rounded-xl bg-solar-status-info-bg p-5 text-sm leading-7 text-solar-text-body"
      >
        اختر عرض متجر من القائمة لتفعيل الشراء والمفضلة وطلب التسعير.
      </section>

      <section
        class="solar-card p-5"
        aria-labelledby="specifications-heading"
      >
        <h2
          id="specifications-heading"
          class="text-xl font-bold text-solar-text-heading"
        >
          المواصفات الفنية
        </h2>

        <dl
          v-if="Object.keys(product.specs).length"
          class="mt-5 grid gap-3 sm:grid-cols-2"
        >
          <div
            v-for="(value, label) in product.specs"
            :key="label"
            class="rounded-lg bg-solar-bg-subtle p-4"
          >
            <dt class="text-xs text-solar-text-muted">
              {{ label }}
            </dt>

            <dd class="mt-2 break-words text-sm font-bold text-solar-text-heading">
              {{ value }}
            </dd>
          </div>
        </dl>

        <p v-else class="mt-4 text-sm text-solar-text-muted">
          لا توجد مواصفات إضافية متاحة.
        </p>
      </section>

      <RfqModal
        v-if="selectedProduct"
        :product="selectedProduct"
        :is-open="showRfqModal"
        @close="showRfqModal = false"
        @submitted="handleRfqSubmitted"
      />
    </template>
  </div>
</template>