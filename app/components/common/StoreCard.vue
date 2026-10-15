<script setup lang="ts">
import { BadgeCheck, MapPin, Star } from 'lucide-vue-next'

withDefaults(defineProps<{
  logo: string
  name: string
  description: string
  rating: number
  badge?: string
  location?: string
  productsCount?: number
  tags?: string[]
}>(), {
  badge: 'وكيل معتمد',
  location: undefined,
  productsCount: undefined,
  tags: () => [],
})
</script>

<template>
  <article class="flex flex-col gap-5 rounded-2xl border border-surface-line bg-white p-6 shadow-card">
    <div class="flex items-start justify-between gap-3">
      <span
        class="flex size-14 shrink-0 items-center justify-center rounded-xl bg-ink text-lg font-bold text-brand-400"
        aria-hidden="true"
      >
        {{ logo }}
      </span>
      <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
        <BadgeCheck class="size-3.5" aria-hidden="true" />
        {{ badge }}
      </span>
    </div>

    <div class="flex flex-col gap-2">
      <h3 class="text-base font-bold text-ink">{{ name }}</h3>
      <p class="line-clamp-2 text-sm leading-relaxed text-ink-500">{{ description }}</p>
    </div>

    <dl class="flex items-center gap-5 text-sm">
      <div class="flex items-center gap-1">
        <dt class="sr-only">التقييم</dt>
        <Star class="size-4 fill-brand-400 text-brand-400" aria-hidden="true" />
        <dd class="font-bold text-ink">{{ rating.toFixed(1) }}</dd>
      </div>
      <div v-if="productsCount" class="flex items-center gap-1">
        <dd class="font-bold text-ink">{{ productsCount }}</dd>
        <dt class="text-ink-500">منتج</dt>
      </div>
      <div v-if="location" class="flex items-center gap-1 text-ink-500">
        <dt class="sr-only">الموقع</dt>
        <MapPin class="size-4" aria-hidden="true" />
        <dd>{{ location }}</dd>
      </div>
    </dl>

    <ul v-if="tags.length" class="flex flex-wrap gap-2">
      <li v-for="tag in tags" :key="tag" class="rounded-md bg-surface px-2 py-1 text-[11px] font-medium text-ink-700" dir="auto">
        {{ tag }}
      </li>
    </ul>

    <a href="#" class="btn-primary mt-auto w-full">زيارة المتجر والمنتجات</a>
  </article>
</template>
