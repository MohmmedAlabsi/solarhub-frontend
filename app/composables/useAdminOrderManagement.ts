import type { AdminOrder, AdminSupplierOrderGroup, AdminOrderProduct } from '../../types/admin'

export const useAdminOrderManagement = () => {
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

  // Status mapper from UI Arabic to API English
  const mapArabicStatusToApi = (status: AdminOrder['status']): string => {
    switch (status) {
      case 'قيد المعالجة': return 'pending'
      case 'قيد التجهيز والشحن': return 'processing'
      case 'تم التسليم': return 'delivered'
      case 'مكتمل': return 'completed'
      case 'ملغي': return 'cancelled'
      default: return 'pending'
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

  /**
   * جلب طلبات الشراء ديناميكياً من قاعدة البيانات عبر الـ API
   */
  const fetchOrders = async (force = false): Promise<AdminOrder[]> => {
    if (!force && orders.value.length > 0) return orders.value
    isLoading.value = true
    try {
      const res: any = await $fetch('/api/admin/orders')
      const apiData = Array.isArray(res) ? res : (res?.data || [])
      
      const transformed: AdminOrder[] = apiData.map((o: any) => ({
        id: String(o.id),
        orderNumber: o.order_number || `ORD-${o.id}`,
        customerName: o.customer?.name || 'عميل مسجل',
        customerAvatarText: getAvatarInitials(o.customer?.name),
        city: o.governorate?.name_ar || o.governorate?.name || 'غير محدد',
        address: o.delivery_address || '—',
        totalAmount: Number(o.total_amount) || 0,
        status: mapApiStatusToArabic(o.status),
        createdAt: o.created_at || new Date().toISOString(),
        groups: Array.isArray(o.order_stores) ? o.order_stores.map((st: any) => ({
          supplierId: String(st.store_id || st.id),
          supplierName: st.store?.company_name || st.store?.name || 'مورد معتمد',
          subtotal: Number(st.subtotal) || 0,
          status: mapApiStatusToArabic(st.status) as any,
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
    } catch (err: any) {
      notify(err?.message || 'تعذر جلب طلبات الشراء من الخادم')
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
        target.status = newStatus // تحديث فوري وسريع (Optimistic UI)
      }

      try {
        const apiStatus = mapArabicStatusToApi(newStatus)
        await $fetch(`/api/admin/orders/${orderId}/status`, {
          method: 'POST',
          body: { status: apiStatus },
        })
      } catch (apiErr) {
        console.warn('Status update backend warning:', apiErr)
      }

      notify(`تم تحديث حالة طلب الشراء #${target?.orderNumber || orderId} إلى "${newStatus}" بنجاح`)
      return true
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
