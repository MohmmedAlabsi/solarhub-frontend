<script setup lang="ts">
import { Send } from 'lucide-vue-next'
import AdminModal from '../common/AdminModal.vue'
import FormField from '../../common/FormField.vue'
const props=defineProps<{modelValue:boolean}>(),emit=defineEmits<{'update:modelValue':[value:boolean]}>()
const {draft,errors,sending,reset,submit}=useAdminBroadcastForm(),formId=useId()
watch(()=>props.modelValue,open=>{if(open)reset()})
async function save(){if(await submit())emit('update:modelValue',false)}
</script>
<template>
  <AdminModal :model-value="modelValue" title="إرسال إشعار عام جديد" :icon="Send" max-width="xl" tinted :busy="sending" @update:model-value="emit('update:modelValue',$event)">
    <form :id="formId" novalidate :aria-busy="sending" @submit.prevent="save"><fieldset :disabled="sending" class="flex min-w-0 flex-col gap-5"><FormField label="عنوان الإشعار" required :error="errors.title"><input v-model="draft.title" required maxlength="150" class="solar-input bg-[#f1f2ff]" :aria-invalid="!!errors.title" /></FormField><FormField label="نص الإشعار" required :error="errors.content"><textarea v-model="draft.content" required maxlength="2000" rows="5" class="solar-input bg-[#f1f2ff]" :aria-invalid="!!errors.content" /></FormField><FormField label="المستلمون المستهدفون" required :error="errors.audience"><select v-model="draft.audience" class="solar-input bg-[#f1f2ff]"><option v-for="(label,value) in audienceLabels" :key="value" :value="value">{{ label }}</option></select></FormField><p class="text-xs leading-6 text-solar-text-muted">إرسال تجريبي: يضاف السجل داخل الجلسة فقط، دون إرسال فعلي أو نسبة قراءة افتراضية.</p></fieldset></form>
    <template #footer><button type="button" :disabled="sending" class="btn-outline" @click="emit('update:modelValue',false)">إلغاء</button><button type="submit" :form="formId" :disabled="sending" class="btn-dark"><Send class="size-4 text-solar-yellow" />{{ sending?'جارٍ الحفظ التجريبي...':'إرسال الإشعار' }}</button></template>
  </AdminModal>
</template>
