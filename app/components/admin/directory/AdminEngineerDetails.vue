<script setup lang="ts">
import { BadgeCheck, BriefcaseBusiness, FileText, UserCheck, MapPin } from 'lucide-vue-next'
import AdminModal from '../common/AdminModal.vue'
import AdminBadge from '../common/AdminBadge.vue'
import AdminDocumentLink from '../workspace/AdminDocumentLink.vue'
import AdminInteractiveMap from '../common/AdminInteractiveMap.vue'
import FormField from '../../common/FormField.vue'
import type { AdminEngineer } from '../../../../types/admin'

const props = defineProps<{ modelValue: boolean; record?: AdminEngineer }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const { reason, error, reset, approve, reject } = useAdminApproval(() => props.record, () => emit('update:modelValue', false))

watch(() => props.modelValue, open => {
  if (open) reset()
})
</script>

<template>
  <AdminModal
    :model-value="modelValue"
    title="تفاصيل المهندس"
    :subtitle="record ? `معرف السجل: #${record.id}` : ''"
    :icon="UserCheck"
    max-width="4xl"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="record" class="admin-detail admin-engineer-detail space-y-5">
      <!-- Profile Header Card -->
      <div class="rounded-xl border border-solar-border-card bg-solar-bg-page p-5">
        <div class="mb-4 flex flex-wrap items-center gap-3 border-b border-solar-border-card pb-4">
          <span class="flex size-14 shrink-0 items-center justify-center rounded-full bg-solar-navy font-bold text-solar-yellow">
            {{ adminInitials(record.name) }}
          </span>
          <div class="min-w-0 grow basis-[calc(100%_-_80px)] sm:basis-0">
            <h3 class="!m-0 !text-lg font-bold text-solar-navy">
              {{ record.name }}
              <BadgeCheck v-if="record.approval === 'approved'" class="inline size-4 text-solar-yellow" />
            </h3>
            <p class="mt-1 text-xs text-solar-text-muted">{{ record.title || 'مهندس طاقة شمسية استشاري' }}</p>
          </div>
          <span v-if="record.approval === 'approved' && record.approvedAt" class="rounded-lg border border-solar-border-card bg-white p-2 text-xs text-solar-text-muted sm:ms-auto">
            تاريخ الاعتماد: {{ adminDate(record.approvedAt) }}
          </span>
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
            <bdi class="font-medium text-solar-navy">{{ record.phone || '—' }}</bdi>
          </div>
          <div>
            <p class="mb-1 text-solar-text-muted">المحافظة</p>
            <span class="font-bold text-solar-navy">{{ record.governorate || record.city || 'اليمن' }}</span>
          </div>
        </div>
      </div>

      <!-- Professional Data -->
      <div>
        <h3 class="flex items-center gap-2 text-sm font-bold text-solar-navy mb-3">
          <BriefcaseBusiness class="size-4 text-solar-yellow" />
          البيانات المهنية والترخيص
        </h3>
        <dl class="grid gap-3 sm:grid-cols-3 text-xs bg-white p-4 rounded-xl border border-solar-border-card">
          <div>
            <dt class="text-solar-text-muted mb-1">رقم الترخيص المهني</dt>
            <dd class="font-bold text-solar-navy"><bdi>{{ record.license || '—' }}</bdi></dd>
          </div>
          <div>
            <dt class="text-solar-text-muted mb-1">سنوات الخبرة</dt>
            <dd class="font-bold text-solar-navy">{{ record.experience }} سنوات</dd>
          </div>
          <div>
            <dt class="text-solar-text-muted mb-1">جهة الترخيص والاعتماد</dt>
            <dd class="font-bold text-solar-navy">{{ record.licenseAuthority || 'نقابة المهندسين اليمنيين' }}</dd>
          </div>
        </dl>
      </div>

      <!-- Specialties -->
      <div v-if="record.specialties && record.specialties.length" class="admin-detail-block">
        <p class="mb-2.5 font-bold text-xs text-solar-navy">التخصصات المعتمدة:</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="specialty in record.specialties"
            :key="specialty"
            class="rounded-lg bg-solar-status-info-bg px-3 py-1 text-xs font-medium text-solar-navy"
          >
            {{ specialty }}
          </span>
        </div>
      </div>

      <!-- Bio -->
      <div class="admin-detail-block">
        <p class="mb-1.5 font-bold text-xs text-solar-navy">النبذة المهنية:</p>
        <p class="text-xs text-solar-text-muted leading-relaxed">
          {{ record.bio || 'لم تُضف نبذة مهنية بعد.' }}
        </p>
      </div>

      <!-- Geographic Location Map -->
      <div>
        <h3 class="flex items-center gap-2 text-sm font-bold text-solar-navy mb-3">
          <MapPin class="size-4 text-solar-yellow" />
          الموقع الجغرافي للمهندس
        </h3>
        <AdminInteractiveMap
          :lat="record.coordinates?.lat || record.latitude || 15.3694"
          :lng="record.coordinates?.lng || record.longitude || 44.1910"
          :title="record.name"
          :governorate="record.governorate || record.city || 'صنعاء'"
          height="220px"
        />
      </div>

      <!-- Documents & CV -->
      <div>
        <h3 class="flex items-center gap-2 text-sm font-bold text-solar-navy mb-3">
          <FileText class="size-4 text-red-500" />
          الملف المهني ورخصة المزاولة
        </h3>
        <div v-if="record.documents && record.documents.length" class="grid gap-3 sm:grid-cols-2">
          <AdminDocumentLink
            v-for="doc in record.documents"
            :key="doc.id"
            :document="doc"
          />
        </div>
        <p v-else class="text-xs text-solar-text-muted bg-slate-50 p-3 rounded-lg border">
          لا توجد مستندات مرفوعة حالياً.
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
          قبول واعتماد المهندس
        </button>
      </template>
    </template>
  </AdminModal>
</template>
