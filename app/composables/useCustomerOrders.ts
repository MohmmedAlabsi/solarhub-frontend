import type { Governorate, WalletProvider } from '../../types/api'

export interface ApiOrder {
  id: number
  order_number: string
  total_amount: number | string
  delivery_address: string
  delivery_coordinates?: string | null
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled'
  created_at: string
  customer?: {
    id: number
    name: string
    phone?: string
    email?: string
  }
  governorate?: {
    id: number
    name_ar: string
  }
  order_stores?: ApiOrderStore[]
}

export interface ApiOrderStore {
  id: number
  order_id: number
  store_id: number
  subtotal: number | string
  shipping_cost: number | string
  total: number | string
  status: 'pending' | 'accepted' | 'shipped' | 'delivered' | 'completed' | 'rejected' | 'cancelled'
  notes?: string | null
  store?: {
    id: number
    company_name: string
    commercial_registry?: string
    whatsapp_number?: string
    company_logo_path?: string | null
  }
  items?: ApiOrderItem[]
}

export interface ApiOrderItem {
  id: number
  store_product_id: number
  quantity: number
  unit_price: number | string
  total_price: number | string
  store_product?: {
    id: number
    price: number | string
    master_product?: {
      id: number
      title: string
      model_number?: string | null
      category?: { name_ar: string }
      images?: { image_url?: string; image_path?: string }[]
    }
  }
}

export interface ApiQuoteRequest {
  id: number
  customer_id: number
  store_product_id: number
  quantity: number
  customer_target_price?: number | string | null
  customer_notes?: string | null
  status: 'pending' | 'responded' | 'accepted' | 'rejected'
  store_offered_price?: number | string | null
  store_notes?: string | null
  responded_at?: string | null
  created_at: string
  store_product?: {
    id: number
    price: number | string
    store?: {
      id: number
      company_name: string
      whatsapp_number?: string
    }
    master_product?: {
      id: number
      title: string
      model_number?: string | null
      category?: { name_ar: string }
    }
  }
}

export const useCustomerOrders = () => {
  const { $api } = useNuxtApp()

  const orders = ref<ApiOrder[]>([])
  const quoteRequests = ref<ApiQuoteRequest[]>([])
  const walletProviders = useState<WalletProvider[]>('customer_wallet_providers', () => [])
  const governorates = useState<Governorate[]>('customer_governorates_list', () => [])

  const isLoading = ref(false)
  const isActionLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * جلب المحافظات
   */
  const fetchGovernorates = async (): Promise<Governorate[]> => {
    if (governorates.value.length > 0) return governorates.value
    try {
      const res: any = await $api('/governorates')
      governorates.value = Array.isArray(res) ? res : (res?.data || [])
      return governorates.value
    } catch {
      return []
    }
  }

  /**
   * جلب مزودي المحافظ الإلكترونية
   */
  const fetchWalletProviders = async (): Promise<WalletProvider[]> => {
    if (walletProviders.value.length > 0) return walletProviders.value
    try {
      const res: any = await $api('/wallet_providers')
      walletProviders.value = Array.isArray(res) ? res : (res?.data || [])
      return walletProviders.value
    } catch {
      return []
    }
  }

  /**
   * جلب قائمة طلباتي (Orders)
   */
  const fetchMyOrders = async (): Promise<ApiOrder[]> => {
    isLoading.value = true
    error.value = null
    try {
      const res: any = await $api('/my/orders')
      const list = Array.isArray(res) ? res : (res?.data || [])
      orders.value = list
      return list
    } catch (err: any) {
      error.value = err?.userMessage || err?.message || 'تعذر تحميل قائمة الطلبات.'
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * جلب تفاصيل طلب محدد (بما فيها المتاجر وعناصر السلة)
   */
  const fetchOrderDetails = async (orderId: number | string): Promise<ApiOrder | null> => {
    isLoading.value = true
    error.value = null
    try {
      const res: any = await $api(`/my/orders/${orderId}`)
      const order = res?.data || res
      return order
    } catch (err: any) {
      error.value = err?.userMessage || err?.message || 'تعذر تحميل تفاصيل الطلب.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * تحويل السلة لطلب شراء حقيقي (Checkout)
   */
  const placeOrder = async (data: {
    delivery_governorate_id?: number | null
    delivery_address: string
    delivery_coordinates?: string | null
  }): Promise<ApiOrder> => {
    isActionLoading.value = true
    try {
      const res: any = await $api('/my/orders', {
        method: 'POST',
        body: data,
      })
      const createdOrder = res?.data || res
      return createdOrder
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * إلغاء طلب قيد المعالجة (Cancel Order)
   */
  const cancelOrder = async (orderId: number | string): Promise<ApiOrder> => {
    isActionLoading.value = true
    try {
      const res: any = await $api(`/my/orders/${orderId}/cancel`, {
        method: 'PATCH',
      })
      const cancelledOrder = res?.data || res
      // تحديث القائمة المحلية
      const idx = orders.value.findIndex(o => Number(o.id) === Number(orderId))
      if (idx > -1) {
        orders.value[idx] = cancelledOrder
      }
      return cancelledOrder
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * تأكيد استلام الشحنة من قبل العميل (Confirm Delivery)
   */
  const confirmDelivery = async (orderStoreId: number | string): Promise<any> => {
    isActionLoading.value = true
    try {
      const res: any = await $api(`/order-stores/${orderStoreId}/confirm-delivery`, {
        method: 'PATCH',
      })
      return res?.data || res
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * جلب طلبات عروض الأسعار (RFQ) للعميل
   */
  const fetchMyQuoteRequests = async (): Promise<ApiQuoteRequest[]> => {
    isLoading.value = true
    error.value = null
    try {
      const res: any = await $api('/my/quote-requests')
      const list = Array.isArray(res) ? res : (res?.data || [])
      quoteRequests.value = list
      return list
    } catch (err: any) {
      error.value = err?.userMessage || err?.message || 'تعذر تحميل طلبات عروض الأسعار.'
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * قبول عرض السعر المقدم من المورد (Accept Quote)
   */
  const acceptQuoteRequest = async (quoteId: number | string): Promise<ApiQuoteRequest> => {
    isActionLoading.value = true
    try {
      const res: any = await $api(`/quote-requests/${quoteId}/accept`, {
        method: 'PATCH',
      })
      const updated = res?.data || res
      const idx = quoteRequests.value.findIndex(q => Number(q.id) === Number(quoteId))
      if (idx > -1) {
        quoteRequests.value[idx] = updated
      }
      return updated
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * رفض عرض السعر المقدم من المورد (Reject Quote)
   */
  const rejectQuoteRequest = async (quoteId: number | string): Promise<ApiQuoteRequest> => {
    isActionLoading.value = true
    try {
      const res: any = await $api(`/quote-requests/${quoteId}/reject`, {
        method: 'PATCH',
      })
      const updated = res?.data || res
      const idx = quoteRequests.value.findIndex(q => Number(q.id) === Number(quoteId))
      if (idx > -1) {
        quoteRequests.value[idx] = updated
      }
      return updated
    } finally {
      isActionLoading.value = false
    }
  }

  return {
    orders,
    quoteRequests,
    governorates,
    walletProviders,
    isLoading,
    isActionLoading,
    error,
    fetchGovernorates,
    fetchWalletProviders,
    fetchMyOrders,
    fetchOrderDetails,
    placeOrder,
    cancelOrder,
    confirmDelivery,
    fetchMyQuoteRequests,
    acceptQuoteRequest,
    rejectQuoteRequest,
  }
}
