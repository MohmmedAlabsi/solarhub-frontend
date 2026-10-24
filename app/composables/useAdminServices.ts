import type { AdminServiceRequest, AdminServiceStatus } from '../../types/admin'

const statusMap: Record<string, AdminServiceStatus> = {
  open_for_bids: 'open',
  open: 'open',
  awarded: 'awarded',
  in_progress: 'executing',
  executing: 'executing',
  completed: 'completed',
  cancelled: 'cancelled',
}

export const useAdminServices = () => {
  const { $api } = useNuxtApp()
  const { notify } = useAdminNotice()

  const services = useState<AdminServiceRequest[]>('admin_services_data', () => [])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * جلب قائمة طلبات الخدمات الهندسية من الخادم
   */
  const fetchServices = async (force = false): Promise<AdminServiceRequest[]> => {
    if (!force && services.value.length > 0) {
      return services.value
    }

    isLoading.value = true
    error.value = null

    try {
      let rawList: any[] = []
      try {
        let res: any
        try {
          res = await $api('/service-requests?per_page=100')
        } catch {
          res = await $api('/service-requests/open?per_page=50')
        }

        if (Array.isArray(res)) {
          rawList = res
        } else if (Array.isArray(res?.data)) {
          rawList = res.data
        } else if (Array.isArray(res?.data?.data)) {
          rawList = res.data.data
        }
      } catch (err) {
        console.warn('Could not fetch service requests:', err)
      }

      const mapped: AdminServiceRequest[] = rawList.map((item: any) => {
        // استخراج القدرة كرقم
        const capNum = parseFloat(String(item.system_capacity_estimate || '').replace(/[^0-9.]/g, '')) || 5

        const offers = Array.isArray(item.offers)
          ? item.offers.map((offer: any) => ({
              id: String(offer.id),
              engineerId: String(offer.engineer_id || offer.engineer?.id || '1'),
              price: Number(offer.proposed_cost) || 0,
              duration: Number(offer.execution_time_days) || 7,
              proposal: offer.technical_proposal || '',
              status: offer.status === 'accepted' ? 'مقبول' : (offer.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'),
              document: offer.proposal_file
                ? { id: `prop-${offer.id}`, name: 'المقترح_الفني.pdf', size: '1.2 MB', url: offer.proposal_file }
                : undefined,
            }))
          : []

        return {
          id: String(item.id),
          client: item.customer?.name || 'عميل مسجل',
          service: item.service_type?.name || 'استشارة وتركيب منظومة طاقة',
          city: item.governorate?.name_ar || item.governorate?.name || (typeof item.governorate === 'string' ? item.governorate : 'غير محدد'),
          capacity: capNum,
          status: statusMap[item.status] || 'open',
          location: item.location_details || 'موقع المشروع محدد في الاستمارة',
          coordinates: item.location_coordinates || '',
          description: item.description || 'طلب خدمة فحص وتصميم منظومة طاقة شمسية.',
          documents: item.attachment_file
            ? [{ id: `att-${item.id}`, name: 'مرفق متطلبات الخدمة.pdf', size: '1.5 MB', url: item.attachment_file }]
            : [],
          offers,
        }
      })

      // دمج مع أي بيانات محلية موجودة
      const allMap = new Map<string, AdminServiceRequest>()
      mapped.forEach(s => allMap.set(s.id, s))

      // إذا لم يرجع الخادم بيانات وكان هناك بيانات مسبقة
      if (allMap.size === 0 && services.value.length > 0) {
        return services.value
      }

      services.value = Array.from(allMap.values())
      return services.value
    } catch (err: any) {
      console.error('Failed to fetch services:', err)
      error.value = err?.userMessage || err?.message || 'تعذر تحميل قائمة طلبات الخدمات.'
      return services.value
    } finally {
      isLoading.value = false
    }
  }

  return {
    services,
    isLoading,
    error,
    fetchServices,
  }
}
