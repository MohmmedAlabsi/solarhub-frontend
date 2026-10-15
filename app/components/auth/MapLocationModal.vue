<script setup lang="ts">
import { MapPin, Map, Check, X, Search, Compass } from 'lucide-vue-next'

interface Props {
  isOpen: boolean
  currentLocation?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', location: { address: string; lat: number; lng: number }): void
}>()

const popularLocations = [
  { name: 'الرياض - حي الملز', lat: 24.6657, lng: 46.7324 },
  { name: 'الرياض - حي الصحافة', lat: 24.7932, lng: 46.6341 },
  { name: 'جدة - حي الروضة', lat: 21.5714, lng: 39.1558 },
  { name: 'الدمام - حي الشاطئ', lat: 26.4528, lng: 50.1136 },
  { name: 'المدينة المنورة - العزيزية', lat: 24.4686, lng: 39.6142 },
  { name: 'مكة المكرمة - بطحاء قريش', lat: 21.3654, lng: 39.8143 },
  { name: 'صنعاء - شارع حدة', lat: 15.3324, lng: 44.1876 },
  { name: 'عدن - المنصورة', lat: 12.8315, lng: 44.9863 },
]

const searchQuery = ref('')
const selectedLocation = ref(popularLocations[0])

const filteredLocations = computed(() => {
  if (!searchQuery.value) return popularLocations
  return popularLocations.filter(loc => loc.name.includes(searchQuery.value))
})

function chooseLocation(loc: typeof popularLocations[0]) {
  selectedLocation.value = loc
}

function confirmLocation() {
  emit('select', {
    address: selectedLocation.value.name,
    lat: selectedLocation.value.lat,
    lng: selectedLocation.value.lng,
  })
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
    <div
      class="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-solar-border-card text-right flex flex-col gap-5"
      dir="rtl"
    >
      <!-- رأس النافذة -->
      <div class="flex items-center justify-between border-b border-solar-border-card/60 pb-4">
        <div class="flex items-center gap-2.5">
          <div class="flex size-10 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark">
            <Map class="size-5" />
          </div>
          <div>
            <h3 class="text-base font-black text-solar-text-heading">تحديد الموقع الجغرافي</h3>
            <p class="text-xs text-solar-text-muted">اختر موقع مشروعك أو متجرك بدقة على الخريطة</p>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="flex size-8 items-center justify-center rounded-lg text-solar-text-muted hover:bg-solar-bg-subtle hover:text-solar-navy transition-colors"
        >
          <X class="size-5" />
        </button>
      </div>

      <!-- حقل البحث -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ابحث عن مدينة، حي، أو منطقة..."
          class="w-full h-11 rounded-xl border border-solar-border-card bg-solar-bg-subtle/50 px-3.5 pr-10 text-xs font-medium text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:bg-white focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-all"
        />
        <Search class="absolute top-1/2 -translate-y-1/2 right-3.5 size-4 text-solar-text-muted pointer-events-none" />
      </div>

      <!-- محاكاة الخريطة التفاعلية -->
      <div class="relative h-44 w-full rounded-2xl overflow-hidden border border-solar-border-card/80 bg-slate-100 flex items-center justify-center">
        <!-- خلفية شبكة الخريطة -->
        <div class="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <!-- النقطة المحددة -->
        <div class="relative z-10 flex flex-col items-center gap-1.5 animate-bounce">
          <div class="flex size-10 items-center justify-center rounded-full bg-solar-yellow text-solar-navy-dark shadow-lg ring-4 ring-white">
            <MapPin class="size-5 fill-solar-navy-dark" />
          </div>
          <span class="rounded-full bg-solar-navy-dark px-3 py-1 text-[11px] font-bold text-white shadow-md">
            {{ selectedLocation.name }}
          </span>
        </div>

        <div class="absolute bottom-2.5 right-2.5 rounded-lg bg-white/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold text-solar-text-muted shadow-sm">
          الإحداثيات: {{ selectedLocation.lat.toFixed(4) }}, {{ selectedLocation.lng.toFixed(4) }}
        </div>
      </div>

      <!-- قائمة المواقع الأكثر شيوعاً -->
      <div class="flex flex-col gap-2">
        <span class="text-xs font-bold text-solar-text-heading">المواقع المقترحة:</span>
        <div class="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pl-1">
          <button
            v-for="loc in filteredLocations"
            :key="loc.name"
            type="button"
            @click="chooseLocation(loc)"
            class="flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all text-right"
            :class="[
              selectedLocation.name === loc.name
                ? 'border-solar-yellow bg-solar-yellow/10 text-solar-navy font-bold shadow-xs'
                : 'border-solar-border-card/60 hover:bg-solar-bg-subtle text-solar-text-body'
            ]"
          >
            <span class="truncate">{{ loc.name }}</span>
            <Check v-if="selectedLocation.name === loc.name" class="size-3.5 text-solar-navy shrink-0" />
          </button>
        </div>
      </div>

      <!-- أزرار الإجراءات -->
      <div class="flex items-center gap-3 pt-2 border-t border-solar-border-card/60">
        <button
          type="button"
          @click="confirmLocation"
          class="btn-primary flex-1 h-11 text-xs font-black justify-center gap-2 shadow-sm"
        >
          <Check class="size-4" />
          <span>تأكيد الموقع المختار</span>
        </button>

        <button
          type="button"
          @click="emit('close')"
          class="btn-outline px-4 h-11 text-xs font-bold text-solar-text-body hover:bg-solar-bg-subtle"
        >
          إلغاء
        </button>
      </div>
    </div>
  </div>
</template>
