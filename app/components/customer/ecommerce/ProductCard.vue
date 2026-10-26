<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  ref,
  useId,
  watch,
} from 'vue'
import { Check, Heart, Package, ShoppingCart } from 'lucide-vue-next'
import { useCartStore } from '../../../stores/cart.store'
import type { Product } from '../../../../types/ecommerce'
import type { CustomerProductKind } from '../../../composables/useCustomerProducts'

type CardProduct = Omit<
  Product,
  'price' | 'rating' | 'reviewsCount' | 'specs'
> & {
  kind?: CustomerProductKind
  detailsTo?: string

  storeProductId?: number | string
  masterProductId?: number | string

  price: number | null
  priceKnown?: boolean
  rating?: number | null
  reviewsCount?: number | null
  specs: Product['specs'] | Record<string, string>

  minOrderQty?: number
  stockQuantity?: number | null
  warrantyPeriod?: string | null
}

const props = withDefaults(
  defineProps<{
    product: CardProduct
    mode?: 'cart' | 'rfq'
  }>(),
  {
    mode: 'cart',
  },
)

const emit = defineEmits<{
  openRfq: [product: CardProduct]
}>()

const cartStore = useCartStore()

const quantity = ref<number | string>(1)
const adding = ref(false)
const updatingWishlist = ref(false)
const added = ref(false)
const errorMessage = ref('')
const imageFailed = ref(false)

const quantityId = useId()
const errorId = useId()

let operationVersion = 0
let successTimer: ReturnType<typeof setTimeout> | undefined

function positiveId(value: unknown): number | null {
  const id = Number(value)

  return Number.isSafeInteger(id) && id > 0
    ? id
    : null
}

const storeProductId = computed<number | null>(() => {
  if (props.product.kind === 'master') return null

  // لا نستخدم product.id بديلًا لمعرّف عرض المتجر.
  return positiveId(props.product.storeProductId)
})

const masterProductId = computed<number | null>(() =>
  positiveId(props.product.masterProductId)
  ?? (
    props.product.kind === 'master'
      ? positiveId(props.product.id)
      : null
  ),
)

const kind = computed<CustomerProductKind | null>(() => {
  if (props.product.kind === 'master') return 'master'
  if (storeProductId.value !== null) return 'store'

  if (
    props.product.kind !== 'store'
    && masterProductId.value !== null
  ) {
    return 'master'
  }

  return props.product.kind === 'store'
    ? 'store'
    : null
})

const isMaster = computed(() =>
  kind.value === 'master',
)

const detailsUrl = computed<string | null>(() => {
  const id = isMaster.value
    ? masterProductId.value
    : storeProductId.value
      ?? (
        kind.value === 'store'
          ? positiveId(props.product.id)
          : null
      )

  if (id === null || kind.value === null) return null

  const expected =
    `/customer/products/${id}?kind=${kind.value}`

  // استخدام رابط الملف الجديد مع التأكد من تطابق نوعه ومعرّفه.
  return props.product.detailsTo === expected
    ? props.product.detailsTo
    : expected
})

const name = computed(() =>
  props.product.name?.trim() || 'منتج',
)

const category = computed(() =>
  props.product.category?.trim() || 'غير محدد',
)

const busy = computed(() =>
  adding.value
  || updatingWishlist.value
  || cartStore.isLoading,
)

const wishlistBusy = computed(() =>
  busy.value || cartStore.wishlistLoading,
)

const isFavorite = computed(() =>
  storeProductId.value !== null
  && cartStore.isInWishlist(storeProductId.value),
)

const minimumQuantity = computed(() => {
  const value = Number(props.product.minOrderQty)

  return Number.isSafeInteger(value) && value > 0
    ? value
    : 1
})

const stockQuantity = computed<number | null>(() => {
  const raw = props.product.stockQuantity

  if (
    raw === null
    || raw === undefined
    || String(raw).trim() === ''
  ) {
    return null
  }

  const value = Number(raw)

  return Number.isSafeInteger(value) && value >= 0
    ? value
    : null
})

const price = computed<number | null>(() => {
  if (
    isMaster.value
    || props.product.priceKnown === false
  ) {
    return null
  }

  const raw = props.product.price

  if (
    raw === null
    || raw === undefined
    || String(raw).trim() === ''
  ) {
    return null
  }

  const value = Number(raw)

  return Number.isFinite(value) && value >= 0
    ? value
    : null
})

const hasFixedPrice = computed(() =>
  price.value !== null && price.value > 0,
)

const priceLabel = computed(() => {
  if (price.value === null) return 'غير متاح'

  return new Intl.NumberFormat('ar', {
    maximumFractionDigits: 2,
  }).format(price.value)
})

const quoteMode = computed(() =>
  isMaster.value
  || props.mode === 'rfq'
  || props.product.isQuoteOnly === true
  || !hasFixedPrice.value,
)

const unavailable = computed(() =>
  props.product.inStock === false
  || (
    stockQuantity.value !== null
    && stockQuantity.value < minimumQuantity.value
  ),
)

const quantityError = computed(() => {
  const raw = quantity.value
  const value = Number(raw)

  if (
    String(raw).trim() === ''
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
  storeProductId.value !== null
  && !isMaster.value
  && !quoteMode.value
  && !busy.value
  && !added.value
  && !unavailable.value
  && !quantityError.value,
)

const canRequestQuote = computed(() =>
  !busy.value
  && (
    isMaster.value
      ? masterProductId.value !== null
      : storeProductId.value !== null
  ),
)

function clearSuccess() {
  if (successTimer) {
    clearTimeout(successTimer)
    successTimer = undefined
  }

  added.value = false
}

function increaseQuantity() {
  if (busy.value) return

  const current = Number(quantity.value)

  const next = Number.isSafeInteger(current)
    ? Math.max(minimumQuantity.value, current + 1)
    : minimumQuantity.value

  if (
    stockQuantity.value !== null
    && next > stockQuantity.value
  ) {
    return
  }

  quantity.value = next
}

function decreaseQuantity() {
  if (busy.value) return

  const current = Number(quantity.value)

  quantity.value = Number.isSafeInteger(current)
    ? Math.max(minimumQuantity.value, current - 1)
    : minimumQuantity.value
}

async function handleAdd() {
  if (!canAdd.value || storeProductId.value === null) return

  const version = operationVersion
  const id = storeProductId.value
  const requestedQuantity = Number(quantity.value)

  adding.value = true
  errorMessage.value = ''
  clearSuccess()

  try {
    const saved = await cartStore.addToCart(
      {
        ...props.product,
        id,
        storeProductId: id,
      },
      requestedQuantity,
    )

    if (version !== operationVersion) return

    if (saved !== true) {
      throw new Error('Addition was not confirmed')
    }

    added.value = true

    successTimer = setTimeout(() => {
      added.value = false
      successTimer = undefined
    }, 2000)
  } catch (failure: unknown) {
    if (version !== operationVersion) return

    const requestError = failure as {
      userMessage?: string
    }

    errorMessage.value =
      requestError.userMessage
      || cartStore.errorMessage
      || 'تعذر إضافة المنتج إلى السلة.'
  } finally {
    adding.value = false
  }
}

async function handleWishlist() {
  if (
    wishlistBusy.value
    || storeProductId.value === null
    || isMaster.value
  ) {
    return
  }

  const version = operationVersion
  const id = storeProductId.value

  updatingWishlist.value = true
  errorMessage.value = ''

  try {
    await cartStore.toggleWishlist({
      ...props.product,
      id,
      storeProductId: id,
    })
  } catch (failure: unknown) {
    if (version !== operationVersion) return

    const requestError = failure as {
      userMessage?: string
    }

    errorMessage.value =
      requestError.userMessage
      || cartStore.wishlistError
      || 'تعذر تحديث المفضلة.'
  } finally {
    updatingWishlist.value = false
  }
}

function handleRfq() {
  if (!canRequestQuote.value) return

  errorMessage.value = ''
  emit('openRfq', props.product)
}

watch(
  [
    () => props.product.id,
    () => props.product.kind,
    () => props.product.storeProductId,
    () => props.product.masterProductId,
    minimumQuantity,
    () => props.mode,
  ],
  () => {
    operationVersion++
    quantity.value = minimumQuantity.value
    errorMessage.value = ''
    imageFailed.value = false
    clearSuccess()
  },
  { immediate: true },
)

watch(quantity, () => {
  errorMessage.value = ''
  clearSuccess()
})

watch(
  () => props.product.image,
  () => {
    imageFailed.value = false
  },
)

onBeforeUnmount(() => {
  operationVersion++
  clearSuccess()
})
</script>

<template>
  <article
    class="flex min-w-0 flex-col rounded-2xl border border-solar-border-card bg-white p-4 shadow-sm dark:bg-solar-bg-card"
    :aria-busy="adding || updatingWishlist"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <span
          class="inline-flex rounded-full bg-solar-status-info-bg px-3 py-1 text-[11px] font-bold text-solar-text-heading"
        >
          {{
            isMaster
              ? 'منتج من الكتالوج'
              : storeProductId !== null
                ? 'عرض متجر'
                : 'منتج'
          }}
        </span>

        <p class="mt-2 text-xs leading-6 text-solar-text-muted">
          {{ category }}
        </p>
      </div>

      <button
        v-if="storeProductId !== null"
        type="button"
        :disabled="wishlistBusy"
        :aria-pressed="isFavorite"
        :aria-label="
          isFavorite
            ? 'إزالة من المفضلة'
            : 'إضافة للمفضلة'
        "
        class="flex size-8 shrink-0 items-center justify-center rounded-full border border-solar-border-card text-solar-text-muted hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        @click="handleWishlist"
      >
        <Heart
          class="size-4"
          :class="isFavorite ? 'fill-red-500 text-red-500' : ''"
          aria-hidden="true"
        />
      </button>
    </div>

    <NuxtLink
      :to="detailsUrl || '/customer/products'"
      :aria-label="detailsUrl ? `عرض ${name}` : 'تصفح المنتجات'"
      class="my-4 flex h-44 items-center justify-center overflow-hidden rounded-xl bg-solar-bg-subtle p-3"
    >
      <img
        v-if="product.image && !imageFailed"
        :src="product.image"
        :alt="name"
        loading="lazy"
        class="size-full object-contain"
        @error="imageFailed = true"
      >

      <Package
        v-else
        class="size-12 text-slate-400"
        aria-hidden="true"
      />
    </NuxtLink>

    <h2 class="text-sm font-bold leading-7 text-solar-text-heading">
      <NuxtLink
        v-if="detailsUrl"
        :to="detailsUrl"
        class="hover:underline"
      >
        {{ name }}
      </NuxtLink>

      <span v-else>{{ name }}</span>
    </h2>

    <p
      v-if="!isMaster && product.storeName"
      class="mt-2 break-words text-xs leading-6 text-solar-text-muted"
    >
      المتجر: {{ product.storeName }}
      <span v-if="product.storeCity">
        — {{ product.storeCity }}
      </span>
    </p>

    <p
      v-if="!isMaster && product.warrantyPeriod"
      class="mt-2 text-xs leading-6 text-solar-text-muted"
    >
      الضمان: {{ product.warrantyPeriod }}
    </p>

    <div class="mt-4">
      <template v-if="!isMaster && hasFixedPrice">
        <p class="text-xs text-solar-text-muted">
          السعر المعلن
        </p>

        <p class="mt-1 text-xl font-bold text-solar-text-heading">
          {{ priceLabel }}
        </p>

        <p class="mt-1 text-[11px] text-solar-text-muted">
          العملة غير محددة
        </p>
      </template>

      <p
        v-else-if="isMaster"
        class="text-xs leading-7 text-solar-text-muted"
      >
        اختر متجرًا لطلب تسعيرة لهذا المنتج.
      </p>

      <p v-else class="text-sm font-bold text-amber-800">
        السعر متاح بطلب تسعير
      </p>
    </div>

    <div class="mt-auto pt-5">
      <template v-if="!quoteMode">
        <p
          v-if="unavailable"
          class="mb-3 text-xs font-bold text-red-700"
        >
          غير متاح للشراء بالكمية الدنيا المطلوبة.
        </p>

        <label
          :for="quantityId"
          class="text-xs text-solar-text-muted"
        >
          الكمية
        </label>

        <div class="mt-2 flex items-center gap-2">
          <button
            type="button"
            :disabled="busy || Number(quantity) <= minimumQuantity"
            aria-label="تقليل الكمية"
            class="size-10 shrink-0 rounded-lg border border-solar-border-card text-lg text-solar-text-heading disabled:opacity-40"
            @click="decreaseQuantity"
          >
            −
          </button>

          <input
            :id="quantityId"
            v-model.number="quantity"
            type="number"
            inputmode="numeric"
            step="1"
            :min="minimumQuantity"
            :max="stockQuantity ?? undefined"
            :disabled="busy"
            :aria-invalid="Boolean(quantityError)"
            class="solar-input h-10 min-w-0 flex-1 text-center"
          >

          <button
            type="button"
            :disabled="
              busy
              || (
                stockQuantity !== null
                && Number(quantity) >= stockQuantity
              )
            "
            aria-label="زيادة الكمية"
            class="size-10 shrink-0 rounded-lg border border-solar-border-card text-lg text-solar-text-heading disabled:opacity-40"
            @click="increaseQuantity"
          >
            +
          </button>
        </div>

        <p
          v-if="quantityError"
          class="mt-2 text-xs leading-6 text-red-700"
        >
          {{ quantityError }}
        </p>

        <button
          type="button"
          :disabled="!canAdd"
          :aria-describedby="errorMessage ? errorId : undefined"
          class="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-60"
          :class="
            added
              ? 'bg-emerald-700 text-white'
              : 'bg-solar-yellow text-solar-navy-dark'
          "
          @click="handleAdd"
        >
          <Check v-if="added" class="size-4" aria-hidden="true" />

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

        <p v-if="added" role="status" class="sr-only">
          تمت إضافة المنتج إلى السلة.
        </p>
      </template>

      <button
        v-else
        type="button"
        :disabled="!canRequestQuote"
        class="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-solar-yellow px-4 py-3 text-xs font-bold text-solar-navy-dark disabled:cursor-not-allowed disabled:opacity-50"
        @click="handleRfq"
      >
        {{
          isMaster
            ? 'اختيار متجر وطلب تسعير'
            : 'طلب عرض سعر'
        }}
      </button>

      <p
        v-if="errorMessage"
        :id="errorId"
        role="alert"
        class="mt-3 rounded-lg bg-red-50 p-3 text-xs leading-6 text-red-800"
      >
        {{ errorMessage }}
      </p>

      <NuxtLink
        v-if="detailsUrl"
        :to="detailsUrl"
        class="mt-3 block rounded py-2 text-center text-xs font-bold text-solar-text-heading hover:underline"
      >
        {{
          isMaster
            ? 'تفاصيل المنتج وعروض المتاجر'
            : 'عرض تفاصيل المنتج'
        }}
      </NuxtLink>
    </div>
  </article>
</template>