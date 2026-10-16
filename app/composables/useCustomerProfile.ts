import type {
  CustomerProfileErrors,
  CustomerProfileForm,
  CustomerProfileSaveState,
  CustomerProfileSummary,
  CustomerSession,
} from '~~/types/customer-profile'

const initialProfile: CustomerProfileForm = {
  fullName: 'عبدالله بن محمد السعيد',
  accountType: 'عميل (مشاريع سكنية وتجارية)',
  city: 'الرياض',
  email: 'a.alsaeed@example.com',
  phone: '0501234567',
  address: 'حي النرجس، شارع أنس بن مالك، الرياض',
  twoFactorEnabled: true,
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

const summary: CustomerProfileSummary = {
  initials: 'ع.س',
  customerId: 'CU-90241',
  verified: true,
}

const sessions: CustomerSession[] = [
  { id: 'current', browser: 'Chrome', operatingSystem: 'macOS', location: 'الرياض', isCurrent: true },
]

export const useCustomerProfile = () => {
  const form = reactive<CustomerProfileForm>({ ...initialProfile })
  const errors = reactive<CustomerProfileErrors>({})
  const saveState = ref<CustomerProfileSaveState>('idle')
  const statusMessage = ref('')
  const terminatingSessions = ref(false)

  const clearErrors = () => {
    for (const key of Object.keys(errors) as Array<keyof CustomerProfileErrors>) delete errors[key]
  }

  const validate = () => {
    clearErrors()
    if (form.fullName.trim().length < 4) errors.fullName = 'يرجى إدخال الاسم الكامل.'
    if (!form.city.trim()) errors.city = 'يرجى إدخال المحافظة أو المدينة.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'يرجى إدخال بريد إلكتروني صحيح.'
    if (!/^05\d{8}$/.test(form.phone.replace(/\s/g, ''))) errors.phone = 'رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام.'
    if (form.address.trim().length < 8) errors.address = 'يرجى إدخال عنوان توصيل واضح.'

    const changingPassword = Boolean(form.currentPassword || form.newPassword || form.confirmPassword)
    if (changingPassword) {
      if (!form.currentPassword) errors.currentPassword = 'أدخل كلمة المرور الحالية.'
      if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.newPassword)) errors.newPassword = 'استخدم 8 أحرف على الأقل، تتضمن أحرفًا وأرقامًا.'
      if (form.confirmPassword !== form.newPassword) errors.confirmPassword = 'تأكيد كلمة المرور غير مطابق.'
    }
    return Object.keys(errors).length === 0
  }

  const saveProfile = async () => {
    statusMessage.value = ''
    if (!validate()) {
      saveState.value = 'error'
      statusMessage.value = 'يرجى مراجعة الحقول الموضحة قبل الحفظ.'
      return false
    }
    saveState.value = 'saving'
    await new Promise(resolve => setTimeout(resolve, 650))
    form.currentPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
    saveState.value = 'success'
    statusMessage.value = 'تم حفظ التعديلات تجريبيًا داخل هذه الجلسة. ربط الخادم غير متوفر بعد.'
    return true
  }

  const resetProfile = () => {
    Object.assign(form, initialProfile)
    clearErrors()
    saveState.value = 'idle'
    statusMessage.value = ''
  }

  const terminateOtherSessions = async () => {
    terminatingSessions.value = true
    await new Promise(resolve => setTimeout(resolve, 450))
    terminatingSessions.value = false
    statusMessage.value = 'لا توجد جلسات أخرى نشطة. هذا تحقق تجريبي محلي.'
  }

  watch(form, () => {
    if (saveState.value !== 'saving') saveState.value = 'idle'
    statusMessage.value = ''
  }, { deep: true })

  return { form, errors, saveState, statusMessage, summary, sessions, terminatingSessions, saveProfile, resetProfile, terminateOtherSessions }
}
