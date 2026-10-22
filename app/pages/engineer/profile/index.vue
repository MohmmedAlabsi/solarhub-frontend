<script setup lang="ts">
import {
  Award,
  Battery,
  Briefcase,
  Camera,
  CheckCircle2,
  Download,
  Droplets,
  Eye,
  FileCheck,
  FileText,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
  Zap,
} from 'lucide-vue-next'
import AppToast from '~/components/common/AppToast.vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'engineer' })
useSeoMeta({
  title: 'الملف المهني | SolarHub - بوابة المهندسين',
  description: 'إدارة بيانات الاعتماد المهني، التخصصات الهندسية، والشهادات المعتمدة للمهندس.',
})

const { $api } = useNuxtApp()
const config = useRuntimeConfig()
const authStore = useAuthStore()

function resolveUrl(path: string | null | undefined): string {
  if (!path) return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  if (path.startsWith('http')) return path
  const base = config.public.apiBase ? config.public.apiBase.replace(/\/api$/, '') : 'http://127.0.0.1:8000'
  return `${base}/storage/${path.replace(/^\//, '')}`
}

const toastMessage = ref('')
const isLoading = ref(false)
const isSaving = ref(false)
const isUploadingCert = ref(false)

const profileFileInput = ref<HTMLInputElement | null>(null)
const certFileInput = ref<HTMLInputElement | null>(null)

interface CertDisplay {
  id: number
  title: string
  meta: string
  type: string
  url: string
}

const profileData = reactive({
  name: authStore.user?.name || 'م. أحمد الشمري',
  title: 'مهندس استشاري طاقة كهروضوئية',
  licenseNumber: 'SCE-748921',
  experienceYears: '8',
  bio: 'مهندس استشاري معتمد لدى الهيئة السعودية للمهندسين متخصص في تصميم وتدقيق محطات الطاقة الشمسية الكهروضوئية (PV) للقطاعات السكنية والتجارية والصناعية.',
  image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
})

const initialProfile = ref<Record<string, any>>({})

const specialties = ref([
  {
    id: 1,
    title: 'تصميم محطات كهروضوئية متصلة بالشبكة (On-Grid)',
    desc: 'أنظمة متصلة بالشبكة ومطابقة لكود البناء السعودي واشتراطات هيئة تنظيم المياه والكهرباء.',
    icon: Zap,
    active: true,
  },
  {
    id: 2,
    title: 'أنظمة هجينة وبطاريات تخزين (Hybrid & BESS)',
    desc: 'منظومات تخزين الطاقة وأنظمة بطاريات الليثيوم وتكامل المولدات الاحتياطية للأحمال الحرجة.',
    icon: Battery,
    active: true,
  },
  {
    id: 3,
    title: 'محطات ضخ المياه بالطاقة الشمسية (Solar Water Pumping)',
    desc: 'أنظمة العواكس المتغيرة (VFD) للآبار والمشاريع الزراعية وحسابات الهيدروليك وتدفق المياه.',
    icon: Droplets,
    active: true,
  },
  {
    id: 4,
    title: 'فحص الجودة والتوافق مع كود البناء السعودي (SBC Compliance & Inspection)',
    desc: 'اختبارات الأداء الميداني ومنحنيات I-V والفحص الحراري واعتماد شهادات المطابقة.',
    icon: FileCheck,
    active: true,
  },
])

const certificates = ref<CertDisplay[]>([
  {
    id: 1,
    title: 'رخصة مهنية معتمدة - الهيئة السعودية للمهندسين (SCE)',
    meta: 'ملف PDF · تاريخ التوثيق: 15 يناير 2024 - صالحة حتى 2026',
    type: 'pdf',
    url: '#',
  },
  {
    id: 2,
    title: 'شهادة مهندس معتمد في تصميم محطات الطاقة الشمسية الكهروضوئية (PVsyst Professional Certified)',
    meta: 'ملف PDF · تاريخ الاعتماد: 08 مارس 2023 - اعتماد دولي',
    type: 'pdf',
    url: '#',
  },
])

function toggleSpecialty(id: number) {
  const item = specialties.value.find(s => s.id === id)
  if (item) item.active = !item.active
}

function showToast(msg: string) {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 3500)
}

async function loadProfile() {
  try {
    isLoading.value = true
    const res = await $api<any>('/engineer/profile')
    const data = res?.data || res
    if (data) {
      if (data.user?.name) profileData.name = data.user.name
      if (data.license_number) profileData.licenseNumber = data.license_number
      if (data.years_of_experience !== undefined && data.years_of_experience !== null) {
        profileData.experienceYears = String(data.years_of_experience)
      }
      if (data.bio) profileData.bio = data.bio
      if (data.profile_photo_path) profileData.image = resolveUrl(data.profile_photo_path)

      initialProfile.value = { ...profileData }
    }
  } catch (err: any) {
    // Keep fallback defaults if not loaded
  } finally {
    isLoading.value = false
  }
}

async function loadCertificates() {
  try {
    const res = await $api<any>('/engineer/certificates')
    const items = res?.data || res
    if (Array.isArray(items) && items.length > 0) {
      certificates.value = items.map((c: any, index: number) => {
        const path = c.file_path || ''
        const fileName = path.split('/').pop() || `شهادة اعتماد مهني ${index + 1}`
        const isPdf = path.toLowerCase().endsWith('.pdf')
        const createdDate = c.created_at ? new Date(c.created_at).toLocaleDateString('ar-SA') : 'معتمدة'
        return {
          id: c.id,
          title: fileName,
          meta: `${isPdf ? 'ملف PDF' : 'صورة'} · تاريخ الرفع: ${createdDate}`,
          type: isPdf ? 'pdf' : 'image',
          url: resolveUrl(c.file_path),
        }
      })
    }
  } catch (err: any) {
    // Keep initial certificates on error
  }
}

function triggerPhotoSelect() {
  profileFileInput.value?.click()
}

async function onPhotoSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    showToast('حجم الصورة يجب ألا يتجاوز 5 ميجابايت')
    return
  }

  try {
    const formData = new FormData()
    formData.append('_method', 'PUT')
    formData.append('profile_photo', file)
    
    const res = await $api<any>('/engineer/profile', {
      method: 'POST',
      body: formData,
    })
    const data = res?.data || res
    if (data?.profile_photo_path) {
      profileData.image = resolveUrl(data.profile_photo_path)
    }
    showToast('تم تحديث الصورة المهنية بنجاح!')
  } catch (err: any) {
    showToast(err?.data?.message || 'تعذر تحديث الصورة المهنية')
  }
}

function triggerCertUpload() {
  certFileInput.value?.click()
}

async function onCertSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    showToast('حجم الشهادة يجب ألا يتجاوز 5 ميجابايت')
    return
  }

  try {
    isUploadingCert.value = true
    const formData = new FormData()
    formData.append('certificate', file)

    await $api<any>('/engineer/certificates', {
      method: 'POST',
      body: formData,
    })

    showToast('تم رفع الشهادة بنجاح!')
    await loadCertificates()
  } catch (err: any) {
    showToast(err?.data?.message || 'تعذر رفع الشهادة')
  } finally {
    isUploadingCert.value = false
    if (target) target.value = ''
  }
}

async function deleteCertificate(id: number) {
  if (!confirm('هل أنت متأكد من حذف هذه الشهادة؟')) return

  try {
    await $api(`/engineer/certificates/${id}`, {
      method: 'DELETE',
    })
    certificates.value = certificates.value.filter(c => c.id !== id)
    showToast('تم حذف الشهادة بنجاح')
  } catch (err: any) {
    showToast(err?.data?.message || 'تعذر حذف الشهادة')
  }
}

function viewCertificate(url: string) {
  if (url && url !== '#') {
    window.open(url, '_blank')
  } else {
    showToast('معاينة الشهادة')
  }
}

async function handleSave() {
  try {
    isSaving.value = true
    const expNum = parseInt(profileData.experienceYears, 10)
    const payload: Record<string, any> = {
      license_number: profileData.licenseNumber || null,
      years_of_experience: isNaN(expNum) ? null : expNum,
      bio: profileData.bio || null,
    }

    const res = await $api<any>('/engineer/profile', {
      method: 'PUT',
      body: payload,
    })

    const data = res?.data || res
    if (data) {
      if (data.license_number) profileData.licenseNumber = data.license_number
      if (data.years_of_experience !== undefined) profileData.experienceYears = String(data.years_of_experience)
      if (data.bio) profileData.bio = data.bio
    }

    showToast('تم حفظ تعديلات الملف المهني بنجاح!')
  } catch (err: any) {
    const msg = err?.data?.message || 'تعذر حفظ تعديلات الملف المهني'
    showToast(msg)
  } finally {
    isSaving.value = false
  }
}

function handleCancel() {
  if (Object.keys(initialProfile.value).length > 0) {
    Object.assign(profileData, initialProfile.value)
  }
  showToast('تم إلغاء التعديلات واسترجاع البيانات السابقة')
}

onMounted(() => {
  loadProfile()
  loadCertificates()
})
</script>

<template>
  <div class="flex flex-col gap-8 pb-10">
    <!-- رأس الصفحة -->
    <header class="flex flex-col gap-1 text-right">
      <h1 class="text-2xl font-black text-solar-text-heading md:text-3xl">
        الملف المهني
      </h1>
      <p class="text-xs sm:text-sm text-solar-text-secondary">
        إدارة بيانات الاعتماد المهني، التخصصات الهندسية، والشهادات المعتمدة
      </p>
    </header>

    <!-- 1. قسم المعلومات المهنية -->
    <section class="space-y-4">
      <div class="flex items-center gap-2 text-sm font-bold text-solar-text-heading">
        <Briefcase class="size-4 text-solar-navy-dark" />
        <h2>المعلومات المهنية</h2>
      </div>

      <div class="rounded-2xl border border-solar-border-card bg-white p-6 shadow-card">
        <div class="flex flex-col lg:flex-row-reverse gap-6 items-start">
          <!-- بطاقة الصورة المهنية -->
          <div class="flex flex-col items-center justify-center rounded-2xl bg-solar-bg-subtle/50 p-6 border border-solar-border-card/60 w-full lg:w-72 shrink-0 text-center">
            <div class="relative size-24 overflow-hidden rounded-2xl border-2 border-white shadow-md">
              <img
                :src="profileData.image"
                :alt="profileData.name"
                class="h-full w-full object-cover"
              />
            </div>
            <h3 class="mt-3 text-sm font-black text-solar-text-heading">
              {{ profileData.name }}
            </h3>
            <p class="text-xs text-solar-text-muted mt-0.5">
              {{ profileData.title }}
            </p>

            <input
              ref="profileFileInput"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              class="hidden"
              @change="onPhotoSelected"
            />
            <button
              type="button"
              class="mt-4 flex items-center gap-1.5 rounded-lg border border-solar-border-card bg-white px-3.5 py-1.5 text-xs font-bold text-solar-text-heading shadow-xs hover:border-solar-yellow transition-all"
              @click="triggerPhotoSelect"
            >
              <Camera class="size-3.5" />
              <span>تحديث الصورة المهنية</span>
            </button>
            <span class="text-[10px] text-solar-text-muted mt-1.5">PNG أو JPG بحد أقصى 5MB</span>
          </div>

          <!-- تفاصيل الترخيص والخبرة والنبذة -->
          <div class="flex-1 w-full space-y-4 text-right">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- رقم الترخيص المهني -->
              <div>
                <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
                  رقم الترخيص المهني
                </label>
                <div class="relative flex items-center rounded-lg border border-solar-border-input bg-solar-bg-subtle/40 overflow-hidden">
                  <span class="bg-solar-bg-subtle px-3 py-2 text-xs font-bold text-solar-text-muted border-l border-solar-border-input">
                    SCE
                  </span>
                  <input
                    v-model="profileData.licenseNumber"
                    type="text"
                    class="w-full bg-transparent px-3 py-2 text-xs font-mono font-bold text-solar-text-heading focus:outline-none"
                  />
                </div>
                <span class="text-[10px] text-solar-text-muted mt-1 block">الهيئة السعودية للمهندسين - معتمد رسمياً</span>
              </div>

              <!-- سنوات الخبرة الميدانية -->
              <div>
                <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
                  سنوات الخبرة الميدانية
                </label>
                <input
                  v-model="profileData.experienceYears"
                  type="text"
                  class="w-full rounded-lg border border-solar-border-input bg-solar-bg-subtle/40 px-3.5 py-2 text-xs font-bold text-solar-text-heading focus:outline-none"
                />
                <span class="text-[10px] text-solar-text-muted mt-1 block">الخبرة الهندسية والاستشارية المعتمدة</span>
              </div>
            </div>

            <!-- النبذة المهنية المتخصصة -->
            <div>
              <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
                النبذة المهنية المتخصصة (Bio)
              </label>
              <textarea
                v-model="profileData.bio"
                rows="4"
                class="w-full rounded-lg border border-solar-border-input bg-solar-bg-subtle/40 p-3 text-xs leading-relaxed text-solar-text-heading focus:border-solar-yellow focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. قسم التخصصات الهندسية -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-sm font-bold text-solar-text-heading">
          <Award class="size-4 text-solar-navy-dark" />
          <h2>التخصصات الهندسية</h2>
        </div>
        <span class="rounded-lg bg-solar-yellow/20 px-2.5 py-1 text-xs font-bold text-solar-navy-dark">
          4 تخصصات معتمدة
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="spec in specialties"
          :key="spec.id"
          class="flex items-start justify-between gap-4 rounded-xl border p-4 transition-all duration-200 cursor-pointer text-right"
          :class="spec.active ? 'border-emerald-300 bg-emerald-50/20 shadow-xs' : 'border-solar-border-card bg-white opacity-70'"
          @click="toggleSpecialty(spec.id)"
        >
          <div class="flex items-start gap-3">
            <div class="flex size-6 shrink-0 items-center justify-center rounded-full mt-0.5" :class="spec.active ? 'text-emerald-600' : 'text-gray-300'">
              <CheckCircle2 class="size-5 fill-emerald-100" />
            </div>
            <div>
              <h3 class="text-xs sm:text-sm font-bold text-solar-text-heading">
                {{ spec.title }}
              </h3>
              <p class="mt-1 text-xs text-solar-text-muted leading-relaxed">
                {{ spec.desc }}
              </p>
            </div>
          </div>

          <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-solar-navy text-white">
            <component :is="spec.icon" class="size-4" />
          </div>
        </div>
      </div>
    </section>

    <!-- 3. قسم الشهادات والاعتمادات -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-sm font-bold text-solar-text-heading">
          <ShieldCheck class="size-4 text-solar-navy-dark" />
          <h2>الشهادات والاعتمادات</h2>
        </div>
        <input
          ref="certFileInput"
          type="file"
          accept=".pdf,image/png,image/jpeg"
          class="hidden"
          @change="onCertSelected"
        />
        <button
          type="button"
          :disabled="isUploadingCert"
          class="flex items-center gap-1.5 text-xs font-bold text-solar-navy hover:text-solar-yellow-active transition-colors disabled:opacity-50"
          @click="triggerCertUpload"
        >
          <Loader2 v-if="isUploadingCert" class="size-3.5 animate-spin" />
          <Plus v-else class="size-3.5" />
          <span>{{ isUploadingCert ? 'جاري الرفع...' : 'إضافة شهادة جديدة' }}</span>
        </button>
      </div>

      <div class="space-y-3">
        <div
          v-for="cert in certificates"
          :key="cert.id"
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-solar-border-card bg-white p-4 shadow-card"
        >
          <div class="flex items-center gap-3 text-right">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <FileText class="size-5" />
            </div>
            <div>
              <h3 class="text-xs sm:text-sm font-bold text-solar-text-heading">
                {{ cert.title }}
              </h3>
              <p class="text-[11px] text-solar-text-muted mt-0.5">
                {{ cert.meta }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-lg border border-solar-border-card bg-white px-3 py-1.5 text-xs font-semibold text-solar-text-body hover:border-solar-navy transition-colors"
              @click="viewCertificate(cert.url)"
            >
              <Eye class="size-3.5" />
              <span>معاينة</span>
            </button>
            <a
              :href="cert.url"
              target="_blank"
              download
              class="flex items-center gap-1.5 rounded-lg border border-solar-border-card bg-white px-3 py-1.5 text-xs font-semibold text-solar-text-body hover:border-solar-navy transition-colors"
            >
              <Download class="size-3.5" />
              <span>تحميل</span>
            </a>
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
              title="حذف الشهادة"
              @click="deleteCertificate(cert.id)"
            >
              <Trash2 class="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- شريط الحفظ والإلغاء في الأسفل -->
    <div class="flex items-center justify-start gap-3 pt-4 border-t border-solar-border-card">
      <button
        type="button"
        :disabled="isSaving"
        class="btn-primary px-8 text-xs sm:text-sm font-bold flex items-center gap-2"
        @click="handleSave"
      >
        <Loader2 v-if="isSaving" class="size-4 animate-spin" />
        <span>{{ isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات' }}</span>
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
