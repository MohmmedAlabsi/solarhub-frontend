import { useAuthStore } from '~~/app/stores/auth'

export type ServiceRequestStatus =
  | 'awaiting_offers'   // بانتظار العروض
  | 'available'         // متاح للتقديم
  | 'urgent'            // عاجل - ينتهي قريباً

export interface EngineerServiceRequest {
  id: string                   // SR-2025-1042
  rawId: number                // 1042 (المعرف الرقمي في الـ Backend)
  serviceType: string          // نوع الخدمة
  serviceIcon: 'grid' | 'inspect' | 'droplet' | 'compliance' | 'bess' | 'monitor'
  governorate: string          // المحافظة
  location: string             // تفاصيل الموقع
  capacityLabel: string        // السعة التقديرية
  createdAt: string            // تاريخ الإنشاء
  status: ServiceRequestStatus
  offersCount?: number         // عدد العروض المقدمة حتى الآن
  scopeDescription: string     // نطاق العمل ومواصفات الطلب
  additionalLocation: string   // تفاصيل الموقع الإضافية
  locationTag?: string         // وسم الموقع
  attachmentName?: string      // اسم الملف المرفق
  attachmentSize?: string      // حجم الملف
}

export interface SubmitOfferForm {
  totalCost: string
  durationDays: string
  methodology: string
  attachmentFile: File | null
}

const statusLabels: Record<ServiceRequestStatus, string> = {
  awaiting_offers: 'بانتظار العروض',
  available:       'متاح للتقديم',
  urgent:          'عاجل - ينتهي قريباً',
}

const statusClasses: Record<ServiceRequestStatus, string> = {
  awaiting_offers: 'bg-solar-yellow/20 text-amber-800 border-solar-yellow/40',
  available:       'bg-emerald-100 text-emerald-800 border-emerald-200',
  urgent:          'bg-red-100 text-red-700 border-red-200',
}

function mapServiceIcon(typeName: string): EngineerServiceRequest['serviceIcon'] {
  if (typeName.includes('ضخ') || typeName.includes('مياه')) return 'droplet'
  if (typeName.includes('فحص') || typeName.includes('كود') || typeName.includes('SBC')) return 'compliance'
  if (typeName.includes('تخزين') || typeName.includes('بطاريات') || typeName.includes('BESS')) return 'bess'
  if (typeName.includes('إشراف') || typeName.includes('ميداني')) return 'inspect'
  if (typeName.includes('تدقيق') || typeName.includes('أداء')) return 'monitor'
  return 'grid'
}

function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString)
    return d.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return dateString || 'مؤخراً'
  }
}

export function useEngineerServiceRequests() {
  const { $api } = useNuxtApp()
  const authStore = useAuthStore()

  const requests = ref<EngineerServiceRequest[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const search = ref('')
  const statusFilter = ref<ServiceRequestStatus | 'all'>('all')

  async function fetchRequests() {
    if (!authStore.token) return
    isLoading.value = true
    error.value = null

    try {
      const res = await $api<{ status: string; data: any[] }>('/service-requests/open')
      const items = Array.isArray(res?.data) ? res.data : []

      requests.value = items.map((item: any) => {
        const typeName = item.service_type?.name || 'دراسة وتصميم محطة شمسية'
        const rawId = Number(item.id)
        return {
          id: `SR-2025-${rawId}`,
          rawId,
          serviceType: typeName,
          serviceIcon: mapServiceIcon(typeName),
          governorate: item.governorate?.name || 'المملكة',
          location: item.location_details || item.governorate?.name || 'الموقع محدد في الطلب',
          capacityLabel: item.system_capacity_estimate ? `${item.system_capacity_estimate} kWp` : 'تقديرية',
          createdAt: formatDate(item.created_at),
          status: item.status === 'open_for_bids' ? 'available' : 'awaiting_offers',
          offersCount: item.offers_count || 0,
          scopeDescription: item.description || 'تفاصيل نطاق العمل موضحة ومرفقة مع طلب الخدمة.',
          additionalLocation: item.location_details || item.governorate?.name || 'الموقع محدد',
          locationTag: item.location_coordinates ? 'إحداثيات محددة' : undefined,
          attachmentName: item.attachment_file ? item.attachment_file.split('/').pop() : undefined,
          attachmentSize: item.attachment_file ? 'مستند فني معتمد' : undefined,
        }
      })
    } catch (err: any) {
      error.value = err?.data?.message || 'تعذر تحميل طلبات الخدمات المفتوحة'
    } finally {
      isLoading.value = false
    }
  }

  async function submitOffer(rawRequestId: number, form: SubmitOfferForm) {
    const formData = new FormData()
    formData.append('proposed_cost', form.totalCost.trim())
    formData.append('execution_time_days', form.durationDays.trim())
    formData.append('technical_proposal', form.methodology.trim())

    if (form.attachmentFile) {
      formData.append('proposal', form.attachmentFile)
    }

    return await $api<{ status: string; message?: string; data: any }>(`/service-requests/${rawRequestId}/offers`, {
      method: 'POST',
      body: formData,
    })
  }

  const filtered = computed(() => {
    let list = requests.value
    if (statusFilter.value !== 'all') {
      list = list.filter(r => r.status === statusFilter.value)
    }
    if (search.value.trim()) {
      const q = search.value.toLowerCase()
      list = list.filter(r =>
        r.id.toLowerCase().includes(q) ||
        r.serviceType.toLowerCase().includes(q) ||
        r.governorate.toLowerCase().includes(q)
      )
    }
    return list
  })

  // --- Pagination ---
  const pageSize = 6
  const currentPage = ref(1)
  const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
  const paginated = computed(() =>
    filtered.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize)
  )
  function setPage(p: number) { currentPage.value = p }
  watch([search, statusFilter], () => { currentPage.value = 1 })

  onMounted(() => {
    fetchRequests()
  })

  return {
    requests,
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
    fetchRequests,
    submitOffer,
  }
}
