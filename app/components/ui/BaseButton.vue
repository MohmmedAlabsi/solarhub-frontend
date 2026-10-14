<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, Loader2 } from 'lucide-vue-next'

interface Props {
  variant?: 'primary' | 'outline' | 'text' | 'brand' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  block?: boolean
  disabled?: boolean
  loading?: boolean
  arrow?: boolean
  to?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  block: false,
  disabled: false,
  loading: false,
  arrow: false,
  to: '',
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-[#24374e] text-white hover:bg-[#1a293b] active:bg-[#131f2d] shadow-sm focus-visible:ring-[#24374e]/30'
    case 'outline':
      return 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-sm focus-visible:ring-slate-300'
    case 'text':
      return 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 active:bg-slate-200/50'
    case 'brand':
      return 'bg-brand-500 text-slate-900 font-semibold hover:bg-brand-600 active:bg-brand-600 shadow-sm focus-visible:ring-brand-400'
    case 'danger':
      return 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm focus-visible:ring-rose-400'
    default:
      return 'bg-[#24374e] text-white hover:bg-[#1a293b]'
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-xs rounded-lg'
    case 'lg':
      return 'px-6 py-3.5 text-base rounded-xl font-medium'
    case 'md':
    default:
      return 'px-5 py-2.5 text-sm rounded-xl font-medium'
  }
})
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="[
      'inline-flex items-center justify-center gap-2 transition-all duration-200 select-none outline-none focus-visible:ring-4',
      variantClasses,
      sizeClasses,
      block ? 'w-full' : '',
      disabled || loading ? 'opacity-60 pointer-events-none cursor-not-allowed' : ''
    ]"
  >
    <Loader2 v-if="loading" class="size-4 animate-spin shrink-0" />
    <slot name="leading" />
    <slot />
    <slot name="trailing">
      <ArrowLeft v-if="arrow && !loading" class="size-4 shrink-0 transition-transform group-hover:-translate-x-1" />
    </slot>
  </NuxtLink>

  <button
    v-else
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'group inline-flex items-center justify-center gap-2 transition-all duration-200 select-none outline-none focus-visible:ring-4',
      variantClasses,
      sizeClasses,
      block ? 'w-full' : '',
      disabled || loading ? 'opacity-60 pointer-events-none cursor-not-allowed' : 'active:scale-[0.99]'
    ]"
  >
    <Loader2 v-if="loading" class="size-4 animate-spin shrink-0" />
    <slot name="leading" />
    <slot />
    <slot name="trailing">
      <ArrowLeft v-if="arrow && !loading" class="size-4 shrink-0 transition-transform group-hover:-translate-x-1" />
    </slot>
  </button>
</template>
