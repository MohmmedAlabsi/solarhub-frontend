<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
} from 'vue'
import { Loader2, PackageSearch, Search } from 'lucide-vue-next'
import {
  useCustomerProducts,
  type CustomerProductKind,
  type CustomerProductView,
} from '../../../composables/useCustomerProducts'
import type { Category } from '../../../../types/api'
import ProductCard from '../../../components/customer/ecommerce/ProductCard.vue'
import RfqModal from '../../../components/customer/ecommerce/RfqModal.vue'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'كتالوج المنتجات | SolarHub',
  description: 'تصفح المنتجات وعروض المتاجر واطلب عروض الأسعار.',
})

type DisplayMode = 'cart' | 'rfq'

interface CatalogFilters {
  search: string
  categoryId: string
  brandId: string
  governorateId: string
}

function emptyFilters(): CatalogFilters {
  return {
    search: '',
    categoryId: '',
    brandId: '',
    governorateId: '',
  }
}

const {
  categories,
  brands,
  governorates,
  fetchCategories,
  fetchBrands,
  fetchGovernorates,
  fetchStoreProducts,
  fetchMasterProducts,
} = useCustomerProducts()

const displayMode = ref<DisplayMode>('cart')

const draft = reactive<CatalogFilters>(emptyFilters())
const applied = ref<CatalogFilters>(emptyFilters())

const storeProducts = ref<CustomerProductView[]>([])
const masterProducts = ref<CustomerProductView[]>([])

const productsLoading = ref(true)
const productsReady = ref(false)
const productsError = ref('')

const filtersLoading = ref(true)
const filterErrors = ref<string[]>([])

const currentPage = ref(1)
const lastPage = ref(1)
const totalItems = ref<number | null>(null)

const selectedProductForRfq = ref<CustomerProductView | null>(null)
const isRfqModalOpen = ref(false)
const noticeMessage = ref('')

const pageSize = 12

let productsVersion = 0
let filtersVersion = 0
let disposed = false

const categoryOptions = computed(() => {
  const options: Array<{
    value: string
    label: string
  }> = []

  const seen = new Set<string>()

  function visit(rows: Category[], parent = '') {
    for (const category of rows) {
      const value = String(category.id)

      if (seen.has(value)) continue

      seen.add(value)

      const name =
        category.name_ar
        || category.name_en
        || `تصنيف #${category.id}`

      const label = parent
        ? `${parent} / ${name}`
        : name

      options.push({ value, label })

      if (Array.isArray(category.children)) {
        visit(category.children, label)
      }
    }
  }

  visit(categories.value)

  return options
})

const searchPending = computed(() =>
  draft.search.trim() !== applied.value.search,
)

const hasFilters = computed(() =>
  Boolean(
    applied.value.search
    || applied.value.categoryId
    || applied.value.brandId
    || applied.value.governorateId,
  ),
)

const displayedProducts = computed(() => {
  if (displayMode.value === 'rfq') {
    return masterProducts.value
  }

  const start = (currentPage.value - 1) * pageSize

  return storeProducts.value.slice(start, start + pageSize)
})

const visiblePages = computed(() => {
  const end = Math.min(
    lastPage.value,
    Math.max(1, currentPage.value - 2) + 4,
  )

  const start = Math.max(1, end - 4)

  return Array.from(
    { length: end - start + 1 },
    (_, index) => start + index,
  )
})

function filterId(value: string): number | undefined {
  if (!value) return undefined

  const id = Number(value)

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw Object.assign(
      new Error('أحد معرّفات التصفية غير صالح. أعد ضبط الفلاتر.'),
      {
        userMessage:
          'أحد معرّفات التصفية غير صالح. أعد ضبط الفلاتر.',
      },
    )
  }

  return id
}

async function loadFilterOptions() {
  const version = ++filtersVersion

  filtersLoading.value = true
  filterErrors.value = []

  const jobs = [
    {
      label: 'التصنيفات',
      run: fetchCategories,
    },
    {
      label: 'العلامات التجارية',
      run: fetchBrands,
    },
    {
      label: 'المحافظات',
      run: fetchGovernorates,
    },
  ]

  const results = await Promise.allSettled(
    jobs.map(job => job.run()),
  )

  if (disposed || version !== filtersVersion) return

  filterErrors.value = results.flatMap((result, index) =>
    result.status === 'rejected'
      ? [jobs[index]!.label]
      : [],
  )

  filtersLoading.value = false
}

async function loadProducts() {
  const version = ++productsVersion
  const mode = displayMode.value
  const filters = { ...applied.value }
  const requestedPage = currentPage.value

  productsLoading.value = true
  productsReady.value = false
  productsError.value = ''
  totalItems.value = null

  const current = () =>
    !disposed && version === productsVersion

  try {
    const categoryId = filterId(filters.categoryId)
    const brandId = filterId(filters.brandId)

    if (mode === 'cart') {
      const rows = await fetchStoreProducts({
        category_id: categoryId,
        brand_id: brandId,
        governorate_id: filterId(filters.governorateId),
        search: filters.search,
      })

      if (!current()) return

      storeProducts.value = rows

      totalItems.value = rows.length
      lastPage.value = Math.max(
        1,
        Math.ceil(rows.length / pageSize),
      )

      currentPage.value = Math.min(
        requestedPage,
        lastPage.value,
      )

      productsReady.value = true
      return
    }

    let page = requestedPage

    // معالجة الصفحة التي لم تعد موجودة بعد تغير البيانات.
    for (let attempt = 0; attempt < 3; attempt++) {
      const result = await fetchMasterProducts({
        page,
        per_page: pageSize,
        category_id: categoryId,
        brand_id: brandId,
        search: filters.search,
      })

      if (!current()) return

      if (result.meta.total === 0) {
        masterProducts.value = []
        totalItems.value = 0
        currentPage.value = 1
        lastPage.value = 1
        productsReady.value = true
        return
      }

      if (
        result.meta.current_page > result.meta.last_page
      ) {
        page = result.meta.last_page
        continue
      }

      masterProducts.value = result.products
      totalItems.value = result.meta.total
      currentPage.value = result.meta.current_page
      lastPage.value = result.meta.last_page
      productsReady.value = true
      return
    }

    productsError.value =
      'تغيرت صفحات الكتالوج أثناء التحميل. أعد المحاولة.'
  } catch (failure: unknown) {
    if (!current()) return

    const requestError = failure as {
      userMessage?: string
    }

    productsError.value =
      requestError.userMessage
      || 'تعذر تحميل المنتجات. تحقق من الاتصال وأعد المحاولة.'
  } finally {
    if (current()) {
      productsLoading.value = false
    }
  }
}

function applyFilters() {
  applied.value = {
    search: draft.search.trim(),
    categoryId: draft.categoryId,
    brandId: draft.brandId,

    // المنتج المرجعي غير مرتبط بمحافظة.
    governorateId: displayMode.value === 'cart'
      ? draft.governorateId
      : '',
  }

  currentPage.value = 1
  noticeMessage.value = ''

  void loadProducts()
}

function setMode(mode: DisplayMode) {
  if (displayMode.value === mode) return

  displayMode.value = mode
  applyFilters()
}

function resetFilters() {
  Object.assign(draft, emptyFilters())
  applied.value = emptyFilters()
  currentPage.value = 1
  noticeMessage.value = ''

  void loadProducts()
}

async function changePage(page: number) {
  if (
    productsLoading.value
    || !productsReady.value
    || productsError.value
    || !Number.isInteger(page)
    || page < 1
    || page > lastPage.value
    || page === currentPage.value
  ) {
    return
  }

  const mode = displayMode.value
  currentPage.value = page

  if (mode === 'rfq') {
    await loadProducts()
  }

  if (
    !disposed
    && displayMode.value === mode
    && import.meta.client
  ) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }
}

function openRfqModal(candidate: {
  id: number | string
  kind?: CustomerProductKind
}) {
  const rows = candidate.kind === 'master'
    ? masterProducts.value
    : storeProducts.value

  const product = rows.find(row =>
    row.kind === candidate.kind
    && Number(row.id) === Number(candidate.id),
  )

  if (!product) return

  selectedProductForRfq.value = product
  isRfqModalOpen.value = true
}

function handleRfqSubmitted(submission: { id: number }) {
  noticeMessage.value =
    `تم حفظ طلب التسعير #${submission.id}.`
}

onMounted(() => {
  void loadFilterOptions()
  void loadProducts()
})

onBeforeUnmount(() => {
  disposed = true
  productsVersion++
  filtersVersion++
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

      <span>كتالوج المنتجات</span>
    </nav>

    <header>
      <h1 class="text-2xl font-bold text-solar-text-heading md:text-3xl">
        كتالوج المنتجات
      </h1>

      <p class="mt-3 text-sm leading-7 text-solar-text-muted">
        تصفح عروض المتاجر، أو استعرض المنتجات المرجعية لاختيار
        متجر وطلب تسعيرته.
      </p>
    </header>

    <nav
      class="flex flex-wrap gap-3"
      aria-label="طريقة تصفح المنتجات"
    >
      <button
        type="button"
        :aria-pressed="displayMode === 'cart'"
        class="rounded-lg border px-5 py-3 text-sm font-bold"
        :class="
          displayMode === 'cart'
            ? 'border-solar-yellow bg-solar-yellow text-solar-navy-dark'
            : 'border-solar-border-card bg-white text-solar-text-heading'
        "
        @click="setMode('cart')"
      >
        عروض المتاجر
      </button>

      <button
        type="button"
        :aria-pressed="displayMode === 'rfq'"
        class="rounded-lg border px-5 py-3 text-sm font-bold"
        :class="
          displayMode === 'rfq'
            ? 'border-solar-yellow bg-solar-yellow text-solar-navy-dark'
            : 'border-solar-border-card bg-white text-solar-text-heading'
        "
        @click="setMode('rfq')"
      >
        الكتالوج المرجعي
      </button>
    </nav>

    <section
      class="rounded-xl border border-solar-border-card bg-white p-5"
      aria-label="البحث وتصفية المنتجات"
    >
      <form
        class="flex flex-col gap-3 sm:flex-row"
        @submit.prevent="applyFilters"
      >
        <label class="relative min-w-0 flex-1">
          <span class="sr-only">البحث في المنتجات</span>

          <Search
            class="pointer-events-none absolute right-3 top-3.5 size-4 text-solar-text-muted"
            aria-hidden="true"
          />

          <input
            v-model="draft.search"
            type="search"
            :placeholder="
              displayMode === 'rfq'
                ? 'ابحث باسم المنتج'
                : 'المنتج أو الموديل أو العلامة أو المتجر'
            "
            class="solar-input h-11 pr-10"
          >
        </label>

        <button
          type="submit"
          class="rounded-lg bg-solar-navy px-6 py-3 text-sm font-bold text-white"
        >
          بحث
        </button>
      </form>

      <p
        v-if="searchPending"
        class="mt-3 text-xs leading-6 text-amber-800"
      >
        اضغط «بحث» لتطبيق النص الذي كتبته.
      </p>

      <div
        class="mt-5 grid gap-4 border-t border-solar-border-card pt-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <label class="flex flex-col gap-2">
          <span class="text-xs font-bold text-solar-text-heading">
            التصنيف
          </span>

          <select
            v-model="draft.categoryId"
            :disabled="filtersLoading"
            class="solar-input h-11 disabled:opacity-50"
            @change="applyFilters"
          >
            <option value="">جميع التصنيفات</option>

            <option
              v-for="category in categoryOptions"
              :key="category.value"
              :value="category.value"
            >
              {{ category.label }}
            </option>
          </select>
        </label>

        <label class="flex flex-col gap-2">
          <span class="text-xs font-bold text-solar-text-heading">
            العلامة التجارية
          </span>

          <select
            v-model="draft.brandId"
            :disabled="filtersLoading"
            class="solar-input h-11 disabled:opacity-50"
            @change="applyFilters"
          >
            <option value="">جميع العلامات</option>

            <option
              v-for="brand in brands"
              :key="brand.id"
              :value="String(brand.id)"
            >
              {{ brand.name }}
            </option>
          </select>
        </label>

        <label
          v-if="displayMode === 'cart'"
          class="flex flex-col gap-2"
        >
          <span class="text-xs font-bold text-solar-text-heading">
            محافظة عرض المتجر
          </span>

          <select
            v-model="draft.governorateId"
            :disabled="filtersLoading"
            class="solar-input h-11 disabled:opacity-50"
            @change="applyFilters"
          >
            <option value="">جميع المحافظات</option>

            <option
              v-for="governorate in governorates"
              :key="governorate.id"
              :value="String(governorate.id)"
            >
              {{ governorate.name_ar || governorate.name_en }}
            </option>
          </select>
        </label>
      </div>

      <p
        v-if="filtersLoading"
        role="status"
        class="mt-4 text-xs text-solar-text-muted"
      >
        جارٍ تحميل خيارات التصفية…
      </p>

      <section
        v-if="filterErrors.length"
        role="alert"
        class="mt-4 rounded-lg bg-amber-50 p-4"
      >
        <p class="text-xs leading-7 text-amber-900">
          تعذر تحميل: {{ filterErrors.join('، ') }}.
        </p>

        <button
          type="button"
          :disabled="filtersLoading"
          class="mt-2 text-xs font-bold text-amber-900 underline disabled:opacity-50"
          @click="loadFilterOptions"
        >
          إعادة تحميل خيارات التصفية
        </button>
      </section>
    </section>

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

    <div class="flex flex-wrap items-center justify-between gap-3">
      <p
        v-if="productsReady && !productsLoading && !productsError"
        role="status"
        aria-live="polite"
        class="text-sm text-solar-text-muted"
      >
        عدد النتائج: {{ totalItems }}
        {{ displayMode === 'cart' ? 'عرض متجر' : 'منتج مرجعي' }}
      </p>

      <span v-else />

      <div class="flex flex-wrap gap-3">
        <button
          v-if="hasFilters || searchPending"
          type="button"
          class="rounded-lg border border-solar-border-card bg-white px-4 py-2 text-xs font-bold text-solar-text-heading"
          @click="resetFilters"
        >
          إعادة ضبط الفلاتر
        </button>

        <button
          type="button"
          :disabled="productsLoading"
          class="rounded-lg border border-solar-border-card bg-white px-4 py-2 text-xs font-bold text-solar-text-heading disabled:opacity-50"
          @click="loadProducts"
        >
          تحديث النتائج
        </button>
      </div>
    </div>

    <section
      v-if="
        productsLoading
        || (!productsReady && !productsError)
      "
      role="status"
      aria-live="polite"
      class="rounded-xl border border-solar-border-card bg-white p-12 text-center"
    >
      <Loader2
        class="mx-auto size-8 animate-spin text-amber-600"
        aria-hidden="true"
      />

      <p class="mt-4 text-sm text-solar-text-muted">
        جارٍ تحميل المنتجات…
      </p>
    </section>

    <section
      v-else-if="productsError"
      role="alert"
      class="rounded-xl border border-red-200 bg-red-50 p-5"
    >
      <p class="text-sm leading-7 text-red-800">
        {{ productsError }}
      </p>

      <div class="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          class="rounded-lg bg-white px-4 py-2 text-sm font-bold text-red-800"
          @click="loadProducts"
        >
          إعادة المحاولة
        </button>

        <button
          type="button"
          class="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-800"
          @click="resetFilters"
        >
          إعادة ضبط الفلاتر
        </button>
      </div>
    </section>

    <template v-else>
      <div
        v-if="displayedProducts.length"
        class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <ProductCard
          v-for="product in displayedProducts"
          :key="`${product.kind}:${product.id}`"
          :product="product"
          :mode="displayMode"
          @open-rfq="openRfqModal"
        />
      </div>

      <section
        v-else
        class="rounded-xl border border-dashed border-solar-border-card bg-white p-12 text-center"
      >
        <PackageSearch
          class="mx-auto size-12 text-solar-text-muted"
          aria-hidden="true"
        />

        <h2 class="mt-4 text-lg font-bold text-solar-text-heading">
          {{
            hasFilters
              ? 'لا توجد نتائج تطابق خيارات التصفية'
              : displayMode === 'cart'
                ? 'لا توجد عروض متاجر متاحة حاليًا'
                : 'لا توجد منتجات مرجعية متاحة حاليًا'
          }}
        </h2>

        <button
          v-if="hasFilters"
          type="button"
          class="mt-5 rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark"
          @click="resetFilters"
        >
          إظهار جميع النتائج
        </button>
      </section>

      <nav
        v-if="lastPage > 1"
        class="flex flex-col items-center justify-between gap-4 rounded-xl border border-solar-border-card bg-white p-4 sm:flex-row"
        aria-label="صفحات المنتجات"
      >
        <p class="text-xs text-solar-text-muted">
          الصفحة {{ currentPage }} من {{ lastPage }}
        </p>

        <div class="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            :disabled="currentPage === 1"
            class="rounded-lg border border-solar-border-card px-3 py-2 text-xs disabled:opacity-40"
            @click="changePage(currentPage - 1)"
          >
            السابق
          </button>

          <button
            v-if="visiblePages[0] > 1"
            type="button"
            class="rounded-lg border border-solar-border-card px-3 py-2 text-xs"
            @click="changePage(1)"
          >
            1
          </button>

          <span
            v-if="visiblePages[0] > 2"
            class="text-xs text-solar-text-muted"
          >
            …
          </span>

          <button
            v-for="page in visiblePages"
            :key="page"
            type="button"
            :aria-current="currentPage === page ? 'page' : undefined"
            class="rounded-lg border px-3 py-2 text-xs font-bold"
            :class="
              currentPage === page
                ? 'border-solar-yellow bg-solar-yellow text-solar-navy-dark'
                : 'border-solar-border-card text-solar-text-heading'
            "
            @click="changePage(page)"
          >
            {{ page }}
          </button>

          <span
            v-if="visiblePages[visiblePages.length - 1] < lastPage - 1"
            class="text-xs text-solar-text-muted"
          >
            …
          </span>

          <button
            v-if="visiblePages[visiblePages.length - 1] < lastPage"
            type="button"
            class="rounded-lg border border-solar-border-card px-3 py-2 text-xs"
            @click="changePage(lastPage)"
          >
            {{ lastPage }}
          </button>

          <button
            type="button"
            :disabled="currentPage === lastPage"
            class="rounded-lg border border-solar-border-card px-3 py-2 text-xs disabled:opacity-40"
            @click="changePage(currentPage + 1)"
          >
            التالي
          </button>
        </div>
      </nav>
    </template>

    <RfqModal
      :product="selectedProductForRfq"
      :is-open="isRfqModalOpen"
      @close="isRfqModalOpen = false"
      @submitted="handleRfqSubmitted"
    />
  </div>
</template>
