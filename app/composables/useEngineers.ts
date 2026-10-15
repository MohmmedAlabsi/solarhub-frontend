import type { Engineer, EngineerFilters, EngineerSpecialty } from '../../types/engineer'

export const engineersData: Engineer[] = [
  { id: 1, name: 'م. أحمد الشمري', image: '/images/consultant-1.png', specialty: 'هندسة نظم كهروضوئية وتصميم محطات', specialtyKey: 'photovoltaic', city: 'الرياض', rating: 4.9, completedProjects: 34, serviceTitle: 'تصميم أنظمة الطاقة الشمسية', bio: 'متخصص في دراسات الجدوى وتصميم أنظمة الطاقة الشمسية المتصلة بالشبكة وحسابات الأحمال.', isVerified: true },
  { id: 2, name: 'م. سارة القحطاني', image: '/images/consultant-2.png', specialty: 'استشارية طاقة زراعية وضخ مياه', specialtyKey: 'agricultural', city: 'القصيم', rating: 5, completedProjects: 41, serviceTitle: 'أنظمة الضخ والري الشمسي', bio: 'خبرة في تصميم وتشغيل منظومات الضخ الزراعي بالطاقة المتجددة والموازنة بين الكفاءة وتوفير الوقود.', isVerified: true },
  { id: 3, name: 'م. خالد الدوسري', image: '/images/consultant-3.png', specialty: 'أنظمة هجينة وبطاريات تخزين صناعية', specialtyKey: 'storage', city: 'الدمام', rating: 4.95, completedProjects: 68, serviceTitle: 'حلول التخزين والطاقة الاحتياطية', bio: 'استشاري أنظمة التخزين الكهروكيميائي واختبارات الحماية للمنشآت ومزامنة المولدات مع الطاقة الشمسية.', isVerified: true },
  { id: 4, name: 'م. طارق العتيبي', image: '/images/consultant-1.png', specialty: 'فحص وصيانة وتأهيل الأنظمة', specialtyKey: 'maintenance', city: 'جدة', rating: 4.8, completedProjects: 52, serviceTitle: 'الفحص الحراري ورفع الكفاءة', bio: 'فحص كفاءة الألواح بالحرارة والتصوير الحراري واختبار العزل والحماية للشبكات التجارية والصناعية.', isVerified: true },
]

const specialtyLabels: Record<EngineerSpecialty, string> = {
  photovoltaic: 'الأنظمة الكهروضوئية', agricultural: 'الطاقة الزراعية', storage: 'التخزين والأنظمة الهجينة', maintenance: 'الفحص والصيانة',
}

function queryString(value: string | null | Array<string | null> | undefined) { return Array.isArray(value) ? value[0] ?? '' : value ?? '' }
function querySpecialty(value: string): EngineerFilters['specialty'] { return value === 'photovoltaic' || value === 'agricultural' || value === 'storage' || value === 'maintenance' ? value : 'all' }

export function useEngineers() {
  const route = useRoute()
  const initialQuery = queryString(route.query.q)
  const searchDraft = ref(initialQuery)
  const filters = reactive<EngineerFilters>({
    query: initialQuery,
    specialty: querySpecialty(queryString(route.query.specialty)),
    city: queryString(route.query.city) || 'all',
    minimumRating: Number(queryString(route.query.rating)) || 0,
  })
  const currentPage = ref(1)
  const totalDirectoryCount = 184
  const totalPages = 16
  const noticeMessage = ref('')
  let noticeTimer: ReturnType<typeof setTimeout> | undefined

  const filteredEngineers = computed(() => {
    const query = filters.query.trim().toLocaleLowerCase('ar')
    return engineersData
      .filter(engineer => filters.specialty === 'all' || engineer.specialtyKey === filters.specialty)
      .filter(engineer => filters.city === 'all' || engineer.city === filters.city)
      .filter(engineer => engineer.rating >= filters.minimumRating)
      .filter(engineer => !query || [engineer.name, engineer.specialty, engineer.serviceTitle, engineer.bio, engineer.city].some(value => value.toLocaleLowerCase('ar').includes(query)))
  })
  const resultCount = computed(() => !filters.query && filters.specialty === 'all' && filters.city === 'all' && filters.minimumRating === 0 ? totalDirectoryCount : filteredEngineers.value.length)
  const cities = [...new Set(engineersData.map(engineer => engineer.city))]
  const directoryQuery = computed(() => ({
    ...(filters.query ? { q: filters.query } : {}),
    ...(filters.specialty !== 'all' ? { specialty: filters.specialty } : {}),
    ...(filters.city !== 'all' ? { city: filters.city } : {}),
    ...(filters.minimumRating ? { rating: String(filters.minimumRating) } : {}),
  }))

  function applySearch() { filters.query = searchDraft.value; currentPage.value = 1 }
  function resetFilters() { searchDraft.value = ''; Object.assign(filters, { query: '', specialty: 'all', city: 'all', minimumRating: 0 }); currentPage.value = 1 }
  function setPage(page: number) { currentPage.value = Math.min(Math.max(page, 1), totalPages) }
  function showTemporaryNotice(message: string) {
    noticeMessage.value = message
    if (noticeTimer) clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => { noticeMessage.value = '' }, 3500)
  }
  function requestConsultation(engineer: Engineer) { showTemporaryNotice(`طلب الاستشارة مع ${engineer.name} سيتاح عند ربط خدمة الطلبات.`) }

  onBeforeUnmount(() => { if (noticeTimer) clearTimeout(noticeTimer) })
  watch(() => [filters.specialty, filters.city, filters.minimumRating], () => { currentPage.value = 1 })

  return { searchDraft, filters, displayedEngineers: filteredEngineers, resultCount, currentPage, totalPages, cities, specialtyLabels, directoryQuery, noticeMessage, applySearch, resetFilters, setPage, requestConsultation }
}