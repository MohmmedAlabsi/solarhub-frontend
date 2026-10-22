<script setup lang="ts">
import {
  AtSign,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  FileText,
  Info,
  Lock,
  Phone,
  Shield,
  User,
} from 'lucide-vue-next'
import AppToast from '~/components/common/AppToast.vue'
import { governoratesList } from '~~/app/composables/useEngineerProjects'

definePageMeta({ layout: 'engineer' })
useSeoMeta({
  title: 'الملف الشخصي للمهندس | SolarHub - بوابة المهندسين',
  description: 'إدارة بيانات الحساب الشخصية وإعدادات الأمان الخاصة بالمهندس المعتمد.',
})

const toastMessage = ref('')

const form = reactive({
  fullName: 'أحمد بن عبد الله الشمري',
  phone: '+966 54 892 1045',
  email: 'ahmed.shammari@solarhub.sa',
  governorate: 'riyadh',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

function showToast(msg: string) {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 3500)
}

function handleSave() {
  showToast('تم حفظ التعديلات بنجاح!')
}

function handleCancel() {
  showToast('تم إلغاء التعديلات')
}
</script>

<template>
  <div class="flex flex-col gap-8 pb-10">
    <!-- رأس الصفحة -->
    <header class="flex flex-col gap-1 text-right">
      <h1 class="text-2xl font-black text-solar-text-heading md:text-3xl">
        الملف الشخصي للمهندس
      </h1>
      <p class="text-xs sm:text-sm text-solar-text-secondary">
        إدارة بيانات الحساب الشخصية وإعدادات الأمان الخاصة بالمهندس المعتمد
      </p>
    </header>

    <!-- 1. قسم البيانات الشخصية -->
    <section class="rounded-2xl border border-solar-border-card bg-white p-6 shadow-card space-y-6">
      <div class="flex items-center justify-between border-b border-solar-border-card pb-4">
        <div class="text-right">
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-bold text-solar-text-heading">البيانات الشخصية</h2>
            <div class="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <User class="size-4" />
            </div>
          </div>
          <p class="text-xs text-solar-text-muted mt-0.5">
            معلومات الهوية والاتصال المسجلة لدى إدارة المنصة
          </p>
        </div>
      </div>

      <div class="space-y-4 text-right">
        <!-- الاسم الكامل -->
        <div>
          <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
            الاسم الكامل <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              v-model="form.fullName"
              type="text"
              class="w-full rounded-xl border border-solar-border-input bg-solar-bg-subtle/30 px-3.5 py-2.5 pl-10 text-xs font-bold text-solar-text-heading focus:border-solar-yellow focus:outline-none"
            />
            <User class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
          </div>
        </div>

        <!-- الجوال والبريد الإلكتروني جنباً إلى جنب -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- البريد الإلكتروني -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <CheckCircle2 class="size-3" />
                موثق
              </span>
              <label class="text-xs font-bold text-solar-text-heading">
                البريد الإلكتروني <span class="text-red-500">*</span>
              </label>
            </div>
            <div class="relative">
              <input
                v-model="form.email"
                type="email"
                dir="ltr"
                class="w-full rounded-xl border border-solar-border-input bg-solar-bg-subtle/30 px-3.5 py-2.5 pl-10 text-xs font-bold text-solar-text-heading text-right focus:border-solar-yellow focus:outline-none"
              />
              <AtSign class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
            </div>
          </div>

          <!-- رقم الجوال -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <CheckCircle2 class="size-3" />
                موثق
              </span>
              <label class="text-xs font-bold text-solar-text-heading">
                رقم الجوال <span class="text-red-500">*</span>
              </label>
            </div>
            <div class="relative">
              <input
                v-model="form.phone"
                type="text"
                dir="ltr"
                class="w-full rounded-xl border border-solar-border-input bg-solar-bg-subtle/30 px-3.5 py-2.5 pl-10 text-xs font-bold text-solar-text-heading text-right focus:border-solar-yellow focus:outline-none"
              />
              <Phone class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
            </div>
          </div>
        </div>

        <!-- المحافظة / المنطقة -->
        <div>
          <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
            المحافظة / المنطقة <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <select
              v-model="form.governorate"
              class="w-full appearance-none rounded-xl border border-solar-border-input bg-solar-bg-subtle/30 px-3.5 py-2.5 pl-10 text-xs font-bold text-solar-text-heading focus:border-solar-yellow focus:outline-none cursor-pointer"
            >
              <option v-for="gov in governoratesList" :key="gov.id" :value="gov.id">
                {{ gov.name }}
              </option>
            </select>
            <ChevronDown class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted pointer-events-none" />
          </div>
        </div>

        <!-- السيرة الذاتية (CV) -->
        <div class="pt-2">
          <div class="flex items-center justify-between mb-2">
            <span class="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
              <CheckCircle2 class="size-3" />
              معتمدة وموثقة
            </span>
            <label class="text-xs font-bold text-solar-text-heading">
              السيرة الذاتية (CV) <span class="text-red-500">*</span>
            </label>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-solar-border-card bg-solar-bg-subtle/40 p-3.5">
            <div class="flex items-center gap-3">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <FileText class="size-5" />
              </div>
              <div class="text-right">
                <p class="text-xs font-bold text-solar-text-heading">
                  CV_Eng_Ahmed_Alshammari_Solar.pdf
                </p>
                <p class="text-[10px] text-solar-text-muted mt-0.5">
                  2.4 MB بصيغة PDF معتمدة وموثقة
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                class="flex items-center gap-1.5 rounded-lg border border-solar-border-card bg-white px-3 py-1.5 text-xs font-semibold text-solar-text-body hover:border-solar-navy transition-colors"
                @click="showToast('معاينة السيرة الذاتية')"
              >
                <Eye class="size-3.5" />
                <span>معاينة</span>
              </button>
              <button
                type="button"
                class="flex items-center gap-1.5 rounded-lg border border-solar-border-card bg-white px-3 py-1.5 text-xs font-semibold text-solar-text-body hover:border-solar-navy transition-colors"
                @click="showToast('تحميل السيرة الذاتية')"
              >
                <Download class="size-3.5" />
                <span>تحميل</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. قسم أمان الحساب وتغيير كلمة المرور -->
    <section class="rounded-2xl border border-solar-border-card bg-white p-6 shadow-card space-y-6">
      <div class="flex items-center justify-between border-b border-solar-border-card pb-4">
        <div class="text-right">
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-bold text-solar-text-heading">أمان الحساب وتغيير كلمة المرور</h2>
            <div class="flex size-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Shield class="size-4" />
            </div>
          </div>
          <p class="text-xs text-solar-text-muted mt-0.5">
            اترك الحقول فارغة إذا كنت لا ترغب بتغيير كلمة المرور
          </p>
        </div>
      </div>

      <div class="space-y-4 text-right">
        <!-- كلمة المرور الحالية -->
        <div>
          <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
            كلمة المرور الحالية
          </label>
          <div class="relative">
            <input
              v-model="form.currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              placeholder="••••••••••••"
              class="w-full rounded-xl border border-solar-border-input bg-solar-bg-subtle/30 px-3.5 py-2.5 pl-10 text-xs font-bold text-solar-text-heading focus:border-solar-yellow focus:outline-none"
            />
            <button
              type="button"
              class="absolute left-3.5 top-1/2 -translate-y-1/2 text-solar-text-muted hover:text-solar-navy"
              @click="showCurrentPassword = !showCurrentPassword"
            >
              <EyeOff v-if="!showCurrentPassword" class="size-4" />
              <Eye v-else class="size-4" />
            </button>
          </div>
        </div>

        <!-- كلمة المرور الجديدة وتأكيدها -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- تأكيد كلمة المرور الجديدة -->
          <div>
            <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
              تأكيد كلمة المرور الجديدة
            </label>
            <div class="relative">
              <input
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="أعد إدخال كلمة المرور"
                class="w-full rounded-xl border border-solar-border-input bg-solar-bg-subtle/30 px-3.5 py-2.5 pl-10 text-xs text-solar-text-heading focus:border-solar-yellow focus:outline-none"
              />
              <button
                type="button"
                class="absolute left-3.5 top-1/2 -translate-y-1/2 text-solar-text-muted hover:text-solar-navy"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <EyeOff v-if="!showConfirmPassword" class="size-4" />
                <Eye v-else class="size-4" />
              </button>
            </div>
          </div>

          <!-- كلمة المرور الجديدة -->
          <div>
            <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
              كلمة المرور الجديدة
            </label>
            <div class="relative">
              <input
                v-model="form.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                placeholder="أدخل كلمة مرور جديدة قوية"
                class="w-full rounded-xl border border-solar-border-input bg-solar-bg-subtle/30 px-3.5 py-2.5 pl-10 text-xs text-solar-text-heading focus:border-solar-yellow focus:outline-none"
              />
              <button
                type="button"
                class="absolute left-3.5 top-1/2 -translate-y-1/2 text-solar-text-muted hover:text-solar-navy"
                @click="showNewPassword = !showNewPassword"
              >
                <EyeOff v-if="!showNewPassword" class="size-4" />
                <Eye v-else class="size-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- شريط التنبيه الإرشادي لكلمة المرور -->
        <div class="flex items-center gap-2 rounded-xl bg-solar-bg-subtle/70 p-3 text-[11px] text-solar-text-muted">
          <Info class="size-4 text-solar-yellow shrink-0" />
          <span>يجب ألا تقل كلمة المرور عن 8 خانات وتحتوي على أرقام وحروف ورموز خاصة لضمان حماية بيانات الحساب.</span>
        </div>
      </div>
    </section>

    <!-- شريط الأزرار في الأسفل -->
    <div class="flex items-center justify-start gap-3 pt-2">
      <button
        type="button"
        class="btn-primary px-8 text-xs sm:text-sm font-bold"
        @click="handleSave"
      >
        حفظ التعديلات
      </button>
      <button
        type="button"
        class="rounded-lg border border-solar-border-card bg-white px-6 py-2.5 text-xs sm:text-sm font-bold text-solar-text-secondary hover:bg-solar-bg-subtle transition-colors"
        @click="handleCancel"
      >
        إلغاء
      </button>
    </div>

    <!-- Toast للتنبيهات -->
    <AppToast :message="toastMessage" />
  </div>
</template>
