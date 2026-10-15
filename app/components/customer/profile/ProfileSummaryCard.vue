<script setup lang="ts">
import { BadgeCheck } from 'lucide-vue-next'
import type { CustomerProfileForm, CustomerProfileSummary } from '~~/types/customer-profile'
defineProps<{ profile: CustomerProfileForm; summary: CustomerProfileSummary }>()
</script>

<template>
  <section class="flex flex-col items-center gap-4 rounded-2xl border border-solar-border-card bg-white p-5 shadow-sm sm:flex-row sm:p-6">
    <div class="flex size-20 shrink-0 items-center justify-center rounded-full bg-solar-navy-dark text-2xl font-black text-white ring-4 ring-solar-yellow/30">{{ summary.initials }}</div>
    <div class="min-w-0 flex-1 text-center sm:text-right">
      <div class="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        <h2 class="text-xl font-extrabold text-solar-text-heading">{{ profile.fullName }}</h2>
        <span v-if="summary.verified" class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><BadgeCheck class="size-4" aria-hidden="true" /> حساب معتمد</span>
      </div>
      <p class="mt-1 text-sm text-solar-text-muted">{{ profile.email }}</p>
      <p class="mt-2 text-xs text-solar-text-muted">معرف العميل <code class="mr-2 rounded bg-solar-bg-subtle px-2 py-1 text-solar-text-body">#{{ summary.customerId }}</code></p>
    </div>
  </section>
</template>
