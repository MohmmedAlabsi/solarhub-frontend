<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { Component } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    subtitle?: string
    icon?: Component
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  }>(),
  {
    subtitle: undefined,
    icon: undefined,
    maxWidth: '2xl',
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

function close() {
  emit('update:modelValue', false)
  emit('close')
}

const maxWidthClass = computed(() => {
  switch (props.maxWidth) {
    case 'sm': return 'max-w-sm'
    case 'md': return 'max-w-md'
    case 'lg': return 'max-w-lg'
    case 'xl': return 'max-w-xl'
    case '3xl': return 'max-w-3xl'
    case '4xl': return 'max-w-4xl'
    case '2xl':
    default:
      return 'max-w-2xl'
  }
})

const handleKeydown = (event: KeyboardEvent) => {
  if (props.modelValue && event.key === 'Escape') {
    close()
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        dir="rtl"
      >
        <!-- خلفية داكنة مع بلور -->
        <div
          class="fixed inset-0 bg-solar-navy-dark/60 backdrop-blur-xs transition-opacity"
          aria-hidden="true"
          @click="close"
        />

        <!-- كارد النافذة المنبثقة -->
        <div
          class="relative w-full rounded-2xl border border-solar-border-card bg-white p-5 sm:p-7 shadow-2xl z-10 max-h-[90vh] flex flex-col"
          :class="maxWidthClass"
        >
          <!-- الهيدر -->
          <div class="flex items-center justify-between gap-4 border-b border-solar-border-card pb-4">
            <div class="flex items-center gap-3">
              <div v-if="icon" class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark">
                <component :is="icon" class="size-5" />
              </div>
              <div class="flex flex-col">
                <h3 class="text-base sm:text-lg font-black text-solar-text-heading">{{ title }}</h3>
                <p v-if="subtitle" class="text-xs text-solar-text-muted mt-0.5">{{ subtitle }}</p>
              </div>
            </div>

            <button
              type="button"
              @click="close"
              class="flex size-8 items-center justify-center rounded-lg text-solar-text-muted hover:bg-solar-bg-subtle hover:text-solar-text-heading transition-colors"
              aria-label="إغلاق النافذة"
            >
              <X class="size-5" />
            </button>
          </div>

          <!-- جسم النافذة القابل للتمرير -->
          <div class="flex-1 overflow-y-auto py-5 pr-1 pl-1 scrollbar-thin">
            <slot />
          </div>

          <!-- الفوتر الاختياري -->
          <div v-if="$slots.footer" class="border-t border-solar-border-card pt-4 mt-2 flex items-center justify-end gap-3">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
