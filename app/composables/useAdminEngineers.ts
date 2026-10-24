import type { AdminEngineer, AdminApproval } from '../../types/admin'

export const useAdminEngineers = () => {
  const { $api } = useNuxtApp()
  const { notify } = useAdminNotice()

  const engineers = useState<AdminEngineer[]>('admin_engineers_data', () => [])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * جلب قائمة المهندسين (المعتمدين + قيد المراجعة)
   */
  const fetchEngineers = async (force = false): Promise<AdminEngineer[]> => {
    if (!force && engineers.value.length > 0) {
      return engineers.value
    }

    isLoading.value = true
    error.value = null

    try {
      // 1. جلب المهندسين المعتمدين
      let approvedList: any[] = []
      try {
        const approvedRes: any = await $api('/engineers?per_page=100')
        approvedList = Array.isArray(approvedRes) ? approvedRes : (approvedRes?.data || [])
      } catch (err) {
        console.warn('Could not fetch approved engineers:', err)
      }

      // 2. جلب المهندسين قيد المراجعة
      let pendingList: any[] = []
      try {
        const pendingRes: any = await $api('/admin/engineers/pending')
        pendingList = Array.isArray(pendingRes) ? pendingRes : (pendingRes?.data || [])
      } catch (err) {
        console.warn('Could not fetch pending engineers:', err)
      }

      // توحيد وتنسيق السجلات
      const mappedApproved: AdminEngineer[] = approvedList.map((item: any) => {
        const specialties = Array.isArray(item.specializations)
          ? item.specializations.map((s: any) => typeof s === 'string' ? s : s.name).filter(Boolean)
          : []

        const governorate = item.governorate_name || item.governorate || item.user?.governorate?.name_ar || item.user?.governorate?.name_en || item.user?.governorate?.name || 'صنعاء'
        const coords = parseCoordinates(item.location_coordinates || item.default_coordinates || item.user?.default_coordinates, governorate)

        return {
          id: String(item.id),
          name: item.name || item.user?.name || 'مهندس معتمد',
          title: 'مهندس طاقة شمسية استشاري',
          email: item.email || item.user?.email || '—',
          phone: item.phone || item.user?.phone || '—',
          city: governorate,
          governorate,
          coordinates: coords,
          latitude: coords.lat,
          longitude: coords.lng,
          license: item.license_number || '—',
          licenseAuthority: 'نقابة المهندسين اليمنيين / وزارة الأشغال',
          experience: Number(item.years_of_experience) || 0,
          specialties: specialties.length ? specialties : ['تصميم ومطابقة أحمال'],
          approval: 'approved' as AdminApproval,
          approvedAt: item.approved_at || item.created_at || new Date().toISOString(),
          bio: item.bio || 'مهندس استشاري معتمد لدى منصة SolarHub لتصميم ومراجعة محطات الطاقة الشمسية.',
          rejectionReason: '',
          documents: item.cv_url
            ? [{ id: `cv-${item.id}`, name: 'السيرة الذاتية ورخصة المزاولة.pdf', size: '2.5 MB', url: item.cv_url }]
            : [],
          image: item.profile_photo_path,
        }
      })

      const mappedPending: AdminEngineer[] = pendingList.map((item: any) => {
        const specialties = Array.isArray(item.specializations)
          ? item.specializations.map((s: any) => typeof s === 'string' ? s : s.name).filter(Boolean)
          : []

        const governorate = item.governorate_name || item.governorate || item.user?.governorate?.name_ar || item.user?.governorate?.name_en || item.user?.governorate?.name || 'صنعاء'
        const coords = parseCoordinates(item.location_coordinates || item.default_coordinates || item.user?.default_coordinates, governorate)

        return {
          id: String(item.id),
          name: item.name || item.user?.name || 'طلب انضمام مهندس',
          title: 'متقدم للاعتماد الاستشاري',
          email: item.email || item.user?.email || '—',
          phone: item.phone || item.user?.phone || '—',
          city: governorate,
          governorate,
          coordinates: coords,
          latitude: coords.lat,
          longitude: coords.lng,
          license: item.license_number || 'قيد التدقيق',
          licenseAuthority: 'نقابة المهندسين / وزارة الأشغال',
          experience: Number(item.years_of_experience) || 0,
          specialties: specialties.length ? specialties : ['فحص ومطابقة أنظمة طاقة'],
          approval: (item.approval_status || 'pending') as AdminApproval,
          approvedAt: undefined,
          bio: item.bio || 'مقدم طلب اعتماد جديد للانضمام لشبكة مهندسي المنصة المعتمدين.',
          rejectionReason: item.rejection_reason || '',
          documents: item.cv_url
            ? [{ id: `cv-${item.id}`, name: 'الملف المهني والسيرة الذاتية.pdf', size: '3.1 MB', url: item.cv_url }]
            : [],
        }
      })

      // دمج وتفادي التكرار حسب المعرف ID
      const allMap = new Map<string, AdminEngineer>()
      mappedPending.forEach(e => allMap.set(e.id, e))
      mappedApproved.forEach(e => allMap.set(e.id, e))

      engineers.value = Array.from(allMap.values())
      return engineers.value
    } catch (err: any) {
      error.value = err?.userMessage || err?.message || 'تعذر تحميل قائمة المهندسين.'
      return engineers.value
    } finally {
      isLoading.value = false
    }
  }

  return {
    engineers,
    isLoading,
    error,
    fetchEngineers,
  }
}
