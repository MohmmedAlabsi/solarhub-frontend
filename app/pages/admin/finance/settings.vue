<script setup lang="ts">
import {
  Calendar,
  Check,
  Coins,
  DollarSign,
  Download,
  Lock,
  Percent,
  Save,
  ShieldAlert,
} from 'lucide-vue-next'
import FinanceTabs from '../../../components/admin/finance/FinanceTabs.vue'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'الإدارة المالية — الإعدادات المالية | لوحة الإدارة العامة' })

const form = ref({
  currency: 'ريال سعودي (SAR)',
  commissionRate: 2.5,
  minimumPayout: 500,
  payoutSchedule: 'weekly_thursday',
  escrowDays: 7,
})

const isSaving = ref(false)
const noticeMessage = ref('')

function saveSettings() {
  isSaving.value = true
  setTimeout(() => {
    isSaving.value = false
    noticeMessage.value = 'تم حفظ الإعدادات المالية ونسب العمولات بنجاح.'
    setTimeout(() => {
      noticeMessage.value = ''
    }, 3000)
  }, 600)
}

function resetForm() {
  form.value = {
    currency: 'ريال سعودي (SAR)',
    commissionRate: 2.5,
    minimumPayout: 500,
    payoutSchedule: 'weekly_thursday',
    escrowDays: 7,
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="solar-card p-5 sm:p-7">
      <!-- رأس الإدارة المالية -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-solar-border-card/60 pb-6">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-solar-text-heading">الإدارة المالية</h1>
          <p class="mt-1 text-xs sm:text-sm text-solar-text-muted">
            متابعة وإدارة مدفوعات العملاء، مستحقات الموردين، وإعدادات الضرائب والعمليات المالية.
          </p>
        </div>

        <button
          type="button"
          class="btn-outline h-11 px-4 text-xs font-bold gap-2 self-start sm:self-auto"
        >
          <Download class="size-4" />
          <span>تصدير كشف حساب</span>
        </button>
      </div>

      <!-- تبويبات الإدارة المالية -->
      <div class="mt-6">
        <FinanceTabs />
      </div>

      <!-- بطاقة إعدادات المنظومة المالية والعمولات -->
      <div class="mt-8 max-w-4xl mx-auto rounded-2xl border border-solar-border-card bg-white p-6 sm:p-8 shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-solar-border-card/60 pb-5">
          <div>
            <h2 class="text-lg sm:text-xl font-black text-solar-text-heading">إعدادات المنظومة المالية والعمولات</h2>
            <p class="mt-1 text-xs sm:text-sm text-solar-text-muted">
              تحديد العملة الافتراضية ونسب العمولة المقتطعة من مبيعات المتاجر والموردين.
            </p>
          </div>

          <span class="inline-flex items-center gap-1.5 rounded-full border border-solar-navy/20 bg-solar-navy/5 px-3 py-1 text-xs font-bold text-solar-navy-dark shrink-0">
            <ShieldAlert class="size-3.5 text-solar-navy" />
            صلاحية المشرف العام
          </span>
        </div>

        <form @submit.prevent="saveSettings" class="mt-6 flex flex-col gap-6">
          <!-- العملة الافتراضية للمنصة -->
          <div>
            <label class="block text-xs font-bold text-solar-text-body mb-2">
              العملة الافتراضية للمنصة
            </label>
            <div class="relative flex items-center">
              <input
                v-model="form.currency"
                type="text"
                disabled
                class="solar-input h-12 text-xs font-bold bg-solar-bg-subtle/80 cursor-not-allowed pl-32 text-right"
              />
              <span class="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-lg bg-white border border-solar-border-card px-2.5 py-1 text-[11px] font-bold text-slate-500 shadow-2xs">
                <Lock class="size-3 text-slate-400" />
                غير قابل للتعديل
              </span>
            </div>
            <p class="mt-1.5 text-[11px] text-solar-text-muted">
              العملة الموحدة لجميع الفواتير والتحويلات داخل المملكة العربية السعودية.
            </p>
          </div>

          <div class="grid gap-6 sm:grid-cols-2">
            <!-- نسبة عمولة المنصة الثابتة -->
            <div>
              <label class="block text-xs font-bold text-solar-text-body mb-2">
                نسبة عمولة المنصة الثابتة
              </label>
              <div class="relative">
                <input
                  v-model.number="form.commissionRate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  required
                  class="solar-input h-12 text-sm font-mono font-bold text-left pl-10"
                />
                <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-solar-text-muted text-sm">%</span>
              </div>
              <p class="mt-1.5 text-[11px] text-solar-text-muted">
                النسبة المستقطعة من إجمالي قيمة طلبات المنتجات المكتملة لصالح المنصة.
              </p>
            </div>

            <!-- الحد الأدنى لصرف مستحقات المورد -->
            <div>
              <label class="block text-xs font-bold text-solar-text-body mb-2">
                الحد الأدنى لصرف مستحقات المورد
              </label>
              <div class="relative">
                <input
                  v-model.number="form.minimumPayout"
                  type="number"
                  step="50"
                  min="100"
                  required
                  class="solar-input h-12 text-sm font-mono font-bold text-left pl-14"
                />
                <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-solar-text-muted text-xs">ر.س</span>
              </div>
              <p class="mt-1.5 text-[11px] text-solar-text-muted">
                الحد الأدنى المتطلب في رصيد المورد لتفعيل عملية التحويل المالي.
              </p>
            </div>
          </div>

          <div class="grid gap-6 sm:grid-cols-2">
            <!-- دورة صرف المستحقات المجدولة -->
            <div>
              <label class="block text-xs font-bold text-solar-text-body mb-2">
                دورة صرف المستحقات المجدولة
              </label>
              <div class="relative">
                <select
                  v-model="form.payoutSchedule"
                  class="solar-input h-12 text-xs font-bold pl-10"
                >
                  <option value="weekly_thursday">أسبوعياً - كل يوم خميس</option>
                  <option value="weekly_sunday">أسبوعياً - كل يوم أحد</option>
                  <option value="monthly">شهرياً - نهاية كل شهر ميلادي</option>
                </select>
                <Calendar class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted" />
              </div>
              <p class="mt-1.5 text-[11px] text-solar-text-muted">
                التوقيت الآلي لمعالجة التحويلات السريعة عبر شبكة المدفوعات السعودية (سريع).
              </p>
            </div>

            <!-- فترة تعليق المبالغ للضمان (Escrow) -->
            <div>
              <label class="block text-xs font-bold text-solar-text-body mb-2">
                فترة تعليق المبالغ للضمان (Escrow)
              </label>
              <div class="relative">
                <input
                  v-model.number="form.escrowDays"
                  type="number"
                  min="1"
                  max="30"
                  required
                  class="solar-input h-12 text-sm font-mono font-bold text-left pl-14"
                />
                <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-solar-text-muted text-xs">أيام</span>
              </div>
              <p class="mt-1.5 text-[11px] text-solar-text-muted">
                فترة تعليق المستحقات بعد تأكيد استلام الشحنة لضمان حقوق العميل وفترة الإرجاع.
              </p>
            </div>
          </div>

          <p v-if="noticeMessage" class="rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <Check class="size-4 text-emerald-600" /> {{ noticeMessage }}
          </p>

          <!-- أزرار الإجراءات -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-solar-border-card">
            <button
              type="button"
              @click="resetForm"
              class="btn-outline h-11 px-6 text-xs font-bold"
            >
              إلغاء التغييرات
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="btn-primary h-11 px-8 text-xs font-bold bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md gap-2"
            >
              <Save class="size-4" />
              <span>{{ isSaving ? 'جارٍ الحفظ...' : 'حفظ الإعدادات المالية' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
