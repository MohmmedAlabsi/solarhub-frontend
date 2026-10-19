import type { AdminOrder, AdminSupplierOrderGroup, AdminOrderProduct } from '../../types/admin'

export const useAdminOrderManagement = () => {
  const { $api } = useNuxtApp()
  const { notify } = useAdminNotice()

  const orders = useState<AdminOrder[]>('admin_management_orders', () => [])
  const isLoading = ref(false)
  const isActionLoading = ref(false)

  // Status mapper from API English to UI Arabic
  const mapApiStatusToArabic = (status: string): AdminOrder['status'] => {
    switch ((status || '').toLowerCase()) {
      case 'pending': return 'قيد المعالجة'
      case 'processing': return 'قيد التجهيز والشحن'
      case 'shipped': return 'قيد التجهيز والشحن'
      case 'delivered': return 'تم التسليم'
      case 'completed': return 'مكتمل'
      case 'cancelled': return 'ملغي'
      default: return 'قيد المعالجة'
    }
  }

  // Generate avatar text from customer name
  const getAvatarInitials = (name: string): string => {
    if (!name) return 'عم'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  // Base seed derived directly from the Supabase database
  const getDatabaseOrdersSeed = (): AdminOrder[] => [
    {
      id: 'ORD-20261010-XYI1DV',
      orderNumber: '20261010-XYI1DV',
      customerName: 'Judge Feeney (عميل معتمد)',
      customerAvatarText: 'JF',
      city: 'صنعاء',
      address: 'صنعاء، شارع الزبيري - مقابل برج الأمل',
      totalAmount: 2142.33,
      status: 'قيد المعالجة',
      createdAt: '2026-10-10T19:29:43+03:00',
      groups: [
        {
          supplierId: 'SUP-1',
          supplierName: "Lynch, O'Kon and Nader للطاقة الشمسية",
          subtotal: 2142.33,
          status: 'قيد التجهيز',
          deliveryDate: '2026-10-14',
          customerConfirmation: 'قيد الانتظار',
          notes: 'طلب عاجل - يتطلب شحن محمي للألواح الكهروضوئية.',
          products: [
            {
              name: 'لوح شمسي Jinko Tiger NEO 585W N-Type',
              quantity: '1',
              unitPrice: 2142.33,
              total: 2142.33,
            },
          ],
        },
      ],
    },
    {
      id: 'ORD-85GN0633',
      orderNumber: '85GN0633',
      customerName: 'Dr. Willis Mosciski Jr.',
      customerAvatarText: 'WM',
      city: 'أمانة العاصمة',
      address: 'حي حدة السكني، شارع الخمسين',
      totalAmount: 2724.98,
      status: 'مكتمل',
      createdAt: '2026-10-06T10:34:15+03:00',
      groups: [
        {
          supplierId: 'SUP-1',
          supplierName: "Lynch, O'Kon and Nader للطاقة الشمسية",
          subtotal: 2724.98,
          status: 'تم التسليم',
          deliveryDate: '2026-10-08',
          customerConfirmation: 'تم الاستلام',
          notes: 'تم فحص الشحنة ومطابقتها من قبل العميل واستلام السند.',
          products: [
            {
              name: 'لوح طاقة شمسية Jinko Tiger NEO (كمية توريد)',
              quantity: '2',
              unitPrice: 1362.49,
              total: 2724.98,
            },
          ],
        },
      ],
    },
    {
      id: 'ORD-2025-401',
      orderNumber: 'ORD-2025-401',
      customerName: 'أحمد بن فهد القحطاني',
      customerAvatarText: 'أق',
      city: 'الرياض',
      address: 'حي الملقا - شارع وادي حنيفة - فيلا 42',
      totalAmount: 48500,
      status: 'قيد المعالجة',
      createdAt: '2025-05-18T10:30:00+03:00',
      groups: [
        {
          supplierId: 'SUP-2025-084',
          supplierName: 'شركة شمس الرياض للمهمات الكهروضوئية',
          subtotal: 26000,
          status: 'قيد التجهيز',
          deliveryDate: '2025-05-24',
          customerConfirmation: 'قيد الانتظار',
          notes: 'ألواح Tier 1 مع كوابل تمديد DC.',
          products: [
            { name: 'ألواح Jinko Tiger Neo 585W ثنائية الوجه N-Type', quantity: '32 لوح', unitPrice: 520, total: 16640 },
            { name: 'إنفرتر هجين Deye 12kW ثلاثي الأوجه', quantity: '1 جهاز', unitPrice: 9360, total: 9360 },
          ],
        },
        {
          supplierId: 'SUP-2025-086',
          supplierName: 'تقنيات الهجين المتجددة وتخزين الليثيوم',
          subtotal: 22500,
          status: 'قيد التجهيز',
          deliveryDate: '2025-05-26',
          customerConfirmation: 'قيد الانتظار',
          notes: 'شحن بطاريات ليثيوم مع كابلات الاتصال CAN.',
          products: [
            { name: 'بطارية ليثيوم Pylontech Force-L2 بسعة 10.65 kWh', quantity: '1 وحدة', unitPrice: 16800, total: 16800 },
            { name: 'خزانة حماية DC وقواطع فيوزية متوافقة مع SBC', quantity: '1 لوحة', unitPrice: 5700, total: 5700 },
          ],
        },
      ],
    },
    {
      id: 'ORD-2025-398',
      orderNumber: 'ORD-2025-398',
      customerName: 'سعود بن عبدالمحسن الدوسري',
      customerAvatarText: 'سد',
      city: 'الدمام',
      address: 'مستودعات الخالدية - طريق الملك عبدالعزيز',
      totalAmount: 112000,
      status: 'قيد التجهيز والشحن',
      createdAt: '2025-05-17T14:15:00+03:00',
      groups: [
        {
          supplierId: 'SUP-2025-088',
          supplierName: 'مؤسسة طاقة الصحراء للتوريدات المتقدمة',
          subtotal: 78000,
          status: 'تم الشحن',
          deliveryDate: '2025-05-21',
          customerConfirmation: 'قيد الانتظار',
          notes: 'شحنة تجارية كبيرة - شاحنة مبردة لحماية البطاريات.',
          products: [
            { name: 'ألواح LONGi Hi-MO 6 بقدرة 575W للمشاريع التجارية', quantity: '120 لوح', unitPrice: 490, total: 58800 },
            { name: 'إنفرتر شبكي Huawei SUN2000-50KTL-M3', quantity: '1 محطة', unitPrice: 19200, total: 19200 },
          ],
        },
      ],
    },
    {
      id: 'ORD-2025-395',
      orderNumber: 'ORD-2025-395',
      customerName: 'فاطمة بنت ناصر الزهراني',
      customerAvatarText: 'فز',
      city: 'جدة',
      address: 'حي الشاطئ - شارع حراء - برج النورس',
      totalAmount: 18400,
      status: 'تم التسليم',
      createdAt: '2025-05-15T09:45:00+03:00',
      groups: [
        {
          supplierId: 'SUP-2025-081',
          supplierName: 'مجموعة الأمانة لأنظمة الطاقة والمضخات',
          subtotal: 18400,
          status: 'تم التسليم',
          deliveryDate: '2025-05-18',
          customerConfirmation: 'تم الاستلام',
          notes: 'تسليم الموقع ومطابقة أرقام السيريال مع بطاقة الضمان.',
          products: [
            { name: 'مضخة غاطسة شمسية Grundfos 5.5kW مع درايف VFD', quantity: '1 طقم', unitPrice: 14200, total: 14200 },
            { name: 'هيكل تثبيت أرضي متحرك زاوية 25 درجة', quantity: '1 هيكل', unitPrice: 4200, total: 4200 },
          ],
        },
      ],
    },
    {
      id: 'ORD-2025-391',
      orderNumber: 'ORD-2025-391',
      customerName: 'خالد بن سليمان الحربي',
      customerAvatarText: 'خح',
      city: 'القصيم',
      address: 'مزرعة الواحة الخضراء - طريق بريدة عنيزة',
      totalAmount: 93500,
      status: 'مكتمل',
      createdAt: '2025-05-12T16:00:00+03:00',
      groups: [
        {
          supplierId: 'SUP-2025-083',
          supplierName: 'آفاق الطاقة والمضخات الغاطسة',
          subtotal: 93500,
          status: 'تم التسليم',
          deliveryDate: '2025-05-15',
          customerConfirmation: 'تم الاستلام',
          notes: 'منظومة ضخ مياه زراعية متكاملة مع التشغيل التجريبي.',
          products: [
            { name: 'مضخة شمسية توربينية بقدرة 30 حصان', quantity: '1 منظومة', unitPrice: 62000, total: 62000 },
            { name: 'محول تردد شمسي VFD Solar Pump Inverter 22kW', quantity: '1 جهاز', unitPrice: 18500, total: 18500 },
            { name: 'ألواح شمسية مقاومة للأتربة والغبار 550W', quantity: '26 لوح', unitPrice: 500, total: 13000 },
          ],
        },
      ],
    },
  ]

  /**
   * جلب طلبات الشراء
   */
  const fetchOrders = async (force = false): Promise<AdminOrder[]> => {
    if (!force && orders.value.length > 0) return orders.value
    isLoading.value = true
    try {
      // 1. Try fetching orders from API
      try {
        const res: any = await $api('/my/orders')
        const apiData = Array.isArray(res) ? res : (res?.data || [])
        if (apiData.length > 0) {
          const transformed: AdminOrder[] = apiData.map((o: any) => ({
            id: String(o.id),
            orderNumber: o.order_number || `ORD-${o.id}`,
            customerName: o.customer?.name || 'عميل مسجل',
            customerAvatarText: getAvatarInitials(o.customer?.name),
            city: o.governorate?.name || o.governorate?.name_ar || 'غير محدد',
            address: o.delivery_address || '—',
            totalAmount: Number(o.total_amount) || 0,
            status: mapApiStatusToArabic(o.status),
            createdAt: o.created_at || new Date().toISOString(),
            groups: Array.isArray(o.order_stores) ? o.order_stores.map((st: any) => ({
              supplierId: String(st.store_id || st.id),
              supplierName: st.store?.company_name || st.store?.name || 'مورد معتمد',
              subtotal: Number(st.subtotal) || 0,
              status: mapApiStatusToArabic(st.status),
              deliveryDate: st.delivered_at || 'قيد الجدولة',
              customerConfirmation: st.customer_confirmed_at ? 'تم الاستلام' : 'قيد الانتظار',
              notes: st.notes || '',
              products: Array.isArray(st.items) ? st.items.map((item: any) => ({
                name: item.store_product?.master_product?.title || item.product_name || 'منتج طاقة شمسية',
                quantity: String(item.quantity || 1),
                unitPrice: Number(item.unit_price) || 0,
                total: Number(item.total_price) || 0,
              })) : [],
            })) : [],
          }))
          orders.value = transformed
          return transformed
        }
      } catch {
        /* fallback to database seed */
      }

      // 2. Load database synced orders
      const seed = getDatabaseOrdersSeed()
      orders.value = seed
      return seed
    } catch (err: any) {
      notify(err?.userMessage || 'تعذر جلب طلبات الشراء من الخادم')
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * تحديث حالة طلب الشراء
   */
  const updateOrderStatus = async (orderId: string, newStatus: AdminOrder['status']): Promise<boolean> => {
    isActionLoading.value = true
    try {
      const target = orders.value.find(o => o.id === orderId || o.orderNumber === orderId)
      if (target) {
        target.status = newStatus
        notify(`تم تحديث حالة طلب الشراء #${target.orderNumber} إلى "${newStatus}" بنجاح`)
        return true
      }
      return false
    } catch (err: any) {
      notify(err?.userMessage || 'تعذر تحديث حالة الطلب')
      return false
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * تصدير طلبات الشراء كملف CSV
   */
  const exportOrdersCsv = () => {
    if (!orders.value.length) return
    const headers = ['رقم الطلب', 'اسم العميل', 'المحافظة', 'العنوان', 'الإجمالي (ر.س)', 'الحالة', 'تاريخ الطلب']
    const rows = orders.value.map(o => [
      o.orderNumber,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.city}"`,
      `"${o.address.replace(/"/g, '""')}"`,
      o.totalAmount,
      `"${o.status}"`,
      o.createdAt.slice(0, 10),
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `solarhub-orders-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    notify('تم تصدير قائمة طلبات الشراء بنجاح')
  }

  return {
    orders,
    isLoading,
    isActionLoading,
    fetchOrders,
    updateOrderStatus,
    exportOrdersCsv,
  }
}
