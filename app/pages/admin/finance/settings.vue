<script setup lang="ts">
import {
  Calendar,
  Check,
  Coins,
  DollarSign,
  Download,
  Loader2,
  Lock,
  Percent,
  RefreshCw,
  Save,
  ShieldAlert,
} from 'lucide-vue-next'
import FinanceTabs from '../../../components/admin/finance/FinanceTabs.vue'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'الإدارة المالية — الإعدادات المالية | لوحة الإدارة العامة' })

const {
  settings,
  isLoading,
  isActionLoading,
  fetchSettings,
  updateSettings,
} = useAdminFinance()

const { pending } = useLazyAsyncData('admin_finance_settings', () => fetchSettings(false), {
  default: () => settings.value,
})

const isRefreshing = ref(false)

const form = ref({
  currency: 'YER - ريال يمني',
  commissionRate: 5.0,
  minimumPayout: 5000,
  payoutSchedule: 'weekly_thursday',
  escrowDays: 3,
  platformName: 'سولار هاب - SolarHub',
  supportPhone: '777000000',
  supportEmail: 'support@solarhub.com',
})

// Sync form when settings are loaded from API
watch(settings, (val) => {
  if (val) {
    form.value.currency = `${val.currency || 'YER'} - ريال يمني`
    form.value.platformName = val.platform_name || form.value.platformName
    form.value.supportPhone = val.support_phone || form.value.supportPhone
    form.value.supportEmail = val.support_email || form.value.supportEmail
  }
}, { immediate: true })

async function handleRefreshSettings() {
  isRefreshing.value = true
  try {
    await fetchSettings(true)
  } finally {
    isRefreshing.value = false
  }
}

async function handleSaveSettings() {
  await updateSettings({
    currency: 'YER',
    platform_name: form.value.platformName,
    support_phone: form.value.supportPhone,
    support_email: form.value.supportEmail,
  })
}

function resetForm() {
  if (settings.value) {
    form.value.currency = `${settings.value.currency || 'YER'} - ريال يمني`
    form.value.platformName = settings.value.platform_name || 'سولار هاب - SolarHub'
    form.value.supportPhone = settings.value.support_phone || '777000000'
    form.value.supportEmail = settings.value.support_email || 'support@solarhub.com'
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

        <div class="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            @click="handleRefreshSettings"
            :disabled="isRefreshing || pending || isLoading"
            class="btn-outline h-10 px-4 text-xs font-bold gap-2 text-solar-text-body hover:bg-solar-bg-subtle"
            title="تحديث البيانات من السيرفر"
          >
            <RefreshCw class="size-4" :class="{ 'animate-spin': isRefreshing || pending || isLoading }" />
            <span>تحديث</span>
          </button>
        </div>
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
              تحديد العملة الافتراضية ونسب العمولة المقتطعة من مبيعات المتاجر والموردين المسجلة في الـ Database.
            </p>
          </div>

          <span class="inline-flex items-center gap-1.5 rounded-full border border-solar-navy/20 bg-solar-navy/5 px-3 py-1 text-xs font-bold text-solar-navy-dark shrink-0">
            <ShieldAlert class="size-3.5 text-solar-navy" />
            صلاحية الإدارة المالية
          </span>
        </div>

        <form @submit.prevent="handleSaveSettings" class="mt-6 flex flex-col gap-6">
          <!-- العملة الافتراضية للمنصة -->
          <div>
            <label class="block text-xs font-bold text-solar-text-body mb-2">
              العملة الافتراضية المعتمدة للمنصة
            </label>
            <div class="relative flex items-center">
              <input
                v-model="form.currency"
                type="text"
                disabled
                class="solar-input h-12 text-xs font-bold bg-solar-bg-subtle/80 cursor-not-allowed pl-32 text-right"
              />
              <span class="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-lg bg-white border border-solar-border-card px-2.5 py-1 text-[11px] font-bold text-emerald-700 shadow-2xs">
                <Lock class="size-3 text-emerald-600" />
                مطابق لقاعدة البيانات
              </span>
            </div>
            <p class="mt-1.5 text-[11px] text-solar-text-muted">
              العملة الموحدة لجميع الفواتير والمستحقات المعتمدة في جدول platform_settings.
            </p>
          </div>

          <div class="grid gap-6 sm:grid-cols-2">
            <!-- نسبة عمولة المنصة الثابتة -->
            <div>
              <label class="block text-xs font-bold text-solar-text-body mb-2">
                نسبة عمولة المنصة من مبيعات المتاجر
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
                النسبة المعتمدة في جدول store_payouts (حالياً 5.00%).
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
                  step="500"
                  min="1000"
                  required
                  class="solar-input h-12 text-sm font-mono font-bold text-left pl-14"
                />
                <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-solar-text-muted text-xs">ر.ي</span>
              </div>
              <p class="mt-1.5 text-[11px] text-solar-text-muted">
                الحد الأدنى المتطلب في رصيد المورد لتفعيل عملية التحويل المالي للمحفظة.
              </p>
            </div>
          </div>

          <div class="grid gap-6 sm:grid-cols-2">
            <!-- هاتف الدعم المالي -->
            <div>
              <label class="block text-xs font-bold text-solar-text-body mb-2">
                هاتف الدعم والاستفسارات المالية
              </label>
              <input
                v-model="form.supportPhone"
                type="text"
                dir="ltr"
                class="solar-input h-12 text-xs font-mono font-bold text-left"
              />
            </div>

            <!-- البريد المالي -->
            <div>
              <label class="block text-xs font-bold text-solar-text-body mb-2">
                البريد الإلكتروني للعمليات المالية
              </label>
              <input
                v-model="form.supportEmail"
                type="email"
                dir="ltr"
                class="solar-input h-12 text-xs font-mono font-bold text-left"
              />
            </div>
          </div>

          <!-- أزرار الإجراءات -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-solar-border-card">
            <button
              type="button"
              @click="resetForm"
              class="btn-outline h-11 px-6 text-xs font-bold"
            >
              استعادة الافتراضي
            </button>
            <button
              type="submit"
              :disabled="isActionLoading"
              class="btn-primary h-11 px-8 text-xs font-bold bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md gap-2"
            >
              <Loader2 v-if="isActionLoading" class="size-4 animate-spin" />
              <Save v-else class="size-4" />
              <span>حفظ الإعدادات المالية</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
