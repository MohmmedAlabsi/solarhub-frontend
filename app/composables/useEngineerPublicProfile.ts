import type {
  EngineerProfile,
  EngineerProfileTab,
  EngineerProject,
} from '~~/types/engineer'

import { fetchAllApiRows } from '~/utils/apiCollection'

interface ApiResponse<T> {
  status: string
  message?: string
  data: T
}

interface ApiGovernorate {
  id: number
  name?: string | null
  name_ar?: string | null
  name_en?: string | null
}

interface ApiSpecialization {
  id: number
  name: string
}

interface ApiEngineerProfile {
  id: number

  user?: {
    id: number
    name?: string | null
    governorate_id?: number | null
  }

  license_number?: string | null
  years_of_experience?: number | string | null
  bio?: string | null
  profile_photo_path?: string | null
  approval_status?: string
  specializations?: ApiSpecialization[]
}

interface ApiEngineerSummary {
  id: number
  rating_average?: number | string | null
  ratings_count?: number | string | null
}

interface ApiPortfolioItem {
  id: number
  project_title?: string | null
  description?: string | null
  image_path?: string | null
  system_capacity?: number | string | null
  address_text?: string | null

  governorate?: ApiGovernorate | null

  service_type?: {
    id: number
    name?: string | null
  } | null
}

function routeText(value: unknown): string {
  const firstValue = Array.isArray(value) ? value[0] : value

  return typeof firstValue === 'string' ? firstValue : ''
}

function numberOrNull(
  value: number | string | null | undefined,
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null
  }

  const number = Number(value)

  return Number.isFinite(number) ? number : null
}

function publicImageUrl(value?: string | null): string {
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

function governorateName(
  governorate?: ApiGovernorate | null,
): string {
  return (
    governorate?.name_ar ||
    governorate?.name ||
    governorate?.name_en ||
    ''
  )
}

function mapPortfolioItem(
  item: ApiPortfolioItem,
): EngineerProject {
  return {
    id: String(item.id),
    title: item.project_title || 'مشروع',
    description: item.description || '',
    image: publicImageUrl(item.image_path),

    statusLabel: item.service_type?.name || 'عمل سابق',

    capacityLabel:
      item.system_capacity === null ||
      item.system_capacity === undefined ||
      item.system_capacity === ''
        ? 'السعة غير محددة'
        : String(item.system_capacity),

    location:
      item.address_text ||
      governorateName(item.governorate) ||
      'الموقع غير محدد',

    // لا تعيد الاستجابة سنة الإنجاز أو تصنيف المشروع.
    completionYear: null,
    category: null,
  }
}

export function useEngineerPublicProfile() {
  const { $api } = useNuxtApp()
  const route = useRoute()

  const engineer = ref<EngineerProfile>()

  const loading = ref(true)
  const error = ref('')
  const portfolioError = ref('')
  const ratingError = ref('')
  const noticeMessage = ref('')

  let requestVersion = 0

  const engineerId = computed(() => {
    return Number(routeText(route.params.id))
  })

  const activeTab = computed<EngineerProfileTab>(() => {
    const tab = routeText(route.query.tab)

    if (
      tab === 'projects' ||
      tab === 'certificates' ||
      tab === 'reviews'
    ) {
      return tab
    }

    return 'overview'
  })

  const backQuery = computed(() => {
    const query = { ...route.query }

    delete query.tab

    return query
  })

  async function fetchPortfolio(
    id: number,
  ): Promise<ApiPortfolioItem[]> {
    return fetchAllApiRows<ApiPortfolioItem>(
      query =>
        $api<ApiResponse<ApiPortfolioItem[]>>(
          `/engineers/${id}/portfolio-items`,
          {
            query,
          },
        ),
      50,
    )
  }

  async function fetchRatingSummary(
    id: number,
    name: string,
  ): Promise<ApiEngineerSummary | undefined> {
    if (!name.trim()) return undefined

    // متوسط التقييم وعدده موجودان في القائمة العامة،
    // ولا تعيدهما استجابة الملف الشخصي المفرد.
    const rows = await fetchAllApiRows<ApiEngineerSummary>(
      query =>
        $api<ApiResponse<ApiEngineerSummary[]>>(
          '/engineers',
          {
            query: {
              ...query,
              search: name.trim().slice(0, 150),
            },
          },
        ),
    )

    return rows.find(row => Number(row.id) === id)
  }

  async function loadProfile(): Promise<void> {
    const currentRequest = ++requestVersion
    const id = engineerId.value

    loading.value = true
    error.value = ''
    portfolioError.value = ''
    ratingError.value = ''
    noticeMessage.value = ''
    engineer.value = undefined

    if (!Number.isSafeInteger(id) || id <= 0) {
      error.value = 'معرّف المهندس غير صحيح.'
      loading.value = false
      return
    }

    try {
      const [profileResponse, governoratesResponse] =
        await Promise.all([
          $api<ApiResponse<ApiEngineerProfile>>(
            `/engineers/${id}`,
          ),

          $api<ApiResponse<ApiGovernorate[]>>(
            '/governorates',
          ),
        ])

      if (currentRequest !== requestVersion) return

      if (
        profileResponse.status !== 'success' ||
        !profileResponse.data ||
        governoratesResponse.status !== 'success' ||
        !Array.isArray(governoratesResponse.data)
      ) {
        throw new Error('استجابة غير متوقعة من الخادم.')
      }

      const profile = profileResponse.data
      const specializations = profile.specializations || []

      const governorate = governoratesResponse.data.find(
        item =>
          Number(item.id) ===
          Number(profile.user?.governorate_id),
      )

      const specialty = specializations
        .map(item => item.name)
        .join('، ')

      engineer.value = {
        id: profile.id,
        name: profile.user?.name || 'مهندس',
        image: publicImageUrl(profile.profile_photo_path),

        specialty: specialty || 'التخصص غير محدد',

        specialtyKey: String(
          specializations[0]?.id || '',
        ),

        city:
          governorateName(governorate) ||
          'الموقع غير محدد',

        rating: null,
        completedProjects: null,
        serviceTitle: specialty,
        bio: profile.bio || '',

        isVerified:
          profile.approval_status === 'approved',

        licenseNumber:
          profile.license_number || 'غير متاح',

        experienceYears: numberOrNull(
          profile.years_of_experience,
        ),

        verifiedReviews: null,
        responseTime: 'غير متاح',

        professionalBio:
          profile.bio || 'لم تُضف نبذة مهنية لهذا المهندس.',

        expertise: specializations.map(item => ({
          title: item.name,
          description: '',
          icon: 'grid',
        })),

        // تفاصيل الشهادات والتقييمات غير متاحة
        // للعميل عبر المسارات الحالية.
        certificates: [],

        reviews: {
          distribution: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
          },
          comments: [],
        },

        projects: [],
      }

      const [portfolioResult, ratingResult] =
        await Promise.allSettled([
          fetchPortfolio(id),

          fetchRatingSummary(
            id,
            profile.user?.name || '',
          ),
        ])

      if (
        currentRequest !== requestVersion ||
        !engineer.value
      ) {
        return
      }

      if (portfolioResult.status === 'fulfilled') {
        engineer.value.projects =
          portfolioResult.value.map(mapPortfolioItem)
      } else {
        portfolioError.value =
          'تعذر تحميل مشاريع المهندس. أعد المحاولة.'
      }

      if (
        ratingResult.status === 'fulfilled' &&
        ratingResult.value
      ) {
        engineer.value.rating = numberOrNull(
          ratingResult.value.rating_average,
        )

        engineer.value.verifiedReviews = numberOrNull(
          ratingResult.value.ratings_count,
        )
      } else {
        ratingError.value =
          'إحصاءات التقييم غير متاحة حاليًا.'
      }
    } catch (err: unknown) {
      if (currentRequest !== requestVersion) return

      const apiError = err as {
        status?: number
        statusCode?: number

        data?: {
          message?: string
        }
      }

      const status =
        apiError.status || apiError.statusCode

      if (status === 404) {
        error.value =
          'المهندس غير موجود أو غير متاح للعرض.'
      } else {
        error.value =
          apiError.data?.message ||
          'تعذر تحميل الملف الشخصي. حاول مجددًا.'
      }
    } finally {
      if (currentRequest === requestVersion) {
        loading.value = false
      }
    }
  }

  function selectTab(tab: EngineerProfileTab) {
    const query = { ...route.query }

    if (tab === 'overview') {
      delete query.tab
    } else {
      query.tab = tab
    }

    return navigateTo({
      path: route.path,
      query,
    })
  }

  function requestService() {
    if (!engineer.value) return

    return navigateTo({
      path: '/customer/services/new',

      query: {
        engineerId: String(engineer.value.id),
      },
    })
  }

  function sendMessage() {
    noticeMessage.value =
      'المراسلة المباشرة غير متاحة حاليًا. يمكنك طلب خدمة هندسية.'
  }

  onMounted(loadProfile)

  watch(engineerId, loadProfile)

  onBeforeUnmount(() => {
    requestVersion++
  })

  return {
    engineer,
    activeTab,
    backQuery,
    loading,
    error,
    portfolioError,
    ratingError,
    noticeMessage,
    loadProfile,
    selectTab,
    requestService,
    sendMessage,
  }
}