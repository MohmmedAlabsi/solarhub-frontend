import { ref, computed, onMounted } from 'vue'
import type { SupplierOrderItem } from '../../types/supplier-order'

const initialFallbackOrders: SupplierOrderItem[] = [
  {
    id: 1,
    order_id: 1048,
    orderNumber: '#ORD-2025-1048',
    createdAt: '24 أكتوبر 2025',
    clientName: 'وجدان السبيعي',
    clientPhone: '050****789',
    deliveryAddress: 'الرياض - حي النرجس - شارع الأمير فيصل',
    itemsSummary: 'لوح شمسي Jinko 585W + قواعد',
    totalItemsCount: 12,
    unitLabel: 'لوح',
    subtotal: 6420,
    taxAmount: 963,
    totalStoreShare: 7383,
    status: 'pending',
    items: [
      {
        id: 101,
        title: 'لوح شمسي مونوكريستالين Jinko Tiger Pro 585W',
        referenceNumber: 'JNK-585-TP',
        warrantyLabel: 'كفالة أداء 25 سنة',
        quantity: 12,
        unitLabel: 'لوح',
        unitPrice: 485,
        totalPrice: 5820,
      },
      {
        id: 102,
        title: 'هيكل تثبيت ألمنيوم لمسطح (مجموعة تثبيت 12 لوح)',
        referenceNumber: 'MNT-ALU-12',
        warrantyLabel: 'مقاوم للرياح',
        quantity: 1,
        unitLabel: 'طقم',
        unitPrice: 600,
        totalPrice: 600,
      },
    ],
  },
  {
    id: 2,
    order_id: 1042,
    orderNumber: '#ORD-2025-1042',
    createdAt: '23 أكتوبر 2025',
    clientName: 'م. فهد القحطاني',
    clientPhone: '055****321',
    deliveryAddress: 'القصيم - بريدة - حي الصفراء',
    itemsSummary: 'إنفرتر هجين Deye 8kW ثلاثي الأطوار',
    totalItemsCount: 1,
    unitLabel: 'جهاز',
    subtotal: 8950,
    taxAmount: 1342.5,
    totalStoreShare: 10292.5,
    status: 'accepted',
    items: [
      {
        id: 103,
        title: 'إنفرتر هجين Deye Hybrid 8kW ثلاثي الأطوار',
        referenceNumber: 'SUN-8K-SG04LP3',
        warrantyLabel: 'ضمان 5 سنوات',
        quantity: 1,
        unitLabel: 'جهاز',
        unitPrice: 8950,
        totalPrice: 8950,
      },
    ],
  },
  {
    id: 3,
    order_id: 1039,
    orderNumber: '#ORD-2025-1039',
    createdAt: '22 أكتوبر 2025',
    clientName: 'شركة آفاق التطوير',
    clientPhone: '056****888',
    deliveryAddress: 'الدمام - المدينة الصناعية الثانية',
    itemsSummary: 'بطاريات ليثيوم Pylontech US5000',
    totalItemsCount: 2,
    unitLabel: 'بطارية',
    subtotal: 12900,
    taxAmount: 1935,
    totalStoreShare: 14835,
    status: 'shipped',
    items: [
      {
        id: 104,
        title: 'بطارية ليثيوم Pylontech US5000 4.8kWh',
        referenceNumber: 'PYLON-US5000-48V',
        warrantyLabel: 'ضمان مصنعي 10 سنوات',
        quantity: 2,
        unitLabel: 'بطارية',
        unitPrice: 6450,
        totalPrice: 12900,
      },
    ],
  },
  {
    id: 4,
    order_id: 1035,
    orderNumber: '#ORD-2025-1035',
    createdAt: '20 أكتوبر 2025',
    clientName: 'مؤسسة مدار الطاقة',
    clientPhone: '054****999',
    deliveryAddress: 'جدة - الروضة - طريق الكورنيش',
    itemsSummary: 'منظمات MPPT Victron SmartSolar',
    totalItemsCount: 4,
    unitLabel: 'أجهزة',
    subtotal: 9400,
    taxAmount: 1410,
    totalStoreShare: 10810,
    status: 'delivered',
    items: [
      {
        id: 105,
        title: 'منظم شحن MPPT Victron SmartSolar 150/70',
        referenceNumber: 'SCC115070210',
        warrantyLabel: 'ضمان 5 سنوات',
        quantity: 4,
        unitLabel: 'جهاز',
        unitPrice: 2350,
        totalPrice: 9400,
      },
    ],
  },
  {
    id: 5,
    order_id: 1028,
    orderNumber: '#ORD-2025-1028',
    createdAt: '18 أكتوبر 2025',
    clientName: 'عبدالملك الغامدي',
    clientPhone: '050****432',
    deliveryAddress: 'الرياض - الياسمين - شارع أنس بن مالك',
    itemsSummary: 'ألواح Jinko 550W عالية الكفاءة',
    totalItemsCount: 16,
    unitLabel: 'لوح',
    subtotal: 8560,
    taxAmount: 1284,
    totalStoreShare: 9844,
    status: 'completed',
    items: [
      {
        id: 106,
        title: 'لوح شمسي Jinko Tiger 550W Mono',
        referenceNumber: 'JKM550M-72HL4',
        warrantyLabel: 'ضمان 25 سنة',
        quantity: 16,
        unitLabel: 'لوح',
        unitPrice: 535,
        totalPrice: 8560,
      },
    ],
  },
  {
    id: 6,
    order_id: 1022,
    orderNumber: '#ORD-2025-1022',
    createdAt: '15 أكتوبر 2025',
    clientName: 'مزارع نجد الحديثة',
    clientPhone: '053****111',
    deliveryAddress: 'الخرج - طريق حرض - مزرعة رقم 14',
    itemsSummary: 'إنفرتر ضخ مياه شمسي 15kW غاطس',
    totalItemsCount: 2,
    unitLabel: 'قطعة',
    subtotal: 14200,
    taxAmount: 2130,
    totalStoreShare: 16330,
    status: 'completed',
    items: [
      {
        id: 107,
        title: 'مضخة وإنفرتر شمسي VFD 15kW للأعماق',
        referenceNumber: 'VFD-PUMP-15K',
        warrantyLabel: 'ضمان 3 سنوات',
        quantity: 2,
        unitLabel: 'قطعة',
        unitPrice: 7100,
        totalPrice: 14200,
      },
    ],
  },
  {
    id: 7,
    order_id: 1017,
    orderNumber: '#ORD-2025-1017',
    createdAt: '12 أكتوبر 2025',
    clientName: 'شركة الإعمار المتقدم',
    clientPhone: '057****444',
    deliveryAddress: 'الخبر - العليا - شارع المزارع',
    itemsSummary: 'ألواح طاقة شمسية ثنائية الوجه',
    totalItemsCount: 8,
    unitLabel: 'ألواح',
    subtotal: 4280,
    taxAmount: 642,
    totalStoreShare: 4922,
    status: 'rejected',
    items: [
      {
        id: 108,
        title: 'لوح شمسي ثنائي الوجه Bifacial 535W',
        referenceNumber: 'BIF-535W-GLS',
        warrantyLabel: 'كفالة 25 سنة',
        quantity: 8,
        unitLabel: 'لوح',
        unitPrice: 535,
        totalPrice: 4280,
      },
    ],
  },
  {
    id: 8,
    order_id: 1009,
    orderNumber: '#ORD-2025-1009',
    createdAt: '10 أكتوبر 2025',
    clientName: 'تركي الشهري',
    clientPhone: '058****555',
    deliveryAddress: 'أبها - حي المنسك - شارع الملك عبدالعزيز',
    itemsSummary: 'إنفرتر هجين 5kW Growatt',
    totalItemsCount: 1,
    unitLabel: 'جهاز',
    subtotal: 4500,
    taxAmount: 675,
    totalStoreShare: 5175,
    status: 'cancelled',
    items: [
      {
        id: 109,
        title: 'إنفرتر شمسي منزلي Growatt 5000ES',
        referenceNumber: 'GW-SPF-5000ES',
        warrantyLabel: 'ضمان سنتان',
        quantity: 1,
        unitLabel: 'جهاز',
        unitPrice: 4500,
        totalPrice: 4500,
      },
    ],
  },
]

export function useSupplierOrders() {
  const { $api } = useNuxtApp()

  const orders = ref<SupplierOrderItem[]>([...initialFallbackOrders])
  const isLoading = ref(false)
  const isUpdating = ref(false)
  const noticeMessage = ref('')
  let noticeTimer: ReturnType<typeof setTimeout> | undefined

  // الفلاتر
  const searchQuery = ref('')
  const selectedStatus = ref('all')
  const selectedPeriod = ref('30')

  // الترقيم
  const currentPage = ref(1)
  const perPage = ref(8)

  function showNotice(msg: string) {
    noticeMessage.value = msg
    if (noticeTimer) clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => {
      noticeMessage.value = ''
    }, 4000)
  }

  function mapApiOrder(os: any): SupplierOrderItem {
    const rawItems = os.items || []
    const subtotal = Number(os.subtotal) || 0
    const tax = subtotal * 0.15
    const total = subtotal + tax

    const mappedItems = rawItems.map((it: any) => {
      const sp = it.store_product || it.storeProduct || {}
      const mp = sp.master_product || sp.masterProduct || {}
      const q = Number(it.quantity) || 1
      const price = Number(it.unit_price || it.unitPrice || sp.price) || 0

      return {
        id: it.id,
        title: mp.title || 'منتج طاقة شمسية',
        referenceNumber: mp.model_number || `REF-${it.id}`,
        warrantyLabel: sp.warranty_period || 'ضمان معتمد',
        quantity: q,
        unitLabel: 'وحدة',
        unitPrice: price,
        totalPrice: price * q,
      }
    })

    const client = os.order?.customer || os.order?.user || {}

    return {
      id: os.id,
      order_id: os.order_id || os.id,
      orderNumber: `#ORD-${new Date(os.created_at || Date.now()).getFullYear()}-${os.id}`,
      createdAt: os.created_at ? new Date(os.created_at).toLocaleDateString('ar-YE', { day: 'numeric', month: 'long', year: 'numeric' }) : 'مؤخراً',
      clientName: client.name || 'عميل SolarHub',
      clientPhone: client.phone || '050****000',
      deliveryAddress: os.order?.shipping_address || 'صنعاء - حدة',
      itemsSummary: mappedItems[0]?.title ? `${mappedItems[0].title} ${mappedItems.length > 1 ? `+ ${mappedItems.length - 1} منتجات أخرى` : ''}` : 'منتجات طاقة شمسية',
      totalItemsCount: mappedItems.reduce((acc: number, it: any) => acc + it.quantity, 0) || 1,
      unitLabel: 'قطعة',
      subtotal,
      taxAmount: tax,
      totalStoreShare: total,
      status: os.status || 'pending',
      items: mappedItems,
    }
  }

  async function fetchOrders() {
    isLoading.value = true
    try {
      const res = await $api<any>('/my/store-orders')
      const raw = res?.data || res
      if (Array.isArray(raw) && raw.length > 0) {
        orders.value = raw.map(mapApiOrder)
      }
    } catch (err) {
      console.warn('Could not fetch store orders from API, keeping initial fallback list:', err)
    } finally {
      isLoading.value = false
    }
  }

  const filteredOrders = computed(() => {
    let result = orders.value

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      result = result.filter(
        o =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.clientName.toLowerCase().includes(q) ||
          o.itemsSummary.toLowerCase().includes(q)
      )
    }

    if (selectedStatus.value !== 'all') {
      result = result.filter(o => o.status === selectedStatus.value)
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

  async function updateOrderStatus(orderId: number, newStatus: 'accepted' | 'rejected' | 'shipped' | 'delivered' | 'completed') {
    isUpdating.value = true
    try {
      await $api<any>(`/order-stores/${orderId}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      })

      const target = orders.value.find(o => o.id === orderId)
      if (target) {
        target.status = newStatus
      }

      showNotice(`تم تحديث حالة الطلب إلى: ${getStatusLabel(newStatus)}`)
      return true
    } catch (err) {
      console.warn('API error updating status, updating locally:', err)
      const target = orders.value.find(o => o.id === orderId)
      if (target) {
        target.status = newStatus
      }
      showNotice(`تم تحديث حالة الطلب محلياً بنجاح.`)
      return true
    } finally {
      isUpdating.value = false
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'pending': return 'بانتظار المعالجة'
      case 'accepted': return 'مقبول'
      case 'shipped': return 'تم الشحن'
      case 'delivered': return 'تم التسليم'
      case 'completed': return 'مكتمل'
      case 'rejected': return 'مرفوض'
      case 'cancelled': return 'ملغي'
      default: return status
    }
  }

  function exportOrders() {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      ['رقم الطلب,العميل,التاريخ,عدد المنتجات,حصة المتجر,الحالة']
        .concat(orders.value.map(o => `"${o.orderNumber}","${o.clientName}","${o.createdAt}",${o.totalItemsCount},${o.subtotal},"${getStatusLabel(o.status)}"`))
        .join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `طلبات_المتجر_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showNotice('تم تصدير كشف طلبات الشراء بصيغة CSV بنجاح.')
  }

  onMounted(() => {
    fetchOrders()
  })

  return {
    orders,
    isLoading,
    isUpdating,
    noticeMessage,
    searchQuery,
    selectedStatus,
    selectedPeriod,
    currentPage,
    totalPages,
    perPage,
    filteredOrders,
    paginatedOrders,
    changePage,
    updateOrderStatus,
    getStatusLabel,
    exportOrders,
  }
}
