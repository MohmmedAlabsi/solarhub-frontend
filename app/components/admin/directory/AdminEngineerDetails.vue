<script setup lang="ts">
import { BadgeCheck, BriefcaseBusiness, FileText, UserCheck } from 'lucide-vue-next'
import AdminModal from '../common/AdminModal.vue'
import AdminBadge from '../common/AdminBadge.vue'
import AdminDocumentLink from '../workspace/AdminDocumentLink.vue'
import FormField from '../../common/FormField.vue'
import type { AdminEngineer } from '../../../../types/admin'
const props=defineProps<{modelValue:boolean;record?:AdminEngineer}>()
const emit=defineEmits<{'update:modelValue':[value:boolean]}>()
const {reason,error,reset,approve,reject}=useAdminApproval(()=>props.record,()=>emit('update:modelValue',false))
watch(()=>props.modelValue,open=>{if(open)reset()})
</script>
<template>
  <AdminModal :model-value="modelValue" title="تفاصيل المهندس" :subtitle="record?.id" :icon="UserCheck" max-width="4xl" @update:model-value="emit('update:modelValue',$event)">
    <div v-if="record" class="admin-detail admin-engineer-detail">
      <div class="rounded-xl border border-solar-border-card bg-solar-bg-page p-5">
        <div class="mb-4 flex flex-wrap items-center gap-3 border-b border-solar-border-card pb-4"><span class="flex size-14 shrink-0 items-center justify-center rounded-full bg-solar-navy font-bold text-solar-yellow">{{ adminInitials(record.name) }}</span><div class="min-w-0 grow basis-[calc(100%_-_80px)] sm:basis-0"><h3 class="!m-0 !text-lg">{{ record.name }} <BadgeCheck v-if="record.approval==='approved'" class="inline size-4 text-solar-yellow" /></h3><p class="mt-2 text-xs text-solar-text-muted">{{ record.title }}</p></div><span v-if="record.approval==='approved'&&record.approvedAt" class="rounded-lg border bg-white p-2 text-xs sm:ms-auto">تاريخ الاعتماد: {{ adminDate(record.approvedAt) }}</span><AdminBadge :status="approvalLabels[record.approval]" :tone="record.approval==='approved'?'success':record.approval==='pending'?'warning':'danger'" /></div>
        <div class="grid gap-4 text-xs sm:grid-cols-3"><div><p class="mb-2 text-solar-text-muted">البريد الإلكتروني</p><bdi class="break-all">{{ record.email }}</bdi></div><div><p class="mb-2 text-solar-text-muted">رقم الجوال / واتساب</p><bdi>{{ record.phone }}</bdi></div><div><p class="mb-2 text-solar-text-muted">المدينة والمحافظة</p>{{ record.city }}، المملكة العربية السعودية</div></div>
      </div>
      <h3 class="flex items-center gap-2"><BriefcaseBusiness class="size-4" />البيانات المهنية والتخصصات المعتمدة</h3>
      <dl class="sm:!grid-cols-3"><div><dt>رقم الترخيص المهني</dt><dd class="font-bold"><bdi>{{ record.license }}</bdi></dd></div><div><dt>سنوات الخبرة</dt><dd class="font-bold">{{ record.experience }} سنوات</dd></div><div><dt>جهة الترخيص</dt><dd class="font-bold">{{ record.licenseAuthority }}</dd></div></dl>
      <div class="admin-detail-block mt-4"><p class="mb-3 font-bold">التخصصات المعتمدة:</p><div class="flex flex-wrap gap-2"><span v-for="specialty in record.specialties" :key="specialty" class="rounded-lg bg-solar-bg-subtle px-3 py-1 text-xs">{{ specialty }}</span></div></div>
      <div class="admin-detail-block mt-4"><p class="mb-2 font-bold">النبذة المهنية:</p>{{ record.bio||'لم تُضف نبذة مهنية بعد.' }}</div>
      <h3 class="flex items-center gap-2"><FileText class="size-4 text-red-500" />ملفات الشهادات والاعتمادات المرفقة</h3><div v-if="record.documents.length" class="grid gap-3 sm:grid-cols-2"><AdminDocumentLink v-for="doc in record.documents" :key="doc.id" :document="doc" /></div><p v-else class="text-sm text-solar-text-muted">لا توجد شهادات أو مرفقات.</p>
      <div class="mt-5 rounded-xl border border-red-200 bg-red-50/30 p-4"><FormField label="ملاحظات التدقيق / سبب الرفض (في حال إعادة الطلب أو الرفض)" :error="error"><textarea v-model="reason" rows="3" maxlength="1000" class="solar-input" placeholder="اكتب ملاحظات التدقيق؛ تحفظ محليًا ولا تُرسل تلقائيًا." :aria-invalid="!!error" /></FormField></div>
    </div>
    <template #footer><button class="btn-outline me-auto" @click="emit('update:modelValue',false)">إغلاق</button><button class="btn-outline border-red-400 text-red-600" @click="reject">رفض الطلب</button><button class="btn-dark" @click="approve">قبول واعتماد المهندس</button></template>
  </AdminModal>
</template>
