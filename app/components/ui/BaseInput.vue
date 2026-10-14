<script setup lang="ts">
import { ref, computed } from 'vue'
import { Eye, EyeOff, AlertCircle } from 'lucide-vue-next'

interface Props {
  modelValue?: string | number
  label?: string
  id?: string
  name?: string
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  error?: string
  hint?: string
  autocomplete?: string
  leadingIcon?: any
  trailingIcon?: any
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  required: false,
  disabled: false,
  readonly: false,
  error: '',
  hint: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
}>()

const inputId = computed(() => props.id || props.name || `input-${Math.random().toString(36).substring(2, 9)}`)
const showPassword = ref(false)

const computedType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="w-full text-right" dir="rtl">
    <!-- Label & Optional Action (e.g. Forgot password link) -->
    <div v-if="label || $slots['label-action']" class="mb-2 flex items-center justify-between text-sm">
      <label
        v-if="label"
        :for="inputId"
        class="block font-medium text-slate-800"
      >
        {{ label }}
        <span v-if="required" class="text-rose-500 mr-0.5">*</span>
      </label>
      <slot name="label-action" />
    </div>

    <!-- Input Box Wrapper -->
    <div class="relative flex items-center">
      <!-- Leading Icon / Slot (Right side in RTL) -->
      <div
        v-if="leadingIcon || $slots.leading"
        class="pointer-events-none absolute right-3.5 flex items-center text-slate-400"
      >
        <slot name="leading">
          <component :is="leadingIcon" class="size-5" aria-hidden="true" />
        </slot>
      </div>

      <!-- Input Field -->
      <input
        :id="inputId"
        :name="name"
        :type="computedType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :dir="type === 'email' || type === 'password' || type === 'tel' ? 'ltr' : 'rtl'"
        class="w-full rounded-xl border bg-white py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 outline-none disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
        :class="[
          // RTL padding depending on icons
          leadingIcon || $slots.leading ? 'pr-11' : 'pr-4',
          trailingIcon || $slots.trailing || type === 'password' ? 'pl-11' : 'pl-4',
          // Text alignment: Arabic right-aligned, email/passwords ltr but aligned to match design
          type === 'password' || type === 'email' || type === 'tel' ? 'text-right' : 'text-right',
          // Validation error state
          error
            ? 'border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
            : 'border-slate-200 hover:border-slate-300 focus:border-[#24374e] focus:ring-4 focus:ring-[#24374e]/10'
        ]"
        @input="handleInput"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      />

      <!-- Trailing Icon / Action (Left side in RTL) -->
      <div
        v-if="type === 'password' || trailingIcon || $slots.trailing"
        class="absolute left-3.5 flex items-center"
      >
        <!-- Password Toggle -->
        <button
          v-if="type === 'password'"
          type="button"
          tabindex="-1"
          class="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
          :title="showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'"
          @click="showPassword = !showPassword"
        >
          <EyeOff v-if="showPassword" class="size-5" />
          <Eye v-else class="size-5" />
        </button>

        <!-- Custom Trailing Icon / Slot -->
        <slot v-else name="trailing">
          <component :is="trailingIcon" class="size-5 text-slate-400" aria-hidden="true" />
        </slot>
      </div>
    </div>

    <!-- Error Message -->
    <div
      v-if="error"
      class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600 animate-fadeIn"
    >
      <AlertCircle class="size-3.5 shrink-0" aria-hidden="true" />
      <span>{{ error }}</span>
    </div>

    <!-- Hint / Helper -->
    <p v-else-if="hint" class="mt-1.5 text-xs text-slate-500">
      {{ hint }}
    </p>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
</style>
