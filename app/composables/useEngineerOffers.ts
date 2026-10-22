import { useAuthStore } from '~~/app/stores/auth'

export type OfferStatus = 'pending_review' | 'approved' | 'rejected'

export interface EngineerOffer {
  id: string               // OF-2025-089
  rawId: number            // 89 (المعرف الرقمي في Backend)
  requestId: string        // SR-2025-1042
  rawRequestId: number     // 1042
  requestTitle: string     // دراسة جدوى وتصميم محطة On-Grid
  totalCost: number        // 4500
  durationDays: number     // 7
  submittedAt: string      // تاريخ تقديم العرض
  status: OfferStatus
  methodology: string      // العرض الفني ومنهجية العمل
  methodologyPoints?: string[] // قائمة النقاط
  attachmentName?: string
  attachmentSize?: string
  attachmentUrl?: string
}

const statusLabels: Record<OfferStatus, string> = {
  pending_review: 'قيد المراجعة',
  approved:       'مقبول',
  rejected:       'مرفوض',
}

const statusClasses: Record<OfferStatus, string> = {
  pending_review: 'bg-solar-yellow/20 text-amber-800 border-solar-yellow/40',
  approved:       'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected:       'bg-red-100 text-red-700 border-red-200',
}

function mapStatus(status: string): OfferStatus {
  if (status === 'accepted') return 'approved'
  if (status === 'rejected') return 'rejected'
  return 'pending_review'
}

function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString)
    return d.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return dateString || 'مؤخراً'
  }
}

export function useEngineerOffers() {
  const { $api } = useNuxtApp()
  const authStore = useAuthStore()

  const offers = ref<EngineerOffer[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const search = ref('')
  const statusFilter = ref<OfferStatus | 'all'>('all')

  async function fetchOffers() {
    if (!authStore.token) return
    isLoading.value = true
    error.value = null

    try {
      const res = await $api<{ status: string; data: any[] }>('/my/offers')
      const items = Array.isArray(res?.data) ? res.data : []

      offers.value = items.map((item: any) => {
        const rawId = Number(item.id)
        const rawReqId = Number(item.service_request_id || 0)
        const proposal = item.technical_proposal || ''
        const lines = proposal.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0)

        return {
          id: `OF-2025-${rawId}`,
          rawId,
          requestId: `SR-2025-${rawReqId}`,
          rawRequestId: rawReqId,
          requestTitle: `طلب خدمة #${rawReqId}\nSR-2025-${rawReqId}`,
          totalCost: Number(item.proposed_cost || 0),
          durationDays: Number(item.execution_time_days || 1),
          submittedAt: formatDate(item.created_at),
          status: mapStatus(item.status),
          methodology: lines[0] || proposal,
          methodologyPoints: lines.length > 1 ? lines.slice(1) : undefined,
          attachmentName: item.proposal_file ? item.proposal_file.split('/').pop() : undefined,
          attachmentSize: item.proposal_file ? 'وثيقة هندسية معتمدة' : undefined,
          attachmentUrl: item.proposal_file || undefined,
        }
      })
    } catch (err: any) {
      error.value = err?.data?.message || 'تعذر تحميل العروض الهندسية'
    } finally {
      isLoading.value = false
    }
  }

  async function withdrawOffer(offerId: number) {
    await $api(`/offers/${offerId}`, { method: 'DELETE' })
    offers.value = offers.value.filter(o => o.rawId !== offerId)
  }

  const filtered = computed(() => {
    let list = offers.value
    if (statusFilter.value !== 'all') {
      list = list.filter(o => o.status === statusFilter.value)
    }
    if (search.value.trim()) {
      const q = search.value.toLowerCase()
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.requestId.toLowerCase().includes(q) ||
        o.requestTitle.toLowerCase().includes(q)
      )
    }
    return list
  })

  const pageSize = 6
  const currentPage = ref(1)
  const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
  const paginated = computed(() =>
    filtered.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize)
  )
  function setPage(p: number) { currentPage.value = p }
  watch([search, statusFilter], () => { currentPage.value = 1 })

  onMounted(() => {
    fetchOffers()
  })

  return {
    offers,
    search,
    statusFilter,
    filtered,
    paginated,
    currentPage,
    totalPages,
    pageSize,
    setPage,
    statusLabels,
    statusClasses,
    total: computed(() => filtered.value.length),
    isLoading,
    error,
    fetchOffers,
    withdrawOffer,
  }
}
