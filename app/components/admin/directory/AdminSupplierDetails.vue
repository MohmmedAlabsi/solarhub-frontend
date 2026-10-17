<script setup lang="ts">
import { Store } from 'lucide-vue-next'
import AdminModal from '../common/AdminModal.vue'
import AdminDocumentLink from '../workspace/AdminDocumentLink.vue'
import FormField from '../../common/FormField.vue'
import type { AdminSupplier } from '../../../../types/admin'
const props=defineProps<{modelValue:boolean;record?:AdminSupplier}>()
const emit=defineEmits<{'update:modelValue':[value:boolean]}>()
const {reason,error,reset,approve,reject}=useAdminApproval(()=>props.record,()=>emit('update:modelValue',false))
watch(()=>props.modelValue,open=>{if(open)reset()})
</script>
<template>
  <AdminModal :model-value="modelValue" :title="'تفاصيل واعتماد المورد — '+(record?.name??'')" :subtitle="record?'طلب انضمام رقم: '+record.id:''" :icon="Store" max-width="2xl" tinted @update:model-value="emit('update:modelValue',$event)">
    <div v-if="record" class="admin-detail admin-supplier-detail">
      <dl><div><dt>اسم الشركة</dt><dd class="font-bold">{{ record.name }}</dd></div><div><dt>صاحب الحساب</dt><dd class="font-bold">{{ record.owner }}</dd></div><div><dt>البريد الإلكتروني</dt><dd dir="ltr">{{ record.email }}</dd></div><div><dt>رقم الهاتف / واتساب</dt><dd dir="ltr">{{ record.phone }}</dd></div><div><dt>نوع المتجر</dt><dd>{{ record.storeType }}</dd></div><div><dt>المحافظة والعنوان</dt><dd>{{ record.city }}، {{ record.address }}</dd></div><div><dt>رقم السجل التجاري</dt><dd><bdi>{{ record.commercialNumber }}</bdi></dd><AdminDocumentLink v-if="record.document" :document="record.document" class="mt-2" /><p v-else class="mt-2 text-xs text-solar-text-muted">لا يوجد مستند سجل تجاري مرفق.</p></div><div><dt>الرقم الضريبي</dt><dd><bdi>{{ record.taxNumber }}</bdi></dd></div></dl>
      <h3>نبذة عن النشاط والتوكيلات</h3><p class="admin-detail-block bg-solar-status-info-bg">{{ record.description||'لم تُضف نبذة عن النشاط بعد.' }}</p>
      <FormField label="سبب الرفض (في حال عدم استيفاء الشروط)" :error="error" class="mt-5"><textarea v-model="reason" maxlength="1000" rows="3" class="solar-input bg-solar-bg-page" placeholder="اكتب سبب الرفض هنا؛ يحفظ محليًا ولا يُرسل إلى المورد." :aria-invalid="!!error" /></FormField>
      <p class="mt-3 text-xs text-solar-text-muted">الحالة الحالية: {{ approvalLabels[record.approval] }} · مراجعة تجريبية داخل الجلسة.</p>
    </div>
    <template #footer><button class="btn-outline me-auto" @click="emit('update:modelValue',false)">إغلاق</button><button class="btn-outline border-red-400 text-red-600" @click="reject">رفض الطلب</button><button class="btn-dark" @click="approve">قبول واعتماد المورد</button></template>
  </AdminModal>
</template>
