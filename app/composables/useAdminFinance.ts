import type { OrderPayment, StorePayout, PlatformSetting } from '../../types/api'

/**
 * كل الطلبات تذهب لمسارات Laravel المحمية (auth + admin + permission)
 * بدل مسارات خادم Nuxt القديمة /api/admin/* التي كانت تعدّل قاعدة البيانات بدون مصادقة.
 */
export interface EligiblePayout {
  order_store_id: number
  order_number: string | null
  store_name: string | null
  subtotal: number
  completed_at: string | null
  previous_payout_failed: boolean
  wallets: { id: number; provider: string | null; account_name: string | null; account_last4: string; is_default: boolean }[]
}

export const useAdminFinance = () => {
  const { $api } = useNuxtApp()
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
      const res: any = await $api('/admin/finance/payments')
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
    const target = payments.value.find(p => String(p.id) === String(paymentId))
    const oldStatus = target?.status
    try {
      if (target) {
        target.status = newStatus // Optimistic instant update
        if (newStatus === 'verified') {
          target.verified_at = new Date().toISOString()
        }
      }

      if (newStatus === 'pending') {
        throw new Error('لا يمكن إرجاع الدفعة إلى حالة قيد المراجعة بعد البت فيها.')
      }

      await $api(`/order_payments/${paymentId}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      })

      const statusAr = newStatus === 'verified' ? 'تم التحقق' : (newStatus === 'rejected' ? 'مرفوض' : 'قيد المراجعة')
      notify(`تم تحديث حالة الدفعة #${paymentId} إلى "${statusAr}" بنجاح`)
      return true
    } catch (err: any) {
      if (target && oldStatus) target.status = oldStatus // التراجع عن التحديث المتفائل
      notify(err?.data?.userMessage || err?.message || 'تعذر تحديث حالة الدفعة')
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
      const res: any = await $api('/admin/finance/payouts')
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
    const payoutTarget = payouts.value.find(p => String(p.id) === String(payoutId))
    const oldPayoutStatus = payoutTarget?.status
    try {
      const target = payoutTarget
      if (target) {
        target.status = status // Optimistic instant update
        if (transferReference) target.transfer_reference = transferReference
        if (status === 'completed') target.paid_at = new Date().toISOString()
      }

      if (status === 'pending') {
        throw new Error('لا يمكن إرجاع المستحقات إلى حالة الانتظار بعد البت فيها.')
      }

      await $api(`/store_payouts/${payoutId}`, {
        method: 'PUT',
        body: { status, transfer_reference: transferReference || undefined },
      })

      const statusAr = status === 'completed' ? 'تم الصرف بنجاح' : (status === 'failed' ? 'فشل الصرف' : 'قيد الانتظار')
      notify(`تم تحديث سجل المستحقات #${payoutId} إلى "${statusAr}"`)
      return true
    } catch (err: any) {
      if (payoutTarget && oldPayoutStatus) payoutTarget.status = oldPayoutStatus
      notify(err?.data?.userMessage || err?.message || 'تعذر تحديث حالة مستحقات المورد')
      return false
    } finally {
      isActionLoading.value = false
    }
  }

  /** طلبات فرعية أكّد العميل استلامها ولا توجد لها مستحقات (أو فشلت السابقة) */
  const eligiblePayouts = useState<EligiblePayout[]>('admin_finance_eligible_payouts', () => [])

  const fetchEligiblePayouts = async (): Promise<EligiblePayout[]> => {
    try {
      const res: any = await $api('/admin/finance/payouts/eligible')
      eligiblePayouts.value = Array.isArray(res?.data) ? res.data : []
    } catch (err: any) {
      notify(err?.data?.message || 'تعذر جلب الطلبات المؤهلة للمستحقات')
    }
    return eligiblePayouts.value
  }

  /** إنشاء مستحقات لمورد: الـ API يحسب العمولة والصافي من إجمالي الطلب الفرعي */
  const createPayout = async (payload: { order_store_id: number; commission_rate: number; user_wallet_id?: number | null }): Promise<{ ok: boolean; message?: string }> => {
    isActionLoading.value = true
    try {
      await $api('/store_payouts', {
        method: 'POST',
        body: { ...payload, user_wallet_id: payload.user_wallet_id || undefined },
      })
      notify('تم إنشاء سجل المستحقات، وهو الآن بانتظار الصرف.')
      // التحديث في الخلفية: لا نُبقي النافذة مشغولة حتى تُعاد القوائم من الخادم
      Promise.all([fetchPayouts(true), fetchEligiblePayouts()])
      return { ok: true }
    } catch (err: any) {
      return { ok: false, message: err?.data?.message || 'تعذر إنشاء المستحقات' }
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
      const res: any = await $api('/admin/finance/stats')
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
      const res: any = await $api('/settings')
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
      const res: any = await $api('/settings', {
        method: 'PUT',
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
    eligiblePayouts,
    fetchEligiblePayouts,
    createPayout,
    fetchStats,
    fetchSettings,
    updateSettings,
  }
}
