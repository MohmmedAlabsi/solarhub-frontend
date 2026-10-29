
<script setup lang="ts">
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageSquareText,
  Quote,
  RefreshCw,
  Star,
  TriangleAlert
} from 'lucide-vue-next'

import { useAuthStore } from '~/stores/auth'
import { supplierError } from '~/utils/supplierPortal'

definePageMeta({
  layout: 'supplier'
})

useSeoMeta({
  title: 'تقييمات المتجر | SolarHub'
})

type PageNumber = number | '…'

interface StoreReview {
  id: string
  customerName: string
  rating: number
  comment: string
  createdAt: string
}

const { $api } = useNuxtApp()
const auth = useAuthStore()

const pageSize = 5

const loading = ref(false)
const loaded = ref(false)
const error = ref('')

const currentPage = ref(1)
const lastPage = ref(1)
const isServerPaginated = ref(false)

const totalReviews = ref<number | null>(null)
const reviews = ref<StoreReview[]>([])

// التقييمات المعروضة
const visibleReviews = computed(() =>
  isServerPaginated.value
    ? reviews.value
    : reviews.value.slice(
        (currentPage.value - 1) * pageSize,
        currentPage.value * pageSize
      )
)

// عدد الصفحات
const pageCount = computed(() =>
  isServerPaginated.value
    ? lastPage.value
    : Math.max(
        1,
        Math.ceil(reviews.value.length / pageSize)
      )
)

// بداية ونهاية العناصر المعروضة
const firstVisible = computed(() =>
  visibleReviews.value.length
    ? (currentPage.value - 1) * pageSize + 1
    : 0
)

const lastVisible = computed(() =>
  visibleReviews.value.length
    ? firstVisible.value + visibleReviews.value.length - 1
    : 0
)

// أرقام الصفحات
const pageNumbers = computed<PageNumber[]>(() => {
  const count = pageCount.value
  const current = currentPage.value

  if (count <= 6) {
    return Array.from(
      { length: count },
      (_, index) => index + 1
    )
  }

  if (current <= 3) {
    return [1, 2, 3, '…', count]
  }

  if (current >= count - 2) {
    return [
      1,
      '…',
      count - 2,
      count - 1,
      count
    ]
  }

  return [
    1,
    '…',
    current - 1,
    current,
    current + 1,
    '…',
    count
  ]
})

// ألوان صور العملاء
const avatarColors = [
  'bg-solar-status-info-bg text-solar-status-info-text',
  'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
  'bg-solar-yellow-tint text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300'
]

// الحروف الأولى من اسم العميل
function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0] ?? '')
    .join('') || 'ع'
}

// تنسيق التاريخ
function formatDate(value: string): string {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat(
    'ar-YE-u-nu-latn',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }
  ).format(date)
}

// تسمية التقييم
function ratingLabel(rating: number): string {
  if (rating >= 4.5) return 'ممتاز'
  if (rating >= 3.5) return 'جيد جدًا'
  if (rating >= 2.5) return 'جيد'

  return 'يحتاج تحسين'
}

// لون شارة التقييم
function ratingClass(rating: number): string {
  if (rating >= 4.5) {
    return 'bg-solar-status-success-bg text-solar-status-success-text'
  }

  if (rating >= 3.5) {
    return 'bg-solar-status-info-bg text-solar-status-info-text'
  }

  if (rating >= 2.5) {
    return 'bg-solar-status-warning-bg text-solar-status-warning-text'
  }

  return 'bg-solar-status-danger-bg text-solar-status-danger-text'
}

// تعبئة النجوم حتى في التقييمات الكسرية
function starFill(
  rating: number,
  star: number
): number {
  return Math.max(
    0,
    Math.min(
      100,
      (rating - star + 1) * 100
    )
  )
}

// تحويل القيم الرقمية بأمان
function integerOrNull(
  value: unknown
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null
  }

  const number = Number(value)

  return Number.isSafeInteger(number) &&
    number >= 0
    ? number
    : null
}

// التحقق من اعتماد التقييم
function isApproved(raw: any): boolean {
  if (
    raw?.is_approved === false ||
    raw?.is_approved === 0 ||
    raw?.is_approved === '0'
  ) {
    return false
  }

  return ![
    'pending',
    'rejected',
    'unapproved'
  ].includes(
    String(raw?.status ?? '').toLowerCase()
  )
}

// تجهيز بيانات التقييم
function normalizeReview(
  raw: any,
  index: number
): StoreReview | null {
  const rating = Number(
    raw?.rating ?? raw?.stars
  )

  if (
    !Number.isFinite(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return null
  }

  return {
    id: String(
      raw?.id ?? `review-${index}`
    ),

    customerName: String(
      raw?.customer?.name ||
      raw?.user?.name ||
      raw?.customer_name ||
      'عميل المتجر'
    ),

    rating,

    comment: String(
      raw?.comment ??
      raw?.review ??
      ''
    ),

    createdAt: String(
      raw?.created_at ??
      raw?.createdAt ??
      ''
    )
  }
}

// جلب التقييمات من Laravel
async function loadReviews(targetPage = 1) {
  if (loading.value) return

  loading.value = true
  error.value = ''

  try {
    if (
      !auth.user?.store?.id &&
      auth.token
    ) {
      await auth.initAuth()
    }

    const storeId = Number(
      auth.user?.store?.id
    )

    if (
      !Number.isSafeInteger(storeId) ||
      storeId <= 0
    ) {
      throw new Error(
        'لم يتم العثور على متجر مرتبط بحساب المورد.'
      )
    }

    const response = await $api<any>(
      `/stores/${storeId}/ratings`,
      {
        query: {
          page: targetPage,
          per_page: pageSize
        }
      }
    )

    const payload =
      response?.data ?? response

    const collection =
      payload?.ratings ??
      payload?.reviews ??
      payload

    const rawItems = Array.isArray(collection)
      ? collection
      : Array.isArray(collection?.data)
        ? collection.data
        : Array.isArray(collection?.items)
          ? collection.items
          : null

    if (!rawItems) {
      throw new Error(
        'استجابة تقييمات المتجر غير متوقعة.'
      )
    }

    const meta =
      collection?.meta ??
      payload?.meta ??
      response?.meta ??
      {}

    const total = integerOrNull(
      meta.total ??
      collection?.total ??
      payload?.total ??
      response?.total
    )

    const last = integerOrNull(
      meta.last_page ??
      collection?.last_page ??
      payload?.last_page ??
      response?.last_page
    )

    const paginated =
      last !== null ||
      meta.current_page !== undefined ||
      collection?.current_page !== undefined ||
      payload?.current_page !== undefined

    const parsed = rawItems
      .filter(isApproved)
      .map(normalizeReview)
      .filter(
        (
          item: StoreReview | null
        ): item is StoreReview =>
          item !== null
      )

    reviews.value = parsed
    isServerPaginated.value = paginated

    totalReviews.value =
      total ??
      (paginated ? null : parsed.length)

    lastPage.value = paginated
      ? Math.max(
          1,
          last ??
          (
            total !== null
              ? Math.ceil(total / pageSize)
              : targetPage
          )
        )
      : Math.max(
          1,
          Math.ceil(parsed.length / pageSize)
        )

    currentPage.value = paginated
      ? targetPage
      : Math.min(
          targetPage,
          lastPage.value
        )

    loaded.value = true
  } catch (err: any) {
    error.value =
      err instanceof Error &&
      (
        err.message.startsWith(
          'لم يتم العثور'
        ) ||
        err.message.startsWith(
          'استجابة تقييمات'
        )
      )
        ? err.message
        : supplierError(
            err,
            'تعذر تحميل تقييمات المتجر. حاول مرة أخرى.'
          )
  } finally {
    loading.value = false
  }
}

// الانتقال بين الصفحات
function goToPage(page: number) {
  if (
    loading.value ||
    page < 1 ||
    page > pageCount.value ||
    page === currentPage.value
  ) {
    return
  }

  if (isServerPaginated.value) {
    void loadReviews(page)
  } else {
    currentPage.value = page
  }
}

onMounted(() => {
  void loadReviews(1)
})
</script>

<template>
  <div
    dir="rtl"
    class="mx-auto flex w-full max-w-[1100px]
           min-w-0 flex-col gap-5 pb-5"
  >
    <!-- رأس الصفحة -->
    <header
      class="flex flex-wrap items-center
             justify-between gap-4 rounded-2xl
             border border-solar-border-card/60
             bg-solar-bg-card px-5 py-5
             shadow-card sm:px-6"
    >
      <div
        class="flex min-w-0 items-center gap-3.5"
      >
        <!-- أيقونة التقييمات -->
        <div
          class="relative flex size-12 shrink-0
                 items-center justify-center
                 rounded-2xl bg-solar-status-info-bg"
        >
          <MessageSquareText
            class="size-6 text-solar-status-info-text"
            :stroke-width="1.9"
            aria-hidden="true"
          />

          <span
            class="absolute -left-1 -top-1 size-3
                   rounded-full border-2
                   border-solar-bg-card
                   bg-solar-yellow"
            aria-hidden="true"
          />
        </div>

        <div>
          <h1
            class="text-xl font-extrabold
                   text-solar-text-heading
                   sm:text-[23px]"
          >
            تقييمات المتجر
          </h1>

          <p
            class="mt-1 text-xs leading-6
                   text-solar-text-secondary
                   sm:text-[13px]"
          >
            آراء وتقييمات العملاء المعتمدة لطلبات المتجر
          </p>
        </div>
      </div>

      <!-- تحديث التقييمات -->
      <button
        type="button"
        :disabled="loading"
        class="inline-flex items-center gap-2
               rounded-xl border
               border-solar-border-card
               bg-solar-bg-card px-3.5 py-2.5
               text-xs font-bold
               text-solar-text-heading
               transition-colors
               hover:border-solar-status-info
               hover:bg-solar-status-info-bg
               disabled:opacity-50"
        @click="loadReviews(currentPage)"
      >
        <RefreshCw
          class="size-4 text-solar-status-info"
          :class="{
            'animate-spin': loading
          }"
          aria-hidden="true"
        />

        تحديث التقييمات
      </button>
    </header>

    <!-- رسالة الخطأ -->
    <div
      v-if="error"
      role="alert"
      class="flex flex-wrap items-center
             gap-3 rounded-xl border
             border-solar-status-danger/30
             bg-solar-status-danger-bg
             p-4 text-sm
             text-solar-status-danger-text"
    >
      <TriangleAlert
        class="size-5 shrink-0"
        aria-hidden="true"
      />

      <span class="flex-1">
        {{ error }}
      </span>

      <button
        type="button"
        class="font-bold underline
               disabled:opacity-50"
        :disabled="loading"
        @click="loadReviews(currentPage)"
      >
        إعادة المحاولة
      </button>
    </div>

    <!-- حالة التحميل -->
    <section
      v-if="loading && !loaded"
      class="flex flex-col gap-3"
      aria-label="تحميل التقييمات"
      aria-busy="true"
    >
      <div
        v-for="number in 5"
        :key="number"
        class="min-h-[148px] animate-pulse
               rounded-2xl bg-solar-bg-card
               px-6 py-5 shadow-card"
      >
        <div class="flex items-center gap-3">
          <div
            class="size-11 rounded-full
                   bg-solar-bg-subtle"
          />

          <div class="space-y-2">
            <div
              class="h-3 w-32 rounded
                     bg-solar-bg-subtle"
            />

            <div
              class="h-2.5 w-24 rounded
                     bg-solar-bg-subtle"
            />
          </div>
        </div>

        <div
          class="mt-5 h-3 w-full rounded
                 bg-solar-bg-subtle"
        />

        <div
          class="mt-3 h-3 w-3/4 rounded
                 bg-solar-bg-subtle"
        />
      </div>
    </section>

    <!-- قائمة تقييمات العملاء -->
    <section
      v-if="loaded"
      aria-label="آراء العملاء"
      class="flex flex-col gap-3"
      :aria-busy="loading"
      :class="{
        'opacity-60': loading
      }"
    >
      <!-- بطاقة التقييم -->
      <article
        v-for="(review, index) in visibleReviews"
        :key="review.id"
        class="rounded-2xl border
               border-solar-border-card/50
               bg-solar-bg-card px-5 py-5
               shadow-card transition-all
               duration-200
               hover:border-solar-border-input
               hover:shadow-hover sm:px-6"
      >
        <!-- معلومات العميل والنجوم -->
        <div
          class="flex flex-wrap items-start
                 justify-between gap-4"
        >
          <!-- صورة العميل واسمه -->
          <div
            class="flex min-w-0 items-center gap-3"
          >
            <div
              class="flex size-11 shrink-0
                     items-center justify-center
                     rounded-full text-xs
                     font-extrabold ring-2
                     ring-solar-bg-card"
              :class="
                avatarColors[
                  index % avatarColors.length
                ]
              "
              aria-hidden="true"
            >
              {{ initials(review.customerName) }}
            </div>

            <div class="min-w-0">
              <h2
                class="break-words text-sm
                       font-extrabold
                       text-solar-text-heading"
              >
                {{ review.customerName }}
              </h2>

              <!-- التاريخ بأيقونة زرقاء -->
              <time
                :datetime="
                  review.createdAt || undefined
                "
                class="mt-1 flex items-center
                       gap-1.5 text-[11px]
                       text-solar-text-muted"
              >
                <CalendarDays
                  class="size-3.5
                         text-solar-status-info"
                  :stroke-width="1.8"
                  aria-hidden="true"
                />

                {{ formatDate(review.createdAt) }}
              </time>
            </div>
          </div>

          <!-- النجوم الذهبية -->
          <div
            class="flex flex-wrap
                   items-center gap-2"
          >
            <div
              dir="ltr"
              class="flex items-center gap-0.5"
              role="img"
              :aria-label="
                `التقييم ${review.rating} من 5 نجوم`
              "
            >
              <div
                v-for="star in 5"
                :key="star"
                class="relative size-[19px]"
                aria-hidden="true"
              >
                <!-- النجمة الخلفية -->
                <Star
                  class="absolute inset-0
                         size-[19px]
                         text-slate-300
                         dark:text-slate-600"
                  :stroke-width="1.7"
                />

                <!-- تعبئة النجمة باللون الذهبي -->
                <div
                  class="absolute inset-0
                         overflow-hidden"
                  :style="{
                    width: `${starFill(
                      review.rating,
                      star
                    )}%`
                  }"
                >
                  <Star
                    class="size-[19px]
                           fill-solar-yellow
                           text-solar-yellow"
                    :stroke-width="1.7"
                  />
                </div>
              </div>
            </div>

            <!-- رقم التقييم -->
            <span
              class="text-xs font-extrabold
                     tabular-nums
                     text-solar-text-heading"
            >
              {{ review.rating.toFixed(1) }}
            </span>
          </div>
        </div>

        <!-- تعليق العميل -->
        <div
          class="mt-4 flex items-start gap-2.5"
        >
          <!-- أيقونة الاقتباس -->
          <div
            class="mt-0.5 flex size-7
                   shrink-0 items-center
                   justify-center rounded-lg
                   bg-solar-yellow-tint
                   dark:bg-amber-950/30"
          >
            <Quote
              class="size-3.5 text-amber-600
                     dark:text-amber-400"
              aria-hidden="true"
            />
          </div>

          <!-- نص التقييم -->
          <p
            class="min-w-0 flex-1
                   whitespace-pre-wrap
                   break-words text-xs
                   leading-[2]
                   text-solar-text-body
                   sm:text-[13px]"
          >
            {{
              review.comment ||
              'لم يكتب العميل تعليقًا نصيًا.'
            }}
          </p>
        </div>

        <!-- شارة حالة التقييم -->
        <div
          class="mt-3 flex justify-end"
        >
          <span
            class="inline-flex items-center
                   gap-1.5 rounded-full
                   px-2.5 py-1 text-[11px]
                   font-bold"
            :class="
              ratingClass(review.rating)
            "
          >
            <CheckCircle2
              v-if="review.rating >= 3.5"
              class="size-3.5"
              aria-hidden="true"
            />

            <Star
              v-else
              class="size-3.5"
              aria-hidden="true"
            />

            {{ ratingLabel(review.rating) }}
          </span>
        </div>
      </article>

      <!-- حالة عدم وجود تقييمات -->
      <div
        v-if="
          !visibleReviews.length &&
          !error
        "
        class="flex min-h-64 flex-col
               items-center justify-center
               rounded-2xl border
               border-solar-border-card/60
               bg-solar-bg-card px-5
               py-10 text-center shadow-card"
      >
        <div
          class="relative flex size-16
                 items-center justify-center
                 rounded-2xl
                 bg-solar-status-info-bg"
        >
          <MessageSquareText
            class="size-8
                   text-solar-status-info-text"
            aria-hidden="true"
          />

          <Star
            class="absolute -left-2 -top-2
                   size-5 fill-solar-yellow
                   text-solar-yellow"
            aria-hidden="true"
          />
        </div>

        <h2
          class="mt-4 text-sm font-extrabold
                 text-solar-text-heading"
        >
          لا توجد تقييمات معتمدة
        </h2>

        <p
          class="mt-1.5 text-xs leading-6
                 text-solar-text-secondary"
        >
          ستظهر تقييمات العملاء هنا عند إضافتها إلى المتجر.
        </p>
      </div>
    </section>

    <!-- ترقيم الصفحات -->
    <footer
      v-if="
        loaded &&
        (
          visibleReviews.length ||
          pageCount > 1
        )
      "
      class="flex flex-col gap-4 pt-2
             sm:flex-row sm:items-center
             sm:justify-between"
    >
      <!-- إجمالي التقييمات -->
      <p
        class="text-xs
               text-solar-text-secondary"
      >
        <template
          v-if="totalReviews !== null"
        >
          عرض

          <strong
            class="font-bold
                   text-solar-text-heading"
          >
            {{ firstVisible }} - {{ lastVisible }}
          </strong>

          من إجمالي

          <strong
            class="font-bold
                   text-solar-text-heading"
          >
            {{ totalReviews }}
          </strong>

          تقييم معتمد
        </template>

        <template v-else>
          عرض {{ firstVisible }} - {{ lastVisible }}
          | الصفحة {{ currentPage }}
          من {{ pageCount }}
        </template>
      </p>

      <!-- أزرار التنقل -->
      <nav
        v-if="pageCount > 1"
        aria-label="صفحات التقييمات"
        class="flex flex-wrap
               items-center gap-1.5"
      >
        <!-- السابق -->
        <button
          type="button"
          class="inline-flex min-h-10
                 items-center gap-1
                 rounded-lg border
                 border-solar-border-card
                 bg-solar-bg-card px-3
                 text-[11px] font-semibold
                 text-solar-text-heading
                 transition-colors
                 hover:border-solar-status-info
                 disabled:opacity-40"
          :disabled="
            loading ||
            currentPage === 1
          "
          @click="
            goToPage(currentPage - 1)
          "
        >
          <ChevronRight
            class="size-3.5
                   text-solar-status-info"
            aria-hidden="true"
          />

          السابق
        </button>

        <!-- أرقام الصفحات -->
        <template
          v-for="(number, index) in pageNumbers"
          :key="`${number}-${index}`"
        >
          <span
            v-if="number === '…'"
            class="px-1 text-xs
                   text-solar-text-muted"
          >
            …
          </span>

          <button
            v-else
            type="button"
            class="flex size-10 items-center
                   justify-center rounded-lg
                   border text-xs font-bold
                   transition-colors"
            :class="
              number === currentPage
                ? 'border-solar-navy-dark bg-solar-navy-dark text-white'
                : 'border-solar-border-card bg-solar-bg-card text-solar-text-heading hover:border-solar-status-info'
            "
            :disabled="loading"
            :aria-current="
              number === currentPage
                ? 'page'
                : undefined
            "
            @click="
              goToPage(Number(number))
            "
          >
            {{ number }}
          </button>
        </template>

        <!-- التالي -->
        <button
          type="button"
          class="inline-flex min-h-10
                 items-center gap-1
                 rounded-lg border
                 border-solar-border-card
                 bg-solar-bg-card px-3
                 text-[11px] font-semibold
                 text-solar-text-heading
                 transition-colors
                 hover:border-solar-status-info
                 disabled:opacity-40"
          :disabled="
            loading ||
            currentPage === pageCount
          "
          @click="
            goToPage(currentPage + 1)
          "
        >
          التالي

          <ChevronLeft
            class="size-3.5
                   text-solar-status-info"
            aria-hidden="true"
          />
        </button>
      </nav>
    </footer>
  </div>
</template>
