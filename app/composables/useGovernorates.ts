export interface GovernorateItem {
  id: number
  name_ar: string
  name_en?: string
  lat: number
  lng: number
}

// Complete list of Yemeni Governorates matching DB schema and user requirements
export const yemeniGovernorates: GovernorateItem[] = [
  { id: 1, name_ar: 'صنعاء', lat: 15.3694, lng: 44.1910 },
  { id: 2, name_ar: 'عدن', lat: 12.7855, lng: 45.0187 },
  { id: 3, name_ar: 'تعز', lat: 13.5776, lng: 44.0185 },
  { id: 4, name_ar: 'الحديدة', lat: 14.7978, lng: 42.9545 },
  { id: 5, name_ar: 'إب', lat: 13.9667, lng: 44.1833 },
  { id: 6, name_ar: 'ذمار', lat: 14.5427, lng: 44.4051 },
  { id: 7, name_ar: 'حضرموت', lat: 14.5425, lng: 49.1242 },
  { id: 8, name_ar: 'شبوة', lat: 14.5377, lng: 46.8319 },
  { id: 9, name_ar: 'مأرب', lat: 15.4608, lng: 45.3258 },
  { id: 10, name_ar: 'حجة', lat: 15.6943, lng: 43.6025 },
  { id: 11, name_ar: 'صعدة', lat: 16.9402, lng: 43.7640 },
  { id: 12, name_ar: 'المحويت', lat: 15.4700, lng: 43.5400 },
  { id: 13, name_ar: 'ريمة', lat: 14.6300, lng: 43.7100 },
  { id: 14, name_ar: 'الجوف', lat: 16.5000, lng: 45.1000 },
  { id: 15, name_ar: 'المهرة', lat: 16.2079, lng: 52.1760 },
  { id: 16, name_ar: 'أبين', lat: 13.1287, lng: 45.3800 },
  { id: 17, name_ar: 'لحج', lat: 13.0583, lng: 44.8828 },
  { id: 18, name_ar: 'الضالع', lat: 13.6957, lng: 44.7314 },
  { id: 19, name_ar: 'البيضاء', lat: 13.9852, lng: 45.5727 },
  { id: 20, name_ar: 'عمران', lat: 15.6594, lng: 43.9442 },
  { id: 21, name_ar: 'سقطرى', lat: 12.6500, lng: 54.0167 },
  { id: 22, name_ar: 'أمانة العاصمة', lat: 15.3550, lng: 44.2070 },
]

export const useGovernorates = () => {
  const { $api } = useNuxtApp()
  const governorates = ref<GovernorateItem[]>(yemeniGovernorates)
  const isLoading = ref(false)

  const loadGovernorates = async () => {
    isLoading.value = true
    try {
      const res = await $api<any>('/governorates')
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        governorates.value = res.data.map((item: any) => {
          const fallback = yemeniGovernorates.find(
            g => g.id === item.id || g.name_ar === item.name_ar
          )
          return {
            id: item.id,
            name_ar: item.name_ar || fallback?.name_ar || '',
            name_en: item.name_en || fallback?.name_en || '',
            lat: item.lat || fallback?.lat || 15.3694,
            lng: item.lng || fallback?.lng || 44.1910,
          }
        })
      }
    } catch {
      // Fallback seamlessly to local list
      governorates.value = yemeniGovernorates
    } finally {
      isLoading.value = false
    }
  }

  const getGovernorateIdByName = (name: string): number | null => {
    if (!name) return null
    const cleanName = name.trim()
    const match = governorates.value.find(
      g => g.name_ar === cleanName || cleanName.includes(g.name_ar) || g.name_ar.includes(cleanName)
    )
    return match ? match.id : null
  }

  const getGovernorateCoords = (name: string): { lat: number; lng: number } => {
    if (!name) return { lat: 15.3694, lng: 44.1910 }
    const cleanName = name.trim()
    const match = governorates.value.find(
      g => g.name_ar === cleanName || cleanName.includes(g.name_ar) || g.name_ar.includes(cleanName)
    )
    return match ? { lat: match.lat, lng: match.lng } : { lat: 15.3694, lng: 44.1910 }
  }

  return {
    governorates,
    isLoading,
    loadGovernorates,
    getGovernorateIdByName,
    getGovernorateCoords,
  }
}
