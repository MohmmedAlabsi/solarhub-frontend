<script setup lang="ts">
import { CheckCircle2, Edit3, FileUp, ImagePlus, PlusCircle, X } from 'lucide-vue-next'
import type {
  EngineerProjectItem,
  GovernorateOption,
  NewProjectPayload,
  SelectOption,
} from '~~/app/composables/useEngineerProjects'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    editProject?: EngineerProjectItem | null
    serviceTypesList?: SelectOption[]
    governoratesList?: GovernorateOption[]
    submitAction?: (payload: NewProjectPayload, isEdit: boolean, id?: number) => Promise<any>
  }>(),
  {
    editProject: null,
    serviceTypesList: () => [],
    governoratesList: () => [],
    submitAction: undefined,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'submit', payload: NewProjectPayload, isEdit: boolean, id?: number): void
}>()

const form = reactive<NewProjectPayload>({
  project_title: '',
  service_type_id: '',
  system_capacity: '',
  governorate_id: '',
  address_text: '',
  description: '',
  image_file: null,
  file_attachment: null,
})

const errors = reactive<Record<string, string>>({})
const isSubmitting = ref(false)

const imageInput = ref<HTMLInputElement>()
const fileInput = ref<HTMLInputElement>()

function populateFromEdit() {
  if (props.editProject) {
    form.project_title = props.editProject.project_title || ''
    form.service_type_id = props.editProject.service_type_id || ''
    form.system_capacity = props.editProject.raw_capacity !== undefined && props.editProject.raw_capacity !== null
      ? String(props.editProject.raw_capacity)
      : props.editProject.system_capacity.replace(/[^\d.]/g, '')
    form.governorate_id = props.editProject.governorate_id || ''
    form.address_text = props.editProject.address_text || ''
    form.description = props.editProject.description || ''
    form.image_file = null
    form.file_attachment = null
  } else {
    resetForm()
  }
  Object.keys(errors).forEach(k => delete errors[k])
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      populateFromEdit()
    } else {
      resetForm()
    }
  }
)

watch(
  () => props.editProject,
  () => {
    if (props.modelValue) {
      populateFromEdit()
    }
  }
)

function close() {
  emit('update:modelValue', false)
  resetForm()
}

function resetForm() {
  form.project_title = ''
  form.service_type_id = ''
  form.system_capacity = ''
  form.governorate_id = ''
  form.address_text = ''
  form.description = ''
  form.image_file = null
  form.file_attachment = null
  Object.keys(errors).forEach(k => delete errors[k])
}

function handleImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      errors.image = 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت'
      return
    }
    delete errors.image
    form.image_file = file
  }
}

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      errors.file = 'حجم الملف يجب ألا يتجاوز 10 ميجابايت'
      return
    }
    delete errors.file
    form.file_attachment = file
  }
}

function validate() {
  Object.keys(errors).forEach(k => delete errors[k])

  if (!form.project_title.trim()) errors.project_title = 'عنوان المشروع مطلوب'
  if (!form.service_type_id) errors.service_type_id = 'يرجى اختيار نوع الخدمة'
  if (!form.system_capacity.trim()) errors.system_capacity = 'يرجى إدخال سعة النظام'
  if (!form.governorate_id) errors.governorate_id = 'يرجى اختيار المحافظة'
  if (!form.description.trim()) errors.description = 'وصف ومواصفات المشروع مطلوبة'

  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  if (!validate()) return

  isSubmitting.value = true
  try {
    if (props.submitAction) {
      await props.submitAction({ ...form }, !!props.editProject, props.editProject?.id)
    } else {
      emit('submit', { ...form }, !!props.editProject, props.editProject?.id)
    }
    close()
  } catch (err: any) {
    const backendErrors = err?.data?.errors
    if (backendErrors && typeof backendErrors === 'object') {
      for (const [key, msgs] of Object.entries(backendErrors)) {
        errors[key] = Array.isArray(msgs) ? msgs[0] : String(msgs)
      }
    } else {
      errors.general = err?.data?.message || err?.message || 'تعذر حفظ بيانات المشروع، يرجى مراجعة المدخلات'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        dir="rtl"
      >
        <div class="fixed inset-0 bg-solar-navy-dark/60 backdrop-blur-sm" aria-hidden="true" @click="close" />

        <div class="relative w-full max-w-2xl rounded-2xl border border-solar-border-card bg-white shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden">
          <!-- الهيدر -->
          <div class="flex items-center justify-between gap-4 border-b border-solar-border-card px-6 py-4 shrink-0">
            <div class="flex items-center gap-2.5">
              <div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow text-solar-navy-dark shadow-xs">
                <Edit3 v-if="editProject" class="size-5" />
                <PlusCircle v-else class="size-5" />
              </div>
              <h3 class="text-base font-black text-solar-text-heading">
                {{ editProject ? 'تعديل بيانات المشروع في أعمالي السابقة' : 'إضافة مشروع جديد إلى أعمالي السابقة' }}
              </h3>
            </div>
            <button
              type="button"
              class="flex size-8 items-center justify-center rounded-lg text-solar-text-muted hover:bg-solar-bg-subtle transition-colors"
              @click="close"
            >
              <X class="size-5" />
            </button>
          </div>

          <!-- رسالة خطأ عامة إن وجدت -->
          <div v-if="errors.general" class="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {{ errors.general }}
          </div>

          <!-- جسم النموذج -->
          <form class="flex-1 overflow-y-auto p-6 space-y-4" @submit.prevent="handleSubmit">
            <!-- عنوان المشروع -->
            <div>
              <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
                عنوان المشروع <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.project_title"
                type="text"
                placeholder="مثال: محطة طاقة كهروضوئية لمصنع تمور"
                class="w-full rounded-lg border border-solar-border-input bg-white px-3.5 py-2.5 text-xs text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:outline-none focus:ring-1 focus:ring-solar-yellow"
                :class="{ 'border-red-400': errors.project_title }"
              />
              <p v-if="errors.project_title" class="mt-1 text-[11px] text-red-500">{{ errors.project_title }}</p>
            </div>

            <!-- نوع الخدمة وسعة النظام -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
                  نوع الخدمة <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="form.service_type_id"
                  class="w-full rounded-lg border border-solar-border-input bg-white px-3.5 py-2.5 text-xs text-solar-text-heading focus:border-solar-yellow focus:outline-none focus:ring-1 focus:ring-solar-yellow cursor-pointer"
                  :class="{ 'border-red-400': errors.service_type_id }"
                >
                  <option value="" disabled>اختر نوع الخدمة...</option>
                  <option v-for="type in serviceTypesList" :key="type.id" :value="type.id">
                    {{ type.label }}
                  </option>
                </select>
                <p v-if="errors.service_type_id" class="mt-1 text-[11px] text-red-500">{{ errors.service_type_id }}</p>
              </div>

              <div>
                <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
                  سعة النظام <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input
                    v-model="form.system_capacity"
                    type="text"
                    placeholder="150"
                    class="w-full rounded-lg border border-solar-border-input bg-white px-3.5 py-2.5 pl-12 text-xs text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:outline-none focus:ring-1 focus:ring-solar-yellow"
                    :class="{ 'border-red-400': errors.system_capacity }"
                  />
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-solar-text-muted">kWp</span>
                </div>
                <p v-if="errors.system_capacity" class="mt-1 text-[11px] text-red-500">{{ errors.system_capacity }}</p>
              </div>
            </div>

            <!-- المحافظة والعنوان التفصيلي -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
                  المحافظة <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="form.governorate_id"
                  class="w-full rounded-lg border border-solar-border-input bg-white px-3.5 py-2.5 text-xs text-solar-text-heading focus:border-solar-yellow focus:outline-none focus:ring-1 focus:ring-solar-yellow cursor-pointer"
                  :class="{ 'border-red-400': errors.governorate_id }"
                >
                  <option value="" disabled>اختر المحافظة...</option>
                  <option v-for="gov in governoratesList" :key="gov.id" :value="gov.id">
                    {{ gov.name }}
                  </option>
                </select>
                <p v-if="errors.governorate_id" class="mt-1 text-[11px] text-red-500">{{ errors.governorate_id }}</p>
              </div>

              <div>
                <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
                  عنوان الموقع التفصيلي
                </label>
                <input
                  v-model="form.address_text"
                  type="text"
                  placeholder="مثال: المدينة الصناعية الثانية، طريق الخرج"
                  class="w-full rounded-lg border border-solar-border-input bg-white px-3.5 py-2.5 text-xs text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:outline-none focus:ring-1 focus:ring-solar-yellow"
                />
              </div>
            </div>

            <!-- وصف ومواصفات المشروع -->
            <div>
              <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
                وصف ومواصفات المشروع <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="اكتب وصفاً تقنياً موجزاً للمشروع، ومخططات التنفيذ، وتوافقه مع كود البناء السعودي..."
                class="w-full rounded-lg border border-solar-border-input bg-white p-3 text-xs text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:outline-none focus:ring-1 focus:ring-solar-yellow resize-none"
                :class="{ 'border-red-400': errors.description }"
              />
              <p v-if="errors.description" class="mt-1 text-[11px] text-red-500">{{ errors.description }}</p>
            </div>

            <!-- رفع الملفات والصور -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <!-- صورة المشروع -->
              <div>
                <span class="block text-xs font-bold text-solar-text-heading mb-1.5">
                  صورة المشروع
                </span>
                <div
                  class="flex flex-col items-center justify-center rounded-xl border border-dashed border-solar-border-input bg-solar-bg-subtle p-5 text-center cursor-pointer hover:border-solar-yellow transition-colors"
                  @click="imageInput?.click()"
                >
                  <ImagePlus class="size-6 text-solar-text-muted mb-2" />
                  <p class="text-xs font-bold text-solar-text-heading">
                    <span v-if="form.image_file">{{ form.image_file.name }}</span>
                    <span v-else-if="editProject?.image_url">تغيير الصورة الحالية</span>
                    <span v-else>رفع صورة المشروع الرئيسية</span>
                  </p>
                  <span class="text-[10px] text-solar-text-muted mt-0.5">JPG, PNG, WebP بحد أقصى 5MB</span>
                  <input
                    ref="imageInput"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    class="hidden"
                    @change="handleImageChange"
                  />
                </div>
                <p v-if="errors.image" class="mt-1 text-[11px] text-red-500">{{ errors.image }}</p>
              </div>

              <!-- ملف المشروع -->
              <div>
                <span class="block text-xs font-bold text-solar-text-heading mb-1.5">
                  ملف المخطط التنفيذي (PDF)
                </span>
                <div
                  class="flex flex-col items-center justify-center rounded-xl border border-dashed border-solar-border-input bg-solar-bg-subtle p-5 text-center cursor-pointer hover:border-solar-yellow transition-colors"
                  @click="fileInput?.click()"
                >
                  <FileUp class="size-6 text-solar-text-muted mb-2" />
                  <p class="text-xs font-bold text-solar-text-heading">
                    <span v-if="form.file_attachment">{{ form.file_attachment.name }}</span>
                    <span v-else-if="editProject?.file_name">استبدال المخطط: {{ editProject.file_name }}</span>
                    <span v-else>إرفاق ملف المخطط التنفيذي (PDF)</span>
                  </p>
                  <span class="text-[10px] text-solar-text-muted mt-0.5">PDF بحد أقصى 10MB</span>
                  <input
                    ref="fileInput"
                    type="file"
                    accept=".pdf"
                    class="hidden"
                    @change="handleFileChange"
                  />
                </div>
                <p v-if="errors.file" class="mt-1 text-[11px] text-red-500">{{ errors.file }}</p>
              </div>
            </div>
          </form>

          <!-- الفوتر والأزرار -->
          <div class="flex items-center justify-between border-t border-solar-border-card px-6 py-4 bg-solar-bg-subtle/30 shrink-0">
            <button
              type="button"
              class="rounded-lg border border-solar-border-card px-5 py-2.5 text-xs font-bold text-solar-text-secondary hover:bg-solar-bg-subtle transition-colors"
              @click="close"
            >
              إلغاء
            </button>

            <button
              type="button"
              class="btn-primary flex items-center gap-2 text-xs"
              :disabled="isSubmitting"
              @click="handleSubmit"
            >
              <CheckCircle2 class="size-4" />
              <span>{{ isSubmitting ? 'جارٍ الحفظ...' : (editProject ? 'حفظ التعديلات' : 'حفظ وإضافة المشروع') }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
