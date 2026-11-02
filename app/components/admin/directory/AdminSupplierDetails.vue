<script setup lang="ts">
import { Store, MapPin, FileText, CheckCircle2, Building, User, Mail, Phone } from 'lucide-vue-next'
import AdminModal from '../common/AdminModal.vue'
import AdminBadge from '../common/AdminBadge.vue'
import AdminDocumentLink from '../workspace/AdminDocumentLink.vue'
import AdminInteractiveMap from '../common/AdminInteractiveMap.vue'
import FormField from '../../common/FormField.vue'
import type { AdminSupplier } from '../../../../types/admin'

const props = defineProps<{ modelValue: boolean; record?: AdminSupplier }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const { reason, error, reset, approve, reject } = useAdminApproval(() => props.record, () => emit('update:modelValue', false))

watch(() => props.modelValue, open => {
  if (open) reset()
})
</script>

<template>
  <AdminModal
    :model-value="modelValue"
    :title="`تفاصيل المورد — ${record?.name ?? ''}`"
    :subtitle="record ? `معرف السجل: #${record.id}` : ''"
    :icon="Store"
    max-width="4xl"
    tinted
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="record" class="admin-detail admin-supplier-detail space-y-5">
      <!-- Top Overview Card -->
      <div class="rounded-xl border border-solar-border-card bg-solar-bg-page p-5">
        <div class="mb-4 flex flex-wrap items-center gap-3 border-b border-solar-border-card pb-4">
          <span class="flex size-14 shrink-0 items-center justify-center rounded-xl bg-solar-navy font-bold text-solar-yellow">
            <Store class="size-7" />
          </span>
          <div class="min-w-0 grow basis-[calc(100%_-_80px)] sm:basis-0">
            <h3 class="!m-0 !text-lg font-bold text-solar-navy">
              {{ record.name }}
            </h3>
            <p class="mt-1 text-xs text-solar-text-muted">
              المسؤول: {{ record.owner || 'غير محدد' }} · تصنيف: {{ record.storeType }}
            </p>
          </div>
          <AdminBadge
            :status="approvalLabels[record.approval]"
            :tone="record.approval === 'approved' ? 'success' : record.approval === 'pending' ? 'warning' : 'danger'"
          />
        </div>

        <div class="grid gap-4 text-xs sm:grid-cols-3">
          <div>
            <p class="mb-1 text-solar-text-muted">البريد الإلكتروني</p>
            <bdi class="font-medium text-solar-navy break-all">{{ record.email || '—' }}</bdi>
          </div>
          <div>
            <p class="mb-1 text-solar-text-muted">رقم الهاتف / واتساب</p>
            <bdi class="font-medium text-solar-navy">{{ record.whatsapp || record.phone || '—' }}</bdi>
          </div>
          <div>
            <p class="mb-1 text-solar-text-muted">المحافظة</p>
            <span class="font-bold text-solar-navy">{{ record.governorate || record.city || 'اليمن' }}</span>
          </div>
        </div>
      </div>

      <!-- Business & Legal Details -->
      <div>
        <h3 class="flex items-center gap-2 text-sm font-bold text-solar-navy mb-3">
          <Building class="size-4 text-solar-yellow" />
          البيانات التجارية والضريبية
        </h3>
        <dl class="grid gap-3 sm:grid-cols-3 text-xs bg-white p-4 rounded-xl border border-solar-border-card">
          <div>
            <dt class="text-solar-text-muted mb-1">رقم السجل التجاري</dt>
            <dd class="font-bold text-solar-navy"><bdi>{{ record.commercialNumber || '—' }}</bdi></dd>
          </div>
          <div>
            <dt class="text-solar-text-muted mb-1">الرقم الضريبي</dt>
            <dd class="font-bold text-solar-navy"><bdi>{{ record.taxNumber || '—' }}</bdi></dd>
          </div>
          <div>
            <dt class="text-solar-text-muted mb-1">العنوان التفصيلي</dt>
            <dd class="font-bold text-solar-navy">{{ record.address || 'المركز الرئيسي' }}</dd>
          </div>
        </dl>
      </div>

      <!-- Description / Bio -->
      <div class="admin-detail-block">
        <p class="mb-1.5 font-bold text-xs text-solar-navy">نبذة عن النشاط والمنتجات:</p>
        <p class="text-xs text-solar-text-muted leading-relaxed">
          {{ record.description || 'لم تُضف نبذة عن النشاط بعد.' }}
        </p>
      </div>

      <!-- Geographic Location Map -->
      <div>
        <h3 class="flex items-center gap-2 text-sm font-bold text-solar-navy mb-3">
          <MapPin class="size-4 text-solar-yellow" />
          الموقع الجغرافي للمتجر على الخريطة
        </h3>
        <AdminInteractiveMap
          :lat="record.coordinates?.lat || record.latitude || 15.3694"
          :lng="record.coordinates?.lng || record.longitude || 44.1910"
          :title="record.name"
          :governorate="record.governorate || record.city || 'صنعاء'"
          :address="record.address"
          height="220px"
        />
      </div>

      <!-- Commercial Document -->
      <div>
        <h3 class="flex items-center gap-2 text-sm font-bold text-solar-navy mb-3">
          <FileText class="size-4 text-solar-navy" />
          مستند السجل التجاري والملفات
        </h3>
        <div v-if="record.document" class="grid gap-3 sm:grid-cols-2">
          <AdminDocumentLink :document="record.document" />
        </div>
        <p v-else class="text-xs text-solar-text-muted bg-slate-50 p-3 rounded-lg border">
          لا يوجد مستند سجل تجاري مرفق حالياً.
        </p>
      </div>

      <!-- Rejection / Audit note for pending records -->
      <div v-if="record.approval === 'pending'" class="rounded-xl border border-red-200 bg-red-50/40 p-4">
        <FormField label="ملاحظات التدقيق / سبب الرفض (في حال عدم استيفاء الشروط)" :error="error">
          <textarea
            v-model="reason"
            rows="3"
            maxlength="1000"
            class="solar-input bg-white"
            placeholder="اكتب ملاحظات التدقيق أو سبب الرفض هنا..."
            :aria-invalid="!!error"
          />
        </FormField>
      </div>
    </div>

    <template #footer>
      <button class="btn-outline me-auto" @click="emit('update:modelValue', false)">
        إغلاق
      </button>
      <template v-if="record?.approval === 'pending'">
        <button class="btn-outline border-red-400 text-red-600 hover:bg-red-50" @click="reject">
          رفض الطلب
        </button>
        <button class="btn-dark" @click="approve">
          قبول واعتماد المورد
        </button>
      </template>
    </template>
  </AdminModal>
</template>
