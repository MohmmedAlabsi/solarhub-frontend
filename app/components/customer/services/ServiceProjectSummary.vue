<script setup lang="ts">
import { computed } from 'vue'
import {
  CalendarDays,
  FileText,
  MapPin,
  SolarPanel,
  Wrench,
} from 'lucide-vue-next'
import type { CustomerServiceProject } from '../../../composables/useCustomerServiceProject'

const props = withDefaults(
  defineProps<{
    project: CustomerServiceProject
    offersCount?: number | null
  }>(),
  {
    offersCount: null,
  },
)

const serviceName = computed(() =>
  props.project.service_type?.name?.trim() || 'خدمة هندسية',
)

const governorateName = computed(() => {
  const governorate = props.project.governorate

  return governorate?.name_ar
    || governorate?.name
    || governorate?.name_en
    || 'غير محددة'
})

const locationLabel = computed(() =>
  props.project.location_details?.trim() || 'غير محدد',
)

const capacityLabel = computed(() => {
  const value = props.project.system_capacity_estimate

  if (
    value === null
    || value === undefined
    || String(value).trim() === ''
  ) {
    return 'غير محددة'
  }

  return `${value} كيلوواط`
})

const publishedLabel = computed(() => {
  const value = props.project.created_at

  if (!value) return 'غير متاح'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'غير متاح'
  }

  return new Intl.DateTimeFormat('ar', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
})

const statusLabel = computed(() => {
  switch (props.project.status) {
    case 'open_for_bids':
      return 'بانتظار عروض المهندسين'
    case 'awarded':
      return 'تم قبول عرض'
    case 'in_progress':
      return 'قيد التنفيذ'
    case 'completed':
      return 'مكتمل'
    case 'cancelled':
      return 'ملغى'
    default:
      return 'حالة غير معروفة'
  }
})

const statusClasses = computed(() => {
  switch (props.project.status) {
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
      return 'bg-slate-100 text-slate-700'
  }
})

const attachmentName = computed(() => {
  const path = props.project.attachment_file

  if (!path) return ''

  const cleanPath = path.split(/[?#]/)[0] || ''
  const segments = cleanPath.split(/[\\/]/).filter(Boolean)

  return segments.at(-1)?.slice(0, 200) || 'مرفق الطلب'
})
</script>

<template>
  <section
    class="solar-card min-w-0 p-5 sm:p-8"
    aria-labelledby="project-title"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <span
        class="rounded-lg bg-solar-status-info-bg px-3 py-2 text-xs font-bold text-solar-text-heading"
      >
        الطلب #{{ project.id }}
      </span>

      <span
        class="rounded-full px-3 py-2 text-xs font-bold"
        :class="statusClasses"
      >
        {{ statusLabel }}
      </span>
    </div>

    <h2
      id="project-title"
      class="mt-5 text-xl font-bold leading-relaxed text-solar-text-heading sm:text-2xl"
    >
      طلب {{ serviceName }}
    </h2>

    <div
      class="mt-3 flex flex-wrap items-center gap-4 text-xs text-solar-text-muted"
    >
      <p class="inline-flex items-center gap-2">
        <CalendarDays class="size-4 shrink-0" aria-hidden="true" />
        تاريخ النشر: {{ publishedLabel }}
      </p>

      <p v-if="offersCount !== null">
        عدد العروض: {{ offersCount }}
      </p>
    </div>

    <dl class="mt-6 grid gap-4 md:grid-cols-3">
      <div
        class="flex items-start gap-3 rounded-xl bg-solar-status-info-bg p-4"
      >
        <Wrench
          class="size-5 shrink-0 text-solar-navy"
          aria-hidden="true"
        />

        <div class="min-w-0">
          <dt class="text-xs text-solar-text-muted">
            نوع الخدمة
          </dt>

          <dd
            class="mt-2 break-words text-sm font-bold text-solar-text-heading"
          >
            {{ serviceName }}
          </dd>
        </div>
      </div>

      <div
        class="flex items-start gap-3 rounded-xl bg-solar-status-info-bg p-4"
      >
        <MapPin
          class="size-5 shrink-0 text-solar-navy"
          aria-hidden="true"
        />

        <div class="min-w-0">
          <dt class="text-xs text-solar-text-muted">
            المحافظة
          </dt>

          <dd
            class="mt-2 break-words text-sm font-bold text-solar-text-heading"
          >
            {{ governorateName }}
          </dd>
        </div>
      </div>

      <div
        class="flex items-start gap-3 rounded-xl bg-solar-status-info-bg p-4"
      >
        <SolarPanel
          class="size-5 shrink-0 text-amber-700"
          aria-hidden="true"
        />

        <div class="min-w-0">
          <dt class="text-xs text-solar-text-muted">
            القدرة التقديرية
          </dt>

          <dd
            class="mt-2 break-words text-sm font-bold text-solar-text-heading"
          >
            {{ capacityLabel }}
          </dd>
        </div>
      </div>
    </dl>

    <section class="mt-6 rounded-xl bg-solar-bg-page p-5">
      <h3
        class="flex items-center gap-2 text-sm font-bold text-solar-text-heading"
      >
        <MapPin class="size-4 shrink-0" aria-hidden="true" />
        موقع المشروع
      </h3>

      <p
        class="mt-3 whitespace-pre-line break-words text-sm leading-7 text-solar-text-body"
      >
        {{ locationLabel }}
      </p>
    </section>

    <section class="mt-5 rounded-xl bg-solar-bg-page p-5">
      <h3
        class="flex items-center gap-2 text-sm font-bold text-solar-text-heading"
      >
        <FileText class="size-4 shrink-0" aria-hidden="true" />
        تفاصيل واحتياج المشروع
      </h3>

      <p
        class="mt-3 whitespace-pre-line break-words text-sm leading-7 text-solar-text-body"
      >
        {{ project.description?.trim() || 'لا يوجد وصف للطلب.' }}
      </p>
    </section>

    <section class="mt-6 border-t border-solar-border-card pt-5">
      <h3 class="text-sm font-bold text-solar-text-heading">
        مرفق الطلب
      </h3>

      <template v-if="attachmentName">
        <p
          class="mt-3 flex items-start gap-2 text-sm text-solar-text-body"
        >
          <FileText
            class="size-4 shrink-0"
            aria-hidden="true"
          />

          <span class="break-all">{{ attachmentName }}</span>
        </p>

        <p class="mt-2 text-xs leading-6 text-solar-text-muted">
          المرفق محفوظ؛ التنزيل غير متاح حاليًا.
        </p>
      </template>

      <p v-else class="mt-3 text-sm text-solar-text-muted">
        لا توجد مرفقات لهذا الطلب.
      </p>
    </section>
  </section>
</template>