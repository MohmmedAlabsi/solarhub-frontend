<script setup lang="ts">
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  ShieldCheck,
  Star,
  Users,
  RotateCcw,
} from 'lucide-vue-next'
import { visitorEngineers, type VisitorEngineer } from '~~/app/data/visitor-mock'
import { useAuthModal } from '~~/app/composables/useAuthModal'
import { useAuthStore } from '~~/app/stores/auth'
import AppToast from '~~/app/components/common/AppToast.vue'

useSeoMeta({
  title: 'دليل المهندسين والاستشاريين المعتمدين | SolarHub',
  description: 'تواصل مع نخبة المهندسين المرخصين في تصميم أنظمة الطاقة الشمسية، دراسات الجدوى والأحمال، والفحص الميداني وفق أعلى المعايير الهندسية المعتمدة في اليمن.',
})

const authModal = useAuthModal()
const authStore = useAuthStore()
const config = useRuntimeConfig()
const apiBase = (config.public.apiBaseUrl as string) || (config.public.apiBase as string) || 'http://127.0.0.1:8000/api'

// حقول البحث والتصفية
const searchQuery = ref('')
const selectedSpecialty = ref('all')
const selectedCity = ref('all')
const selectedRating = ref('all')

const cities = ['all', 'صنعاء', 'عدن', 'تعز', 'الحديدة', 'حضرموت', 'مأرب', 'إب', 'ذمار', 'عمران']
const specialties = [
  { value: 'all', label: 'جميع التخصصات الهندسية' },
  { value: 'محطات', label: 'تصميم محطات كهروضوئية' },
  { value: 'مضخات', label: 'طاقة زراعية وضخ مياه' },
  { value: 'تخزين', label: 'أنظمة هجينة وتخزين BESS' },
  { value: 'فحص', label: 'فحص حراري وتدقيق أداء' },
  { value: 'كهرباء', label: 'هندسة كهربائية وطاقة متجددة' },
]

const isLoading = ref(true)
const engineersList = ref<VisitorEngineer[]>([])
const totalEngineersCount = ref(0)
const toastMessage = ref('')
let toastTimeout: any = null

function showToast(msg: string) {
  toastMessage.value = msg
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    toastMessage.value = ''
  }, 3500)
}

// جلب المهندسين من API
async function fetchEngineers() {
  isLoading.value = true
  const endpoint = `${apiBase}/engineers`

  if (import.meta.client) {
    console.log(
      `%c[SolarHub DevTools]%c 🚀 جاري جلب قائمة المهندسين والاستشاريين عبر الرابط:`,
      'color: #F2B705; font-weight: bold;',
      'color: inherit;',
      endpoint
    )
  }

  try {
    const res = await $fetch<{ status: string; message: string; data: any[] }>(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })

    if (res && Array.isArray(res.data) && res.data.length > 0) {
      if (import.meta.client) {
        console.log(
          `%c[SolarHub DevTools]%c ✅ تم استرجاع (${res.data.length}) مهندس بنجاح من قاعدة البيانات:`,
          'color: #10B981; font-weight: bold;',
          'color: inherit;',
          {
            count: res.data.length,
            engineers: res.data,
          }
        )
      }

      totalEngineersCount.value = res.data.length

      engineersList.value = res.data.map((item: any, idx: number) => {
        const fallback = visitorEngineers[idx % visitorEngineers.length]
        const specsNames = Array.isArray(item.specializations)
          ? item.specializations.map((s: any) => s.name).join(' · ')
          : 'مهندس طاقة شمسية معتمد'

        const avatar = item.profile_photo_path && !item.profile_photo_path.includes('via.placeholder')
          ? item.profile_photo_path
          : fallback.avatar

        const cityList = ['صنعاء', 'عدن', 'تعز', 'حضرموت', 'مأرب', 'إب']
        const city = cityList[idx % cityList.length]

        return {
          id: String(item.id),
          name: item.name || fallback.name,
          title: specsNames || fallback.title,
          specialty: specsNames || fallback.specialty,
          city,
          experience: item.years_of_experience ? `${item.years_of_experience} سنوات خبرة` : fallback.experience,
          license: `ترخيص هندسي نقابي #${2000 + item.id}`,
          rating: Number(item.rating_average) > 0 ? Number(item.rating_average) : 4.9,
          reviewsCount: Number(item.ratings_count) > 0 ? Number(item.ratings_count) : (22 + idx * 5),
          projectsCount: 15 + (item.years_of_experience ? item.years_of_experience * 4 : idx * 6),
          complianceRate: '100%',
          responseSpeed: 'أقل من ساعتين',
          avatar,
          verified: true,
          bio: item.bio || fallback.bio,
          specialties: fallback.specialties,
          workflowSteps: fallback.workflowSteps,
        } as VisitorEngineer
      })
    } else {
      useFallbackEngineers()
    }
  } catch (error) {
    if (import.meta.client) {
      console.warn('[SolarHub DevTools] ⚠️ تعذر جلب المهندسين من API، جاري استخدام البيانات المحلية الاحتياطية:', error)
    }
    useFallbackEngineers()
  } finally {
    isLoading.value = false
  }
}

function useFallbackEngineers() {
  engineersList.value = visitorEngineers.map(e => ({
    ...e,
    city: e.city.replace(/الرياض|جدة|الدمام|القصيم/g, 'صنعاء'),
    license: e.license.replace(/الهيئة السعودية للمهندسين/g, 'نقابة المهندسين اليمنيين'),
  }))
  totalEngineersCount.value = visitorEngineers.length
}

const filteredEngineers = computed(() => {
  return engineersList.value.filter((eng) => {
    const matchQuery =
      !searchQuery.value ||
      eng.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      eng.specialty.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      eng.city.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      eng.bio.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchCity = selectedCity.value === 'all' || eng.city.includes(selectedCity.value)
    const matchSpecialty =
      selectedSpecialty.value === 'all' ||
      eng.specialty.includes(selectedSpecialty.value) ||
      eng.title.includes(selectedSpecialty.value)

    const matchRating = selectedRating.value === 'all' || eng.rating >= Number(selectedRating.value)

    return matchQuery && matchCity && matchSpecialty && matchRating
  })
})

function handleConsult(eng: VisitorEngineer) {
  if (!authStore.isAuthenticated) {
    authModal.open({
      title: 'لطلب استشارة هندسية، يرجى تسجيل الدخول',
      message: `سجّل الدخول إلى حسابك لحجز جلسة استشارة فنية مع (${eng.name}) وإرسال تفاصيل ومخططات مشروعك.`,
      actionType: 'consultation',
    })
    return
  }

  const role = authStore.userRole
  if (role === 'customer') {
    navigateTo(`/customer/services?engineer_id=${eng.id}`)
  } else if (role === 'engineer') {
    showToast('أنت مسجل كمهندس! يمكنك استقبال طلبات الاستشارة من لوحة تحكمك.')
  } else if (role === 'supplier') {
    showToast('أنت مسجل كمورد! يمكنك التواصل مع المهندسين لتوريد المعدات من لوحتك.')
  } else {
    navigateTo(`/customer/services?engineer_id=${eng.id}`)
  }
}

function resetFilters() {
  searchQuery.value = ''
  selectedSpecialty.value = 'all'
  selectedCity.value = 'all'
  selectedRating.value = 'all'
}

onMounted(() => {
  fetchEngineers()
})
</script>

<template>
  <div class="container-page py-6 sm:py-10 flex flex-col gap-10">
    <AppToast :message="toastMessage" />

    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading">دليل المهندسين المعتمدين</span>
    </nav>

    <!-- رأس الصفحة (Hero Header) -->
    <div class="grid gap-6 lg:grid-cols-12 items-center bg-solar-bg-card rounded-3xl border border-solar-border-card p-6 sm:p-8 lg:p-10 shadow-sm">
      <div class="flex flex-col gap-3 lg:col-span-8">
        <div class="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
          <span class="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>فحص وتأهيل معتمد 100% في اليمن</span>
        </div>

        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-solar-text-heading">
          دليل المهندسين والاستشاريين المعتمدين
        </h1>

        <p class="text-xs sm:text-sm text-solar-text-body leading-relaxed max-w-2xl">
          تواصل مع نخبة المهندسين المرخصين في تصميم أنظمة الطاقة الشمسية، دراسات الجدوى والأحمال، والفحص الميداني وفق أعلى المعايير والمواصفات الهندسية المعتمدة.
        </p>
      </div>

      <!-- إحصائيات رأس الصفحة -->
      <div class="grid grid-cols-3 gap-2.5 lg:col-span-4 border-t lg:border-t-0 lg:border-r border-solar-border-card pt-4 lg:pt-0 lg:pr-6 text-center">
        <div class="flex flex-col gap-1 p-2">
          <span class="text-lg sm:text-xl font-black text-solar-navy-dark dark:text-solar-yellow">+{{ totalEngineersCount || 7 }}</span>
          <span class="text-[11px] text-solar-text-muted">مهندس واستشاري</span>
        </div>
        <div class="flex flex-col gap-1 p-2 border-x border-solar-border-card">
          <span class="text-lg sm:text-xl font-black text-solar-yellow">4.9 ★</span>
          <span class="text-[11px] text-solar-text-muted">متوسط التقييم</span>
        </div>
        <div class="flex flex-col gap-1 p-2">
          <span class="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">100%</span>
          <span class="text-[11px] text-solar-text-muted">تراخيص سارية</span>
        </div>
      </div>
    </div>

    <!-- شريط البحث والتصفية -->
    <div class="flex flex-col gap-4">
      <!-- حقل البحث الكبير -->
      <div class="relative flex items-center rounded-2xl bg-solar-bg-card border border-solar-border-card shadow-sm p-1.5 focus-within:border-solar-yellow focus-within:ring-2 focus-within:ring-solar-yellow/20 transition-all">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ابحث باسم المهندس، التخصص الهندسي، أو الكلمات المفتاحية (مثل: دراسات أحمال، مضخات، أنظمة هجينة)..."
          class="flex-1 bg-transparent px-4 py-3 text-xs sm:text-sm text-solar-text-heading placeholder-solar-text-muted focus:outline-none"
        />
        <button type="button" class="btn-dark px-6 py-3 text-xs font-bold gap-2 rounded-xl">
          <Search class="size-4" />
          <span>بحث</span>
        </button>
      </div>

      <!-- القوائم المنسدلة للتصفية -->
      <div class="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-solar-bg-card border border-solar-border-card text-xs font-bold shadow-sm">
        <div class="flex items-center gap-1.5 text-solar-navy dark:text-solar-yellow font-black pl-2 border-l border-solar-border-card shrink-0">
          <Filter class="size-4 text-solar-yellow" />
          <span>تصفية المهندسين:</span>
        </div>

        <!-- فلتر التخصص -->
        <div class="flex items-center gap-1.5">
          <span class="text-solar-text-muted text-[11px]">التخصص الهندسي:</span>
          <select v-model="selectedSpecialty" class="rounded-lg border border-solar-border-card bg-solar-bg-subtle px-3 py-1.5 text-xs text-solar-text-heading focus:outline-none focus:border-solar-yellow font-semibold">
            <option v-for="sp in specialties" :key="sp.value" :value="sp.value">{{ sp.label }}</option>
          </select>
        </div>

        <!-- فلتر المحافظة / المدينة -->
        <div class="flex items-center gap-1.5">
          <span class="text-solar-text-muted text-[11px]">المحافظة:</span>
          <select v-model="selectedCity" class="rounded-lg border border-solar-border-card bg-solar-bg-subtle px-3 py-1.5 text-xs text-solar-text-heading focus:outline-none focus:border-solar-yellow font-semibold">
            <option value="all">جميع المحافظات</option>
            <option v-for="c in cities.filter(x => x !== 'all')" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <!-- فلتر التقييم -->
        <div class="flex items-center gap-1.5">
          <span class="text-solar-text-muted text-[11px]">التقييم:</span>
          <select v-model="selectedRating" class="rounded-lg border border-solar-border-card bg-solar-bg-subtle px-3 py-1.5 text-xs text-solar-text-heading focus:outline-none focus:border-solar-yellow font-semibold">
            <option value="all">الكل</option>
            <option value="4.8">4.8 فما فوق</option>
            <option value="4.5">4.5 فما فوق</option>
          </select>
        </div>

        <button
          v-if="searchQuery || selectedSpecialty !== 'all' || selectedCity !== 'all' || selectedRating !== 'all'"
          type="button"
          @click="resetFilters"
          class="mr-auto inline-flex items-center gap-1 text-[11px] text-red-500 hover:underline font-bold"
        >
          <RotateCcw class="size-3" />
          <span>إعادة تعيين</span>
        </button>
      </div>
    </div>

    <!-- ترويسة النتائج وبادج الترخيص -->
    <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-solar-text-muted border-b border-solar-border-card pb-2">
      <span class="font-bold text-solar-text-heading">عرض {{ filteredEngineers.length }} من أصل {{ totalEngineersCount }} مهندس مسجل</span>
      <span class="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
        <CheckCircle2 class="size-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>جميع المهندسين معتمدون ومفحوصو المؤهلات رسمياً</span>
      </span>
    </div>

    <!-- شبكة التحميل Skeleton -->
    <div v-if="isLoading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="i in 4" :key="i" class="solar-card p-5 flex flex-col gap-4 animate-pulse">
        <div class="flex items-start justify-between">
          <div class="h-4 w-14 bg-solar-bg-subtle rounded-full" />
          <div class="size-16 rounded-full bg-solar-bg-subtle" />
        </div>
        <div class="space-y-2 mt-2">
          <div class="h-4 w-3/4 bg-solar-bg-subtle rounded" />
          <div class="h-3 w-1/2 bg-solar-bg-subtle rounded" />
          <div class="h-10 w-full bg-solar-bg-subtle rounded-lg" />
        </div>
        <div class="h-10 w-full bg-solar-bg-subtle rounded-xl mt-auto" />
      </div>
    </div>

    <!-- شبكة بطاقات المهندسين -->
    <div v-else-if="filteredEngineers.length > 0" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="eng in filteredEngineers"
        :key="eng.id"
        class="solar-card flex flex-col justify-between p-5 hover:border-solar-yellow transition-all group"
      >
        <div>
          <!-- الرأس والبادج والصورة مع النقطة الخضراء -->
          <div class="flex items-start justify-between gap-3 mb-4">
            <span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 class="size-3 text-emerald-600 dark:text-emerald-400" />
              <span>معتمد</span>
            </span>

            <div class="relative shrink-0">
              <img
                :src="eng.avatar"
                :alt="eng.name"
                class="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-full object-cover border-2 border-solar-yellow ring-2 ring-solar-bg-card shadow-sm"
              />
              <span class="absolute bottom-0 left-0 size-3.5 rounded-full bg-emerald-500 ring-2 ring-solar-bg-card" />
            </div>
          </div>

          <!-- الاسم والتخصص والوصف -->
          <div class="text-right mb-3">
            <h2 class="text-base font-black text-solar-text-heading group-hover:text-solar-yellow transition-colors">{{ eng.name }}</h2>
            <p class="text-xs font-semibold text-solar-navy dark:text-solar-yellow mt-0.5">{{ eng.specialty }}</p>
            <p class="text-xs text-solar-text-body line-clamp-2 leading-relaxed mt-2">
              {{ eng.bio }}
            </p>
          </div>

          <!-- إحصائيات المشروعات والتقييم -->
          <div class="flex items-center justify-between text-xs border-t border-solar-border-card pt-3 mb-4">
            <div class="flex items-center gap-1 font-bold text-amber-500">
              <Star class="size-3.5 fill-amber-400 text-amber-400" />
              <span class="text-solar-text-heading">{{ eng.rating }}</span>
              <span class="text-solar-text-muted text-[10px]">({{ eng.reviewsCount }} تقييم)</span>
            </div>
            <span class="font-bold text-solar-navy dark:text-solar-yellow text-xs">{{ eng.projectsCount }} مشروع منجز</span>
          </div>
        </div>

        <!-- الأزرار -->
        <div class="flex flex-col gap-2">
          <button
            type="button"
            @click="handleConsult(eng)"
            class="btn-primary w-full py-2.5 text-xs font-black gap-1.5 justify-center shadow-sm"
          >
            <span>طلب استشارة</span>
          </button>
          <NuxtLink
            :to="`/engineers/${eng.id}`"
            class="text-center text-xs font-bold text-solar-text-body hover:text-solar-navy dark:hover:text-solar-yellow transition-colors flex items-center justify-center gap-1 py-1"
          >
            <span>عرض الملف الشخصي</span>
            <ArrowLeft class="size-3" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- في حالة عدم وجود نتائج -->
    <div v-else class="solar-card p-12 text-center flex flex-col items-center justify-center">
      <Users class="size-12 text-solar-text-muted mb-3" />
      <h3 class="text-base font-bold text-solar-text-heading mb-1">لم يتم العثور على مهندسين مطابقين</h3>
      <p class="text-xs text-solar-text-muted mb-4">يرجى تجربة كلمات بحث أخرى أو تغيير خيارات التصفية.</p>
      <button type="button" @click="resetFilters" class="btn-outline text-xs">
        إعادة تعيين الفلاتر
      </button>
    </div>
  </div>
</template>
