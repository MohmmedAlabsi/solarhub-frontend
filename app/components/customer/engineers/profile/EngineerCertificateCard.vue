<script setup lang="ts">
import { Award, BadgeCheck, Braces, Eye, ShieldCheck, Zap } from 'lucide-vue-next'
import type { EngineerCertificate } from '../../../../../types/engineer'

defineProps<{ certificate: EngineerCertificate }>()
</script>

<template>
  <article class="rounded-xl bg-solar-bg-subtle p-5">
    <div class="flex items-start gap-3">
      <span class="flex size-11 shrink-0 items-center justify-center rounded-xl" :class="certificate.icon === 'award' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'">
        <ShieldCheck v-if="certificate.icon === 'shield'" class="size-5" aria-hidden="true" />
        <Braces v-else-if="certificate.icon === 'code'" class="size-5" aria-hidden="true" />
        <Zap v-else-if="certificate.icon === 'power'" class="size-5" aria-hidden="true" />
        <Award v-else class="size-5" aria-hidden="true" />
      </span>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div><h3 class="text-sm font-extrabold text-solar-text-heading">{{ certificate.title }}</h3><p class="mt-1 text-xs leading-5 text-solar-text-body">{{ certificate.issuer }}</p></div>
          <span class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-2 text-[10px] font-bold text-emerald-700"><BadgeCheck class="size-3.5" aria-hidden="true" /> سارية وموثقة</span>
        </div>
      </div>
    </div>
    <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-solar-border-card pt-3 text-[11px] text-solar-text-body">
      <p>رقم الاعتماد: <strong class="text-solar-text-heading">{{ certificate.credentialNumber }}</strong><span v-if="certificate.validUntil"> (سارية حتى {{ certificate.validUntil }})</span></p>
      <a v-if="certificate.documentUrl" :href="certificate.documentUrl" target="_blank" rel="noopener" class="inline-flex items-center gap-1 font-bold text-amber-700 hover:underline"><Eye class="size-3.5" aria-hidden="true" /> معاينة الوثيقة</a>
      <span v-else class="inline-flex items-center gap-1 text-solar-text-muted" title="ملف الشهادة غير متاح في البيانات التجريبية"><Eye class="size-3.5" aria-hidden="true" /> ملف المعاينة غير متاح</span>
    </div>
  </article>
</template>
