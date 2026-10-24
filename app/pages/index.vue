<script setup lang="ts">
import {
  ArrowLeft,
  Award,
  BatteryCharging,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  FileCheck2,
  FileText,
  Heart,
  Layers,
  MapPin,
  Package,
  Percent,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Sun,
  Truck,
  Users,
  Wrench,
  Zap,
} from 'lucide-vue-next'
import { visitorProducts, visitorEngineers, visitorStores } from '~~/app/data/visitor-mock'
import { useAuthModal } from '~~/app/composables/useAuthModal'

useSeoMeta({
  title: 'سولار هب | وجهتك الموثوقة لمنظومات ومنتجات الطاقة الشمسية المتكاملة',
  description: 'ربط مباشر بأفضل المتاجر المعتمدة والمهندسين المرخصين لتصميم وتركيب أنظمة طاقة شمسية مستدامة وعالية الكفاءة بضمانات رسمية معتمدة.',
})

const authModal = useAuthModal()

// تصنيفات الأقسام الأكثر طلباً
const topCategories = [
  { label: 'الألواح الشمسية', sub: 'Monocrystalline & Bifacial', icon: Sun, query: 'panel' },
  { label: 'محولات الطاقة', sub: 'On-Grid, Off-Grid & Hybrid', icon: Zap, query: 'inverter' },
  { label: 'أنظمة التخزين', sub: 'Lithium LiFePO4 & Gel', icon: BatteryCharging, query: 'battery' },
  { label: 'مضخات المياه', sub: 'Solar Water Pumping', icon: Compass, query: 'pump' },
  { label: 'هياكل التثبيت', sub: 'Mounting & DC Cables', icon: Layers, query: 'accessories' },
  { label: 'أدوات التحكم', sub: 'Smart Trackers & MPPT', icon: Cpu, query: 'controller' },
]

// قائمة تبويبات المنتجات
const productTabs = [
  { id: 'all', label: 'الكل' },
  { id: 'panel', label: 'ألواح شمسية' },
  { id: 'inverter', label: 'محولات هجينة' },
  { id: 'battery', label: 'بطاريات ليثيوم' },
  { id: 'kit', label: 'أنظمة متكاملة' },
] as const

type ProductTabId = typeof productTabs[number]['id']

// التبويب النشط
const activeProductTab = ref<ProductTabId>('all')

const filteredProducts = computed(() => {
  if (activeProductTab.value === 'all') {
    return visitorProducts.slice(0, 4)
  }
  return visitorProducts.filter(p => p.categoryType === activeProductTab.value).slice(0, 4)
})

function handleProductQuote(productName: string) {
  authModal.open({
    title: 'لإرسال طلب عرض سعر، يرجى تسجيل الدخول',
    message: `سجّل الدخول إلى حسابك أو أنشئ حساباً جديداً لتتمكن من إرسال طلب عرض سعر لـ (${productName}) ومتابعة عروضك مباشرة.`,
    actionType: 'quote',
  })
}

function handleEngineerConsult(engineerName: string) {
  authModal.open({
    title: 'لطلب استشارة هندسية، يرجى تسجيل الدخول',
    message: `سجّل الدخول أو أنشئ حساباً لتتمكن من حجز جلسة استشارة فنية مع (${engineerName}) وإرسال تفاصيل مشروعك.`,
    actionType: 'consultation',
  })
}

function handleProjectCta() {
  authModal.open({
    title: 'لطرح مشروعك وطلب المناقصات، يرجى تسجيل الدخول',
    message: 'سجّل الدخول إلى حسابك لطرح مواصفات مشروعك واستقبال عروض الأسعار والدراسات الهندسية المعتمدة.',
    actionType: 'project',
  })
}
</script>

<template>
  <div class="flex flex-col gap-16 sm:gap-24 pb-20">
    <!-- 1. البانر الرئيسي للزائر (Hero Section) المطابق لـ visitor_1.png -->
    <section class="relative overflow-hidden bg-gradient-to-b from-solar-bg-card via-solar-bg-subtle/50 to-solar-bg-page pt-8 sm:pt-14 pb-12 sm:pb-16 border-b border-solar-border-card/60 transition-colors duration-200">
      <div class="container-page grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <!-- النص والبيانات على اليمين (RTL) -->
        <div class="flex flex-col gap-5 lg:col-span-7 text-right">
          <div class="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-950/40 px-3.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-sm">
            <span class="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>منصة الطاقة المتجددة المعتمدة في اليمن</span>
          </div>

          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-solar-text-heading leading-[1.25] tracking-tight">
            وجهتك الموثوقة لمنظومات ومنتجات
            <span class="text-solar-yellow underline decoration-solar-yellow/40 underline-offset-8">الطاقة الشمسية</span>
            المتكاملة
          </h1>

          <p class="text-sm sm:text-base leading-relaxed text-solar-text-body max-w-2xl">
            ربط مباشر بأفضل المتاجر المعتمدة والمهندسين المرخصين لتصميم وتركيب أنظمة طاقة شمسية مستدامة وعالية الكفاءة بضمانات رسمية معتمدة.
          </p>

          <div class="flex flex-wrap items-center gap-3.5 pt-2">
            <NuxtLink to="/products" class="btn-primary h-12 px-6 text-sm font-black gap-2 shadow-md">
              <ShoppingBag class="size-4.5" />
              <span>تصفح المنتجات</span>
            </NuxtLink>

            <button
              type="button"
              @click="handleProjectCta"
              class="btn-outline h-12 px-6 text-sm font-bold gap-2"
            >
              <FileText class="size-4.5 text-solar-navy dark:text-solar-yellow" />
              <span>طلب استشارة / طرح مشروع</span>
            </button>

            <NuxtLink
              to="/admin"
              class="flex items-center gap-2 h-12 px-5 text-sm font-bold rounded-xl bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md transition-all hover:scale-[1.02] active:scale-95 border border-white/10"
              title="الانتقال إلى لوحة تحكم الأدمن"
            >
              <ShieldCheck class="size-4.5 text-solar-yellow stroke-[2.5]" />
              <span>لوحة تحكم الأدمن</span>
            </NuxtLink>
          </div>
        </div>

        <!-- الصورة على اليسار -->
        <div class="relative lg:col-span-5">
          <div class="relative overflow-hidden rounded-3xl border border-solar-border-card bg-solar-bg-card p-2 shadow-2xl">
            <img
              src="/images/hero-solar.png"
              alt="محطة ألواح طاقة شمسية كهروضوئية متكاملة"
              class="aspect-[4/3] w-full rounded-2xl object-cover"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 2. قسم "كيف تخدمك منصة سولار هب؟" (3 مسارات رئيسية) -->
    <section class="container-page">
      <div class="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <span class="text-xs font-black text-solar-yellow uppercase tracking-widest">حلول متكاملة لجميع الاستخدامات</span>
        <h2 class="text-2xl sm:text-3xl font-black text-solar-text-heading mt-2 mb-3">كيف تخدمك منصة سولار هب؟</h2>
        <p class="text-xs sm:text-sm text-solar-text-body">
          مسارات واضحة وسريعة تلبي كافة احتياجاتك السكنية، التجارية، والمشاريع الزراعية الضخمة.
        </p>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <!-- المسار 1: شراء منتجات -->
        <div class="solar-card flex flex-col justify-between p-6 sm:p-7 hover:-translate-y-1 transition-all duration-300">
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="flex size-12 items-center justify-center rounded-2xl bg-solar-yellow/15 text-solar-navy-dark dark:text-solar-yellow">
                <Sun class="size-6 text-amber-500" />
              </span>
              <span class="text-[11px] font-black text-solar-text-muted">المسار الأول</span>
            </div>
            <h3 class="text-base sm:text-lg font-black text-solar-text-heading mb-2">شراء منتجات ومكونات الطاقة</h3>
            <p class="text-xs text-solar-text-body leading-relaxed mb-6">
              اقتن أحدث الألواح الشمسية أحادية وثنائية الوجه، الإنفرترات الهجينة، بطاريات الليثيوم، وهياكل التثبيت المعتمدة ذات أعلى مستويات الكفاءة.
            </p>

            <ul class="flex flex-col gap-2.5 text-xs text-solar-text-body mb-8">
              <li class="flex items-center gap-2">
                <CheckCircle2 class="size-4 text-emerald-500 shrink-0" />
                <span>منتجات معتمدة ذات تصنيف عالمي Tier 1</span>
              </li>
              <li class="flex items-center gap-2">
                <CheckCircle2 class="size-4 text-emerald-500 shrink-0" />
                <span>ضمانات للمعدات تصل إلى 25 سنة</span>
              </li>
              <li class="flex items-center gap-2">
                <CheckCircle2 class="size-4 text-emerald-500 shrink-0" />
                <span>مقارنة شفافة للأسعار والمواصفات</span>
              </li>
            </ul>
          </div>

          <NuxtLink to="/products" class="btn-primary w-full py-2.5 text-xs font-black gap-2 justify-center shadow-sm">
            <span>تصفح كتالوج المنتجات</span>
            <ArrowLeft class="size-4" />
          </NuxtLink>
        </div>

        <!-- المسار 2: مهندس معتمد -->
        <div class="solar-card flex flex-col justify-between p-6 sm:p-7 hover:-translate-y-1 transition-all duration-300 border-solar-yellow/40">
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="flex size-12 items-center justify-center rounded-2xl bg-solar-yellow/15 text-solar-navy-dark dark:text-solar-yellow">
                <Users class="size-6 text-amber-500" />
              </span>
              <span class="text-[11px] font-black text-solar-text-muted">المسار الثاني</span>
            </div>
            <h3 class="text-base sm:text-lg font-black text-solar-text-heading mb-2">العثور على مهندس معتمد</h3>
            <p class="text-xs text-solar-text-body leading-relaxed mb-6">
              استعن بنخبة الاستشاريين المرخصين لإعداد الدراسات الهندسية، قياس الأحمال، والإشراف الدقيق على عمليات التركيب والفحص الفني.
            </p>

            <ul class="flex flex-col gap-2.5 text-xs text-solar-text-body mb-8">
              <li class="flex items-center gap-2">
                <CheckCircle2 class="size-4 text-emerald-500 shrink-0" />
                <span>مهندسون معتمدون ومرخصون رسمياً</span>
              </li>
              <li class="flex items-center gap-2">
                <CheckCircle2 class="size-4 text-emerald-500 shrink-0" />
                <span>حساب دقيق لإنتاجية الطاقة والعائد المالي</span>
              </li>
              <li class="flex items-center gap-2">
                <CheckCircle2 class="size-4 text-emerald-500 shrink-0" />
                <span>فحص كفاءة وأمان التمديدات الكهربائية</span>
              </li>
            </ul>
          </div>

          <NuxtLink to="/engineers" class="btn-primary w-full py-2.5 text-xs font-black gap-2 justify-center shadow-sm">
            <span>استكشف المهندسين</span>
            <ArrowLeft class="size-4" />
          </NuxtLink>
        </div>

        <!-- المسار 3: متاجر وموردون -->
        <div class="solar-card flex flex-col justify-between p-6 sm:p-7 hover:-translate-y-1 transition-all duration-300">
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="flex size-12 items-center justify-center rounded-2xl bg-solar-yellow/15 text-solar-navy-dark dark:text-solar-yellow">
                <Store class="size-6 text-amber-500" />
              </span>
              <span class="text-[11px] font-black text-solar-text-muted">المسار الثالث</span>
            </div>
            <h3 class="text-base sm:text-lg font-black text-solar-text-heading mb-2">التواصل مع المتاجر والموردين</h3>
            <p class="text-xs text-solar-text-body leading-relaxed mb-6">
              تواصل مع كبار الموزعين والوكلاء المعتمدين، اطلب عروض أسعار للمشاريع الكبيرة، واحصل على فواتير رسمية وشهادات جودة.
            </p>

            <ul class="flex flex-col gap-2.5 text-xs text-solar-text-body mb-8">
              <li class="flex items-center gap-2">
                <CheckCircle2 class="size-4 text-emerald-500 shrink-0" />
                <span>متاجر موثقة بسجلات تجارية نظامية</span>
              </li>
              <li class="flex items-center gap-2">
                <CheckCircle2 class="size-4 text-emerald-500 shrink-0" />
                <span>أسعار تنافسية وخيارات شحن مباشر</span>
              </li>
              <li class="flex items-center gap-2">
                <CheckCircle2 class="size-4 text-emerald-500 shrink-0" />
                <span>دعم فني وتوفير قطع الغيار الأصلية</span>
              </li>
            </ul>
          </div>

          <NuxtLink to="/stores" class="btn-primary w-full py-2.5 text-xs font-black gap-2 justify-center shadow-sm">
            <span>دليل المتاجر المعتمدة</span>
            <ArrowLeft class="size-4" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 3. قسم "الأقسام الرئيسية الأكثر طلباً" -->
    <section class="container-page">
      <div class="text-center max-w-2xl mx-auto mb-10">
        <span class="text-xs font-black text-solar-yellow uppercase tracking-widest">أقسام المنتجات المتخصصة</span>
        <h2 class="text-2xl sm:text-3xl font-black text-solar-text-heading mt-1 mb-2">الأقسام الرئيسية الأكثر طلباً</h2>
        <p class="text-xs sm:text-sm text-solar-text-body">تصفح حلول الطاقة الشمسية المصممة لتلائم مناخ منطقتنا بكفاءة تشغيلية فائقة</p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        <NuxtLink
          v-for="cat in topCategories"
          :key="cat.label"
          :to="`/products?type=${cat.query}`"
          class="flex flex-col items-center justify-center text-center p-4 sm:p-5 rounded-2xl bg-solar-bg-card border border-solar-border-card shadow-sm hover:border-solar-yellow hover:shadow-md transition-all group"
        >
          <span class="flex size-13 sm:size-14 items-center justify-center rounded-2xl bg-solar-bg-subtle text-solar-navy dark:text-solar-yellow group-hover:bg-solar-yellow group-hover:text-solar-navy-dark transition-colors mb-3">
            <component :is="cat.icon" class="size-6.5" />
          </span>
          <h3 class="text-xs sm:text-sm font-black text-solar-text-heading group-hover:text-solar-navy dark:group-hover:text-solar-yellow transition-colors">{{ cat.label }}</h3>
          <span class="text-[10px] text-solar-text-muted mt-0.5 truncate w-full">{{ cat.sub }}</span>
        </NuxtLink>
      </div>
    </section>

    <!-- 4. قسم "أحدث وأبرز المنتجات الشمسية" مع التبويبات -->
    <section class="container-page">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span class="text-xs font-black text-solar-yellow uppercase tracking-widest">منتجات موثقة ومضمونة</span>
          <h2 class="text-2xl sm:text-3xl font-black text-solar-text-heading mt-1">أحدث وأبرز المنتجات الشمسية</h2>
        </div>

        <!-- أزرار التبويبات التفاعلية المتجاوبة -->
        <div class="flex items-center gap-1.5 p-1 rounded-xl bg-solar-bg-card border border-solar-border-card shadow-sm text-xs font-bold overflow-x-auto">
          <button
            v-for="tab in productTabs"
            :key="tab.id"
            type="button"
            @click="activeProductTab = tab.id"
            class="px-3.5 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer select-none"
            :class="activeProductTab === tab.id
              ? 'bg-solar-yellow text-solar-navy-dark font-black shadow-sm'
              : 'text-solar-text-body hover:text-solar-text-heading hover:bg-solar-bg-subtle'"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- بطاقات المنتجات الأربعة المطابقة لتصميم visitor_1.png -->
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <!-- حالة عدم وجود منتجات -->
        <div
          v-if="filteredProducts.length === 0"
          class="col-span-full flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-solar-border-card bg-solar-bg-card"
        >
          <Package class="size-12 text-solar-text-muted mb-3 opacity-60" />
          <h4 class="text-sm font-bold text-solar-text-heading">لا توجد منتجات متوفرة حالياً في هذا القسم</h4>
          <p class="text-xs text-solar-text-muted mt-1">يرجى اختيار تبويب آخر لعرض المنتجات.</p>
        </div>

        <!-- بطاقات المنتجات -->
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="solar-card flex flex-col justify-between overflow-hidden p-4 hover:border-solar-yellow transition-all"
        >
          <div>
            <!-- الصورة والعلامة المائية للماركة -->
            <div class="relative mb-3 flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-solar-bg-subtle p-3 overflow-hidden">
              <img
                :src="product.image"
                :alt="product.name"
                class="h-full w-full object-contain"
                loading="lazy"
              />
              <span class="absolute bottom-2 left-2 rounded-md bg-solar-bg-card/90 px-2 py-0.5 text-[10px] font-bold text-solar-navy dark:text-solar-yellow border border-solar-border-card/40 shadow-sm">
                {{ product.brand }}
              </span>
              <button
                type="button"
                @click="handleProductQuote(product.name)"
                class="absolute top-2 left-2 flex size-7 items-center justify-center rounded-full bg-solar-bg-card/90 text-solar-text-muted hover:text-rose-500 border border-solar-border-card/40 shadow-sm"
                aria-label="إضافة للمفضلة"
              >
                <Heart class="size-3.5" />
              </button>
            </div>

            <!-- التقييم والنوع -->
            <div class="flex items-center justify-between gap-2 text-xs mb-1.5">
              <span class="text-solar-text-muted text-[11px]">{{ product.category }}</span>
              <div class="flex items-center gap-1 font-bold text-amber-500">
                <Star class="size-3.5 fill-amber-400 text-amber-400" />
                <span>{{ product.rating }}</span>
              </div>
            </div>

            <!-- الاسم -->
            <h3 class="text-xs sm:text-sm font-black text-solar-text-heading line-clamp-2 leading-snug mb-2" :title="product.name">
              {{ product.name }}
            </h3>

            <!-- المتجر -->
            <div class="flex items-center gap-1.5 text-[11px] text-solar-text-muted mb-4">
              <Store class="size-3.5 shrink-0" />
              <span class="truncate">{{ product.storeName }}</span>
            </div>
          </div>

          <!-- الأزرار -->
          <div class="flex flex-col gap-2 pt-2 border-t border-solar-border-card/60">
            <button
              type="button"
              @click="handleProductQuote(product.name)"
              class="btn-primary w-full py-2 text-xs font-black gap-1.5 justify-center shadow-sm"
            >
              <FileText class="size-3.5" />
              <span>طلب سعر</span>
            </button>
            <NuxtLink
              :to="`/products/${product.id}`"
              class="text-center text-xs font-bold text-solar-text-body hover:text-solar-navy dark:hover:text-solar-yellow transition-colors flex items-center justify-center gap-1"
            >
              <span>عرض تفاصيل المنتج</span>
              <ArrowLeft class="size-3" />
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- زر الانتقال لجميع المنتجات -->
      <div class="text-center mt-10">
        <NuxtLink to="/products" class="btn-outline px-8 py-3 text-xs font-black gap-2 shadow-sm hover:border-solar-yellow">
          <span>مشاهدة جميع المنتجات (+5,000)</span>
          <ArrowLeft class="size-4" />
        </NuxtLink>
      </div>
    </section>

    <!-- 5. قسم "مهندسون واستشاريون موثوقون لمشروعك" -->
    <section class="container-page">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span class="text-xs font-black text-solar-yellow uppercase tracking-widest">خبرات هندسية موثقة</span>
          <h2 class="text-2xl sm:text-3xl font-black text-solar-text-heading mt-1">مهندسون واستشاريون موثوقون لمشروعك</h2>
          <p class="text-xs text-solar-text-muted mt-1 max-w-xl">
            اختر مهندسك المعتمد لتصميم ومراجعة مخططاتك الشمسية وضمان مطابقتها لأعلى المعايير والمواصفات الهندسية العالمية.
          </p>
        </div>

        <NuxtLink to="/engineers" class="btn-outline px-4 py-2 text-xs font-bold gap-1.5 shrink-0">
          <span>دليل المهندسين بالكامل</span>
          <ArrowLeft class="size-3.5" />
        </NuxtLink>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="eng in visitorEngineers.slice(0, 3)"
          :key="eng.id"
          class="solar-card flex flex-col justify-between p-5 hover:border-solar-yellow transition-all"
        >
          <div>
            <!-- رأس بطاقة المهندس: الصورة مع النقطة الخضراء والبادج المعتمد المطابق لـ visitor_1.png -->
            <div class="flex items-start justify-between gap-3 mb-3">
              <span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 class="size-3 text-emerald-600 dark:text-emerald-400" />
                <span>معتمد</span>
              </span>

              <div class="relative shrink-0">
                <img
                  :src="eng.avatar"
                  :alt="eng.name"
                  class="w-14 h-14 shrink-0 rounded-full object-cover border-2 border-solar-yellow ring-2 ring-solar-bg-card shadow-sm"
                />
                <span class="absolute bottom-0 left-0 size-3 rounded-full bg-emerald-500 ring-2 ring-solar-bg-card" />
              </div>
            </div>

            <!-- الاسم والتخصص والوصف بعرض كامل وتنسيق متناسق -->
            <div class="text-right mb-3">
              <h3 class="text-base font-black text-solar-text-heading">{{ eng.name }}</h3>
              <p class="text-xs font-bold text-solar-navy dark:text-solar-yellow mt-0.5">{{ eng.specialty }}</p>
              <p class="text-xs text-solar-text-body line-clamp-2 leading-relaxed mt-1.5">
                {{ eng.bio }}
              </p>
            </div>

            <!-- معلومات الخبرة والموقع والمشاريع -->
            <div class="grid grid-cols-2 gap-2 text-[11px] text-solar-text-muted border-y border-solar-border-card/60 py-3 mb-4">
              <span class="flex items-center gap-1.5 truncate">
                <Clock class="size-3.5 text-solar-navy dark:text-solar-yellow shrink-0" />
                {{ eng.experience.split('(')[0] }}
              </span>
              <span class="flex items-center gap-1.5 truncate">
                <MapPin class="size-3.5 text-solar-navy dark:text-solar-yellow shrink-0" />
                {{ eng.city.split('،')[0] }}
              </span>
              <span class="flex items-center gap-1.5">
                <Star class="size-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <span class="font-bold text-solar-text-heading">{{ eng.rating }}</span> ({{ eng.reviewsCount }} تقييم)
              </span>
              <span class="flex items-center gap-1.5 font-semibold text-solar-navy dark:text-solar-yellow">
                <Award class="size-3.5 text-solar-yellow shrink-0" />
                {{ eng.projectsCount }} مشروع منجز
              </span>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <button
              type="button"
              @click="handleEngineerConsult(eng.name)"
              class="btn-primary w-full py-2.5 text-xs font-black gap-1.5 justify-center shadow-sm"
            >
              <FileCheck2 class="size-3.5" />
              <span>طلب استشارة</span>
            </button>
            <NuxtLink
              :to="`/engineers/${eng.id}`"
              class="text-center text-xs font-bold text-solar-text-body hover:text-solar-navy dark:hover:text-solar-yellow transition-colors flex items-center justify-center gap-1"
            >
              <span>عرض الملف الشخصي</span>
              <ArrowLeft class="size-3" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. قسم "المتاجر والوكلاء المعتمدون" -->
    <section class="container-page">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span class="text-xs font-black text-solar-yellow uppercase tracking-widest">شركاء التوريد الموثوقون</span>
          <h2 class="text-2xl sm:text-3xl font-black text-solar-text-heading mt-1">المتاجر والوكلاء المعتمدون</h2>
          <p class="text-xs text-solar-text-muted mt-1 max-w-xl">
            متاجر رسمية مرخصة توفر فواتير معتمدة، شحن سريع لجميع المحافظات والمدن، وضمانات المصنّعين الأصلية.
          </p>
        </div>

        <NuxtLink to="/stores" class="btn-outline px-4 py-2 text-xs font-bold gap-1.5 shrink-0">
          <span>استعراض جميع المتاجر</span>
          <ArrowLeft class="size-3.5" />
        </NuxtLink>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="store in visitorStores.slice(0, 3)"
          :key="store.id"
          class="solar-card flex flex-col justify-between p-5 hover:border-solar-yellow transition-all"
        >
          <div>
            <!-- الرأس والبادج -->
            <div class="flex items-start justify-between gap-3 mb-4">
              <span class="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <ShieldCheck class="size-3 text-blue-600 dark:text-blue-400" />
                <span>{{ store.badge }}</span>
              </span>

              <div class="flex items-center gap-2.5">
                <div class="text-right">
                  <h3 class="text-sm font-black text-solar-text-heading line-clamp-1">{{ store.name }}</h3>
                  <p class="text-[11px] text-solar-text-muted flex items-center justify-end gap-1">
                    <MapPin class="size-3" />
                    <span>{{ store.city }}</span>
                  </p>
                </div>
                <div class="size-11 rounded-xl bg-solar-navy text-white flex items-center justify-center font-black text-xs shadow-sm">
                  {{ store.name.substring(0, 2) }}
                </div>
              </div>
            </div>

            <!-- إحصائيات المتجر -->
            <div class="grid grid-cols-2 gap-2 text-center p-2.5 rounded-xl bg-solar-bg-subtle mb-4">
              <div>
                <span class="block text-sm font-black text-solar-navy-dark dark:text-solar-yellow">{{ store.productsCount }}</span>
                <span class="text-[10px] text-solar-text-muted">منتج معتمد</span>
              </div>
              <div class="border-r border-solar-border-card">
                <span class="block text-sm font-black text-amber-500">★ {{ store.rating }}</span>
                <span class="text-[10px] text-solar-text-muted">تقييم المعتمدين</span>
              </div>
            </div>

            <!-- الوسوم والماركات -->
            <div class="flex flex-wrap gap-1.5 mb-5">
              <span
                v-for="tag in store.tags"
                :key="tag"
                class="rounded-md bg-solar-bg-card border border-solar-border-card px-2 py-0.5 text-[10px] text-solar-text-body font-medium"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <NuxtLink
            :to="`/stores/${store.id}`"
            class="btn-primary w-full py-2.5 text-xs font-black gap-2 justify-center shadow-sm"
          >
            <span>زيارة المتجر ومنتجاته</span>
            <ArrowLeft class="size-3.5" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 7. بانر طلب العروض والمناقصات (CTA Banner) المطابق لـ visitor_1.png -->
    <section class="container-page">
      <div class="relative overflow-hidden rounded-3xl bg-solar-navy-dark p-8 sm:p-12 lg:p-14 text-white shadow-2xl border border-white/10">
        <div class="grid gap-8 lg:grid-cols-12 items-center">
          <!-- الجانب الأيمن: النص والعنوان والزر -->
          <div class="flex flex-col gap-4 lg:col-span-7">
            <span class="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-solar-yellow border border-white/10">
              <Sparkles class="size-3.5" />
              <span>خدمة طلب العروض والمناقصات</span>
            </span>

            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
              هل تخطط لتركيب نظام طاقة شمسية لمنزلك، مزرعتك أو مصنعك؟
            </h2>

            <p class="text-xs sm:text-sm text-white/70 leading-relaxed max-w-xl">
              اطرح مواصفات مشروعك واستقبل عروض أسعار تنافسية ومخططات أولية مباشرة من كبار المهندسين والموردين المعتمدين خلال 24 ساعة بكل سهولة ودون التزام.
            </p>

            <div class="pt-2">
              <button
                type="button"
                @click="handleProjectCta"
                class="btn-primary px-8 py-3.5 text-sm font-black gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <span>اطرح مشروعك الآن</span>
                <ArrowLeft class="size-4" />
              </button>
            </div>
          </div>

          <!-- الجانب الأيسر: الصناديق الثلاثة للميزات -->
          <div class="flex flex-col gap-3 lg:col-span-5">
            <div class="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-yellow">
                <Clock class="size-5" />
              </span>
              <div class="text-right">
                <h4 class="text-xs font-black text-white">استجابة سريعة خلال 24 ساعة</h4>
                <p class="text-[11px] text-white/60">مقارنة 3 عروض على الأقل</p>
              </div>
            </div>

            <div class="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-yellow">
                <ShieldCheck class="size-5" />
              </span>
              <div class="text-right">
                <h4 class="text-xs font-black text-white">ضمان وموثوقية العقود</h4>
                <p class="text-[11px] text-white/60">إشراف هندسي وتوثيق رسمي</p>
              </div>
            </div>

            <div class="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-yellow">
                <Percent class="size-5" />
              </span>
              <div class="text-right">
                <h4 class="text-xs font-black text-white">توفير يصل إلى 20%</h4>
                <p class="text-[11px] text-white/60">شراء مباشر من الوكلاء دون وسطاء</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
