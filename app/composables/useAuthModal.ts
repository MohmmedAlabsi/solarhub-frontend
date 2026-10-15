export interface AuthModalOptions {
  title?: string
  message?: string
  actionType?: 'quote' | 'consultation' | 'project' | 'general'
}

export const useAuthModal = () => {
  const isOpen = useState<boolean>('auth_modal_open', () => false)
  const title = useState<string>('auth_modal_title', () => 'لإرسال طلب عرض سعر، يرجى تسجيل الدخول')
  const message = useState<string>(
    'auth_modal_message',
    () => 'سجّل الدخول إلى حسابك أو أنشئ حساباً جديداً لتتمكن من إرسال طلبك ومتابعة عروضك مباشرة.'
  )
  const actionType = useState<string>('auth_modal_action', () => 'quote')

  function open(options?: AuthModalOptions) {
    if (options?.title) title.value = options.title
    else title.value = 'لإرسال طلب عرض سعر، يرجى تسجيل الدخول'

    if (options?.message) message.value = options.message
    else message.value = 'سجّل الدخول إلى حسابك أو أنشئ حساباً جديداً لتتمكن من إرسال طلبك ومتابعة عروضك مباشرة.'

    if (options?.actionType) actionType.value = options.actionType
    else actionType.value = 'quote'

    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return {
    isOpen,
    title,
    message,
    actionType,
    open,
    close,
  }
}
