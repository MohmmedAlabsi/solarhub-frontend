import type { EngineeringService, ServiceRequestErrors, ServiceRequestForm, ServiceRequestSubmission } from '../../types/service-request'

export const serviceOptions: Array<{ value: EngineeringService; label: string }> = [
  { value: 'consultation', label: 'استشارة هندسية' },
  { value: 'feasibility', label: 'دراسة جدوى' },
  { value: 'design', label: 'تصميم ومخططات هندسية' },
  { value: 'inspection', label: 'فحص وتقييم منظومة' },
  { value: 'supervision', label: 'إشراف هندسي' },
]
export const serviceRegions = ['الرياض', 'مكة المكرمة', 'المدينة المنورة', 'القصيم', 'المنطقة الشرقية', 'عسير', 'تبوك', 'حائل', 'الحدود الشمالية', 'جازان', 'نجران', 'الباحة', 'الجوف']
export const attachmentAccept = '.jpg,.jpeg,.png,.webp,.pdf,.dwg,.dxf'
const mimeTypes: Record<string, string[]> = {
  jpg: ['image/jpeg'], jpeg: ['image/jpeg'], png: ['image/png'], webp: ['image/webp'], pdf: ['application/pdf'],
  dwg: ['image/vnd.dwg', 'image/x-dwg', 'application/acad', 'application/x-acad', 'application/octet-stream', ''],
  dxf: ['image/vnd.dxf', 'image/x-dxf', 'application/dxf', 'application/x-dxf', 'application/octet-stream', ''],
}

export function useServiceRequest() {
  const route = useRoute()
  const form = reactive<ServiceRequestForm>({ serviceType: '', region: '', capacity: '', description: '', location: '' })
  const errors = reactive<ServiceRequestErrors>({})
  const attachments = shallowRef<File[]>([])
  const submitting = ref(false)
  const statusMessage = ref('')
  const submissionState = ref<'idle' | 'success' | 'error'>('idle')
  // Memory only: no request, upload, or persistent browser storage in demo mode.
  const demoSubmission = shallowRef<ServiceRequestSubmission>()
  const engineerId = computed(() => {
    const value = Array.isArray(route.query.engineerId) ? route.query.engineerId[0] : route.query.engineerId
    const id = Number(value)
    return Number.isSafeInteger(id) && id > 0 ? id : undefined
  })

  function addAttachments(files: File[]) {
    if (submitting.value) return
    delete errors.attachments
    const rejected: string[] = []
    for (const file of files) {
      const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
      if (!mimeTypes[extension]?.includes(file.type)) { rejected.push(`${file.name}: نوع ملف غير مدعوم.`); continue }
      if (!file.size || file.size > 10 * 1024 * 1024) { rejected.push(`${file.name}: يجب أن يكون الملف غير فارغ وألا يتجاوز 10 ميجابايت.`); continue }
      if (!attachments.value.some(item => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified)) attachments.value = [...attachments.value, file]
    }
    if (rejected.length) errors.attachments = rejected.join(' ')
    statusMessage.value = ''
    submissionState.value = 'idle'
  }
  function removeAttachment(index: number) {
    if (submitting.value) return
    attachments.value = attachments.value.filter((_, position) => position !== index)
    delete errors.attachments
    statusMessage.value = ''
    submissionState.value = 'idle'
  }
  function validate() {
    for (const key of Object.keys(errors) as Array<keyof ServiceRequestErrors>) if (key !== 'attachments') delete errors[key]
    if (!serviceOptions.some(option => option.value === form.serviceType)) errors.serviceType = 'اختر نوع الخدمة الهندسية.'
    if (!serviceRegions.includes(form.region)) errors.region = 'اختر المحافظة أو المنطقة.'
    const capacity = form.capacity.trim().replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))).replace('٫', '.')
    const capacityNumber = capacity.match(/^\d+(?:\.\d+)?/)
    if (capacity && (!capacityNumber || Number(capacityNumber[0]) <= 0 || form.capacity.length > 100)) errors.capacity = 'أدخل سعة تقديرية موجبة مع الوحدة، مثل 15 كيلوواط أو 10 حصان.'
    if (form.description.trim().length < 20 || form.description.length > 3000) errors.description = 'اكتب وصفًا تفصيليًا بين 20 و3000 حرف.'
    if (form.location.trim().length < 10 || form.location.length > 1500) errors.location = 'اكتب معلومات الموقع بين 10 و1500 حرف.'
    return Object.keys(errors).length === 0
  }
  async function submit() {
    if (submitting.value) return
    statusMessage.value = ''
    if (!validate()) {
      submissionState.value = 'error'
      statusMessage.value = 'يرجى مراجعة الحقول الموضحة قبل نشر الطلب.'
      return
    }
    submitting.value = true
    try {
      const payload: ServiceRequestSubmission = {
        ...form, capacity: form.capacity.trim(), description: form.description.trim(), location: form.location.trim(),
        ...(engineerId.value ? { engineerId: engineerId.value } : {}), attachments: [...attachments.value],
      }
      await new Promise<void>(resolve => setTimeout(resolve, 600))
      demoSubmission.value = payload
      submissionState.value = 'success'
      statusMessage.value = 'تمت محاكاة نشر الطلب داخل هذه الجلسة فقط. لم يُنشأ طلب فعلي ولم تُرفع المرفقات إلى خادم.'
    } catch {
      submissionState.value = 'error'
      statusMessage.value = 'تعذر إكمال الإرسال التجريبي. مدخلاتك محفوظة في النموذج؛ حاول مجددًا.'
    } finally { submitting.value = false }
  }
  watch(form, () => { if (!submitting.value) { statusMessage.value = ''; submissionState.value = 'idle' } })
  return { form, errors, attachments, submitting, submissionState, statusMessage, engineerId, demoSubmission, addAttachments, removeAttachment, submit }
}
