import { useAuthStore } from '~~/app/stores/auth'

export interface EngineerStat {
  id: string
  count: number
  label: string
  sublabel: string
  icon: 'offers-pending' | 'requests-available' | 'projects-done'
  tone: 'yellow' | 'blue' | 'green'
  destination: string
}

export interface EngineerWorkItem {
  id: string
  title: string
  description: string
  actionLabel: string
  destination: string
  icon: 'document' | 'chat' | 'check'
}

export const useEngineerDashboard = () => {
  const { $api } = useNuxtApp()
  const authStore = useAuthStore()

  const pendingOffersCount = ref(0)
  const availableRequestsCount = ref(0)
  const completedProjectsCount = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const stats = computed<EngineerStat[]>(() => [
    {
      id: 'offers-pending',
      count: pendingOffersCount.value,
      label: 'عروض قيد المراجعة',
      sublabel: `${pendingOffersCount.value} عروض بانتظار رد العملاء`,
      icon: 'offers-pending',
      tone: 'yellow',
      destination: '/engineer/offers',
    },
    {
      id: 'requests-available',
      count: availableRequestsCount.value,
      label: 'طلبات الخدمات المتاحة',
      sublabel: `${availableRequestsCount.value} طلبات هندسية جديدة`,
      icon: 'requests-available',
      tone: 'blue',
      destination: '/engineer/service-requests',
    },
    {
      id: 'projects-done',
      count: completedProjectsCount.value,
      label: 'إجمالي المشاريع المنجزة',
      sublabel: `${completedProjectsCount.value} مشروعاً معتمداً`,
      icon: 'projects-done',
      tone: 'green',
      destination: '/engineer/past-work',
    },
  ])

  const workItems: EngineerWorkItem[] = [
    {
      id: 'awaiting-offer',
      title: 'طلبات هندسية بانتظار العروض',
      description: 'طلبات دراسات جدوى وإشراف جديدة تحتاج عروض أسعار',
      actionLabel: 'تقديم تسعير',
      destination: '/engineer/service-requests',
      icon: 'document',
    },
    {
      id: 'awaiting-approval',
      title: 'عروض بانتظار اعتماد العميل',
      description: 'عروض فنية ومالية تم إرسالها وفي مرحلة المراجعة',
      actionLabel: 'مراجعة',
      destination: '/engineer/offers',
      icon: 'chat',
    },
    {
      id: 'in-progress',
      title: 'المشاريع الجارية قيد التنفيذ',
      description: 'مشاريع محطات شمسية معتمدة تتطلب تقارير إنجاز ومخططات',
      actionLabel: 'تحديث الإنجاز',
      destination: '/engineer/past-work',
      icon: 'check',
    },
  ]

  async function fetchDashboardData() {
    if (!authStore.token) return
    isLoading.value = true
    error.value = null

    try {
      const [offersRes, requestsRes, portfolioRes] = await Promise.allSettled([
        $api<{ status: string; data: any[] }>('/my/offers'),
        $api<{ status: string; data: any[] }>('/service-requests/open'),
        $api<{ status: string; data: any[] }>('/engineer/portfolio-items'),
      ])

      // 1. حساب العروض قيد المراجعة
      if (offersRes.status === 'fulfilled' && offersRes.value?.data) {
        const offers = Array.isArray(offersRes.value.data) ? offersRes.value.data : []
        pendingOffersCount.value = offers.filter((o: any) => o.status === 'pending').length
      }

      // 2. حساب طلبات الخدمات المفتوحة المتاحة
      if (requestsRes.status === 'fulfilled' && requestsRes.value?.data) {
        const requests = Array.isArray(requestsRes.value.data) ? requestsRes.value.data : []
        availableRequestsCount.value = requests.length
      }

      // 3. حساب نماذج الأعمال السابقة المنجزة
      if (portfolioRes.status === 'fulfilled' && portfolioRes.value?.data) {
        const items = Array.isArray(portfolioRes.value.data) ? portfolioRes.value.data : []
        completedProjectsCount.value = items.length
      }
    } catch (err: any) {
      error.value = err?.data?.message || 'تعذر تحميل بيانات لوحة التحكم'
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    fetchDashboardData()
  })

  return {
    stats,
    workItems,
    isLoading,
    error,
    fetchDashboardData,
  }
}
