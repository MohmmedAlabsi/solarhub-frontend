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
  CheckCircle2
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
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  currentLocation: '',
  initialCoordinates: () => ({ lat: 15.3694, lng: 44.1910 }), // Default Sana'a
  title: 'تحديد الموقع الجغرافي',
  subtitle: 'ابحث عن منطقتك ليعكس موقعها مباشرة على الخريطة التفاعلية، ثم اضغط حفظ'
})

const emit = defineEmits<{
  close: []
  select: [location: LocationData]
}>()

// Comprehensive Offline-first Location Database for Yemen & Saudi Arabia
// Designed for instant 0ms response without relying on blocked or slow external APIs
const popularLocations = [
  // Yemen - Sana'a & Districts
  { name: 'صنعاء - مركز المحافظة', governorate: 'صنعاء', lat: 15.3694, lng: 44.1910, aliases: ['صنعاء', 'امانه العاصمة', 'أمانة العاصمة'] },
  { name: 'صنعاء - حدة', governorate: 'صنعاء', lat: 15.3120, lng: 44.1960, aliases: ['حدة', 'شارع حدة', 'حي حدة'] },
  { name: 'صنعاء - السبعين', governorate: 'صنعاء', lat: 15.3280, lng: 44.2050, aliases: ['السبعين', 'ميدان السبعين', 'حديقة السبعين'] },
  { name: 'صنعاء - التحرير', governorate: 'صنعاء', lat: 15.3550, lng: 44.2070, aliases: ['التحرير', 'ميدان التحرير'] },
  { name: 'صنعاء - الصافية', governorate: 'صنعاء', lat: 15.3420, lng: 44.2180, aliases: ['الصافية', 'حي الصافية'] },
  { name: 'صنعاء - شملان', governorate: 'صنعاء', lat: 15.4050, lng: 44.1480, aliases: ['شملان', 'شارع شملan'] },
  { name: 'صنعاء - الروضة', governorate: 'صنعاء', lat: 15.4350, lng: 44.2250, aliases: ['الروضة', 'حي الروضة'] },
  { name: 'صنعاء - الحصبة', governorate: 'صنعاء', lat: 15.3780, lng: 44.2000, aliases: ['الحصبة', 'جولة الحصبة'] },
  { name: 'صنعاء - شعوب', governorate: 'صنعاء', lat: 15.3750, lng: 44.2250, aliases: ['شعوب', 'باب شعوب'] },
  { name: 'صنعاء - دار سلم', governorate: 'صنعاء', lat: 15.2750, lng: 44.2250, aliases: ['دار سلم', 'جولة دار سلم'] },
  { name: 'صنعاء - مذبح', governorate: 'صنعاء', lat: 15.3720, lng: 44.1620, aliases: ['مذبح', 'شارع الثلاثين'] },
  { name: 'صنعاء - عصر', governorate: 'صنعاء', lat: 15.3390, lng: 44.1700, aliases: ['عصر', 'جبل عصر'] },
  { name: 'صنعاء - معين', governorate: 'صنعاء', lat: 15.3600, lng: 44.1750, aliases: ['معين', 'حي معين', 'شارع هايل'] },
  { name: 'صنعاء - سعوان', governorate: 'صنعاء', lat: 15.3700, lng: 44.2500, aliases: ['سعوان', 'مدينة سعوان'] },

  // Yemen - Aden & Districts
  { name: 'عدن - مركز المدينة', governorate: 'عدن', lat: 12.7855, lng: 45.0187, aliases: ['عدن'] },
  { name: 'عدن - المعلا', governorate: 'عدن', lat: 12.7850, lng: 45.0080, aliases: ['المعلا', 'شارع مدرم'] },
  { name: 'عدن - كريتر', governorate: 'عدن', lat: 12.7750, lng: 45.0350, aliases: ['كريتر', 'صيرة'] },
  { name: 'عدن - التواهي', governorate: 'عدن', lat: 12.7830, lng: 44.9850, aliases: ['التواهي', 'القلوعة'] },
  { name: 'عدن - خور مكسر', governorate: 'عدن', lat: 12.8050, lng: 45.0380, aliases: ['خور مكسر', 'ساحل أبين'] },
  { name: 'عدن - المنصورة', governorate: 'عدن', lat: 12.8550, lng: 44.9920, aliases: ['المنصورة', 'كابوتا'] },
  { name: 'عدن - الشيخ عثمان', governorate: 'عدن', lat: 12.8680, lng: 45.0020, aliases: ['الشيخ عثمان', 'الممدارة'] },
  { name: 'عدن - البريقة', governorate: 'عدن', lat: 12.7350, lng: 44.8750, aliases: ['البريقة', 'صلاح الدين', 'إنماء'] },
  { name: 'عدن - دار سعد', governorate: 'عدن', lat: 12.8880, lng: 45.0150, aliases: ['دار سعد', 'بئر فضل'] },

  // Yemen - Taiz
  { name: 'تعز - مركز المحافظة', governorate: 'تعز', lat: 13.5776, lng: 44.0185, aliases: ['تعز'] },
  { name: 'تعز - شارع جمال', governorate: 'تعز', lat: 13.5790, lng: 44.0150, aliases: ['شارع جمال', 'وسط تعز'] },
  { name: 'تعز - الحوبان', governorate: 'تعز', lat: 13.6200, lng: 44.0800, aliases: ['الحوبان', 'مفرق ماوية'] },
  { name: 'تعز - المظفر', governorate: 'تعز', lat: 13.5750, lng: 44.0100, aliases: ['المظفر', 'حي المظفر'] },
  { name: 'تعز - القاهرة', governorate: 'تعز', lat: 13.5850, lng: 44.0250, aliases: ['القاهرة', 'قلعة القاهرة'] },
  { name: 'تعز - بير باشا', governorate: 'تعز', lat: 13.5720, lng: 43.9850, aliases: ['بير باشا', 'جامعة تعز'] },
  { name: 'تعز - التربة', governorate: 'تعز', lat: 13.2180, lng: 44.1350, aliases: ['التربة', 'الشمايتين'] },

  // Yemen - Hadhramaut
  { name: 'حضرموت - المكلا', governorate: 'حضرموت', lat: 14.5425, lng: 49.1242, aliases: ['المكلا', 'حضرموت'] },
  { name: 'حضرموت - فوة', governorate: 'حضرموت', lat: 14.5200, lng: 49.0600, aliases: ['فوة', 'المساكن', 'ابن سيناء'] },
  { name: 'حضرموت - الديس', governorate: 'حضرموت', lat: 14.5550, lng: 49.1450, aliases: ['الديس', 'حي الديس'] },
  { name: 'حضرموت - الشرج', governorate: 'حضرموت', lat: 14.5380, lng: 49.1180, aliases: ['الشرج', 'سوق الشرج'] },
  { name: 'حضرموت - سيئون', governorate: 'حضرموت', lat: 15.9432, lng: 48.7871, aliases: ['سيئون', 'وادي حضرموت'] },
  { name: 'حضرموت - تريم', governorate: 'حضرموت', lat: 16.0550, lng: 48.9950, aliases: ['تريم', 'الغناء'] },
  { name: 'حضرموت - الشحر', governorate: 'حضرموت', lat: 14.7600, lng: 49.6050, aliases: ['الشحر', 'سعاد'] },

  // Yemen - Al Hudaydah
  { name: 'الحديدة - مركز المحافظة', governorate: 'الحديدة', lat: 14.7978, lng: 42.9545, aliases: ['الحديدة'] },
  { name: 'الحديدة - الميناء', governorate: 'الحديدة', lat: 14.8050, lng: 42.9450, aliases: ['الميناء', 'ميناء الحديدة'] },
  { name: 'الحديدة - الحوك', governorate: 'الحديدة', lat: 14.7750, lng: 42.9600, aliases: ['الحوك', 'حي الحوك'] },
  { name: 'الحديدة - الحالي', governorate: 'الحديدة', lat: 14.8150, lng: 42.9750, aliases: ['الحالي', 'حي الحالي'] },
  { name: 'الحديدة - باجل', governorate: 'الحديدة', lat: 15.0580, lng: 43.2850, aliases: ['باجل'] },
  { name: 'الحديدة - زبيد', governorate: 'الحديدة', lat: 14.1950, lng: 43.3150, aliases: ['زبيد'] },

  // Yemen - Other Governorates
  { name: 'إب - مركز المحافظة', governorate: 'إب', lat: 13.9667, lng: 44.1833, aliases: ['إب', 'اب'] },
  { name: 'إب - جبلة', governorate: 'إب', lat: 13.9220, lng: 44.1480, aliases: ['جبلة'] },
  { name: 'إب - يريم', governorate: 'إب', lat: 14.2980, lng: 44.3800, aliases: ['يريم', 'كتاب'] },
  { name: 'ذمار - مركز المحافظة', governorate: 'ذمار', lat: 14.5427, lng: 44.4051, aliases: ['ذمار'] },
  { name: 'ذمار - معبر', governorate: 'ذمار', lat: 14.7950, lng: 44.2950, aliases: ['معبر', 'جهران'] },
  { name: 'مأرب - مركز المحافظة', governorate: 'مأرب', lat: 15.4608, lng: 45.3258, aliases: ['مأرب', 'مارب'] },
  { name: 'صعدة - مركز المحافظة', governorate: 'صعدة', lat: 16.9402, lng: 43.7640, aliases: ['صعدة', 'صعده'] },
  { name: 'حجة - مركز المحافظة', governorate: 'حجة', lat: 15.6943, lng: 43.6025, aliases: ['حجة', 'حجه', 'عبس'] },
  { name: 'البيضاء - مركز المحافظة', governorate: 'البيضاء', lat: 13.9852, lng: 45.5727, aliases: ['البيضاء', 'رداع'] },
  { name: 'لحج - الحوطة', governorate: 'لحج', lat: 13.0583, lng: 44.8828, aliases: ['لحج', 'الحوطة', 'صبر'] },
  { name: 'أبين - زنجبار', governorate: 'أبين', lat: 13.1287, lng: 45.3800, aliases: ['أبين', 'ابين', 'زنجبار', 'جعار'] },
  { name: 'المهرة - الغيضة', governorate: 'المهرة', lat: 16.2079, lng: 52.1760, aliases: ['المهرة', 'المهره', 'الغيضة'] },
  { name: 'شبوة - عتق', governorate: 'شبوة', lat: 14.5377, lng: 46.8319, aliases: ['شبوة', 'شبوه', 'عتق'] },
  { name: 'الضالع - مركز المحافظة', governorate: 'الضالع', lat: 13.6957, lng: 44.7314, aliases: ['الضالع', 'دمت', 'قعطبة'] },
  { name: 'عمران - مركز المحافظة', governorate: 'عمران', lat: 15.6594, lng: 43.9442, aliases: ['عمران', 'خمر', 'ريدة'] },
  { name: 'سقطرى - حديبو', governorate: 'سقطرى', lat: 12.6500, lng: 54.0167, aliases: ['سقطرى', 'حديبو', 'قلنسية'] },

  // Saudi Arabia - Riyadh & Districts
  { name: 'الرياض - مركز المدينة', governorate: 'الرياض', lat: 24.7136, lng: 46.6753, aliases: ['الرياض'] },
  { name: 'الرياض - العليا', governorate: 'الرياض', lat: 24.7050, lng: 46.6800, aliases: ['العليا', 'طريق الملك فهد'] },
  { name: 'الرياض - الملز', governorate: 'الرياض', lat: 24.6650, lng: 46.7250, aliases: ['الملز', 'شارع الستين'] },
  { name: 'الرياض - النسيم', governorate: 'الرياض', lat: 24.7300, lng: 46.8200, aliases: ['النسيم'] },
  { name: 'الرياض - الملقا', governorate: 'الرياض', lat: 24.8050, lng: 46.6150, aliases: ['الملقا', 'شمال الرياض'] },
  { name: 'الرياض - النرجس', governorate: 'الرياض', lat: 24.8450, lng: 46.6600, aliases: ['النرجس'] },
  { name: 'الرياض - الياسمين', governorate: 'الرياض', lat: 24.8250, lng: 46.6450, aliases: ['الياسمين'] },

  // Saudi Arabia - Makkah & Jeddah & Taif
  { name: 'مكة المكرمة - الحرم', governorate: 'مكة المكرمة', lat: 21.3891, lng: 39.8579, aliases: ['مكة', 'مكه', 'مكة المكرمة'] },
  { name: 'مكة المكرمة - العزيزية', governorate: 'مكة المكرمة', lat: 21.4050, lng: 39.8700, aliases: ['العزيزية بمكة'] },
  { name: 'جدة - مركز المدينة', governorate: 'مكة المكرمة', lat: 21.5433, lng: 39.1728, aliases: ['جدة', 'جده'] },
  { name: 'جدة - البلد', governorate: 'مكة المكرمة', lat: 21.4850, lng: 39.1850, aliases: ['البلد بجدة', 'المنطقة التاريخية'] },
  { name: 'جدة - الحمراء', governorate: 'مكة المكرمة', lat: 21.5150, lng: 39.1550, aliases: ['الحمراء', 'كورنيش جدة'] },
  { name: 'جدة - الروضة', governorate: 'مكة المكرمة', lat: 21.5600, lng: 39.1500, aliases: ['الروضة بجدة'] },
  { name: 'جدة - الصفا', governorate: 'مكة المكرمة', lat: 21.5850, lng: 39.2000, aliases: ['الصفا بجدة'] },
  { name: 'الطائف - مركز المدينة', governorate: 'مكة المكرمة', lat: 21.2854, lng: 40.4244, aliases: ['الطائف', 'الهدا', 'الشفا الطائف'] },

  // Saudi Arabia - Madinah & Eastern & Others
  { name: 'المدينة المنورة - الحرم النبوي', governorate: 'المدينة المنورة', lat: 24.5247, lng: 39.5692, aliases: ['المدينة', 'المدينه', 'المدينة المنورة'] },
  { name: 'الدمام - مركز المدينة', governorate: 'المنطقة الشرقية', lat: 26.4207, lng: 50.0888, aliases: ['الدمام', 'الشرقية'] },
  { name: 'الخبر - كورنيش الخبر', governorate: 'المنطقة الشرقية', lat: 26.2818, lng: 50.2084, aliases: ['الخبر', 'العقربية'] },
  { name: 'الهفوف - الأحساء', governorate: 'المنطقة الشرقية', lat: 25.3646, lng: 49.5883, aliases: ['الأحساء', 'الاحساء', 'الهفوف', 'المبرز'] },
  { name: 'الجبيل - الجبيل الصناعية', governorate: 'المنطقة الشرقية', lat: 27.0174, lng: 49.6582, aliases: ['الجبيل'] },
  { name: 'القصيم - بريدة', governorate: 'القصيم', lat: 26.3260, lng: 43.9750, aliases: ['القصيم', 'بريدة', 'بريده'] },
  { name: 'القصيم - عنيزة', governorate: 'القصيم', lat: 26.0843, lng: 43.9936, aliases: ['عنيزة', 'عنيزه'] },
  { name: 'عسير - أبها', governorate: 'عسير', lat: 18.2164, lng: 42.5053, aliases: ['عسير', 'أبها', 'ابها'] },
  { name: 'عسير - خميس مشيط', governorate: 'عسير', lat: 18.3000, lng: 42.7333, aliases: ['خميس مشيط'] },
  { name: 'تبوك - مركز المدينة', governorate: 'تبوك', lat: 28.3835, lng: 36.5662, aliases: ['تبوك'] },
  { name: 'حائل - مركز المدينة', governorate: 'حائل', lat: 27.5114, lng: 41.7208, aliases: ['حائل', 'حايل'] },
  { name: 'جازان - مركز المدينة', governorate: 'جازان', lat: 16.8892, lng: 42.5706, aliases: ['جازان', 'جيزان'] },
  { name: 'نجران - مركز المدينة', governorate: 'نجران', lat: 17.4924, lng: 44.1277, aliases: ['نجران'] },
  { name: 'ينبع - ينبع الصناعية', governorate: 'المدينة المنورة', lat: 24.0924, lng: 38.0618, aliases: ['ينبع', 'ينبع البحر'] },
]

// State
const searchQuery = ref('')
const searchResults = ref<Array<{ display_name: string; lat: number; lng: number; governorate: string }>>([])
const isSearching = ref(false)
const isLocatingUser = ref(false)
const locationError = ref('')
const successNotice = ref('')
const addressInput = ref(props.currentLocation || '')
const selectedCoords = ref<{ lat: number; lng: number }>({
  lat: props.initialCoordinates?.lat || 15.3694,
  lng: props.initialCoordinates?.lng || 44.1910,
})
const selectedGovernorate = ref('صنعاء')

// Map elements
const mapContainer = ref<HTMLElement | null>(null)
let leafletMap: any = null
let mapMarker: any = null
let L: any = null

const formattedCoordinates = computed(() => {
  return `${selectedCoords.value.lat.toFixed(5)}, ${selectedCoords.value.lng.toFixed(5)}`
})

// Match best initial coordinates based on location name or initial prop
function syncInitialLocation() {
  if (props.initialCoordinates && props.initialCoordinates.lat && props.initialCoordinates.lng) {
    selectedCoords.value = {
      lat: props.initialCoordinates.lat,
      lng: props.initialCoordinates.lng,
    }
  }

  if (props.currentLocation) {
    addressInput.value = props.currentLocation
    const match = findLocalMatch(props.currentLocation)
    if (match) {
      selectedCoords.value = { lat: match.lat, lng: match.lng }
      selectedGovernorate.value = match.governorate
    }
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

    // Ultra-reliable CartoDB Voyager Tiles (tested 200 OK without regional blocking)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '© OpenStreetMap contributors, © CARTO',
    }).addTo(leafletMap)

    // SolarHub Brand Marker (Solar Navy #243B53 and Solar Yellow #F2B705)
    const customIcon = L.divIcon({
      className: 'solar-custom-marker',
      html: `
        <div style="position: relative; width: 44px; height: 54px; transform: translate(-50%, -100%); cursor: grab;">
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

    mapMarker = L.marker([lat, lng], {
      icon: customIcon,
      draggable: true,
      autoPan: true,
    }).addTo(leafletMap)

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

// Update position safely and calculate address
function updatePosition(lat: number, lng: number) {
  selectedCoords.value = { lat, lng }
  locationError.value = ''

  const nearest = findNearestPopular(lat, lng)
  if (nearest) {
    selectedGovernorate.value = nearest.governorate
    addressInput.value = `${nearest.governorate} - ${nearest.name} (${lat.toFixed(4)}, ${lng.toFixed(4)})`
  } else {
    addressInput.value = `موقع محدد على الخريطة (${lat.toFixed(4)}, ${lng.toFixed(4)})`
  }
  showNotice(`تم تثبيت الموقع عند الإحداثيات: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
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
        class="relative w-full max-w-2xl max-h-[92vh] rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-solar-border-card text-right flex flex-col gap-4 overflow-y-auto"
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
            class="flex size-9 items-center justify-center rounded-xl text-solar-text-muted hover:bg-slate-100 hover:text-solar-navy-dark transition-colors cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X class="size-5" />
          </button>
        </div>

        <!-- فورم مربع نص للبحث وعكس الموقع على الخريطة التفاعلية -->
        <form @submit.prevent="executeSearch()" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 relative">
          <!-- مربع نص للبحث -->
          <div class="relative flex-1">
            <input
              v-model="searchQuery"
              @input="handleSearchInput"
              @keydown.enter.prevent="executeSearch()"
              type="text"
              placeholder="اكتب اسم المنطقة، الحي، أو المدينة (مثال: صنعاء، حدة، السبعين، المكلا، الرياض)..."
              class="w-full h-11 rounded-xl border border-solar-border-card bg-slate-50/90 px-3.5 pr-10 pl-9 text-xs font-semibold text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:bg-white focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all text-right"
            />
            <Search class="absolute top-1/2 -translate-y-1/2 right-3.5 size-4 text-solar-text-muted pointer-events-none" />
            <span v-if="isSearching" class="absolute top-1/2 -translate-y-1/2 left-3 size-4 text-solar-text-muted animate-spin">
              <Loader2 class="size-4" />
            </span>

            <!-- قائمة اقتراحات البحث التلقائية المنسدلة -->
            <div
              v-if="searchResults.length > 0"
              class="absolute top-full right-0 left-0 mt-1.5 z-50 rounded-2xl border border-solar-border-card bg-white p-1.5 shadow-xl max-h-56 overflow-y-auto"
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
            class="flex items-center justify-center gap-1.5 h-11 px-4 sm:px-5 rounded-xl bg-[#1b2d42] text-white text-xs font-bold hover:bg-solar-navy-dark transition-all shrink-0 cursor-pointer disabled:opacity-50 shadow-xs active:scale-[0.99]"
          >
            <Search class="size-3.5 text-solar-yellow" />
            <span>بحث وعكس على الخريطة</span>
          </button>

          <!-- زر تحديد موقعي الحالي عبر الـ GPS -->
          <button
            type="button"
            @click="locateUser"
            :disabled="isLocatingUser"
            class="flex items-center justify-center gap-1.5 h-11 px-3.5 rounded-xl border border-solar-border-card bg-white text-xs font-bold text-solar-navy-dark hover:border-solar-navy hover:bg-slate-50 transition-all shrink-0 cursor-pointer disabled:opacity-50 shadow-xs active:scale-[0.99]"
            title="تحديد موقعي الحالي من الجهاز"
          >
            <Loader2 v-if="isLocatingUser" class="size-4 animate-spin text-solar-yellow" />
            <Crosshair v-else class="size-4 text-solar-navy-dark" />
            <span class="hidden sm:inline">{{ isLocatingUser ? 'جاري التحديد...' : 'موقعي الآن' }}</span>
          </button>
        </form>

        <!-- تنبيه في حال وجود إشعار نجاح أو خطأ -->
        <div
          v-if="successNotice"
          class="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800 animate-in fade-in duration-150"
        >
          <CheckCircle2 class="size-4 shrink-0 text-emerald-600" />
          <span>{{ successNotice }}</span>
        </div>

        <div
          v-if="locationError"
          class="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs font-semibold text-amber-800 animate-in fade-in duration-150"
        >
          <AlertCircle class="size-4 shrink-0 text-amber-600" />
          <span>{{ locationError }}</span>
        </div>

        <!-- شريط المحافظات والمدن الأكثر شيوعاً للانتقال السريع بنقرة واحدة -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
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
            class="inline-flex items-center gap-1 shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-solar-text-body hover:border-solar-yellow hover:bg-solar-yellow/20 hover:text-solar-navy-dark transition-all cursor-pointer"
          >
            <span>{{ loc.name.split(' - ')[1] || loc.name }}</span>
          </button>
        </div>

        <!-- الخريطة التفاعلية التي تعكس الموقع المبحوث عنه مباشرة -->
        <div class="relative w-full h-[290px] sm:h-[330px] rounded-2xl overflow-hidden border border-solar-border-card shadow-inner bg-slate-100">
          <div ref="mapContainer" class="w-full h-full z-0" />

          <!-- شارة إرشادية لتحريك الدبوس -->
          <div class="absolute top-3 right-3 z-10 pointer-events-none rounded-xl bg-[#1b2d42]/90 backdrop-blur-xs px-3 py-1.5 text-[11px] font-bold text-white shadow-md flex items-center gap-1.5">
            <Navigation class="size-3.5 text-solar-yellow" />
            <span>اسحب الدبوس أو انقر على أي نقطة لتثبيت موقعك</span>
          </div>

          <!-- شارة الإحداثيات الحية -->
          <div class="absolute bottom-3 left-3 z-10 pointer-events-none rounded-lg bg-white/95 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold text-solar-navy-dark shadow-sm border border-slate-200 dir-ltr">
            {{ formattedCoordinates }}
          </div>
        </div>

        <!-- حقل معاينة وتعديل العنوان المختار -->
        <div class="flex flex-col gap-1.5 bg-slate-50 p-3 rounded-2xl border border-solar-border-card/70">
          <label for="modal-address-input" class="text-xs font-bold text-solar-text-heading flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <MapPin class="size-3.5 text-solar-yellow" />
              <span>الموقع المحدد الذي سيتم حفظه:</span>
            </span>
            <span class="text-[10px] font-bold text-solar-navy-dark bg-solar-yellow/25 px-2 py-0.5 rounded-full">
              {{ selectedGovernorate }}
            </span>
          </label>
          <input
            id="modal-address-input"
            v-model="addressInput"
            type="text"
            placeholder="مثال: صنعاء - حدة - جولة الرويشان"
            class="h-10 w-full rounded-xl border border-solar-border-card bg-white px-3 text-xs font-semibold text-solar-navy-dark focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all text-right"
          />
        </div>

        <!-- أزرار الإجراءات: زر حفظ الموقع وزر إلغاء -->
        <div class="flex items-center gap-3 pt-1 border-t border-solar-border-card/70">
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
            class="h-12 px-6 rounded-xl border border-solar-border-card bg-white text-xs font-bold text-solar-text-body hover:bg-slate-50 transition-colors cursor-pointer"
          >
            إلغاء
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
