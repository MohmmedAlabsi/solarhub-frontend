import type { MaybeRefOrGetter } from 'vue'
import type { AdminEngineer, AdminSupplier } from '../../types/admin'

export function useAdminApproval(
  record: MaybeRefOrGetter<AdminEngineer | AdminSupplier | undefined>,
  done: () => void
) {
  const { $api } = useNuxtApp()
  const { notify } = useAdminNotice()

  const reason = ref('')
  const error = ref('')
  const isActionLoading = ref(false)

  function reset() {
    reason.value = toValue(record)?.rejectionReason ?? ''
    error.value = ''
  }

  async function approve() {
    const item = toValue(record)
    if (!item) return

    isActionLoading.value = true
    error.value = ''

    try {
      // هل هو مهندس أم مورد؟
      const isEngineer = 'license' in item || 'specialties' in item
      const endpoint = isEngineer
        ? `/admin/engineers/${item.id}/approve`
        : `/admin/stores/${item.id}/approve`

      await $api(endpoint, {
        method: 'PATCH',
      })

      item.approval = 'approved'
      item.rejectionReason = ''
      if ('license' in item) {
        item.approvedAt = new Date().toISOString()
      }

      notify(isEngineer ? 'تم اعتماد المهندس بنجاح وتفعيل حسابه.' : 'تم اعتماد المورد والمتجر بنجاح.')
      done()
    } catch (err: any) {
      console.error('Failed to approve:', err)
      const msg = err?.userMessage || err?.data?.message || err?.message || 'تعذر اعتماد السجل، يرجى المحاولة لاحقاً.'
      notify(msg)
      error.value = msg
    } finally {
      isActionLoading.value = false
    }
  }

  async function reject() {
    const item = toValue(record)
    if (!item) return

    const trimmedReason = reason.value.trim()
    if (trimmedReason.length < 5 || trimmedReason.length > 1000) {
      error.value = 'يرجى كتابة سبب رفض واضح ومفصل (بين 5 و 1000 حرف).'
      return
    }

    isActionLoading.value = true
    error.value = ''

    try {
      const isEngineer = 'license' in item || 'specialties' in item
      const endpoint = isEngineer
        ? `/admin/engineers/${item.id}/reject`
        : `/admin/stores/${item.id}/reject`

      await $api(endpoint, {
        method: 'PATCH',
        body: {
          rejection_reason: trimmedReason,
        },
      })

      item.approval = 'rejected'
      item.rejectionReason = trimmedReason
      if ('license' in item) {
        delete (item as any).approvedAt
      }

      notify(isEngineer ? 'تم رفض طلب انضمام المهندس وإرسال الإشعار.' : 'تم رفض طلب المتجر وتوثيق السبب.')
      done()
    } catch (err: any) {
      console.error('Failed to reject:', err)
      const msg = err?.userMessage || err?.data?.message || err?.message || 'تعذر رفض السجل، يرجى المحاولة لاحقاً.'
      notify(msg)
      error.value = msg
    } finally {
      isActionLoading.value = false
    }
  }

  return {
    reason,
    error,
    isActionLoading,
    reset,
    approve,
    reject,
  }
}
