import { ref, computed } from 'vue'
import type { DashboardAction, RecentActivity } from '~~/types/dashboard'
import { useCustomerOrders } from './useCustomerOrders'
import { useCustomerServices } from './useCustomerServices'
import { useCartStore } from '~~/app/stores/cart.store'

export const useCustomerDashboard = () => {
  const { fetchMyOrders, fetchMyQuoteRequests } = useCustomerOrders()
  const { fetchMyRequests } = useCustomerServices()
  const cartStore = useCartStore()

  const isLoading = ref(false)
  const activities = ref<RecentActivity[]>([])
  const ordersCount = ref(0)
  const quotesCount = ref(0)
  const servicesCount = ref(0)

  const actions: DashboardAction[] = [
    {
      id: 'products',
      title: 'تصفح المنتجات',
      description: 'استكشف الألواح والمحولات والبطاريات من المتاجر المعتمدة',
      buttonLabel: 'تصفح الكتالوج',
      icon: 'products',
      tone: 'dark',
      destination: '/customer/products',
    },
    {
      id: 'service',
      title: 'طلب خدمة هندسية',
      description: 'استشارات فنية، دراسات جدوى ومخططات معتمدة لمشروعك',
      buttonLabel: 'طلب خدمة جديدة',
      icon: 'service',
      tone: 'yellow',
      destination: '/customer/services/new',
    },
    {
      id: 'quotes',
      title: 'طلبات عروض الأسعار',
      description: 'إرسال ومتابعة عروض الأسعار المباشرة من الموردين (RFQ)',
      buttonLabel: 'متابعة العروض',
      icon: 'quotes',
      tone: 'dark',
      destination: '/customer/orders?tab=quotes',
    },
    {
      id: 'orders',
      title: 'أوامر الشراء',
      description: 'متابعة حالة شحن وتوصيل المنتجات من المستودعات',
      buttonLabel: 'سجل الطلبات',
      icon: 'orders',
      tone: 'yellow',
      destination: '/customer/orders',
    },
  ]

  const formatRelativeTime = (dateStr?: string): string => {
    if (!dateStr) return 'مؤخراً'
    try {
      const date = new Date(dateStr)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffMinutes < 5) return 'الآن'
      if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`
      if (diffHours < 24) return `منذ ${diffHours} ساعة`
      if (diffDays === 1) return 'أمس'
      if (diffDays < 7) return `منذ ${diffDays} أيام`

      return date.toLocaleDateString('ar-YE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const loadDashboard = async () => {
    isLoading.value = true
    try {
      const [ordersRes, quotesRes, servicesRes] = await Promise.allSettled([
        fetchMyOrders(),
        fetchMyQuoteRequests(),
        fetchMyRequests(),
        cartStore.fetchCart(),
      ])

      const orders = ordersRes.status === 'fulfilled' ? ordersRes.value : []
      const quotes = quotesRes.status === 'fulfilled' ? quotesRes.value : []
      const services = servicesRes.status === 'fulfilled' ? servicesRes.value : []

      ordersCount.value = orders.length
      quotesCount.value = quotes.length
      servicesCount.value = services.length

      const list: Array<RecentActivity & { rawDate: number }> = []

      // 1. تحويل الطلبات الأخيرة لأنشطة
      for (const order of orders.slice(0, 5)) {
        const storeName = order.order_stores?.[0]?.store?.company_name || 'متجر معتمد'
        let statusLabel = 'قيد الانتظار'
        let statusTone: RecentActivity['statusTone'] = 'yellow'

        if (order.status === 'shipped') {
          statusLabel = 'شحنتك في الطريق'
          statusTone = 'blue'
        } else if (order.status === 'delivered' || order.status === 'completed') {
          statusLabel = 'تم التسليم بنجاح'
          statusTone = 'blue'
        } else if (order.status === 'processing') {
          statusLabel = 'قيد التجهيز والشحن'
          statusTone = 'yellow'
        } else if (order.status === 'cancelled') {
          statusLabel = 'طلب ملغى'
          statusTone = 'orange'
        }

        list.push({
          id: `ORD-${order.id}`,
          title: `طلب شراء #${order.order_number} (${storeName})`,
          time: formatRelativeTime(order.created_at),
          status: statusLabel,
          statusTone,
          icon: 'delivery',
          destination: '/customer/orders',
          rawDate: new Date(order.created_at).getTime() || 0,
        })
      }

      // 2. تحويل طلبات عروض الأسعار
      for (const quote of quotes.slice(0, 3)) {
        const prodTitle = quote.store_product?.master_product?.title || 'منتج طاقة شمسية'
        let statusLabel = 'بانتظار عرض السعر'
        let statusTone: RecentActivity['statusTone'] = 'yellow'

        if (quote.status === 'responded') {
          statusLabel = 'تم استلام تسعيرة المورد'
          statusTone = 'yellow'
        } else if (quote.status === 'accepted') {
          statusLabel = 'تم قبول العرض'
          statusTone = 'blue'
        } else if (quote.status === 'rejected') {
          statusLabel = 'عرض مرفوض'
          statusTone = 'orange'
        }

        list.push({
          id: `RFQ-${quote.id}`,
          title: `طلب عرض سعر #${quote.id} – ${prodTitle}`,
          time: 'مؤخراً',
          status: statusLabel,
          statusTone,
          icon: 'quote',
          destination: '/customer/orders?tab=quotes',
          rawDate: Date.now() - 3600000,
        })
      }

      // 3. تحويل طلبات الخدمات الهندسية
      for (const srv of services.slice(0, 3)) {
        const typeName = srv.service_type?.name || 'خدمة هندسية'
        let statusLabel = 'بانتظار عروض المهندسين'
        let statusTone: RecentActivity['statusTone'] = 'orange'

        if (srv.status === 'awarded') {
          statusLabel = 'تم قبول عرض المهندس'
          statusTone = 'blue'
        } else if (srv.status === 'in_progress') {
          statusLabel = 'المشروع قيد التنفيذ'
          statusTone = 'blue'
        } else if (srv.status === 'completed') {
          statusLabel = 'مكتمل بنجاح'
          statusTone = 'blue'
        } else if (srv.status === 'cancelled') {
          statusLabel = 'ملغى'
          statusTone = 'orange'
        }

        list.push({
          id: `SR-${srv.id}`,
          title: `طلب خدمة #${srv.id} – ${typeName}`,
          time: formatRelativeTime(srv.created_at),
          status: statusLabel,
          statusTone,
          icon: 'engineering',
          destination: `/customer/services/${srv.id}`,
          rawDate: new Date(srv.created_at).getTime() || 0,
        })
      }

      // فرز النشاطات من الأحدث للأقدم
      list.sort((a, b) => b.rawDate - a.rawDate)

      activities.value = list.map(({ rawDate, ...item }) => item).slice(0, 6)
    } finally {
      isLoading.value = false
    }
  }

  return {
    actions,
    activities,
    ordersCount,
    quotesCount,
    servicesCount,
    cartItemsCount: computed(() => cartStore.totalItemsCount),
    isLoading,
    loadDashboard,
  }
}
