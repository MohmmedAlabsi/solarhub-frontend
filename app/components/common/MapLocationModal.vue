<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import {
  MapPin,
  Map as MapIcon,
  Check,
  X,
  Search,
  Crosshair,
  Loader2,
  Navigation,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-vue-next'

export interface LocationData {
  address: string
  lat: number
  lng: number
  governorate?: string
}

interface Props {
  isOpen: boolean
  currentLocation?: string
  initialCoordinates?: { lat: number; lng: number }
  title?: string
  subtitle?: string
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  currentLocation: '',
  initialCoordinates: () => ({ lat: 15.3694, lng: 44.1910 }), // Default Sana'a
  title: 'تحديد الموقع الجغرافي',
  subtitle: 'ابحث عن منطقتك ليعكس موقعها مباشرة على الخريطة التفاعلية، ثم اضغط حفظ',
  readonly: false,
})

const emit = defineEmits<{
  close: []
  select: [location: LocationData]
}>()

import { popularLocations, findNearestLocation, reverseGeocode } from '~/utils/geocoding'

// State
const searchQuery = ref('')
const searchResults = ref<Array<{ display_name: string; lat: number; lng: number; governorate: string }>>([])
const isSearching = ref(false)
const isLocatingUser = ref(false)
const isTranslatingAddress = ref(false)
let geocodeAbortController: AbortController | null = null
const locationError = ref('')
const successNotice = ref('')
const addressInput = ref(props.currentLocation || '')
const selectedCoords = ref<{ lat: number; lng: number }>({
  lat: props.initialCoordinates?.lat || 15.3694,
  lng: props.initialCoordinates?.lng || 44.1910,
})
const selectedGovernorate = ref('صنعاء')
const currentMapType = ref<'streets' | 'satellite'>('streets')

// Map elements
const mapContainer = ref<HTMLElement | null>(null)
let leafletMap: any = null
let mapMarker: any = null
let currentTileLayer: any = null
let L: any = null

const formattedCoordinates = computed(() => {
  return `${selectedCoords.value.lat.toFixed(5)}, ${selectedCoords.value.lng.toFixed(5)}`
})

// Parse coordinate string from DB or input (e.g. EWKB hex, "POINT(44.1910 15.3694)", or "15.3694, 44.1910")
function parseCoordinateString(str?: string): { lat: number; lng: number } | null {
  if (!str) return null
  const trimmed = str.trim()

  // 1. PostGIS EWKB Hex format (e.g. 0101000020E6100000...)
  if (/^0101000020[0-9a-fA-F]{40}$/i.test(trimmed)) {
    try {
      const match = trimmed.match(/^0101000020[0-9a-fA-F]{8}([0-9a-fA-F]{16})([0-9a-fA-F]{16})$/i)
      if (match) {
        const hexToDouble = (hex: string) => {
          const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
          const view = new DataView(bytes.buffer)
          return view.getFloat64(0, true) // little endian
        }
        const lng = hexToDouble(match[1])
        const lat = hexToDouble(match[2])
        if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
      }
    } catch {}
  }

  // 2. PostGIS WKT Point format (POINT(lng lat))
  const pointMatch = trimmed.match(/POINT\s*\(\s*(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)\s*\)/i)
  if (pointMatch) {
    const lng = parseFloat(pointMatch[1])
    const lat = parseFloat(pointMatch[3])
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
  }

  // 3. Comma-separated format ("lat, lng")
  const commaMatch = trimmed.match(/^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/)
  if (commaMatch) {
    const lat = parseFloat(commaMatch[1])
    const lng = parseFloat(commaMatch[3])
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
  }

  return null
}

// Match best initial coordinates based on location name or initial prop
function syncInitialLocation() {
  let hasExplicitCoords = false

  if (props.initialCoordinates && !isNaN(props.initialCoordinates.lat) && !isNaN(props.initialCoordinates.lng) && (props.initialCoordinates.lat !== 0 || props.initialCoordinates.lng !== 0)) {
    selectedCoords.value = {
      lat: props.initialCoordinates.lat,
      lng: props.initialCoordinates.lng,
    }
    hasExplicitCoords = true
  }

  if (props.currentLocation) {
    addressInput.value = props.currentLocation
    const parsedCoords = parseCoordinateString(props.currentLocation)
    if (parsedCoords) {
      if (!hasExplicitCoords) {
        selectedCoords.value = parsedCoords
        hasExplicitCoords = true
      }
      const nearest = findNearestPopular(parsedCoords.lat, parsedCoords.lng)
      if (nearest) selectedGovernorate.value = nearest.governorate
    } else if (!hasExplicitCoords) {
      const match = findLocalMatch(props.currentLocation)
      if (match) {
        selectedCoords.value = { lat: match.lat, lng: match.lng }
        selectedGovernorate.value = match.governorate
      }
    }
  }

  if (hasExplicitCoords) {
    const nearest = findNearestPopular(selectedCoords.value.lat, selectedCoords.value.lng)
    if (nearest) selectedGovernorate.value = nearest.governorate
  }
}

// Find local match from our offline database
function findLocalMatch(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return null

  // 1. Exact or startsWith match
  const direct = popularLocations.find(l => 
    l.name.toLowerCase().includes(q) || 
    q.includes(l.name.toLowerCase()) ||
    l.aliases.some(a => q.includes(a.toLowerCase()) || a.toLowerCase().includes(q))
  )
  if (direct) return direct

  // 2. Split words match
  const words = q.split(/\s+/).filter(w => w.length > 2)
  for (const word of words) {
    const wordMatch = popularLocations.find(l => 
      l.name.toLowerCase().includes(word) || 
      l.governorate.toLowerCase().includes(word) ||
      l.aliases.some(a => a.toLowerCase().includes(word))
    )
    if (wordMatch) return wordMatch
  }

  return null
}

// Find nearest known city from coordinate
function findNearestPopular(lat: number, lng: number) {
  let minDistance = Infinity
  let closest = popularLocations[0]

  for (const loc of popularLocations) {
    const dist = Math.hypot(loc.lat - lat, loc.lng - lng)
    if (dist < minDistance) {
      minDistance = dist
      closest = loc
    }
  }
  return closest
}

function setTileLayer(type: 'streets' | 'satellite') {
  if (!leafletMap || !L) return
  currentMapType.value = type
  if (currentTileLayer) {
    leafletMap.removeLayer(currentTileLayer)
  }

  if (type === 'satellite') {
    // Esri ArcGIS World Imagery Satellite Tiles (high-res, no watermark, fast, free)
    currentTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: '© Esri, Maxar, Earthstar Geographics',
    }).addTo(leafletMap)
  } else {
    // Esri ArcGIS World Street Map (Full Arabic labels for Yemen & KSA, no API key, zero watermark)
    currentTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: '© Esri, HERE, Garmin, USGS, NGA',
    }).addTo(leafletMap)
  }
}

// Initialize Leaflet Map with CartoDB Voyager tiles (High performance, no blocking)
async function initMap() {
  if (!import.meta.client) return

  await nextTick()
  if (!mapContainer.value) {
    setTimeout(initMap, 80)
    return
  }

  try {
    if (!L) {
      const leafletModule = await import('leaflet')
      L = leafletModule.default || leafletModule
    }

    if (leafletMap) {
      leafletMap.remove()
      leafletMap = null
    }

    const { lat, lng } = selectedCoords.value

    leafletMap = L.map(mapContainer.value, {
      center: [lat, lng],
      zoom: 14,
      zoomControl: false,
    })

    // RTL Zoom control on top right
    L.control.zoom({ position: 'topright' }).addTo(leafletMap)

    // Clean Esri ArcGIS World Street Map (Zero watermark, Arabic labels)
    setTileLayer('streets')

    // SolarHub Brand Marker (Solar Navy #243B53 and Solar Yellow #F2B705)
    const customIcon = L.divIcon({
      className: 'solar-custom-marker',
      html: `
        <div style="position: relative; width: 44px; height: 54px; transform: translate(-50%, -100%); cursor: ${props.readonly ? 'pointer' : 'grab'};">
          <svg viewBox="0 0 38 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 6px 12px rgba(36,59,83,0.45));">
            <path d="M19 0C8.50659 0 0 8.50659 0 19C0 32.25 19 48 19 48C19 48 38 32.25 38 19C38 8.50659 29.4934 0 19 0Z" fill="#243B53"/>
            <circle cx="19" cy="18" r="9.5" fill="#F2B705"/>
            <circle cx="19" cy="18" r="4.5" fill="#243B53"/>
          </svg>
          <div style="position: absolute; bottom: -3px; left: 50%; transform: translateX(-50%); width: 14px; height: 5px; background: rgba(36,59,83,0.3); border-radius: 50%; filter: blur(2px);"></div>
        </div>
      `,
      iconSize: [44, 54],
      iconAnchor: [22, 54],
    })

    const isInteractive = !props.readonly

    mapMarker = L.marker([lat, lng], {
      icon: customIcon,
      draggable: isInteractive,
      autoPan: isInteractive,
    }).addTo(leafletMap)

    if (isInteractive) {
      // Marker drag end
      mapMarker.on('dragend', () => {
        const pos = mapMarker.getLatLng()
        updatePosition(pos.lat, pos.lng)
      })

      // Map click
      leafletMap.on('click', (e: any) => {
        const { lat, lng } = e.latlng
        mapMarker.setLatLng([lat, lng])
        updatePosition(lat, lng)
      })
    } else {
      mapMarker.bindPopup(`
        <div style="text-align: right; font-family: inherit; direction: rtl; font-size: 12px; line-height: 1.5; padding: 4px;">
          <b style="color: #243B53; display: block; margin-bottom: 2px;">${props.title || 'موقع المتجر المعتمد'}</b>
          <span style="color: #64748b; font-size: 11px;">${addressInput.value || props.currentLocation}</span>
        </div>
      `).openPopup()
    }

    // Invalidate size to ensure proper layout rendering
    setTimeout(() => {
      if (leafletMap) leafletMap.invalidateSize()
    }, 150)
    setTimeout(() => {
      if (leafletMap) leafletMap.invalidateSize()
    }, 450)
  } catch (err) {
    console.warn('Leaflet map initialization notice:', err)
  }
}

// Update position safely and calculate address with real-time Reverse Geocoding
async function updatePosition(lat: number, lng: number) {
  selectedCoords.value = { lat, lng }
  locationError.value = ''

  // 1. Immediate offline preview (0ms) so user sees instant feedback
  const nearest = findNearestLocation(lat, lng)
  selectedGovernorate.value = nearest.governorate
  addressInput.value = nearest.formattedAddress

  // 2. Abort prior in-flight reverse geocode request if user is still moving
  if (geocodeAbortController) {
    geocodeAbortController.abort()
    geocodeAbortController = null
  }

  geocodeAbortController = new AbortController()
  isTranslatingAddress.value = true

  try {
    const geo = await reverseGeocode(lat, lng, { signal: geocodeAbortController.signal })
    if (geo && geo.formattedAddress) {
      addressInput.value = geo.formattedAddress
      selectedGovernorate.value = geo.governorate
      showNotice(`تم تحديد العنوان: ${geo.shortAddress || geo.formattedAddress}`)
    }
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      console.warn('Reverse geocoding notice:', err)
    }
  } finally {
    isTranslatingAddress.value = false
    geocodeAbortController = null
  }
}

function showNotice(msg: string) {
  successNotice.value = msg
  setTimeout(() => {
    if (successNotice.value === msg) {
      successNotice.value = ''
    }
  }, 4000)
}

// Quick jump to preset city
function selectPreset(loc: typeof popularLocations[0]) {
  selectedCoords.value = { lat: loc.lat, lng: loc.lng }
  addressInput.value = loc.name
  selectedGovernorate.value = loc.governorate
  searchQuery.value = ''
  searchResults.value = []
  locationError.value = ''

  if (leafletMap && mapMarker) {
    mapMarker.setLatLng([loc.lat, loc.lng])
    leafletMap.flyTo([loc.lat, loc.lng], 14, { duration: 0.8 })
  }
  showNotice(`تم الانتقال إلى: ${loc.name}`)
}

// Search and IMMEDIATELY reflect on interactive map
function executeSearch(customQuery?: string) {
  const query = (customQuery || searchQuery.value).trim()
  if (!query) return

  isSearching.value = true
  locationError.value = ''
  searchResults.value = []

  // 1. Instant local offline search (100% reliable)
  const match = findLocalMatch(query)

  if (match) {
    selectedCoords.value = { lat: match.lat, lng: match.lng }
    addressInput.value = match.name
    selectedGovernorate.value = match.governorate

    if (leafletMap && mapMarker) {
      mapMarker.setLatLng([match.lat, match.lng])
      leafletMap.flyTo([match.lat, match.lng], 15, { duration: 1 })
    }

    showNotice(`تم العثور على "${match.name}" وعكس موقعها على الخريطة بنجاح`)
    isSearching.value = false
    return
  }

  // 2. Filter multiple candidate matches
  const multiple = popularLocations.filter(l => 
    l.name.includes(query) || 
    l.governorate.includes(query) ||
    l.aliases.some(a => a.includes(query))
  )

  if (multiple.length > 0) {
    const top = multiple[0]
    selectedCoords.value = { lat: top.lat, lng: top.lng }
    addressInput.value = top.name
    selectedGovernorate.value = top.governorate

    if (leafletMap && mapMarker) {
      mapMarker.setLatLng([top.lat, top.lng])
      leafletMap.flyTo([top.lat, top.lng], 15, { duration: 1 })
    }
    showNotice(`تم العثور على "${top.name}" وعكس موقعها على الخريطة بنجاح`)
  } else {
    locationError.value = `لم نتمكن من العثور على "${query}". يمكنك اختيار أقرب مدينة من الأزرار أدناه أو النقر مباشرة على الخريطة.`
  }

  isSearching.value = false
}

// Search input autocomplete handler
function handleSearchInput() {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q || q.length < 2) {
    searchResults.value = []
    return
  }

  searchResults.value = popularLocations
    .filter(l => 
      l.name.toLowerCase().includes(q) || 
      l.governorate.toLowerCase().includes(q) ||
      l.aliases.some(a => a.toLowerCase().includes(q))
    )
    .slice(0, 6)
    .map(l => ({
      display_name: l.name,
      lat: l.lat,
      lng: l.lng,
      governorate: l.governorate,
    }))
}

function selectSearchResult(result: { display_name: string; lat: number; lng: number; governorate: string }) {
  selectedCoords.value = { lat: result.lat, lng: result.lng }
  addressInput.value = result.display_name
  selectedGovernorate.value = result.governorate
  searchQuery.value = ''
  searchResults.value = []

  if (leafletMap && mapMarker) {
    mapMarker.setLatLng([result.lat, result.lng])
    leafletMap.flyTo([result.lat, result.lng], 15, { duration: 0.9 })
  }
  showNotice(`تم اختيار "${result.display_name}" وتحديث الخريطة`)
}

// Locate user via GPS with device fallback
function locateUser() {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    locationError.value = 'خدمة تحديد الموقع غير مدعومة في هذا المتصفح'
    return
  }

  isLocatingUser.value = true
  locationError.value = ''

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude

      selectedCoords.value = { lat, lng }

      if (leafletMap && mapMarker) {
        mapMarker.setLatLng([lat, lng])
        leafletMap.flyTo([lat, lng], 15, { duration: 1 })
      }

      updatePosition(lat, lng)
      isLocatingUser.value = false
      showNotice('تم تحديد موقعك الحالي عبر الـ GPS بنجاح')
    },
    (err) => {
      console.warn('Geolocation error:', err)
      // Fallback: pick current or closest city
      const fallbackLoc = findLocalMatch(selectedGovernorate.value) || popularLocations[0]
      selectedCoords.value = { lat: fallbackLoc.lat, lng: fallbackLoc.lng }
      if (leafletMap && mapMarker) {
        mapMarker.setLatLng([fallbackLoc.lat, fallbackLoc.lng])
        leafletMap.flyTo([fallbackLoc.lat, fallbackLoc.lng], 14, { duration: 1 })
      }
      isLocatingUser.value = false
      if (err.code === err.PERMISSION_DENIED) {
        locationError.value = 'تم رفض إذن الموقع في المتصفح. تم توجيه الخريطة لمركز المحافظة، ويمكنك تحريك الدبوس يدوياً.'
      } else {
        locationError.value = 'تعذر التقاط الـ GPS تلقائياً. تم توجيه الخريطة لمركز المحافظة، ويمكنك تحريك الدبوس بدقة.'
      }
    },
    { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
  )
}

// Confirm and save location
function saveLocation() {
  const address = addressInput.value.trim() || `${selectedGovernorate.value} - موقع محدد على الخريطة`

  emit('select', {
    address,
    lat: selectedCoords.value.lat,
    lng: selectedCoords.value.lng,
    governorate: selectedGovernorate.value,
  })
  emit('close')
}

// Watch modal state
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      syncInitialLocation()
      nextTick(() => {
        initMap()
      })
    } else {
      if (leafletMap) {
        leafletMap.remove()
        leafletMap = null
      }
    }
  }
)

onMounted(() => {
  if (props.isOpen) {
    syncInitialLocation()
    initMap()
  }
})

onUnmounted(() => {
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
      @click.self="emit('close')"
    >
      <div
        class="relative w-full max-w-2xl max-h-[92vh] rounded-3xl bg-solar-bg-card p-5 sm:p-7 shadow-2xl border border-solar-border-card text-right flex flex-col gap-4 overflow-y-auto"
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="map-modal-title"
      >
        <!-- رأس النموذج -->
        <div class="flex items-center justify-between border-b border-solar-border-card/70 pb-3">
          <div class="flex items-center gap-3">
            <div class="flex size-11 items-center justify-center rounded-2xl bg-solar-yellow/20 text-solar-navy-dark shadow-xs shrink-0">
              <MapIcon class="size-6 text-solar-navy-dark" />
            </div>
            <div>
              <h3 id="map-modal-title" class="text-base sm:text-lg font-black text-solar-text-heading">
                {{ title }}
              </h3>
              <p class="text-xs text-solar-text-muted mt-0.5">
                {{ subtitle }}
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="emit('close')"
            class="flex size-9 items-center justify-center rounded-xl text-solar-text-muted hover:bg-solar-bg-subtle hover:text-solar-yellow transition-colors cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X class="size-5" />
          </button>
        </div>

        <!-- فورم مربع نص للبحث وعكس الموقع على الخريطة التفاعلية (يظهر فقط في وضع التحديد وليس العرض) -->
        <form v-if="!readonly" @submit.prevent="executeSearch()" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 relative">
          <!-- مربع نص للبحث -->
          <div class="relative flex-1">
            <input
              v-model="searchQuery"
              @input="handleSearchInput"
              @keydown.enter.prevent="executeSearch()"
              type="text"
              placeholder="اكتب اسم المنطقة، الحي، أو المدينة (مثال: صنعاء، حدة، السبعين، المكلا، الرياض)..."
              class="w-full h-11 rounded-xl border border-solar-border-card bg-solar-bg-subtle px-3.5 pr-10 pl-9 text-xs font-semibold text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:bg-solar-bg-card focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all text-right"
            />
            <Search class="absolute top-1/2 -translate-y-1/2 right-3.5 size-4 text-solar-text-muted pointer-events-none" />
            <span v-if="isSearching" class="absolute top-1/2 -translate-y-1/2 left-3 size-4 text-solar-text-muted animate-spin">
              <Loader2 class="size-4" />
            </span>

            <!-- قائمة اقتراحات البحث التلقائية المنسدلة -->
            <div
              v-if="searchResults.length > 0"
              class="absolute top-full right-0 left-0 mt-1.5 z-50 rounded-2xl border border-solar-border-card bg-solar-bg-card p-1.5 shadow-xl max-h-56 overflow-y-auto"
            >
              <button
                v-for="(item, idx) in searchResults"
                :key="idx"
                type="button"
                @click="selectSearchResult(item)"
                class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-right text-xs font-semibold text-solar-text-heading hover:bg-solar-yellow/15 hover:text-solar-navy-dark transition-colors cursor-pointer"
              >
                <MapPin class="size-3.5 text-solar-yellow shrink-0" />
                <span class="truncate flex-1">{{ item.display_name }}</span>
                <span class="text-[10px] text-solar-text-muted shrink-0">{{ item.governorate }}</span>
              </button>
            </div>
          </div>

          <!-- زر بحث وعكس على الخريطة -->
          <button
            type="submit"
            :disabled="isSearching || !searchQuery.trim()"
            class="flex items-center justify-center gap-1.5 h-11 px-4 sm:px-5 rounded-xl bg-solar-navy-dark dark:bg-solar-yellow text-white dark:text-solar-navy-dark text-xs font-bold hover:opacity-90 active:scale-[0.99] transition-all shrink-0 cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <Search class="size-3.5 text-solar-yellow dark:text-solar-navy-dark" />
            <span>بحث في الخريطة</span>
          </button>

          <!-- زر تحديد موقعي الحالي عبر الـ GPS -->
          <button
            type="button"
            @click="locateUser"
            :disabled="isLocatingUser"
            class="flex items-center justify-center gap-1.5 h-11 px-3.5 rounded-xl border border-solar-border-card bg-solar-bg-subtle text-xs font-bold text-solar-text-heading hover:border-solar-yellow hover:text-solar-yellow transition-all shrink-0 cursor-pointer disabled:opacity-50 shadow-xs active:scale-[0.99]"
            title="تحديد موقعي الحالي من الجهاز"
          >
            <Loader2 v-if="isLocatingUser" class="size-4 animate-spin text-solar-yellow" />
            <Crosshair v-else class="size-4 text-solar-navy dark:text-solar-yellow" />
            <span class="hidden sm:inline">{{ isLocatingUser ? 'جاري التحديد...' : 'موقعي الآن' }}</span>
          </button>
        </form>

        <!-- تنبيه في حال وجود إشعار نجاح أو خطأ -->
        <div
          v-if="successNotice && !readonly"
          class="flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-150"
        >
          <CheckCircle2 class="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{{ successNotice }}</span>
        </div>

        <div
          v-if="locationError && !readonly"
          class="flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/40 p-2.5 text-xs font-semibold text-amber-800 dark:text-amber-300 animate-in fade-in duration-150"
        >
          <AlertCircle class="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{{ locationError }}</span>
        </div>

        <!-- شريط المحافظات والمدن الأكثر شيوعاً للانتقال السريع بنقرة واحدة (يظهر فقط في وضع التحديد) -->
        <div v-if="!readonly" class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span class="text-[11px] font-bold text-solar-text-muted shrink-0 ml-1">انتقال سريع:</span>
          <button
            v-for="loc in [
              popularLocations[0], // صنعاء
              popularLocations[1], // حدة
              popularLocations[2], // السبعين
              popularLocations[14], // عدن
              popularLocations[23], // تعز
              popularLocations[30], // المكلا
              popularLocations[37], // الحديدة
              popularLocations[43], // إب
              popularLocations[48], // مأرب
              popularLocations[59], // الرياض
              popularLocations[68], // جدة
              popularLocations[66], // مكة
            ]"
            :key="loc.name"
            type="button"
            @click="selectPreset(loc)"
            class="inline-flex items-center gap-1 shrink-0 rounded-full border border-solar-border-card bg-solar-bg-subtle px-3 py-1 text-[11px] font-bold text-solar-text-body hover:border-solar-yellow hover:bg-solar-yellow hover:text-solar-navy-dark transition-all cursor-pointer"
          >
            <span>{{ loc.name.split(' - ')[1] || loc.name }}</span>
          </button>
        </div>

        <!-- الخريطة التفاعلية التي تعكس الموقع المبحوث عنه مباشرة -->
        <div class="relative w-full h-[290px] sm:h-[330px] rounded-2xl overflow-hidden border border-solar-border-card shadow-inner bg-slate-100">
          <div ref="mapContainer" class="w-full h-full z-0" />

          <!-- شارة إرشادية -->
          <div v-if="!readonly" class="absolute top-3 right-3 z-10 pointer-events-none rounded-xl bg-solar-navy-dark/90 backdrop-blur-xs px-3 py-1.5 text-[11px] font-bold text-white shadow-md flex items-center gap-1.5">
            <Navigation class="size-3.5 text-solar-yellow" />
            <span>اسحب الدبوس أو انقر على أي نقطة لتثبيت موقعك</span>
          </div>
          <div v-else class="absolute top-3 right-3 z-10 pointer-events-none rounded-xl bg-solar-navy-dark/90 backdrop-blur-xs px-3 py-1.5 text-[11px] font-bold text-white shadow-md flex items-center gap-1.5">
            <ShieldCheck class="size-3.5 text-emerald-400" />
            <span>الموقع الجغرافي المعتمد للمتجر</span>
          </div>

          <!-- مبدل نمط الخريطة (شوارع / قمر صناعي) -->
          <div class="absolute top-3 left-3 z-10 flex items-center bg-solar-bg-card/95 backdrop-blur-xs rounded-xl shadow-md border border-solar-border-card p-1 gap-1 text-[11px] font-bold">
            <button
              type="button"
              @click="setTileLayer('streets')"
              :class="currentMapType === 'streets' ? 'bg-solar-navy-dark dark:bg-solar-yellow text-white dark:text-solar-navy-dark shadow-xs' : 'text-solar-text-muted hover:text-solar-navy-dark dark:hover:text-solar-yellow'"
              class="px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              خريطة الشوارع
            </button>
            <button
              type="button"
              @click="setTileLayer('satellite')"
              :class="currentMapType === 'satellite' ? 'bg-solar-navy-dark dark:bg-solar-yellow text-white dark:text-solar-navy-dark shadow-xs' : 'text-solar-text-muted hover:text-solar-navy-dark dark:hover:text-solar-yellow'"
              class="px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              قمر صناعي
            </button>
          </div>

          <!-- شارة الإحداثيات الحية -->
          <div class="absolute bottom-3 left-3 z-10 pointer-events-none rounded-lg bg-solar-bg-card/95 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold text-solar-text-heading shadow-sm border border-solar-border-card dir-ltr">
            {{ formattedCoordinates }}
          </div>
        </div>

        <!-- حقل معاينة وتعديل العنوان المختار (يظهر في وضع التحديد) -->
        <div v-if="!readonly" class="flex flex-col gap-1.5 bg-solar-bg-subtle p-3 rounded-2xl border border-solar-border-card/70">
          <label for="modal-address-input" class="text-xs font-bold text-solar-text-heading flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <MapPin class="size-3.5 text-solar-yellow" />
              <span>الموقع المحدد الذي سيتم حفظه:</span>
              <span v-if="isTranslatingAddress" class="text-[10px] text-solar-yellow dark:text-solar-yellow font-bold flex items-center gap-1 animate-pulse mr-2">
                <Loader2 class="size-3 animate-spin" />
                <span>جاري ترجمة الإحداثيات إلى نص دقيق...</span>
              </span>
            </span>
            <span class="text-[10px] font-bold text-solar-navy-dark bg-solar-yellow/25 px-2 py-0.5 rounded-full">
              {{ selectedGovernorate }}
            </span>
          </label>
          <div class="relative">
            <input
              id="modal-address-input"
              v-model="addressInput"
              type="text"
              placeholder="مثال: صنعاء - حدة - جولة الرويشان"
              class="h-10 w-full rounded-xl border border-solar-border-card bg-solar-bg-card px-3 pr-3 pl-9 text-xs font-semibold text-solar-text-heading focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all text-right"
            />
            <span v-if="isTranslatingAddress" class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Loader2 class="size-3.5 text-solar-yellow animate-spin" />
            </span>
          </div>
        </div>

        <!-- بطاقة استعراض الموقع المعتمد الثابت (تظهر في وضع العرض فقط Read-only) -->
        <div v-else class="flex flex-col gap-2.5 bg-solar-bg-subtle p-3.5 sm:p-4 rounded-2xl border border-solar-border-card/70">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-solar-text-heading flex items-center gap-1.5">
              <MapPin class="size-4 text-solar-yellow shrink-0" />
              <span>العنوان الجغرافي المعتمد للمتجر:</span>
            </span>
            <span class="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck class="size-3 text-emerald-600 dark:text-emerald-400" />
              <span>{{ selectedGovernorate }}</span>
            </span>
          </div>

          <p class="text-xs font-medium text-solar-text-body bg-solar-bg-card p-2.5 rounded-xl border border-solar-border-card/50 leading-relaxed text-right">
            {{ addressInput || currentLocation || 'الموقع محدد ومعتمد على الخريطة' }}
          </p>

          <div class="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-solar-text-muted">
            <div class="flex items-center gap-1.5">
              <span class="font-bold">الإحداثيات الجغرافية:</span>
              <span class="font-mono font-bold text-solar-text-heading dir-ltr">{{ formattedCoordinates }}</span>
            </div>

            <a
              :href="`https://www.google.com/maps/search/?api=1&query=${selectedCoords.lat},${selectedCoords.lng}`"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-[11px] font-bold text-solar-navy-dark dark:text-solar-yellow hover:underline"
            >
              <span>فتح الموقع في خرائط Google</span>
              <ExternalLink class="size-3.5" />
            </a>
          </div>
        </div>

        <!-- أزرار الإجراءات: في وضع التعديل (حفظ وإلغاء)، وفي وضع العرض (إغلاق فقط) -->
        <div v-if="!readonly" class="flex items-center gap-3 pt-1 border-t border-solar-border-card/70">
          <button
            type="button"
            @click="saveLocation"
            class="flex-1 h-12 rounded-xl bg-solar-yellow px-5 text-sm font-black text-solar-navy-dark hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <Check class="size-5 stroke-[3]" />
            <span>حفظ الموقع</span>
          </button>

          <button
            type="button"
            @click="emit('close')"
            class="h-12 px-6 rounded-xl border border-solar-border-card bg-solar-bg-subtle text-xs font-bold text-solar-text-body hover:bg-solar-bg-card transition-colors cursor-pointer"
          >
            إلغاء
          </button>
        </div>

        <div v-else class="flex items-center justify-end pt-1 border-t border-solar-border-card/70">
          <button
            type="button"
            @click="emit('close')"
            class="w-full sm:w-auto h-11 px-8 rounded-xl bg-solar-navy-dark dark:bg-solar-yellow text-white dark:text-solar-navy-dark text-xs sm:text-sm font-black hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span>إغلاق النافذة</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
:deep(.leaflet-container) {
  font-family: inherit;
  width: 100%;
  height: 100%;
  z-index: 1;
}

:deep(.leaflet-bar a) {
  background-color: #ffffff;
  color: #243B53;
  border-bottom: 1px solid #e2e8f0;
  width: 32px;
  height: 32px;
  line-height: 32px;
  border-radius: 8px;
}

:deep(.leaflet-bar) {
  border: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

:deep(.solar-custom-marker) {
  background: transparent;
  border: none;
}
</style>
