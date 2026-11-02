<script setup lang="ts">
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock,
  FileText,
  Filter,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Tag,
  Wrench,
  Zap,
} from 'lucide-vue-next'
import {
  useCustomerServices,
  requestStatusLabels,
  type ApiCustomerServiceRequest,
} from '~~/app/composables/useCustomerServices'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'طلبات الخدمات الهندسية | SolarHub',
  description: 'إدارة ومتابعة طلبات الخدمات الهندسية وعروض المهندسين المعتمدين في SolarHub.',
})

const {
  myRequests,
  isLoading,
  error,
  fetchMyRequests,
} = useCustomerServices()

const selectedStatus = ref<string>('all')

const statusFilters = [
  { value: 'all', label: 'جميع الطلبات' },
  { value: 'open_for_bids', label: 'بانتظار العروض' },
  { value: 'awarded', label: 'تم قبول عرض' },
  { value: 'in_progress', label: 'قيد التنفيذ' },
  { value: 'completed', label: 'مكتملة' },
  { value: 'cancelled', label: 'ملغية' },
]

const filteredRequests = computed(() => {
  if (selectedStatus.value === 'all') {
    return myRequests.value
  }
  return myRequests.value.filter(r => r.status === selectedStatus.value)
})

function getStatusBadge(status: string) {
  return requestStatusLabels[status] || { label: status, class: 'bg-gray-100 text-gray-700 border-gray-200' }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('ar-YE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

onMounted(() => {
  fetchMyRequests()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/customer/dashboard" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading">طلبات الخدمات الهندسية</span>
    </nav>

    <!-- Header Section -->
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="text-2xl font-black text-solar-text-heading">طلبات الخدمات الهندسية</h1>
        <p class="mt-1 text-xs text-solar-text-muted">
          متابعة مشاريعك، مراجعة عروض المهندسين المعتمدين واختيار العرض الأنسب لاحتياجاتك
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="fetchMyRequests()"
          :disabled="isLoading"
          class="flex size-10 items-center justify-center rounded-xl border border-solar-border-card bg-white text-solar-text-body hover:bg-solar-bg-subtle transition-all cursor-pointer disabled:opacity-50"
          title="تحديث البيانات"
        >
          <RefreshCw class="size-4" :class="{ 'animate-spin': isLoading }" />
        </button>

        <NuxtLink
          to="/customer/services/new"
          class="btn-primary gap-2 h-10 px-5 text-xs font-bold shadow-sm"
        >
          <Plus class="size-4 stroke-[2.5]" />
          <span>طلب خدمة هندسية جديدة</span>
        </NuxtLink>
      </div>
    </header>

    <!-- Status Filters Bar -->
    <div class="flex flex-wrap items-center gap-2 border-b border-solar-border-card pb-4">
      <button
        v-for="filter in statusFilters"
        :key="filter.value"
        type="button"
        @click="selectedStatus = filter.value"
        class="rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer"
        :class="selectedStatus === filter.value
          ? 'bg-solar-navy-dark text-white shadow-sm font-bold'
          : 'bg-white border border-solar-border-card text-solar-text-muted hover:text-solar-text-heading hover:bg-solar-bg-subtle'"
      >
        <span>{{ filter.label }}</span>
        <span
          v-if="filter.value === 'all'"
          class="mr-1.5 rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]"
          :class="selectedStatus === 'all' ? 'text-white' : 'text-solar-text-muted bg-solar-bg-subtle'"
        >
          {{ myRequests.length }}
        </span>
      </button>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-xs text-red-700 border border-red-200">
      <AlertCircle class="size-5 shrink-0" />
      <span>{{ error }}</span>
      <button type="button" @click="fetchMyRequests()" class="mr-auto font-bold underline">إعادة المحاولة</button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center rounded-2xl border border-solar-border-card bg-white p-12 text-center shadow-sm">
      <Loader2 class="size-8 animate-spin text-amber-500 mb-3" />
      <p class="text-xs font-semibold text-solar-text-muted">جارٍ تحميل طلبات الخدمات الهندسية...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredRequests.length === 0"
      class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-solar-border-card bg-white p-12 text-center"
    >
      <div class="flex size-16 items-center justify-center rounded-full bg-solar-bg-subtle text-solar-text-muted mb-4">
        <Wrench class="size-8 stroke-[1.5]" />
      </div>
      <h2 class="text-base font-bold text-solar-text-heading mb-1">لا توجد طلبات خدمات هندسية حالياً</h2>
      <p class="max-w-md text-xs text-solar-text-muted mb-6">
        {{ selectedStatus === 'all'
          ? 'لم تقم بإنشاء أي طلب خدمة هندسية حتى الآن. انشر طلبك لتلقي عروض الأسعار والدراسات من نخبة المهندسين المعتمدين.'
          : 'لا توجد طلبات مطابقة للفلتر المحدد.'
        }}
      </p>
      <NuxtLink
        v-if="selectedStatus === 'all'"
        to="/customer/services/new"
        class="btn-primary gap-2 text-xs px-6 py-2.5"
      >
        <Plus class="size-4" />
        <span>طلب خدمة هندسية جديدة</span>
      </NuxtLink>
      <button
        v-else
        type="button"
        @click="selectedStatus = 'all'"
        class="btn-outline text-xs px-5 py-2 font-bold cursor-pointer"
      >
        عرض جميع الطلبات
      </button>
    </div>

    <!-- Requests Cards Grid -->
    <div v-else class="grid gap-4 md:grid-cols-2">
      <article
        v-for="req in filteredRequests"
        :key="req.id"
        class="group relative flex flex-col justify-between rounded-2xl border border-solar-border-card bg-white p-5 shadow-sm transition-all hover:border-amber-300 hover:shadow-md"
      >
        <div class="flex flex-col gap-3">
          <!-- Card Top: ID and Status -->
          <div class="flex items-center justify-between border-b border-solar-border-card/60 pb-3">
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs font-black text-solar-navy-dark">#SR-{{ req.id }}</span>
              <span class="text-solar-border-card">|</span>
              <span class="flex items-center gap-1 text-[11px] text-solar-text-muted">
                <Calendar class="size-3 text-solar-text-muted" />
                {{ formatDate(req.created_at) }}
              </span>
            </div>

            <!-- Status Badge -->
            <span
              class="rounded-full border px-2.5 py-0.5 text-[11px] font-bold"
              :class="getStatusBadge(req.status).class"
            >
              {{ getStatusBadge(req.status).label }}
            </span>
          </div>

          <!-- Title and Description -->
          <div>
            <h2 class="text-sm font-bold text-solar-text-heading group-hover:text-amber-600 transition-colors line-clamp-1">
              {{ req.service_type?.name || 'خدمة هندسية' }}
            </h2>
            <p class="mt-1 text-xs text-solar-text-muted line-clamp-2 leading-relaxed">
              {{ req.description }}
            </p>
          </div>

          <!-- Meta Badges: Governorate, Capacity, Offers -->
          <div class="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span v-if="req.governorate?.name_ar" class="inline-flex items-center gap-1 rounded-lg bg-solar-bg-subtle px-2.5 py-1 text-solar-text-body font-medium">
              <MapPin class="size-3 text-solar-text-muted" />
              {{ req.governorate.name_ar }}
            </span>

            <span v-if="req.system_capacity_estimate" class="inline-flex items-center gap-1 rounded-lg bg-solar-bg-subtle px-2.5 py-1 text-solar-text-body font-medium">
              <Zap class="size-3 text-amber-500" />
              {{ req.system_capacity_estimate }} kW تقريبي
            </span>

            <span
              v-if="req.offers"
              class="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-indigo-700 font-bold text-[11px]"
            >
              <Tag class="size-3" />
              {{ req.offers.length }} عروض مهندسين
            </span>
          </div>
        </div>

        <!-- Card Footer Actions -->
        <div class="mt-4 flex items-center justify-between border-t border-solar-border-card pt-3">
          <NuxtLink
            :to="`/customer/services/${req.id}`"
            class="flex items-center gap-1.5 text-xs font-bold text-solar-text-heading hover:text-amber-600 transition-colors"
          >
            <span>عرض التفاصيل والعروض</span>
            <ChevronLeft class="size-4" />
          </NuxtLink>

          <span class="text-[11px] text-solar-text-muted">
            {{ req.status === 'open_for_bids' ? 'مفتوح لتلقي العروض' : 'طلب قيد المتابعة' }}
          </span>
        </div>
      </article>
    </div>
  </div>
</template>
