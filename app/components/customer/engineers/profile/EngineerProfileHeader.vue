<script setup lang="ts">
import {
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  MapPin,
  MessageSquareText,
  ShieldCheck,
  Star,
} from 'lucide-vue-next'

import type { EngineerProfile } from '../../../../../types/engineer'

const props = defineProps<{
  engineer: EngineerProfile
}>()

defineEmits<{
  service: []
  message: []
}>()

const fallbackImage =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 160"
    >
      <rect
        width="160"
        height="160"
        rx="20"
        fill="#eef2f7"
      />

      <circle
        cx="80"
        cy="58"
        r="26"
        fill="#8494a7"
      />

      <path
        d="M28 146v-12a52 52 0 0 1 104 0v12"
        fill="#8494a7"
      />
    </svg>
  `)

const ratingLabel = computed(() => {
  const rating = props.engineer.rating

  if (rating === null || !Number.isFinite(rating)) {
    return 'غير متاح'
  }

  return rating.toFixed(1)
})

function handleImageError(event: Event) {
  const image = event.target as HTMLImageElement

  if (image.dataset.fallbackApplied === 'true') return

  image.dataset.fallbackApplied = 'true'
  image.src = fallbackImage
}
</script>

<template>
  <section
    class="solar-card p-5 sm:p-7"
    aria-labelledby="engineer-name"
  >
    <div
      class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
    >
      <!-- الصورة والمعلومات الأساسية -->
      <div
        class="flex min-w-0 flex-col items-center gap-5 text-center sm:flex-row sm:text-right"
      >
        <div class="relative shrink-0">
          <img
            :src="engineer.image || fallbackImage"
            :alt="`صورة ${engineer.name}`"
            width="112"
            height="112"
            class="size-28 rounded-2xl bg-solar-bg-subtle object-cover"
            @error="handleImageError"
          />
        </div>

        <div class="min-w-0">
          <div
            class="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-start"
          >
            <h1
              id="engineer-name"
              class="text-2xl font-black text-solar-text-heading md:text-3xl"
            >
              {{ engineer.name }}
            </h1>

            <span
              v-if="engineer.isVerified"
              class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-2 text-[11px] font-bold text-emerald-700"
            >
              <BadgeCheck class="size-4" aria-hidden="true" />
              مهندس معتمد لدى المنصة
            </span>
          </div>

          <p
            class="mt-3 text-sm leading-7 text-solar-text-body"
          >
            {{ engineer.specialty || 'التخصص غير محدد' }}
          </p>

          <p
            class="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs sm:justify-start"
          >
            <Star
              class="size-4 text-solar-yellow"
              :class="
                engineer.rating !== null
                  ? 'fill-solar-yellow'
                  : ''
              "
              aria-hidden="true"
            />

            <span class="font-bold text-solar-text-heading">
              التقييم: {{ ratingLabel }}
            </span>

            <span
              v-if="engineer.verifiedReviews > 0"
              class="text-solar-text-muted"
            >
              ({{ engineer.verifiedReviews }} تقييم)
            </span>
          </p>

          <div
            class="mt-4 flex flex-wrap justify-center gap-2 text-[11px] text-solar-text-body sm:justify-start"
          >
            <span
              class="inline-flex items-center gap-1 rounded-lg bg-solar-bg-subtle px-3 py-2"
            >
              <MapPin class="size-3.5" aria-hidden="true" />
              {{ engineer.city || 'الموقع غير محدد' }}
            </span>

            <span
              class="inline-flex items-center gap-1 rounded-lg bg-solar-bg-subtle px-3 py-2"
            >
              <ShieldCheck
                class="size-3.5"
                aria-hidden="true"
              />

              رقم الترخيص:
              {{ engineer.licenseNumber || 'غير متاح' }}
            </span>
          </div>
        </div>
      </div>

      <!-- إجراءات الملف -->
      <div
        class="flex shrink-0 flex-wrap items-center justify-center gap-3"
      >
        <button
          type="button"
          disabled
          title="المراسلة المباشرة غير متاحة حاليًا"
          aria-label="المراسلة المباشرة غير متاحة حاليًا"
          class="inline-flex size-11 cursor-not-allowed items-center justify-center rounded-xl bg-solar-bg-subtle text-solar-text-muted opacity-60"
        >
          <MessageSquareText
            class="size-5"
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-solar-navy px-6 text-sm font-bold text-white hover:bg-solar-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow"
          @click="$emit('service')"
        >
          <BriefcaseBusiness
            class="size-4"
            aria-hidden="true"
          />

          طلب خدمة هندسية
        </button>
      </div>
    </div>

    <!-- ملخص البيانات -->
    <div
      class="mt-7 grid gap-3 border-t border-solar-border-card pt-5 sm:grid-cols-2 xl:grid-cols-4"
    >
      <div
        class="flex items-center gap-3 rounded-xl bg-solar-bg-subtle p-4"
      >
        <BriefcaseBusiness
          class="size-6 shrink-0 text-solar-navy"
          aria-hidden="true"
        />

        <p class="text-xs text-solar-text-muted">
          <strong
            class="mb-1 block text-base text-solar-text-heading"
          >
            {{ engineer.experienceYears ?? 'غير متاح' }}
          </strong>

          سنوات الخبرة
        </p>
      </div>

      <div
        class="flex items-center gap-3 rounded-xl bg-solar-bg-subtle p-4"
      >
        <BadgeCheck
          class="size-6 shrink-0 text-emerald-600"
          aria-hidden="true"
        />

        <p class="text-xs text-solar-text-muted">
          <strong
            class="mb-1 block text-base text-solar-text-heading"
          >
            {{ engineer.completedProjects ?? 'غير متاح' }}
          </strong>

          المشاريع المنجزة
        </p>
      </div>

      <div
        class="flex items-center gap-3 rounded-xl bg-solar-bg-subtle p-4"
      >
        <Star
          class="size-6 shrink-0 text-solar-yellow"
          aria-hidden="true"
        />

        <p class="text-xs text-solar-text-muted">
          <strong
            class="mb-1 block text-base text-solar-text-heading"
          >
            {{ ratingLabel }}
          </strong>

          متوسط التقييم
        </p>
      </div>

      <div
        class="flex items-center gap-3 rounded-xl bg-solar-bg-subtle p-4"
      >
        <Clock3
          class="size-6 shrink-0 text-amber-600"
          aria-hidden="true"
        />

        <p class="text-xs text-solar-text-muted">
          <strong
            class="mb-1 block text-base text-solar-text-heading"
          >
            {{ engineer.responseTime || 'غير متاح' }}
          </strong>

          متوسط سرعة الرد
        </p>
      </div>
    </div>
  </section>
</template>