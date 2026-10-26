<script setup lang="ts">
import {
  computed,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue'
import {
  ArrowLeft,
  Loader2,
  Package,
  ShoppingCart,
  Trash2,
} from 'lucide-vue-next'
import {
  useCartStore,
  type CartStoreItem,
} from '../../../stores/cart.store'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'سلة المشتريات | SolarHub',
  description: 'مراجعة المنتجات والكميات قبل إتمام الطلب.',
})

const cartStore = useCartStore()

const actionBusy = ref(false)
const actionError = ref('')
const noticeMessage = ref('')

const quantityDrafts = reactive<Record<string, number | string>>({})
const failedImages = ref<Record<string, boolean>>({})

const busy = computed(() =>
  actionBusy.value || cartStore.isLoading,
)

const displayError = computed(() =>
  actionError.value || cartStore.errorMessage || '',
)

const canEdit = computed(() =>
  cartStore.isInitialized
  && !busy.value
  && !cartStore.errorMessage,
)

function itemKey(item: CartStoreItem): string {
  return String(item.id ?? item.product.id)
}

function itemIdentifier(item: CartStoreItem): number | string {
  return item.id ?? item.product.id
}

function minimumQuantity(item: CartStoreItem): number {
  return item.product.minOrderQty
}

function formatAmount(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return 'غير متاح'
  }

  return new Intl.NumberFormat('ar', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

function unitPriceLabel(item: CartStoreItem): string {
  if (!item.product.priceKnown) return 'غير متاح'

  return formatAmount(item.product.price)
}

function lineTotalLabel(item: CartStoreItem): string {
  if (!item.product.priceKnown) return 'غير متاح'

  return formatAmount(
    item.line_total ?? item.product.price * item.quantity,
  )
}

function draftChanged(item: CartStoreItem): boolean {
  return Number(quantityDrafts[itemKey(item)]) !== item.quantity
}

function quantityError(item: CartStoreItem): string {
  const raw = quantityDrafts[itemKey(item)]
  const value = Number(raw)

  if (
    String(raw ?? '').trim() === ''
    || !Number.isSafeInteger(value)
    || value <= 0
  ) {
    return 'أدخل كمية صحيحة أكبر من صفر.'
  }

  if (value < minimumQuantity(item)) {
    return `الحد الأدنى للطلب ${minimumQuantity(item)}.`
  }

  const stock = item.product.stockQuantity

  if (stock !== undefined && value > stock) {
    return `الكمية المطلوبة تتجاوز المتاح: ${stock}.`
  }

  return ''
}

const hasDraftChanges = computed(() =>
  cartStore.items.some(draftChanged),
)

const canProceed = computed(() =>
  cartStore.canCheckout
  && !busy.value
  && !hasDraftChanges.value,
)

const subtotalLabel = computed(() => {
  if (
    !cartStore.isInitialized
    || !cartStore.hasCompletePricing
  ) {
    return 'غير متاح'
  }

  return formatAmount(cartStore.subtotal)
})

watch(
  () => cartStore.items,
  (rows, previousRows) => {
    const previous = new Map(
      (previousRows || []).map(item => [
        itemKey(item),
        item.quantity,
      ]),
    )

    const activeKeys = new Set<string>()

    for (const item of rows) {
      const key = itemKey(item)
      activeKeys.add(key)

      const previousQuantity = previous.get(key)
      const draft = quantityDrafts[key]

      // المحافظة على تعديل غير محفوظ في سطر آخر.
      const preserveDraft =
        previousQuantity !== undefined
        && draft !== undefined
        && Number(draft) !== previousQuantity
        && item.quantity === previousQuantity

      if (!preserveDraft) {
        quantityDrafts[key] = item.quantity
      }
    }

    for (const key of Object.keys(quantityDrafts)) {
      if (!activeKeys.has(key)) {
        delete quantityDrafts[key]
      }
    }
  },
  { immediate: true },
)

function increaseQuantity(item: CartStoreItem) {
  if (!canEdit.value) return

  const key = itemKey(item)
  const current = Number(quantityDrafts[key])

  const next = Number.isSafeInteger(current)
    ? Math.max(minimumQuantity(item), current + 1)
    : minimumQuantity(item)

  const stock = item.product.stockQuantity

  if (stock !== undefined && next > stock) return

  quantityDrafts[key] = next
}

function decreaseQuantity(item: CartStoreItem) {
  if (!canEdit.value) return

  const key = itemKey(item)
  const current = Number(quantityDrafts[key])

  quantityDrafts[key] = Number.isSafeInteger(current)
    ? Math.max(minimumQuantity(item), current - 1)
    : minimumQuantity(item)
}

async function performAction(
  operation: () => Promise<boolean>,
  successMessage: string,
) {
  if (!canEdit.value) return

  actionBusy.value = true
  actionError.value = ''
  noticeMessage.value = ''

  try {
    const saved = await operation()

    if (!saved) {
      actionError.value = 'تعذر تأكيد حفظ التعديل.'
      return
    }

    noticeMessage.value = successMessage
  } catch (failure: unknown) {
    const requestError = failure as {
      userMessage?: string
    }

    actionError.value =
      requestError.userMessage
      || cartStore.errorMessage
      || 'تعذر حفظ التعديل. أعد تحميل السلة للتحقق.'
  } finally {
    actionBusy.value = false
  }
}

async function saveQuantity(item: CartStoreItem) {
  const validationMessage = quantityError(item)

  if (validationMessage) {
    actionError.value = validationMessage
    return
  }

  if (!draftChanged(item)) return

  const quantity = Number(
    quantityDrafts[itemKey(item)],
  )

  await performAction(
    () => cartStore.updateQuantity(
      itemIdentifier(item),
      quantity,
    ),
    'تم حفظ الكمية.',
  )
}

async function removeItem(item: CartStoreItem) {
  await performAction(
    () => cartStore.removeFromCart(
      itemIdentifier(item),
    ),
    'تم حذف العنصر من السلة.',
  )
}

async function clearCart() {
  if (!canEdit.value) return

  const confirmed = window.confirm(
    'هل تريد حذف جميع المنتجات من السلة؟',
  )

  if (!confirmed) return

  await performAction(
    () => cartStore.clearCart(),
    'تم تفريغ السلة.',
  )
}

async function loadCart() {
  if (busy.value) return

  actionError.value = ''
  noticeMessage.value = ''

  try {
    const loaded = await cartStore.fetchCart()

    if (!loaded && !cartStore.errorMessage) {
      actionError.value =
        'لم يكتمل تحميل السلة. أعد المحاولة.'
    }
  } catch {
    actionError.value =
      'تعذر تحميل السلة. أعد المحاولة.'
  }
}

function proceedToCheckout() {
  if (!canProceed.value) return

  return navigateTo('/customer/checkout')
}

onMounted(() => {
  void loadCart()
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

      <span class="text-solar-text-heading">
        سلة المشتريات
      </span>
    </nav>

    <header
      class="flex flex-wrap items-center justify-between gap-4"
    >
      <div>
        <h1 class="text-2xl font-bold text-solar-text-heading">
          سلة المشتريات
        </h1>

        <p
          v-if="cartStore.isInitialized"
          class="mt-2 text-sm text-solar-text-muted"
        >
          عدد الوحدات المحفوظة: {{ cartStore.totalItemsCount }}
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          :disabled="busy"
          class="rounded-lg border border-solar-border-card bg-white px-4 py-2 text-xs font-bold text-solar-text-heading disabled:opacity-50"
          @click="loadCart"
        >
          تحديث السلة
        </button>

        <button
          v-if="cartStore.isInitialized && cartStore.items.length"
          type="button"
          :disabled="!canEdit"
          class="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-700 disabled:opacity-50"
          @click="clearCart"
        >
          <Trash2 class="size-4" aria-hidden="true" />
          تفريغ السلة
        </button>
      </div>
    </header>

    <p
      v-if="noticeMessage"
      role="status"
      aria-live="polite"
      class="rounded-xl bg-emerald-50 p-4 text-sm leading-7 text-emerald-800"
    >
      {{ noticeMessage }}
    </p>

    <section
      v-if="displayError"
      role="alert"
      class="rounded-xl border border-red-200 bg-red-50 p-5"
    >
      <p class="text-sm leading-7 text-red-800">
        {{ displayError }}
      </p>

      <button
        type="button"
        :disabled="busy"
        class="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-bold text-red-800 disabled:opacity-50"
        @click="loadCart"
      >
        إعادة تحميل السلة
      </button>
    </section>

    <section
      v-if="busy && !cartStore.isInitialized"
      role="status"
      aria-live="polite"
      class="rounded-xl border border-solar-border-card bg-white p-12 text-center"
    >
      <Loader2
        class="mx-auto size-8 animate-spin text-amber-600"
        aria-hidden="true"
      />

      <p class="mt-4 text-sm text-solar-text-muted">
        جارٍ تحميل السلة…
      </p>
    </section>

    <section
      v-else-if="!cartStore.isInitialized && !displayError"
      class="rounded-xl border border-solar-border-card bg-white p-10 text-center"
    >
      <p class="text-sm text-solar-text-muted">
        لم يكتمل تحميل السلة بعد.
      </p>

      <button
        type="button"
        :disabled="busy"
        class="mt-4 rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark disabled:opacity-50"
        @click="loadCart"
      >
        تحميل السلة
      </button>
    </section>

    <template v-else-if="cartStore.isInitialized">
      <section
        v-if="!cartStore.items.length"
        class="rounded-xl border border-dashed border-solar-border-card bg-white px-5 py-14 text-center"
      >
        <ShoppingCart
          class="mx-auto size-12 text-solar-text-muted"
          aria-hidden="true"
        />

        <h2 class="mt-4 text-xl font-bold text-solar-text-heading">
          سلة المشتريات فارغة
        </h2>

        <NuxtLink
          to="/customer/products"
          class="mt-5 inline-flex items-center gap-2 rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark"
        >
          تصفح المنتجات
          <ArrowLeft class="size-4" aria-hidden="true" />
        </NuxtLink>
      </section>

      <div v-else class="grid items-start gap-6 lg:grid-cols-3">
        <div class="flex min-w-0 flex-col gap-4 lg:col-span-2">
          <article
            v-for="item in cartStore.items"
            :key="itemKey(item)"
            class="rounded-xl border border-solar-border-card bg-white p-5"
            :aria-busy="Boolean(cartStore.isUpdating[itemKey(item)])"
          >
            <div class="flex items-start gap-4">
              <div
                class="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-solar-bg-subtle p-2"
              >
                <img
                  v-if="
                    item.product.image
                    && !failedImages[itemKey(item)]
                  "
                  :src="item.product.image"
                  :alt="item.product.name"
                  loading="lazy"
                  class="size-full object-contain"
                  @error="failedImages[itemKey(item)] = true"
                >

                <Package
                  v-else
                  class="size-9 text-slate-400"
                  aria-hidden="true"
                />
              </div>

              <div class="min-w-0 flex-1">
                <h2
                  class="break-words text-base font-bold leading-7 text-solar-text-heading"
                >
                  <NuxtLink
                    :to="`/customer/products/${item.product.id}`"
                    class="hover:underline"
                  >
                    {{ item.product.name }}
                  </NuxtLink>
                </h2>

                <p
                  v-if="item.product.storeName"
                  class="mt-2 text-xs leading-6 text-solar-text-muted"
                >
                  المتجر: {{ item.product.storeName }}
                </p>

                <p class="mt-2 text-xs text-solar-text-muted">
                  سعر الوحدة: {{ unitPriceLabel(item) }}
                </p>

                <p class="mt-2 text-xs text-solar-text-muted">
                  الكمية المتاحة:
                  {{ item.product.stockQuantity ?? 'غير معروفة' }}
                </p>
              </div>

              <button
                type="button"
                :disabled="!canEdit"
                :aria-label="`حذف ${item.product.name} من السلة`"
                class="flex size-9 shrink-0 items-center justify-center rounded-lg text-red-700 hover:bg-red-50 disabled:opacity-50"
                @click="removeItem(item)"
              >
                <Trash2 class="size-4" aria-hidden="true" />
              </button>
            </div>

            <div
              class="mt-5 border-t border-solar-border-card pt-4"
            >
              <label
                :for="`cart-quantity-${itemKey(item)}`"
                class="text-xs font-bold text-solar-text-heading"
              >
                الكمية
              </label>

              <div class="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  :disabled="
                    !canEdit
                    || Number(quantityDrafts[itemKey(item)])
                      <= minimumQuantity(item)
                  "
                  aria-label="تقليل الكمية"
                  class="size-10 rounded-lg border border-solar-border-card text-lg text-solar-text-heading disabled:opacity-40"
                  @click="decreaseQuantity(item)"
                >
                  −
                </button>

                <input
                  :id="`cart-quantity-${itemKey(item)}`"
                  v-model.number="quantityDrafts[itemKey(item)]"
                  type="number"
                  inputmode="numeric"
                  step="1"
                  :min="minimumQuantity(item)"
                  :max="item.product.stockQuantity"
                  :disabled="!canEdit"
                  :aria-invalid="Boolean(quantityError(item))"
                  :aria-describedby="
                    quantityError(item)
                      ? `cart-quantity-error-${itemKey(item)}`
                      : undefined
                  "
                  class="solar-input h-10 w-24 text-center"
                >

                <button
                  type="button"
                  :disabled="
                    !canEdit
                    || (
                      item.product.stockQuantity !== undefined
                      && Number(quantityDrafts[itemKey(item)])
                        >= item.product.stockQuantity
                    )
                  "
                  aria-label="زيادة الكمية"
                  class="size-10 rounded-lg border border-solar-border-card text-lg text-solar-text-heading disabled:opacity-40"
                  @click="increaseQuantity(item)"
                >
                  +
                </button>

                <button
                  type="button"
                  :disabled="
                    !canEdit
                    || !draftChanged(item)
                    || Boolean(quantityError(item))
                  "
                  class="rounded-lg bg-solar-navy px-4 py-3 text-xs font-bold text-white disabled:opacity-50"
                  @click="saveQuantity(item)"
                >
                  تحديث الكمية
                </button>
              </div>

              <p
                v-if="quantityError(item)"
                :id="`cart-quantity-error-${itemKey(item)}`"
                class="mt-2 text-xs leading-6 text-red-700"
              >
                {{ quantityError(item) }}
              </p>

              <p
                v-else-if="draftChanged(item)"
                class="mt-2 text-xs leading-6 text-amber-800"
              >
                اضغط «تحديث الكمية» لحفظ التغيير.
              </p>

              <p class="mt-4 text-sm font-bold text-solar-text-heading">
                إجمالي الكمية المحفوظة:
                {{ lineTotalLabel(item) }}
              </p>
            </div>
          </article>
        </div>

        <aside
          class="rounded-xl border border-solar-border-card bg-white p-5"
          aria-labelledby="cart-summary-heading"
        >
          <h2
            id="cart-summary-heading"
            class="text-lg font-bold text-solar-text-heading"
          >
            ملخص السلة
          </h2>

          <dl class="mt-5 space-y-4 text-sm">
            <div class="flex justify-between gap-3">
              <dt class="text-solar-text-muted">
                عدد الوحدات المحفوظة
              </dt>

              <dd class="font-bold text-solar-text-heading">
                {{ cartStore.totalItemsCount }}
              </dd>
            </div>

            <div class="flex justify-between gap-3">
              <dt class="text-solar-text-muted">
                إجمالي المنتجات
              </dt>

              <dd class="font-bold text-solar-text-heading">
                {{ subtotalLabel }}
              </dd>
            </div>

            <div class="flex justify-between gap-3">
              <dt class="text-solar-text-muted">
                الضريبة
              </dt>

              <dd class="text-solar-text-heading">
                {{
                  cartStore.hasTaxInformation
                    ? formatAmount(cartStore.vat)
                    : 'غير محددة'
                }}
              </dd>
            </div>

            <div class="flex justify-between gap-3">
              <dt class="text-solar-text-muted">
                رسوم التوصيل
              </dt>

              <dd class="text-solar-text-heading">
                {{
                  cartStore.hasShippingInformation
                    ? formatAmount(cartStore.shippingFee)
                    : 'غير محددة'
                }}
              </dd>
            </div>

            <div class="flex justify-between gap-3">
              <dt class="text-solar-text-muted">
                العملة
              </dt>

              <dd class="text-solar-text-heading">
                غير محددة
              </dd>
            </div>
          </dl>

          <p
            class="mt-5 border-t border-solar-border-card pt-4 text-xs leading-7 text-solar-text-muted"
          >
            القيمة المعروضة هي إجمالي المنتجات.
            معلومات العملة والضريبة ورسوم التوصيل غير متاحة.
          </p>

          <p
            v-if="hasDraftChanges"
            class="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-6 text-amber-900"
          >
            احفظ تغييرات الكميات قبل المتابعة.
          </p>

          <p
            v-else-if="!cartStore.hasCompletePricing"
            class="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-6 text-amber-900"
          >
            لا يمكن المتابعة قبل توفر أسعار جميع المنتجات.
          </p>

          <p
            v-else-if="!cartStore.canCheckout && !busy"
            class="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-6 text-amber-900"
          >
            تحقق من المخزون والكميات، ثم حدّث السلة قبل المتابعة.
          </p>

          <button
            type="button"
            :disabled="!canProceed"
            class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark disabled:cursor-not-allowed disabled:opacity-50"
            @click="proceedToCheckout"
          >
            <Loader2
              v-if="busy"
              class="size-4 animate-spin"
              aria-hidden="true"
            />

            متابعة إتمام الطلب
          </button>
        </aside>
      </div>
    </template>
  </div>
</template>