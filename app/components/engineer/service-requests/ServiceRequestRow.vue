<script setup lang="ts">
import {
  Activity,
  Battery,
  CheckCircle,
  ClipboardCheck,
  Droplets,
  Eye,
  FileText,
  MapPin,
  Send,
  Zap,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import type { EngineerServiceRequest, ServiceRequestStatus } from '~~/app/composables/useEngineerServiceRequests'

const props = defineProps<{
  request: EngineerServiceRequest
  statusLabels: Record<ServiceRequestStatus, string>
  statusClasses: Record<ServiceRequestStatus, string>
}>()

const emit = defineEmits<{
  (e: 'view', request: EngineerServiceRequest): void
  (e: 'submit', request: EngineerServiceRequest): void
}>()

const serviceIcons: Record<EngineerServiceRequest['serviceIcon'], Component> = {
  grid:       Zap,
  inspect:    ClipboardCheck,
  droplet:    Droplets,
  compliance: FileText,
  bess:       Battery,
  monitor:    Activity,
}
</script>

<template>
  <tr class="border-b border-solar-border-card last:border-0 hover:bg-solar-bg-subtle/50 transition-colors">
    <!-- رقم الطلب -->
    <td class="py-4 px-4 text-right">
      <div class="flex items-center justify-end gap-2">
        <FileText class="size-4 text-solar-text-muted shrink-0" aria-hidden="true" />
        <span class="text-sm font-bold text-solar-text-heading font-mono">{{ request.id }}</span>
      </div>
    </td>

    <!-- نوع الخدمة -->
    <td class="py-4 px-4 text-right">
      <div class="flex items-start justify-end gap-2">
        <div class="text-right">
          <p class="text-sm font-semibold text-solar-text-heading leading-snug">{{ request.serviceType }}</p>
          <p class="mt-0.5 flex items-center gap-1 text-xs text-solar-text-muted">
            <MapPin class="size-3 shrink-0" aria-hidden="true" />
            {{ request.governorate }}
          </p>
        </div>
        <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-solar-bg-subtle text-solar-text-body">
          <component :is="serviceIcons[request.serviceIcon]" class="size-4" aria-hidden="true" />
        </span>
      </div>
    </td>

    <!-- السعة التقديرية -->
    <td class="py-4 px-4 text-center">
      <span class="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
        {{ request.capacityLabel }}
      </span>
    </td>

    <!-- تاريخ الإنشاء -->
    <td class="py-4 px-4 text-center text-xs text-solar-text-muted">
      {{ request.createdAt }}
    </td>

    <!-- حالة الطلب -->
    <td class="py-4 px-4 text-center">
      <span
        class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
        :class="statusClasses[request.status]"
      >
        <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
        {{ statusLabels[request.status] }}
        <template v-if="request.offersCount && request.offersCount > 0">
          ({{ request.offersCount }})
        </template>
      </span>
    </td>

    <!-- الإجراءات -->
    <td class="py-4 px-4">
      <div class="flex items-center justify-start gap-2">
        <button
          type="button"
          @click="emit('view', request)"
          class="flex items-center gap-1.5 rounded-lg border border-solar-border-card px-2.5 py-1.5 text-xs font-semibold text-solar-text-body hover:border-solar-navy hover:text-solar-navy transition-colors"
          :aria-label="`عرض تفاصيل ${request.id}`"
        >
          <Eye class="size-3.5" aria-hidden="true" />
          عرض التفاصيل
        </button>
        <button
          type="button"
          @click="emit('submit', request)"
          class="flex items-center gap-1.5 rounded-lg bg-solar-yellow px-2.5 py-1.5 text-xs font-bold text-solar-navy-dark hover:bg-solar-yellow-hover transition-colors"
          :aria-label="`تقديم عرض على ${request.id}`"
        >
          <Send class="size-3.5" aria-hidden="true" />
          تقديم عرض
        </button>
      </div>
    </td>
  </tr>
</template>
