<script setup lang="ts">
import {
  Check,
  Coins,
  Globe,
  Loader2,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-vue-next'
import AdminSectionHeading from '../../../components/admin/workspace/AdminSectionHeading.vue'
import FormField from '../../../components/common/FormField.vue'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إعدادات النظام والمنصة | SolarHub' })

const {
  settings,
  preferences,
  draft,
  errors,
  isLoading,
  isSaving,
  fetchSettings,
  cancel,
  save,
  setDensity,
  resetDefaults,
} = useAdminSettings()

const { notify } = useAdminNotice()
const formId = useId()

// جلب الإعدادات عند أول تحميل
const { pending } = useLazyAsyncData('admin_platform_settings_fetch', () => fetchSettings(false), {
  default: () => settings.value,
})

const isRefreshing = ref(false)
async function handleRefresh() {
  isRefreshing.value = true
  try {
    await fetchSettings(true)
    notify('تم تحديث الإعدادات من الخادم.')
  } finally {
    isRefreshing.value = false
  }
}
</script>

<template>
  <div class="admin-managed">
    <AdminSectionHeading
      title="إعدادات النظام والمنصة"
      description="إدارة التهيئات العامة للمنصة، معلومات التواصل الرسمية، وحالة تشغيل النظام."
    >
      <button
        type="button"
        class="btn-outline"
        :disabled="isRefreshing || isSaving || pending"
        @click="handleRefresh"
      >
        <RefreshCw class="size-4" :class="isRefreshing ? 'animate-spin' : ''" />
        تحديث
      </button>
      <button
        type="button"
        class="btn-outline"
        :disabled="isSaving"
        @click="cancel"
      >
        إلغاء التعديلات
      </button>
      <button
        type="submit"
        :form="formId"
        class="btn-dark"
        :disabled="isSaving || pending"
      >
        <Loader2 v-if="isSaving" class="size-4 animate-spin text-solar-yellow" />
        <Save v-else class="size-4 text-solar-yellow" />
        <span>{{ isSaving ? 'جارٍ الحفظ في الخادم...' : 'حفظ التغييرات' }}</span>
      </button>
    </AdminSectionHeading>

    <!-- بطاقة الهوية والبيانات الرسمية -->
    <section class="solar-card !p-5 sm:!p-7">
      <header class="mb-6 flex items-center gap-3 border-b border-solar-border-card pb-5">
        <span class="flex size-11 items-center justify-center rounded-xl bg-solar-bg-subtle text-solar-navy">
          <SlidersHorizontal class="size-5.5" />
        </span>
        <div>
          <h2 class="text-base font-bold text-solar-navy">بيانات المنصة الرسمية</h2>
          <p class="mt-1 text-xs text-solar-text-muted">الاسم المعتمد للمنصة، وسائل التواصل الرسمية للدعم الفني والعملة</p>
        </div>
      </header>

      <form :id="formId" novalidate @submit.prevent="save">
        <div class="grid gap-5 sm:grid-cols-2">
          <FormField label="اسم المنصة المعتمد" required :error="errors.platform_name">
            <input
              v-model="draft.platform_name"
              class="solar-input"
              maxlength="150"
              placeholder="مثال: سولار هاب - SolarHub"
              :aria-invalid="!!errors.platform_name"
            />
          </FormField>

          <FormField label="العملة الرسمية للمنظومة" required :error="errors.currency">
            <select v-model="draft.currency" class="solar-input">
              <option value="YER">ريال يمني (YER)</option>
              <option value="SAR">ريال سعودي (SAR)</option>
              <option value="USD">دولار أمريكي (USD)</option>
            </select>
          </FormField>

          <FormField label="البريد الإلكتروني للدعم الفني" required :error="errors.support_email">
            <input
              v-model="draft.support_email"
              type="email"
              dir="ltr"
              class="solar-input"
              maxlength="150"
              placeholder="support@solarhub.com"
              :aria-invalid="!!errors.support_email"
            />
          </FormField>

          <FormField label="رقم هاتف الدعم الفني / خدمة العملاء" required :error="errors.support_phone">
            <input
              v-model="draft.support_phone"
              type="tel"
              dir="ltr"
              class="solar-input"
              maxlength="50"
              placeholder="775636416"
              :aria-invalid="!!errors.support_phone"
            />
          </FormField>
        </div>

        <!-- وضع الصيانة والتشغيل -->
        <div class="mt-6 flex items-center justify-between gap-5 rounded-xl border border-solar-border-card bg-solar-bg-page p-5">
          <div class="flex items-start gap-3">
            <ShieldAlert
              class="size-6 mt-0.5 shrink-0"
              :class="draft.is_maintenance_mode ? 'text-amber-600' : 'text-emerald-600'"
            />
            <div>
              <h3 class="text-sm font-bold text-solar-navy flex items-center gap-2">
                حالة تشغيل المنصة العامة
                <span
                  class="rounded-full px-2.5 py-0.5 text-xs font-bold"
                  :class="draft.is_maintenance_mode ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'"
                >
                  {{ draft.is_maintenance_mode ? 'وضع الصيانة نشط' : 'المنصة متاحة ونشطة للجميع' }}
                </span>
              </h3>
              <p class="mt-1.5 text-xs leading-5 text-solar-text-muted max-w-xl">
                عند تفعيل وضع الصيانة، يتم تنبيه الزوار والعملاء ويقتصر الدخول على المشرفين والإدارة لمباشرة التحديثات.
              </p>
            </div>
          </div>

          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="draft.is_maintenance_mode"
              type="checkbox"
              role="switch"
              aria-label="تفعيل وضع الصيانة"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        <div class="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-solar-border-card pt-5">
          <button type="button" class="btn-outline" :disabled="isSaving" @click="cancel">
            إلغاء التعديلات
          </button>
          <button type="submit" class="btn-dark" :disabled="isSaving || pending">
            <Loader2 v-if="isSaving" class="size-4 animate-spin text-solar-yellow" />
            <Check v-else class="size-4 text-solar-yellow" />
            <span>{{ isSaving ? 'جارٍ الحفظ...' : 'حفظ التعديلات' }}</span>
          </button>
        </div>
      </form>
    </section>

    <!-- التفضيلات العامة لواجهة المشرف -->
    <section class="solar-card !p-5 sm:!p-7">
      <header class="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-solar-border-card pb-4">
        <div>
          <h2 class="text-base font-bold text-solar-navy">تفضيلات لوحة التحكم</h2>
          <p class="mt-1 text-xs text-solar-text-muted">خيارات العرض وتجربة الاستخدام المخصصة للمشرف</p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 text-xs font-semibold text-solar-navy hover:text-solar-yellow transition-colors cursor-pointer"
          @click="resetDefaults"
        >
          <RotateCcw class="size-3.5" />
          استعادة التفضيلات الافتراضية
        </button>
      </header>

      <div class="flex flex-col divide-y divide-solar-border-card">
        <div class="grid items-center gap-4 py-4 sm:grid-cols-2">
          <div>
            <h3 class="text-sm font-bold text-solar-navy">لغة الواجهة</h3>
            <p class="mt-1 text-xs text-solar-text-muted">اللغة الأساسية لواجهات لوحة التحكم والتقارير</p>
          </div>
          <select aria-label="لغة الواجهة" class="solar-input" disabled>
            <option>العربية (المعتمدة)</option>
          </select>
        </div>

        <div class="grid items-center gap-4 py-4 sm:grid-cols-2">
          <div>
            <h3 class="text-sm font-bold text-solar-navy">كثافة العرض والمسافات للجداول</h3>
            <p class="mt-1 text-xs text-solar-text-muted">التحكم في ارتفاع الصفوف في جداول النظام</p>
          </div>
          <select
            :value="preferences.density"
            aria-label="كثافة العرض"
            class="solar-input"
            @change="setDensity(($event.target as HTMLSelectElement).value)"
          >
            <option value="comfortable">مريح وافتراضي (Comfortable)</option>
            <option value="compact">مضغوط وعالي الكثافة (Compact)</option>
          </select>
        </div>
      </div>
    </section>
  </div>
</template>
