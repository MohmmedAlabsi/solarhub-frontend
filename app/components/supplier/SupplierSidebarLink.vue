<script setup lang="ts">
import type { Component } from 'vue'

const props = defineProps<{
  label: string
  to: string
  icon: Component
  collapsed: boolean
  active: boolean
  compact?: boolean
  badge?: number | string
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
    class="group relative flex items-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-solar-navy"
    :class="[
      collapsed ? 'justify-center rounded-xl p-3' : compact ? 'h-10 gap-3 rounded-lg px-3.5 text-sm font-normal' : 'gap-3.5 rounded-lg px-3.5 py-2.5 text-sm font-medium',
      active ? 'bg-solar-yellow font-bold text-solar-navy-dark shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white',
    ]"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
    @focus="showTooltip"
    @blur="hideTooltip"
    @click="hideTooltip(); emit('navigate')"
  >
    <div class="relative flex shrink-0 items-center justify-center">
      <component :is="icon" class="size-5 shrink-0" aria-hidden="true" />
      <span
        v-if="collapsed && badge"
        class="absolute -top-1.5 -left-1.5 flex min-w-[14px] h-3.5 items-center justify-center rounded-full bg-solar-yellow px-1 text-[9px] font-black text-solar-navy-dark ring-2 ring-solar-navy"
      >
        {{ badge }}
      </span>
    </div>

    <span v-if="!collapsed" class="truncate flex-1 text-right">{{ label }}</span>

    <span
      v-if="!collapsed && badge"
      class="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold shadow-sm"
      :class="active ? 'bg-solar-navy text-white' : 'bg-solar-yellow text-solar-navy-dark'"
    >
      {{ badge }}
    </span>
  </NuxtLink>

  <Teleport to="body">
    <span
      v-if="collapsed && tooltip"
      class="pointer-events-none fixed z-[100] -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-solar-navy-dark px-3 py-1.5 text-xs font-bold text-white shadow-2xl drop-shadow-xl"
      :style="{ top: `${tooltip.top}px`, right: `${tooltip.right}px` }"
      aria-hidden="true"
    >
      {{ label }}
      <span v-if="badge" class="mr-1.5 rounded-full bg-solar-yellow px-1.5 py-0.5 text-[10px] text-solar-navy-dark">
        {{ badge }}
      </span>
      <span class="absolute -right-1 top-1/2 -translate-y-1/2 border-y-4 border-l-4 border-y-transparent border-l-solar-navy-dark" />
    </span>
  </Teleport>
</template>
