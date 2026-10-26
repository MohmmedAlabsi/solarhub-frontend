import type {
  DashboardAction,
  RecentActivity,
} from '~~/types/dashboard'

interface ActivityRow {
  id: number
  order_number?: string
  status: string
  created_at?: string
}

interface ActivityResponse {
  status: string
  message?: string
  data: ActivityRow[]
}

interface ActivitySource {
  endpoint: string
  title: string
  icon: RecentActivity['icon']
  tone: RecentActivity['statusTone']
  destination: (id: number) => string
}

const actions: DashboardAction[] = [
  {
    id: 'products',
    title: 'تصفح المنتجات',
    description: 'استكشف الألواح والمحولات والبطاريات المعتمدة',
    buttonLabel: 'تصفح الآن',
    icon: 'products',
    tone: 'dark',
    destination: '/customer/products',
  },
  {
    id: 'service',
    title: 'طلب خدمة',
    description: 'استشارات فنية، دراسات جدوى ومخططات معتمدة',
    buttonLabel: 'طلب خدمة',
    icon: 'service',
    tone: 'yellow',
    destination: '/customer/services/new',
  },
  {
    id: 'quotes',
    title: 'طلبات عروض الأسعار',
    description: 'إرسال ومتابعة عروض الأسعار المخصصة (RFQ)',
    buttonLabel: 'عرض الطلبات',
    icon: 'quotes',
    tone: 'dark',
    destination: '/customer/orders?tab=quotes',
  },
  {
    id: 'orders',
    title: 'طلباتي',
    description: 'متابعة أوامر الشراء وحالات الشحن والتسليم',
    buttonLabel: 'متابعة الطلبات',
    icon: 'orders',
    tone: 'yellow',
    destination: '/customer/orders',
  },
]

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  processing: 'قيد التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
  responded: 'تم استلام عرض السعر',
  accepted: 'مقبول',
  rejected: 'مرفوض',
  open_for_bids: 'مفتوح لتلقي العروض',
  awarded: 'تم قبول العرض',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي',
}

const sources: ActivitySource[] = [
  {
    endpoint: '/my/orders',
    title: 'طلب شراء',
    icon: 'delivery',
    tone: 'blue',
    destination: id => `/customer/orders/${id}/track`,
  },
  {
    endpoint: '/my/quote-requests',
    title: 'طلب عرض سعر',
    icon: 'quote',
    tone: 'yellow',
    destination: () => '/customer/orders?tab=quotes',
  },
  {
    endpoint: '/my/service-requests',
    title: 'طلب خدمة هندسية',
    icon: 'engineering',
    tone: 'orange',
    destination: id => `/customer/services/${id}`,
  },
]

function formatActivityDate(value?: string): string {
  if (!value) return 'التاريخ غير متاح'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'التاريخ غير متاح'
  }

  return date.toLocaleDateString('ar-YE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const useCustomerDashboard = () => {
  const { $api } = useNuxtApp()

  const activities = ref<RecentActivity[]>([])
  const loading = ref(false)
  const error = ref('')

  async function loadDashboard(): Promise<void> {
    if (loading.value) return

    loading.value = true
    error.value = ''

    try {
      const results = await Promise.allSettled(
        sources.map(async source => {
          const response = await $api<ActivityResponse>(
            source.endpoint,
            {
              query: {
                page: 1,
                per_page: 5,
              },
            },
          )

          if (
            response.status !== 'success' ||
            !Array.isArray(response.data)
          ) {
            throw new Error(
              response.message || 'تعذر تحميل الأنشطة.',
            )
          }

          return response.data.map(row => ({
            id: `${source.icon}-${row.id}`,
            title: `${source.title} #${row.order_number || row.id}`,
            time: formatActivityDate(row.created_at),
            status: statusLabels[row.status] || row.status,
            statusTone: source.tone,
            icon: source.icon,
            destination: source.destination(row.id),
            timestamp: Date.parse(row.created_at || '') || 0,
          }))
        }),
      )

      activities.value = results
        .flatMap(result =>
          result.status === 'fulfilled' ? result.value : [],
        )
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5)

      const failedCount = results.filter(
        result => result.status === 'rejected',
      ).length

      if (failedCount === sources.length) {
        error.value = 'تعذر تحميل الأنشطة. يرجى إعادة المحاولة.'
      } else if (failedCount > 0) {
        error.value = 'تعذر تحميل بعض الأنشطة. يرجى إعادة المحاولة.'
      }
    } finally {
      loading.value = false
    }
  }

  onMounted(loadDashboard)

  return {
    actions,
    activities,
    loading,
    error,
    loadDashboard,
  }
}