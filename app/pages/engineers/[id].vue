<script setup lang="ts">
import {
  ArrowLeft,
  Award,
  BatteryCharging,
  Briefcase,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  FlaskConical,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from 'lucide-vue-next'
import { visitorEngineers } from '~~/app/data/visitor-mock'
import { useAuthModal } from '~~/app/composables/useAuthModal'

const route = useRoute()
const engineerId = route.params.id as string
const authModal = useAuthModal()

const engineer = computed(() => {
  const match = visitorEngineers.find(e => e.id === engineerId) || visitorEngineers[0]
  if (!match) throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  return match
})

useSeoMeta({
  title: computed(() => `${engineer.value.name} | SolarHub`),
  description: computed(() => engineer.value.title),
})

const activeTab = ref<'overview' | 'projects' | 'certificates' | 'reviews'>('overview')

function handleHire() {
  authModal.open({
    title: 'لطلب خدمة هندسية، يرجى تسجيل الدخول',
    message: `سجّل الدخول إلى حسابك أو أنشئ حساباً جديداً لإرسال طلب الخدمة والتواصل مباشرة مع (${engineer.value.name}).`,
    actionType: 'consultation',
  })
}

function handleChat() {
  authModal.open({
    title: 'لبدء المحادثة، يرجى تسجيل الدخول',
    message: `سجّل الدخول إلى حسابك للتواصل مباشرة مع (${engineer.value.name}) ومناقشة تفاصيل مشروعك.`,
    actionType: 'general',
  })
}
</script>

<template>
  <div class="container-page py-6 sm:py-10 flex flex-col gap-8">
    <!-- Breadcrumbs -->
    <nav class="flex flex-wrap items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <NuxtLink to="/engineers" class="hover:text-solar-text-heading">دليل المهندسين المعتمدين</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading truncate">{{ engineer.name }}</span>
    </nav>

    <!-- بطاقة الملف الشخصي الكبيرة العلوية المطابقة لـ visitor_2.png -->
    <div class="solar-card p-6 sm:p-8 flex flex-col gap-6">
      <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <!-- معلومات المهندس والصورة والبيانات -->
        <div class="flex flex-col sm:flex-row items-start gap-5 flex-1 min-w-0">
          <div class="relative shrink-0">
            <img
              :src="engineer.avatar"
              :alt="engineer.name"
              class="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-full object-cover border-4 border-solar-yellow ring-4 ring-solar-bg-subtle shadow-md"
            />
            <span class="absolute bottom-1 left-1 size-4 rounded-full bg-emerald-500 ring-4 ring-white" />
          </div>

          <div class="flex flex-col gap-2.5 text-right flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2.5">
              <h1 class="text-xl sm:text-2xl lg:text-3xl font-black text-solar-text-heading">
                {{ engineer.name }}
              </h1>
              <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                <CheckCircle2 class="size-3.5 text-emerald-600" />
                <span>مهندس معتمد ومفحوص 100%</span>
              </span>
            </div>

            <p class="text-xs sm:text-sm text-solar-text-body leading-relaxed max-w-2xl">
              {{ engineer.title }}
            </p>

            <!-- وسوم الموقع والخبرة والترخيص -->
            <div class="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span class="inline-flex items-center gap-1 rounded-lg bg-solar-bg-subtle px-2.5 py-1 text-solar-text-body font-medium">
                <MapPin class="size-3.5 text-solar-navy" />
                <span>{{ engineer.city }}</span>
              </span>
              <span class="inline-flex items-center gap-1 rounded-lg bg-solar-bg-subtle px-2.5 py-1 text-solar-text-body font-medium">
                <Clock class="size-3.5 text-solar-navy" />
                <span>{{ engineer.experience }}</span>
              </span>
              <span class="inline-flex items-center gap-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/60 px-2.5 py-1 font-bold">
                <Award class="size-3.5 text-amber-600" />
                <span>{{ engineer.license }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- التقييم وزر الطلب والمحادثة -->
        <div class="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0">
          <div class="flex items-center gap-1.5 font-bold text-amber-500">
            <span class="text-sm font-black text-solar-text-heading">{{ engineer.rating }}</span>
            <div class="flex">
              <Star v-for="i in 5" :key="i" class="size-4 fill-amber-400 text-amber-400" />
            </div>
            <span class="text-solar-text-muted text-xs">({{ engineer.reviewsCount }} تقييم موثق)</span>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              @click="handleChat"
              class="flex size-11 items-center justify-center rounded-xl border border-solar-border-card text-solar-text-heading hover:bg-solar-bg-subtle transition-colors shadow-sm"
              aria-label="محادثة"
            >
              <MessageSquare class="size-4.5" />
            </button>

            <button
              type="button"
              @click="handleHire"
              class="btn-dark px-6 py-3 text-xs font-black gap-2 shadow-sm whitespace-nowrap"
            >
              <FileText class="size-4 text-solar-yellow" />
              <span>طلب خدمة هندسية</span>
            </button>
          </div>
        </div>
      </div>

      <!-- الإحصائيات الأربعة الرئيسية في الأسفل المطابقة لـ visitor_2.png -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 border-t border-solar-border-card pt-6 text-center">
        <div class="p-3 rounded-2xl bg-solar-bg-subtle">
          <span class="block text-xl sm:text-2xl font-black text-solar-text-heading">+{{ engineer.projectsCount }}</span>
          <span class="text-xs text-solar-text-muted font-semibold">مشروع معتمد ومنجز</span>
        </div>
        <div class="p-3 rounded-2xl bg-solar-bg-subtle">
          <span class="block text-xl sm:text-2xl font-black text-emerald-600">100%</span>
          <span class="text-xs text-solar-text-muted font-semibold">مطابقة كود البناء السعودي</span>
        </div>
        <div class="p-3 rounded-2xl bg-solar-bg-subtle">
          <span class="block text-xl sm:text-2xl font-black text-solar-text-heading">{{ engineer.responseSpeed }}</span>
          <span class="text-xs text-solar-text-muted font-semibold">متوسط سرعة الرد</span>
        </div>
        <div class="p-3 rounded-2xl bg-solar-bg-subtle">
          <span class="block text-xl sm:text-2xl font-black text-solar-navy-dark">موثق SCE</span>
          <span class="text-xs text-solar-text-muted font-semibold">تحقق يدوي من المنصة</span>
        </div>
      </div>
    </div>

    <!-- بطاقة المحتوى والتبويبات المطابقة لـ visitor_2.png -->
    <div class="solar-card p-6 sm:p-8 flex flex-col gap-8">
      <!-- أزرار التبويبات -->
      <div class="flex items-center gap-6 border-b border-solar-border-card pb-1 overflow-x-auto">
        <button
          type="button"
          @click="activeTab = 'overview'"
          class="pb-3 text-xs sm:text-sm font-black border-b-2 transition-all whitespace-nowrap"
          :class="activeTab === 'overview' ? 'border-solar-yellow text-solar-navy-dark' : 'border-transparent text-solar-text-muted hover:text-solar-text-heading'"
        >
          نظرة عامة
        </button>
        <button
          type="button"
          @click="activeTab = 'projects'"
          class="pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap"
          :class="activeTab === 'projects' ? 'border-solar-yellow text-solar-navy-dark' : 'border-transparent text-solar-text-muted hover:text-solar-text-heading'"
        >
          معرض المشاريع
        </button>
        <button
          type="button"
          @click="activeTab = 'certificates'"
          class="pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap"
          :class="activeTab === 'certificates' ? 'border-solar-yellow text-solar-navy-dark' : 'border-transparent text-solar-text-muted hover:text-solar-text-heading'"
        >
          الاعتمادات والشهادات
        </button>
        <button
          type="button"
          @click="activeTab = 'reviews'"
          class="pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap"
          :class="activeTab === 'reviews' ? 'border-solar-yellow text-solar-navy-dark' : 'border-transparent text-solar-text-muted hover:text-solar-text-heading'"
        >
          التقييمات والآراء ({{ engineer.reviewsCount }})
        </button>
      </div>

      <!-- محتوى تبويب "نظرة عامة" -->
      <div v-if="activeTab === 'overview'" class="flex flex-col gap-8">
        <!-- 1. النبذة المهنية -->
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2">
            <span class="h-4 w-1.5 rounded-full bg-solar-yellow" />
            <h2 class="text-sm sm:text-base font-black text-solar-text-heading">النبذة المهنية</h2>
          </div>
          <p class="text-xs sm:text-sm text-solar-text-body leading-relaxed bg-solar-bg-subtle/50 p-4 rounded-2xl border border-solar-border-card">
            {{ engineer.bio }}
          </p>
        </div>

        <!-- 2. مجالات التخصص الدقيقة (4 كروت شبكية 2x2) -->
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2">
            <span class="h-4 w-1.5 rounded-full bg-solar-yellow" />
            <h2 class="text-sm sm:text-base font-black text-solar-text-heading">مجالات التخصص الدقيقة</h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div
              v-for="spec in engineer.specialties"
              :key="spec.title"
              class="flex items-start gap-3.5 p-4 rounded-2xl border border-solar-border-card bg-white shadow-sm"
            >
              <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/15 text-solar-navy-dark">
                <Zap v-if="spec.icon === 'Zap'" class="size-5 text-amber-500" />
                <FlaskConical v-else-if="spec.icon === 'FlaskConical'" class="size-5 text-emerald-600" />
                <BatteryCharging v-else-if="spec.icon === 'BatteryCharging'" class="size-5 text-amber-600" />
                <ShieldCheck v-else class="size-5 text-blue-600" />
              </div>
              <div class="text-right">
                <h3 class="text-xs sm:text-sm font-black text-solar-text-heading mb-1">{{ spec.title }}</h3>
                <p class="text-[11px] text-solar-text-muted leading-relaxed">{{ spec.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. كيف تسير الاستشارة الهندسية عبر منصة سولار هب؟ (3 خطوات دائرية مرقمة) -->
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2">
            <span class="h-4 w-1.5 rounded-full bg-solar-yellow" />
            <h2 class="text-sm sm:text-base font-black text-solar-text-heading">كيف تسير الاستشارة الهندسية عبر منصة سولار هب؟</h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-3 p-5 rounded-2xl bg-solar-bg-subtle border border-solar-border-card">
            <div class="flex items-center gap-3">
              <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-solar-navy text-white text-xs font-black shadow-sm">
                1
              </span>
              <p class="text-xs font-semibold text-solar-text-heading">استلام بيانات الموقع وقراءات الاستهلاك عبر المنصة.</p>
            </div>

            <div class="flex items-center gap-3">
              <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-solar-navy text-white text-xs font-black shadow-sm">
                2
              </span>
              <p class="text-xs font-semibold text-solar-text-heading">إجراء محاكاة PVsyst وإعداد المخططات الفنية المعتمدة.</p>
            </div>

            <div class="flex items-center gap-3">
              <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-solar-navy text-white text-xs font-black shadow-sm">
                3
              </span>
              <p class="text-xs font-semibold text-solar-text-heading">تسليم التقرير الهندسي الشامل مع جلسة مناقشة وتوضيح.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- تبويب معرض المشاريع -->
      <div v-else-if="activeTab === 'projects'" class="grid gap-4 sm:grid-cols-2">
        <div class="solar-card p-4">
          <h4 class="text-xs font-bold text-solar-text-heading mb-1">محطة أسقف مصنع مياه هنا (1.2MW On-Grid)</h4>
          <p class="text-[11px] text-solar-text-muted">تصميم ومحاكاة PVsyst وإعداد كراسة المواصفات لربط شبكة الجهد المتوسط.</p>
        </div>
        <div class="solar-card p-4">
          <h4 class="text-xs font-bold text-solar-text-heading mb-1">منظومة ضخ مياه زراعية لمزرعة نخل (75kW Off-Grid)</h4>
          <p class="text-[11px] text-solar-text-muted">تحجيم مضخات غاطسة بنظام إنفرتر متغير التردد VFD لتوفير الديزل بنسبة 100%.</p>
        </div>
      </div>

      <!-- تبويب الاعتمادات -->
      <div v-else-if="activeTab === 'certificates'" class="space-y-3">
        <div class="flex items-center justify-between p-3.5 rounded-xl border border-solar-border-card bg-solar-bg-subtle text-xs">
          <span class="font-bold text-solar-text-heading">الهيئة السعودية للمهندسين - مرتبة استشاري نظم طاقة متجددة</span>
          <span class="text-emerald-700 font-bold">سارية وموثقة</span>
        </div>
        <div class="flex items-center justify-between p-3.5 rounded-xl border border-solar-border-card bg-solar-bg-subtle text-xs">
          <span class="font-bold text-solar-text-heading">شهادة محاكاة متقدمة معتمدة PVsyst Professional</span>
          <span class="text-emerald-700 font-bold">معتمدة</span>
        </div>
      </div>

      <!-- تبويب التقييمات -->
      <div v-else class="space-y-4">
        <div class="border-b border-solar-border-card pb-3">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-bold text-solar-text-heading">شركة الواحة للاستثمار الصناعي</span>
            <div class="flex text-amber-400"><Star v-for="i in 5" :key="i" class="size-3.5 fill-amber-400" /></div>
          </div>
          <p class="text-xs text-solar-text-body">دراسة جدوى وافية جداً وحسابات دقيقة وفرت علينا تكاليف إنفرترات زائدة في المحطة.</p>
        </div>
      </div>
    </div>
  </div>
</template>
