<script setup lang="ts">
import CommonMapLocationModal from '../common/MapLocationModal.vue'

interface Props {
  isOpen: boolean
  currentLocation?: string
  initialCoordinates?: { lat: number; lng: number }
  title?: string
  subtitle?: string
}

defineProps<Props>()
const emit = defineEmits<{
  close: []
  select: [location: { address: string; lat: number; lng: number; governorate?: string }]
}>()
</script>

<template>
  <CommonMapLocationModal
    :is-open="isOpen"
    :current-location="currentLocation"
    :initial-coordinates="initialCoordinates"
    :title="title"
    :subtitle="subtitle"
    @close="emit('close')"
    @select="(loc) => emit('select', loc)"
  />
</template>
