import { ref, reactive, computed, watch, onMounted } from 'vue'
import type { Engineer, EngineerFilters, EngineerSpecialty } from '../../types/engineer'

export function useEngineers() {
  const route = useRoute()
  const router = useRouter()
  const { $api } = useNuxtApp()

  const rawEngineers = ref<Engineer[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const initialQuery = Array.isArray(route.query.q) ? route.query.q[0] || '' : (route.query.q as string) || ''
  const searchDraft = ref(initialQuery)

  const filters = reactive<EngineerFilters>({
    query: initialQuery,
    specialty: (Array.isArray(route.query.specialty) ? route.query.specialty[0] : (route.query.specialty as string)) || 'all',
    city: (Array.isArray(route.query.city) ? route.query.city[0] : (route.query.city as string)) || 'all',
    minimumRating: Number(Array.isArray(route.query.rating) ? route.query.rating[0] : route.query.rating) || 0,
  })

  const currentPage = ref(1)
  const pageSize = 8
  const noticeMessage = ref('')
  let noticeTimer: ReturnType<typeof setTimeout> | undefined

  const specialtyLabels = ref<Record<string, string>>({
    all: 'كافة التخصصات',
  })

  const cities = ref<string[]>([])

  const fetchEngineers = async () => {
    isLoading.value = true
    error.value = null
    try {
      const res: any = await $api('/engineers?per_page=100')
      const list = Array.isArray(res) ? res : (res?.data || [])

      const mapped: Engineer[] = list.map((item: any) => {
        const specs = item.specializations || []
        const specialtyText = specs.map((s: any) => s.name).join('، ') || 'هندسة طاقة شمسية'
        const primarySpec = specs[0]
        const specKey = primarySpec?.id ? String(primarySpec.id) : (primarySpec?.name || 'photovoltaic')

        if (primarySpec?.name && !specialtyLabels.value[specKey]) {
          specialtyLabels.value[specKey] = primarySpec.name
        }

        const city = item.governorate_name || item.governorate || 'صنعاء'

        return {
          id: item.id,
          name: item.name || 'مهندس معتمد',
          image: item.profile_photo_path || '/images/consultant-1.png',
          specialty: specialtyText,
          specialtyKey: specKey,
          city,
          rating: item.rating_average ? Number(item.rating_average) : 5.0,
          completedProjects: item.ratings_count || (item.years_of_experience ? item.years_of_experience * 3 : 12),
          serviceTitle: primarySpec?.name || 'استشارات وحلول طاقة شمسية',
          bio: item.bio || 'مهندس واستشاري معتمد لدى منصة SolarHub لتصميم وتنفيذ أنظمة الطاقة المتجددة.',
          isVerified: item.approval_status === 'approved',
        }
      })

      rawEngineers.value = mapped

      // استخراج المحافظات الفريدة
      const uniqueCities = Array.from(new Set(mapped.map(e => e.city).filter(Boolean)))
      if (uniqueCities.length > 0) {
        cities.value = uniqueCities
      }
    } catch (err: any) {
      console.error('Failed to load engineers:', err)
      error.value = 'تعذر تحميل بيانات المهندسين من الخادم.'
    } finally {
      isLoading.value = false
    }
  }

  // فلترة المهندسين بناءً على المدخلات
  const filteredEngineers = computed(() => {
    const q = filters.query.trim().toLocaleLowerCase('ar')
    return rawEngineers.value
      .filter(engineer => filters.specialty === 'all' || engineer.specialtyKey === filters.specialty)
      .filter(engineer => filters.city === 'all' || engineer.city === filters.city)
      .filter(engineer => engineer.rating >= filters.minimumRating)
      .filter(engineer => !q || [engineer.name, engineer.specialty, engineer.serviceTitle, engineer.bio, engineer.city].some(val => val.toLocaleLowerCase('ar').includes(q)))
  })

  const resultCount = computed(() => filteredEngineers.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(resultCount.value / pageSize)))

  const displayedEngineers = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return filteredEngineers.value.slice(start, start + pageSize)
  })

  const directoryQuery = computed(() => ({
    ...(filters.query ? { q: filters.query } : {}),
    ...(filters.specialty !== 'all' ? { specialty: filters.specialty } : {}),
    ...(filters.city !== 'all' ? { city: filters.city } : {}),
    ...(filters.minimumRating ? { rating: String(filters.minimumRating) } : {}),
  }))

  function applySearch() {
    filters.query = searchDraft.value
    currentPage.value = 1
  }

  function resetFilters() {
    searchDraft.value = ''
    filters.query = ''
    filters.specialty = 'all'
    filters.city = 'all'
    filters.minimumRating = 0
    currentPage.value = 1
  }

  function setPage(page: number) {
    currentPage.value = Math.min(Math.max(page, 1), totalPages.value)
  }

  function showTemporaryNotice(message: string) {
    noticeMessage.value = message
    if (noticeTimer) clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => { noticeMessage.value = '' }, 3500)
  }

  function requestConsultation(engineer: Engineer) {
    router.push({
      path: '/customer/services/new',
      query: { engineerId: String(engineer.id) },
    })
  }

  onMounted(() => {
    fetchEngineers()
  })

  return {
    searchDraft,
    filters,
    displayedEngineers,
    resultCount,
    currentPage,
    totalPages,
    cities,
    specialtyLabels,
    directoryQuery,
    noticeMessage,
    isLoading,
    error,
    fetchEngineers,
    applySearch,
    resetFilters,
    setPage,
    requestConsultation,
  }
}
