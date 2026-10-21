<script setup lang="ts">
import { Download, Eye, FileText } from 'lucide-vue-next'
import type { EngineerOffer, OfferStatus } from '~~/app/composables/useEngineerOffers'

const props = defineProps<{
  offer: EngineerOffer
  statusLabels: Record<OfferStatus, string>
  statusClasses: Record<OfferStatus, string>
}>()

const emit = defineEmits<{
  (e: 'view', offer: EngineerOffer): void
}>()

// تنسيق الرقم بالريال
const formattedCost = computed(() =>
  props.offer.totalCost.toLocaleString('ar-SA') + ' ر.س'
)

// عنوان الطلب (السطر الأول فقط)
const requestTitle = computed(() => props.offer.requestTitle.split('\n')[0])
const requestId = computed(() => props.offer.requestTitle.split('\n')[1] ?? props.offer.requestId)
</script>

<template>
  <tr class="border-b border-solar-border-card last:border-0 hover:bg-solar-bg-subtle/50 transition-colors">
    <!-- رقم العرض -->
    <td class="py-4 px-4 text-right">
      <div class="flex items-center justify-end gap-2">
        <FileText class="size-4 text-solar-text-muted shrink-0" aria-hidden="true" />
        <span class="text-sm font-bold text-solar-text-heading font-mono">{{ offer.id }}</span>
      </div>
    </td>

    <!-- طلب الخدمة المرتبط بالعرض -->
    <td class="py-4 px-4 text-right">
      <p class="text-sm font-semibold text-solar-text-heading leading-snug">{{ requestTitle }}</p>
      <p class="mt-0.5 text-xs font-mono text-solar-text-muted">{{ requestId }}</p>
    </td>

    <!-- التكلفة المقترحة -->
    <td class="py-4 px-4 text-center">
      <span class="text-sm font-bold text-solar-text-heading">{{ formattedCost }}</span>
    </td>

    <!-- مدة التنفيذ -->
    <td class="py-4 px-4 text-center text-xs text-solar-text-muted">
      {{ offer.durationDays }} أيام
    </td>

    <!-- حالة العرض -->
    <td class="py-4 px-4 text-center">
      <span
        class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
        :class="statusClasses[offer.status]"
      >
        <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
        {{ statusLabels[offer.status] }}
      </span>
    </td>

    <!-- تاريخ تقديم العرض -->
    <td class="py-4 px-4 text-center text-xs text-solar-text-muted">
      {{ offer.submittedAt }}
    </td>

    <!-- الإجراءات -->
    <td class="py-4 px-4">
      <button
        type="button"
        @click="emit('view', offer)"
        class="flex items-center gap-1.5 rounded-lg border border-solar-border-card px-2.5 py-1.5 text-xs font-semibold text-solar-text-body hover:border-solar-navy hover:text-solar-navy transition-colors"
        :aria-label="`عرض تفاصيل ${offer.id}`"
      >
        <Eye class="size-3.5" aria-hidden="true" />
        عرض التفاصيل
      </button>
    </td>
  </tr>
</template>
