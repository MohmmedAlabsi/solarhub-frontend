
<script setup lang="ts">
import {
  AtSign,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  LockKeyhole,
  Phone,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  UserRound,
  X
} from 'lucide-vue-next'

import { useAuthStore } from '~/stores/auth'
import {
  supplierError,
  supplierRecord
} from '~/utils/supplierPortal'

definePageMeta({
  layout: 'supplier'
})

useSeoMeta({
  title: 'الملف الشخصي للمورد | SolarHub'
})

const auth = useAuthStore()
const { $api } = useNuxtApp()

// البيانات الشخصية
const name = ref('')
const phone = ref('')
const savedName = ref('')
const savedPhone = ref('')
const phoneVerified = ref<boolean | null>(null)

// تغيير كلمة المرور
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPasswords = ref(false)

// حالات الصفحة
const loading = ref(false)
const saving = ref(false)
const loaded = ref(false)
const success = ref('')
const failure = ref('')

const errors = reactive<Record<string, string>>({})

const email = computed(() =>
  String(auth.user?.email || '')
)

const emailVerified = computed(() =>
  Boolean(auth.user?.isVerified)
)

const busy = computed(() =>
  loading.value || saving.value
)

const passwordRequested = computed(() =>
  Boolean(
    currentPassword.value ||
    newPassword.value ||
    confirmPassword.value
  )
)

const hasChanges = computed(() =>
  name.value.trim() !== savedName.value ||
  phone.value.trim() !== savedPhone.value ||
  passwordRequested.value
)

// حذف أخطاء التحقق
function clearErrors() {
  for (const key of Object.keys(errors)) {
    delete errors[key]
  }
}

// مسح كلمات المرور من النموذج
function clearPasswords() {
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  showPasswords.value = false
}

// استعادة البيانات المحفوظة
function resetForm() {
  name.value = savedName.value
  phone.value = savedPhone.value

  clearPasswords()
  clearErrors()

  failure.value = ''
  success.value = ''
}

function setProfileFields() {
  savedName.value = String(auth.user?.name || '')
  savedPhone.value = String(auth.user?.phone || '')

  resetForm()
}

// قراءة بيانات الحساب من Laravel
async function loadProfile() {
  if (busy.value) return

  loading.value = true
  failure.value = ''
  success.value = ''

  try {
    const response = await $api<any>(
      '/auth/me'
    )

    if (
      response?.success === false ||
      response?.status === 'error'
    ) {
      throw new Error(
        response?.message ||
        'تعذر جلب بيانات الحساب.'
      )
    }

    const data = supplierRecord<any>(
      response
    )

    const profile =
      data?.user &&
      typeof data.user === 'object'
        ? data.user
        : data

    if (
      !profile ||
      typeof profile !== 'object' ||
      (!profile.id && !profile.email)
    ) {
      throw new Error(
        'لم يرجع الخادم بيانات حساب صالحة.'
      )
    }

    // تحديث الحساب دون فقدان بيانات المتجر
    auth.setUser({
      ...auth.user,
      ...profile,

      store:
        profile.store ??
        auth.user?.store,

      isVerified: Boolean(
        profile.email_verified ||
        profile.email_verified_at ||
        profile.isVerified ||
        auth.user?.isVerified
      )
    })

    // حالة توثيق الجوال من بيانات الخادم فقط
    if (
      profile.phone_verified_at ||
      profile.phone_verified === true
    ) {
      phoneVerified.value = true
    } else if (
      profile.phone_verified === false
    ) {
      phoneVerified.value = false
    } else {
      phoneVerified.value = null
    }

    setProfileFields()
    loaded.value = true
  } catch (err: any) {
    if (!loaded.value) {
      setProfileFields()
    }

    failure.value = supplierError(
      err,
      err?.message ||
      'تعذر تحميل بيانات الحساب من الخادم.'
    )
  } finally {
    loading.value = false
  }
}

// التحقق من البيانات
function validateForm(): boolean {
  clearErrors()

  if (name.value.trim().length < 3) {
    errors.name =
      'الاسم الكامل يجب أن يتكون من 3 أحرف على الأقل.'
  }

  if (
    !/^\+?[\d\s-]{7,20}$/.test(
      phone.value.trim()
    )
  ) {
    errors.phone =
      'يرجى إدخال رقم جوال صحيح.'
  }

  if (passwordRequested.value) {
    if (!currentPassword.value) {
      errors.currentPassword =
        'يرجى إدخال كلمة المرور الحالية.'
    }

    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

    if (
      !strongPassword.test(
        newPassword.value
      )
    ) {
      errors.newPassword =
        'استخدم 8 أحرف على الأقل، تتضمن حرفًا كبيرًا وصغيرًا ورقمًا.'
    }

    if (
      confirmPassword.value !==
      newPassword.value
    ) {
      errors.confirmPassword =
        'تأكيد كلمة المرور لا يطابق كلمة المرور الجديدة.'
    }
  }

  return Object.keys(errors).length === 0
}

// حفظ التعديلات في Laravel
async function saveProfile() {
  if (
    busy.value ||
    !hasChanges.value
  ) {
    return
  }

  failure.value = ''
  success.value = ''

  if (!validateForm()) return

  saving.value = true

  try {
    const payload: Record<string, string> = {
      name: name.value.trim(),
      phone: phone.value.trim()
    }

    // لا ترسل كلمة المرور إذا لم يطلب تغييرها
    if (passwordRequested.value) {
      payload.current_password =
        currentPassword.value

      payload.password =
        newPassword.value

      payload.password_confirmation =
        confirmPassword.value
    }

    const response = await $api<any>(
      '/my/profile',
      {
        method: 'PUT',
        body: payload
      }
    )

    if (
      response?.success === false ||
      response?.status === 'error'
    ) {
      throw new Error(
        response?.message ||
        'رفض الخادم حفظ التعديلات.'
      )
    }

    const data = supplierRecord<any>(
      response
    )

    const updated =
      data?.user &&
      typeof data.user === 'object'
        ? data.user
        : data

    // مزامنة البيانات مع المتجر والحساب
    auth.setUser({
      ...auth.user,

      ...(
        updated &&
        typeof updated === 'object'
          ? updated
          : {}
      ),

      name: payload.name,
      phone: payload.phone,

      store:
        updated?.store ??
        auth.user?.store,

      isVerified: Boolean(
        updated?.email_verified ||
        updated?.email_verified_at ||
        updated?.isVerified ||
        auth.user?.isVerified
      )
    })

    // الرقم الجديد لا يعتبر موثقًا تلقائيًا
    if (
      payload.phone !==
      savedPhone.value
    ) {
      phoneVerified.value = null
    }

    savedName.value = payload.name
    savedPhone.value = payload.phone

    clearPasswords()
    clearErrors()

    success.value =
      'تم حفظ بيانات الحساب بنجاح.'
  } catch (err: any) {
    failure.value = supplierError(
      err,
      err?.message ||
      'تعذر حفظ بيانات الحساب.'
    )

    // أخطاء التحقق القادمة من Laravel
    const fieldMap: Record<string, string> = {
      name: 'name',
      phone: 'phone',
      current_password: 'currentPassword',
      password: 'newPassword',
      password_confirmation: 'confirmPassword'
    }

    for (
      const [field, messages]
      of Object.entries(
        err?.data?.errors || {}
      )
    ) {
      const target = fieldMap[field]

      if (!target) continue

      errors[target] =
        Array.isArray(messages)
          ? String(messages[0])
          : String(messages)
    }
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  void loadProfile()
})

// حماية بيانات كلمة المرور عند مغادرة الصفحة
onBeforeUnmount(clearPasswords)
</script>

<template>
  <div
    dir="rtl"
    class="mx-auto flex w-full max-w-[1100px]
           min-w-0 flex-col gap-6 pb-8"
  >
    <!-- عنوان الصفحة -->
    <header class="py-1">
      <h1
        class="text-xl font-extrabold
               text-solar-text-heading
               sm:text-2xl"
      >
        الملف الشخصي للمورد
      </h1>

      <p
        class="mt-2 text-xs leading-6
               text-solar-text-secondary
               sm:text-sm"
      >
        إدارة بيانات الحساب الشخصية وإعدادات الأمان
        الخاصة بمدير المتجر
      </p>
    </header>

    <!-- تحميل البيانات -->
    <div
      v-if="loading && !loaded"
      class="flex min-h-40 items-center
             justify-center gap-3 rounded-2xl
             border border-solar-border-card
             bg-solar-bg-card text-sm
             text-solar-text-secondary"
    >
      <RefreshCw
        class="size-5 animate-spin
               text-solar-status-info"
        aria-hidden="true"
      />

      جارٍ تحميل الملف الشخصي...
    </div>

    <form
      v-else
      class="flex flex-col gap-6"
      novalidate
      @submit.prevent="saveProfile"
    >
      <!-- البطاقة الأولى: البيانات الشخصية -->
      <section
        class="overflow-hidden rounded-2xl
               border border-solar-border-card/70
               bg-solar-bg-card shadow-card"
      >
        <!-- عنوان البطاقة -->
        <div
          class="flex items-center gap-3
                 border-b border-solar-border-card/60
                 px-5 py-4 sm:px-6"
        >
          <!-- أيقونة المستخدم الزرقاء -->
          <div
            class="flex size-10 shrink-0
                   items-center justify-center
                   rounded-xl
                   bg-solar-status-info-bg
                   text-solar-status-info-text"
          >
            <UserRound
              class="size-5"
              :stroke-width="1.9"
              aria-hidden="true"
            />
          </div>

          <div>
            <h2
              class="text-sm font-extrabold
                     text-solar-text-heading
                     sm:text-base"
            >
              البيانات الشخصية
            </h2>

            <p
              class="mt-1 text-[11px]
                     text-solar-text-muted"
            >
              معلومات الهوية والتواصل المسجلة لدى إدارة المنصة
            </p>
          </div>
        </div>

        <!-- حقول البيانات الشخصية -->
        <div
          class="grid gap-x-6 gap-y-5
                 px-5 py-6 sm:px-6
                 md:grid-cols-2"
        >
          <!-- الاسم الكامل -->
          <div class="md:col-span-2">
            <label
              for="supplier-full-name"
              class="mb-2 flex items-center gap-1.5
                     text-xs font-bold
                     text-solar-text-heading"
            >
              <UserRound
                class="size-4 text-solar-status-info"
                aria-hidden="true"
              />

              الاسم الكامل

              <span
                class="text-solar-status-danger"
              >
                *
              </span>
            </label>

            <input
              id="supplier-full-name"
              v-model="name"
              type="text"
              autocomplete="name"
              maxlength="255"
              class="solar-input !min-h-10"
              :class="
                errors.name
                  ? '!border-solar-status-danger'
                  : ''
              "
              placeholder="أدخل الاسم الكامل"
              :disabled="busy"
              :aria-invalid="!!errors.name"
              aria-describedby="name-error"
            />

            <p
              v-if="errors.name"
              id="name-error"
              class="mt-1.5 text-xs
                     text-solar-status-danger-text"
              role="alert"
            >
              {{ errors.name }}
            </p>
          </div>

          <!-- البريد الإلكتروني -->
          <div class="min-w-0">
            <div
              class="mb-2 flex flex-wrap
                     items-center justify-between
                     gap-2"
            >
              <label
                for="supplier-email"
                class="flex items-center gap-1.5
                       text-xs font-bold
                       text-solar-text-heading"
              >
                <AtSign
                  class="size-4
                         text-solar-status-info"
                  aria-hidden="true"
                />

                البريد الإلكتروني

                <span
                  class="text-solar-status-danger"
                >
                  *
                </span>
              </label>

              <!-- بريد موثق -->
              <span
                v-if="emailVerified"
                class="inline-flex items-center
                       gap-1 rounded-md
                       bg-solar-status-success-bg
                       px-2 py-0.5 text-[10px]
                       font-bold
                       text-solar-status-success-text"
              >
                <CheckCircle2
                  class="size-3.5"
                  aria-hidden="true"
                />

                موثّق
              </span>

              <!-- بريد غير موثق -->
              <span
                v-else
                class="inline-flex items-center
                       gap-1 rounded-md
                       bg-solar-status-warning-bg
                       px-2 py-0.5 text-[10px]
                       font-bold
                       text-solar-status-warning-text"
              >
                <ShieldAlert
                  class="size-3.5"
                  aria-hidden="true"
                />

                غير موثّق
              </span>
            </div>

            <input
              id="supplier-email"
              :value="email"
              type="email"
              dir="ltr"
              autocomplete="email"
              readonly
              class="solar-input !min-h-10
                     !bg-solar-bg-subtle
                     text-left"
              title="لا يمكن تغيير البريد الإلكتروني من هذه الصفحة"
            />
          </div>

          <!-- رقم الجوال -->
          <div class="min-w-0">
            <div
              class="mb-2 flex flex-wrap
                     items-center justify-between
                     gap-2"
            >
              <label
                for="supplier-phone"
                class="flex items-center gap-1.5
                       text-xs font-bold
                       text-solar-text-heading"
              >
                <Phone
                  class="size-4 text-emerald-600
                         dark:text-emerald-400"
                  aria-hidden="true"
                />

                رقم الجوال

                <span
                  class="text-solar-status-danger"
                >
                  *
                </span>
              </label>

              <!-- الجوال موثق -->
              <span
                v-if="phoneVerified === true"
                class="inline-flex items-center
                       gap-1 rounded-md
                       bg-solar-status-success-bg
                       px-2 py-0.5 text-[10px]
                       font-bold
                       text-solar-status-success-text"
              >
                <CheckCircle2
                  class="size-3.5"
                  aria-hidden="true"
                />

                موثّق
              </span>

              <!-- الجوال غير موثق -->
              <span
                v-else-if="phoneVerified === false"
                class="inline-flex items-center
                       gap-1 rounded-md
                       bg-solar-status-warning-bg
                       px-2 py-0.5 text-[10px]
                       font-bold
                       text-solar-status-warning-text"
              >
                <ShieldAlert
                  class="size-3.5"
                  aria-hidden="true"
                />

                غير موثّق
              </span>

              <!-- حالة غير معروفة -->
              <span
                v-else
                class="inline-flex items-center
                       gap-1 rounded-md
                       bg-solar-bg-subtle
                       px-2 py-0.5 text-[10px]
                       font-semibold
                       text-solar-text-secondary"
              >
                <Phone
                  class="size-3"
                  aria-hidden="true"
                />

                مسجّل
              </span>
            </div>

            <input
              id="supplier-phone"
              v-model="phone"
              type="tel"
              dir="ltr"
              autocomplete="tel"
              maxlength="20"
              class="solar-input !min-h-10
                     text-left"
              :class="
                errors.phone
                  ? '!border-solar-status-danger'
                  : ''
              "
              placeholder="+967 7XXXXXXXX"
              :disabled="busy"
              :aria-invalid="!!errors.phone"
              aria-describedby="phone-error"
            />

            <p
              v-if="errors.phone"
              id="phone-error"
              class="mt-1.5 text-xs
                     text-solar-status-danger-text"
              role="alert"
            >
              {{ errors.phone }}
            </p>
          </div>
        </div>
      </section>

      <!-- البطاقة الثانية: أمان الحساب -->
      <section
        class="overflow-hidden rounded-2xl
               border border-solar-border-card/70
               bg-solar-bg-card shadow-card"
      >
        <!-- عنوان بطاقة الأمان -->
        <div
          class="flex items-center gap-3
                 border-b border-solar-border-card/60
                 px-5 py-4 sm:px-6"
        >
          <!-- أيقونة القفل الذهبية -->
          <div
            class="flex size-10 shrink-0
                   items-center justify-center
                   rounded-xl
                   bg-solar-status-warning-bg
                   text-solar-status-warning-text"
          >
            <LockKeyhole
              class="size-5"
              :stroke-width="1.9"
              aria-hidden="true"
            />
          </div>

          <div>
            <h2
              class="text-sm font-extrabold
                     text-solar-text-heading
                     sm:text-base"
            >
              أمان الحساب وتغيير كلمة المرور
            </h2>

            <p
              class="mt-1 text-[11px]
                     text-solar-text-muted"
            >
              اترك الحقول فارغة إذا كنت لا ترغب
              بتغيير كلمة المرور
            </p>
          </div>
        </div>

        <!-- حقول كلمة المرور -->
        <div
          class="grid gap-x-6 gap-y-5
                 px-5 py-6 sm:px-6
                 md:grid-cols-2"
        >
          <!-- كلمة المرور الحالية -->
          <div class="min-w-0">
            <label
              for="supplier-current-password"
              class="mb-2 flex items-center gap-1.5
                     text-xs font-bold
                     text-solar-text-heading"
            >
              <LockKeyhole
                class="size-4 text-amber-600
                       dark:text-amber-400"
                aria-hidden="true"
              />

              كلمة المرور الحالية

              <span
                v-if="passwordRequested"
                class="text-solar-status-danger"
              >
                *
              </span>
            </label>

            <div class="relative">
              <input
                id="supplier-current-password"
                v-model="currentPassword"
                :type="
                  showPasswords
                    ? 'text'
                    : 'password'
                "
                autocomplete="current-password"
                class="solar-input !min-h-10
                       !pl-11"
                :class="
                  errors.currentPassword
                    ? '!border-solar-status-danger'
                    : ''
                "
                placeholder="أدخل كلمة المرور الحالية"
                :disabled="busy"
                :aria-invalid="
                  !!errors.currentPassword
                "
                aria-describedby="current-password-error"
              />

              <!-- إظهار وإخفاء كلمات المرور -->
              <button
                type="button"
                class="absolute left-2 top-1/2
                       flex size-8 -translate-y-1/2
                       items-center justify-center
                       rounded-md text-solar-text-muted
                       hover:bg-solar-bg-subtle
                       hover:text-solar-status-info"
                :aria-label="
                  showPasswords
                    ? 'إخفاء كلمات المرور'
                    : 'إظهار كلمات المرور'
                "
                :aria-pressed="showPasswords"
                @click="
                  showPasswords = !showPasswords
                "
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
              </button>
            </div>

            <p
              v-if="errors.currentPassword"
              id="current-password-error"
              class="mt-1.5 text-xs
                     text-solar-status-danger-text"
              role="alert"
            >
              {{ errors.currentPassword }}
            </p>
          </div>

          <div
            class="hidden md:block"
            aria-hidden="true"
          />

          <!-- كلمة المرور الجديدة -->
          <div class="min-w-0">
            <label
              for="supplier-new-password"
              class="mb-2 flex items-center gap-1.5
                     text-xs font-bold
                     text-solar-text-heading"
            >
              <KeyRound
                class="size-4 text-amber-600
                       dark:text-amber-400"
                aria-hidden="true"
              />

              كلمة المرور الجديدة

              <span
                v-if="passwordRequested"
                class="text-solar-status-danger"
              >
                *
              </span>
            </label>

            <input
              id="supplier-new-password"
              v-model="newPassword"
              :type="
                showPasswords
                  ? 'text'
                  : 'password'
              "
              autocomplete="new-password"
              class="solar-input !min-h-10"
              :class="
                errors.newPassword
                  ? '!border-solar-status-danger'
                  : ''
              "
              placeholder="أدخل كلمة مرور جديدة قوية"
              :disabled="busy"
              :aria-invalid="
                !!errors.newPassword
              "
              aria-describedby="new-password-error"
            />

            <p
              v-if="errors.newPassword"
              id="new-password-error"
              class="mt-1.5 text-xs
                     text-solar-status-danger-text"
              role="alert"
            >
              {{ errors.newPassword }}
            </p>
          </div>

          <!-- تأكيد كلمة المرور -->
          <div class="min-w-0">
            <label
              for="supplier-confirm-password"
              class="mb-2 flex items-center gap-1.5
                     text-xs font-bold
                     text-solar-text-heading"
            >
              <ShieldCheck
                class="size-4 text-emerald-600
                       dark:text-emerald-400"
                aria-hidden="true"
              />

              تأكيد كلمة المرور الجديدة

              <span
                v-if="passwordRequested"
                class="text-solar-status-danger"
              >
                *
              </span>
            </label>

            <input
              id="supplier-confirm-password"
              v-model="confirmPassword"
              :type="
                showPasswords
                  ? 'text'
                  : 'password'
              "
              autocomplete="new-password"
              class="solar-input !min-h-10"
              :class="
                errors.confirmPassword
                  ? '!border-solar-status-danger'
                  : ''
              "
              placeholder="أعد إدخال كلمة المرور"
              :disabled="busy"
              :aria-invalid="
                !!errors.confirmPassword
              "
              aria-describedby="confirm-password-error"
            />

            <p
              v-if="errors.confirmPassword"
              id="confirm-password-error"
              class="mt-1.5 text-xs
                     text-solar-status-danger-text"
              role="alert"
            >
              {{ errors.confirmPassword }}
            </p>
          </div>

          <!-- تعليمات الأمان -->
          <div
            class="flex items-start gap-2.5
                   rounded-xl border
                   border-solar-border-card/60
                   bg-solar-bg-subtle/70
                   p-3.5 md:col-span-2"
          >
            <Info
              class="mt-0.5 size-4 shrink-0
                     text-solar-status-warning"
              aria-hidden="true"
            />

            <p
              class="text-[11px] leading-6
                     text-solar-text-secondary"
            >
              يجب أن تتكون كلمة المرور من 8 أحرف
              على الأقل، وتحتوي على حرف كبير
              وحرف صغير ورقم.
            </p>
          </div>
        </div>
      </section>

      <!-- رسالة الخطأ -->
      <div
        v-if="failure"
        role="alert"
        class="flex items-start gap-2.5
               rounded-xl border
               border-solar-status-danger/30
               bg-solar-status-danger-bg
               p-4 text-sm
               text-solar-status-danger-text"
      >
        <ShieldAlert
          class="mt-0.5 size-5 shrink-0"
          aria-hidden="true"
        />

        <p class="flex-1">
          {{ failure }}
        </p>

        <button
          type="button"
          aria-label="إغلاق رسالة الخطأ"
          @click="failure = ''"
        >
          <X class="size-4" />
        </button>
      </div>

      <!-- رسالة النجاح -->
      <div
        v-if="success"
        role="status"
        class="flex items-center gap-2.5
               rounded-xl border
               border-solar-status-success/30
               bg-solar-status-success-bg
               p-4 text-sm
               text-solar-status-success-text"
      >
        <CheckCircle2
          class="size-5 shrink-0"
          aria-hidden="true"
        />

        {{ success }}
      </div>

      <!-- أزرار الحفظ والإلغاء -->
      <div
        class="flex flex-wrap items-center
               gap-3 pt-1"
      >
        <button
          type="submit"
          class="btn-dark !min-h-11
                 !min-w-[170px] !gap-2.5"
          :disabled="
            busy || !hasChanges
          "
        >
          <RefreshCw
            v-if="saving"
            class="size-4 animate-spin"
            aria-hidden="true"
          />

          <Check
            v-else
            class="size-4 text-solar-yellow"
            aria-hidden="true"
          />

          {{
            saving
              ? 'جارٍ حفظ التعديلات...'
              : 'حفظ التعديلات'
          }}
        </button>

        <button
          type="button"
          class="btn-outline !min-h-11 !px-5"
          :disabled="
            busy || !hasChanges
          "
          @click="resetForm"
        >
          <X
            class="size-4 text-solar-text-muted"
            aria-hidden="true"
          />

          إلغاء
        </button>
      </div>
    </form>
  </div>
</template>
