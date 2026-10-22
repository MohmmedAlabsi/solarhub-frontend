<script setup lang="ts">
import { FileText, UsersRound } from 'lucide-vue-next'
import AdminModal from '../common/AdminModal.vue'
import AdminBadge from '../common/AdminBadge.vue'
import AdminDocumentLink from '../workspace/AdminDocumentLink.vue'
import type { AdminServiceRequest } from '../../../../types/admin'
const props=defineProps<{modelValue:boolean;request?:AdminServiceRequest}>()
const emit=defineEmits<{'update:modelValue':[value:boolean]}>()
const data=useAdminWorkspace()
function engineerName(id:string){return data.value.engineers.find(e=>e.id===id)?.name??`مهندس غير متاح (${id})`}
</script>
<template>
  <AdminModal :model-value="modelValue" :title="'تفاصيل طلب الخدمة #'+(request?.id??'')" :icon="FileText" max-width="4xl" tinted @update:model-value="emit('update:modelValue',$event)">
    <div v-if="request" class="admin-detail">
      <div class="admin-detail-block bg-solar-bg-page"><div class="grid gap-5 border-b border-solar-border-card pb-4 sm:grid-cols-2"><div><p class="text-xs text-solar-text-muted">تفاصيل الموقع / إحداثيات الموقع:</p><p class="mt-2">{{ request.location }}</p><bdi v-if="request.coordinates" class="mt-1 block break-all text-xs font-semibold">{{ request.coordinates }}</bdi></div><div><p class="mb-2 text-xs text-solar-text-muted">الملف المرفق من العميل:</p><div v-if="request.documents.length" class="flex flex-wrap gap-2"><AdminDocumentLink v-for="file in request.documents" :key="file.id" :document="file" /></div><p v-else class="text-xs">لا توجد مرفقات من العميل.</p></div></div><p class="mt-3 text-xs text-solar-text-muted">الوصف والمتطلبات الفنية:</p><p class="mt-1">{{ request.description }}</p></div>
      <h3 class="flex flex-wrap items-center justify-between gap-2"><span class="flex items-center gap-2"><UsersRound class="size-4 text-solar-yellow" />العروض المقدمة لهذا الطلب ({{ request.offers.length }} عروض)</span><span class="text-[11px] font-normal text-solar-text-muted">واجهة تدقيق المشرف — عرض ومراجعة فقط</span></h3>
      <div v-if="request.offers.length" class="admin-managed !gap-0"><div class="admin-table-wrap"><table class="min-w-[730px]"><thead><tr><th>المهندس مقدم العرض</th><th>التكلفة المقترحة</th><th>مدة التنفيذ</th><th>المقترح الفني</th><th>ملف المقترح</th><th>حالة العرض</th></tr></thead><tbody><tr v-for="offer in request.offers" :key="offer.id"><td class="min-w-28 font-bold">{{ engineerName(offer.engineerId) }}</td><td class="whitespace-nowrap font-bold">{{ offer.price.toLocaleString('ar-SA',{numberingSystem:'latn'}) }} ر.س</td><td>{{ offer.duration }} أيام عمل</td><td class="min-w-48">{{ offer.proposal }}</td><td><AdminDocumentLink v-if="offer.document" :document="offer.document" /><span v-else>لا يوجد مرفق</span></td><td><AdminBadge :status="offer.status" :show-dot="false" :tone="offer.status==='قيد الانتظار'?'warning':offer.status==='مقبول'?'success':'danger'" /></td></tr></tbody></table></div></div>
      <p v-else class="rounded-xl border border-dashed border-solar-border-card p-8 text-center text-sm text-solar-text-muted">لم تُقدَّم عروض لهذا الطلب حتى الآن.</p>
    </div>
    <template #footer><button class="btn-dark" @click="emit('update:modelValue',false)">إغلاق النافذة</button></template>
  </AdminModal>
</template>
