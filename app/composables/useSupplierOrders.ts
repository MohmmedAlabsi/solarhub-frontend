import { ref, computed, onMounted } from 'vue'
import type {
  SupplierOrderItem,
  SupplierOrderProductItem,
  SupplierOrderStatus,
} from '~/types/supplier-order'

function resolveOrderItemImage(it: any): string {
  if (it?.image && (it.image.startsWith('http://') || it.image.startsWith('https://'))) {
    return it.image
  }
  const title = (it?.product_title || it?.title || '').toLowerCase()
  const cat = (it?.category || '').toLowerCase()

  if (title.includes('لوح') || cat.includes('لوح') || title.includes('panel')) return '/images/product-panel.png'
  if (title.includes('إنفرتر') || title.includes('انفرتر') || cat.includes('انفرتر') || title.includes('inverter')) return '/images/product-inverter.png'
  if (title.includes('بطارية') || cat.includes('بطارية') || title.includes('battery')) return '/images/product-battery.png'
  if (title.includes('منظومة') || cat.includes('kit')) return '/images/product-kit.png'

  return '/images/hero-solar.png'
}

export function useSupplierOrders() {
  const { $api } = useNuxtApp()

  const orders = ref<SupplierOrderItem[]>([])
  const isLoading = ref(false)
  const isUpdating = ref(false)
  const errorMessage = ref('')
  const noticeMessage = ref('')
  let noticeTimer: ReturnType<typeof setTimeout> | undefined

  // الفلاتر
  const searchQuery = ref('')
  const selectedStatus = ref('all')
  const selectedPeriod = ref('all')

  // الترقيم
  const currentPage = ref(1)
  const perPage = ref(6)

  function showNotice(msg: string) {
    noticeMessage.value = msg
    if (noticeTimer) clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => {
      noticeMessage.value = ''
    }, 4000)
  }

  function formatArabicDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '–'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('ar-YE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  function mapApiOrder(os: any): SupplierOrderItem {
    const parentOrder = os.order || {}
    const customer = parentOrder.customer || {}
    const itemsRaw = Array.isArray(os.items) ? os.items : []

    const mappedItems: SupplierOrderProductItem[] = itemsRaw.map((it: any) => {
      const sp = it.store_product || it.storeProduct || {}
      const mp = sp.master_product || sp.masterProduct || {}
      const unitPrice = Number(it.unit_price) || 0
      const qty = Number(it.quantity) || 1
      const total = Number(it.total_price) || unitPrice * qty

      return {
        id: it.id,
        title: it.product_title || mp.title || 'منتج طاقة شمسية',
        referenceNumber: it.product_model || mp.model_number || sp.sku || `SKU-${it.id}`,
        brand: it.brand || mp.brand?.name || 'SolarHub',
        category: it.category || mp.category?.name_ar || 'طاقة شمسية',
        warrantyLabel: it.warranty_period || sp.warranty_period || '–',
        image: resolveOrderItemImage(it),
        quantity: qty,
        unitLabel: 'قطعة',
        unitPrice,
        totalPrice: total,
      }
    })

    const subtotal = Number(os.subtotal) || mappedItems.reduce((acc, it) => acc + it.totalPrice, 0)
    const tax = Math.round(subtotal * 0.15 * 100) / 100
    const total = subtotal + tax

    const itemsSummary = mappedItems.length > 0
      ? mappedItems.map((i) => `${i.title} (${i.quantity})`).join(' + ')
      : 'عناصر طلب الشراء'

    return {
      id: os.id,
      order_id: parentOrder.id || os.order_id || os.id,
      orderNumber: parentOrder.order_number || `#ORD-${os.id}`,
      createdAt: formatArabicDate(parentOrder.created_at || os.created_at),
      clientName: customer.name || 'عميل مسجل',
      clientPhone: customer.phone || '–',
      deliveryAddress: parentOrder.delivery_address || 'عنوان العميل المحدد',
      governorate: parentOrder.governorate?.name || '–',
      itemsSummary,
      totalItemsCount: mappedItems.reduce((acc, it) => acc + it.quantity, 0) || 1,
      unitLabel: mappedItems[0]?.unitLabel || 'قطعة',
      subtotal,
      taxAmount: tax,
      totalStoreShare: total,
      status: (os.status as SupplierOrderStatus) || 'pending',
      notes: os.notes || '',
      deliveredAt: os.delivered_at,
      customerConfirmedAt: os.customer_confirmed_at,
      items: mappedItems,
    }
  }

  async function fetchOrders() {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const res = await $api<any>('/my/store-orders')
      const raw = Array.isArray(res) ? res : res?.data || []
      if (Array.isArray(raw)) {
        orders.value = raw.map(mapApiOrder)
      } else {
        orders.value = []
      }
    } catch (err: any) {
      console.error('Could not fetch store orders from API:', err)
      orders.value = []
      errorMessage.value = err?.data?.message || 'تعذر الاتصال بالخادم لجلب طلبات الشراء.'
    } finally {
      isLoading.value = false
    }
  }

  const filteredOrders = computed(() => {
    let result = orders.value

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.clientName.toLowerCase().includes(q) ||
          o.itemsSummary.toLowerCase().includes(q) ||
          o.deliveryAddress.toLowerCase().includes(q) ||
          (o.clientPhone && o.clientPhone.includes(q))
      )
    }

    if (selectedStatus.value !== 'all') {
      result = result.filter((o) => o.status === selectedStatus.value)
    }

    return result
  })

  const totalPages = computed(() => {
    return Math.max(1, Math.ceil(filteredOrders.value.length / perPage.value))
  })

  const paginatedOrders = computed(() => {
    const start = (currentPage.value - 1) * perPage.value
    return filteredOrders.value.slice(start, start + perPage.value)
  })

  function changePage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  async function updateOrderStatus(
    orderStoreId: number,
    newStatus: SupplierOrderStatus,
    notes?: string
  ): Promise<boolean> {
    isUpdating.value = true

    // التحديث المتفائل السريع
    const target = orders.value.find((o) => o.id === orderStoreId)
    const prevStatus = target?.status
    if (target) {
      target.status = newStatus
    }

    try {
      await $api<any>(`/order-stores/${orderStoreId}/status`, {
        method: 'PATCH',
        body: {
          status: newStatus,
          notes: notes || undefined,
        },
      })

      const statusLabels: Record<string, string> = {
        accepted: 'تم قبول طلب الشراء وبدء تجهيز الشحنة في المستودع.',
        shipped: 'تم تأكيد شحن الطلب وتحديث حالة التوصيل للعميل.',
        delivered: 'تم تسجيل تسليم الطلب إلى العميل بنجاح.',
        rejected: 'تم رفض طلب الشراء وإشعار العميل.',
        cancelled: 'تم إلغاء طلب الشراء واستعادة المخزون.',
      }

      showNotice(statusLabels[newStatus] || 'تم تحديث حالة طلب الشراء بنجاح.')
      return true
    } catch (err: any) {
      // استعادة الحالة السابقة عند الفشل
      if (target && prevStatus) {
        target.status = prevStatus
      }
      console.error('Failed to update order store status:', err)
      const msg = err?.data?.message || 'حدث خطأ أثناء تحديث حالة الطلب. يرجى المحاولة لاحقاً.'
      showNotice(msg)
      return false
    } finally {
      isUpdating.value = false
    }
  }

  function exportOrders() {
    if (orders.value.length === 0) {
      showNotice('لا توجد بيانات متاحة للتصدير.')
      return
    }

    const headers = ['رقم الطلب', 'اسم العميل', 'رقم الهاتف', 'العنوان', 'المحافظة', 'عدد العناصر', 'الإجمالي', 'الحالة', 'تاريخ الإنشاء']
    const rows = orders.value.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.clientName.replace(/"/g, '""')}"`,
      `"${o.clientPhone}"`,
      `"${o.deliveryAddress.replace(/"/g, '""')}"`,
      `"${o.governorate}"`,
      o.totalItemsCount,
      o.totalStoreShare,
      `"${o.status}"`,
      `"${o.createdAt}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `طلبات_شراء_المتجر_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showNotice('تم تصدير كشف طلبات الشراء بنجاح.')
  }

  onMounted(() => {
    fetchOrders()
  })

  return {
    orders,
    isLoading,
    isUpdating,
    errorMessage,
    noticeMessage,
    searchQuery,
    selectedStatus,
    selectedPeriod,
    currentPage,
    totalPages,
    perPage,
    filteredOrders,
    paginatedOrders,
    fetchOrders,
    changePage,
    updateOrderStatus,
    exportOrders,
  }
}
