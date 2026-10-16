<script setup lang="ts">
import { Award, BadgeCheck, MessageSquareText, Star } from 'lucide-vue-next'
import type { EngineerProfile } from '../../../../../types/engineer'

defineProps<{ engineer: EngineerProfile }>()
</script>

<template>
  <section class="flex min-w-0 flex-col gap-5" aria-labelledby="reviews-heading">
    <div class="flex flex-col gap-5 rounded-2xl border border-solar-border-card bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex min-w-0 items-center gap-4">
        <div class="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-solar-yellow-tint text-solar-status-warning-text" :aria-label="`${engineer.rating} من 5`">
          <strong class="text-2xl">{{ engineer.verifiedReviews ? engineer.rating.toFixed(1) : '—' }}</strong>
          <Star class="size-3 fill-current" aria-hidden="true" />
        </div>
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h2 id="reviews-heading" class="font-extrabold text-solar-text-heading">التقييم العام للمهندس</h2>
            <span v-if="engineer.verifiedReviews" class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700"><BadgeCheck class="size-3.5" aria-hidden="true" /> تقييمات موثقة 100%</span>
          </div>
          <p class="mt-2 text-xs leading-6 text-solar-text-muted">{{ engineer.verifiedReviews ? `مستندة إلى ${engineer.verifiedReviews} استشارة ومشروعاً منجزاً فعلياً عبر منصة سولار هب` : 'لم يتلقَّ هذا المهندس تقييمات بعد.' }}</p>
        </div>
      </div>
      <p v-if="engineer.verifiedReviews" class="flex items-center gap-2 rounded-xl bg-solar-bg-subtle px-4 py-3 text-[11px] leading-5 text-solar-text-body"><Award class="size-4 shrink-0 text-solar-status-warning-text" aria-hidden="true" /> جميع التقييمات صادرة من عملاء أتموا مرحلة التعاقد والتسليم</p>
    </div>

    <div v-if="engineer.reviews.comments.length" class="flex flex-col gap-4">
      <article v-for="(review, index) in engineer.reviews.comments" :key="review.id" class="min-w-0 rounded-2xl border border-solar-border-card bg-white p-6">
        <div class="flex flex-wrap items-center gap-3">
          <span class="flex size-10 shrink-0 items-center justify-center rounded-full font-bold text-solar-text-heading" :class="['bg-blue-50', 'bg-amber-100', 'bg-indigo-100'][index % 3]" aria-hidden="true">{{ review.author.replace(/^م\.\s*/, '').charAt(0) }}</span>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1"><h3 class="text-sm font-extrabold text-solar-text-heading">{{ review.author }}</h3><p class="text-[11px] text-solar-text-muted">({{ review.project }})</p></div>
            <div class="mt-1 flex text-solar-status-warning-text" :aria-label="`${review.rating} من 5 نجوم`"><Star v-for="star in 5" :key="star" class="size-3" :class="star <= review.rating ? 'fill-current' : 'text-slate-200'" aria-hidden="true" /></div>
          </div>
          <span class="text-[11px] text-solar-text-muted">{{ review.relativeDate }}</span>
        </div>
        <p class="mt-3 break-words text-xs leading-7 text-solar-text-body">{{ review.comment }}</p>
      </article>
    </div>
    <div v-else class="rounded-2xl border border-dashed border-solar-border-card bg-white px-5 py-14 text-center">
      <MessageSquareText class="mx-auto size-10 text-solar-text-muted" aria-hidden="true" />
      <h3 class="mt-4 text-lg font-bold text-solar-text-heading">لا توجد تقييمات بعد</h3>
      <p class="mt-2 text-sm text-solar-text-muted">ستظهر آراء العملاء هنا عند توفرها.</p>
    </div>
    <p class="text-[11px] text-solar-text-muted">بيانات تجريبية للعرض فقط.</p>
  </section>
</template>
