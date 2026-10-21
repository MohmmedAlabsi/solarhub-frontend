import type { OrderPayment, StorePayout, PlatformSetting } from '../../types/api'

export const useAdminFinance = () => {
  const { notify } = useAdminNotice()

  const payments = useState<OrderPayment[]>('admin_finance_payments', () => [])
  const payouts = useState<StorePayout[]>('admin_finance_payouts', () => [])
  const stats = useState<any>('admin_finance_stats', () => null)
  const settings = useState<PlatformSetting | null>('admin_finance_settings', () => null)

  const isLoading = ref(false)
  const isActionLoading = ref(false)

  /**
   * جلب مدفوعات العملاء ديناميكياً من قاعدة البيانات عبر الـ API
   */
  const fetchPayments = async (force = false): Promise<OrderPayment[]> => {
    if (!force && payments.value.length > 0) return payments.value
    isLoading.value = true
    try {
      const res: any = await $fetch('/api/admin/finance/payments')
      const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
      payments.value = data
      return data
    } catch (err: any) {
      notify(err?.message || 'تعذر جلب سجلات المدفوعات من الخادم')
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * تحديث حالة الدفعة (تم التحقق / مرفوض / معلق)
   */
  const updatePaymentStatus = async (paymentId: number | string, newStatus: 'verified' | 'rejected' | 'pending'): Promise<boolean> => {
    isActionLoading.value = true
    try {
      const target = payments.value.find(p => String(p.id) === String(paymentId))
      const oldStatus = target?.status
      if (target) {
        target.status = newStatus // Optimistic instant update
        if (newStatus === 'verified') {
          target.verified_at = new Date().toISOString()
        }
      }

      await $fetch(`/api/admin/finance/payments/${paymentId}/status`, {
        method: 'POST',
        body: { status: newStatus },
      })

      const statusAr = newStatus === 'verified' ? 'تم التحقق' : (newStatus === 'rejected' ? 'مرفوض' : 'قيد المراجعة')
      notify(`تم تحديث حالة الدفعة #${paymentId} إلى "${statusAr}" بنجاح`)
      return true
    } catch (err: any) {
      notify(err?.message || 'تعذر تحديث حالة الدفعة')
      return false
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * جلب مستحقات الموردين ديناميكياً من قاعدة البيانات عبر الـ API
   */
  const fetchPayouts = async (force = false): Promise<StorePayout[]> => {
    if (!force && payouts.value.length > 0) return payouts.value
    isLoading.value = true
    try {
      const res: any = await $fetch('/api/admin/finance/payouts')
      const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
      payouts.value = data
      return data
    } catch (err: any) {
      notify(err?.message || 'تعذر جلب مستحقات الموردين من الخادم')
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * تحديث حالة مستحقات المورد (صرف / إلغاء / تعليق)
   */
  const updatePayoutStatus = async (payoutId: number | string, status: 'completed' | 'pending' | 'failed', transferReference?: string): Promise<boolean> => {
    isActionLoading.value = true
    try {
      const target = payouts.value.find(p => String(p.id) === String(payoutId))
      if (target) {
        target.status = status // Optimistic instant update
        if (transferReference) target.transfer_reference = transferReference
        if (status === 'completed') target.paid_at = new Date().toISOString()
      }

      await $fetch(`/api/admin/finance/payouts/${payoutId}/status`, {
        method: 'POST',
        body: { status, transfer_reference: transferReference },
      })

      const statusAr = status === 'completed' ? 'تم الصرف بنجاح' : (status === 'failed' ? 'فشل الصرف' : 'قيد الانتظار')
      notify(`تم تحديث سجل المستحقات #${payoutId} إلى "${statusAr}"`)
      return true
    } catch (err: any) {
      notify(err?.message || 'تعذر تحديث حالة مستحقات المورد')
      return false
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * جلب الإحصائيات والملخص المالي العام
   */
  const fetchStats = async (force = false) => {
    if (!force && stats.value) return stats.value
    try {
      const res: any = await $fetch('/api/admin/finance/stats')
      if (res?.data) {
        stats.value = res.data
      }
      return stats.value
    } catch {
      return null
    }
  }

  /**
   * جلب إعدادات المنظومة المالية
   */
  const fetchSettings = async (force = false): Promise<PlatformSetting | null> => {
    if (!force && settings.value) return settings.value
    isLoading.value = true
    try {
      const res: any = await $fetch('/api/admin/finance/settings')
      if (res?.data) {
        settings.value = res.data
      }
      return settings.value
    } catch (err: any) {
      notify(err?.message || 'تعذر جلب إعدادات المنظومة المالية')
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * تحديث إعدادات المنظومة والعمولة
   */
  const updateSettings = async (payload: Partial<PlatformSetting>): Promise<boolean> => {
    isActionLoading.value = true
    try {
      const res: any = await $fetch('/api/admin/finance/settings', {
        method: 'POST',
        body: payload,
      })
      if (res?.data) {
        settings.value = res.data
      }
      notify('تم حفظ الإعدادات المالية بنجاح')
      return true
    } catch (err: any) {
      notify(err?.message || 'حدث خطأ أثناء حفظ الإعدادات')
      return false
    } finally {
      isActionLoading.value = false
    }
  }

  return {
    payments,
    payouts,
    stats,
    settings,
    isLoading,
    isActionLoading,
    fetchPayments,
    updatePaymentStatus,
    fetchPayouts,
    updatePayoutStatus,
    fetchStats,
    fetchSettings,
    updateSettings,
  }
}
