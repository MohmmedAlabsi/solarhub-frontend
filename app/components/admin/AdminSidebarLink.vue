<script setup lang="ts">
import type { Component } from 'vue'

const props = defineProps<{
  label: string
  to: string
  icon: Component
  collapsed: boolean
  active: boolean
}>()

const emit = defineEmits<{ navigate: [] }>()
const tooltip = ref<{ top: number; right: number }>()

function showTooltip(event: Event) {
  if (!props.collapsed) return
  const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect()
  tooltip.value = { top: bounds.top + bounds.height / 2, right: window.innerWidth - bounds.left + 14 }
}

function hideTooltip() {
  tooltip.value = undefined
}

watch(() => props.collapsed, hideTooltip)
</script>

<template>
  <NuxtLink
    :to="to"
    :aria-label="label"
    :aria-current="active ? 'page' : undefined"
    class="group relative flex items-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow"
    :class="[
      collapsed ? 'justify-center rounded-xl p-3' : 'gap-3.5 rounded-xl px-4 py-3 text-sm font-medium',
      active
        ? 'bg-solar-yellow font-bold text-solar-navy-dark shadow-md'
        : 'text-white/80 hover:bg-white/10 hover:text-white'
    ]"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
    @focus="showTooltip"
    @blur="hideTooltip"
    @click="hideTooltip(); emit('navigate')"
  >
    <component :is="icon" class="size-5 shrink-0" aria-hidden="true" />
    <span v-if="!collapsed" class="truncate">{{ label }}</span>
  </NuxtLink>

  <Teleport to="body">
    <span
      v-if="collapsed && tooltip"
      class="pointer-events-none fixed z-[100] -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-solar-navy-dark px-3 py-1.5 text-xs font-bold text-white shadow-2xl drop-shadow-xl"
      :style="{ top: `${tooltip.top}px`, right: `${tooltip.right}px` }"
      aria-hidden="true"
    >
      {{ label }}
      <span class="absolute -right-1 top-1/2 -translate-y-1/2 border-y-4 border-l-4 border-y-transparent border-l-solar-navy-dark" />
    </span>
  </Teleport>
</template>
