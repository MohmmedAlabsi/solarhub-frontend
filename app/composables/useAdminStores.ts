import type { AdminSupplier, AdminApproval } from '../../types/admin'

const storeTypeMap: Record<string, AdminSupplier['storeType']> = {
  wholesaler: 'موزع رئيسي',
  retailer: 'متجر متخصص',
  authorized_agent: 'وكيل معتمد',
  distributor: 'موزع معتمد',
}

export const useAdminStores = () => {
  const { $api } = useNuxtApp()
  const { notify } = useAdminNotice()

  const stores = useState<AdminSupplier[]>('admin_stores_data', () => [])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * جلب قائمة المتاجر والموردين (المعتمدين + قيد المراجعة)
   */
  const fetchStores = async (force = false): Promise<AdminSupplier[]> => {
    if (!force && stores.value.length > 0) {
      return stores.value
    }

    isLoading.value = true
    error.value = null

    try {
      // 1. جلب المتاجر المعتمدة
      let approvedList: any[] = []
      try {
        const approvedRes: any = await $api('/stores?per_page=100')
        if (Array.isArray(approvedRes)) {
          approvedList = approvedRes
        } else if (Array.isArray(approvedRes?.data)) {
          approvedList = approvedRes.data
        } else if (Array.isArray(approvedRes?.data?.data)) {
          approvedList = approvedRes.data.data
        }
      } catch (err) {
        console.warn('Could not fetch approved stores:', err)
      }

      // 2. جلب المتاجر قيد المراجعة
      let pendingList: any[] = []
      try {
        const pendingRes: any = await $api('/admin/stores/pending')
        if (Array.isArray(pendingRes)) {
          pendingList = pendingRes
        } else if (Array.isArray(pendingRes?.data)) {
          pendingList = pendingRes.data
        } else if (Array.isArray(pendingRes?.data?.data)) {
          pendingList = pendingRes.data.data
        }
      } catch (err) {
        console.warn('Could not fetch pending stores:', err)
      }

      // توحيد وتنسيق السجلات
      const mappedApproved: AdminSupplier[] = approvedList.map((item: any) => {
        const governorate = item.governorate_name || item.governorate || item.user?.governorate?.name_ar || item.user?.governorate?.name_en || item.user?.governorate?.name || 'صنعاء'
        const coords = parseCoordinates(item.location_coordinates || item.coordinates || item.user?.default_coordinates, governorate)

        return {
          id: String(item.id),
          name: item.company_name || 'متجر معتمد',
          owner: item.owner || item.name || item.user?.name || 'مورد معتمد',
          email: item.email || item.user?.email || '—',
          phone: item.whatsapp_number || item.phone || item.user?.phone || '—',
          whatsapp: item.whatsapp_number || item.phone || '',
          commercialNumber: item.commercial_registry || '—',
          taxNumber: item.tax_number || '—',
          city: governorate,
          governorate,
          coordinates: coords,
          latitude: coords.lat,
          longitude: coords.lng,
          address: item.address_details || 'المركز الرئيسي',
          storeType: storeTypeMap[item.store_type] || (item.store_type as any) || 'موزع معتمد',
          approval: (item.approval_status || 'approved') as AdminApproval,
          description: item.bio || 'متجر ومورد لمنتجات ومعدات الطاقة الشمسية.',
          rejectionReason: item.rejection_reason || '',
          document: item.commercial_file_url
            ? { id: `doc-${item.id}`, name: 'السجل التجاري والوثائق.pdf', size: '2.4 MB', url: item.commercial_file_url }
            : undefined,
        }
      })

      const mappedPending: AdminSupplier[] = pendingList.map((item: any) => {
        const governorate = item.governorate_name || item.governorate || item.user?.governorate?.name_ar || item.user?.governorate?.name_en || item.user?.governorate?.name || 'صنعاء'
        const coords = parseCoordinates(item.location_coordinates || item.coordinates || item.user?.default_coordinates, governorate)

        return {
          id: String(item.id),
          name: item.company_name || 'طلب انضمام متجر',
          owner: item.owner || item.name || item.user?.name || 'مورد قيد المراجعة',
          email: item.email || item.user?.email || '—',
          phone: item.phone || item.whatsapp_number || item.user?.phone || '—',
          whatsapp: item.whatsapp_number || item.phone || '',
          commercialNumber: item.commercial_registry || '—',
          taxNumber: item.tax_number || '—',
          city: governorate,
          governorate,
          coordinates: coords,
          latitude: coords.lat,
          longitude: coords.lng,
          address: item.address_details || 'قيد التدقيق',
          storeType: storeTypeMap[item.store_type] || (item.store_type as any) || 'متجر متخصص',
          approval: (item.approval_status || 'pending') as AdminApproval,
          description: item.bio || 'طلب انضمام مورد جديد لشبكة منصة SolarHub.',
          rejectionReason: item.rejection_reason || '',
          document: item.commercial_file_url
            ? { id: `doc-${item.id}`, name: 'مستند السجل التجاري المرفوع.pdf', size: '2.1 MB', url: item.commercial_file_url }
            : undefined,
        }
      })

      // دمج وتفادي التكرار
      const allMap = new Map<string, AdminSupplier>()
      mappedPending.forEach(s => allMap.set(s.id, s))
      mappedApproved.forEach(s => allMap.set(s.id, s))

      // الاحتفاظ بأي حالات محلية تم تعديلها خلال الجلسة
      if (stores.value.length > 0) {
        stores.value.forEach(existing => {
          const fresh = allMap.get(existing.id)
          if (fresh && existing.approval !== fresh.approval) {
            allMap.set(existing.id, { ...fresh, approval: existing.approval, rejectionReason: existing.rejectionReason })
          }
        })
      }

      stores.value = Array.from(allMap.values())
      return stores.value
    } catch (err: any) {
      error.value = err?.userMessage || err?.message || 'تعذر تحميل قائمة المتاجر والموردين.'
      return stores.value
    } finally {
      isLoading.value = false
    }
  }

  return {
    stores,
    isLoading,
    error,
    fetchStores,
  }
}
