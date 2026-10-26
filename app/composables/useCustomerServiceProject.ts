import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
import { fetchAllApiRows } from '../utils/apiCollection'

interface ApiResponse<T> {
  status: string
  message?: string
  data: T
}

export interface CustomerServiceProject {
  id: number

  service_type?: {
    id: number
    name: string
  } | null

  governorate?: {
    id: number
    name?: string | null
    name_ar?: string | null
    name_en?: string | null
  } | null

  system_capacity_estimate?: string | number | null
  attachment_file?: string | null
  location_details?: string | null
  location_coordinates?: string | null
  description?: string | null
  status: string
  created_at?: string | null
}

export interface CustomerServiceOffer {
  id: number
  service_request_id: number

  engineer?: {
    id: number
    name?: string | null
    profile_photo_path?: string | null
    years_of_experience?: number | string | null
  } | null

  proposed_cost: string | number
  execution_time_days: number
  technical_proposal?: string | null
  proposal_file?: string | null
  status: string
  created_at?: string | null
}

interface ProjectCollectionResponse {
  status: string
  message?: string

  data:
    | CustomerServiceProject[]
    | {
        data: CustomerServiceProject[]
        last_page?: number
        meta?: {
          last_page?: number
        }
      }

  meta?: {
    last_page?: number
  }
}

const projectStatusLabels: Record<string, string> = {
  open_for_bids: 'بانتظار عروض المهندسين',
  awarded: 'تم قبول عرض',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغى',
}

export function useCustomerServiceProject() {
  const route = useRoute()
  const { $api } = useNuxtApp()

  const project = ref<CustomerServiceProject | null>(null)
  const offers = ref<CustomerServiceOffer[]>([])

  const loading = ref(true)
  const error = ref('')
  const offersError = ref('')
  const notFound = ref(false)

  const noticeMessage = ref('')
  const acceptanceError = ref('')

  const pendingOfferId = ref<number | null>(null)
  const acceptingOfferId = ref<number | null>(null)

  const offersReady = ref(false)
  const requiresRefresh = ref(false)

  let requestVersion = 0
  let mounted = false

  const projectId = computed<number | null>(() => {
    const raw = Array.isArray(route.params.id)
      ? route.params.id[0]
      : route.params.id

    const value = String(raw ?? '')

    if (!/^[1-9]\d*$/.test(value)) {
      return null
    }

    const id = Number(value)

    return Number.isSafeInteger(id) ? id : null
  })

  const accepting = computed(() =>
    acceptingOfferId.value !== null,
  )

  const acceptedOfferId = computed<number | null>(() =>
    offers.value.find(offer => offer.status === 'accepted')?.id
    ?? null,
  )

  const pendingOffer = computed(() =>
    offers.value.find(offer => offer.id === pendingOfferId.value)
    ?? null,
  )

  const statusLabel = computed(() => {
    if (!project.value) return ''

    return projectStatusLabels[project.value.status]
      || 'حالة غير معروفة'
  })

  const canAcceptOffers = computed(() =>
    Boolean(
      project.value
      && project.value.status === 'open_for_bids'
      && offersReady.value
      && !loading.value
      && !error.value
      && !offersError.value
      && !accepting.value
      && !requiresRefresh.value
      && acceptedOfferId.value === null,
    ),
  )

  function isCurrent(version: number, id: number): boolean {
    return version === requestVersion
      && projectId.value === id
  }

  async function readProject() {
    const version = ++requestVersion
    const id = projectId.value

    loading.value = true
    error.value = ''
    offersError.value = ''
    notFound.value = false

    offersReady.value = false
    requiresRefresh.value = true
    pendingOfferId.value = null

    if (id === null) {
      project.value = null
      offers.value = []
      notFound.value = true
      loading.value = false
      return
    }

    try {
      // لا يوجد مسار GET مباشر لتفاصيل الطلب في الباك إند.
      // نبحث عنه داخل طلبات العميل الحالي فقط.
      const rows = await fetchAllApiRows<CustomerServiceProject>(
        query => $api<ProjectCollectionResponse>(
          '/my/service-requests',
          { query },
        ),
        100,
      )

      if (!isCurrent(version, id)) return

      const found = rows.find(row => Number(row.id) === id)

      if (!found) {
        project.value = null
        offers.value = []
        notFound.value = true
        return
      }

      project.value = found
      offers.value = []

      try {
        // هذا المسار يعيد جميع عروض الطلب دون تقسيم صفحات.
        const response = await $api<
          ApiResponse<CustomerServiceOffer[]>
        >(`/service-requests/${id}/offers`)

        if (!isCurrent(version, id)) return

        if (
          response.status !== 'success'
          || !Array.isArray(response.data)
        ) {
          throw new Error('Invalid offers response')
        }

        const seenIds = new Set<number>()

        for (const offer of response.data) {
          const offerId = Number(offer.id)

          if (
            !Number.isSafeInteger(offerId)
            || offerId <= 0
            || Number(offer.service_request_id) !== id
            || seenIds.has(offerId)
          ) {
            throw new Error('Invalid offer data')
          }

          seenIds.add(offerId)
        }

        offers.value = response.data
        offersReady.value = true
        requiresRefresh.value = false
      } catch {
        if (!isCurrent(version, id)) return

        offersError.value =
          'تم تحميل بيانات الطلب، لكن تعذر تحميل عروض المهندسين. أعد المحاولة.'
      }
    } catch {
      if (!isCurrent(version, id)) return

      error.value =
        'تعذر تحميل بيانات الطلب. تحقق من الاتصال وأعد المحاولة.'
    } finally {
      if (isCurrent(version, id)) {
        loading.value = false
      }
    }
  }

  async function loadProject() {
    if (accepting.value || loading.value) return

    acceptanceError.value = ''
    await readProject()
  }

  function requestAcceptance(offerId: number) {
    if (!canAcceptOffers.value) return

    const offer = offers.value.find(
      item => item.id === offerId,
    )

    if (!offer || offer.status !== 'pending') return

    pendingOfferId.value = offer.id
    acceptanceError.value = ''
    noticeMessage.value = ''
  }

  function cancelAcceptance() {
    if (accepting.value) return

    pendingOfferId.value = null
    acceptanceError.value = ''
  }

  async function confirmAcceptance() {
    if (!canAcceptOffers.value) return

    const offer = pendingOffer.value
    const id = projectId.value

    if (
      !offer
      || offer.status !== 'pending'
      || id === null
      || Number(offer.service_request_id) !== id
    ) {
      return
    }

    const version = requestVersion

    acceptingOfferId.value = offer.id
    acceptanceError.value = ''
    noticeMessage.value = ''

    try {
      const response = await $api<
        ApiResponse<CustomerServiceOffer>
      >(`/offers/${offer.id}/accept`, {
        method: 'PATCH',
        retry: 0,
      })

      if (!isCurrent(version, id)) return

      const acceptedOffer = response.data

      if (
        response.status !== 'success'
        || !acceptedOffer
        || Number(acceptedOffer.id) !== offer.id
        || Number(acceptedOffer.service_request_id) !== id
        || acceptedOffer.status !== 'accepted'
      ) {
        throw new Error('Acceptance was not confirmed')
      }

      // نحدّث الحالة بعد تأكيد نجاح الحفظ من الباك إند.
      offers.value = offers.value.map(item => {
        if (item.id === offer.id) {
          return {
            ...item,
            ...acceptedOffer,
          }
        }

        if (item.status === 'pending') {
          return {
            ...item,
            status: 'rejected',
          }
        }

        return item
      })

      if (project.value) {
        project.value = {
          ...project.value,
          status: 'awarded',
        }
      }

      pendingOfferId.value = null

      noticeMessage.value =
        'تم قبول العرض وحفظ القرار بنجاح.'

      // إعادة قراءة الحالة للتأكد من عرض أحدث بيانات الخادم.
      await readProject()

      if (
        projectId.value === id
        && mounted
        && (error.value || offersError.value || notFound.value)
      ) {
        noticeMessage.value =
          'تم قبول العرض بنجاح، لكن تعذر تحديث بيانات الصفحة. أعد تحميل البيانات.'
      }
    } catch {
      if (!isCurrent(version, id)) return

      // قد ينقطع الاتصال بعد حفظ القرار؛ نطلب تحديث البيانات
      // قبل السماح بمحاولة قبول أخرى.
      requiresRefresh.value = true
      pendingOfferId.value = null

      acceptanceError.value =
        'تعذر تأكيد نتيجة قبول العرض. حدّث بيانات الطلب للتحقق من حالته قبل المحاولة مجددًا.'
    } finally {
      acceptingOfferId.value = null
    }
  }

  watch(projectId, () => {
    if (!mounted) return

    project.value = null
    offers.value = []
    pendingOfferId.value = null
    noticeMessage.value = ''
    acceptanceError.value = ''

    void readProject()
  })

  onMounted(() => {
    mounted = true
    void readProject()
  })

  onBeforeUnmount(() => {
    mounted = false
    requestVersion++
  })

  return {
    project,
    projectId,
    offers,
    loading,
    error,
    offersError,
    notFound,
    statusLabel,
    noticeMessage,
    acceptanceError,
    accepting,
    acceptingOfferId,
    acceptedOfferId,
    pendingOffer,
    canAcceptOffers,
    requiresRefresh,
    loadProject,
    requestAcceptance,
    cancelAcceptance,
    confirmAcceptance,
  }
}