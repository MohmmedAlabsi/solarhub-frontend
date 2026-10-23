import type { AdminAudience } from '../../types/admin'

export function useAdminBroadcastForm() {
  const { broadcastNotification } = useAdminNotifications()
  const draft = reactive({
    title: '',
    content: '',
    audience: 'all' as AdminAudience,
  })
  const errors = reactive<Partial<Record<'title' | 'content' | 'audience', string>>>({})
  const sending = ref(false)

  function reset() {
    draft.title = ''
    draft.content = ''
    draft.audience = 'all'
    for (const k of ['title', 'content', 'audience'] as const) {
      delete errors[k]
    }
  }

  async function submit() {
    if (sending.value) return false
    for (const k of ['title', 'content', 'audience'] as const) {
      delete errors[k]
    }
    if (draft.title.trim().length < 3 || draft.title.length > 150) {
      errors.title = 'عنوان الإشعار مطلوب بين 3 و150 حرفًا.'
    }
    if (draft.content.trim().length < 10 || draft.content.length > 2000) {
      errors.content = 'اكتب نصًا بين 10 و2000 حرف.'
    }
    if (!Object.hasOwn(audienceLabels, draft.audience)) {
      errors.audience = 'اختر المستلمين المستهدفين.'
    }
    if (Object.keys(errors).length) return false

    sending.value = true
    try {
      const ok = await broadcastNotification({
        title: draft.title.trim(),
        content: draft.content.trim(),
        audience: draft.audience,
      })
      if (ok) {
        reset()
        return true
      }
      return false
    } catch (err: any) {
      errors.content = err?.data?.message || 'تعذر إرسال الإشعار، يرجى المحاولة مرة أخرى.'
      return false
    } finally {
      sending.value = false
    }
  }

  return { draft, errors, sending, reset, submit }
}
