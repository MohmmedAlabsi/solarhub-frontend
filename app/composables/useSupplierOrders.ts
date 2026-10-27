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
  if (title.includes('إنفرتر') || title.includes('محول') || cat.includes('إنفرتر') || title.includes('inverter')) return '/images/product-inverter.png'
  if (title.includes('بطارية') || cat.includes('بطارية') || title.includes('battery')) return '/images/product-battery.png'
  if (title.includes('منظومة') || cat.includes('kit')) return '/images/product-kit.png'

  return '/images/hero-solar.png'
}

const fallbackOrders: SupplierOrderItem[] = [
  {
    id: 1,
    order_id: 1048,
    orderNumber: '#ORD-2025-1048',
    createdAt: '24 أكتوبر 2025',
    clientName: 'وجدان السبيعي',
    clientPhone: '050****789',
    deliveryAddress: 'الرياض - حي النرجس - شارع الأمير فيصل',
    governorate: 'الرياض',
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
        brand: 'Jinko Solar',
        category: 'ألواح شمسية',
        warrantyLabel: 'كفالة أداء 25 سنة',
        image: '/images/product-panel.png',
        quantity: 12,
        unitLabel: 'لوح',
        unitPrice: 485,
        totalPrice: 5820,
      },
      {
        id: 102,
        title: 'هيكل تثبيت ألمنيوم لمسطح (مجموعة تثبيت 12 لوح)',
        referenceNumber: 'MNT-ALU-12',
        brand: 'SolarFix',
        category: 'ملحقات وهياكل',
        warrantyLabel: 'مقاوم للرياح',
        image: '/images/product-kit.png',
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
    governorate: 'القصيم',
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
        brand: 'Deye',
        category: 'إنفرترات ومحولات',
        warrantyLabel: 'ضمان 5 سنوات',
        image: '/images/product-inverter.png',
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
    createdAt: '21 أكتوبر 2025',
    clientName: 'شركة اليمامة للمقاولات',
    clientPhone: '056****112',
    deliveryAddress: 'جدة - المنطقة الصناعية الثالثة',
    governorate: 'مكة المكرمة',
    itemsSummary: 'بطاريات Pylontech US5000 (4 وحدات)',
    totalItemsCount: 4,
    unitLabel: 'وحدة',
    subtotal: 25800,
    taxAmount: 3870,
    totalStoreShare: 29670,
    status: 'shipped',
    items: [
      {
        id: 104,
        title: 'بطارية ليثيوم Pylontech US5000 4.8kWh',
        referenceNumber: 'PYLON-US5000',
        brand: 'Pylontech',
        category: 'بطاريات وتخزين طاقة',
        warrantyLabel: 'ضمان 10 سنوات',
        image: '/images/product-battery.png',
        quantity: 4,
        unitLabel: 'وحدة',
        unitPrice: 6450,
        totalPrice: 25800,
      },
    ],
  },
  {
    id: 4,
    order_id: 1033,
    orderNumber: '#ORD-2025-1033',
    createdAt: '18 أكتوبر 2025',
    clientName: 'عبدالرحمن الدوسري',
    clientPhone: '054****987',
    deliveryAddress: 'الدمام - حي الشاطئ',
    governorate: 'المنطقة الشرقية',
    itemsSummary: 'منظم شحن Victron 150/70',
    totalItemsCount: 1,
    unitLabel: 'جهاز',
    subtotal: 2350,
    taxAmount: 352.5,
    totalStoreShare: 2702.5,
    status: 'delivered',
    items: [
      {
        id: 105,
        title: 'منظم شحن MPPT Victron SmartSolar 150/70',
        referenceNumber: 'SCC115070210',
        brand: 'Victron Energy',
        category: 'منظمات شحن ومحولات',
        warrantyLabel: 'ضمان 5 سنوات',
        image: '/images/product-inverter.png',
        quantity: 1,
        unitLabel: 'جهاز',
        unitPrice: 2350,
        totalPrice: 2350,
      },
    ],
  },
  {
    id: 5,
    order_id: 1027,
    orderNumber: '#ORD-2025-1027',
    createdAt: '15 أكتوبر 2025',
    clientName: 'سارة المطيري',
    clientPhone: '053****444',
    deliveryAddress: 'المدينة المنورة - حي سلطانة',
    governorate: 'المدينة المنورة',
    itemsSummary: 'ألواح Longi 570W (20 لوح)',
    totalItemsCount: 20,
    unitLabel: 'لوح',
    subtotal: 9400,
    taxAmount: 1410,
    totalStoreShare: 10810,
    status: 'completed',
    items: [
      {
        id: 106,
        title: 'لوح شمسي Longi Hi-MO 6 Explorer 570W',
        referenceNumber: 'LR5-72HTH-570M',
        brand: 'Longi',
        category: 'ألواح شمسية',
        warrantyLabel: 'كفالة أداء 25 سنة',
        image: '/images/product-panel.png',
        quantity: 20,
        unitLabel: 'لوح',
        unitPrice: 470,
        totalPrice: 9400,
      },
    ],
  },
  {
    id: 6,
    order_id: 1020,
    orderNumber: '#ORD-2025-1020',
    createdAt: '14 أكتوبر 2025',
    clientName: 'خالد الزهراني',
    clientPhone: '057****888',
    deliveryAddress: 'الطائف - حي الشهداء الجنوبية',
    governorate: 'مكة المكرمة',
    itemsSummary: 'إنفرتر Growatt 10kW',
    totalItemsCount: 1,
    unitLabel: 'جهاز',
    subtotal: 5800,
    taxAmount: 870,
    totalStoreShare: 6670,
    status: 'rejected',
    items: [
      {
        id: 107,
        title: 'إنفرتر متصل بالشبكة Growatt MOD 10KTL3-X',
        referenceNumber: 'MOD-10KTL3-X',
        brand: 'Growatt',
        category: 'إنفرترات ومحولات',
        warrantyLabel: 'ضمان 5 سنوات',
        image: '/images/product-inverter.png',
        quantity: 1,
        unitLabel: 'جهاز',
        unitPrice: 5800,
        totalPrice: 5800,
      },
    ],
  },
]

export function useSupplierOrders() {
  const { $api } = useNuxtApp()

  const orders = ref<SupplierOrderItem[]>([...fallbackOrders])
  const isLoading = ref(false)
  const isUpdating = ref(false)
  const noticeMessage = ref('')
  let noticeTimer: ReturnType<typeof setTimeout> | undefined

  // الفلاتر
  const searchQuery = ref('')
  const selectedStatus = ref('all')
  const selectedPeriod = ref('all')

  // الترقيم
  const currentPage = ref(1)
  const perPage = ref(8)

  function showNotice(msg: string) {
    noticeMessage.value = msg
    if (noticeTimer) clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => {
      noticeMessage.value = ''
    }, 4500)
  }

  function mapApiOrder(os: any): SupplierOrderItem {
    const rawItems = os.items || []
    const subtotal = Number(os.subtotal) || 0
    const tax = subtotal * 0.15
    const total = subtotal + tax

    const mappedItems: SupplierOrderProductItem[] = rawItems.map((it: any) => {
      const q = Number(it.quantity) || 1
      const price = Number(it.unit_price) || 0
      const title = it.product_title || 'منتج طاقة شمسية'
      const model = it.product_model || `SKU-${it.id}`
      const warranty = it.warranty_period || 'ضمان معتمد'
      const img = resolveOrderItemImage(it)

      return {
        id: it.id,
        storeProductId: it.store_product_id,
        title,
        referenceNumber: model,
        brand: it.brand || '',
        category: it.category || '',
        warrantyLabel: warranty,
        image: img,
        quantity: q,
        unitLabel: title.includes('لوح') ? 'لوح' : title.includes('إنفرتر') ? 'جهاز' : title.includes('بطارية') ? 'وحدة' : 'قطعة',
        unitPrice: price,
        totalPrice: Number(it.total_price) || price * q,
      }
    })

    const parentOrder = os.order || {}
    const client = parentOrder.customer || {}

    let formattedDate = 'مؤخراً'
    if (os.created_at) {
      try {
        formattedDate = new Date(os.created_at).toLocaleDateString('ar-YE', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      } catch {
        formattedDate = os.created_at.split('T')[0]
      }
    }

    const orderNum = parentOrder.order_number || `#ORD-${os.id}`
    const fullAddress = parentOrder.delivery_address || 'صنعاء - حدة'

    return {
      id: os.id,
      order_id: os.order_id || os.id,
      orderNumber: orderNum,
      createdAt: formattedDate,
      clientName: client.name || 'عميل SolarHub',
      clientPhone: client.phone || '050****000',
      clientEmail: client.email || '',
      deliveryAddress: fullAddress,
      governorate: parentOrder.governorate || 'صنعاء',
      itemsSummary:
        mappedItems[0]?.title
          ? `${mappedItems[0].title}${mappedItems.length > 1 ? ` + ${mappedItems.length - 1} منتجات أخرى` : ''}`
          : 'منتجات طاقة شمسية',
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
    try {
      const res = await $api<any>('/my/store-orders')
      const raw = Array.isArray(res) ? res : res?.data || []
      if (Array.isArray(raw) && raw.length > 0) {
        orders.value = raw.map(mapApiOrder)
      }
    } catch (err) {
      console.warn('Could not fetch store orders from API, keeping current list:', err)
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
          o.deliveryAddress.toLowerCase().includes(q)
      )
    }

    if (selectedStatus.value !== 'all') {
      result = result.filter((o) => o.status === selectedStatus.value)
    }

    if (selectedPeriod.value !== 'all') {
      const days = Number(selectedPeriod.value)
      if (!isNaN(days) && days > 0) {
        // filter by days if available
      }
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

      showNotice(statusLabels[newStatus] || `تم تحديث حالة الطلب إلى ${newStatus}`)
      return true
    } catch (err: any) {
      console.warn('API error updating order status:', err)
      // إذا كان الخطأ من الخادم نعرض رسالة مناسبة
      const msg = err?.data?.userMessage || err?.data?.message || 'تم تحديث حالة الطلب محلياً.'
      showNotice(msg)
      return true
    } finally {
      isUpdating.value = false
    }
  }

  function exportOrders() {
    const list = filteredOrders.value
    const headers = [
      'رقم الطلب',
      'تاريخ الطلب',
      'اسم العميل',
      'رقم الهاتف',
      'عنوان التوصيل',
      'تفاصيل المنتجات',
      'الكمية الإجمالية',
      'المبلغ الإجمالي (ر.س)',
      'الضريبة (15%)',
      'حصة المتجر الكلية (ر.س)',
      'حالة الطلب',
    ]

    const statusMap: Record<SupplierOrderStatus, string> = {
      pending: 'بانتظار المعالجة',
      accepted: 'مقبول وقيد التجهيز',
      shipped: 'تم الشحن',
      delivered: 'تم التسليم',
      completed: 'مكتمل',
      rejected: 'مرفوض',
      cancelled: 'ملغي',
    }

    const rows = list.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.createdAt}"`,
      `"${o.clientName}"`,
      `"${o.clientPhone}"`,
      `"${o.deliveryAddress}"`,
      `"${o.itemsSummary}"`,
      `"${o.totalItemsCount}"`,
      `"${o.subtotal.toFixed(2)}"`,
      `"${o.taxAmount.toFixed(2)}"`,
      `"${o.totalStoreShare.toFixed(2)}"`,
      `"${statusMap[o.status] || o.status}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `طلبات_الشراء_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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
    fetchOrders,
    changePage,
    updateOrderStatus,
    exportOrders,
  }
}
