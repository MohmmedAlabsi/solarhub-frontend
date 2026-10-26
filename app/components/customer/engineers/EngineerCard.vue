<script setup lang="ts">
import { BadgeCheck, ChevronLeft, MessageSquareText, Star } from 'lucide-vue-next'
import type { Engineer } from '../../../../types/engineer'
import type { RouteLocationRaw } from 'vue-router'

defineProps<{ engineer: Engineer; profileTo: RouteLocationRaw }>()
defineEmits<{ consultation: [engineer: Engineer] }>()
</script>

<template>
  <article class="flex min-w-0 flex-col solar-card p-4 transition hover:-translate-y-0.5 hover:shadow-md">
    <div class="relative overflow-hidden rounded-xl bg-solar-bg-subtle">
      <img :src="engineer.image" :alt="`صورة ${engineer.name}`" width="420" height="360" loading="lazy" class="aspect-[1.08/1] w-full object-cover" />
      <span v-if="engineer.isVerified" class="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-2 text-[11px] font-bold text-white shadow"><BadgeCheck class="size-4" aria-hidden="true" /> معتمد</span>
    </div>
    <div class="flex flex-1 flex-col pt-4 text-center">
      <h2 class="text-base font-extrabold text-solar-text-heading">{{ engineer.name }}</h2>
      <p class="mt-1 min-h-10 text-xs font-bold leading-5 text-amber-700">{{ engineer.specialty }}</p>
      <p class="mt-2 line-clamp-3 min-h-[4.5rem] text-xs leading-6 text-solar-text-muted">{{ engineer.bio }}</p>
      <dl class="mt-4 grid grid-cols-2 rounded-lg bg-solar-bg-subtle px-3 py-3 text-xs">
        <div class="border-l border-solar-border-card"><dt class="sr-only">المشاريع المنجزة</dt><dd><strong class="text-solar-text-heading">{{ engineer.completedProjects }}</strong> مشروع منجز</dd></div>
        <div><dt class="sr-only">التقييم</dt><dd class="flex items-center justify-center gap-1"><Star class="size-3.5 fill-solar-yellow text-solar-yellow" aria-hidden="true" /><strong class="text-solar-text-heading">{{ engineer.rating }}</strong> تقييم</dd></div>
      </dl>
      <button type="button" class="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-solar-yellow text-sm font-bold text-solar-navy-dark hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-navy" @click="$emit('consultation', engineer)"><MessageSquareText class="size-4" aria-hidden="true" /> طلب استشارة</button>
      <NuxtLink :to="profileTo" class="mt-3 inline-flex items-center justify-center gap-1 rounded text-xs font-semibold text-solar-text-body hover:text-solar-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow">عرض الملف الشخصي <ChevronLeft class="size-4" aria-hidden="true" /></NuxtLink>
    </div>
  </article>
</template>
