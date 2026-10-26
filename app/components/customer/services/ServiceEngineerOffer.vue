<script setup lang="ts">
import { BadgeCheck, Check, CircleCheck, FileText, Star } from 'lucide-vue-next'
import type { ServiceOfferWithEngineer } from '../../../../types/service-request'
import ServiceProjectFile from './ServiceProjectFile.vue'

const props = defineProps<{ offer: ServiceOfferWithEngineer; accepted: boolean; locked: boolean; confirming: boolean }>()
defineEmits<{ accept: []; cancel: []; confirm: [] }>()
const confirmButton = ref<HTMLButtonElement>()
watch(() => props.confirming, async value => { if (value) { await nextTick(); confirmButton.value?.focus() } })
</script>

<template>
  <article class="min-w-0 overflow-hidden solar-card p-0 sm:p-0" :aria-labelledby="`offer-${offer.id}`">
    <div v-if="accepted" class="flex flex-wrap items-center justify-between gap-2 bg-emerald-50 px-6 py-3 text-xs font-bold text-emerald-700"><span class="flex items-center gap-1"><BadgeCheck class="size-4" aria-hidden="true" />العرض الفائز / تم قبول العرض — تعميد تجريبي</span><span>أفضل تقييم فني وتوافق زمني</span></div>
    <div class="p-5 sm:p-8">
      <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex min-w-0 items-center gap-4">
          <NuxtLink :to="`/customer/engineers/${offer.engineer.id}`" class="relative shrink-0 rounded-full focus-visible:ring-2 focus-visible:ring-solar-yellow"><img :src="offer.engineer.image" :alt="`ملف ${offer.engineer.name}`" width="64" height="64" class="size-16 rounded-full object-cover" /><BadgeCheck class="absolute bottom-0 right-0 size-6 rounded-full bg-emerald-600 p-1 text-white" aria-hidden="true" /></NuxtLink>
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2"><h3 :id="`offer-${offer.id}`" class="text-lg font-extrabold text-solar-text-heading"><NuxtLink :to="`/customer/engineers/${offer.engineer.id}`" class="hover:underline focus-visible:ring-2 focus-visible:ring-solar-yellow">{{ offer.engineer.name }}</NuxtLink></h3><span v-if="offer.engineer.isVerified" class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 text-[10px] font-bold text-emerald-700">معتمد<Check class="size-3" aria-hidden="true" /></span></div>
            <p class="mt-1 text-xs leading-6 text-solar-text-muted">{{ offer.engineer.specialty }}</p>
            <p class="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-solar-text-muted"><span class="inline-flex items-center gap-1 font-bold text-solar-status-warning-text"><Star class="size-3 fill-current" aria-hidden="true" />{{ offer.engineer.rating.toFixed(1) }}</span><span>({{ offer.engineer.verifiedReviews }} تقييم)</span><span>·</span><span>خبرة {{ offer.engineer.experienceYears }} سنوات</span></p>
          </div>
        </div>
        <div class="flex shrink-0 items-center justify-around gap-5 rounded-xl bg-solar-status-info-bg/80 p-4 text-center text-xs text-solar-text-muted"><p>{{ accepted ? 'التكلفة الإجمالية' : 'التكلفة المقترحة' }}<strong class="mt-1 block font-mono text-2xl font-extrabold text-solar-text-heading">{{ offer.price.toLocaleString('en-US') }}<span class="mr-1 font-sans text-xs">ر.س</span></strong></p><div class="h-9 border-r border-indigo-100" /><p>مدة التنفيذ<strong class="mt-1 block text-base text-solar-text-heading">{{ offer.durationDays }} <span class="text-xs font-normal text-solar-text-muted">أيام عمل</span></strong></p></div>
      </div>
      <div class="mt-6 rounded-xl bg-solar-bg-page p-5"><h4 class="flex items-center gap-1 text-xs font-bold text-solar-text-heading"><FileText class="size-3.5" aria-hidden="true" />الملخص الفني للمقترح المقدم:</h4><p class="mt-2 text-sm leading-7 text-solar-text-muted">{{ offer.summary }}</p></div>
      <div class="mt-7 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <ServiceProjectFile v-if="offer.attachment" :attachment="offer.attachment" /><p v-else class="text-xs text-solar-text-muted">لا توجد مرفقات لهذا العرض.</p>
        <div class="flex shrink-0 flex-wrap gap-3"><NuxtLink :to="`/customer/engineers/${offer.engineer.id}`" class="rounded-lg bg-solar-status-info-bg px-4 py-3 text-xs font-bold text-solar-text-heading focus-visible:ring-2 focus-visible:ring-solar-yellow">عرض ملف المهندس</NuxtLink><button type="button" :disabled="accepted || locked || confirming" class="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-xs font-bold text-white focus-visible:ring-2 focus-visible:ring-solar-yellow disabled:cursor-default" :class="accepted ? 'bg-emerald-700' : 'bg-solar-navy disabled:opacity-50'" @click="$emit('accept')"><CircleCheck v-if="accepted" class="size-4" aria-hidden="true" />{{ accepted ? 'تم قبول العرض والتعميد' : 'قبول العرض' }}</button></div>
      </div>
      <div v-if="confirming" class="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4" role="group" :aria-label="`تأكيد قبول عرض ${offer.engineer.name}`" @keydown.esc="$emit('cancel')">
        <p class="text-sm leading-7 text-solar-text-heading">قبول عرض {{ offer.engineer.name }} بقيمة {{ offer.price.toLocaleString('en-US') }} ر.س يغلق المشروع أمام العروض الأخرى. هذا إجراء تجريبي داخل الصفحة فقط دون تعميد أو دفع فعلي.</p>
        <div class="mt-3 flex flex-wrap gap-3"><button ref="confirmButton" type="button" class="rounded-lg bg-solar-navy px-4 py-2 text-sm font-bold text-white focus-visible:ring-2 focus-visible:ring-solar-yellow" @click="$emit('confirm')">تأكيد القبول التجريبي</button><button type="button" class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-solar-yellow" @click="$emit('cancel')">تراجع</button></div>
      </div>
    </div>
  </article>
</template>
