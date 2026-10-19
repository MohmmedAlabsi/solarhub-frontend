<script setup lang="ts">
import { AtSign, Check, Laptop, LockKeyhole, MapPin, MessageSquareText, Shield, ShieldCheck, UserRound } from 'lucide-vue-next'
import FormField from '../../../components/common/FormField.vue'
import ProfilePasswordField from '../../../components/customer/profile/ProfilePasswordField.vue'
import ProfileSummaryCard from '../../../components/customer/profile/ProfileSummaryCard.vue'

definePageMeta({ layout: 'customer' })
useSeoMeta({ title: 'الملف الشخصي وإعدادات الحساب | SolarHub', description: 'إدارة معلومات حساب العميل وبيانات الاتصال وإعدادات الأمان.' })

const { form, errors, saveState, statusMessage, summary, sessions, terminatingSessions, saveProfile, resetProfile, terminateOtherSessions } = useCustomerProfile()
const currentSession = computed(() => sessions.find(session => session.isCurrent))

const isMapModalOpen = ref(false)

function handleLocationSelected(loc: { address: string; lat: number; lng: number; governorate?: string }) {
  form.address = loc.address
  if (loc.governorate) {
    form.city = loc.governorate
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-7">
    <nav class="flex flex-wrap items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/customer/dashboard" class="hover:text-solar-text-heading">الرئيسية</NuxtLink><span>‹</span><span>حسابي</span><span>‹</span><span class="font-bold text-solar-text-heading">إعدادات الحساب</span>
    </nav>

    <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-black text-solar-text-heading md:text-3xl">الملف الشخصي وإعدادات الحساب</h1>
        <p class="mt-1 text-sm text-solar-text-muted">إدارة البيانات الشخصية ومعلومات الاتصال وخيارات الأمان الخاصة بحسابك.</p>
      </div>
      <span class="inline-flex w-fit items-center gap-2 rounded-full border border-solar-border-card bg-solar-bg-subtle px-4 py-2 text-xs font-semibold text-solar-text-body"><Shield class="size-4 text-emerald-600" aria-hidden="true" /> حماية الحساب نشطة</span>
    </header>

    <ProfileSummaryCard :profile="form" :summary="summary" />

    <form class="solar-card p-4 sm:p-7 lg:p-8" novalidate @submit.prevent="saveProfile">
      <section aria-labelledby="personal-heading">
        <div class="mb-6 flex items-start gap-3">
          <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-bg-subtle text-solar-navy"><UserRound class="size-5" aria-hidden="true" /></span>
          <div><h2 id="personal-heading" class="text-lg font-extrabold text-solar-text-heading">المعلومات الشخصية</h2><p class="text-xs text-solar-text-muted">البيانات الأساسية ونوع الحساب المعتمد.</p></div>
        </div>
        <div class="grid gap-5 md:grid-cols-3">
          <FormField label="الاسم الكامل" :error="errors.fullName" required><input v-model.trim="form.fullName" type="text" autocomplete="name" class="solar-input h-11" :class="errors.fullName ? 'border-red-400' : ''" /></FormField>
          <FormField label="نوع الحساب"><input v-model="form.accountType" type="text" readonly class="solar-input h-11 cursor-not-allowed bg-solar-bg-subtle" /></FormField>
          <FormField label="المحافظة / المدينة" :error="errors.city" required><input v-model.trim="form.city" type="text" autocomplete="address-level2" class="solar-input h-11" :class="errors.city ? 'border-red-400' : ''" /></FormField>
        </div>
      </section>

      <hr class="my-8 border-solar-border-card" />

      <section aria-labelledby="contact-heading">
        <div class="mb-6 flex items-start gap-3">
          <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-bg-subtle text-solar-navy"><AtSign class="size-5" aria-hidden="true" /></span>
          <div><h2 id="contact-heading" class="text-lg font-extrabold text-solar-text-heading">بيانات الاتصال</h2><p class="text-xs text-solar-text-muted">معلومات التواصل وتأكيد التوصيل واستلام الإشعارات.</p></div>
        </div>
        <div class="grid gap-5 md:grid-cols-2">
          <FormField label="البريد الإلكتروني" :error="errors.email" required><input v-model.trim="form.email" type="email" autocomplete="email" dir="ltr" class="solar-input h-11 text-right" :class="errors.email ? 'border-red-400' : ''" /></FormField>
          <FormField label="رقم الجوال" :error="errors.phone" required>
            <span class="flex" dir="ltr"><span class="flex h-11 items-center rounded-l-lg border border-r-0 border-solar-border-input bg-solar-bg-subtle px-3 text-sm text-solar-text-muted">+966</span><input v-model.trim="form.phone" type="tel" inputmode="numeric" autocomplete="tel" class="solar-input h-11 rounded-l-none text-right" :class="errors.phone ? 'border-red-400' : ''" /></span>
          </FormField>
          <FormField label="العنوان الوطني / موقع التوصيل" :error="errors.address" required class="md:col-span-2">
            <div class="flex gap-2">
              <input v-model.trim="form.address" type="text" autocomplete="street-address" class="solar-input h-11 flex-1" :class="errors.address ? 'border-red-400' : ''" placeholder="مثال: الرياض - حي الملز - شارع الستين" />
              <button
                type="button"
                @click="isMapModalOpen = true"
                class="flex items-center gap-1.5 h-11 px-4 rounded-xl border border-solar-yellow bg-solar-yellow/20 text-xs font-bold text-solar-navy-dark hover:bg-solar-yellow/30 transition-all shrink-0 cursor-pointer shadow-2xs"
              >
                <MapPin class="size-4 text-solar-navy-dark" />
                <span>الخريطة</span>
              </button>
            </div>
          </FormField>
        </div>
      </section>

      <hr class="my-8 border-solar-border-card" />

      <section aria-labelledby="security-heading">
        <div class="mb-6 flex items-start gap-3">
          <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-bg-subtle text-solar-navy"><ShieldCheck class="size-5" aria-hidden="true" /></span>
          <div><h2 id="security-heading" class="text-lg font-extrabold text-solar-text-heading">الأمان والتحقق</h2><p class="text-xs text-solar-text-muted">إعدادات الدخول الثنائي ومراقبة الجلسات الحالية.</p></div>
        </div>

        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-4 rounded-xl border border-solar-border-card bg-solar-bg-subtle/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-start gap-3"><span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-solar-navy"><MessageSquareText class="size-5" aria-hidden="true" /></span><div><h3 class="text-sm font-bold text-solar-text-heading">التحقق بخطوتين (2FA)</h3><p class="mt-1 text-xs leading-5 text-solar-text-muted">إرسال رمز تحقق مؤقت عبر رسالة نصية (SMS) عند كل تسجيل دخول جديد.</p></div></div>
            <div class="flex items-center gap-3"><span class="text-xs font-bold text-emerald-600">{{ form.twoFactorEnabled ? 'مفعل حاليًا' : 'غير مفعل' }}</span><button type="button" role="switch" aria-label="التحقق بخطوتين" :aria-checked="form.twoFactorEnabled" class="relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow" :class="form.twoFactorEnabled ? 'bg-solar-navy' : 'bg-slate-300'" @click="form.twoFactorEnabled = !form.twoFactorEnabled"><span class="absolute top-1 size-4 rounded-full bg-white transition-all" :class="form.twoFactorEnabled ? 'right-6' : 'right-1'" /></button></div>
          </div>

          <div class="flex flex-col gap-4 rounded-xl border border-solar-border-card bg-solar-bg-subtle/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-start gap-3"><span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-solar-navy"><Laptop class="size-5" aria-hidden="true" /></span><div><div class="flex flex-wrap items-center gap-2"><h3 class="text-sm font-bold text-solar-text-heading">الجلسات النشطة وسجل الدخول</h3><span class="rounded bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">جلسة نشطة حاليًا</span></div><p v-if="currentSession" class="mt-1 text-xs text-solar-text-muted">متصفح {{ currentSession.browser }} • نظام {{ currentSession.operatingSystem }} ({{ currentSession.location }}، الآن)</p></div></div>
            <button type="button" class="text-xs font-semibold text-solar-text-body hover:text-red-600 disabled:opacity-60" :disabled="terminatingSessions" @click="terminateOtherSessions">{{ terminatingSessions ? 'جارٍ التحقق...' : 'إنهاء الجلسات الأخرى' }}</button>
          </div>
        </div>
      </section>

      <hr class="my-8 border-solar-border-card" />

      <section aria-labelledby="password-heading">
        <div class="mb-6 flex items-start gap-3">
          <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-bg-subtle text-solar-navy"><LockKeyhole class="size-5" aria-hidden="true" /></span>
          <div><h2 id="password-heading" class="text-lg font-extrabold text-solar-text-heading">إدارة كلمة المرور</h2><p class="text-xs text-solar-text-muted">تحديث كلمة المرور لحماية وتأمين بيانات حسابك.</p></div>
        </div>
        <div class="grid gap-5 md:grid-cols-2">
          <ProfilePasswordField v-model="form.currentPassword" label="كلمة المرور الحالية" placeholder="أدخل كلمة المرور الحالية" autocomplete="current-password" :error="errors.currentPassword" class="md:col-span-2" />
          <ProfilePasswordField v-model="form.newPassword" label="كلمة المرور الجديدة" placeholder="أدخل كلمة المرور الجديدة" autocomplete="new-password" :error="errors.newPassword" />
          <ProfilePasswordField v-model="form.confirmPassword" label="تأكيد كلمة المرور الجديدة" placeholder="أعد إدخال كلمة المرور" autocomplete="new-password" :error="errors.confirmPassword" />
        </div>
        <p class="mt-3 text-xs text-solar-text-muted">يجب أن تحتوي على 8 أحرف على الأقل، بما في ذلك أرقام وحروف.</p>
      </section>

      <div class="mt-8 flex flex-col-reverse gap-3 border-t border-solar-border-card pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p v-if="statusMessage" class="text-sm font-medium" :class="saveState === 'error' ? 'text-red-600' : 'text-emerald-700'" role="status" aria-live="polite">{{ statusMessage }}</p><span v-else />
        <div class="flex gap-3"><button type="button" class="btn-outline" :disabled="saveState === 'saving'" @click="resetProfile">إلغاء</button><button type="submit" class="btn-primary min-w-40" :disabled="saveState === 'saving'"><Check class="size-4" aria-hidden="true" />{{ saveState === 'saving' ? 'جارٍ الحفظ...' : 'حفظ التعديلات' }}</button></div>
      </div>
      <p class="mt-4 text-[10px] leading-6 text-solar-text-muted">بيانات وإعدادات تجريبية للعرض؛ لا يتم تحديث الحساب أو إعدادات الأمان على الخادم.</p>
    </form>

    <!-- نافذة اختيار وتأكيد العنوان الوطني وموقع التوصيل على الخريطة -->
    <CommonMapLocationModal
      :is-open="isMapModalOpen"
      :current-location="form.address"
      title="تحديد وتعديل العنوان الوطني / موقع التوصيل"
      subtitle="اختر موقعك بدقة على الخريطة لتحديث بيانات التوصيل الافتراضية"
      @close="isMapModalOpen = false"
      @select="handleLocationSelected"
    />
  </div>
</template>
