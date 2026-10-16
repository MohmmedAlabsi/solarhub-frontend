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
} from 'lucide-vue-next'
import { visitorEngineers } from '~~/app/data/visitor-mock'
import { useAuthModal } from '~~/app/composables/useAuthModal'

useSeoMeta({
  title: 'دليل المهندسين والاستشاريين المعتمدين | SolarHub',
  description: 'تواصل مع نخبة المهندسين المرخصين في تصميم أنظمة الطاقة الشمسية، دراسات الجدوى والأحمال، والفحص الميداني وفق الكود السعودي.',
})

const authModal = useAuthModal()

// حقول البحث والتصفية
const searchQuery = ref('')
const selectedSpecialty = ref('all')
const selectedCity = ref('all')
const selectedRating = ref('all')

const cities = ['all', 'الرياض', 'جدة', 'الدمام', 'القصيم', 'صنعاء']
const specialties = [
  { value: 'all', label: 'جميع التخصصات الهندسية' },
  { value: 'محطات', label: 'تصميم محطات كهروضوئية' },
  { value: 'مضخات', label: 'طاقة زراعية وضخ مياه' },
  { value: 'تخزين', label: 'أنظمة هجينة وتخزين BESS' },
  { value: 'فحص', label: 'فحص حراري وتدقيق أداء' },
]

const filteredEngineers = computed(() => {
  return visitorEngineers.filter((eng) => {
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

    return matchQuery && matchCity && matchSpecialty
  })
})

function handleConsult(engineerName: string) {
  authModal.open({
    title: 'لطلب استشارة هندسية، يرجى تسجيل الدخول',
    message: `سجّل الدخول إلى حسابك أو أنشئ حساباً جديداً لحجز جلسة استشارة فنية مع (${engineerName}) وإرسال تفاصيل ومخططات مشروعك.`,
    actionType: 'consultation',
  })
}
</script>

<template>
  <div class="container-page py-6 sm:py-10 flex flex-col gap-10">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading">دليل المهندسين المعتمدين</span>
    </nav>

    <!-- رأس الصفحة (Hero Header) المطابق لـ visitor_5.png -->
    <div class="grid gap-6 lg:grid-cols-12 items-center bg-white rounded-3xl border border-solar-border-card p-6 sm:p-8 lg:p-10 shadow-sm">
      <div class="flex flex-col gap-3 lg:col-span-8">
        <div class="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800">
          <span class="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>فحص وتأهيل معتمد 100%</span>
        </div>

        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-solar-text-heading">
          دليل المهندسين والاستشاريين المعتمدين
        </h1>

        <p class="text-xs sm:text-sm text-solar-text-body leading-relaxed max-w-2xl">
          تواصل مع نخبة المهندسين المرخصين في تصميم أنظمة الطاقة الشمسية، دراسات الجدوى والأحمال، والفحص الميداني وفق الكود السعودي.
        </p>
      </div>

      <!-- إحصائيات رأس الصفحة -->
      <div class="grid grid-cols-3 gap-2.5 lg:col-span-4 border-t lg:border-t-0 lg:border-r border-solar-border-card pt-4 lg:pt-0 lg:pr-6 text-center">
        <div class="flex flex-col gap-1 p-2">
          <span class="text-lg sm:text-xl font-black text-solar-navy-dark">+180</span>
          <span class="text-[11px] text-solar-text-muted">مهندس معتمد</span>
        </div>
        <div class="flex flex-col gap-1 p-2 border-x border-solar-border-card">
          <span class="text-lg sm:text-xl font-black text-solar-yellow">4.9 ★</span>
          <span class="text-[11px] text-solar-text-muted">متوسط التقييم</span>
        </div>
        <div class="flex flex-col gap-1 p-2">
          <span class="text-lg sm:text-xl font-black text-emerald-600">100%</span>
          <span class="text-[11px] text-solar-text-muted">تراخيص سارية</span>
        </div>
      </div>
    </div>

    <!-- شريط البحث والتصفية -->
    <div class="flex flex-col gap-4">
      <!-- حقل البحث الكبير -->
      <div class="relative flex items-center rounded-2xl bg-white border border-solar-border-card shadow-sm p-1.5 focus-within:border-solar-yellow focus-within:ring-2 focus-within:ring-solar-yellow/20 transition-all">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ابحث باسم المهندس، التخصص الهندسي، أو الكلمات المفتاحية (مثل: دراسات أحمال، مضخات، On-Grid)..."
          class="flex-1 bg-transparent px-4 py-3 text-xs sm:text-sm text-solar-text-heading placeholder-solar-text-muted focus:outline-none"
        />
        <button type="button" class="btn-dark px-6 py-3 text-xs font-bold gap-2 rounded-xl">
          <Search class="size-4" />
          <span>بحث</span>
        </button>
      </div>

      <!-- القوائم المنسدلة الثلاثة للتصفية المطابقة لـ visitor_5.png -->
      <div class="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-white border border-solar-border-card text-xs font-bold shadow-sm">
        <div class="flex items-center gap-1.5 text-solar-navy font-black pl-2 border-l border-solar-border-card shrink-0">
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
          <span class="text-solar-text-muted text-[11px]">المحافظة / المدينة:</span>
          <select v-model="selectedCity" class="rounded-lg border border-solar-border-card bg-solar-bg-subtle px-3 py-1.5 text-xs text-solar-text-heading focus:outline-none focus:border-solar-yellow font-semibold">
            <option value="all">جميع المدن والمحافظات</option>
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
          @click="searchQuery = ''; selectedSpecialty = 'all'; selectedCity = 'all'; selectedRating = 'all'"
          class="mr-auto text-[11px] text-red-600 hover:underline"
        >
          إعادة تعيين الفلاتر
        </button>
      </div>
    </div>

    <!-- ترويسة النتائج وبادج الترخيص -->
    <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-solar-text-muted border-b border-solar-border-card pb-2">
      <span class="font-bold text-solar-text-heading">عرض {{ filteredEngineers.length }} من أصل 184 مهندس معتمد</span>
      <span class="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 font-bold text-emerald-800 flex items-center gap-1.5">
        <CheckCircle2 class="size-3.5 text-emerald-600" />
        <span>جميع الملفات خاضعة للمطابقة والترخيص الرسمي</span>
      </span>
    </div>

    <!-- شبكة بطاقات المهندسين الأربعة المطابقة لـ visitor_5.png -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="eng in filteredEngineers"
        :key="eng.id"
        class="solar-card flex flex-col justify-between p-5 hover:border-solar-yellow transition-all"
      >
        <div>
          <!-- الرأس والبادج والصورة مع النقطة الخضراء -->
          <div class="flex items-start justify-between gap-3 mb-4">
            <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              <CheckCircle2 class="size-3 text-emerald-600" />
              <span>معتمد</span>
            </span>

            <div class="relative shrink-0">
              <img
                :src="eng.avatar"
                :alt="eng.name"
                class="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-full object-cover border-2 border-solar-yellow ring-2 ring-white shadow-sm"
              />
              <span class="absolute bottom-0 left-0 size-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
          </div>

          <!-- الاسم والتخصص والوصف -->
          <div class="text-right mb-3">
            <h2 class="text-base font-black text-solar-text-heading">{{ eng.name }}</h2>
            <p class="text-xs font-semibold text-solar-navy mt-0.5">{{ eng.specialty }}</p>
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
            <span class="font-bold text-solar-navy text-xs">{{ eng.projectsCount }} مشروع منجز</span>
          </div>
        </div>

        <!-- الأزرار -->
        <div class="flex flex-col gap-2">
          <button
            type="button"
            @click="handleConsult(eng.name)"
            class="btn-primary w-full py-2.5 text-xs font-black gap-1.5 justify-center shadow-sm"
          >
            <span>طلب استشارة</span>
          </button>
          <NuxtLink
            :to="`/engineers/${eng.id}`"
            class="text-center text-xs font-bold text-solar-text-body hover:text-solar-navy transition-colors flex items-center justify-center gap-1"
          >
            <span>عرض الملف الشخصي</span>
            <ArrowLeft class="size-3" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- الترقيم والصفحات المطابق لـ visitor_5.png -->
    <div class="flex items-center justify-between border-t border-solar-border-card pt-6">
      <button
        type="button"
        disabled
        class="flex items-center gap-1 text-xs font-bold text-solar-text-muted opacity-50 cursor-not-allowed"
      >
        <ChevronRight class="size-4" />
        <span>السابق</span>
      </button>

      <div class="flex items-center gap-1">
        <button type="button" class="size-8 rounded-lg bg-solar-navy-dark text-white text-xs font-bold">1</button>
        <button type="button" class="size-8 rounded-lg bg-white border border-solar-border-card text-solar-text-heading text-xs font-bold hover:bg-solar-bg-subtle">2</button>
        <button type="button" class="size-8 rounded-lg bg-white border border-solar-border-card text-solar-text-heading text-xs font-bold hover:bg-solar-bg-subtle">3</button>
        <span class="px-1 text-solar-text-muted text-xs">...</span>
        <button type="button" class="size-8 rounded-lg bg-white border border-solar-border-card text-solar-text-heading text-xs font-bold hover:bg-solar-bg-subtle">16</button>
      </div>

      <button
        type="button"
        class="flex items-center gap-1 text-xs font-bold text-solar-navy hover:text-solar-yellow transition-colors"
      >
        <span>التالي</span>
        <ChevronLeft class="size-4" />
      </button>
    </div>
  </div>
</template>
