import { ref } from 'vue'

export interface ApiServiceType {
  id: number
  name: string
  description?: string | null
  icon?: string | null
  is_active: boolean
}

export interface ApiGovernorate {
  id: number
  name_ar: string
  name_en?: string | null
}

export interface ApiServiceOffer {
  id: number
  service_request_id: number
  engineer_id: number
  engineer?: {
    id: number
    name?: string | null
    profile_photo_path?: string | null
    years_of_experience?: number | string | null
  }
  proposed_cost: number | string
  execution_time_days: number
  technical_proposal: string
  proposal_file?: string | null
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export interface ApiCustomerServiceRequest {
  id: number
  customer_id?: number
  customer?: { id: number; name: string }
  service_type_id?: number
  service_type?: ApiServiceType
  governorate_id?: number | null
  governorate?: ApiGovernorate | null
  system_capacity_estimate?: string | number | null
  attachment_file?: string | null
  location_details?: string | null
  location_coordinates?: string | null
  description: string
  status: 'open_for_bids' | 'awarded' | 'in_progress' | 'completed' | 'cancelled'
  offers?: ApiServiceOffer[]
  created_at: string
}

export const requestStatusLabels: Record<string, { label: string; class: string }> = {
  open_for_bids: { label: 'بانتظار عروض المهندسين', class: 'bg-amber-100 text-amber-800 border-amber-200' },
  awarded: { label: 'تم قبول عرض', class: 'bg-blue-100 text-blue-800 border-blue-200' },
  in_progress: { label: 'قيد التنفيذ', class: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  completed: { label: 'مكتمل بنجاح', class: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  cancelled: { label: 'ملغى', class: 'bg-gray-100 text-gray-700 border-gray-200' },
}

export function useCustomerServices() {
  const { $api } = useNuxtApp()

  const serviceTypes = useState<ApiServiceType[]>('customer_service_types_list', () => [])
  const governorates = useState<ApiGovernorate[]>('customer_governorates_list_services', () => [])
  const myRequests = ref<ApiCustomerServiceRequest[]>([])
  const currentRequest = ref<ApiCustomerServiceRequest | null>(null)
  const offers = ref<ApiServiceOffer[]>([])

  const isLoading = ref(false)
  const isActionLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * جلب أنواع الخدمات المعتمدة في النظام
   */
  const fetchServiceTypes = async (): Promise<ApiServiceType[]> => {
    if (serviceTypes.value.length > 0) return serviceTypes.value
    try {
      const res: any = await $api('/service-types')
      serviceTypes.value = Array.isArray(res) ? res : (res?.data || [])
      return serviceTypes.value
    } catch (err: any) {
      console.error('Failed to fetch service types:', err)
      return []
    }
  }

  /**
   * جلب المحافظات
   */
  const fetchGovernorates = async (): Promise<ApiGovernorate[]> => {
    if (governorates.value.length > 0) return governorates.value
    try {
      const res: any = await $api('/governorates')
      governorates.value = Array.isArray(res) ? res : (res?.data || [])
      return governorates.value
    } catch (err: any) {
      console.error('Failed to fetch governorates:', err)
      return []
    }
  }

  /**
   * جلب طلبات الخدمات الخاصة بالعميل
   */
  const fetchMyRequests = async (filters: { status?: string } = {}): Promise<ApiCustomerServiceRequest[]> => {
    isLoading.value = true
    error.value = null
    try {
      let url = '/my/service-requests?per_page=100'
      if (filters.status) {
        url += `&status=${encodeURIComponent(filters.status)}`
      }
      const res: any = await $api(url)
      const list = Array.isArray(res) ? res : (res?.data?.data || res?.data || [])
      myRequests.value = list
      return list
    } catch (err: any) {
      console.error('Failed to fetch my service requests:', err)
      error.value = err?.data?.message || err?.message || 'تعذر جلب طلبات الخدمات الهندسية.'
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * جلب تفاصيل طلب خدمة معين
   */
  const fetchRequestDetails = async (id: number): Promise<ApiCustomerServiceRequest | null> => {
    isLoading.value = true
    error.value = null
    try {
      const res: any = await $api(`/service-requests/${id}`)
      const data = res?.data || res
      currentRequest.value = data
      return data
    } catch (err: any) {
      console.error(`Failed to fetch service request #${id}:`, err)
      // محاولة البحث في القائمة المحملة كبديل
      if (myRequests.value.length > 0) {
        const found = myRequests.value.find(r => r.id === id)
        if (found) {
          currentRequest.value = found
          return found
        }
      }
      error.value = err?.data?.message || err?.message || 'الطلب غير موجود أو تعذر تحميل تفاصيله.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * جلب عروض المهندسين لطلب معين
   */
  const fetchOffers = async (requestId: number): Promise<ApiServiceOffer[]> => {
    try {
      const res: any = await $api(`/service-requests/${requestId}/offers`)
      const list = Array.isArray(res) ? res : (res?.data || [])
      offers.value = list
      return list
    } catch (err: any) {
      console.error(`Failed to fetch offers for request #${requestId}:`, err)
      offers.value = []
      return []
    }
  }

  /**
   * إنشاء طلب خدمة هندسية جديد
   */
  const createServiceRequest = async (formData: FormData): Promise<ApiCustomerServiceRequest> => {
    isActionLoading.value = true
    error.value = null
    try {
      const res: any = await $api('/service-requests', {
        method: 'POST',
        body: formData,
      })
      const created = res?.data || res
      return created
    } catch (err: any) {
      console.error('Failed to create service request:', err)
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * قبول عرض مهندس معين
   */
  const acceptOffer = async (offerId: number): Promise<ApiServiceOffer> => {
    isActionLoading.value = true
    error.value = null
    try {
      const res: any = await $api(`/offers/${offerId}/accept`, {
        method: 'PATCH',
      })
      const accepted = res?.data || res
      // تحديث العروض محلياً
      offers.value = offers.value.map(item => {
        if (item.id === offerId) {
          return { ...item, status: 'accepted' }
        }
        if (item.status === 'pending') {
          return { ...item, status: 'rejected' }
        }
        return item
      })
      if (currentRequest.value) {
        currentRequest.value = { ...currentRequest.value, status: 'awarded' }
      }
      return accepted
    } catch (err: any) {
      console.error(`Failed to accept offer #${offerId}:`, err)
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * إلغاء طلب خدمة
   */
  const cancelServiceRequest = async (requestId: number): Promise<ApiCustomerServiceRequest> => {
    isActionLoading.value = true
    error.value = null
    try {
      const res: any = await $api(`/service-requests/${requestId}/cancel`, {
        method: 'PATCH',
      })
      const updated = res?.data || res
      if (currentRequest.value && currentRequest.value.id === requestId) {
        currentRequest.value = { ...currentRequest.value, status: 'cancelled' }
      }
      myRequests.value = myRequests.value.map(r => r.id === requestId ? { ...r, status: 'cancelled' } : r)
      return updated
    } catch (err: any) {
      console.error(`Failed to cancel request #${requestId}:`, err)
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  return {
    serviceTypes,
    governorates,
    myRequests,
    currentRequest,
    offers,
    isLoading,
    isActionLoading,
    error,
    fetchServiceTypes,
    fetchGovernorates,
    fetchMyRequests,
    fetchRequestDetails,
    fetchOffers,
    createServiceRequest,
    acceptOffer,
    cancelServiceRequest,
  }
}
