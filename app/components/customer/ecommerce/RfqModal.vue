<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  reactive,
  ref,
  useId,
  watch,
} from 'vue'
import {
  CheckCircle2,
  Loader2,
  Send,
  X,
} from 'lucide-vue-next'
import FormField from '../../common/FormField.vue'
import {
  useCustomerProducts,
  type CustomerProductKind,
  type CustomerProductView,
  type StoreOfferItem,
} from '../../../composables/useCustomerProducts'
import { useAuthStore } from '../../../stores/auth'

interface RfqProduct {
  id: number | string
  kind?: CustomerProductKind
  name?: string
  title?: string
  storeProductId?: number | string
  masterProductId?: number | string
}

interface RfqSubmission {
  id: number
  product: CustomerProductView
  quantity: number
  notes: string
  targetPrice: number | null
}

type Field = 'store' | 'quantity' | 'targetPrice' | 'notes'

const props = defineProps<{
  product: RfqProduct | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  submitted: [submission: RfqSubmission]
}>()

const authStore = useAuthStore()

const {
  fetchProductDetails,
  sendQuoteRequest,
  isActionLoading,
  error,
  offersError,
  quoteError,
  quoteValidationErrors,
  quoteNeedsVerification,
} = useCustomerProducts()

const headingId = useId()
const descriptionId = useId()

const panel = ref<HTMLDivElement | null>(null)
const successHeading = ref<HTMLElement | null>(null)

const loading = ref(false)
const loadError = ref('')
const formMessage = ref('')
const productName = ref('')

const offers = ref<StoreOfferItem[]>([])
const offersWarning = ref<string | null>(null)
const selectedOfferId = ref('')

const quantity = ref<number | string>(1)
const targetPrice = ref<number | string>('')
const notes = ref('')

const errors = reactive<Partial<Record<Field, string>>>({})
const createdQuote = ref<RfqSubmission | null>(null)

let createdForKey = ''
let viewVersion = 0
let disposed = false

let previousFocus: HTMLElement | null = null
let previousOverflow: string | null = null

function positiveId(value: unknown): number | null {
  const id = Number(value)

  return Number.isSafeInteger(id) && id > 0
    ? id
    : null
}

const source = computed<{
  kind: CustomerProductKind
  id: number
} | null>(() => {
  const product = props.product

  if (!product) return null

  if (product.kind === 'master') {
    const id = positiveId(
      product.masterProductId ?? product.id,
    )

    return id === null ? null : { kind: 'master', id }
  }

  const storeId = positiveId(product.storeProductId)

  if (storeId !== null) {
    return { kind: 'store', id: storeId }
  }

  if (product.kind !== 'store') {
    const masterId = positiveId(product.masterProductId)

    if (masterId !== null) {
      return { kind: 'master', id: masterId }
    }
  }

  return null
})

const expectedMasterId = computed(() =>
  positiveId(props.product?.masterProductId)
  ?? (
    source.value?.kind === 'master'
      ? source.value.id
      : null
  ),
)

const identityKey = computed(() => [
  String(authStore.user?.id ?? 'guest'),
  source.value?.kind ?? 'invalid',
  source.value?.id ?? '',
  expectedMasterId.value ?? '',
].join(':'))

const selectedOffer = computed(() =>
  offers.value.find(
    offer => String(offer.id) === selectedOfferId.value,
  ) || null,
)

const selectedProduct = computed(() =>
  selectedOffer.value?.product || null,
)

const isCustomer = computed(() =>
  authStore.isAuthenticated
  && authStore.user?.role === 'customer',
)

const fieldsDisabled = computed(() =>
  loading.value
  || isActionLoading.value
  || quoteNeedsVerification.value
  || createdQuote.value !== null,
)

const canSubmit = computed(() =>
  props.isOpen
  && isCustomer.value
  && !fieldsDisabled.value
  && !loadError.value
  && selectedOffer.value?.status === 'active'
  && selectedProduct.value?.kind === 'store'
  && positiveId(selectedProduct.value.storeProductId) !== null
  && positiveId(selectedProduct.value.masterProductId) !== null,
)

const displayedError = computed(() =>
  formMessage.value || quoteError.value || '',
)

function clearErrors() {
  for (const key of Object.keys(errors)) {
    delete errors[key as Field]
  }
}

function fieldError(field: Field): string {
  const apiFields: Record<Field, string> = {
    store: 'store_product_id',
    quantity: 'quantity',
    targetPrice: 'customer_target_price',
    notes: 'customer_notes',
  }

  return errors[field]
    || quoteValidationErrors.value[apiFields[field]]
    || ''
}

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

function resetFields() {
  quantity.value = 1
  targetPrice.value = ''
  notes.value = ''
  selectedOfferId.value = ''

  formMessage.value = ''
  clearErrors()

  quoteValidationErrors.value = {}

  if (!quoteNeedsVerification.value) {
    quoteError.value = null
  }
}

function currentView(version: number, key: string): boolean {
  return !disposed
    && props.isOpen
    && version === viewVersion
    && identityKey.value === key
}

async function loadOffers() {
  const version = ++viewVersion
  const key = identityKey.value
  const requested = source.value
  const masterId = expectedMasterId.value
  const previousSelection = selectedOfferId.value

  loading.value = true
  loadError.value = ''
  offersWarning.value = null
  offers.value = []
  productName.value = ''
  selectedOfferId.value = ''

  if (!requested) {
    loadError.value =
      'تعذر تحديد نوع المنتج. اختر منتجًا أو عرض متجر صالحًا.'
    loading.value = false
    return
  }

  try {
    const result = await fetchProductDetails(
      requested.id,
      requested.kind,
    )

    if (!currentView(version, key)) return

    if (!result) {
      loadError.value =
        error.value || 'تعذر تحميل عروض المتاجر.'
      return
    }

    if (
      masterId !== null
      && Number(result.product.masterProductId) !== masterId
    ) {
      loadError.value =
        'بيانات عرض المتجر لا تطابق المنتج المحدد.'
      return
    }

    productName.value = result.product.name

    offers.value = result.offers.filter(
      offer => offer.status === 'active',
    )

    offersWarning.value = offersError.value

    if (
      previousSelection
      && offers.value.some(
        offer => String(offer.id) === previousSelection,
      )
    ) {
      selectedOfferId.value = previousSelection
    } else if (
      requested.kind === 'store'
      && offers.value.some(
        offer => Number(offer.id) === requested.id,
      )
    ) {
      selectedOfferId.value = String(requested.id)
    }
  } catch {
    if (!currentView(version, key)) return

    loadError.value =
      'تعذر تحميل عروض المتاجر. أعد المحاولة.'
  } finally {
    if (currentView(version, key)) {
      loading.value = false
    }
  }
}

function validate(): boolean {
  clearErrors()
  quoteValidationErrors.value = {}

  const selected = selectedOffer.value

  if (
    !selected
    || selected.status !== 'active'
    || selected.product.kind !== 'store'
    || Number(selected.product.storeProductId)
      !== Number(selected.id)
  ) {
    errors.store = 'اختر عرض متجر من القائمة.'
  }

  const requestedQuantity = Number(quantity.value)

  if (
    String(quantity.value).trim() === ''
    || !Number.isSafeInteger(requestedQuantity)
    || requestedQuantity <= 0
  ) {
    errors.quantity = 'أدخل كمية صحيحة أكبر من صفر.'
  }

  if (String(targetPrice.value).trim() !== '') {
    const target = Number(targetPrice.value)

    if (!Number.isFinite(target) || target < 0) {
      errors.targetPrice =
        'أدخل سعرًا مستهدفًا صالحًا أو اترك الحقل فارغًا.'
    }
  }

  if (notes.value.trim().length > 1000) {
    errors.notes = 'الملاحظات يجب ألا تتجاوز 1000 حرف.'
  }

  return Object.keys(errors).length === 0
}

async function submitRfq() {
  if (!canSubmit.value) return

  formMessage.value = ''

  if (!validate()) {
    formMessage.value = 'راجع الحقول الموضحة.'
    return
  }

  const selected = selectedProduct.value

  if (!selected || selected.storeProductId === undefined) return

  const key = identityKey.value
  const requestedQuantity = Number(quantity.value)

  const requestedPrice = String(targetPrice.value).trim() === ''
    ? null
    : Number(targetPrice.value)

  const requestedNotes = notes.value.trim()

  try {
    const response = await sendQuoteRequest({
      store_product_id: Number(selected.storeProductId),

      // يتحقق منه الفرونت، ولا يُرسل ضمن طلب الباك إند.
      master_product_id: selected.masterProductId,

      quantity: requestedQuantity,
      customer_target_price: requestedPrice,
      customer_notes: requestedNotes || null,
    })

    if (disposed || identityKey.value !== key) return

    const submission: RfqSubmission = {
      id: Number(response.data.id),
      product: selected,
      quantity: requestedQuantity,
      notes: requestedNotes,
      targetPrice: requestedPrice,
    }

    createdQuote.value = submission
    createdForKey = key

    emit('submitted', submission)

    await nextTick()

    if (props.isOpen && identityKey.value === key) {
      successHeading.value?.focus()
    }
  } catch (failure: unknown) {
    if (disposed || identityKey.value !== key) return

    const requestError = failure as {
      userMessage?: string
    }

    formMessage.value =
      requestError.userMessage
      || quoteError.value
      || 'تعذر إرسال طلب التسعير.'
  }
}

function requestClose() {
  if (isActionLoading.value) return

  emit('close')
}

function startAnotherRequest() {
  if (
    isActionLoading.value
    || quoteNeedsVerification.value
  ) {
    return
  }

  createdQuote.value = null
  createdForKey = ''

  resetFields()
  void loadOffers()
}

function unlockBody() {
  if (
    import.meta.client
    && previousOverflow !== null
  ) {
    document.body.style.overflow = previousOverflow
    previousOverflow = null
  }
}

function trapFocus(event: KeyboardEvent) {
  const element = panel.value

  if (!element) return

  const controls = Array.from(
    element.querySelectorAll<HTMLElement>(
      [
        'button:not(:disabled)',
        'a[href]',
        'input:not(:disabled)',
        'select:not(:disabled)',
        'textarea:not(:disabled)',
        '[tabindex]:not([tabindex="-1"])',
      ].join(','),
    ),
  ).filter(control => control.getClientRects().length > 0)

  if (!controls.length) {
    event.preventDefault()
    element.focus()
    return
  }

  const first = controls[0]!
  const last = controls[controls.length - 1]!
  const active = document.activeElement

  const outsideControls =
    active === element || !element.contains(active)

  if (
    event.shiftKey
    && (active === first || outsideControls)
  ) {
    event.preventDefault()
    last.focus()
  } else if (
    !event.shiftKey
    && (active === last || outsideControls)
  ) {
    event.preventDefault()
    first.focus()
  }
}

watch(
  [() => props.isOpen, identityKey],
  ([open, key]) => {
    viewVersion++

    if (!open) return

    if (
      createdQuote.value
      && createdForKey === key
    ) {
      return
    }

    createdQuote.value = null
    createdForKey = ''

    resetFields()
    void loadOffers()
  },
  { immediate: true },
)

watch(
  () => props.isOpen,
  async open => {
    if (!import.meta.client) return

    if (open) {
      previousFocus = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

      if (previousOverflow === null) {
        previousOverflow = document.body.style.overflow
      }

      document.body.style.overflow = 'hidden'

      await nextTick()

      if (props.isOpen) panel.value?.focus()
    } else {
      unlockBody()

      if (previousFocus?.isConnected) {
        previousFocus.focus()
      }
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  disposed = true
  viewVersion++
  unlockBody()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      dir="rtl"
      class="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4"
      @click.self="requestClose"
    >
      <div
        ref="panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="headingId"
        :aria-describedby="descriptionId"
        :aria-busy="isActionLoading"
        tabindex="-1"
        class="relative my-auto max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 text-right shadow-xl outline-none sm:p-7"
        @keydown.esc.stop.prevent="requestClose"
        @keydown.tab="trapFocus"
      >
        <header class="flex items-start justify-between gap-4">
          <div>
            <h2
              :id="headingId"
              class="text-xl font-bold text-solar-text-heading"
            >
              طلب عرض سعر
            </h2>

            <p
              :id="descriptionId"
              class="mt-2 text-sm leading-7 text-solar-text-muted"
            >
              اختر المتجر وأدخل الكمية واحتياجاتك.
            </p>
          </div>

          <button
            type="button"
            :disabled="isActionLoading"
            aria-label="إغلاق نافذة طلب التسعير"
            class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-solar-border-card text-solar-text-heading disabled:opacity-50"
            @click="requestClose"
          >
            <X class="size-5" aria-hidden="true" />
          </button>
        </header>

        <section
          v-if="createdQuote"
          class="py-8 text-center"
        >
          <CheckCircle2
            class="mx-auto size-12 text-emerald-700"
            aria-hidden="true"
          />

          <h3
            ref="successHeading"
            tabindex="-1"
            class="mt-4 text-xl font-bold text-solar-text-heading outline-none"
          >
            تم حفظ طلب التسعير
          </h3>

          <p class="mt-3 font-bold text-solar-text-heading">
            رقم الطلب: #{{ createdQuote.id }}
          </p>

          <p class="mt-3 text-sm text-solar-text-muted">
            المتجر: {{ createdQuote.product.storeName || 'متجر' }}
          </p>

          <p class="mt-2 text-sm text-solar-text-muted">
            الكمية المطلوبة: {{ createdQuote.quantity }}
          </p>

          <p class="mt-4 text-sm leading-7 text-solar-text-muted">
            يمكنك متابعة رد المتجر من سجل عروض الأسعار.
          </p>

          <div class="mt-6 flex flex-wrap justify-center gap-3">
            <NuxtLink
              to="/customer/orders?tab=quotes"
              class="rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark"
            >
              عرض طلبات التسعير
            </NuxtLink>

            <button
              type="button"
              class="rounded-lg border border-solar-border-card px-5 py-3 text-sm font-bold text-solar-text-heading"
              @click="requestClose"
            >
              إغلاق
            </button>
          </div>

          <button
            type="button"
            class="mt-5 text-xs text-solar-text-muted underline"
            @click="startAnotherRequest"
          >
            تجهيز طلب آخر لهذا المنتج
          </button>
        </section>

        <template v-else>
          <section
            v-if="loading"
            role="status"
            aria-live="polite"
            class="py-12 text-center"
          >
            <Loader2
              class="mx-auto size-8 animate-spin text-amber-600"
              aria-hidden="true"
            />

            <p class="mt-4 text-sm text-solar-text-muted">
              جارٍ تحميل عروض المتاجر…
            </p>
          </section>

          <section
            v-else-if="loadError"
            role="alert"
            class="mt-5 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <p class="text-sm leading-7 text-red-800">
              {{ loadError }}
            </p>

            <button
              type="button"
              class="mt-3 rounded-lg bg-white px-4 py-2 text-xs font-bold text-red-800"
              @click="loadOffers"
            >
              إعادة المحاولة
            </button>
          </section>

          <template v-else>
            <h3
              class="mt-5 break-words text-base font-bold text-solar-text-heading"
            >
              {{
                productName
                  || product?.name
                  || product?.title
                  || 'المنتج'
              }}
            </h3>

            <section
              v-if="offersWarning"
              role="status"
              class="mt-4 rounded-lg bg-amber-50 p-4"
            >
              <p class="text-xs leading-7 text-amber-900">
                {{ offersWarning }}
              </p>

              <button
                type="button"
                :disabled="isActionLoading"
                class="mt-2 text-xs font-bold text-amber-900 underline disabled:opacity-50"
                @click="loadOffers"
              >
                تحديث العروض
              </button>
            </section>

            <section
              v-if="!offers.length"
              class="mt-5 rounded-xl border border-dashed border-solar-border-card p-6 text-center"
            >
              <p class="text-sm leading-7 text-solar-text-muted">
                {{
                  offersWarning
                    ? 'لم يكتمل تحميل عروض المتاجر.'
                    : 'لا توجد عروض متاجر متاحة لهذا المنتج حاليًا.'
                }}
              </p>
            </section>

            <form
              v-else
              class="mt-5"
              novalidate
              @submit.prevent="submitRfq"
            >
              <section
                v-if="!isCustomer"
                class="mb-5 rounded-lg bg-amber-50 p-4"
              >
                <p class="text-sm leading-7 text-amber-900">
                  إرسال طلب التسعير يتطلب حساب عميل.
                </p>

                <NuxtLink
                  v-if="!authStore.isAuthenticated"
                  to="/auth/login"
                  class="mt-2 inline-flex text-xs font-bold text-amber-900 underline"
                >
                  تسجيل الدخول
                </NuxtLink>
              </section>

              <section
                v-if="displayedError"
                role="alert"
                class="mb-5 rounded-lg border border-red-200 bg-red-50 p-4"
              >
                <p class="text-sm leading-7 text-red-800">
                  {{ displayedError }}
                </p>

                <NuxtLink
                  v-if="quoteNeedsVerification"
                  to="/customer/orders?tab=quotes"
                  class="mt-3 inline-flex rounded-lg bg-white px-4 py-2 text-xs font-bold text-red-800"
                >
                  التحقق من سجل عروض الأسعار
                </NuxtLink>
              </section>

              <fieldset
                :disabled="fieldsDisabled"
                class="flex min-w-0 flex-col gap-5"
              >
                <legend class="sr-only">
                  بيانات طلب التسعير
                </legend>

                <FormField
                  label="المتجر المستهدف"
                  :error="fieldError('store')"
                  required
                >
                  <select
                    v-model="selectedOfferId"
                    class="solar-input h-11"
                    :aria-invalid="Boolean(fieldError('store'))"
                  >
                    <option value="" disabled>
                      اختر عرض متجر
                    </option>

                    <option
                      v-for="offer in offers"
                      :key="offer.id"
                      :value="String(offer.id)"
                    >
                      {{ offer.storeName || 'متجر' }}
                      — {{ offer.storeCity || 'المحافظة غير محددة' }}
                      — عرض #{{ offer.id }}
                    </option>
                  </select>
                </FormField>

                <section
                  v-if="selectedProduct"
                  class="rounded-lg bg-solar-bg-subtle p-4"
                  aria-label="بيانات عرض المتجر المختار"
                >
                  <dl class="grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt class="text-xs text-solar-text-muted">
                        السعر المعلن
                      </dt>

                      <dd class="mt-2 text-sm font-bold text-solar-text-heading">
                        {{
                          selectedProduct.priceKnown
                          && selectedProduct.price !== null
                          && selectedProduct.price > 0
                            ? formatAmount(selectedProduct.price)
                            : 'غير متاح'
                        }}
                      </dd>
                    </div>

                    <div>
                      <dt class="text-xs text-solar-text-muted">
                        الحد الأدنى للشراء
                      </dt>

                      <dd class="mt-2 text-sm text-solar-text-heading">
                        {{ selectedProduct.minOrderQty }}
                      </dd>
                    </div>
                  </dl>
                </section>

                <div class="grid gap-5 sm:grid-cols-2">
                  <FormField
                    label="الكمية المطلوبة"
                    :error="fieldError('quantity')"
                    required
                  >
                    <input
                      v-model.number="quantity"
                      type="number"
                      inputmode="numeric"
                      min="1"
                      step="1"
                      required
                      :aria-invalid="Boolean(fieldError('quantity'))"
                      class="solar-input h-11"
                    >
                  </FormField>

                  <FormField
                    label="السعر المستهدف للوحدة — اختياري"
                    :error="fieldError('targetPrice')"
                  >
                    <input
                      v-model.number="targetPrice"
                      type="number"
                      inputmode="decimal"
                      min="0"
                      step="any"
                      placeholder="اختياري"
                      :aria-invalid="Boolean(fieldError('targetPrice'))"
                      class="solar-input h-11"
                    >
                  </FormField>
                </div>

                <p class="text-xs leading-6 text-solar-text-muted">
                  العملة غير محددة في البيانات المتاحة.
                </p>

                <FormField
                  label="الملاحظات والمتطلبات — اختياري"
                  :error="fieldError('notes')"
                >
                  <textarea
                    v-model="notes"
                    rows="4"
                    maxlength="1000"
                    :aria-invalid="Boolean(fieldError('notes'))"
                    class="solar-input resize-y"
                    placeholder="اكتب المتطلبات أو الأسئلة التي تريد من المتجر مراجعتها"
                  />

                  <p class="mt-2 text-xs text-solar-text-muted">
                    {{ notes.length }} / 1000
                  </p>
                </FormField>
              </fieldset>

              <div
                class="mt-6 flex flex-wrap justify-end gap-3 border-t border-solar-border-card pt-5"
              >
                <button
                  type="button"
                  :disabled="isActionLoading"
                  class="rounded-lg border border-solar-border-card px-5 py-3 text-sm font-bold text-solar-text-heading disabled:opacity-50"
                  @click="requestClose"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  :disabled="!canSubmit"
                  class="inline-flex items-center justify-center gap-2 rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Loader2
                    v-if="isActionLoading"
                    class="size-4 animate-spin"
                    aria-hidden="true"
                  />

                  <Send
                    v-else
                    class="size-4"
                    aria-hidden="true"
                  />

                  {{
                    isActionLoading
                      ? 'جارٍ إرسال الطلب…'
                      : 'إرسال طلب التسعير'
                  }}
                </button>
              </div>
            </form>
          </template>
        </template>
      </div>
    </div>
  </Teleport>
</template>