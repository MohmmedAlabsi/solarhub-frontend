<script setup lang="ts">
import { CreditCard, FileText, SlidersHorizontal, Wallet } from 'lucide-vue-next'

const route = useRoute()

const tabs = [
  { label: 'مدفوعات العملاء', to: '/admin/finance/payments', icon: CreditCard },
  { label: 'مستحقات الموردين', to: '/admin/finance/payouts', icon: Wallet, badge: '6 مسجلة' },
  { label: 'الإعدادات المالية', to: '/admin/finance/settings', icon: SlidersHorizontal },
  { label: 'الضرائب', to: '/admin/finance/taxes', icon: FileText },
]

function isActive(to: string) {
  return route.path === to
}
</script>

<template>
  <div class="flex items-center gap-6 sm:gap-8 border-b border-solar-border-card overflow-x-auto scrollbar-none pb-px">
    <NuxtLink
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="group relative flex items-center gap-2 pb-3.5 text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 select-none"
      :class="[
        isActive(tab.to)
          ? 'text-solar-text-heading'
          : 'text-solar-text-muted hover:text-solar-text-body'
      ]"
    >
      <component
        :is="tab.icon"
        class="size-4 shrink-0 transition-colors"
        :class="isActive(tab.to) ? 'text-solar-navy-dark' : 'text-solar-text-muted group-hover:text-solar-text-body'"
      />
      <span>{{ tab.label }}</span>

      <!-- شارة عدد مسجلة لمستحقات الموردين -->
      <span
        v-if="tab.badge"
        class="rounded-full px-2 py-0.5 text-[10px] font-black"
        :class="isActive(tab.to) ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'"
      >
        {{ tab.badge }}
      </span>

      <!-- الخط الأصفر النشط أسفل التبويب المطابق للتصميم -->
      <span
        v-if="isActive(tab.to)"
        class="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-solar-yellow"
      />
    </NuxtLink>
  </div>
</template>
