<script setup lang="ts">
import AuthFileUploadInput from '../auth/FileUploadInput.vue'

interface Props {
  label: string
  placeholder?: string
  accept?: string
  required?: boolean
  maxSizeMb?: number
  modelValue?: File | null
  hint?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', file: File | null): void
}>()
</script>

<template>
  <AuthFileUploadInput
    :label="props.label"
    :placeholder="props.placeholder"
    :accept="props.accept"
    :required="props.required"
    :max-size-mb="props.maxSizeMb"
    :model-value="props.modelValue"
    :hint="props.hint"
    @update:model-value="(val) => emit('update:modelValue', val)"
  />
</template>
