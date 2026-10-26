<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue'
import { CheckCircle2, Loader2, MapPin } from 'lucide-vue-next'
import FormField from '../../../components/common/FormField.vue'
import MapLocationModal, {
  type LocationData,
} from '../../../components/common/MapLocationModal.vue'
import { useCartStore } from '../../../stores/cart.store'
import { useAuthStore } from '../../../stores/auth'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'إتمام طلب الشراء | SolarHub',
})

interface ApiResponse<T> {
  status: string
  message?: string
  data: T
}

interface Governorate {
  id: number
  name?: string | null
  name_ar?: string | null
  name_en?: string | null
}

interface AccountProfile {
  id: number | string
  name: string
  phone: string
  email: string
  governorate?: {
    id?: number | null
    name_ar?: string | null
  } | null
}

interface CreatedOrder {
  id: number
  order_number: string
  total_amount: number | string
  status: string
  customer?: {
    id: number | string
    name?: string
  }
}

type DeliveryField = 'governorateId' | 'address' | 'coordinates'

interface RequestFailure {
  status?: number
  statusCode?: number
  data?: {
    errors?: Record<string, string[] | string>
  }
}

const { $api } = useNuxtApp()

const cartStore = useCartStore()
const authStore = useAuthStore()

const loading = ref(true)
const metadataReady = ref(false)
const loadError = ref('')
const submitting = ref(false)
const submissionError = ref('')
const verificationRequired = ref(false)
const cartRefreshWarning = ref('')

const governorates = ref<Governorate[]>([])
const createdOrder = ref<CreatedOrder | null>(null)
const isMapOpen = ref(false)

const form = reactive({
  governorateId: '',
  address: '',
  coordinates: '',
})

const errors = reactive<
  Partial<Record<DeliveryField, string>>
>({})

let loadVersion = 0
let disposed = false
let formInitialized = false

const fieldsDisabled = computed(() =>
  loading.value
  || submitting.value
  || cartStore.isLoading
  || verificationRequired.value
  || createdOrder.value !== null,
)

const canSubmit = computed(() =>
  metadataReady.value
  && !loadError.value
  && !fieldsDisabled.value
  && cartStore.canCheckout
  && authStore.user?.role === 'customer',
)

function sameSession(token: string, owner: string): boolean {
  return !disposed
    && authStore.token === token
    && String(authStore.user?.id ?? '') === owner
}

function governorateName(governorate: Governorate): string {
  return governorate.name_ar
    || governorate.name
    || governorate.name_en
    || ''
}

function normalizeRegion(value: string): string {
  return value
    .replace(/محافظة/g, '')
    .replace(/\s+/g, ' ')
    .trim()
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

function clearErrors() {
  for (const key of Object.keys(errors)) {
    delete errors[key as DeliveryField]
  }
}

function cartFingerprint(): string {
  const rows = cartStore.items
    .map(item => ({
      id: Number(item.product.id),
      quantity: item.quantity,
      price: item.product.price,
      priceKnown: item.product.priceKnown,
    }))
    .sort((first, second) => first.id - second.id)

  return JSON.stringify({
    rows,
    amount: cartStore.subtotal,
  })
}

async function loadPage() {
  if (submitting.value || createdOrder.value) return

  const version = ++loadVersion
  const token = authStore.token
  const owner = String(authStore.user?.id ?? '')

  loading.value = true
  metadataReady.value = false
  loadError.value = ''
  submissionError.value = ''

  if (!token || !owner || authStore.user?.role !== 'customer') {
    loadError.value = 'سجّل الدخول بحساب عميل لإتمام الطلب.'
    loading.value = false
    return
  }

  try {
    const [
      governoratesResponse,
      profileResponse,
      cartLoaded,
    ] = await Promise.all([
      $api<ApiResponse<Governorate[]>>('/governorates'),
      $api<ApiResponse<AccountProfile>>('/auth/me'),
      cartStore.fetchCart(),
    ])

    if (
      version !== loadVersion
      || !sameSession(token, owner)
    ) {
      return
    }

    if (
      governoratesResponse.status !== 'success'
      || !Array.isArray(governoratesResponse.data)
      || profileResponse.status !== 'success'
      || !profileResponse.data
      || String(profileResponse.data.id) !== owner
    ) {
      throw new Error('Invalid checkout data')
    }

    if (!cartLoaded || !cartStore.isInitialized) {
      loadError.value =
        cartStore.errorMessage
        || 'تعذر التحقق من السلة. أعد المحاولة.'
      return
    }

    governorates.value = governoratesResponse.data
    authStore.setUser(profileResponse.data)

    if (!formInitialized) {
      const governorateId =
        profileResponse.data.governorate?.id

      form.governorateId = governorates.value.some(
        governorate => governorate.id === governorateId,
      )
        ? String(governorateId)
        : ''

      formInitialized = true
    }

    metadataReady.value = true
  } catch {
    if (
      version !== loadVersion
      || !sameSession(token, owner)
    ) {
      return
    }

    loadError.value =
      'تعذر تحميل بيانات إتمام الطلب. أعد المحاولة.'
  } finally {
    if (!disposed && version === loadVersion) {
      loading.value = false
    }
  }
}

function selectLocation(location: LocationData) {
  if (fieldsDisabled.value) return

  if (
    !Number.isFinite(location.lat)
    || !Number.isFinite(location.lng)
    || location.lat < -90
    || location.lat > 90
    || location.lng < -180
    || location.lng > 180
  ) {
    errors.coordinates = 'الموقع المحدد غير صالح.'
    return
  }

  form.address = location.address.trim()

  form.coordinates =
    `POINT(${location.lng.toFixed(8)} ${location.lat.toFixed(8)})`

  if (location.governorate) {
    const region = normalizeRegion(location.governorate)

    const matched = governorates.value.find(governorate =>
      normalizeRegion(governorateName(governorate)) === region,
    )

    if (matched) {
      form.governorateId = String(matched.id)
    }
  }

  delete errors.coordinates
  isMapOpen.value = false
}

function validate(): boolean {
  clearErrors()

  const address = form.address.trim()

  if (!address || address.length > 500) {
    errors.address =
      'أدخل عنوان التوصيل، بحد أقصى 500 حرف.'
  }

  if (
    form.governorateId
    && !governorates.value.some(governorate =>
      String(governorate.id) === form.governorateId,
    )
  ) {
    errors.governorateId = 'اختر محافظة من القائمة.'
  }

  if (form.coordinates.length > 255) {
    errors.coordinates = 'إحداثيات الموقع غير صالحة.'
  }

  return Object.keys(errors).length === 0
}

async function submitOrder() {
  if (!canSubmit.value) return

  submissionError.value = ''

  if (!validate()) {
    submissionError.value = 'راجع الحقول الموضحة.'
    return
  }

  const token = authStore.token
  const owner = String(authStore.user?.id ?? '')

  if (!token || !owner) return

  const previousCart = cartFingerprint()
  let requestSent = false

  submitting.value = true

  try {
    // التحقق من أحدث السلة قبل إنشاء الطلب.
    const cartLoaded = await cartStore.fetchCart()

    if (!sameSession(token, owner)) return

    if (!cartLoaded || !cartStore.canCheckout) {
      submissionError.value =
        'تعذر تأكيد صلاحية السلة. راجع المنتجات والكميات قبل المتابعة.'
      return
    }

    if (cartFingerprint() !== previousCart) {
      submissionError.value =
        'تغيرت بيانات السلة. راجع الملخص المحدث ثم أكد الطلب مجددًا.'
      return
    }

    requestSent = true

    const response = await $api<ApiResponse<CreatedOrder>>(
      '/my/orders',
      {
        method: 'POST',
        retry: 0,
        body: {
          delivery_governorate_id: form.governorateId
            ? Number(form.governorateId)
            : null,

          delivery_address: form.address.trim(),

          delivery_coordinates: form.coordinates || null,
        },
      },
    )

    if (!sameSession(token, owner)) return

    const order = response.data
    const id = Number(order?.id)

    if (
      response.status !== 'success'
      || !order
      || !Number.isSafeInteger(id)
      || id <= 0
      || typeof order.order_number !== 'string'
      || !order.order_number.trim()
      || (
        order.customer
        && String(order.customer.id) !== owner
      )
    ) {
      throw new Error('Order creation was not confirmed')
    }

    // إظهار نجاح الإنشاء قبل تحديث السلة.
    createdOrder.value = order

    const refreshed = await cartStore.fetchCart()

    if (!sameSession(token, owner)) return

    if (!refreshed) {
      cartRefreshWarning.value =
        'تم إنشاء الطلب، لكن تعذر تحديث السلة. يمكنك متابعة الطلب من سجلك.'
    }
  } catch (failure: unknown) {
    if (!sameSession(token, owner)) return

    // نجاح الإنشاء يبقى محفوظًا حتى إن فشل التحديث اللاحق.
    if (createdOrder.value) {
      cartRefreshWarning.value =
        'تم إنشاء الطلب، لكن تعذر تحديث السلة.'
      return
    }

    const requestError = failure as RequestFailure
    const status =
      requestError.statusCode ?? requestError.status

    const fieldErrors = requestError.data?.errors || {}

    const fieldMap: Record<string, DeliveryField> = {
      delivery_governorate_id: 'governorateId',
      delivery_address: 'address',
      delivery_coordinates: 'coordinates',
    }

    let hasFieldErrors = false

    if (status === 422) {
      for (const [apiField, formField] of Object.entries(fieldMap)) {
        const messages = fieldErrors[apiField]

        const message = Array.isArray(messages)
          ? messages[0]
          : messages

        if (typeof message === 'string') {
          errors[formField] = message
          hasFieldErrors = true
        }
      }
    }

    if (status === 401) {
      submissionError.value =
        'انتهت جلسة الدخول. سجّل الدخول مجددًا.'
    } else if (status === 403) {
      submissionError.value =
        'لا يملك الحساب صلاحية إنشاء هذا الطلب.'
    } else if (hasFieldErrors) {
      submissionError.value =
        'راجع بيانات التوصيل الموضحة.'
    } else if (requestSent) {
      verificationRequired.value = true

      submissionError.value =
        'تعذر تأكيد نتيجة إنشاء الطلب. راجع سجل طلباتك قبل إعادة الإرسال.'
    } else {
      submissionError.value =
        'تعذر التحقق من السلة. حدّث البيانات وأعد المحاولة.'
    }
  } finally {
    if (sameSession(token, owner)) {
      submitting.value = false
    }
  }
}

watch(
  () => form.address,
  () => {
    // تعديل العنوان يدويًا يلغي ارتباطه بالنقطة السابقة.
    form.coordinates = ''
  },
  { flush: 'sync' },
)

watch(fieldsDisabled, disabled => {
  if (disabled) isMapOpen.value = false
})

watch(
  () => String(authStore.user?.id ?? ''),
  (next, previous) => {
    if (next === previous) return

    loadVersion++

    form.governorateId = ''
    form.address = ''
    form.coordinates = ''

    formInitialized = false
    metadataReady.value = false
    createdOrder.value = null
    verificationRequired.value = false
    cartRefreshWarning.value = ''
    submissionError.value = ''
    submitting.value = false
    loading.value = false

    clearErrors()

    loadError.value =
      'تغير الحساب. أعد تحميل البيانات للمتابعة.'
  },
)

onMounted(() => {
  void loadPage()
})

onBeforeUnmount(() => {
  disposed = true
  loadVersion++
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

      <NuxtLink to="/customer/cart">
        السلة
      </NuxtLink>

      <span aria-hidden="true">‹</span>

      <span>إتمام الطلب</span>
    </nav>

    <header
      class="flex flex-wrap items-start justify-between gap-4"
    >
      <div>
        <h1 class="text-2xl font-bold text-solar-text-heading">
          إتمام طلب الشراء
        </h1>

        <p class="mt-2 text-sm leading-7 text-solar-text-muted">
          راجع المنتجات وأدخل عنوان التوصيل قبل تأكيد إنشاء الطلب.
        </p>
      </div>

      <button
        v-if="!createdOrder"
        type="button"
        :disabled="loading || submitting || cartStore.isLoading"
        class="rounded-lg border border-solar-border-card bg-white px-4 py-2 text-xs font-bold text-solar-text-heading disabled:opacity-50"
        @click="loadPage"
      >
        تحديث البيانات والسلة
      </button>
    </header>

    <section
      v-if="createdOrder"
      class="rounded-xl border border-emerald-200 bg-white p-6 text-center"
      aria-labelledby="order-success-heading"
    >
      <CheckCircle2
        class="mx-auto size-12 text-emerald-700"
        aria-hidden="true"
      />

      <h2
        id="order-success-heading"
        class="mt-4 text-xl font-bold text-solar-text-heading"
      >
        تم إنشاء الطلب بنجاح
      </h2>

      <p class="mt-3 font-bold text-solar-text-heading">
        {{ createdOrder.order_number }}
      </p>

      <p class="mt-3 text-sm text-solar-text-muted">
        إجمالي الطلب المسجل:
        {{ formatAmount(createdOrder.total_amount) }}
      </p>

      <p class="mt-2 text-xs text-solar-text-muted">
        العملة غير محددة في بيانات الطلب.
      </p>

      <p
        v-if="cartRefreshWarning"
        role="status"
        class="mt-4 rounded-lg bg-amber-50 p-3 text-sm leading-7 text-amber-900"
      >
        {{ cartRefreshWarning }}
      </p>

      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <NuxtLink
          :to="`/customer/orders/${createdOrder.id}/track`"
          class="rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark"
        >
          عرض الطلب
        </NuxtLink>

        <NuxtLink
          to="/customer/orders"
          class="rounded-lg border border-solar-border-card px-5 py-3 text-sm font-bold text-solar-text-heading"
        >
          سجل طلباتي
        </NuxtLink>
      </div>
    </section>

    <section
      v-else-if="loading"
      role="status"
      aria-live="polite"
      class="rounded-xl border border-solar-border-card bg-white p-12 text-center"
    >
      <Loader2
        class="mx-auto size-8 animate-spin text-amber-600"
        aria-hidden="true"
      />

      <p class="mt-4 text-sm text-solar-text-muted">
        جارٍ تحميل بيانات الطلب…
      </p>
    </section>

    <section
      v-else-if="loadError"
      role="alert"
      class="rounded-xl border border-red-200 bg-red-50 p-5"
    >
      <p class="text-sm leading-7 text-red-800">
        {{ loadError }}
      </p>

      <button
        type="button"
        class="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-bold text-red-800"
        @click="loadPage"
      >
        إعادة المحاولة
      </button>
    </section>

    <template v-else>
      <section
        v-if="submissionError"
        role="alert"
        class="rounded-xl border border-red-200 bg-red-50 p-5"
      >
        <p class="text-sm leading-7 text-red-800">
          {{ submissionError }}
        </p>

        <div
          v-if="verificationRequired"
          class="mt-4 flex flex-wrap gap-3"
        >
          <NuxtLink
            to="/customer/orders"
            class="rounded-lg bg-white px-4 py-2 text-sm font-bold text-red-800"
          >
            مراجعة سجل طلباتي
          </NuxtLink>

          <NuxtLink
            to="/customer/cart"
            class="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-800"
          >
            العودة إلى السلة
          </NuxtLink>
        </div>
      </section>

      <section
        v-if="!cartStore.isInitialized && !submitting"
        class="rounded-xl border border-solar-border-card bg-white p-8 text-center"
      >
        <p class="text-sm leading-7 text-solar-text-muted">
          {{ cartStore.errorMessage || 'لم يتم التحقق من السلة بعد.' }}
        </p>

        <button
          type="button"
          class="mt-4 rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark"
          @click="loadPage"
        >
          إعادة تحميل البيانات
        </button>
      </section>

      <section
        v-else-if="!cartStore.items.length && !submitting"
        class="rounded-xl border border-dashed border-solar-border-card bg-white p-12 text-center"
      >
        <h2 class="text-xl font-bold text-solar-text-heading">
          لا توجد منتجات لإتمام الطلب
        </h2>

        <div class="mt-5 flex flex-wrap justify-center gap-3">
          <NuxtLink
            to="/customer/products"
            class="rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark"
          >
            تصفح المنتجات
          </NuxtLink>

          <NuxtLink
            to="/customer/orders"
            class="rounded-lg border border-solar-border-card px-5 py-3 text-sm font-bold text-solar-text-heading"
          >
            عرض طلباتي
          </NuxtLink>
        </div>
      </section>

      <form
        v-else
        class="grid items-start gap-6 lg:grid-cols-3"
        novalidate
        :aria-busy="submitting"
        @submit.prevent="submitOrder"
      >
        <div class="flex flex-col gap-6 lg:col-span-2">
          <section class="solar-card p-5">
            <h2 class="text-lg font-bold text-solar-text-heading">
              بيانات صاحب الحساب
            </h2>

            <dl class="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <dt class="text-xs text-solar-text-muted">
                  الاسم
                </dt>
                <dd class="mt-2 text-sm text-solar-text-heading">
                  {{ authStore.user?.name || 'غير متاح' }}
                </dd>
              </div>

              <div>
                <dt class="text-xs text-solar-text-muted">
                  الهاتف
                </dt>
                <dd class="mt-2 text-sm text-solar-text-heading">
                  <bdi>{{ authStore.user?.phone || 'غير متاح' }}</bdi>
                </dd>
              </div>

              <div class="sm:col-span-2">
                <dt class="text-xs text-solar-text-muted">
                  البريد الإلكتروني
                </dt>
                <dd class="mt-2 break-all text-sm text-solar-text-heading">
                  {{ authStore.user?.email || 'غير متاح' }}
                </dd>
              </div>
            </dl>

            <NuxtLink
              to="/customer/settings"
              class="mt-5 inline-flex text-xs font-bold text-solar-text-heading underline"
            >
              تعديل بيانات الحساب
            </NuxtLink>
          </section>

          <fieldset
            :disabled="fieldsDisabled"
            class="solar-card min-w-0 p-5"
          >
            <legend class="sr-only">
              بيانات التوصيل
            </legend>

            <h2 class="mb-5 text-lg font-bold text-solar-text-heading">
              عنوان التوصيل
            </h2>

            <div class="flex flex-col gap-5">
              <FormField
                label="المحافظة"
                :error="errors.governorateId"
              >
                <select
                  v-model="form.governorateId"
                  class="solar-input h-11"
                  :aria-invalid="Boolean(errors.governorateId)"
                >
                  <option value="">
                    غير محددة
                  </option>

                  <option
                    v-for="governorate in governorates"
                    :key="governorate.id"
                    :value="String(governorate.id)"
                  >
                    {{ governorateName(governorate) }}
                  </option>
                </select>
              </FormField>

              <FormField
                label="العنوان التفصيلي وتعليمات الوصول"
                :error="errors.address"
                required
              >
                <textarea
                  v-model="form.address"
                  rows="4"
                  maxlength="500"
                  autocomplete="street-address"
                  required
                  :aria-invalid="Boolean(errors.address)"
                  placeholder="المدينة، الحي، الشارع، وأقرب علامة معروفة"
                  class="solar-input resize-y"
                />

                <p class="mt-2 text-xs text-solar-text-muted">
                  {{ form.address.length }} / 500
                </p>
              </FormField>

              <div>
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-lg border border-solar-border-card px-4 py-3 text-xs font-bold text-solar-text-heading"
                  @click="isMapOpen = true"
                >
                  <MapPin class="size-4" aria-hidden="true" />
                  تحديد الموقع على الخريطة
                </button>

                <p
                  v-if="form.coordinates"
                  class="mt-3 text-xs font-bold text-emerald-800"
                >
                  تم تحديد نقطة التوصيل.
                </p>

                <button
                  v-if="form.coordinates"
                  type="button"
                  class="mt-2 text-xs text-solar-text-muted underline"
                  @click="form.coordinates = ''"
                >
                  إلغاء نقطة الخريطة
                </button>

                <p
                  v-if="errors.coordinates"
                  class="mt-2 text-xs leading-6 text-red-700"
                >
                  {{ errors.coordinates }}
                </p>
              </div>
            </div>
          </fieldset>
        </div>

        <aside class="solar-card p-5">
          <h2 class="text-lg font-bold text-solar-text-heading">
            مراجعة المنتجات
          </h2>

          <ul class="mt-5 flex flex-col gap-4">
            <li
              v-for="item in cartStore.items"
              :key="item.id ?? item.product.id"
              class="border-b border-solar-border-card pb-4"
            >
              <p class="break-words text-sm font-bold text-solar-text-heading">
                {{ item.product.name }}
              </p>

              <div
                class="mt-2 flex justify-between gap-3 text-xs text-solar-text-muted"
              >
                <span>الكمية: {{ item.quantity }}</span>

                <span>
                  {{
                    item.product.priceKnown
                      ? formatAmount(
                        item.line_total
                          ?? item.product.price * item.quantity,
                      )
                      : 'السعر غير متاح'
                  }}
                </span>
              </div>
            </li>
          </ul>

          <div
            class="mt-5 flex justify-between gap-3 text-sm font-bold text-solar-text-heading"
          >
            <span>إجمالي المنتجات</span>

            <span>
              {{
                cartStore.hasCompletePricing
                  ? formatAmount(cartStore.subtotal)
                  : 'غير متاح'
              }}
            </span>
          </div>

          <p class="mt-4 text-xs leading-7 text-solar-text-muted">
            العملة والضريبة ورسوم التوصيل غير محددة في البيانات المتاحة.
          </p>

          <p
            v-if="!cartStore.canCheckout && !submitting"
            class="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-7 text-amber-900"
          >
            راجع صلاحية المنتجات والكميات في السلة قبل المتابعة.
          </p>

          <p class="mt-4 text-xs leading-7 text-solar-text-muted">
            عند التأكيد سيُنشأ طلب شراء وتُخصم الكميات المطلوبة من المخزون.
          </p>

          <button
            type="submit"
            :disabled="!canSubmit"
            class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Loader2
              v-if="submitting"
              class="size-4 animate-spin"
              aria-hidden="true"
            />

            {{ submitting ? 'جارٍ إنشاء الطلب…' : 'تأكيد إنشاء الطلب' }}
          </button>

          <NuxtLink
            to="/customer/cart"
            class="mt-4 block text-center text-xs font-bold text-solar-text-heading underline"
          >
            مراجعة السلة
          </NuxtLink>
        </aside>
      </form>

      <MapLocationModal
        :is-open="isMapOpen"
        :current-location="form.coordinates || form.address"
        title="تحديد موقع التوصيل"
        subtitle="اختر نقطة التوصيل ثم أكد الموقع"
        @select="selectLocation"
        @close="isMapOpen = false"
      />
    </template>
  </div>
</template>