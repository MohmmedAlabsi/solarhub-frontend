<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'
defineProps<{ modelValue: string; label: string; placeholder: string; error?: string; autocomplete: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const visible = ref(false)
</script>

<template>
  <ProfileField :label="label" :error="error" required>
    <span class="relative block">
      <input :value="modelValue" :type="visible ? 'text' : 'password'" :placeholder="placeholder" :autocomplete="autocomplete" class="solar-input h-11 pl-11" @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
      <button type="button" class="absolute left-3 top-1/2 -translate-y-1/2 rounded p-1 text-solar-text-muted hover:text-solar-text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow" :aria-label="visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'" @click="visible = !visible">
        <EyeOff v-if="visible" class="size-4" aria-hidden="true" /><Eye v-else class="size-4" aria-hidden="true" />
      </button>
    </span>
  </ProfileField>
</template>
