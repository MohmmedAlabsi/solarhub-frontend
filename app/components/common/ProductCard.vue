<script setup lang="ts">
import { Star, Store } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  image: string
  title: string
  specs: string
  price: number
  old_price?: number
  rating: number
  category?: string
  brand?: string
  store?: string
}>(), {
  old_price: undefined,
  category: undefined,
  brand: undefined,
  store: undefined,
})

const formatPrice = (value: number) => new Intl.NumberFormat('ar-SA').format(value)

const discount = computed(() =>
  props.old_price && props.old_price > props.price
    ? Math.round(((props.old_price - props.price) / props.old_price) * 100)
    : 0,
)
</script>

<template>
  <article class="group flex flex-col overflow-hidden rounded-2xl border border-surface-line bg-white shadow-card transition-shadow hover:shadow-lg">
    <div class="relative bg-surface/60 p-4">
      <span
        v-if="brand"
        class="absolute start-3 top-3 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-ink-700 shadow-sm"
        dir="ltr"
      >
        {{ brand }}
      </span>
      <span
        v-if="discount"
        class="absolute end-3 top-3 rounded-md bg-red-500 px-2 py-1 text-[11px] font-semibold text-white"
      >
        خصم {{ discount }}%
      </span>
      <img
        :src="image"
        :alt="title"
        class="mx-auto aspect-square w-full max-w-[220px] object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
        width="220"
        height="220"
        loading="lazy"
      >
    </div>

    <div class="flex flex-1 flex-col gap-3 p-4">
      <div class="flex items-center justify-between gap-2">
        <span v-if="category" class="text-xs font-medium text-brand-600">{{ category }}</span>
        <span class="flex items-center gap-1 text-xs font-semibold text-ink-700">
          <Star class="size-3.5 fill-brand-400 text-brand-400" aria-hidden="true" />
          {{ rating.toFixed(1) }}
          <span class="sr-only">من 5</span>
        </span>
      </div>

      <h3 class="line-clamp-2 text-sm font-bold leading-relaxed text-ink">{{ title }}</h3>
      <p class="line-clamp-1 text-xs text-ink-500">{{ specs }}</p>

      <p v-if="store" class="flex items-center gap-1.5 text-xs text-ink-500">
        <Store class="size-3.5" aria-hidden="true" />
        {{ store }}
      </p>

      <div class="mt-auto flex items-baseline gap-2 pt-1">
        <span class="text-lg font-bold text-ink">{{ formatPrice(price) }} <span class="text-xs font-medium">ر.س</span></span>
        <span v-if="old_price" class="text-xs text-ink-400 line-through">{{ formatPrice(old_price) }}</span>
      </div>

      <div class="flex flex-col gap-2">
        <button type="button" class="btn-primary w-full py-2">طلب سعر</button>
        <NuxtLink to="/products" class="text-center text-xs font-medium text-ink-500 hover:text-ink">عرض تفاصيل المنتج</NuxtLink>
      </div>
    </div>
  </article>
</template>
