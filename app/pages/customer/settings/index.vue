<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  AtSign,
  Check,
  Eye,
  EyeOff,
  Laptop,
  MapPin,
  Shield,
  UserRound,
} from 'lucide-vue-next'
import FormField from '../../../components/common/FormField.vue'
import MapLocationModal, {
  type LocationData,
} from '../../../components/common/MapLocationModal.vue'
import { useCustomerProfile } from '../../../composables/useCustomerProfile'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'الملف الشخصي وإعدادات الحساب | SolarHub',
  description: 'إدارة بيانات حساب العميل ومعلومات الاتصال والموقع.',
})

const {
  form,
  errors,
  loading,
  loadError,
  profileLoaded,
  governorateOptions,
  coordinatesChanged,
  saveState,
  statusMessage,
  summary,
  loadProfile,
  setProfileLocation,
  saveProfile,
  resetProfile,
} = useCustomerProfile()

const isMapModalOpen = ref(false)
const showPasswords = ref(false)

const fieldsDisabled = computed(() =>
  loading.value
  || Boolean(loadError.value)
  || !profileLoaded.value
  || saveState.value === 'saving',
)

const displayedAddress = computed(() => {
  if (form.address) return form.address

  if (form.coordinates) {
    return 'موقع محفوظ على الخريطة'
  }

  return ''
})

function openMap() {
  if (fieldsDisabled.value) return

  isMapModalOpen.value = true
}

function handleLocationSelected(location: LocationData) {
  if (fieldsDisabled.value) return

  setProfileLocation(location)
  isMapModalOpen.value = false
}

async function handleSubmit() {
  const saved = await saveProfile()

  if (saved) {
    showPasswords.value = false
  }
}

function handleReset() {
  if (fieldsDisabled.value) return

  resetProfile()
  showPasswords.value = false
  isMapModalOpen.value = false
}

watch(fieldsDisabled, disabled => {
  if (disabled) {
    isMapModalOpen.value = false
  }
})
</script>

<template>
  <div
    dir="rtl"
    class="mx-auto flex w-full max-w-6xl flex-col gap-6"
  >
    <nav
      class="flex flex-wrap items-center gap-2 text-xs text-solar-text-muted"
      aria-label="مسار التنقل"
    >
      <NuxtLink to="/customer/dashboard">
        الرئيسية
      </NuxtLink>

      <span aria-hidden="true">‹</span>

      <span class="text-solar-text-heading">
        إعدادات الحساب
      </span>
    </nav>

    <header
      class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"
    >
      <div>
        <h1 class="text-2xl font-bold text-solar-text-heading md:text-3xl">
          الملف الشخصي وإعدادات الحساب
        </h1>

        <p class="mt-2 text-sm leading-7 text-solar-text-muted">
          حدّث بياناتك الشخصية ومعلومات الاتصال وموقع حسابك.
        </p>
      </div>

      <button
        v-if="profileLoaded && !loading && !loadError"
        type="button"
        :disabled="saveState === 'saving'"
        class="shrink-0 self-start rounded-lg border border-solar-border-card bg-white px-4 py-2 text-xs font-bold text-solar-text-heading disabled:cursor-not-allowed disabled:opacity-50"
        @click="loadProfile"
      >
        إعادة تحميل بيانات الحساب
      </button>
    </header>

    <section
      v-if="loading"
      role="status"
      aria-live="polite"
      class="rounded-xl border border-solar-border-card bg-white px-5 py-14 text-center text-sm text-solar-text-muted"
    >
      جارٍ تحميل بيانات الحساب…
    </section>

    <section
      v-else-if="loadError"
      role="alert"
      class="rounded-xl border border-red-200 bg-red-50 p-6"
    >
      <p class="text-sm leading-7 text-red-800">
        {{ loadError }}
      </p>

      <button
        type="button"
        class="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-bold text-red-800"
        @click="loadProfile"
      >
        إعادة المحاولة
      </button>
    </section>

    <template v-else-if="profileLoaded">
      <section
        class="solar-card flex flex-col items-center gap-4 p-5 sm:flex-row sm:p-6"
        aria-label="ملخص الحساب"
      >
        <div
          class="flex size-20 shrink-0 items-center justify-center rounded-full bg-solar-navy-dark text-2xl font-bold text-white"
          aria-hidden="true"
        >
          {{ summary.initials }}
        </div>

        <div class="min-w-0 flex-1 text-center sm:text-right">
          <h2 class="break-words text-xl font-bold text-solar-text-heading">
            {{ form.fullName }}
          </h2>

          <p class="mt-2 break-all text-sm text-solar-text-muted">
            {{ form.email }}
          </p>

          <p class="mt-2 text-xs text-solar-text-muted">
            معرف الحساب: {{ summary.customerId }}
          </p>

          <span
            class="mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold"
            :class="
              summary.verified
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-amber-50 text-amber-800'
            "
          >
            {{
              summary.verified
                ? 'البريد الإلكتروني مؤكد'
                : 'البريد الإلكتروني غير مؤكد'
            }}
          </span>
        </div>
      </section>

      <form
        class="solar-card p-5 sm:p-7"
        novalidate
        :aria-busy="saveState === 'saving'"
        @submit.prevent="handleSubmit"
      >
        <fieldset :disabled="fieldsDisabled" class="min-w-0">
          <legend class="sr-only">
            تعديل بيانات الحساب
          </legend>

          <section aria-labelledby="personal-heading">
            <h2
              id="personal-heading"
              class="mb-5 flex items-center gap-2 text-lg font-bold text-solar-text-heading"
            >
              <UserRound class="size-5" aria-hidden="true" />
              المعلومات الشخصية
            </h2>

            <div class="grid gap-5 md:grid-cols-2">
              <FormField
                label="الاسم الكامل"
                :error="errors.fullName"
                required
              >
                <input
                  v-model.trim="form.fullName"
                  type="text"
                  autocomplete="name"
                  maxlength="150"
                  required
                  :aria-invalid="Boolean(errors.fullName)"
                  class="solar-input h-11"
                >
              </FormField>

              <FormField
                label="المحافظة"
                :error="errors.city"
              >
                <select
                  v-model="form.city"
                  :aria-invalid="Boolean(errors.city)"
                  class="solar-input h-11"
                >
                  <option value="">
                    غير محددة
                  </option>

                  <option
                    v-for="option in governorateOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </FormField>
            </div>

            <p class="mt-4 text-xs text-solar-text-muted">
              نوع الحساب: {{ form.accountType }}
            </p>
          </section>

          <hr class="my-7 border-solar-border-card">

          <section aria-labelledby="contact-heading">
            <h2
              id="contact-heading"
              class="mb-5 flex items-center gap-2 text-lg font-bold text-solar-text-heading"
            >
              <AtSign class="size-5" aria-hidden="true" />
              معلومات الاتصال
            </h2>

            <div class="grid gap-5 md:grid-cols-2">
              <FormField
                label="البريد الإلكتروني"
                :error="errors.email"
              >
                <input
                  :value="form.email"
                  type="email"
                  autocomplete="email"
                  dir="ltr"
                  readonly
                  class="solar-input h-11 bg-solar-bg-subtle"
                >

                <p class="mt-2 text-xs leading-6 text-solar-text-muted">
                  تغيير البريد غير متاح من هذه الصفحة.
                </p>
              </FormField>

              <FormField
                label="رقم الجوال"
                :error="errors.phone"
                required
              >
                <input
                  v-model.trim="form.phone"
                  type="tel"
                  autocomplete="tel"
                  dir="ltr"
                  maxlength="30"
                  required
                  :aria-invalid="Boolean(errors.phone)"
                  class="solar-input h-11"
                >
              </FormField>
            </div>
          </section>

          <hr class="my-7 border-solar-border-card">

          <section aria-labelledby="location-heading">
            <h2
              id="location-heading"
              class="mb-5 flex items-center gap-2 text-lg font-bold text-solar-text-heading"
            >
              <MapPin class="size-5" aria-hidden="true" />
              موقع الحساب
            </h2>

            <FormField
              label="الموقع المحدد"
              :error="errors.address"
            >
              <div class="flex flex-col gap-3 sm:flex-row">
                <input
                  :value="displayedAddress"
                  type="text"
                  readonly
                  placeholder="اختر الموقع من الخريطة"
                  class="solar-input h-11 min-w-0 flex-1 bg-solar-bg-subtle"
                >

                <button
                  type="button"
                  class="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-solar-yellow px-5 text-sm font-bold text-solar-navy-dark"
                  @click="openMap"
                >
                  <MapPin class="size-4" aria-hidden="true" />
                  تحديد الموقع
                </button>
              </div>
            </FormField>

            <p class="mt-3 text-xs leading-6 text-solar-text-muted">
              حدد نقطة الموقع على الخريطة لحفظها مع حسابك.
            </p>

            <p
              v-if="coordinatesChanged"
              class="mt-2 text-xs font-bold text-amber-800"
            >
              موقع جديد بانتظار حفظ التعديلات.
            </p>
          </section>

          <hr class="my-7 border-solar-border-card">

          <section aria-labelledby="password-heading">
            <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2
                  id="password-heading"
                  class="text-lg font-bold text-solar-text-heading"
                >
                  تغيير كلمة المرور
                </h2>

                <p class="mt-2 text-xs leading-6 text-solar-text-muted">
                  اترك هذه الحقول فارغة إذا لم ترغب في تغيير كلمة المرور.
                </p>
              </div>

              <button
                type="button"
                :aria-pressed="showPasswords"
                class="inline-flex items-center gap-2 rounded-lg border border-solar-border-card px-3 py-2 text-xs font-bold text-solar-text-heading"
                @click="showPasswords = !showPasswords"
              >
                <EyeOff
                  v-if="showPasswords"
                  class="size-4"
                  aria-hidden="true"
                />

                <Eye
                  v-else
                  class="size-4"
                  aria-hidden="true"
                />

                {{ showPasswords ? 'إخفاء كلمات المرور' : 'إظهار كلمات المرور' }}
              </button>
            </div>

            <div class="grid gap-5 md:grid-cols-2">
              <FormField
                label="كلمة المرور الحالية"
                :error="errors.currentPassword"
                class="md:col-span-2"
              >
                <input
                  v-model="form.currentPassword"
                  :type="showPasswords ? 'text' : 'password'"
                  autocomplete="current-password"
                  :aria-invalid="Boolean(errors.currentPassword)"
                  class="solar-input h-11"
                >
              </FormField>

              <FormField
                label="كلمة المرور الجديدة"
                :error="errors.newPassword"
              >
                <input
                  v-model="form.newPassword"
                  :type="showPasswords ? 'text' : 'password'"
                  autocomplete="new-password"
                  :aria-invalid="Boolean(errors.newPassword)"
                  class="solar-input h-11"
                >
              </FormField>

              <FormField
                label="تأكيد كلمة المرور الجديدة"
                :error="errors.confirmPassword"
              >
                <input
                  v-model="form.confirmPassword"
                  :type="showPasswords ? 'text' : 'password'"
                  autocomplete="new-password"
                  :aria-invalid="Boolean(errors.confirmPassword)"
                  class="solar-input h-11"
                >
              </FormField>
            </div>

            <p class="mt-3 text-xs text-solar-text-muted">
              كلمة المرور الجديدة: 8 أحرف على الأقل.
            </p>
          </section>
        </fieldset>

        <div
          class="mt-7 flex flex-col gap-4 border-t border-solar-border-card pt-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <p
            v-if="statusMessage"
            role="status"
            aria-live="polite"
            class="text-sm leading-7"
            :class="
              saveState === 'error'
                ? 'text-red-700'
                : 'text-emerald-800'
            "
          >
            {{ statusMessage }}
          </p>

          <span v-else />

          <div class="flex shrink-0 gap-3">
            <button
              type="button"
              :disabled="fieldsDisabled"
              class="rounded-lg border border-solar-border-card bg-white px-5 py-3 text-sm font-bold text-solar-text-heading disabled:cursor-not-allowed disabled:opacity-50"
              @click="handleReset"
            >
              إلغاء التعديلات
            </button>

            <button
              type="submit"
              :disabled="fieldsDisabled"
              class="inline-flex items-center justify-center gap-2 rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check class="size-4" aria-hidden="true" />

              {{ saveState === 'saving' ? 'جارٍ الحفظ…' : 'حفظ التعديلات' }}
            </button>
          </div>
        </div>
      </form>

      <section
        class="solar-card p-5 sm:p-7"
        aria-labelledby="security-heading"
      >
        <h2
          id="security-heading"
          class="mb-5 flex items-center gap-2 text-lg font-bold text-solar-text-heading"
        >
          <Shield class="size-5" aria-hidden="true" />
          خيارات الأمان
        </h2>

        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="rounded-xl border border-solar-border-card bg-solar-bg-subtle p-4"
          >
            <h3 class="text-sm font-bold text-solar-text-heading">
              التحقق بخطوتين
            </h3>

            <p class="mt-2 text-xs leading-6 text-solar-text-muted">
              إدارة التحقق بخطوتين غير متاحة حاليًا.
            </p>

            <button
              type="button"
              disabled
              class="mt-3 rounded-lg border border-solar-border-card px-4 py-2 text-xs opacity-50"
            >
              غير متاح
            </button>
          </div>

          <div
            class="rounded-xl border border-solar-border-card bg-solar-bg-subtle p-4"
          >
            <h3
              class="flex items-center gap-2 text-sm font-bold text-solar-text-heading"
            >
              <Laptop class="size-4" aria-hidden="true" />
              إدارة الجلسات
            </h3>

            <p class="mt-2 text-xs leading-6 text-solar-text-muted">
              عرض الجلسات الأخرى وإنهاؤها غير متاحين حاليًا.
            </p>

            <button
              type="button"
              disabled
              class="mt-3 rounded-lg border border-solar-border-card px-4 py-2 text-xs opacity-50"
            >
              غير متاح
            </button>
          </div>
        </div>
      </section>

      <MapLocationModal
        :is-open="isMapModalOpen"
        :current-location="form.coordinates || form.address"
        title="تحديد موقع الحساب"
        subtitle="حدد الموقع ثم أكد اختياره"
        @select="handleLocationSelected"
        @close="isMapModalOpen = false"
      />
    </template>
  </div>
</template>