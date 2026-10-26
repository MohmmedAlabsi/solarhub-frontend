<script setup lang="ts">
import type {
  EngineerProfileTab,
} from '../../../../../types/engineer'

defineProps<{
  activeTab: EngineerProfileTab
  reviewCount: number | null
}>()

defineEmits<{
  select: [tab: EngineerProfileTab]
}>()

const tabs: Array<{
  id: EngineerProfileTab
  label: string
}> = [
  {
    id: 'overview',
    label: 'نظرة عامة',
  },
  {
    id: 'projects',
    label: 'معرض المشاريع',
  },
  {
    id: 'certificates',
    label: 'الاعتمادات والشهادات',
  },
  {
    id: 'reviews',
    label: 'التقييمات والآراء',
  },
]
</script>

<template>
  <nav
    class="overflow-x-auto border-b border-solar-border-card"
    aria-label="أقسام الملف الشخصي"
  >
    <div class="flex min-w-max gap-7 px-1">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="border-b-2 px-1 py-4 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow"
        :class="
          activeTab === tab.id
            ? 'border-solar-yellow font-extrabold text-solar-text-heading'
            : 'border-transparent text-solar-text-body hover:text-solar-text-heading'
        "
        :aria-current="
          activeTab === tab.id ? 'page' : undefined
        "
        @click="$emit('select', tab.id)"
      >
        {{ tab.label }}

        <span
          v-if="
            tab.id === 'reviews' &&
            reviewCount !== null
          "
        >
          ({{ reviewCount }})
        </span>
      </button>
    </div>
  </nav>
</template>