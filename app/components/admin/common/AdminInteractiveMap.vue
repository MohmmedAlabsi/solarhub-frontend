<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { MapPin, ExternalLink, Maximize2 } from 'lucide-vue-next'
import CommonMapLocationModal from '../../common/MapLocationModal.vue'

interface Props {
  lat?: number
  lng?: number
  title?: string
  governorate?: string
  address?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  lat: 15.3694,
  lng: 44.1910,
  title: 'الموقع الجغرافي',
  governorate: 'صنعاء',
  address: '',
  height: '240px',
})

const mapContainer = ref<HTMLElement | null>(null)
const isModalOpen = ref(false)
let leafletMap: any = null
let mapMarker: any = null
let L: any = null

async function initMap() {
  if (!import.meta.client) return
  await nextTick()
  if (!mapContainer.value) return

  try {
    if (!L) {
      const leafletModule = await import('leaflet')
      L = leafletModule.default || leafletModule
    }

    if (leafletMap) {
      leafletMap.remove()
      leafletMap = null
    }

    const lat = props.lat || 15.3694
    const lng = props.lng || 44.1910

    leafletMap = L.map(mapContainer.value, {
      center: [lat, lng],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(leafletMap)

    const customIcon = L.divIcon({
      className: 'solar-admin-map-marker',
      html: `
        <div style="background-color: #0E1726; color: #F59E0B; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2px solid #F59E0B;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34],
    })

    mapMarker = L.marker([lat, lng], { icon: customIcon }).addTo(leafletMap)

    const popupContent = `
      <div style="direction: rtl; font-family: inherit; font-size: 12px; padding: 4px;">
        <strong style="color: #0E1726; font-size: 13px;">${props.title}</strong>
        <p style="margin: 4px 0 0 0; color: #4B5563;">المحافظة: ${props.governorate}</p>
        ${props.address ? `<p style="margin: 2px 0 0 0; color: #6B7280; font-size: 11px;">${props.address}</p>` : ''}
      </div>
    `
    mapMarker.bindPopup(popupContent)

    setTimeout(() => {
      if (leafletMap) leafletMap.invalidateSize()
    }, 150)
  } catch (err) {
    console.warn('Inline Leaflet map notice:', err)
  }
}

watch(() => [props.lat, props.lng], () => {
  if (leafletMap && mapMarker && props.lat && props.lng) {
    mapMarker.setLatLng([props.lat, props.lng])
    leafletMap.setView([props.lat, props.lng], 13)
  } else {
    initMap()
  }
})

onMounted(() => {
  setTimeout(initMap, 100)
})

onUnmounted(() => {
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }
})
</script>

<template>
  <div class="relative overflow-hidden rounded-xl border border-solar-border-card bg-slate-50 shadow-sm">
    <!-- Header bar with coordinates & actions -->
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-solar-border-card bg-white px-4 py-2.5 text-xs">
      <div class="flex items-center gap-1.5 font-bold text-solar-navy">
        <MapPin class="size-4 text-solar-yellow" />
        <span>الموقع الجغرافي: {{ governorate }}</span>
        <span class="font-mono text-[11px] font-normal text-solar-text-muted">
          ({{ lat.toFixed(4) }}, {{ lng.toFixed(4) }})
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-lg border border-solar-border-card bg-solar-bg-page px-2.5 py-1 text-[11px] font-medium text-solar-navy transition hover:bg-solar-status-info-bg cursor-pointer"
          @click="isModalOpen = true"
        >
          <Maximize2 class="size-3 text-solar-yellow" />
          تكبير الخريطة
        </button>

        <a
          :href="`https://www.google.com/maps?q=${lat},${lng}`"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 rounded-lg border border-solar-border-card bg-solar-bg-page px-2.5 py-1 text-[11px] font-medium text-solar-navy transition hover:bg-solar-status-info-bg"
          title="فتح في خرائط Google"
        >
          <ExternalLink class="size-3" />
          خرائط Google
        </a>
      </div>
    </div>

    <!-- Map container -->
    <div
      ref="mapContainer"
      class="w-full z-0"
      :style="{ height }"
    />

    <!-- Fullscreen modal -->
    <CommonMapLocationModal
      :is-open="isModalOpen"
      :initial-coordinates="{ lat, lng }"
      :current-location="address || governorate"
      :title="`موقع: ${title}`"
      :subtitle="`المحافظة: ${governorate} — الإحداثيات: ${lat.toFixed(5)}, ${lng.toFixed(5)}`"
      @close="isModalOpen = false"
      @select="isModalOpen = false"
    />
  </div>
</template>
