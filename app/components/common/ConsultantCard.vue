<script setup lang="ts">
import { BadgeCheck, Briefcase, MapPin, Star } from 'lucide-vue-next'

withDefaults(defineProps<{
  image: string
  name: string
  specialty: string
  rating: number
  experience: number
  bio?: string
  location?: string
  projects?: number
}>(), {
  bio: undefined,
  location: undefined,
  projects: undefined,
})
</script>

<template>
  <article class="flex flex-col gap-5 rounded-2xl border border-surface-line bg-white p-6 shadow-card">
    <div class="flex items-start gap-4">
      <div class="relative shrink-0">
        <img
          :src="image"
          :alt="`صورة ${name}`"
          class="size-16 rounded-full object-cover ring-4 ring-brand-50"
          width="64"
          height="64"
          loading="lazy"
        >
        <span class="absolute -bottom-0.5 -end-0.5 flex size-5 items-center justify-center rounded-full bg-white">
          <BadgeCheck class="size-5 text-emerald-500" aria-hidden="true" />
          <span class="sr-only">موثّق</span>
        </span>
      </div>
      <div class="flex min-w-0 flex-col gap-1">
        <h3 class="text-base font-bold text-ink">{{ name }}</h3>
        <p class="text-sm text-brand-600">{{ specialty }}</p>
        <p v-if="location" class="flex items-center gap-1 text-xs text-ink-500">
          <MapPin class="size-3.5" aria-hidden="true" />
          {{ location }}
        </p>
      </div>
    </div>

    <p v-if="bio" class="line-clamp-2 text-sm leading-relaxed text-ink-500">{{ bio }}</p>

    <dl class="grid grid-cols-3 divide-x divide-x-reverse divide-surface-line rounded-xl bg-surface py-3 text-center">
      <div class="flex flex-col gap-0.5">
        <dt class="text-[11px] text-ink-500">التقييم</dt>
        <dd class="flex items-center justify-center gap-1 text-sm font-bold text-ink">
          <Star class="size-3.5 fill-brand-400 text-brand-400" aria-hidden="true" />
          {{ rating.toFixed(1) }}
        </dd>
      </div>
      <div class="flex flex-col gap-0.5">
        <dt class="text-[11px] text-ink-500">الخبرة</dt>
        <dd class="text-sm font-bold text-ink">{{ experience }} سنوات</dd>
      </div>
      <div class="flex flex-col gap-0.5">
        <dt class="text-[11px] text-ink-500">المشاريع</dt>
        <dd class="flex items-center justify-center gap-1 text-sm font-bold text-ink">
          <Briefcase class="size-3.5 text-ink-400" aria-hidden="true" />
          {{ projects ?? '—' }}
        </dd>
      </div>
    </dl>

    <div class="mt-auto flex flex-col gap-2">
      <button type="button" class="btn-primary w-full">طلب استشارة</button>
      <a href="#" class="text-center text-xs font-medium text-ink-500 hover:text-ink">عرض الملف الشخصي</a>
    </div>
  </article>
</template>
