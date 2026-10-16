<script setup lang="ts">
import { FileText, Image } from 'lucide-vue-next'
import type { ServiceProjectAttachment } from '../../../../types/service-request'
defineProps<{ attachment: ServiceProjectAttachment }>()
</script>

<template>
  <div class="min-w-0 max-w-full">
    <component :is="attachment.url ? 'a' : 'span'" :href="attachment.url" :download="attachment.url ? attachment.name : undefined" class="inline-flex max-w-full flex-wrap items-center gap-2 rounded-lg bg-solar-status-info-bg px-3 py-2 text-[11px] text-solar-text-body" :class="attachment.url ? 'hover:bg-indigo-100 focus-visible:ring-2 focus-visible:ring-solar-yellow' : ''">
      <Image v-if="attachment.kind === 'image'" class="size-3.5 shrink-0 text-amber-700" aria-hidden="true" /><FileText v-else class="size-3.5 shrink-0 text-red-500" aria-hidden="true" />
      <span class="min-w-0 break-all">{{ attachment.name }}</span><span class="text-[10px] text-solar-text-muted" dir="ltr">({{ attachment.sizeLabel }})</span>
    </component>
    <p v-if="!attachment.url" class="mt-1 text-[10px] text-solar-text-muted">ملف تجريبي؛ التنزيل غير متاح.</p>
  </div>
</template>
