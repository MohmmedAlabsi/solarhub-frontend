<script setup lang="ts">
import { ArrowLeft, CheckCircle, FileText, MessageCircle } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { EngineerWorkItem } from '~~/app/composables/useEngineerDashboard'

const props = defineProps<{ item: EngineerWorkItem }>()

const icons: Record<EngineerWorkItem['icon'], Component> = {
  document: FileText,
  chat:     MessageCircle,
  check:    CheckCircle,
}

const iconTone: Record<EngineerWorkItem['icon'], string> = {
  document: 'bg-amber-100 text-amber-700',
  chat:     'bg-blue-100 text-blue-600',
  check:    'bg-emerald-100 text-emerald-700',
}
</script>

<template>
  <div class="flex items-center justify-between gap-4 rounded-xl border border-solar-border-card bg-solar-bg-card p-4 sm:p-5 transition-all hover:border-solar-yellow/40 hover:shadow-card">
    <!-- المحتوى: أيقونة + نص -->
    <div class="flex items-start gap-4 min-w-0">
      <span class="flex size-11 shrink-0 items-center justify-center rounded-xl" :class="iconTone[item.icon]">
        <component :is="icons[item.icon]" class="size-5" aria-hidden="true" />
      </span>
      <div class="min-w-0 text-right">
        <p class="text-sm font-bold text-solar-text-heading leading-snug">{{ item.title }}</p>
        <p class="mt-0.5 text-xs text-solar-text-muted leading-relaxed">{{ item.description }}</p>
      </div>
    </div>

    <!-- زر الإجراء السريع -->
    <NuxtLink
      :to="item.destination"
      class="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-solar-text-body hover:text-solar-navy-dark transition-colors whitespace-nowrap"
      :aria-label="item.actionLabel"
    >
      {{ item.actionLabel }}
      <!-- السهم يتجه يساراً في RTL -->
      <ArrowLeft class="size-3.5" aria-hidden="true" />
    </NuxtLink>
  </div>
</template>
