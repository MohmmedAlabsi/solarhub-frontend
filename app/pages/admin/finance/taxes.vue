<script setup lang="ts">
import { AtSign, Check, Download, FileText, Hash, Save, ShieldCheck } from 'lucide-vue-next'
import FinanceTabs from '../../../components/admin/finance/FinanceTabs.vue'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'الإدارة المالية — الضرائب | لوحة الإدارة العامة' })

const form = ref({
  vatTin: '31024589200003',
  vatRate: '15',
  isInclusive: true,
  taxEmail: 'finance-tax@solarhub.sa',
})

const isSaving = ref(false)
const noticeMessage = ref('')

function saveSettings() {
  isSaving.value = true
  setTimeout(() => {
    isSaving.value = false
    noticeMessage.value = 'تم حفظ إعدادات ضريبة القيمة المضافة وتحديث الفوترة بنجاح.'
    setTimeout(() => {
      noticeMessage.value = ''
    }, 3000)
  }, 600)
}

function resetForm() {
  form.value = {
    vatTin: '31024589200003',
    vatRate: '15',
    isInclusive: true,
    taxEmail: 'finance-tax@solarhub.sa',
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

      <!-- بطاقة إعدادات ضريبة القيمة المضافة -->
      <div class="mt-8 max-w-4xl mx-auto rounded-2xl border border-solar-border-card bg-white p-6 sm:p-8 shadow-xs">
        <div class="text-center sm:text-right border-b border-solar-border-card/60 pb-5">
          <h2 class="text-lg sm:text-xl font-black text-solar-text-heading">إعدادات ضريبة القيمة المضافة</h2>
          <p class="mt-1 text-xs sm:text-sm text-solar-text-muted">
            تحديد نسبة الضريبة والرقم الضريبي والخيارات المعتمدة للمنصة والمتجر.
          </p>
        </div>

        <form @submit.prevent="saveSettings" class="mt-6 flex flex-col gap-6">
          <!-- الرقم الضريبي الموحد -->
          <div>
            <label class="block text-xs font-bold text-solar-text-body mb-2">
              الرقم الضريبي الموحد للمنصة (VAT TIN) <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model="form.vatTin"
                type="text"
                required
                dir="ltr"
                class="solar-input h-12 text-sm font-mono tracking-widest text-right pl-10"
              />
              <Hash class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted" />
            </div>
            <p class="mt-1.5 text-[11px] text-solar-text-muted">
              الرقم الضريبي الرسمي المطبوع على الفواتير الإلكترونية الصادرة.
            </p>
          </div>

          <!-- نسبة الضريبة القياسية -->
          <div>
            <label class="block text-xs font-bold text-solar-text-body mb-2">
              نسبة ضريبة القيمة المضافة القياسية <span class="text-rose-500">*</span>
            </label>
            <div class="relative max-w-xs">
              <input
                v-model="form.vatRate"
                type="number"
                min="0"
                max="100"
                required
                class="solar-input h-12 text-sm font-mono font-bold text-left pl-10"
              />
              <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-solar-text-muted text-sm">%</span>
            </div>
            <p class="mt-1.5 text-[11px] text-solar-text-muted">
              تطبق تلقائياً على جميع مشتريات المعدات والخدمات الهندسية.
            </p>
          </div>

          <!-- تضمين الضريبة في أسعار المنتجات -->
          <div>
            <label class="block text-xs font-bold text-solar-text-body mb-2">
              تضمين الضريبة في عرض أسعار المنتجات في المتجر
            </label>
            <div class="grid gap-3 sm:grid-cols-2">
              <label
                class="flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all"
                :class="form.isInclusive ? 'border-solar-navy bg-solar-bg-subtle/50 ring-1 ring-solar-navy' : 'border-solar-border-card hover:bg-solar-bg-subtle/30'"
              >
                <input
                  v-model="form.isInclusive"
                  type="radio"
                  :value="true"
                  class="accent-solar-navy mt-1 size-4"
                />
                <div>
                  <span class="text-xs font-black text-solar-text-heading block">الأسعار شاملة الضريبة (VAT Inclusive)</span>
                  <span class="text-[11px] text-solar-text-muted mt-1 block">
                    تظهر كافة أسعار الألواح والمحولات متضمنة نسبة الـ 15%.
                  </span>
                </div>
              </label>

              <label
                class="flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all"
                :class="!form.isInclusive ? 'border-solar-navy bg-solar-bg-subtle/50 ring-1 ring-solar-navy' : 'border-solar-border-card hover:bg-solar-bg-subtle/30'"
              >
                <input
                  v-model="form.isInclusive"
                  type="radio"
                  :value="false"
                  class="accent-solar-navy mt-1 size-4"
                />
                <div>
                  <span class="text-xs font-black text-solar-text-heading block">الأسعار غير شاملة الضريبة</span>
                  <span class="text-[11px] text-solar-text-muted mt-1 block">
                    يتم احتساب الضريبة بشكل منفصل كبند إضافي عند الدفع.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <!-- البريد الإلكتروني للإشعارات الضريبية -->
          <div>
            <label class="block text-xs font-bold text-solar-text-body mb-2">
              البريد الإلكتروني المالي للإشعارات الضريبية والزكوية <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model="form.taxEmail"
                type="email"
                required
                dir="ltr"
                class="solar-input h-12 text-sm text-right pl-10"
              />
              <AtSign class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted" />
            </div>
            <p class="mt-1.5 text-[11px] text-solar-text-muted">
              يستقبل هذا البريد ملخصات الإقرارات الشهرية وإشعارات الفوترة.
            </p>
          </div>

          <p v-if="noticeMessage" class="rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <Check class="size-4 text-emerald-600" /> {{ noticeMessage }}
          </p>

          <!-- أزرار الحفظ -->
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
              <span>{{ isSaving ? 'جارٍ الحفظ...' : 'حفظ الإعدادات الضريبية' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
