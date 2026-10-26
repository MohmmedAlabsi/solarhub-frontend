<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
import { Heart, Loader2 } from 'lucide-vue-next'
import {
  useCartStore,
  type CartProduct,
} from '../../../stores/cart.store'
import { useAuthStore } from '../../../stores/auth'
import ProductCard from '../../../components/customer/ecommerce/ProductCard.vue'
import RfqModal from '../../../components/customer/ecommerce/RfqModal.vue'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'قائمة المفضلة | SolarHub',
  description: 'عروض المتاجر المحفوظة في قائمة المفضلة.',
})

const cartStore = useCartStore()
const authStore = useAuthStore()

const pageLoading = ref(true)
const loadError = ref('')
const search = ref('')
const currentPage = ref(1)
const noticeMessage = ref('')

const selectedProductForRfq = ref<CartProduct | null>(null)
const isRfqModalOpen = ref(false)

const pageSize = 12

let loadVersion = 0
let mounted = false
let disposed = false

const displayError = computed(() =>
  loadError.value || cartStore.wishlistError || '',
)

const initialLoading = computed(() =>
  pageLoading.value
  || (
    cartStore.wishlistLoading
    && !cartStore.wishlistInitialized
  ),
)

const ready = computed(() =>
  cartStore.wishlistInitialized
  && !pageLoading.value
  && !displayError.value,
)

const refreshDisabled = computed(() =>
  pageLoading.value
  || cartStore.wishlistLoading
  || cartStore.isLoading,
)

const filteredProducts = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('ar')

  if (!query) return cartStore.wishlist

  return cartStore.wishlist.filter(product =>
    [
      product.name,
      product.storeName,
      product.model,
    ]
      .join(' ')
      .toLocaleLowerCase('ar')
      .includes(query),
  )
})

const totalPages = computed(() =>
  Math.max(
    1,
    Math.ceil(filteredProducts.value.length / pageSize),
  ),
)

const displayedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize

  return filteredProducts.value.slice(
    start,
    start + pageSize,
  )
})

async function loadWishlist() {
  const version = ++loadVersion

  pageLoading.value = true
  loadError.value = ''
  noticeMessage.value = ''

  try {
    const loaded = await cartStore.fetchWishlist()

    if (disposed || version !== loadVersion) return

    if (!loaded && !cartStore.wishlistError) {
      loadError.value =
        'لم يكتمل تحميل المفضلة. أعد المحاولة.'
    }
  } catch {
    if (disposed || version !== loadVersion) return

    loadError.value =
      'تعذر تحميل المفضلة. تحقق من الاتصال وأعد المحاولة.'
  } finally {
    if (!disposed && version === loadVersion) {
      pageLoading.value = false
    }
  }
}

function openRfqModal(candidate: {
  id: number | string
  storeProductId?: number | string
}) {
  const id = Number(candidate.storeProductId)

  if (!Number.isSafeInteger(id) || id <= 0) return

  const product = cartStore.wishlist.find(
    item => Number(item.storeProductId) === id,
  )

  if (!product) return

  selectedProductForRfq.value = product
  isRfqModalOpen.value = true
}

function handleRfqSubmitted(submission: { id: number }) {
  noticeMessage.value =
    `تم حفظ طلب التسعير #${submission.id}.`
}

function resetSearch() {
  search.value = ''
  currentPage.value = 1
}

function changePage(page: number) {
  if (
    !ready.value
    || !Number.isInteger(page)
    || page < 1
    || page > totalPages.value
  ) {
    return
  }

  currentPage.value = page
}

watch(search, () => {
  currentPage.value = 1
})

watch(totalPages, value => {
  currentPage.value = Math.min(
    currentPage.value,
    value,
  )
})

watch(
  [
    () => authStore.token,
    () => String(authStore.user?.id ?? ''),
  ],
  () => {
    loadVersion++

    search.value = ''
    currentPage.value = 1
    loadError.value = ''
    noticeMessage.value = ''

    selectedProductForRfq.value = null
    isRfqModalOpen.value = false

    if (mounted) {
      void loadWishlist()
    }
  },
)

onMounted(() => {
  mounted = true
  void loadWishlist()
})

onBeforeUnmount(() => {
  disposed = true
  mounted = false
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

      <span>المفضلة</span>
    </nav>

    <header
      class="flex flex-wrap items-start justify-between gap-4"
    >
      <div>
        <h1 class="text-2xl font-bold text-solar-text-heading">
          قائمة المفضلة
        </h1>

        <p class="mt-2 text-sm leading-7 text-solar-text-muted">
          راجع عروض المتاجر المحفوظة وأضف ما تحتاجه إلى السلة.
        </p>

        <p
          v-if="ready"
          class="mt-2 text-xs text-solar-text-muted"
        >
          العروض المحفوظة: {{ cartStore.wishlist.length }}
        </p>
      </div>

      <button
        type="button"
        :disabled="refreshDisabled"
        class="rounded-lg border border-solar-border-card bg-white px-4 py-2 text-xs font-bold text-solar-text-heading disabled:opacity-50"
        @click="loadWishlist"
      >
        تحديث المفضلة
      </button>
    </header>

    <section
      v-if="noticeMessage"
      role="status"
      aria-live="polite"
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
        :disabled="refreshDisabled"
        class="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-bold text-red-800 disabled:opacity-50"
        @click="loadWishlist"
      >
        إعادة تحميل المفضلة للتحقق
      </button>
    </section>

    <section
      v-if="initialLoading"
      role="status"
      aria-live="polite"
      class="rounded-xl border border-solar-border-card bg-white p-12 text-center"
    >
      <Loader2
        class="mx-auto size-8 animate-spin text-amber-600"
        aria-hidden="true"
      />

      <p class="mt-4 text-sm text-solar-text-muted">
        جارٍ تحميل المفضلة…
      </p>
    </section>

    <template v-else-if="ready">
      <p
        v-if="cartStore.wishlistLoading"
        role="status"
        aria-live="polite"
        class="rounded-lg bg-solar-status-info-bg p-3 text-xs leading-6 text-solar-text-heading"
      >
        جارٍ تحديث المفضلة…
      </p>

      <section
        v-if="!cartStore.wishlist.length"
        class="rounded-xl border border-dashed border-solar-border-card bg-white px-5 py-14 text-center"
      >
        <Heart
          class="mx-auto size-12 text-rose-500"
          aria-hidden="true"
        />

        <h2 class="mt-4 text-xl font-bold text-solar-text-heading">
          قائمة المفضلة فارغة
        </h2>

        <p class="mt-3 text-sm leading-7 text-solar-text-muted">
          احفظ عرض متجر من خلال زر القلب لتجده هنا لاحقًا.
        </p>

        <NuxtLink
          to="/customer/products"
          class="mt-5 inline-flex rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark"
        >
          تصفح المنتجات
        </NuxtLink>
      </section>

      <template v-else>
        <label
          class="flex flex-col gap-2 rounded-xl border border-solar-border-card bg-white p-5"
        >
          <span class="text-sm font-bold text-solar-text-heading">
            البحث في المفضلة
          </span>

          <input
            v-model="search"
            type="search"
            placeholder="اسم المنتج أو الموديل أو المتجر"
            class="solar-input h-11"
          >
        </label>

        <p
          role="status"
          aria-live="polite"
          class="text-sm text-solar-text-muted"
        >
          عدد النتائج: {{ filteredProducts.length }}
        </p>

        <section
          v-if="!filteredProducts.length"
          class="rounded-xl border border-dashed border-solar-border-card bg-white p-10 text-center"
        >
          <h2 class="text-lg font-bold text-solar-text-heading">
            لا توجد نتائج تطابق البحث
          </h2>

          <button
            type="button"
            class="mt-5 rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark"
            @click="resetSearch"
          >
            إظهار جميع المحفوظات
          </button>
        </section>

        <div
          v-else
          class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <ProductCard
            v-for="product in displayedProducts"
            :key="`store:${product.storeProductId}`"
            :product="product"
            mode="cart"
            @open-rfq="openRfqModal"
          />
        </div>

        <nav
          v-if="totalPages > 1"
          class="flex flex-wrap items-center justify-center gap-4"
          aria-label="صفحات المفضلة"
        >
          <button
            type="button"
            :disabled="currentPage === 1"
            class="rounded-lg border border-solar-border-card bg-white px-4 py-2 text-sm disabled:opacity-40"
            @click="changePage(currentPage - 1)"
          >
            السابق
          </button>

          <span class="text-sm text-solar-text-muted">
            الصفحة {{ currentPage }} من {{ totalPages }}
          </span>

          <button
            type="button"
            :disabled="currentPage === totalPages"
            class="rounded-lg border border-solar-border-card bg-white px-4 py-2 text-sm disabled:opacity-40"
            @click="changePage(currentPage + 1)"
          >
            التالي
          </button>
        </nav>

        <p class="text-xs leading-7 text-solar-text-muted">
          اضغط القلب لإزالة العرض من المفضلة.
          إضافة العرض إلى السلة تُبقيه محفوظًا في المفضلة.
        </p>
      </template>
    </template>

    <section
      v-else-if="!displayError"
      class="rounded-xl border border-solar-border-card bg-white p-8 text-center"
    >
      <p class="text-sm text-solar-text-muted">
        لم يكتمل تحميل المفضلة بعد.
      </p>

      <button
        type="button"
        :disabled="refreshDisabled"
        class="mt-4 rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark disabled:opacity-50"
        @click="loadWishlist"
      >
        تحميل المفضلة
      </button>
    </section>

    <RfqModal
      :product="selectedProductForRfq"
      :is-open="isRfqModalOpen"
      @close="isRfqModalOpen = false"
      @submitted="handleRfqSubmitted"
    />
  </div>
</template>