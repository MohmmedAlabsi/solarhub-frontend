<script setup lang="ts">
import { Award, Boxes, Briefcase, MapPin, Users, Wallet } from 'lucide-vue-next'

const route = useRoute()

const tabs = [
  { label: 'المحافظات', to: '/admin/master-data/cities', icon: MapPin },
  { label: 'التخصصات', to: '/admin/master-data/specialties', icon: Users },
  { label: 'أنواع الخدمات', to: '/admin/master-data/service-types', icon: Briefcase },
  { label: 'التصنيفات', to: '/admin/master-data/categories', icon: Boxes },
  { label: 'العلامات التجارية', to: '/admin/master-data/brands', icon: Award },
  { label: 'المحافظ الإلكترونية', to: '/admin/master-data/wallet-providers', icon: Wallet },
]

function isActive(to: string) {
  return route.path === to
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 rounded-2xl border border-solar-border-card bg-white p-2 shadow-2xs">
    <NuxtLink
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 select-none"
      :class="[
        isActive(tab.to)
          ? 'bg-solar-navy text-white shadow-md'
          : 'text-solar-text-body hover:bg-solar-bg-subtle hover:text-solar-text-heading'
      ]"
    >
      <component :is="tab.icon" class="size-4 shrink-0" />
      <span>{{ tab.label }}</span>
    </NuxtLink>
  </div>
</template>
