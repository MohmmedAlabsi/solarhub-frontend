
<script setup lang="ts">
import {
  AlignRight,
  BadgeCheck,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  FileBadge2,
  FileText,
  Hash,
  Info,
  LockKeyhole,
  MapPin,
  MapPinned,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Store,
  Upload,
  X
} from 'lucide-vue-next'
import CommonMapLocationModal from '~/components/common/MapLocationModal.vue'
import { useAuthStore } from '~/stores/auth'
import { supplierError } from '~/utils/supplierPortal'

definePageMeta({ layout: 'supplier' })
useSeoMeta({ title: 'بيانات المتجر | SolarHub' })

interface StoreForm {
  company_name: string
  store_type: string
  bio: string
  whatsapp_number: string
  address_details: string
  location_coordinates: string
  commercial_registry: string
  tax_number: string
  company_logo_url: string
  commercial_file_url: string
}

const auth = useAuthStore()
const { $api } = useNuxtApp()
const config = useRuntimeConfig()
const { governorates, loadGovernorates, getGovernorateIdByName } = useGovernorates()

const loading = ref(true)
const loaded = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref('')
const uploadNotice = ref('')
const showMap = ref(false)
const storeId = ref<number | null>(null)
const governorateId = ref<number | null>(null)
const savedGovernorateId = ref<number | null>(null)
const logoFile = ref<File | null>(null)
const documentFile = ref<File | null>(null)
const logoPreview = ref('')
const inputKey = ref(0)

const form = reactive<StoreForm>({
  company_name: '',
  store_type: 'retailer',
  bio: '',
  whatsapp_number: '',
  address_details: '',
  location_coordinates: '',
  commercial_registry: '',
  tax_number: '',
  company_logo_url: '',
  commercial_file_url: ''
})
const savedForm = ref<StoreForm | null>(null)
const busy = computed(() => loading.value || saving.value)
const storeTypes = ['retailer', 'wholesaler', 'authorized_agent']
const accountGovernorate = computed(() => {
  const value = auth.user?.governorate
  return typeof value === 'string' ? value : value?.name_ar || ''
})

// روابط Supabase والروابط المحلية، مع منع المسارات غير الآمنة.
function assetUrl(value: unknown): string {
  if (typeof value !== 'string') return ''
  const path = value.trim()
  if (!path || path.includes('..') || path.includes('\\')) return ''
  if (/^https?:\/\//i.test(path)) return path
  if (path.startsWith('//')) return ''
  const baseUrl = String(config.public.apiBaseUrl || config.public.apiBase || '')
  if (!/^https?:\/\//i.test(baseUrl)) return ''
  const origin = baseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '')
  const clean = path.replace(/^\/+/, '').replace(/^public\//, '').replace(/^storage\//, '')
  return `${origin}/storage/${clean}`
}

const logoUrl = computed(() => logoPreview.value || assetUrl(form.company_logo_url))
const documentUrl = computed(() => assetUrl(form.commercial_file_url))
const documentName = computed(() => {
  if (documentFile.value) return documentFile.value.name
  if (!form.commercial_file_url) return 'لم يتم إرفاق ملف بعد'
  const name = form.commercial_file_url.split('?')[0]?.split('/').pop()
  return name || 'ملف السجل التجاري.pdf'
})
const hasChanges = computed(() =>
  JSON.stringify(form) !== JSON.stringify(savedForm.value) ||
  governorateId.value !== savedGovernorateId.value ||
  Boolean(logoFile.value || documentFile.value)
)

function unwrap(response: any): any {
  const payload = response?.data ?? response
  return payload?.store ?? payload
}

function applyStore(raw: any) {
  const data = { ...(auth.user?.store || {}), ...(raw || {}) }
  Object.assign(form, {
    company_name: String(data.company_name || ''),
    store_type: String(data.store_type || 'retailer'),
    bio: String(data.bio || ''),
    whatsapp_number: String(data.whatsapp_number || ''),
    address_details: String(data.address_details || ''),
    location_coordinates: typeof data.location_coordinates === 'string'
      ? data.location_coordinates : '',
    commercial_registry: String(data.commercial_registry || ''),
    tax_number: String(data.tax_number || ''),
    company_logo_url: String(data.company_logo_url || data.company_logo_path || ''),
    commercial_file_url: String(data.commercial_file_url || data.commercial_file_path || '')
  })
  savedForm.value = { ...form }
}

function clearUploads() {
  if (logoPreview.value) URL.revokeObjectURL(logoPreview.value)
  logoPreview.value = ''
  logoFile.value = null
  documentFile.value = null
  inputKey.value++
}

async function loadStore() {
  if (saving.value) return
  loading.value = true
  loaded.value = false
  error.value = ''
  success.value = ''
  uploadNotice.value = ''
  try {
    if (!auth.user?.store?.id && auth.token) await auth.initAuth()
    const id = Number(auth.user?.store?.id)
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error('لم يتم العثور على متجر مرتبط بحساب المورد.')
    }
    storeId.value = id
    const [response] = await Promise.all([
      $api<any>(`/stores/${id}`),
      loadGovernorates()
    ])
    if (response?.success === false || response?.status === 'error') {
      throw new Error(response?.message || 'رفض الخادم تحميل بيانات المتجر.')
    }
    const data = unwrap(response)
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('استجابة بيانات المتجر غير صالحة.')
    }
    applyStore(data)
    const directId = Number(data.governorate_id || auth.user?.store?.governorate_id)
    const name = String(accountGovernorate.value || data.governorate_name || '')
    governorateId.value = Number.isSafeInteger(directId) && directId > 0
      ? directId : getGovernorateIdByName(name)
    savedGovernorateId.value = governorateId.value
    clearUploads()
    loaded.value = true
  } catch (err: any) {
    error.value = supplierError(err, err?.message || 'تعذر تحميل بيانات المتجر.')
  } finally {
    loading.value = false
  }
}

function pickFile(event: Event, type: 'logo' | 'document') {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const logo = type === 'logo'
  const valid = logo
    ? ['image/png', 'image/jpeg', 'image/webp'].includes(file.type)
    : file.type === 'application/pdf'
  const max = (logo ? 2 : 5) * 1024 * 1024
  if (!valid || file.size > max) {
    error.value = logo
      ? 'الشعار يجب أن يكون PNG أو JPG أو WEBP، بحجم أقصاه 2MB.'
      : 'ملف السجل التجاري يجب أن يكون PDF، بحجم أقصاه 5MB.'
    input.value = ''
    return
  }
  error.value = ''
  if (logo) {
    if (logoPreview.value) URL.revokeObjectURL(logoPreview.value)
    logoPreview.value = URL.createObjectURL(file)
    logoFile.value = file
  } else {
    documentFile.value = file
  }
}

function chooseLocation(location: {
  address: string
  lat: number
  lng: number
  governorate?: string
}) {
  form.address_details = location.address
  form.location_coordinates = `POINT(${location.lng} ${location.lat})`
  if (location.governorate) {
    const id = getGovernorateIdByName(location.governorate)
    if (id) governorateId.value = id
  }
  showMap.value = false
}

function cancelChanges() {
  if (savedForm.value) Object.assign(form, savedForm.value)
  governorateId.value = savedGovernorateId.value
  error.value = ''
  success.value = ''
  uploadNotice.value = ''
  clearUploads()
}

async function saveStore() {
  if (busy.value || !storeId.value || !hasChanges.value) return
  error.value = ''
  success.value = ''
  uploadNotice.value = ''
  if (form.company_name.trim().length < 3) {
    error.value = 'اسم المتجر يجب أن يتكون من 3 أحرف على الأقل.'
    return
  }
  if (!form.address_details.trim()) {
    error.value = 'العنوان التفصيلي للمتجر مطلوب.'
    return
  }
  if (form.whatsapp_number && !/^\+?[\d\s-]{7,20}$/.test(form.whatsapp_number)) {
    error.value = 'رقم الواتساب غير صالح.'
    return
  }

  saving.value = true
  let storeSaved = false
  const hasUploads = Boolean(logoFile.value || documentFile.value)
  try {
    const payload = {
      company_name: form.company_name.trim(),
      store_type: form.store_type,
      bio: form.bio.trim(),
      whatsapp_number: form.whatsapp_number.trim(),
      address_details: form.address_details.trim(),
      ...(form.location_coordinates ? { location_coordinates: form.location_coordinates } : {})
    }

    // تغيير المحافظة وحده لا يستدعي تعديل المتجر.
    const storeChanged = Object.entries(payload).some(([key, value]) =>
      String((savedForm.value as any)?.[key] ?? '') !== String(value)
    ) || hasUploads

    if (storeChanged) {
      let updated: any
      if (hasUploads) {
        // هذا المسار مشروط بدعم StoreController لحقول الملفات.
        const data = new FormData()
        data.append('_method', 'PUT')
        Object.entries(payload).forEach(([key, value]) => data.append(key, String(value)))
        if (logoFile.value) data.append('company_logo', logoFile.value)
        if (documentFile.value) data.append('commercial_file', documentFile.value)
        const response = await $api<any>(`/stores/${storeId.value}`, {
          method: 'POST',
          body: data
        })
        if (response?.success === false || response?.status === 'error') {
          throw new Error(response?.message || 'رفض الخادم حفظ بيانات المتجر.')
        }
        updated = unwrap(response)
        uploadNotice.value = 'تم إرسال المرفقات؛ تأكد من ظهورها بعد إعادة التحميل. دعم الرفع يعتمد على Laravel.'
      } else {
        const result = await auth.updateStore(storeId.value, payload)
        if (!result.success) {
          throw new Error(result.error || 'تعذر حفظ بيانات المتجر.')
        }
        updated = result.store
      }
      const merged = { ...form, ...(updated && typeof updated === 'object' ? updated : {}) }
      applyStore(merged)
      if (auth.user) {
        auth.setUser({
          ...auth.user,
          store: { ...(auth.user.store || {}), id: storeId.value, ...merged }
        })
      }
      clearUploads()
      storeSaved = true
    }

    if (governorateId.value !== savedGovernorateId.value && governorateId.value !== null) {
      const previousStore = auth.user?.store
      const result = await auth.updateProfile({
        name: auth.user?.name,
        phone: auth.user?.phone,
        governorate_id: governorateId.value
      })
      if (!result.success) {
        throw new Error(result.error || 'تعذر تحديث المحافظة.')
      }
      const name = governorates.value.find(g => g.id === governorateId.value)?.name_ar || accountGovernorate.value
      if (auth.user) auth.setUser({ ...auth.user, store: previousStore, governorate: name })
      savedGovernorateId.value = governorateId.value
    }
    success.value = 'تم حفظ التغييرات بنجاح.'
  } catch (err: any) {
    error.value = storeSaved
      ? `تم حفظ بيانات المتجر، لكن تعذر تحديث المحافظة: ${supplierError(err)}`
      : supplierError(err, err?.message || 'تعذر حفظ بيانات المتجر.')
  } finally {
    saving.value = false
  }
}

onMounted(() => { void loadStore() })
onBeforeUnmount(() => { clearUploads() })
</script>

<template>
  <div dir="rtl" class="mx-auto flex w-full max-w-[1100px] min-w-0 flex-col gap-5 pb-5">
    <!-- رأس الصفحة مطابق لتوزيع الصورة الأصلية -->
    <header class="flex items-start gap-3 border-b border-solar-border-card pb-5">
      <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-solar-yellow-tint text-solar-navy-dark dark:bg-amber-950/30 dark:text-solar-yellow">
        <Store class="size-5" :stroke-width="1.9" aria-hidden="true" />
      </span>
      <div>
        <h1 class="text-xl font-extrabold text-solar-text-heading sm:text-2xl">بيانات المتجر</h1>
        <p class="mt-1.5 text-xs leading-6 text-solar-text-secondary sm:text-sm">
          إدارة وتحديث البيانات الرسمية للمنشأة والمتجر التجاري في منصة SolarHub
        </p>
      </div>
    </header>

    <!-- الرسائل -->
    <div v-if="error" role="alert" class="flex items-start gap-2.5 rounded-xl border border-solar-status-danger/30 bg-solar-status-danger-bg p-4 text-sm text-solar-status-danger-text">
      <Info class="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <p class="min-w-0 flex-1">{{ error }}</p>
      <button type="button" aria-label="إغلاق رسالة الخطأ" @click="error = ''"><X class="size-4" /></button>
    </div>
    <div v-if="success" role="status" class="flex items-center gap-2 rounded-xl border border-solar-status-success/30 bg-solar-status-success-bg p-4 text-sm text-solar-status-success-text">
      <CheckCircle2 class="size-5 shrink-0" aria-hidden="true" />{{ success }}
    </div>
    <div v-if="uploadNotice" role="status" class="flex items-start gap-2 rounded-xl border border-solar-status-warning/30 bg-solar-status-warning-bg p-4 text-xs leading-6 text-solar-status-warning-text">
      <Info class="mt-0.5 size-4 shrink-0" aria-hidden="true" />{{ uploadNotice }}
    </div>

    <div v-if="loading" class="solar-card flex min-h-60 items-center justify-center gap-3 text-sm text-solar-text-secondary">
      <RefreshCw class="size-5 animate-spin text-solar-status-info" aria-hidden="true" />
      جارٍ تحميل بيانات المتجر...
    </div>
    <div v-else-if="!loaded" class="solar-card flex flex-col items-start gap-4">
      <p class="text-sm text-solar-text-secondary">تعذر عرض بيانات المتجر. تحقق من حساب المورد وصلاحياته.</p>
      <button type="button" class="btn-outline" @click="loadStore"><RefreshCw class="size-4 text-solar-status-info" /> إعادة المحاولة</button>
    </div>

    <form v-else class="flex flex-col gap-5" @submit.prevent="saveStore">
      <!-- 1. هوية المتجر -->
      <section class="rounded-2xl border border-solar-border-card/70 bg-solar-bg-card p-5 shadow-card sm:p-7">
        <div class="flex items-center gap-3 border-b border-solar-border-card/70 pb-4">
          <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-yellow-tint text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
            <Building2 class="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 class="text-sm font-extrabold text-solar-text-heading sm:text-base">هوية المتجر</h2>
            <p class="mt-1 text-[11px] text-solar-text-muted">الاسم التجاري الرسمي والشعار والنبذة التعريفية المعتمدة</p>
          </div>
        </div>

        <!-- في RTL يظهر الشعار يمينًا والحقول يسارًا -->
        <div class="mt-5 grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
          <!-- شعار المتجر -->
          <div class="min-w-0">
            <p class="mb-2 flex items-center gap-1.5 text-xs font-bold text-solar-text-heading">
              <Camera class="size-3.5 text-solar-status-info" aria-hidden="true" /> شعار المتجر الرسمي
            </p>
            <div class="flex min-h-[216px] flex-col items-center justify-center gap-3 rounded-xl border border-[#dfe4f4] bg-[#f0f2ff] p-4 text-center dark:border-solar-border-card dark:bg-solar-bg-subtle">
              <div class="flex size-[92px] items-center justify-center overflow-hidden rounded-xl border border-white/80 bg-white shadow-sm">
                <img v-if="logoUrl" :src="logoUrl" alt="شعار المتجر" class="size-full object-contain p-2" />
                <Store v-else class="size-10 text-solar-navy" :stroke-width="1.5" aria-hidden="true" />
              </div>
              <label class="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-solar-border-card bg-solar-bg-card px-3 py-2 text-xs font-bold text-solar-text-heading transition-colors hover:border-solar-status-info hover:text-solar-status-info" :class="{ 'pointer-events-none opacity-50': busy }">
                <Camera class="size-4 text-solar-status-info" aria-hidden="true" /> تغيير الشعار
                <input :key="`logo-${inputKey}`" type="file" accept="image/png,image/jpeg,image/webp" class="sr-only" :disabled="busy" @change="pickFile($event, 'logo')" />
              </label>
              <p v-if="logoFile" class="max-w-full break-all text-[10px] font-semibold text-solar-text-body">{{ logoFile.name }}</p>
              <p class="text-[10px] leading-5 text-solar-text-muted">PNG أو JPG أو WEBP — حتى 2MB</p>
            </div>
          </div>

          <!-- الحقول الأساسية -->
          <div class="grid min-w-0 content-start gap-4">
            <div>
              <label for="store-company" class="mb-2 flex items-center gap-1.5 text-xs font-bold text-solar-text-heading">
                <Building2 class="size-3.5 text-solar-status-info" aria-hidden="true" /> اسم المتجر / الشركة <span class="text-solar-status-danger">*</span>
              </label>
              <input id="store-company" v-model="form.company_name" required minlength="3" maxlength="255" :disabled="busy" class="solar-input !bg-[#f0f2ff] dark:!bg-solar-bg-subtle" placeholder="الاسم التجاري المعتمد" />
            </div>
            <div>
              <label for="store-type" class="mb-2 flex items-center gap-1.5 text-xs font-bold text-solar-text-heading">
                <Store class="size-3.5 text-amber-600" aria-hidden="true" /> نوع وتصنيف المتجر <span class="text-solar-status-danger">*</span>
              </label>
              <div class="relative">
                <select id="store-type" v-model="form.store_type" required :disabled="busy" class="solar-input appearance-none !bg-[#f0f2ff] pl-10 dark:!bg-solar-bg-subtle">
                  <option v-if="!storeTypes.includes(form.store_type)" :value="form.store_type">{{ form.store_type }} (القيمة الحالية)</option>
                  <option value="retailer">متجر تجزئة</option>
                  <option value="wholesaler">مورد جملة</option>
                  <option value="authorized_agent">وكيل معتمد وموزع رسمي</option>
                </select>
                <ChevronDown class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted" aria-hidden="true" />
              </div>
            </div>
            <div>
              <div class="mb-2 flex items-center justify-between gap-2">
                <label for="store-bio" class="flex items-center gap-1.5 text-xs font-bold text-solar-text-heading">
                  <AlignRight class="size-3.5 text-solar-status-info" aria-hidden="true" /> نبذة عن المتجر
                </label>
                <span class="text-[10px] tabular-nums text-solar-text-muted">{{ form.bio.length }} / 500 حرف</span>
              </div>
              <textarea id="store-bio" v-model="form.bio" rows="3" maxlength="500" :disabled="busy" class="solar-input min-h-24 resize-y !bg-[#f0f2ff] leading-7 dark:!bg-solar-bg-subtle" placeholder="عرّف العملاء بمنتجات متجرك وخدماته" />
            </div>
          </div>
        </div>
      </section>

      <!-- 2. التواصل والموقع -->
      <section class="rounded-2xl border border-solar-border-card/70 bg-solar-bg-card p-5 shadow-card sm:p-7">
        <div class="flex items-center gap-3 border-b border-solar-border-card/70 pb-4">
          <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-status-info-bg text-solar-status-info-text">
            <MapPinned class="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 class="text-sm font-extrabold text-solar-text-heading sm:text-base">بيانات التواصل والموقع</h2>
            <p class="mt-1 text-[11px] text-solar-text-muted">العناوين الرسمية للمستودعات وقنوات التواصل المباشرة</p>
          </div>
        </div>
        <div class="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label for="store-whatsapp" class="mb-2 flex items-center gap-1.5 text-xs font-bold text-solar-text-heading">
              <MessageCircle class="size-4 text-emerald-600" aria-hidden="true" /> رقم الواتساب المعتمد للمتجر
            </label>
            <input id="store-whatsapp" v-model="form.whatsapp_number" type="tel" dir="ltr" maxlength="20" :disabled="busy" class="solar-input !bg-[#f0f2ff] text-left dark:!bg-solar-bg-subtle" placeholder="+967 7XXXXXXXX" />
          </div>
          <div>
            <label for="store-governorate" class="mb-2 flex items-center gap-1.5 text-xs font-bold text-solar-text-heading">
              <MapPin class="size-4 text-solar-status-info" aria-hidden="true" /> المحافظة / المدينة
            </label>
            <div class="relative">
              <select id="store-governorate" v-model="governorateId" :disabled="busy" class="solar-input appearance-none !bg-[#f0f2ff] pl-10 dark:!bg-solar-bg-subtle">
                <option :value="null">{{ accountGovernorate || 'اختر المحافظة' }}</option>
                <option v-for="gov in governorates" :key="gov.id" :value="gov.id">{{ gov.name_ar }}</option>
              </select>
              <ChevronDown class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted" aria-hidden="true" />
            </div>
          </div>
          <div class="md:col-span-2">
            <label for="store-address" class="mb-2 flex items-center gap-1.5 text-xs font-bold text-solar-text-heading">
              <MapPinned class="size-4 text-solar-status-info" aria-hidden="true" /> العنوان التفصيلي للمتجر والمستودع <span class="text-solar-status-danger">*</span>
            </label>
            <div class="flex flex-col gap-2 sm:flex-row">
              <input id="store-address" v-model="form.address_details" required maxlength="500" :disabled="busy" class="solar-input min-w-0 flex-1 !bg-[#f0f2ff] dark:!bg-solar-bg-subtle" placeholder="المدينة - الشارع - الحي - المبنى" />
              <button type="button" class="btn-outline shrink-0 !px-3 !py-2.5 !text-xs" :disabled="busy" @click="showMap = true">
                <MapPin class="size-4 text-solar-status-info" aria-hidden="true" /> تحديد على الخريطة
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. الوثائق والبيانات الرسمية -->
      <section class="rounded-2xl border border-solar-border-card/70 bg-solar-bg-card p-5 shadow-card sm:p-7">
        <div class="flex items-center gap-3 border-b border-solar-border-card/70 pb-4">
          <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-status-success-bg text-solar-status-success-text">
            <ShieldCheck class="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 class="text-sm font-extrabold text-solar-text-heading sm:text-base">الوثائق والبيانات الرسمية</h2>
            <p class="mt-1 text-[11px] text-solar-text-muted">ملف السجل التجاري والبيانات الضريبية المعتمدة</p>
          </div>
        </div>
        <div class="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label for="store-registry" class="mb-2 flex items-center gap-1.5 text-xs font-bold text-solar-text-heading">
              <LockKeyhole class="size-3.5 text-solar-status-info" aria-hidden="true" /> رقم السجل التجاري <span class="text-solar-status-danger">*</span>
            </label>
            <div class="relative">
              <input id="store-registry" :value="form.commercial_registry || 'غير مسجل'" readonly dir="ltr" class="solar-input !bg-[#f0f2ff] pl-10 text-left font-semibold dark:!bg-solar-bg-subtle" />
              <LockKeyhole class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-solar-text-muted" aria-hidden="true" />
            </div>
          </div>
          <div>
            <div class="mb-2 flex flex-wrap items-center gap-2">
              <label for="store-tax" class="flex items-center gap-1.5 text-xs font-bold text-solar-text-heading">
                <Hash class="size-3.5 text-violet-600" aria-hidden="true" /> الرقم الضريبي <span class="text-solar-status-danger">*</span>
              </label>
              <span v-if="form.tax_number" class="inline-flex items-center gap-1 rounded-full bg-solar-status-success-bg px-2 py-0.5 text-[10px] font-bold text-solar-status-success-text">
                <BadgeCheck class="size-3" aria-hidden="true" /> مسجل
              </span>
            </div>
            <input id="store-tax" :value="form.tax_number || 'غير مسجل'" readonly dir="ltr" class="solar-input !bg-[#f0f2ff] text-left font-semibold dark:!bg-solar-bg-subtle" />
          </div>
          <div class="md:col-span-2">
            <label class="mb-2 flex items-center gap-1.5 text-xs font-bold text-solar-text-heading">
              <FileBadge2 class="size-4 text-rose-600" aria-hidden="true" /> ملف السجل التجاري المرفق
            </label>
            <div class="flex flex-col gap-3 rounded-xl border border-[#dfe4f4] bg-[#f0f2ff] p-3.5 dark:border-solar-border-card dark:bg-solar-bg-subtle sm:flex-row sm:items-center">
              <div class="flex min-w-0 flex-1 items-center gap-3">
                <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
                  <FileText class="size-6" aria-hidden="true" />
                </span>
                <div class="min-w-0">
                  <p class="truncate text-xs font-bold text-solar-text-heading">{{ documentName }}</p>
                  <p class="mt-1 text-[10px] text-solar-text-muted">ملف PDF رسمي — حتى 5MB</p>
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <a v-if="documentUrl" :href="documentUrl" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 rounded-lg border border-solar-border-card bg-solar-bg-card px-3 py-2 text-xs font-bold text-solar-text-heading hover:border-solar-status-info">
                  <ExternalLink class="size-3.5 text-solar-status-info" aria-hidden="true" /> عرض الملف
                </a>
                <label class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-solar-border-card bg-solar-bg-card px-3 py-2 text-xs font-bold text-solar-text-heading hover:border-solar-status-info" :class="{ 'pointer-events-none opacity-50': busy }">
                  <Upload class="size-3.5 text-solar-status-info" aria-hidden="true" /> تحديث المرفق
                  <input :key="`document-${inputKey}`" type="file" accept="application/pdf" class="sr-only" :disabled="busy" @change="pickFile($event, 'document')" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- أزرار الحفظ -->
      <div class="flex flex-wrap items-center gap-2.5 pt-1">
        <button type="submit" class="btn-dark !min-h-11 !px-6" :disabled="busy || !hasChanges">
          <RefreshCw v-if="saving" class="size-4 animate-spin" aria-hidden="true" />
          <Check v-else class="size-4 text-solar-yellow" aria-hidden="true" />
          {{ saving ? 'جارٍ حفظ التغييرات...' : 'حفظ التغييرات' }}
        </button>
        <button type="button" class="btn-outline !min-h-11 !px-5" :disabled="busy || !hasChanges" @click="cancelChanges">
          <X class="size-4 text-solar-text-muted" aria-hidden="true" /> إلغاء
        </button>
        <button type="button" class="btn-outline !min-h-11 !px-4" :disabled="busy" @click="loadStore">
          <RefreshCw class="size-4 text-solar-status-info" :class="{ 'animate-spin': loading }" aria-hidden="true" /> تحديث البيانات
        </button>
      </div>
    </form>

    <CommonMapLocationModal
      :is-open="showMap"
      :current-location="form.address_details"
      title="تحديد موقع المتجر"
      subtitle="حدد موقع المتجر أو المستودع على الخريطة"
      @select="chooseLocation"
      @close="showMap = false"
    />
  </div>
</template>
