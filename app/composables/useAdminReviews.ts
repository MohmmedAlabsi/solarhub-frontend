import type { AdminReview } from '../../types/admin'

export const useAdminReviews = () => {
  const { $api } = useNuxtApp()
  const { notify } = useAdminNotice()

  const supplierReviews = useState<AdminReview[]>('admin_live_supplier_reviews', () => [])
  const engineerReviews = useState<AdminReview[]>('admin_live_engineer_reviews', () => [])
  const isLoading = ref(false)
  const isActionLoading = ref(false)

  /**
   * جلب تقييمات الموردين والمتاجر من الخادم
   */
  const fetchSupplierReviews = async (force = false): Promise<AdminReview[]> => {
    if (!force && supplierReviews.value.length > 0) {
      return supplierReviews.value
    }

    isLoading.value = true
    try {
      const res: any = await $api('/admin/reviews/stores?per_page=100')
      let list: any[] = []
      if (Array.isArray(res)) list = res
      else if (Array.isArray(res?.data)) list = res.data
      else if (Array.isArray(res?.data?.data)) list = res.data.data

      supplierReviews.value = list.map((item: any) => ({
        id: String(item.id),
        orderId: String(item.order_store_id || item.id),
        client: item.customer?.name || 'عميل مسجل',
        targetId: String(item.store?.id || item.store_id || ''),
        targetName: item.store?.company_name || 'متجر معتمد',
        score: Number(item.rating) || 5,
        comment: item.comment || 'لا يوجد تعليق مكتوب.',
        approved: Boolean(item.is_approved),
        createdAt: item.created_at,
      }))

      return supplierReviews.value
    } catch (err: any) {
      console.warn('Could not fetch supplier reviews:', err)
      return supplierReviews.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * جلب تقييمات المهندسين من الخادم
   */
  const fetchEngineerReviews = async (force = false): Promise<AdminReview[]> => {
    if (!force && engineerReviews.value.length > 0) {
      return engineerReviews.value
    }

    isLoading.value = true
    try {
      const res: any = await $api('/admin/reviews/engineers?per_page=100')
      let list: any[] = []
      if (Array.isArray(res)) list = res
      else if (Array.isArray(res?.data)) list = res.data
      else if (Array.isArray(res?.data?.data)) list = res.data.data

      engineerReviews.value = list.map((item: any) => ({
        id: String(item.id),
        orderId: String(item.service_request_id || item.id),
        client: item.customer?.name || 'عميل مسجل',
        targetId: String(item.engineer?.id || item.engineer_id || ''),
        targetName: item.engineer?.name || 'مهندس استشاري معتمد',
        score: Number(item.rating) || 5,
        comment: item.comment || 'لا يوجد تعليق مكتوب.',
        approved: Boolean(item.is_approved),
        createdAt: item.created_at,
      }))

      return engineerReviews.value
    } catch (err: any) {
      console.warn('Could not fetch engineer reviews:', err)
      return engineerReviews.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * تغيير حالة اعتماد تقييم متجر/مورد
   */
  const toggleSupplierReview = async (review: AdminReview) => {
    isActionLoading.value = true
    const previous = review.approved
    review.approved = !previous // تحديث تفاؤلي سريع

    try {
      await $api(`/admin/reviews/stores/${review.id}/toggle-approval`, {
        method: 'PATCH',
      })
      notify(review.approved ? 'تم اعتماد التقييم بنجاح وظهوره للجميع.' : 'تم إلغاء اعتماد التقييم وإخفاؤه.')
    } catch (err: any) {
      review.approved = previous // استعادة الحالة عند الخطأ
      const msg = err?.data?.message || err?.message || 'تعذر تحديث حالة التقييم.'
      notify(msg)
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * تغيير حالة اعتماد تقييم مهندس
   */
  const toggleEngineerReview = async (review: AdminReview) => {
    isActionLoading.value = true
    const previous = review.approved
    review.approved = !previous // تحديث تفاؤلي سريع

    try {
      await $api(`/admin/reviews/engineers/${review.id}/toggle-approval`, {
        method: 'PATCH',
      })
      notify(review.approved ? 'تم اعتماد تقييم المهندس بنجاح.' : 'تم إلغاء اعتماد التقييم.')
    } catch (err: any) {
      review.approved = previous // استعادة الحالة عند الخطأ
      const msg = err?.data?.message || err?.message || 'تعذر تحديث حالة التقييم.'
      notify(msg)
    } finally {
      isActionLoading.value = false
    }
  }

  return {
    supplierReviews,
    engineerReviews,
    isLoading,
    isActionLoading,
    fetchSupplierReviews,
    fetchEngineerReviews,
    toggleSupplierReview,
    toggleEngineerReview,
  }
}
