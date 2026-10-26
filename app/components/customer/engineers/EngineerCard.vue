<script setup lang="ts">
import {
  BadgeCheck,
  ChevronLeft,
  MessageSquareText,
  Star,
} from 'lucide-vue-next'

import type { Engineer } from '../../../../types/engineer'
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  engineer: Engineer
  profileTo: RouteLocationRaw
}>()

defineEmits<{
  consultation: [engineer: Engineer]
}>()

const fallbackImage =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 160"
    >
      <rect width="160" height="160" fill="#eef2f7"/>
      <circle cx="80" cy="58" r="26" fill="#8494a7"/>
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
  <article
    class="solar-card flex min-w-0 flex-col p-4 transition hover:-translate-y-0.5 hover:shadow-md"
  >
    <div class="relative overflow-hidden rounded-xl bg-solar-bg-subtle">
      <img
        :src="engineer.image || fallbackImage"
        :alt="`صورة ${engineer.name}`"
        width="420"
        height="360"
        loading="lazy"
        class="aspect-[1.08/1] w-full object-cover"
        @error="handleImageError"
      />

      <span
        v-if="engineer.isVerified"
        class="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-2 text-[11px] font-bold text-white shadow"
      >
        <BadgeCheck class="size-4" aria-hidden="true" />
        معتمد
      </span>
    </div>

    <div class="flex flex-1 flex-col pt-4 text-center">
      <h2 class="text-base font-extrabold text-solar-text-heading">
        {{ engineer.name }}
      </h2>

      <p class="mt-1 min-h-10 text-xs font-bold leading-5 text-amber-700">
        {{ engineer.specialty || 'التخصص غير محدد' }}
      </p>

      <p class="mt-2 text-xs text-solar-text-muted">
        {{ engineer.city || 'الموقع غير محدد' }}
      </p>

      <p
        class="mt-2 line-clamp-3 min-h-[4.5rem] text-xs leading-6 text-solar-text-muted"
      >
        {{ engineer.bio || 'لم تُضف نبذة مهنية لهذا المهندس.' }}
      </p>

      <dl
        class="mt-4 grid grid-cols-2 rounded-lg bg-solar-bg-subtle px-3 py-3 text-xs"
      >
        <div class="border-l border-solar-border-card">
          <dt class="text-solar-text-muted">
            المشاريع المنجزة
          </dt>

          <dd class="mt-1 font-bold text-solar-text-heading">
            {{
              engineer.completedProjects === null
                ? 'غير متاح'
                : engineer.completedProjects
            }}
          </dd>
        </div>

        <div>
          <dt class="text-solar-text-muted">
            التقييم
          </dt>

          <dd
            class="mt-1 flex items-center justify-center gap-1 font-bold text-solar-text-heading"
          >
            <Star
              v-if="engineer.rating !== null"
              class="size-3.5 fill-solar-yellow text-solar-yellow"
              aria-hidden="true"
            />

            {{ ratingLabel }}
          </dd>
        </div>
      </dl>

      <button
        type="button"
        class="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-solar-yellow text-sm font-bold text-solar-navy-dark hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-navy"
        @click="$emit('consultation', engineer)"
      >
        <MessageSquareText class="size-4" aria-hidden="true" />
        طلب استشارة
      </button>

      <NuxtLink
        :to="profileTo"
        class="mt-3 inline-flex items-center justify-center gap-1 rounded text-xs font-semibold text-solar-text-body hover:text-solar-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow"
      >
        عرض الملف الشخصي
        <ChevronLeft class="size-4" aria-hidden="true" />
      </NuxtLink>
    </div>
  </article>
</template>