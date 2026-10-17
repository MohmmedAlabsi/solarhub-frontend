<script setup lang="ts">
import { UserPlus } from 'lucide-vue-next'
import FormField from '../../common/FormField.vue'
import AdminModal from '../common/AdminModal.vue'
import type { AdminDirectoryKind } from '../../../../types/admin'
const props=defineProps<{modelValue:boolean;kind:AdminDirectoryKind}>()
const emit=defineEmits<{'update:modelValue':[value:boolean]}>()
const {draft,errors,reset,submit}=useAdminDirectoryForm(()=>props.kind)
const title=computed(()=>props.kind==='user'?'إضافة مستخدم':props.kind==='supplier'?'إضافة مورد جديد':'إضافة مهندس جديد')
const formId=useId()
watch(()=>props.modelValue,open=>{if(open)reset()})
function save(){if(submit())emit('update:modelValue',false)}
</script>
<template>
  <AdminModal :model-value="modelValue" :title="title" :icon="UserPlus" max-width="3xl" @update:model-value="emit('update:modelValue',$event)">
    <form :id="formId" novalidate class="grid gap-5 sm:grid-cols-2" @submit.prevent="save">
      <FormField :label="kind==='supplier'?'اسم الشركة':'الاسم الكامل'" required :error="errors.name"><input v-model="draft.name" required maxlength="120" class="solar-input" :aria-invalid="!!errors.name" /></FormField>
      <FormField label="البريد الإلكتروني" required :error="errors.email"><input v-model="draft.email" required type="email" dir="ltr" maxlength="150" class="solar-input" :aria-invalid="!!errors.email" /></FormField>
      <FormField label="رقم الهاتف" required :error="errors.phone"><input v-model="draft.phone" required type="tel" dir="ltr" maxlength="20" class="solar-input" :aria-invalid="!!errors.phone" /></FormField>
      <FormField label="المحافظة / المنطقة" required :error="errors.city"><input v-model="draft.city" required maxlength="80" class="solar-input" :aria-invalid="!!errors.city" /></FormField>
      <FormField v-if="kind==='user'" label="نوع الحساب"><select v-model="draft.role" class="solar-input"><option>عميل سكني</option><option>عميل تجاري</option><option>مهندس طاقة شمسية</option><option>مورد معتمد</option></select></FormField>
      <template v-if="kind==='supplier'">
        <FormField label="صاحب الحساب" required :error="errors.owner"><input v-model="draft.owner" required maxlength="120" class="solar-input" /></FormField>
        <FormField label="نوع المتجر"><select v-model="draft.storeType" class="solar-input"><option>وكيل معتمد</option><option>متجر متخصص</option><option>موزع رئيسي</option><option>موزع معتمد</option></select></FormField>
        <FormField label="رقم السجل التجاري" required :error="errors.commercialNumber"><input v-model="draft.commercialNumber" required inputmode="numeric" maxlength="10" dir="ltr" class="solar-input" /></FormField>
        <FormField label="الرقم الضريبي" required :error="errors.taxNumber"><input v-model="draft.taxNumber" required inputmode="numeric" maxlength="15" dir="ltr" class="solar-input" /></FormField>
        <FormField label="العنوان" required :error="errors.address" class="sm:col-span-2"><input v-model="draft.address" required maxlength="250" class="solar-input" /></FormField>
      </template>
      <template v-if="kind==='engineer'">
        <FormField label="الوصف المهني" required :error="errors.title"><input v-model="draft.title" required maxlength="180" class="solar-input" /></FormField>
        <FormField label="رقم الترخيص المهني" required :error="errors.license"><input v-model="draft.license" required dir="ltr" placeholder="SCE-489201" maxlength="20" class="solar-input" /></FormField>
        <FormField label="سنوات الخبرة" required :error="errors.experience"><input v-model.number="draft.experience" type="number" min="0" max="60" step="1" class="solar-input" /></FormField>
        <FormField label="التخصصات (تفصل بفاصلة)" required :error="errors.specialties"><input v-model="draft.specialties" required maxlength="300" class="solar-input" /></FormField>
      </template>
      <p class="text-xs leading-6 text-solar-text-muted sm:col-span-2">إضافة تجريبية داخل الجلسة فقط. لا يُنشأ حساب فعلي أو تُرسل بيانات دخول.</p>
    </form>
    <template #footer><button type="button" class="btn-outline" @click="emit('update:modelValue',false)">إلغاء</button><button type="submit" :form="formId" class="btn-dark">إضافة {{ kind==='user'?'المستخدم':kind==='supplier'?'المورد':'المهندس' }}</button></template>
  </AdminModal>
</template>
