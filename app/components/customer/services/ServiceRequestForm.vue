<script setup lang="ts">
import {
  ArrowLeft,
  ChevronDown,
  FileText,
  Info,
  LoaderCircle,
  MapPin,
  Paperclip,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-vue-next'

import FormField from '../../common/FormField.vue'

import MapLocationModal, {
  type LocationData,
} from '../../common/MapLocationModal.vue'

import ServiceAttachments from './ServiceAttachments.vue'

import {
  useCustomerServiceRequest,
} from '~/composables/useCustomerServiceRequest'

const {
  form,
  errors,
  attachments,
  loading,
  loadError,
  submitting,
  submissionState,
  statusMessage,
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
} = useCustomerServiceRequest()

const isMapModalOpen = ref(false)

const fieldsDisabled = computed(() => {
  return (
    loading.value ||
    Boolean(loadError.value) ||
    submitting.value ||
    submissionState.value === 'success'
  )
})

const controlClass =
  'solar-input min-h-11 min-w-0 disabled:cursor-not-allowed disabled:opacity-60'

function handleLocationSelected(location: LocationData) {
  setProjectLocation(location)
  isMapModalOpen.value = false
}

function startNewRequest() {
  resetForm()
  isMapModalOpen.value = false
}

watch(fieldsDisabled, disabled => {
  if (disabled) {
    isMapModalOpen.value = false
  }
})
</script>

<template>
  <form
    novalidate
    class="service-request-form rounded-xl border border-solar-border-card bg-white px-5 pb-10 pt-8 sm:px-10 sm:pt-12"
    :aria-busy="loading || submitting"
    @submit.prevent="submit"
  >
    <!-- تحميل خيارات النموذج -->
    <div
      v-if="loading"
      class="mb-6 flex items-center gap-3 rounded-xl bg-solar-bg-subtle p-4 text-sm text-solar-text-muted"
      role="status"
      aria-live="polite"
    >
      <LoaderCircle
        class="size-5 shrink-0 animate-spin"
        aria-hidden="true"
      />

      جارٍ تحميل أنواع الخدمات والمحافظات...
    </div>

    <!-- تعذر تحميل الخيارات -->
    <div
      v-else-if="loadError"
      class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4"
      role="alert"
    >
      <p class="text-sm leading-7 text-red-700">
        {{ loadError }}
      </p>

      <button
        type="button"
        class="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-red-700"
        @click="loadOptions"
      >
        <RefreshCw class="size-4" aria-hidden="true" />
        إعادة المحاولة
      </button>
    </div>

    <!-- توضيح اختيار مهندس من الدليل -->
    <aside
      v-if="engineerId"
      class="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900"
    >
      <p v-if="selectedEngineerName" class="font-bold">
        بدأت هذا الطلب من ملف {{ selectedEngineerName }}.
      </p>

      <p v-else class="font-bold">
        بدأت هذا الطلب من ملف مهندس.
      </p>

      <p class="mt-1">
        سيُنشر الطلب لتلقي عروض المهندسين المعتمدين.
        اختيار المهندس يتم عند قبول عرضه.
      </p>

      <p v-if="engineerContextError" class="mt-2 text-xs">
        {{ engineerContextError }}
      </p>
    </aside>

    <fieldset
      :disabled="fieldsDisabled"
      class="min-w-0 space-y-10 sm:space-y-12"
    >
      <legend class="sr-only">
        بيانات طلب الخدمة الهندسية
      </legend>

      <!-- بيانات الخدمة -->
      <section aria-labelledby="service-data-heading">
        <h2
          id="service-data-heading"
          class="mb-5 flex items-center gap-2 text-lg font-bold text-solar-text-heading"
        >
          <SlidersHorizontal
            class="size-8 rounded-lg bg-solar-status-info-bg p-1.5"
            aria-hidden="true"
          />

          القسم الأول: بيانات الخدمة
        </h2>

        <div class="grid gap-6 md:grid-cols-3">
          <div>
            <FormField
              label="نوع الخدمة الهندسية"
              required
              :error="errors.serviceType"
            >
              <span class="relative block">
                <select
                  v-model="form.serviceType"
                  :class="controlClass"
                  class="appearance-none pl-9"
                  required
                  :aria-invalid="Boolean(errors.serviceType)"
                >
                  <option value="" disabled>
                    اختر نوع الخدمة الهندسية
                  </option>

                  <option
                    v-for="option in serviceOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>

                <ChevronDown
                  class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted"
                  aria-hidden="true"
                />
              </span>
            </FormField>

            <p class="mt-2 text-xs leading-5 text-solar-text-muted">
              اختر طبيعة الخدمة المطلوبة لمشروعك.
            </p>
          </div>

          <div>
            <FormField
              label="المحافظة / المنطقة"
              required
              :error="errors.region"
            >
              <span class="relative block">
                <select
                  v-model="form.region"
                  :class="controlClass"
                  class="appearance-none pl-9"
                  required
                  :aria-invalid="Boolean(errors.region)"
                >
                  <option value="" disabled>
                    اختر المحافظة
                  </option>

                  <option
                    v-for="region in serviceRegions"
                    :key="region"
                    :value="region"
                  >
                    {{ region }}
                  </option>
                </select>

                <ChevronDown
                  class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted"
                  aria-hidden="true"
                />
              </span>
            </FormField>

            <p class="mt-2 text-xs leading-5 text-solar-text-muted">
              اختر المحافظة التي يقع فيها المشروع.
            </p>
          </div>

          <div>
            <FormField
              label="السعة التقديرية بالكيلوواط"
              :error="errors.capacity"
            >
              <input
                v-model="form.capacity"
                type="number"
                inputmode="decimal"
                min="0"
                step="any"
                :class="controlClass"
                placeholder="مثال: 15"
                :aria-invalid="Boolean(errors.capacity)"
              />
            </FormField>

            <p class="mt-2 text-xs leading-5 text-solar-text-muted">
              أدخل رقمًا فقط. يمكنك ترك الحقل فارغًا
              إذا لم تعرف السعة.
            </p>
          </div>
        </div>
      </section>

      <!-- وصف المشروع -->
      <section aria-labelledby="description-heading">
        <h2
          id="description-heading"
          class="mb-5 flex items-center gap-2 text-lg font-bold text-solar-text-heading"
        >
          <FileText
            class="size-8 rounded-lg bg-solar-status-info-bg p-1.5"
            aria-hidden="true"
          />

          القسم الثاني: وصف المشروع
        </h2>

        <FormField
          label="وصف تفصيلي لاحتياجك"
          required
          :error="errors.description"
        >
          <textarea
            v-model="form.description"
            :class="controlClass"
            class="min-h-[126px] resize-y"
            required
            minlength="20"
            maxlength="3000"
            :aria-invalid="Boolean(errors.description)"
            placeholder="وضح الغرض من المشروع، والأحمال المطلوبة، ونوع المنظومة، وأي متطلبات خاصة..."
          />
        </FormField>

        <p class="mt-3 text-xs leading-6 text-solar-text-muted">
          اكتب بين 20 و3000 حرف لمساعدة المهندسين
          على تقديم عرض مناسب.
        </p>
      </section>

      <!-- معلومات الموقع -->
      <section aria-labelledby="location-heading">
        <div
          class="mb-5 flex flex-wrap items-center justify-between gap-3"
        >
          <h2
            id="location-heading"
            class="flex items-center gap-2 text-lg font-bold text-solar-text-heading"
          >
            <MapPin
              class="size-8 rounded-lg bg-solar-status-info-bg p-1.5"
              aria-hidden="true"
            />

            القسم الثالث: معلومات الموقع
          </h2>

          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl border border-solar-yellow bg-solar-yellow/20 px-3.5 py-2 text-xs font-bold text-solar-navy-dark transition hover:bg-solar-yellow/30 disabled:opacity-60"
            @click="isMapModalOpen = true"
          >
            <MapPin class="size-4" aria-hidden="true" />
            تحديد الموقع على الخريطة
          </button>
        </div>

        <FormField
          label="معلومات الموقع والمكان"
          required
          :error="errors.location"
        >
          <textarea
            v-model="form.location"
            :class="controlClass"
            class="min-h-[102px] resize-y"
            required
            minlength="10"
            maxlength="1500"
            :aria-invalid="Boolean(errors.location)"
            placeholder="اكتب المدينة والحي، وطبيعة المبنى أو الأرض، ونوع السطح، وسهولة الوصول إلى الموقع..."
          />
        </FormField>

        <p class="mt-3 text-xs leading-6 text-solar-text-muted">
          وضح العنوان وطبيعة الموقع. اختيار الخريطة
          يضيف الإحداثيات إلى الطلب.
        </p>

        <p
          v-if="form.locationCoordinates"
          class="mt-2 text-xs font-semibold text-emerald-700"
          role="status"
        >
          تم تحديد إحداثيات الموقع.
        </p>
      </section>

      <!-- المرفقات -->
      <section aria-labelledby="attachments-heading">
        <h2
          id="attachments-heading"
          class="mb-5 flex items-center gap-2 text-lg font-bold text-solar-text-heading"
        >
          <Paperclip
            class="size-8 rounded-lg bg-solar-status-info-bg p-1.5"
            aria-hidden="true"
          />

          القسم الرابع: المرفقات
        </h2>

        <p class="mb-3 text-sm text-solar-text-heading">
          ملف توضيحي أو مخطط للمشروع — اختياري
        </p>

        <ServiceAttachments
          :files="attachments"
          :error="errors.attachments"
          :disabled="fieldsDisabled"
          @add="addAttachments"
          @remove="removeAttachment"
        />
      </section>
    </fieldset>

    <!-- نشر الطلب -->
    <div
      v-if="submissionState !== 'success'"
      class="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <p
        class="flex items-start gap-2 text-xs leading-6 text-solar-text-muted"
      >
        <Info
          class="mt-1 size-4 shrink-0 text-amber-700"
          aria-hidden="true"
        />

        <span>
          عند النشر سيُحفظ طلبك ويصبح متاحًا لتلقي
          عروض المهندسين المعتمدين.
        </span>
      </p>

      <button
        type="submit"
        :disabled="fieldsDisabled"
        class="btn-primary h-11 w-full shrink-0 px-6 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[200px]"
      >
        <LoaderCircle
          v-if="submitting"
          class="size-5 animate-spin"
          aria-hidden="true"
        />

        {{ submitting ? 'جارٍ نشر الطلب...' : 'نشر الطلب' }}

        <ArrowLeft
          v-if="!submitting"
          class="size-5"
          aria-hidden="true"
        />
      </button>
    </div>

    <!-- نتيجة الإرسال -->
    <p
      v-if="statusMessage"
      class="mt-5 rounded-xl p-4 text-sm leading-7"
      :class="
        submissionState === 'error'
          ? 'border border-red-200 bg-red-50 text-red-700'
          : 'border border-emerald-200 bg-emerald-50 text-emerald-800'
      "
      :role="
        submissionState === 'error' ? 'alert' : 'status'
      "
      :aria-live="
        submissionState === 'error'
          ? 'assertive'
          : 'polite'
      "
    >
      {{ statusMessage }}
    </p>

    <!-- بدء طلب آخر بعد نجاح النشر -->
    <div
      v-if="submissionState === 'success'"
      class="mt-5 flex justify-end"
    >
      <button
        type="button"
        class="btn-primary"
        @click="startNewRequest"
      >
        طلب خدمة أخرى
        <ArrowLeft class="size-4" aria-hidden="true" />
      </button>
    </div>

    <MapLocationModal
      :is-open="isMapModalOpen"
      :current-location="
        form.locationCoordinates || form.location
      "
      title="تحديد موقع المشروع"
      subtitle="حدد موقع المشروع على الخريطة ثم أكد الاختيار."
      @close="isMapModalOpen = false"
      @select="handleLocationSelected"
    />
  </form>
</template>

<style scoped>
.service-request-form :deep(.solar-input) {
  border-radius: 8px;
  font-size: 13px;
  line-height: 20px;
}

.service-request-form :deep(textarea.solar-input) {
  font-size: 14px;
}

.service-request-form h2 {
  line-height: 32px;
}
</style>