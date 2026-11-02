<script setup lang="ts">
import type { UserRole } from '~~/types/auth'

interface Props {
  modelValue: UserRole
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: UserRole): void
}>()

const roles: { id: UserRole; label: string }[] = [
  { id: 'customer', label: 'عميل' },
  { id: 'supplier', label: 'مورد' },
  { id: 'engineer', label: 'مهندس' },
]

function selectRole(role: UserRole) {
  emit('update:modelValue', role)
}
</script>

<template>
  <div class="w-full flex flex-col gap-2 mb-6">
    <div class="flex items-center justify-between">
      <label class="text-xs font-bold text-solar-text-heading flex items-center gap-1">
        <span>نوع الحساب</span>
        <span class="text-rose-500">*</span>
      </label>
    </div>

    <!-- شريط التبديل الثلاثي المتوافق بالكامل مع الوضعين الداكن والنهاري -->
    <div class="grid grid-cols-3 gap-1 rounded-2xl bg-solar-bg-subtle border border-solar-border-card p-1.5 shadow-inner transition-colors duration-200">
      <button
        v-for="role in roles"
        :key="role.id"
        type="button"
        @click="selectRole(role.id)"
        class="h-11 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center cursor-pointer select-none"
        :class="[
          modelValue === role.id
            ? 'bg-solar-navy-dark dark:bg-solar-yellow text-white dark:text-solar-navy-dark shadow-md font-black'
            : 'text-solar-text-body hover:text-solar-text-heading hover:bg-solar-bg-card/70'
        ]"
      >
        {{ role.label }}
      </button>
    </div>
  </div>
</template>
