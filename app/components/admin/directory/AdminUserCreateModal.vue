<script setup lang="ts">
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User as UserIcon,
  Loader2,
} from 'lucide-vue-next'
import FormField from '../../common/FormField.vue'
import AdminModal from '../common/AdminModal.vue'
import type { AdminUserStatus } from '../../../../types/admin'
import type { Governorate } from '../../../../types/api'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'created': []
}>()

const { createUser, isActionLoading } = useAdminUsers()
const { fetchCities } = useAdminMasterData()

const formId = useId()
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// قائمة المحافظات
const governorates = ref<Governorate[]>([])
const isLoadingGovernorates = ref(false)

// الحقول المتناسقة بدقة مع جدول users في قاعدة البيانات
const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
  governorate_id: '' as string | number,
  status: 'active' as AdminUserStatus,
})

// أخطاء التحقق
const errors = reactive<Record<string, string>>({})
const generalError = ref<string | null>(null)

// تفريغ الأخطاء والبيانات
function resetForm() {
  form.name = ''
  form.email = ''
  form.phone = ''
  form.password = ''
  form.password_confirmation = ''
  form.governorate_id = ''
  form.status = 'active'
  showPassword.value = false
  showConfirmPassword.value = false
  generalError.value = null
  Object.keys(errors).forEach(key => delete errors[key])
}

// تحميل المحافظات عند فتح المودل
watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      resetForm()
      if (governorates.value.length === 0) {
        isLoadingGovernorates.value = true
        try {
          governorates.value = await fetchCities()
        } catch {
          // Fallback في حال تعذر جلب المحافظات
        } finally {
          isLoadingGovernorates.value = false
        }
      }
    }
  }
)

// التحقق من صحة المدخلات في الفرونت إند
function validate(): boolean {
  Object.keys(errors).forEach(key => delete errors[key])
  generalError.value = null

  if (!form.name.trim()) {
    errors.name = 'الاسم الكامل مطلوب.'
  } else if (form.name.trim().length > 150) {
    errors.name = 'يجب ألا يتجاوز الاسم 150 حرفاً.'
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.email.trim()) {
    errors.email = 'البريد الإلكتروني مطلوب.'
  } else if (!emailRegex.test(form.email.trim())) {
    errors.email = 'يرجى إدخال بريد إلكتروني صحيح.'
  }

  if (!form.phone.trim()) {
    errors.phone = 'رقم الهاتف مطلوب.'
  } else if (!/^\+?[0-9]{7,20}$/.test(form.phone.trim().replace(/[\s-]/g, ''))) {
    errors.phone = 'أدخل رقم هاتف صحيح (مثال: 777000000 أو +967777000000).'
  }

  if (!form.password) {
    errors.password = 'كلمة المرور مطلوبة.'
  } else if (form.password.length < 8) {
    errors.password = 'يجب ألا تقل كلمة المرور عن 8 أحرف.'
  }

  if (!form.password_confirmation) {
    errors.password_confirmation = 'تأكيد كلمة المرور مطلوب.'
  } else if (form.password !== form.password_confirmation) {
    errors.password_confirmation = 'كلمة المرور وتأكيدها غير متطابقين.'
  }

  return Object.keys(errors).length === 0
}

// حفظ المستخدم الجديد كـ مسؤول نظام (Admin)
async function handleSubmit() {
  if (!validate()) return

  const payload = {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    password: form.password,
    password_confirmation: form.password_confirmation,
    governorate_id: form.governorate_id ? Number(form.governorate_id) : null,
    status: form.status,
  }

  const res = await createUser(payload)

  if (res.success) {
    emit('created')
    emit('update:modelValue', false)
  } else {
    if (res.errors) {
      Object.entries(res.errors).forEach(([field, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          errors[field] = messages[0]
        }
      })
    }
    if (res.error) {
      generalError.value = res.error
    }
  }
}
</script>

<template>
  <AdminModal
    :model-value="modelValue"
    title="إضافة مستخدم جديد"
    subtitle="إنشاء حساب إداري جديد بصلاحيات إدارة النظام الكاملة وربطه بقاعدة البيانات."
    :icon="ShieldCheck"
    max-width="3xl"
    :busy="isActionLoading"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- تنبيه دور الآدمن الثابت والمحدد -->
    <div class="mb-5 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 sm:p-4 text-xs sm:text-sm text-amber-900 flex items-start gap-3">
      <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 mt-0.5">
        <ShieldCheck class="size-4" />
      </div>
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="font-bold">دور الحساب: مسؤول نظام (Admin)</span>
          <span class="inline-flex items-center rounded-md bg-amber-200/80 px-2 py-0.5 text-[11px] font-bold text-amber-900">
            صلاحيات كاملة
          </span>
        </div>
        <p class="text-xs text-amber-800/90 leading-5">
          كافة المستخدمين المضافين من هذه النافذة يتم منحهم تلقائياً دور الآدمن <strong>(Admin)</strong> مع صلاحيات إدارة النظام، والتحكم بالحسابات والطلبات والإعدادات.
        </p>
      </div>
    </div>

    <!-- رسالة خطأ عامة إن وجدت -->
    <div
      v-if="generalError"
      class="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs sm:text-sm text-red-700"
    >
      <AlertCircle class="size-4 shrink-0" />
      <span>{{ generalError }}</span>
    </div>

    <form :id="formId" novalidate class="grid gap-4 sm:grid-cols-2" @submit.prevent="handleSubmit">
      <!-- 1. الاسم الكامل (name) -->
      <FormField label="الاسم الكامل" required :error="errors.name">
        <div class="relative">
          <input
            v-model="form.name"
            required
            maxlength="150"
            placeholder="مثال: المهندس محمد العبسي"
            class="solar-input pr-10"
            :aria-invalid="!!errors.name"
          />
          <UserIcon class="pointer-events-none absolute right-3 top-2.5 size-4 text-solar-text-muted" />
        </div>
      </FormField>

      <!-- 2. البريد الإلكتروني (email) -->
      <FormField label="البريد الإلكتروني" required :error="errors.email">
        <div class="relative">
          <input
            v-model="form.email"
            required
            type="email"
            dir="ltr"
            maxlength="150"
            placeholder="admin@solarhub.com"
            class="solar-input pr-10"
            :aria-invalid="!!errors.email"
          />
          <Mail class="pointer-events-none absolute right-3 top-2.5 size-4 text-solar-text-muted" />
        </div>
      </FormField>

      <!-- 3. رقم الهاتف (phone) -->
      <FormField label="رقم الهاتف" required :error="errors.phone">
        <div class="relative">
          <input
            v-model="form.phone"
            required
            type="tel"
            dir="ltr"
            maxlength="30"
            placeholder="777000000 أو +967..."
            class="solar-input pr-10"
            :aria-invalid="!!errors.phone"
          />
          <Phone class="pointer-events-none absolute right-3 top-2.5 size-4 text-solar-text-muted" />
        </div>
      </FormField>

      <!-- 4. المحافظة / المنطقة (governorate_id) -->
      <FormField label="المحافظة" :error="errors.governorate_id">
        <div class="relative">
          <select
            v-model="form.governorate_id"
            class="solar-input pr-10"
            :disabled="isLoadingGovernorates"
          >
            <option value="">اختر المحافظة (اختياري)...</option>
            <option
              v-for="gov in governorates"
              :key="gov.id"
              :value="gov.id"
            >
              {{ gov.name_ar || gov.name_en }}
            </option>
          </select>
          <MapPin class="pointer-events-none absolute right-3 top-2.5 size-4 text-solar-text-muted" />
        </div>
      </FormField>

      <!-- 5. كلمة المرور (password) -->
      <FormField label="كلمة المرور" required :error="errors.password">
        <div class="relative">
          <input
            v-model="form.password"
            required
            :type="showPassword ? 'text' : 'password'"
            dir="ltr"
            minlength="8"
            placeholder="لا تقل عن 8 أحرف"
            class="solar-input pl-10 pr-10"
            :aria-invalid="!!errors.password"
          />
          <Lock class="pointer-events-none absolute right-3 top-2.5 size-4 text-solar-text-muted" />
          <button
            type="button"
            class="absolute left-3 top-2.5 text-solar-text-muted hover:text-solar-text-heading focus:outline-none"
            :aria-label="showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'"
            @click="showPassword = !showPassword"
          >
            <EyeOff v-if="showPassword" class="size-4" />
            <Eye v-else class="size-4" />
          </button>
        </div>
      </FormField>

      <!-- 6. تأكيد كلمة المرور (password_confirmation) -->
      <FormField label="تأكيد كلمة المرور" required :error="errors.password_confirmation">
        <div class="relative">
          <input
            v-model="form.password_confirmation"
            required
            :type="showConfirmPassword ? 'text' : 'password'"
            dir="ltr"
            minlength="8"
            placeholder="أعد إدخال كلمة المرور"
            class="solar-input pl-10 pr-10"
            :aria-invalid="!!errors.password_confirmation"
          />
          <Lock class="pointer-events-none absolute right-3 top-2.5 size-4 text-solar-text-muted" />
          <button
            type="button"
            class="absolute left-3 top-2.5 text-solar-text-muted hover:text-solar-text-heading focus:outline-none"
            :aria-label="showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <EyeOff v-if="showConfirmPassword" class="size-4" />
            <Eye v-else class="size-4" />
          </button>
        </div>
      </FormField>

      <!-- 7. حالة الحساب (status) -->
      <FormField label="حالة الحساب" class="sm:col-span-2">
        <div class="grid grid-cols-3 gap-2">
          <label
            class="flex items-center justify-center gap-2 p-2.5 rounded-lg border cursor-pointer text-xs font-semibold transition-all"
            :class="
              form.status === 'active'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500'
                : 'border-solar-border-card bg-solar-bg-card text-solar-text-muted hover:bg-solar-bg-subtle'
            "
          >
            <input
              v-model="form.status"
              type="radio"
              value="active"
              class="sr-only"
            />
            <span class="size-2 rounded-full bg-emerald-500" />
            نشط (مفعل)
          </label>

          <label
            class="flex items-center justify-center gap-2 p-2.5 rounded-lg border cursor-pointer text-xs font-semibold transition-all"
            :class="
              form.status === 'inactive'
                ? 'border-slate-500 bg-slate-100 text-slate-800 ring-1 ring-slate-500'
                : 'border-solar-border-card bg-solar-bg-card text-solar-text-muted hover:bg-solar-bg-subtle'
            "
          >
            <input
              v-model="form.status"
              type="radio"
              value="inactive"
              class="sr-only"
            />
            <span class="size-2 rounded-full bg-slate-400" />
            غير نشط
          </label>

          <label
            class="flex items-center justify-center gap-2 p-2.5 rounded-lg border cursor-pointer text-xs font-semibold transition-all"
            :class="
              form.status === 'suspended'
                ? 'border-amber-500 bg-amber-50 text-amber-800 ring-1 ring-amber-500'
                : 'border-solar-border-card bg-solar-bg-card text-solar-text-muted hover:bg-solar-bg-subtle'
            "
          >
            <input
              v-model="form.status"
              type="radio"
              value="suspended"
              class="sr-only"
            />
            <span class="size-2 rounded-full bg-amber-500" />
            معلق / محظور
          </label>
        </div>
      </FormField>
    </form>

    <template #footer>
      <button
        type="button"
        class="btn-outline"
        :disabled="isActionLoading"
        @click="emit('update:modelValue', false)"
      >
        إلغاء
      </button>
      <button
        type="submit"
        :form="formId"
        class="btn-dark flex items-center gap-2"
        :disabled="isActionLoading"
      >
        <Loader2 v-if="isActionLoading" class="size-4 animate-spin" />
        <ShieldCheck v-else class="size-4" />
        <span>{{ isActionLoading ? 'جاري إنشاء الحساب...' : 'إضافة المسؤول' }}</span>
      </button>
    </template>
  </AdminModal>
</template>
