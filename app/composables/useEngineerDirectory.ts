import type {
  Engineer,
  EngineerFilters,
} from '~~/types/engineer'

import { fetchAllApiRows } from '~/utils/apiCollection'

interface EngineerApiRow {
  id: number
  name?: string | null
  bio?: string | null
  profile_photo_path?: string | null
  governorate?: string | null
  governorate_name?: string | null
  approval_status?: string
  rating_average?: number | string | null
  specializations?: Array<{
    id: number
    name: string
  }>
}

interface EngineersApiResponse {
  status: string
  message?: string
  data: EngineerApiRow[]
}

function queryText(value: unknown): string {
  const firstValue = Array.isArray(value) ? value[0] : value

  return typeof firstValue === 'string' ? firstValue : ''
}

function imageUrl(value?: string | null): string {
  if (!value) return ''

  try {
    const url = new URL(value)

    return ['http:', 'https:'].includes(url.protocol)
      ? url.href
      : ''
  } catch {
    return ''
  }
}

function mapEngineer(row: EngineerApiRow): Engineer {
  const specializations = row.specializations || []

  const rating =
    row.rating_average === null ||
    row.rating_average === undefined
      ? null
      : Number(row.rating_average)

  return {
    id: row.id,
    name: row.name || 'مهندس',
    image: imageUrl(row.profile_photo_path),

    specialty:
      specializations.map(item => item.name).join('، ') ||
      'التخصص غير محدد',

    specialtyKey: String(specializations[0]?.id || ''),

    city:
      row.governorate_name ||
      row.governorate ||
      'الموقع غير محدد',

    rating:
      rating !== null && Number.isFinite(rating)
        ? rating
        : null,

    // استجابة القائمة لا تحتوي عدد المشاريع المنجزة.
    completedProjects: null,

    serviceTitle: specializations
      .map(item => item.name)
      .join('، '),

    bio: row.bio || '',
    isVerified: row.approval_status === 'approved',
  }
}

export function useEngineerDirectory() {
  const { $api } = useNuxtApp()

  const route = useRoute()
  const router = useRouter()

  const rows = ref<EngineerApiRow[]>([])
  const loading = ref(true)
  const error = ref('')

  const searchDraft = ref(queryText(route.query.q))

  const filters = reactive<EngineerFilters>({
    query: searchDraft.value,
    specialty: queryText(route.query.specialty) || 'all',
    city: queryText(route.query.city) || 'all',
    minimumRating: Number(queryText(route.query.rating)) || 0,
  })

  const currentPage = ref(1)
  const pageSize = 12

  let requestVersion = 0

  const specialtyLabels = computed<Record<string, string>>(() => {
    const labels: Record<string, string> = {}

    for (const row of rows.value) {
      for (const specialization of row.specializations || []) {
        labels[String(specialization.id)] = specialization.name
      }
    }

    return labels
  })

  const cities = computed(() => {
    const names = rows.value
      .map(row => row.governorate_name || row.governorate)
      .filter((name): name is string => Boolean(name))

    return [...new Set(names)].sort((a, b) =>
      a.localeCompare(b, 'ar'),
    )
  })

  const filteredEngineers = computed<Engineer[]>(() => {
    const search = filters.query.trim().toLocaleLowerCase('ar')

    return rows.value
      .filter(row => {
        if (filters.specialty === 'all') return true

        return (row.specializations || []).some(
          item => String(item.id) === filters.specialty,
        )
      })
      .map(mapEngineer)
      .filter(engineer => {
        return (
          filters.city === 'all' ||
          engineer.city === filters.city
        )
      })
      .filter(engineer => {
        if (!filters.minimumRating) return true

        return (
          engineer.rating !== null &&
          engineer.rating >= filters.minimumRating
        )
      })
      .filter(engineer => {
        if (!search) return true

        return [
          engineer.name,
          engineer.specialty,
          engineer.bio,
          engineer.city,
        ].some(value =>
          value.toLocaleLowerCase('ar').includes(search),
        )
      })
      .sort((a, b) => {
        return (b.rating ?? -1) - (a.rating ?? -1)
      })
  })

  const resultCount = computed(
    () => filteredEngineers.value.length,
  )

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(resultCount.value / pageSize)),
  )

  const displayedEngineers = computed(() => {
    const start = (currentPage.value - 1) * pageSize

    return filteredEngineers.value.slice(
      start,
      start + pageSize,
    )
  })

  const directoryQuery = computed<Record<string, string>>(() => {
    const query: Record<string, string> = {}

    if (filters.query) {
      query.q = filters.query
    }

    if (filters.specialty !== 'all') {
      query.specialty = filters.specialty
    }

    if (filters.city !== 'all') {
      query.city = filters.city
    }

    if (filters.minimumRating) {
      query.rating = String(filters.minimumRating)
    }

    return query
  })

  async function loadEngineers(): Promise<void> {
    const currentRequest = ++requestVersion

    loading.value = true
    error.value = ''

    try {
      const result = await fetchAllApiRows<EngineerApiRow>(
        query =>
          $api<EngineersApiResponse>('/engineers', {
            query,
          }),
      )

      if (currentRequest !== requestVersion) return

      rows.value = result
      currentPage.value = 1
    } catch (err: unknown) {
      if (currentRequest !== requestVersion) return

      const apiError = err as {
        data?: {
          message?: string
        }
      }

      error.value =
        apiError.data?.message ||
        'تعذر تحميل دليل المهندسين. حاول مجددًا.'
    } finally {
      if (currentRequest === requestVersion) {
        loading.value = false
      }
    }
  }

  function applySearch() {
    filters.query = searchDraft.value.trim()
    currentPage.value = 1
  }

  function resetFilters() {
    searchDraft.value = ''

    Object.assign(filters, {
      query: '',
      specialty: 'all',
      city: 'all',
      minimumRating: 0,
    })

    currentPage.value = 1
  }

  function setPage(page: number) {
    currentPage.value = Math.min(
      Math.max(page, 1),
      totalPages.value,
    )
  }

  function requestConsultation(engineer: Engineer) {
    return navigateTo({
      path: '/customer/services/new',
      query: {
        engineerId: String(engineer.id),
      },
    })
  }

  watch(
    filters,
    () => {
      currentPage.value = 1
    },
    { deep: true },
  )

  watch(directoryQuery, nextQuery => {
    if (
      route.path !== '/customer/engineers' ||
      router.currentRoute.value.path !== route.path
    ) {
      return
    }

    const query = { ...route.query }
    const keys = ['q', 'specialty', 'city', 'rating']

    let changed = false

    for (const key of keys) {
      if (queryText(route.query[key]) !== (nextQuery[key] || '')) {
        changed = true
      }

      delete query[key]
    }

    if (changed) {
      void navigateTo({
        path: route.path,
        query: {
          ...query,
          ...nextQuery,
        },
      })
    }
  })

  watch(
    () => route.query,
    () => {
      if (route.path !== '/customer/engineers') return

      Object.assign(filters, {
        query: queryText(route.query.q),
        specialty: queryText(route.query.specialty) || 'all',
        city: queryText(route.query.city) || 'all',
        minimumRating:
          Number(queryText(route.query.rating)) || 0,
      })

      searchDraft.value = filters.query
    },
  )

  onMounted(loadEngineers)

  onBeforeUnmount(() => {
    requestVersion++
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
    loading,
    error,
    loadEngineers,
    applySearch,
    resetFilters,
    setPage,
    requestConsultation,
  }
}