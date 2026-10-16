<script setup lang="ts">
import { ArrowLeft, ChevronDown, FileText, MapPin, Paperclip, ShieldCheck, SlidersHorizontal } from 'lucide-vue-next'
import FormField from '../../common/FormField.vue'
import ServiceAttachments from './ServiceAttachments.vue'
import { serviceOptions, serviceRegions } from '../../../composables/useServiceRequest'

const { form, errors, attachments, submitting, submissionState, statusMessage, addAttachments, removeAttachment, submit } = useServiceRequest()
const controlClass = 'solar-input min-h-11 min-w-0 disabled:opacity-60'
</script>

<template>
  <form novalidate class="service-request-form rounded-xl border border-[#f0f0f5] bg-white px-5 pb-10 pt-8 sm:px-10 sm:pt-16" :aria-busy="submitting" @submit.prevent="submit">
    <fieldset :disabled="submitting" class="min-w-0 space-y-12 sm:space-y-[52px]" aria-label="بيانات طلب خدمة هندسية جديدة">
      <section aria-labelledby="service-data-heading">
        <h2 id="service-data-heading" class="mb-5 flex items-center gap-2 text-lg font-bold text-solar-text-heading"><SlidersHorizontal class="size-8 rounded-lg bg-solar-status-info-bg p-1.5" aria-hidden="true" />القسم الأول: بيانات الخدمة</h2>
        <div class="grid gap-6 md:grid-cols-3">
          <div>
            <FormField label="نوع الخدمة الهندسية" required :error="errors.serviceType"><span class="relative block"><select v-model="form.serviceType" :class="controlClass" class="appearance-none pl-9" required :aria-invalid="!!errors.serviceType"><option value="" disabled>اختر نوع الخدمة الهندسية</option><option v-for="option in serviceOptions" :key="option.value" :value="option.value">{{ option.label }}</option></select><ChevronDown class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted" aria-hidden="true" /></span></FormField>
            <p class="mt-2 max-w-[240px] text-xs leading-[14px] text-solar-text-muted">اختر طبيعة الاستشارة أو الخدمة الفنية المطلوبة لمشروعك.</p>
          </div>
          <div>
            <FormField label="المحافظة / المنطقة" required :error="errors.region"><span class="relative block"><select v-model="form.region" :class="controlClass" class="appearance-none pl-9" required :aria-invalid="!!errors.region"><option value="" disabled>اختر المحافظة</option><option v-for="region in serviceRegions" :key="region">{{ region }}</option></select><ChevronDown class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted" aria-hidden="true" /></span></FormField>
            <p class="mt-2 max-w-[240px] text-xs leading-[14px] text-solar-text-muted">المحافظة أو المنطقة الجغرافية التي يقع بها موقع المشروع.</p>
          </div>
          <div>
            <FormField label="السعة التقديرية للنظام" :error="errors.capacity"><input v-model="form.capacity" :class="controlClass" maxlength="100" placeholder="مثال: 15 كيلوواط (kW) أو سعة مضخة 10 حصان" :aria-invalid="!!errors.capacity" /></FormField>
            <p class="mt-2 max-w-[240px] text-xs leading-[14px] text-solar-text-muted">القدرة الكهربائية المقدرة بالكيلوواط أو حجم النظام التقريبي المراد دراسته أو تركيبه.</p>
          </div>
        </div>
      </section>
      <section aria-labelledby="description-heading">
        <h2 id="description-heading" class="mb-5 flex items-center gap-2 text-lg font-bold text-solar-text-heading"><FileText class="size-8 rounded-lg bg-solar-status-info-bg p-1.5" aria-hidden="true" />القسم الثاني: وصف المشروع</h2>
        <FormField label="وصف تفصيلي لاحتياج العميل" required :error="errors.description"><textarea v-model="form.description" :class="controlClass" class="h-[126px] min-h-[126px] resize-y" required minlength="20" maxlength="3000" :aria-invalid="!!errors.description" placeholder="وضح الغرض من النظام (سكني، تجاري، زراعي)، نوع المنظومة المطلوبة (متصلة بالشبكة، هجينة مع بطاريات، أو ضخ مياه)، وأي متطلبات خاصة ترغب في مراعاتها..." /></FormField>
        <p class="mt-3 text-xs leading-4 text-solar-text-muted">اكتب شرحًا وافيًا للأحمال واحتياجات الطاقة لمساعدة المهندس على تقديم عرض دقيق.</p>
      </section>
      <section aria-labelledby="location-heading">
        <h2 id="location-heading" class="mb-5 flex items-center gap-2 text-lg font-bold text-solar-text-heading"><MapPin class="size-8 rounded-lg bg-solar-status-info-bg p-1.5" aria-hidden="true" />القسم الثالث: معلومات الموقع</h2>
        <FormField label="معلومات الموقع والمكان" required :error="errors.location"><textarea v-model="form.location" :class="controlClass" class="h-[102px] min-h-[102px] resize-y" required minlength="10" maxlength="1500" :aria-invalid="!!errors.location" placeholder="مثال: مبنى سكني مكون من دورين وسطح خرساني معزول، أو مزرعة بأرض مستوية، والمدينة والحي بالتحديد..." /></FormField>
        <p class="mt-3 text-xs leading-[18px] text-solar-text-muted">طبيعة المبنى أو الأرض، نوع السطح (خرساني، قرميد، شنكو، أرضي)، وسهولة الوصول للموقع.</p>
      </section>
      <section aria-labelledby="attachments-heading">
        <h2 id="attachments-heading" class="mb-5 flex items-center gap-2 text-lg font-bold text-solar-text-heading"><Paperclip class="size-8 rounded-lg bg-solar-status-info-bg p-1.5" aria-hidden="true" />القسم الرابع: المرفقات</h2>
        <p class="mb-2 text-sm text-solar-text-heading">ملفات توضيحية ومخططات (اختياري)</p>
        <ServiceAttachments :files="attachments" :error="errors.attachments" :disabled="submitting" @add="addAttachments" @remove="removeAttachment" />
      </section>
    </fieldset>
    <div class="mt-[58px] flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <p class="flex items-center gap-2 text-xs leading-5 text-solar-text-muted"><ShieldCheck class="size-4 shrink-0 text-[#856300]" aria-hidden="true" /><span>يتم فحص الطلب فورًا ومشاركته فقط مع نخبة المهندسين المعتمدين والمصنفين.<span class="block text-[11px] text-solar-text-muted">تجريبي داخل الجلسة؛ لن يُنشر طلب أو تُرفع ملفات.</span></span></p>
      <button type="submit" :disabled="submitting || submissionState === 'success'" class="btn-primary h-11 w-full shrink-0 bg-[#ffc019] px-6 text-base font-bold text-[#17232e] shadow-none disabled:cursor-wait sm:w-[200px]">{{ submitting ? 'جارٍ الإرسال التجريبي...' : 'نشر الطلب' }}<ArrowLeft class="size-5" aria-hidden="true" /></button>
    </div>
    <p v-if="statusMessage" class="mt-4 rounded-lg p-4 text-sm leading-7" :class="submissionState === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'" role="status" aria-live="polite">{{ statusMessage }}</p>
  </form>
</template>

<style scoped>
.service-request-form :deep(.solar-input) { border-color: #c8d3e6; border-radius: 8px; font-size: 13px; font-weight: 400; line-height: 20px; }
.service-request-form :deep(.solar-input::placeholder) { color: #c5c8d3; opacity: 1; }
.service-request-form :deep(label) { color: #13253f; font-weight: 400; line-height: 20px; }
.service-request-form :deep(textarea.solar-input) { font-size: 14px; }
.service-request-form h2 { line-height: 32px; }
</style>
