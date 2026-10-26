import type {
  ServiceRequestErrors,
  ServiceRequestForm,
} from '~~/types/service-request'

interface ApiResponse<T> {
  status: string
  message?: string
  data: T
}

interface ApiServiceType {
  id: number
  name: string
}

interface ApiGovernorate {
  id: number
  name?: string | null
  name_ar?: string | null
  name_en?: string | null
}

interface SelectedProjectLocation {
  address: string
  lat: number
  lng: number
  governorate?: string
}

export const customerServiceAttachmentAccept =
  '.pdf,.jpg,.jpeg,.png,.webp'

const attachmentMimeTypes: Record<string, string[]> = {
  pdf: ['application/pdf'],
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  webp: ['image/webp'],
}

function governorateName(item: ApiGovernorate): string {
  return item.name_ar || item.name || item.name_en || ''
}

function normalizeRegion(value: string): string {
  return value
    .trim()
    .replace(/^محافظة\s+/, '')
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('ar')
}

function normalizeCapacity(value: string): string {
  return value
    .trim()
    .replace(/[٠-٩]/g, digit =>
      String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)),
    )
    .replace(/[۰-۹]/g, digit =>
      String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)),
    )
    .replace('٫', '.')
}

function validateAttachment(file: File): string | undefined {
  const extension =
    file.name.split('.').pop()?.toLowerCase() || ''

  const allowedMimeTypes = attachmentMimeTypes[extension]

  if (
    !allowedMimeTypes ||
    (file.type && !allowedMimeTypes.includes(file.type))
  ) {
    return 'الملف غير مدعوم ولن يُرفق. المسموح: PDF أو JPG أو PNG أو WEBP.'
  }

  if (!file.size) {
    return 'الملف فارغ ولن يُرفق.'
  }

  if (file.size > 10 * 1024 * 1024) {
    return 'حجم الملف يتجاوز 10 ميجابايت ولن يُرفق.'
  }

  return undefined
}

function apiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const apiError = error as {
    data?: {
      message?: string
      userMessage?: string
    }
  }

  return (
    apiError.data?.userMessage ||
    apiError.data?.message ||
    fallback
  )
}

export function useCustomerServiceRequest() {
  const { $api } = useNuxtApp()
  const route = useRoute()

  const form = reactive<ServiceRequestForm>({
    serviceType: '',
    region: '',
    capacity: '',
    description: '',
    location: '',
    locationCoordinates: '',
  })

  const errors = reactive<ServiceRequestErrors>({})
  const attachments = shallowRef<File[]>([])

  const loading = ref(true)
  const loadError = ref('')
  const submitting = ref(false)

  const statusMessage = ref('')
  const submissionState = ref<'idle' | 'success' | 'error'>(
    'idle',
  )

  const createdRequestId = ref<number | null>(null)

  const serviceOptions = ref<
    Array<{ value: string; label: string }>
  >([])

  const governorates = ref<ApiGovernorate[]>([])

  const serviceRegions = computed(() =>
    governorates.value.map(governorateName),
  )

  const selectedEngineerName = ref('')
  const engineerContextError = ref('')

  let optionsVersion = 0
  let engineerVersion = 0

  const engineerId = computed(() => {
    const value = Array.isArray(route.query.engineerId)
      ? route.query.engineerId[0]
      : route.query.engineerId

    const id = Number(value)

    return Number.isSafeInteger(id) && id > 0
      ? id
      : undefined
  })

  function clearErrors() {
    for (
      const key of Object.keys(errors) as Array<
        keyof ServiceRequestErrors
      >
    ) {
      delete errors[key]
    }
  }

  async function loadOptions(): Promise<void> {
    const currentRequest = ++optionsVersion

    loading.value = true
    loadError.value = ''

    try {
      const [servicesResponse, governoratesResponse] =
        await Promise.all([
          $api<ApiResponse<ApiServiceType[]>>(
            '/service-types',
          ),

          $api<ApiResponse<ApiGovernorate[]>>(
            '/governorates',
          ),
        ])

      if (currentRequest !== optionsVersion) return

      if (
        servicesResponse.status !== 'success' ||
        governoratesResponse.status !== 'success' ||
        !Array.isArray(servicesResponse.data) ||
        !Array.isArray(governoratesResponse.data)
      ) {
        throw new Error('Invalid response')
      }

      serviceOptions.value = servicesResponse.data.map(
        item => ({
          value: String(item.id),
          label: item.name,
        }),
      )

      governorates.value =
        governoratesResponse.data.filter(
          item => Boolean(governorateName(item)),
        )

      if (!serviceOptions.value.length) {
        loadError.value =
          'لا توجد أنواع خدمات متاحة حاليًا.'
      } else if (!governorates.value.length) {
        loadError.value =
          'لا توجد محافظات متاحة للاختيار حاليًا.'
      }
    } catch (error: unknown) {
      if (currentRequest !== optionsVersion) return

      loadError.value = apiErrorMessage(
        error,
        'تعذر تحميل أنواع الخدمات والمحافظات.',
      )
    } finally {
      if (currentRequest === optionsVersion) {
        loading.value = false
      }
    }
  }

  async function loadSelectedEngineer(): Promise<void> {
    const currentRequest = ++engineerVersion
    const id = engineerId.value

    selectedEngineerName.value = ''
    engineerContextError.value = ''

    if (!id) return

    try {
      const response = await $api<
        ApiResponse<{
          user?: {
            name?: string | null
          }
        }>
      >(`/engineers/${id}`)

      if (currentRequest !== engineerVersion) return

      if (response.status !== 'success') {
        throw new Error('Invalid response')
      }

      selectedEngineerName.value =
        response.data.user?.name || ''
    } catch {
      if (currentRequest !== engineerVersion) return

      engineerContextError.value =
        'تعذر تحميل بيانات المهندس المحدد. يمكنك نشر طلب عام لتلقي العروض.'
    }
  }

  function addAttachments(files: File[]) {
    if (
      submitting.value ||
      submissionState.value === 'success' ||
      !files.length
    ) {
      return
    }

    delete errors.attachments
    statusMessage.value = ''
    submissionState.value = 'idle'

    if (files.length !== 1) {
      errors.attachments =
        'اختر ملفًا واحدًا فقط. لم تتم إضافة الملفات الجديدة.'
      return
    }

    const file = files[0]!

    const attachmentError = validateAttachment(file)

    if (attachmentError) {
      errors.attachments = attachmentError
      return
    }

    attachments.value = [file]
  }

  function removeAttachment(index: number) {
    if (
      submitting.value ||
      submissionState.value === 'success'
    ) {
      return
    }

    attachments.value = attachments.value.filter(
      (_, position) => position !== index,
    )

    delete errors.attachments

    statusMessage.value = ''
    submissionState.value = 'idle'
  }

  function setProjectLocation(
    location: SelectedProjectLocation,
  ) {
    if (
      submitting.value ||
      submissionState.value === 'success'
    ) {
      return
    }

    if (
      !Number.isFinite(location.lat) ||
      !Number.isFinite(location.lng) ||
      Math.abs(location.lat) > 90 ||
      Math.abs(location.lng) > 180
    ) {
      errors.location = 'إحداثيات الموقع غير صحيحة.'
      return
    }

    delete errors.location

    form.location = location.address

    form.locationCoordinates =
      `POINT(${location.lng} ${location.lat})`

    if (location.governorate) {
      const selectedName = normalizeRegion(
        location.governorate,
      )

      if (!selectedName) return

      const match = governorates.value.find(item =>
        [item.name_ar, item.name_en, item.name].some(
          name =>
            Boolean(name) &&
            normalizeRegion(name!) === selectedName,
        ),
      )

      if (match) {
        form.region = governorateName(match)
      }
    }
  }

  function validate(): boolean {
    clearErrors()

    if (
      !serviceOptions.value.some(
        option => option.value === form.serviceType,
      )
    ) {
      errors.serviceType = 'اختر نوع الخدمة الهندسية.'
    }

    if (
      !governorates.value.some(
        item => governorateName(item) === form.region,
      )
    ) {
      errors.region = 'اختر المحافظة.'
    }

    const capacity = normalizeCapacity(form.capacity)

    if (
      capacity &&
      (
        !/^\d+(?:\.\d+)?$/.test(capacity) ||
        !Number.isFinite(Number(capacity)) ||
        Number(capacity) < 0
      )
    ) {
      errors.capacity =
        'أدخل السعة بالكيلوواط كرقم فقط، مثل 15.'
    }

    const description = form.description.trim()

    if (
      description.length < 20 ||
      description.length > 3000
    ) {
      errors.description =
        'اكتب وصفًا تفصيليًا بين 20 و3000 حرف.'
    }

    const location = form.location.trim()

    if (
      location.length < 10 ||
      location.length > 1500
    ) {
      errors.location =
        'اكتب معلومات الموقع بين 10 و1500 حرف.'
    }

    if (attachments.value.length > 1) {
      errors.attachments =
        'يمكن إرفاق ملف واحد فقط.'
    } else if (attachments.value[0]) {
      const attachmentError = validateAttachment(
        attachments.value[0],
      )

      if (attachmentError) {
        errors.attachments = attachmentError
      }
    }

    return Object.keys(errors).length === 0
  }

  async function submit(): Promise<boolean> {
    if (
      submitting.value ||
      loading.value ||
      loadError.value ||
      submissionState.value === 'success'
    ) {
      return false
    }

    statusMessage.value = ''

    if (!validate()) {
      submissionState.value = 'error'

      statusMessage.value =
        'يرجى مراجعة الحقول الموضحة قبل نشر الطلب.'

      return false
    }

    submitting.value = true

    try {
      const governorate = governorates.value.find(
        item => governorateName(item) === form.region,
      )!

      const body = new FormData()

      body.append(
        'service_type_id',
        form.serviceType,
      )

      body.append(
        'governorate_id',
        String(governorate.id),
      )

      body.append(
        'description',
        form.description.trim(),
      )

      body.append(
        'location_details',
        form.location.trim(),
      )

      const capacity = normalizeCapacity(form.capacity)

      if (capacity) {
        body.append(
          'system_capacity_estimate',
          capacity,
        )
      }

      if (form.locationCoordinates) {
        body.append(
          'location_coordinates',
          form.locationCoordinates,
        )
      }

      if (attachments.value[0]) {
        body.append(
          'attachment',
          attachments.value[0],
        )
      }

      // لا نرسل engineer_id؛ الطلب متاح لتلقي العروض.
      const response = await $api<
        ApiResponse<{
          id: number | string
        }>
      >('/service-requests', {
        method: 'POST',
        body,
        retry: 0,
      })

      if (response.status !== 'success') {
        throw new Error('Request failed')
      }

      const id = Number(response.data?.id)

      createdRequestId.value =
        Number.isSafeInteger(id) && id > 0
          ? id
          : null

      submissionState.value = 'success'

      statusMessage.value = createdRequestId.value
        ? `تم نشر طلب الخدمة رقم #${createdRequestId.value} بنجاح.`
        : 'تم نشر طلب الخدمة بنجاح.'

      return true
    } catch (error: unknown) {
      submissionState.value = 'error'

      statusMessage.value = apiErrorMessage(
        error,
        'تعذر نشر الطلب. مدخلاتك ما زالت في النموذج.',
      )

      const apiError = error as {
        data?: {
          errors?: Record<string, string[]>
        }
      }

      const fieldMap: Record<
        string,
        keyof ServiceRequestErrors
      > = {
        service_type_id: 'serviceType',
        governorate_id: 'region',
        system_capacity_estimate: 'capacity',
        description: 'description',
        location_details: 'location',
        location_coordinates: 'location',
        attachment: 'attachments',
      }

      for (
        const [field, messages] of Object.entries(
          apiError.data?.errors || {},
        )
      ) {
        const target = fieldMap[field]

        if (target && messages[0]) {
          errors[target] = messages[0]
        }
      }

      return false
    } finally {
      submitting.value = false
    }
  }

  function resetForm() {
    if (submitting.value) return

    Object.assign(form, {
      serviceType: '',
      region: '',
      capacity: '',
      description: '',
      location: '',
      locationCoordinates: '',
    })

    attachments.value = []
    createdRequestId.value = null

    clearErrors()

    statusMessage.value = ''
    submissionState.value = 'idle'
  }

  watch(
    form,
    () => {
      if (
        !submitting.value &&
        submissionState.value !== 'success'
      ) {
        statusMessage.value = ''
        submissionState.value = 'idle'
      }
    },
    { deep: true },
  )

  onMounted(async () => {
    await Promise.all([
      loadOptions(),
      loadSelectedEngineer(),
    ])
  })

  watch(engineerId, loadSelectedEngineer)

  onBeforeUnmount(() => {
    optionsVersion++
    engineerVersion++
  })

  return {
    form,
    errors,
    attachments,
    loading,
    loadError,
    submitting,
    submissionState,
    statusMessage,
    createdRequestId,
    serviceOptions,
    serviceRegions,
    engineerId,
    selectedEngineerName,
    engineerContextError,
    loadOptions,
    addAttachments,
    removeAttachment,
    setProjectLocation,
    submit,
    resetForm,
  }
}