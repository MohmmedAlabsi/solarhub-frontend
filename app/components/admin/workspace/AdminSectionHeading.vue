<script setup lang="ts">
defineProps<{title:string;description:string}>()
</script>
<template>
  <header class="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
    <div class="min-w-0"><h1 class="text-2xl font-bold text-solar-text-heading lg:text-[28px]">{{ title }}</h1><p class="mt-2 text-sm leading-7 text-solar-text-muted">{{ description }}</p></div>
    <div v-if="$slots.default" class="flex shrink-0 flex-wrap items-center gap-2"><slot /></div>
  </header>
</template>
