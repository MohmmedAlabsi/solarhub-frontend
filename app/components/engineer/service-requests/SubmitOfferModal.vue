<script setup lang="ts">
import { FileText, Send, Upload, X } from 'lucide-vue-next'
import type { EngineerServiceRequest, SubmitOfferForm } from '~~/app/composables/useEngineerServiceRequests'

const props = defineProps<{
  modelValue: boolean
  request: EngineerServiceRequest | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submitted'): void
}>()

function close() { emit('update:modelValue', false) }

// نموذج تقديم العرض
const form = reactive<SubmitOfferForm>({
  totalCost: '',
  durationDays: '',
  methodology: '',
  attachmentFile: null,
})
const errors = reactive<Partial<Record<keyof SubmitOfferForm, string>>>({})
const submitting = ref(false)
const submitSuccess = ref(false)

// منطق رفع الملف
const fileInput = ref<HTMLInputElement>()
function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    if (file.size > 15 * 1024 * 1024) {
      errors.attachmentFile = 'حجم الملف يجب أن يكون أقل من 15 ميجابايت'
      return
    }
    delete errors.attachmentFile
    form.attachmentFile = file
  }
}
function removeFile() {
  form.attachmentFile = null
  if (fileInput.value) fileInput.value.value = ''
}

// التحقق من الصحة
function validate() {
  for (const key of Object.keys(errors) as Array<keyof SubmitOfferForm>) delete errors[key]
  if (!form.totalCost || isNaN(Number(form.totalCost)) || Number(form.totalCost) <= 0)
    errors.totalCost = 'يرجى إدخال تكلفة إجمالية صحيحة'
  if (!form.durationDays || isNaN(Number(form.durationDays)) || Number(form.durationDays) <= 0)
    errors.durationDays = 'يرجى إدخال مدة التنفيذ بالأيام'
  if (form.methodology.trim().length < 30)
    errors.methodology = 'يرجى شرح منهجية العمل (30 حرفاً على الأقل)'
  return Object.keys(errors).length === 0
}

const { $api } = useNuxtApp()

async function submit() {
  if (submitting.value || !validate() || !props.request) return
  submitting.value = true
  try {
    const rawId = props.request.rawId || Number(props.request.id.replace(/\D/g, ''))
    const formData = new FormData()
    formData.append('proposed_cost', form.totalCost.trim())
    formData.append('execution_time_days', form.durationDays.trim())
    formData.append('technical_proposal', form.methodology.trim())
    if (form.attachmentFile) {
      formData.append('proposal', form.attachmentFile)
    }

    await $api(`/service-requests/${rawId}/offers`, {
      method: 'POST',
      body: formData,
    })

    submitSuccess.value = true
    setTimeout(() => {
      close()
      submitSuccess.value = false
      Object.assign(form, { totalCost: '', durationDays: '', methodology: '', attachmentFile: null })
      emit('submitted')
    }, 1200)
  } catch (err: any) {
    const backendMsg = err?.data?.message || err?.data?.userMessage || 'حدث خطأ أثناء إرسال العرض. حاول مرة أخرى.'
    const backendErrors = err?.data?.errors
    if (backendErrors?.proposed_cost) errors.totalCost = backendErrors.proposed_cost[0]
    if (backendErrors?.execution_time_days) errors.durationDays = backendErrors.execution_time_days[0]
    if (backendErrors?.technical_proposal) errors.methodology = backendErrors.technical_proposal[0]
    if (backendErrors?.proposal) errors.attachmentFile = backendErrors.proposal[0]
    if (!Object.keys(errors).length) errors.totalCost = backendMsg
  } finally {
    submitting.value = false
  }
}

// تنظيف عند الإغلاق
watch(() => props.modelValue, open => {
  if (!open) {
    Object.assign(form, { totalCost: '', durationDays: '', methodology: '', attachmentFile: null })
    for (const k of Object.keys(errors) as Array<keyof SubmitOfferForm>) delete errors[k]
    submitSuccess.value = false
  }
})

function handleKeydown(event: KeyboardEvent) {
  if (props.modelValue && event.key === 'Escape') close()
}
onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
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
        v-if="modelValue && request"
        class="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        dir="rtl"
        :aria-label="`تقديم عرض هندسي على ${request.id}`"
      >
        <div class="fixed inset-0 bg-solar-navy-dark/60 backdrop-blur-sm" aria-hidden="true" @click="close" />

        <div class="relative w-full max-w-lg rounded-2xl border border-solar-border-card bg-white shadow-2xl z-10">
          <!-- الهيدر -->
          <div class="flex items-center justify-between gap-4 border-b border-solar-border-card px-6 py-4">
            <div class="flex items-center gap-2.5">
              <div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark">
                <FileText class="size-5" />
              </div>
              <h3 class="text-base font-black text-solar-text-heading">تقديم عرض هندسي</h3>
            </div>
            <button
              type="button"
              @click="close"
              class="flex size-8 items-center justify-center rounded-lg text-solar-text-muted hover:bg-solar-bg-subtle transition-colors"
              aria-label="إغلاق"
            >
              <X class="size-5" />
            </button>
          </div>

          <!-- النموذج -->
          <form class="flex flex-col gap-5 p-6" @submit.prevent="submit" novalidate>
            <!-- حقلان جنباً إلى جنب: التكلفة + المدة -->
            <div class="grid grid-cols-2 gap-4">
              <!-- التكلفة الإجمالية -->
              <div class="flex flex-col gap-1.5">
                <label for="offer-cost" class="text-xs font-bold text-solar-text-heading">
                  التكلفة الإجمالية المقترحة (ر.س)*
                </label>
                <div class="relative">
                  <input
                    id="offer-cost"
                    v-model="form.totalCost"
                    type="number"
                    min="1"
                    placeholder="4,500"
                    class="w-full rounded-lg border border-solar-border-input bg-white px-3 py-2.5 text-sm text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-colors"
                    :class="{ 'border-red-400 focus:border-red-400 focus:ring-red-100': errors.totalCost }"
                    aria-describedby="offer-cost-unit"
                  />
                  <span id="offer-cost-unit" class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-solar-text-muted">ر.س</span>
                </div>
                <p v-if="errors.totalCost" class="text-xs text-red-500">{{ errors.totalCost }}</p>
              </div>

              <!-- مدة التنفيذ -->
              <div class="flex flex-col gap-1.5">
                <label for="offer-duration" class="text-xs font-bold text-solar-text-heading">
                  مدة التنفيذ التوقعة (أيام)*
                </label>
                <div class="relative">
                  <input
                    id="offer-duration"
                    v-model="form.durationDays"
                    type="number"
                    min="1"
                    placeholder="7"
                    class="w-full rounded-lg border border-solar-border-input bg-white px-3 py-2.5 text-sm text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-colors"
                    :class="{ 'border-red-400': errors.durationDays }"
                  />
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-solar-text-muted">أيام</span>
                </div>
                <p v-if="errors.durationDays" class="text-xs text-red-500">{{ errors.durationDays }}</p>
              </div>
            </div>

            <!-- وصف صغير للحقلين -->
            <p class="text-xs text-solar-text-muted -mt-3">
              من تاريخ تسمية القيمة المقدمة وعدد الوحدات
            </p>

            <!-- العرض الفني ومنهجية العمل -->
            <div class="flex flex-col gap-1.5">
              <label for="offer-methodology" class="text-xs font-bold text-solar-text-heading">
                العرض الفني ومنهجية العمل*
              </label>
              <textarea
                id="offer-methodology"
                v-model="form.methodology"
                rows="5"
                placeholder="يشتمل العرض الفني على مراجعة الأحمال الكهربائية الفعلية وتحديد السعة التوليدية المثلى، مع تقديم المخططات الكهربائية الأحادية والتقارير التقنيدية المعتمدة لشركة الكهرباء"
                class="w-full resize-none rounded-lg border border-solar-border-input bg-white px-3 py-2.5 text-sm text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:outline-none focus:ring-2 focus:ring-solar-yellow/20 transition-colors"
                :class="{ 'border-red-400': errors.methodology }"
              />
              <div class="flex items-center justify-between">
                <p v-if="errors.methodology" class="text-xs text-red-500">{{ errors.methodology }}</p>
                <p v-else class="text-xs text-solar-text-muted">{{ form.methodology.length }} / 3000 حرف</p>
              </div>
            </div>

            <!-- رفع ملف العرض الفني (اختياري) -->
            <div class="flex flex-col gap-2">
              <p class="text-xs font-bold text-solar-text-heading">
                إرفاق ملف العرض الفني / المخططات (اختياري)
              </p>

              <!-- منطقة الرفع -->
              <div
                v-if="!form.attachmentFile"
                class="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-solar-border-input bg-solar-bg-subtle p-6 text-center transition-colors hover:border-solar-yellow/50 cursor-pointer"
                @click="fileInput?.click()"
                @keydown.enter="fileInput?.click()"
                @keydown.space.prevent="fileInput?.click()"
                tabindex="0"
                role="button"
                aria-label="اضغط لاختيار ملف العرض الفني"
              >
                <Upload class="size-7 text-solar-text-muted" aria-hidden="true" />
                <p class="text-xs font-semibold text-solar-text-body">اضغط لاختيار ملف العرض (PDF) أو اسحبه إلى هنا</p>
                <p class="text-[11px] text-solar-text-muted">مقبول: PDF أو ZIP بحد أقصى 15MB</p>
              </div>

              <!-- ملف محدد -->
              <div
                v-else
                class="flex items-center justify-between rounded-xl border border-solar-border-card bg-solar-bg-subtle p-3"
              >
                <div class="flex items-center gap-2.5">
                  <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100">
                    <FileText class="size-4 text-red-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-solar-text-heading truncate max-w-[200px]">{{ form.attachmentFile.name }}</p>
                    <p class="text-[11px] text-solar-text-muted">{{ (form.attachmentFile.size / 1024 / 1024).toFixed(1) }} ميجابايت</p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="removeFile"
                  class="flex size-6 items-center justify-center rounded-full text-solar-text-muted hover:bg-red-100 hover:text-red-600 transition-colors"
                  aria-label="حذف الملف"
                >
                  <X class="size-4" />
                </button>
              </div>

              <p v-if="errors.attachmentFile" class="text-xs text-red-500">{{ errors.attachmentFile }}</p>
              <input ref="fileInput" type="file" accept=".pdf,.zip" class="hidden" @change="onFileChange" />
            </div>

            <!-- رسالة النجاح -->
            <div
              v-if="submitSuccess"
              class="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-sm font-semibold text-emerald-700"
            >
              ✅ تم إرسال العرض الهندسي بنجاح!
            </div>
          </form>

          <!-- أزرار الفوتر -->
          <div class="flex items-center justify-between gap-3 border-t border-solar-border-card px-6 py-4">
            <button
              type="button"
              @click="close"
              :disabled="submitting"
              class="rounded-lg border border-solar-border-card px-4 py-2 text-sm font-semibold text-solar-text-body hover:bg-solar-bg-subtle transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="button"
              @click="submit"
              :disabled="submitting || submitSuccess"
              class="btn-primary flex items-center gap-2 text-sm disabled:opacity-70"
            >
              <Send class="size-4" aria-hidden="true" />
              {{ submitting ? 'جارٍ الإرسال...' : 'إرسال العرض الهندسي' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
