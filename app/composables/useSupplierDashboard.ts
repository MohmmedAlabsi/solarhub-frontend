
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import {
  supplierList,
  supplierError
} from '~/utils/supplierPortal'

// أنواع البيانات القادمة من Laravel

interface StoreProduct {
  id: number
  stock_quantity?: number | string | null
  status?: string
  master_product?: {
    title?: string
  }
}

interface StoreOrder {
  id: number
  status: string
  subtotal?: number | string
  created_at?: string
  order?: {
    order_number?: string
    created_at?: string
  }
}

interface StoreQuote {
  id: number
  status: string
  created_at?: string
}

export function useSupplierDashboard() {
  const { $api } = useNuxtApp()
  const auth = useAuthStore()

  // البيانات
  const products = ref<StoreProduct[]>([])
  const orders = ref<StoreOrder[]>([])
  const quotes = ref<StoreQuote[]>([])

  // حالات الواجهة
  const isLoading = ref(false)
  const error = ref('')
  const hasPartialData = ref(false)

  // الأعداد الإجمالية
  const productCount = ref(0)
  const orderCount = ref(0)
  const quoteCount = ref(0)

  // معلومات المتجر
  const store = computed(() => auth.user?.store)

  const storeName = computed(() =>
    store.value?.company_name ||
    auth.user?.name ||
    'متجرك'
  )

  const isApproved = computed(() =>
    store.value?.approval_status === 'approved'
  )

  // طلبات الشراء النشطة
  const activeOrders = computed(() =>
    orders.value.filter(order =>
      ['pending', 'accepted', 'shipped'].includes(
        order.status
      )
    )
  )

  // طلبات الشراء بانتظار التجهيز
  const pendingOrders = computed(() =>
    orders.value.filter(order =>
      ['pending', 'accepted'].includes(order.status)
    )
  )

  // عروض الأسعار بانتظار الرد
  const pendingQuotes = computed(() =>
    quotes.value.filter(quote =>
      quote.status === 'pending'
    )
  )

  // المنتجات ذات المخزون المنخفض
  const lowStock = computed(() =>
    products.value.filter(product => {
      if (product.status === 'inactive') return false

      const stock = product.stock_quantity

      if (stock === null || stock === undefined) {
        return false
      }

      const quantity = Number(stock)

      return Number.isFinite(quantity) &&
        quantity >= 0 &&
        quantity <= 5
    })
  )

  // إجمالي مبيعات الطلبات المكتملة
  const completedSales = computed(() =>
    orders.value
      .filter(order =>
        ['completed', 'delivered'].includes(
          order.status
        )
      )
      .reduce(
        (total, order) =>
          total + (Number(order.subtotal) || 0),
        0
      )
  )

  // آخر العمليات
  const recentActivity = computed(() => {
    const orderActivities = orders.value.map(order => ({
      key: `order-${order.id}`,
      title: `طلب شراء ${
        order.order?.order_number || `#${order.id}`
      }`,
      description: 'متابعة حالة طلب الشراء',
      date: order.order?.created_at ||
        order.created_at || '',
      to: '/supplier/orders',
      kind: 'order'
    }))

    const quoteActivities = quotes.value.map(quote => ({
      key: `quote-${quote.id}`,
      title: `طلب عرض سعر #${quote.id}`,
      description: 'متابعة طلب عرض السعر',
      date: quote.created_at || '',
      to: '/supplier/quotes',
      kind: 'quote'
    }))

    return [...orderActivities, ...quoteActivities]
      .sort(
        (a, b) =>
          (new Date(b.date).getTime() || 0) -
          (new Date(a.date).getTime() || 0)
      )
      .slice(0, 5)
  })

  // بيانات المبيعات لآخر 6 أشهر
  const monthlySales = computed(() => {
    const now = new Date()

    return Array.from({ length: 6 }, (_, index) => {
      const month = new Date(
        now.getFullYear(),
        now.getMonth() - 5 + index,
        1
      )

      const amount = orders.value
        .filter(order => {
          const date = new Date(
            order.order?.created_at ||
            order.created_at || ''
          )

          return (
            ['completed', 'delivered'].includes(
              order.status
            ) &&
            !Number.isNaN(date.getTime()) &&
            date.getFullYear() === month.getFullYear() &&
            date.getMonth() === month.getMonth()
          )
        })
        .reduce(
          (sum, order) =>
            sum + (Number(order.subtotal) || 0),
          0
        )

      return {
        label: month.toLocaleDateString('ar-YE', {
          month: 'short'
        }),
        amount
      }
    })
  })

  const maxMonthlySales = computed(() =>
    Math.max(
      1,
      ...monthlySales.value.map(month => month.amount)
    )
  )

  // تحميل البيانات من Laravel
  async function refresh() {
    if (isLoading.value) return

    isLoading.value = true
    error.value = ''
    hasPartialData.value = false

    try {
      const results = await Promise.allSettled([
        $api('/my/store-products?per_page=100'),
        $api('/my/store-orders?per_page=100'),
        $api('/my/store-quote-requests?per_page=100')
      ])

      const failedSections: string[] = []

      // المنتجات
      const productsResult = results[0]!

      if (productsResult.status === 'fulfilled') {
        const result = supplierList<StoreProduct>(
          productsResult.value
        )

        products.value = result.items
        productCount.value = result.total
      } else {
        products.value = []
        productCount.value = 0
        failedSections.push('المنتجات')
      }

      // طلبات الشراء
      const ordersResult = results[1]!

      if (ordersResult.status === 'fulfilled') {
        const result = supplierList<StoreOrder>(
          ordersResult.value
        )

        orders.value = result.items
        orderCount.value = result.total
      } else {
        orders.value = []
        orderCount.value = 0
        failedSections.push('طلبات الشراء')
      }

      // طلبات عروض الأسعار
      const quotesResult = results[2]!

      if (quotesResult.status === 'fulfilled') {
        const result = supplierList<StoreQuote>(
          quotesResult.value
        )

        quotes.value = result.items
        quoteCount.value = result.total
      } else {
        quotes.value = []
        quoteCount.value = 0
        failedSections.push('عروض الأسعار')
      }

      // كشف البيانات الناقصة بسبب ترقيم الصفحات
      hasPartialData.value =
        productCount.value > products.value.length ||
        orderCount.value > orders.value.length ||
        quoteCount.value > quotes.value.length

      if (failedSections.length > 0) {
        error.value =
          `تعذر تحميل: ${failedSections.join('، ')}. ` +
          'قد تكون المؤشرات غير مكتملة.'
      }
    } catch (err) {
      error.value = supplierError(err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    storeName,
    isApproved,
    products,
    orders,
    quotes,
    productCount,
    orderCount,
    quoteCount,
    activeOrders,
    pendingOrders,
    pendingQuotes,
    lowStock,
    completedSales,
    recentActivity,
    monthlySales,
    maxMonthlySales,
    hasPartialData,
    isLoading,
    error,
    refresh
  }
}
