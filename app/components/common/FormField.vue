<script setup lang="ts">
defineProps<{ label: string; error?: string; required?: boolean }>()
</script>

<template>
  <label class="flex min-w-0 flex-col gap-2 text-sm font-medium text-solar-text-body">
    <span>{{ label }} <span v-if="required" class="text-red-500">*</span></span>
    <slot />
    <span v-if="error" class="text-xs font-medium text-red-600" role="alert">{{ error }}</span>
  </label>
</template>
