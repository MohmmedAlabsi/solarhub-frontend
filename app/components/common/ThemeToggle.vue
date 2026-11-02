<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'
import { useTheme } from '~/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button
    type="button"
    @click="toggleTheme"
    class="relative inline-flex size-9 sm:size-10 items-center justify-center rounded-xl border border-solar-border-card bg-solar-bg-card text-solar-text-heading hover:bg-solar-bg-subtle hover:border-solar-yellow hover:text-solar-yellow transition-all duration-200 cursor-pointer shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow"
    :title="isDark ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'"
    :aria-label="isDark ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'"
  >
    <Sun
      v-if="isDark"
      class="size-4.5 sm:size-5 text-solar-yellow transition-transform duration-300 rotate-0 hover:rotate-45 stroke-[2.2]"
    />
    <Moon
      v-else
      class="size-4.5 sm:size-5 text-solar-navy transition-transform duration-300 -rotate-12 hover:rotate-0 stroke-[2.2]"
    />
  </button>
</template>
