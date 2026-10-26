<script setup lang="ts">
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  FileText,
  Loader2,
  MapPin,
  Paperclip,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-vue-next'
import FormField from '../../common/FormField.vue'
import ServiceAttachments from './ServiceAttachments.vue'
import { useCustomerServices } from '../../../composables/useCustomerServices'

const router = useRouter()
const {
  serviceTypes,
  governorates,
  isActionLoading,
  error: apiError,
  fetchServiceTypes,
  fetchGovernorates,
  createServiceRequest,
} = useCustomerServices()

const form = reactive({
  serviceTypeId: '' as string | number,
  governorateId: '' as string | number,
  capacity: '',
  description: '',
  locationDetails: '',
  locationCoordinates: '',
})

const errors = reactive<Record<string, string>>({})
const attachments = shallowRef<File[]>([])
const statusMessage = ref('')
const submissionState = ref<'idle' | 'success' | 'error'>('idle')
const isMapModalOpen = ref(false)

const controlClass = 'solar-input min-h-11 min-w-0 disabled:opacity-60'

onMounted(async () => {
  await Promise.allSettled([
    fetchServiceTypes(),
    fetchGovernorates(),
  ])
})

function handleLocationSelected(loc: { address: string; lat: number; lng: number; governorate?: string }) {
  form.locationDetails = loc.address
  form.locationCoordinates = `${loc.lat.toFixed(6)},${loc.lng.toFixed(6)}`

  if (loc.governorate && governorates.value.length > 0) {
    const match = governorates.value.find(g =>
      g.name_ar.includes(loc.governorate!) || loc.governorate!.includes(g.name_ar)
    )
    if (match) {
      form.governorateId = match.id
    }
  }
}

function addAttachments(files: File[]) {
  if (isActionLoading.value) return
  delete errors.attachments
  const validFiles: File[] = []
  const maxBytes = 10 * 1024 * 1024 // 10MB

  for (const file of files) {
    if (file.size > maxBytes) {
      errors.attachments = `الملف ${file.name} يتجاوز الحجم المسموح (10 ميجابايت).`
      continue
    }
    validFiles.push(file)
  }

  if (validFiles.length > 0) {
    attachments.value = [...attachments.value, ...validFiles]
  }
}

function removeAttachment(index: number) {
  if (isActionLoading.value) return
  attachments.value = attachments.value.filter((_, i) => i !== index)
  delete errors.attachments
}

function validate(): boolean {
  Object.keys(errors).forEach(k => delete errors[k])

  if (!form.serviceTypeId) {
    errors.serviceTypeId = 'يرجى اختيار نوع الخدمة الهندسية.'
  }

  if (!form.governorateId) {
    errors.governorateId = 'يرجى اختيار المحافظة.'
  }

  if (form.description.trim().length < 15) {
    errors.description = 'اكتب وصفاً تفصيلياً للمشروع لا يقل عن 15 حرفاً.'
  }

  if (form.capacity) {
    const num = parseFloat(form.capacity.trim())
    if (isNaN(num) || num <= 0) {
      errors.capacity = 'أدخل سعة رقمية موجبة (مثال: 15).'
    }
  }

  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  if (isActionLoading.value) return
  statusMessage.value = ''

  if (!validate()) {
    submissionState.value = 'error'
    statusMessage.value = 'يرجى استكمال الحقول المطلوبة والموضحة باللون الأحمر.'
    return
  }

  try {
    const formData = new FormData()
    formData.append('service_type_id', String(form.serviceTypeId))
    if (form.governorateId) {
      formData.append('governorate_id', String(form.governorateId))
    }
    if (form.capacity.trim()) {
      formData.append('system_capacity_estimate', form.capacity.trim())
    }
    formData.append('description', form.description.trim())
    if (form.locationDetails.trim()) {
      formData.append('location_details', form.locationDetails.trim())
    }
    if (form.locationCoordinates.trim()) {
      formData.append('location_coordinates', form.locationCoordinates.trim())
    }
    if (attachments.value.length > 0) {
      formData.append('attachment', attachments.value[0])
    }

    const created = await createServiceRequest(formData)
    submissionState.value = 'success'
    statusMessage.value = 'تم نشر طلب الخدمة الهندسية بنجاح! سيتم تحويلك إلى صفحة تفاصيل الطلب...'

    setTimeout(() => {
      router.push(`/customer/services/${created.id || ''}`)
    }, 1200)
  } catch (err: any) {
    submissionState.value = 'error'
    statusMessage.value =
      err?.data?.message || err?.message || 'تعذر إرسال الطلب، يرجى التحقق من الاتصال والمحاولة مجدداً.'
  }
}
</script>

<template>
  <form novalidate class="service-request-form rounded-2xl border border-solar-border-card bg-white p-6 sm:p-10 shadow-sm" :aria-busy="isActionLoading" @submit.prevent="handleSubmit">
    <fieldset :disabled="isActionLoading" class="min-w-0 space-y-10" aria-label="بيانات طلب خدمة هندسية جديدة">
      <!-- القسم الأول: بيانات الخدمة -->
      <section aria-labelledby="service-data-heading">
        <h2 id="service-data-heading" class="mb-5 flex items-center gap-2 text-base font-bold text-solar-text-heading">
          <SlidersHorizontal class="size-8 rounded-xl bg-solar-status-info-bg p-1.5 text-solar-navy-dark" aria-hidden="true" />
          <span>القسم الأول: بيانات الخدمة والموقع</span>
        </h2>

        <div class="grid gap-6 md:grid-cols-3">
          <!-- نوع الخدمة -->
          <div>
            <FormField label="نوع الخدمة الهندسية" required :error="errors.serviceTypeId">
              <span class="relative block">
                <select v-model="form.serviceTypeId" :class="controlClass" class="appearance-none pl-9" required :aria-invalid="!!errors.serviceTypeId">
                  <option value="" disabled>اختر نوع الخدمة الهندسية</option>
                  <option v-for="type in serviceTypes" :key="type.id" :value="type.id">
                    {{ type.name }}
                  </option>
                </select>
                <ChevronDown class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted" aria-hidden="true" />
              </span>
            </FormField>
            <p class="mt-2 text-xs leading-relaxed text-solar-text-muted">اختر طبيعة الاستشارة أو الخدمة الفنية المطلوبة.</p>
          </div>

          <!-- المحافظة -->
          <div>
            <FormField label="المحافظة" required :error="errors.governorateId">
              <span class="relative block">
                <select v-model="form.governorateId" :class="controlClass" class="appearance-none pl-9" required :aria-invalid="!!errors.governorateId">
                  <option value="" disabled>اختر المحافظة</option>
                  <option v-for="gov in governorates" :key="gov.id" :value="gov.id">
                    {{ gov.name_ar }}
                  </option>
                </select>
                <ChevronDown class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted" aria-hidden="true" />
              </span>
            </FormField>
            <p class="mt-2 text-xs leading-relaxed text-solar-text-muted">المحافظة أو المدينة التي يقع بها موقع المشروع.</p>
          </div>

          <!-- السعة التقديرية -->
          <div>
            <FormField label="السعة التقديرية (كيلوواط - kW)" :error="errors.capacity">
              <input
                v-model="form.capacity"
                type="number"
                step="any"
                min="0"
                :class="controlClass"
                placeholder="مثال: 15"
                :aria-invalid="!!errors.capacity"
              />
            </FormField>
            <p class="mt-2 text-xs leading-relaxed text-solar-text-muted">القدرة الكهربائية المقدرة بالكيلوواط أو حجم النظام المراد دراسته.</p>
          </div>
        </div>
      </section>

      <!-- القسم الثاني: وصف المشروع -->
      <section aria-labelledby="description-heading">
        <h2 id="description-heading" class="mb-5 flex items-center gap-2 text-base font-bold text-solar-text-heading">
          <FileText class="size-8 rounded-xl bg-solar-status-info-bg p-1.5 text-solar-navy-dark" aria-hidden="true" />
          <span>القسم الثاني: وصف المشروع والاحتياج</span>
        </h2>

        <FormField label="وصف تفصيلي لاحتياجك من الخدمة" required :error="errors.description">
          <textarea
            v-model="form.description"
            :class="controlClass"
            class="h-28 min-h-28 resize-y"
            required
            minlength="15"
            maxlength="3000"
            :aria-invalid="!!errors.description"
            placeholder="وضح الغرض من النظام (سكني، تجاري، زراعي ضخ مياه)، نوع المنظومة المطلوبة (متصلة بالشبكة، هجينة، بطاريات)، وأي متطلبات خاصة ترغب في مراعاتها..."
          />
        </FormField>
        <p class="mt-2 text-xs leading-relaxed text-solar-text-muted">اكتب شرحاً وافياً للأحمال واحتياجات الطاقة لمساعدة المهندس على تقديم عرض دقيق.</p>
      </section>

      <!-- القسم الثالث: معلومات الموقع والخريطة -->
      <section aria-labelledby="location-heading">
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 id="location-heading" class="flex items-center gap-2 text-base font-bold text-solar-text-heading">
            <MapPin class="size-8 rounded-xl bg-solar-status-info-bg p-1.5 text-solar-navy-dark" aria-hidden="true" />
            <span>القسم الثالث: تفاصيل الموقع والإحداثيات</span>
          </h2>

          <button
            type="button"
            @click="isMapModalOpen = true"
            class="inline-flex items-center gap-1.5 rounded-xl border border-solar-yellow bg-solar-yellow/20 px-3.5 py-1.5 text-xs font-bold text-solar-navy-dark hover:bg-solar-yellow/30 transition-all cursor-pointer shadow-2xs"
          >
            <MapPin class="size-4 text-solar-navy-dark" />
            <span>تحديد موقع المشروع على الخريطة</span>
          </button>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <FormField label="العنوان التفصيلي وطبيعة المكان" :error="errors.locationDetails">
            <input
              v-model="form.locationDetails"
              type="text"
              :class="controlClass"
              placeholder="مثال: مبنى سكني مكون من دورين وسطح خرساني، حدة - شارع بيروت..."
            />
          </FormField>

          <FormField label="الإحداثيات الجغرافية (خط العرض، خط الطول)">
            <input
              v-model="form.locationCoordinates"
              type="text"
              readonly
              :class="controlClass"
              class="bg-solar-bg-subtle text-solar-text-muted font-mono"
              placeholder="يتم تحديدها تلقائياً من الخريطة (مثال: 15.3694, 44.1910)"
            />
          </FormField>
        </div>
      </section>

      <!-- القسم الرابع: المرفقات -->
      <section aria-labelledby="attachments-heading">
        <h2 id="attachments-heading" class="mb-5 flex items-center gap-2 text-base font-bold text-solar-text-heading">
          <Paperclip class="size-8 rounded-xl bg-solar-status-info-bg p-1.5 text-solar-navy-dark" aria-hidden="true" />
          <span>القسم الرابع: المرفقات والمخططات (اختياري)</span>
        </h2>
        <ServiceAttachments :files="attachments" :error="errors.attachments" :disabled="isActionLoading" @add="addAttachments" @remove="removeAttachment" />
      </section>
    </fieldset>

    <!-- شريط الإجراء والزر النهائي -->
    <div class="mt-8 flex flex-col gap-4 border-t border-solar-border-card pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-2 text-xs text-solar-text-muted">
        <ShieldCheck class="size-4 text-emerald-600 shrink-0" />
        <span>يتم مراجعة الطلب فوراً ومشاركته فقط مع نخبة المهندسين المعتمدين والمصنفين لدى المنصة.</span>
      </div>

      <button
        type="submit"
        :disabled="isActionLoading || submissionState === 'success'"
        class="btn-primary h-11 w-full shrink-0 px-8 text-xs font-bold gap-2 sm:w-auto cursor-pointer disabled:opacity-50"
      >
        <Loader2 v-if="isActionLoading" class="size-4 animate-spin" />
        <ArrowLeft v-else class="size-4" />
        <span>{{ isActionLoading ? 'جارٍ نشر الطلب...' : 'نشر طلب الخدمة الهندسية' }}</span>
      </button>
    </div>

    <!-- رسالة الحالة والنتيجة -->
    <div
      v-if="statusMessage"
      class="mt-4 flex items-center gap-3 rounded-xl p-4 text-xs font-semibold"
      :class="submissionState === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'"
      role="status"
    >
      <AlertCircle v-if="submissionState === 'error'" class="size-4 shrink-0 text-red-600" />
      <CheckCircle2 v-else class="size-4 shrink-0 text-emerald-600" />
      <span>{{ statusMessage }}</span>
    </div>

    <!-- نافذة تحديد موقع المشروع على الخريطة -->
    <CommonMapLocationModal
      :is-open="isMapModalOpen"
      :current-location="form.locationDetails"
      title="تحديد موقع مشروع الطاقة الشمسية على الخريطة"
      subtitle="حدد موقع السطح أو المزرعة أو المبنى لتمكين المهندسين من دراسة الإشعاع الشمسي وحساب التكاليف بدقة"
      @close="isMapModalOpen = false"
      @select="handleLocationSelected"
    />
  </form>
</template>
