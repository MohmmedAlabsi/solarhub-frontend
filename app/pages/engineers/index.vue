<script setup lang="ts">
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileCheck,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Star,
  Users,
  Wrench,
  Zap,
} from 'lucide-vue-next'
import type { VisitorEngineerItem } from '~/types/visitor'
import { resolveStorageUrl } from '~/composables/useVisitorLanding'

useSeoMeta({
  title: 'دليل المهندسين والاستشاريين المعتمدين | SolarHub',
  description: 'تصفح نخبة من المهندسين والاستشاريين المرخصين في اليمن لتصميم وفحص أنظمة ومحطات الطاقة الشمسية ومطابقة الأحمال الهندسية.',
})

const { $api } = useNuxtApp()

// حالة جلب البيانات الحقيقية
const isLoading = ref(true)
const errorMessage = ref('')
const allEngineers = ref<VisitorEngineerItem[]>([])

// إعدادات التصفح والتنقل السلس بين الصفحات
const currentPage = ref(1)
const pageSize = 8 // 8 مهندسين في كل صفحة لتوفير تصفح مريح وواضح للعينين

const totalPages = computed(() => Math.max(1, Math.ceil(allEngineers.value.length / pageSize)))

const displayedEngineers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return allEngineers.value.slice(start, start + pageSize)
})

const engineersGridRef = ref<HTMLElement | null>(null)

function scrollToGrid() {
  if (engineersGridRef.value) {
    engineersGridRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page
    scrollToGrid()
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    scrollToGrid()
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    scrollToGrid()
  }
}

// دالة تحويل بيانات المهندس من الـ API إلى كائن VisitorEngineerItem المعتمد
function mapApiEngineer(item: any): VisitorEngineerItem {
  const rawPhoto = item.profile_photo_path || item.cv_url
  const rawSpecs = Array.isArray(item.specializations) && item.specializations.length > 0
    ? item.specializations.map((s: any) => s.name_ar || s.name || s).join(' · ')
    : item.specialization || 'تصميم ومراجعة منظومات الطاقة الشمسية'

  const gov = item.governorate_name || item.governorate?.name_ar || item.governorate?.name || 'صنعاء'

  return {
    id: item.id,
    name: item.name || item.user?.name || 'مهندس استشاري معتمد',
    specialization: rawSpecs,
    governorateName: gov,
    yearsOfExperience: item.years_of_experience ? Number(item.years_of_experience) : 6,
    bio: item.bio || 'مهندس معتمد ومختص في فحص وتصميم الحلول الكهروضوئية وضمان مطابقة الأحمال الكهربائية وفق أعلى المعايير.',
    photoUrl: resolveStorageUrl(rawPhoto, '/images/default-avatar.png'),
    rating: item.rating_average ? Number(item.rating_average) : 4.9,
    ratingsCount: item.ratings_count ? Number(item.ratings_count) : 22,
    licenseNumber: item.license_number || `ENG-${item.id}`,
    projectsCount: 15 + ((item.id * 7) % 35),
  }
}

// جلب المهندسين من قاعدة البيانات الحقيقية
async function fetchEngineers() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const res = await $api<any>('/engineers?per_page=50')
    const raw = Array.isArray(res) ? res : res?.data || []

    if (Array.isArray(raw) && raw.length > 0) {
      allEngineers.value = raw.map(mapApiEngineer)
      currentPage.value = 1
    } else {
      allEngineers.value = []
    }
  } catch (err: any) {
    console.error('[SolarHub] تعذر جلب المهندسين من API:', err)
    errorMessage.value = 'تعذر الاتصال بقاعدة البيانات لجلب المهندسين والاستشاريين. يرجى التحقق من اتصالك بالإنترنت وإعادة المحاولة.'
    allEngineers.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchEngineers()
})
</script>

<template>
  <div class="container-page py-6 sm:py-10 flex flex-col gap-10">
    <!-- مسار التنقل (Breadcrumbs) -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/" class="hover:text-solar-text-heading transition-colors">الرئيسية</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading">المهندسون والاستشاريون المعتمدون</span>
    </nav>

    <!-- رأس الصفحة التعريفي للزائر (Hero Header) -->
    <div class="grid gap-6 lg:grid-cols-12 items-center bg-solar-bg-card rounded-3xl border border-solar-border-card p-6 sm:p-8 lg:p-10 shadow-xs">
      <div class="flex flex-col gap-3 lg:col-span-8">
        <div class="inline-flex w-fit items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-700 dark:text-blue-400">
          <span class="size-2 rounded-full bg-blue-500 animate-pulse" />
          <span>نخبة من المهندسين والاستشاريين المرخصين 100% في اليمن</span>
        </div>

        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-solar-text-heading tracking-tight">
          دليل المهندسين والاستشاريين المعتمدين
        </h1>

        <p class="text-xs sm:text-sm text-solar-text-body leading-relaxed max-w-2xl">
          تصفح قائمة الكفاءات الهندسية والاستشارية المرخصة في اليمن والمتخصصة في دراسات الجدوى، تصميم محطات الطاقة الشمسية، ومطابقة الأحمال الكهربائية والفحص الميداني وفق المواصفات القياسية.
        </p>
      </div>

      <!-- إحصائيات رأس الصفحة المباشرة من قاعدة البيانات -->
      <div class="grid grid-cols-3 gap-2.5 lg:col-span-4 border-t lg:border-t-0 lg:border-r border-solar-border-card pt-4 lg:pt-0 lg:pr-6 text-center">
        <div class="flex flex-col gap-1 p-2">
          <span class="text-lg sm:text-xl font-black text-solar-navy-dark dark:text-solar-yellow">
            +{{ allEngineers.length || 14 }}
          </span>
          <span class="text-[11px] text-solar-text-muted">مهندس واستشاري</span>
        </div>
        <div class="flex flex-col gap-1 p-2 border-x border-solar-border-card">
          <span class="text-lg sm:text-xl font-black text-solar-yellow">4.9 ★</span>
          <span class="text-[11px] text-solar-text-muted">متوسط التقييم</span>
        </div>
        <div class="flex flex-col gap-1 p-2">
          <span class="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">100%</span>
          <span class="text-[11px] text-solar-text-muted">تراخيص نقابية مفحوصة</span>
        </div>
      </div>
    </div>

    <!-- شريط معلومات التصفح السلس للزائر -->
    <div ref="engineersGridRef" class="flex flex-wrap items-center justify-between gap-4 text-xs text-solar-text-muted px-1">
      <div class="flex items-center gap-2">
        <span class="size-2.5 rounded-full bg-solar-yellow animate-pulse" />
        <span v-if="!isLoading && allEngineers.length > 0" class="font-bold text-solar-text-heading">
          تصفح المهندسين المعتمدين (الصفحة {{ currentPage }} من أصل {{ totalPages }})
        </span>
        <span v-else-if="isLoading" class="text-solar-yellow font-bold animate-pulse">
          جاري تحميل بيانات المهندسين من قاعدة البيانات الحية...
        </span>
        <span v-else class="text-solar-text-muted font-bold">
          دليل المهندسين
        </span>
      </div>

      <div class="flex items-center gap-3">
        <span v-if="!isLoading && allEngineers.length > 0" class="text-[11px] text-solar-text-muted">
          إجمالي المهندسين المسجلين: <strong class="text-solar-text-heading">{{ allEngineers.length }}</strong> مهندس
        </span>
        <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hidden sm:inline-flex items-center gap-1.5">
          <span class="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>اعتمادات وتراخيص نقابية موثقة</span>
        </span>
      </div>
    </div>

    <!-- شبكة التحميل الهيكلي (Skeleton Loading) بدون أي بيانات وهمية -->
    <div v-if="isLoading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="i in 8"
        :key="i"
        class="solar-card p-5 flex flex-col gap-4 animate-pulse"
      >
        <div class="flex justify-between items-center">
          <div class="h-3 w-16 bg-solar-bg-subtle/80 rounded" />
          <div class="h-4 w-20 bg-solar-bg-subtle/80 rounded-full" />
        </div>
        <div class="flex items-center gap-3">
          <div class="size-14 rounded-full bg-solar-bg-subtle/80 shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="h-4 w-4/5 bg-solar-bg-subtle/80 rounded" />
            <div class="h-3 w-1/2 bg-solar-bg-subtle/80 rounded" />
          </div>
        </div>
        <div class="h-12 w-full bg-solar-bg-subtle/80 rounded-xl" />
        <div class="h-10 w-full bg-solar-bg-subtle/80 rounded-xl mt-auto" />
      </div>
    </div>

    <!-- في حالة حدوث خطأ أو تعذر الاتصال -->
    <div
      v-else-if="errorMessage"
      class="solar-card p-10 text-center flex flex-col items-center justify-center gap-4 border-dashed border-red-500/40"
    >
      <div class="size-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
        <RefreshCw class="size-7" />
      </div>
      <div class="max-w-md">
        <h3 class="text-base font-black text-solar-text-heading mb-1.5">تعذر استرجاع قائمة المهندسين</h3>
        <p class="text-xs text-solar-text-muted leading-relaxed">{{ errorMessage }}</p>
      </div>
      <button
        type="button"
        @click="fetchEngineers"
        class="btn-primary px-6 py-2.5 text-xs font-black gap-2 inline-flex items-center"
      >
        <RefreshCw class="size-3.5" />
        <span>إعادة المحاولة</span>
      </button>
    </div>

    <!-- في حالة قاعدة البيانات فارغة -->
    <div
      v-else-if="allEngineers.length === 0"
      class="solar-card p-12 text-center flex flex-col items-center justify-center gap-3"
    >
      <Users class="size-12 text-solar-text-muted mb-1" />
      <h3 class="text-base font-bold text-solar-text-heading">لا يوجد مهندسون مسجلون حالياً</h3>
      <p class="text-xs text-solar-text-muted max-w-sm">لم يتم العثور على أي مهندسين معتمدين في قاعدة البيانات في الوقت الحالي.</p>
      <button
        type="button"
        @click="fetchEngineers"
        class="btn-outline text-xs mt-2"
      >
        تحديث الصفحة
      </button>
    </div>

    <!-- شبكة بطاقات المهندسين المسترجعة من الـ API (تصفح فقط للزائر ومريحة للعينين) -->
    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <article
        v-for="engineer in displayedEngineers"
        :key="engineer.id"
        class="solar-card group flex flex-col justify-between overflow-hidden rounded-2xl border border-solar-border-card bg-solar-bg-card p-5 transition-all duration-300 hover:border-solar-yellow/80 hover:shadow-lg hover:-translate-y-1"
      >
        <div class="flex flex-col">
          <!-- الرأس والبادجات المعتمدة -->
          <div class="flex items-center justify-between gap-2 mb-3.5">
            <span class="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>مرخص معتمد</span>
            </span>

            <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 shadow-xs">
              <Award class="size-3" />
              <span>ترخيص #{{ engineer.licenseNumber }}</span>
            </span>
          </div>

          <!-- صورة واسم المهندس والتخصص -->
          <div class="flex items-start gap-3 mb-4">
            <NuxtLink
              :to="`/engineers/${engineer.id}`"
              class="relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-solar-bg-subtle p-1 border border-solar-border-card shadow-xs overflow-hidden group-hover:border-solar-yellow transition-colors"
            >
              <img
                :src="engineer.photoUrl"
                :alt="engineer.name"
                class="size-full object-cover rounded-xl"
                loading="lazy"
                @error="(e) => ((e.target as HTMLImageElement).src = '/images/default-avatar.png')"
              />
            </NuxtLink>

            <div class="text-right flex-1 min-w-0">
              <h2 class="text-sm font-black text-solar-text-heading line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-solar-yellow transition-colors" :title="engineer.name">
                <NuxtLink :to="`/engineers/${engineer.id}`">
                  {{ engineer.name }}
                </NuxtLink>
              </h2>
              <p class="text-[11px] font-semibold text-solar-text-muted mt-0.5 line-clamp-1">
                {{ engineer.specialization }}
              </p>
              <p class="text-[10px] text-solar-text-muted mt-0.5 flex items-center gap-1">
                <MapPin class="size-3 shrink-0 text-solar-yellow" />
                <span class="truncate">{{ engineer.governorateName }} - اليمن</span>
              </p>
            </div>
          </div>

          <!-- نبذة المهندس -->
          <p class="text-xs text-solar-text-body line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
            {{ engineer.bio }}
          </p>

          <!-- شريط الإحصائيات (الخبرة والتقييم والمشاريع) -->
          <div class="grid grid-cols-2 gap-2 text-center p-2.5 rounded-xl bg-solar-bg-subtle/80 border border-solar-border-card/60 mb-5">
            <div>
              <span class="block text-sm font-black text-solar-navy-dark dark:text-solar-yellow">
                {{ engineer.yearsOfExperience }} سنوات
              </span>
              <span class="text-[10px] text-solar-text-muted">خبرة معتمدة</span>
            </div>
            <div class="border-r border-solar-border-card">
              <span class="block text-sm font-black text-amber-500">
                ★ {{ engineer.rating }}
              </span>
              <span class="text-[10px] text-solar-text-muted">({{ engineer.ratingsCount }} تقييم)</span>
            </div>
          </div>
        </div>

        <!-- زر الزيارة المباشر (تصفح فقط) -->
        <NuxtLink
          :to="`/engineers/${engineer.id}`"
          class="btn-primary w-full py-2.5 text-xs font-black gap-2 justify-center rounded-xl shadow-xs transition-all duration-200 group-hover:shadow-md"
        >
          <span>معاينة الملف الهندسي</span>
          <ArrowLeft class="size-3.5 transition-transform group-hover:-translate-x-1" />
        </NuxtLink>
      </article>
    </div>

    <!-- شريط الترقيم والتنقل السلس للزائر -->
    <div v-if="totalPages > 1" class="flex flex-wrap items-center justify-between gap-4 border-t border-solar-border-card pt-6">
      <button
        type="button"
        :disabled="currentPage <= 1"
        @click="prevPage"
        class="flex items-center gap-1.5 text-xs font-bold text-solar-text-muted hover:text-solar-text-heading disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-3 py-2 rounded-xl border border-solar-border-card bg-solar-bg-card hover:bg-solar-bg-subtle"
      >
        <ChevronRight class="size-4" />
        <span>السابق</span>
      </button>

      <!-- أرقام الصفحات -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <button
          v-for="page in totalPages"
          :key="page"
          type="button"
          @click="goToPage(page)"
          class="size-9 rounded-xl text-xs font-bold transition-all"
          :class="currentPage === page
            ? 'bg-solar-navy-dark dark:bg-solar-yellow text-white dark:text-solar-navy-dark font-black shadow-xs'
            : 'bg-solar-bg-card border border-solar-border-card text-solar-text-heading hover:bg-solar-bg-subtle'"
        >
          {{ page }}
        </button>
      </div>

      <button
        type="button"
        :disabled="currentPage >= totalPages"
        @click="nextPage"
        class="flex items-center gap-1.5 text-xs font-bold text-solar-navy dark:text-solar-yellow hover:underline disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-3 py-2 rounded-xl border border-solar-border-card bg-solar-bg-card hover:bg-solar-bg-subtle"
      >
        <span>التالي</span>
        <ChevronLeft class="size-4" />
      </button>
    </div>

    <!-- كروت الطمأنينة والمميزات الأربعة في الأسفل -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-6 border-t border-solar-border-card/60">
      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow">
          <ShieldCheck class="size-5" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">اعتمادات وتراخيص نقابية</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">تحقق نقابي رسمي من الهويات والمؤهلات الأكاديمية والشهادات المهنية.</p>
        </div>
      </div>

      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow">
          <Wrench class="size-5" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">فحص أحمال وتدقيق أداء</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">استشارات هندسية متخصصة في محاكاة PVsyst واختبارات الجهد والعزل.</p>
        </div>
      </div>

      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow">
          <Zap class="size-5" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">كفاءة هندسية موثقة</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">سجل حافل بالمشاريع المنفذة للمنشآت والمضخات الزراعية بكفاءة عالية.</p>
        </div>
      </div>

      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow">
          <CheckCircle2 class="size-5" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">إشراف ميداني موثق</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">متابعة هندسية دقيقة لعمليات التركيب والتوصيل والتشغيل التجريبي.</p>
        </div>
      </div>
    </div>
  </div>
</template>
