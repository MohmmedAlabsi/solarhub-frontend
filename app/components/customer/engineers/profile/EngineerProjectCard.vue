<script setup lang="ts">
import {
  BriefcaseBusiness,
  CalendarDays,
  ImageOff,
  MapPin,
} from 'lucide-vue-next'

import type {
  EngineerProject,
} from '../../../../../types/engineer'

const props = defineProps<{
  project: EngineerProject
}>()

const imageFailed = ref(false)

const hasImage = computed(() => {
  return Boolean(props.project.image) && !imageFailed.value
})

const categoryLabels: Record<
  NonNullable<EngineerProject['category']>,
  string
> = {
  commercial: 'تجاري',
  agricultural: 'زراعي',
  storage: 'تخزين الطاقة',
  industrial: 'صناعي',
}

const categoryLabel = computed(() => {
  const category = props.project.category

  return category ? categoryLabels[category] : ''
})

const completionYearLabel = computed(() => {
  const year = props.project.completionYear

  if (year === null || !Number.isInteger(year)) {
    return 'سنة الإنجاز غير متاحة'
  }

  return `سنة الإنجاز: ${year}`
})

watch(
  () => props.project.image,
  () => {
    imageFailed.value = false
  },
)
</script>

<template>
  <article
    class="solar-card overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-md sm:p-0"
  >
    <!-- صورة المشروع -->
    <div
      class="relative aspect-[2/1] overflow-hidden bg-solar-bg-subtle"
    >
      <img
        v-if="hasImage"
        :src="project.image"
        :alt="`صورة مشروع ${project.title}`"
        width="720"
        height="360"
        loading="lazy"
        class="h-full w-full object-cover"
        @error="imageFailed = true"
      />

      <div
        v-else
        class="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center text-solar-text-muted"
      >
        <ImageOff class="size-10" aria-hidden="true" />

        <p class="text-xs">
          لا تتوفر صورة للمشروع
        </p>
      </div>

      <!-- نوع الخدمة -->
      <span
        class="absolute right-3 top-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-full bg-solar-navy px-3 py-2 text-[10px] font-bold text-white shadow"
      >
        <BriefcaseBusiness
          class="size-3.5 shrink-0"
          aria-hidden="true"
        />

        {{ project.statusLabel || 'عمل سابق' }}
      </span>

      <!-- السعة كما وردت في البيانات -->
      <span
        class="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] rounded-lg bg-white px-3 py-2 text-[10px] font-extrabold text-solar-navy shadow"
      >
        {{ project.capacityLabel || 'السعة غير محددة' }}
      </span>
    </div>

    <!-- تفاصيل المشروع -->
    <div class="p-5">
      <div class="flex flex-wrap items-center gap-2">
        <h3
          class="text-base font-extrabold text-solar-text-heading"
        >
          {{ project.title }}
        </h3>

        <span
          v-if="categoryLabel"
          class="rounded-full bg-solar-bg-subtle px-2.5 py-1 text-[10px] text-solar-text-muted"
        >
          {{ categoryLabel }}
        </span>
      </div>

      <p
        class="mt-2 min-h-12 whitespace-pre-line break-words text-xs leading-6 text-solar-text-body"
      >
        {{ project.description || 'لم يُضف وصف لهذا المشروع.' }}
      </p>

      <div
        class="mt-4 flex flex-col gap-3 border-t border-solar-border-card pt-3 text-[11px] text-solar-text-muted sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
      >
        <span class="inline-flex items-start gap-1">
          <MapPin
            class="size-3.5 shrink-0"
            aria-hidden="true"
          />

          {{ project.location || 'الموقع غير محدد' }}
        </span>

        <span class="inline-flex items-center gap-1">
          <CalendarDays
            class="size-3.5 shrink-0"
            aria-hidden="true"
          />

          {{ completionYearLabel }}
        </span>
      </div>
    </div>
  </article>
</template>