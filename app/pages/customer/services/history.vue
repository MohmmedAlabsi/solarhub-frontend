<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { fetchAllApiRows } from '../../../utils/apiCollection'

definePageMeta({ layout: 'customer' })

useSeoMeta({
  title: 'طلبات الخدمات الخاصة بي | SolarHub',
})

interface CustomerServiceRequest {
  id: number
  service_type?: {
    id: number
    name: string
  } | null
  governorate?: {
    id: number
    name?: string | null
    name_ar?: string | null
    name_en?: string | null
  } | null
  system_capacity_estimate?: string | number | null
  description?: string | null
  location_details?: string | null
  status: string
  created_at?: string | null
}

interface CollectionResponse {
  status: string
  message?: string
  data:
    | CustomerServiceRequest[]
    | {
        data: CustomerServiceRequest[]
        last_page?: number
        meta?: { last_page?: number }
      }
  meta?: { last_page?: number }
}

const { $api } = useNuxtApp()

const requests = ref<CustomerServiceRequest[]>([])
const loading = ref(true)
const error = ref('')
const search = ref('')
const selectedStatus = ref('all')
const currentPage = ref(1)

const pageSize = 12
let requestVersion = 0

const statusOptions = [
  { value: 'open_for_bids', label: 'بانتظار العروض' },
  { value: 'awarded', label: 'تم قبول عرض' },
  { value: 'in_progress', label: 'قيد التنفيذ' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'cancelled', label: 'ملغى' },
]

function statusLabel(status: string): string {
  return statusOptions.find(option => option.value === status)?.label
    || 'حالة غير معروفة'
}

function statusClasses(status: string): string {
  switch (status) {
    case 'open_for_bids':
      return 'bg-blue-50 text-blue-800'
    case 'awarded':
      return 'bg-violet-50 text-violet-800'
    case 'in_progress':
      return 'bg-amber-50 text-amber-800'
    case 'completed':
      return 'bg-emerald-50 text-emerald-800'
    case 'cancelled':
      return 'bg-red-50 text-red-800'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function governorateName(request: CustomerServiceRequest): string {
  const governorate = request.governorate

  return governorate?.name_ar
    || governorate?.name
    || governorate?.name_en
    || 'غير محددة'
}

function capacityLabel(request: CustomerServiceRequest): string {
  const value = request.system_capacity_estimate

  if (value === null || value === undefined || value === '') {
    return 'غير محددة'
  }

  return `${value} كيلوواط`
}

function timestamp(value?: string | null): number {
  if (!value) return 0

  const result = Date.parse(value)

  return Number.isNaN(result) ? 0 : result
}

function formatDate(value?: string | null): string {
  if (!value) return 'التاريخ غير متاح'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'التاريخ غير متاح'
  }

  return new Intl.DateTimeFormat('ar', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

const filteredRequests = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('ar')

  return requests.value.filter(request => {
    if (
      selectedStatus.value !== 'all'
      && request.status !== selectedStatus.value
    ) {
      return false
    }

    if (!query) return true

    const searchableText = [
      String(request.id),
      request.service_type?.name,
      request.description,
      request.location_details,
      governorateName(request),
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('ar')

    return searchableText.includes(query)
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRequests.value.length / pageSize)),
)

const displayedRequests = computed(() => {
  const start = (currentPage.value - 1) * pageSize

  return filteredRequests.value.slice(start, start + pageSize)
})

watch([search, selectedStatus], () => {
  currentPage.value = 1
})

watch(totalPages, value => {
  currentPage.value = Math.min(currentPage.value, value)
})

function resetFilters() {
  search.value = ''
  selectedStatus.value = 'all'
  currentPage.value = 1
}

async function loadRequests() {
  const version = ++requestVersion

  loading.value = true
  error.value = ''

  try {
    const rows = await fetchAllApiRows<CustomerServiceRequest>(
      query => $api<CollectionResponse>('/my/service-requests', {
        query,
      }),
      100,
    )

    if (version !== requestVersion) return

    requests.value = [...rows].sort((first, second) =>
      timestamp(second.created_at) - timestamp(first.created_at)
      || second.id - first.id,
    )
  } catch {
    if (version !== requestVersion) return

    error.value =
      'تعذر تحميل طلبات الخدمات. تحقق من الاتصال وأعد المحاولة.'
  } finally {
    if (version === requestVersion) {
      loading.value = false
    }
  }
}

onMounted(loadRequests)

onBeforeUnmount(() => {
  requestVersion++
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
        طلبات الخدمات الخاصة بي
      </span>
    </nav>

    <header
      class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
    >
      <div>
        <h1 class="text-2xl font-bold text-solar-text-heading">
          طلبات الخدمات الخاصة بي
        </h1>

        <p class="mt-2 text-sm leading-7 text-solar-text-muted">
          تابع طلباتك وافتح تفاصيلها لمراجعة عروض المهندسين.
        </p>
      </div>

      <NuxtLink
        to="/customer/services/new"
        class="inline-flex shrink-0 items-center justify-center rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark"
      >
        طلب خدمة جديدة
      </NuxtLink>
    </header>

    <section
      v-if="loading"
      role="status"
      aria-live="polite"
      class="rounded-xl border border-solar-border-card bg-white p-10 text-center text-sm text-solar-text-muted"
    >
      جارٍ تحميل طلبات الخدمات…
    </section>

    <section
      v-else-if="error"
      role="alert"
      class="rounded-xl border border-red-200 bg-red-50 p-6"
    >
      <p class="text-sm leading-7 text-red-800">
        {{ error }}
      </p>

      <button
        type="button"
        class="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-bold text-red-800"
        @click="loadRequests"
      >
        إعادة المحاولة
      </button>
    </section>

    <template v-else>
      <section
        class="grid gap-4 rounded-xl border border-solar-border-card bg-white p-5 md:grid-cols-2"
        aria-label="البحث في طلبات الخدمات"
      >
        <label class="flex flex-col gap-2">
          <span class="text-sm font-bold text-solar-text-heading">
            البحث
          </span>

          <input
            v-model="search"
            type="search"
            placeholder="رقم الطلب أو الخدمة أو وصف المشروع"
            class="w-full rounded-lg border border-solar-border-card bg-white px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >
        </label>

        <label class="flex flex-col gap-2">
          <span class="text-sm font-bold text-solar-text-heading">
            حالة الطلب
          </span>

          <select
            v-model="selectedStatus"
            class="w-full rounded-lg border border-solar-border-card bg-white px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >
            <option value="all">
              جميع الحالات
            </option>

            <option
              v-for="option in statusOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </label>
      </section>

      <div
        class="flex flex-wrap items-center justify-between gap-3 text-sm text-solar-text-muted"
      >
        <p role="status" aria-live="polite">
          عدد النتائج: {{ filteredRequests.length }}
        </p>

        <button
          type="button"
          class="rounded-lg border border-solar-border-card bg-white px-4 py-2 font-bold text-solar-text-heading"
          @click="loadRequests"
        >
          تحديث الطلبات
        </button>
      </div>

      <section
        v-if="!requests.length"
        class="rounded-xl border border-dashed border-solar-border-card bg-white px-5 py-14 text-center"
      >
        <h2 class="text-lg font-bold text-solar-text-heading">
          لم تنشر أي طلب خدمة بعد
        </h2>

        <p class="mt-3 text-sm leading-7 text-solar-text-muted">
          بعد نشر طلبك سيظهر هنا لتتمكن من متابعة حالته.
        </p>

        <NuxtLink
          to="/customer/services/new"
          class="mt-5 inline-flex rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark"
        >
          إنشاء أول طلب
        </NuxtLink>
      </section>

      <section
        v-else-if="!filteredRequests.length"
        class="rounded-xl border border-dashed border-solar-border-card bg-white px-5 py-14 text-center"
      >
        <h2 class="text-lg font-bold text-solar-text-heading">
          لا توجد طلبات تطابق البحث
        </h2>

        <button
          type="button"
          class="mt-5 rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark"
          @click="resetFilters"
        >
          إظهار جميع الطلبات
        </button>
      </section>

      <div v-else class="grid gap-5 lg:grid-cols-2">
        <article
          v-for="request in displayedRequests"
          :key="request.id"
          class="flex min-w-0 flex-col rounded-xl border border-solar-border-card bg-white p-5"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-xs text-solar-text-muted">
                الطلب #{{ request.id }}
              </p>

              <h2 class="mt-2 text-lg font-bold text-solar-text-heading">
                {{ request.service_type?.name || 'طلب خدمة هندسية' }}
              </h2>
            </div>

            <span
              class="rounded-full px-3 py-1 text-xs font-bold"
              :class="statusClasses(request.status)"
            >
              {{ statusLabel(request.status) }}
            </span>
          </div>

          <p
            class="mt-4 whitespace-pre-line break-words text-sm leading-7 text-solar-text-body"
          >
            {{ request.description || 'لا يوجد وصف للطلب.' }}
          </p>

          <dl
            class="mt-5 grid gap-4 border-t border-solar-border-card pt-4 sm:grid-cols-2"
          >
            <div>
              <dt class="text-xs text-solar-text-muted">
                المحافظة
              </dt>

              <dd class="mt-1 text-sm font-bold text-solar-text-heading">
                {{ governorateName(request) }}
              </dd>
            </div>

            <div>
              <dt class="text-xs text-solar-text-muted">
                القدرة التقديرية
              </dt>

              <dd class="mt-1 text-sm font-bold text-solar-text-heading">
                {{ capacityLabel(request) }}
              </dd>
            </div>

            <div class="sm:col-span-2">
              <dt class="text-xs text-solar-text-muted">
                الموقع
              </dt>

              <dd class="mt-1 break-words text-sm text-solar-text-heading">
                {{ request.location_details || 'غير محدد' }}
              </dd>
            </div>

            <div class="sm:col-span-2">
              <dt class="text-xs text-solar-text-muted">
                تاريخ النشر
              </dt>

              <dd class="mt-1 text-sm text-solar-text-heading">
                {{ formatDate(request.created_at) }}
              </dd>
            </div>
          </dl>

          <div class="mt-auto pt-5">
            <NuxtLink
              :to="`/customer/services/${request.id}`"
              :aria-label="`عرض تفاصيل الطلب رقم ${request.id} وعروض المهندسين`"
              class="inline-flex w-full items-center justify-center rounded-lg bg-solar-navy px-5 py-3 text-sm font-bold text-white focus-visible:ring-2 focus-visible:ring-solar-yellow"
            >
              التفاصيل والعروض
            </NuxtLink>
          </div>
        </article>
      </div>

      <nav
        v-if="totalPages > 1"
        class="flex flex-wrap items-center justify-center gap-4"
        aria-label="صفحات طلبات الخدمات"
      >
        <button
          type="button"
          :disabled="currentPage === 1"
          class="rounded-lg border border-solar-border-card bg-white px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
          @click="currentPage--"
        >
          السابق
        </button>

        <span class="text-sm text-solar-text-muted">
          الصفحة {{ currentPage }} من {{ totalPages }}
        </span>

        <button
          type="button"
          :disabled="currentPage === totalPages"
          class="rounded-lg border border-solar-border-card bg-white px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
          @click="currentPage++"
        >
          التالي
        </button>
      </nav>
    </template>
  </div>
</template>