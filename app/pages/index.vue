<script setup lang="ts">
import {
  AlertCircle,
  ArrowLeft,
  Award,
  BatteryCharging,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  Layers,
  MapPin,
  Package,
  Percent,
  RotateCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Sun,
  Users,
  Zap,
} from 'lucide-vue-next'
import { useVisitorLanding } from '~/composables/useVisitorLanding'
import VisitorDetailModal from '~/components/visitor/VisitorDetailModal.vue'
import type { VisitorProductItem, VisitorStoreItem, VisitorEngineerItem } from '~/types/visitor'

useSeoMeta({
  title: 'سولار هب | وجهتك الموثوقة لمنظومات ومنتجات الطاقة الشمسية المتكاملة',
  description: 'ربط مباشر بأفضل المتاجر المعتمدة والمهندسين المرخصين لتصميم وتركيب أنظمة طاقة شمسية مستدامة وعالية الكفاءة بضمانات رسمية معتمدة.',
})

// تصنيفات الأقسام الأكثر طلباً (المطابقة تماماً لتصميم المنصة المعتمد)
const topCategories = [
  { label: 'الألواح الشمسية', sub: 'Monocrystalline & Bifacial', icon: Sun, query: 'panel' },
  { label: 'محولات الطاقة', sub: 'On-Grid, Off-Grid & Hybrid', icon: Zap, query: 'inverter' },
  { label: 'أنظمة التخزين', sub: 'Lithium LiFePO4 & Gel', icon: BatteryCharging, query: 'battery' },
  { label: 'مضخات المياه', sub: 'Solar Water Pumping', icon: Compass, query: 'pump' },
  { label: 'هياكل التثبيت', sub: 'Mounting & DC Cables', icon: Layers, query: 'accessories' },
  { label: 'أدوات التحكم', sub: 'Smart Trackers & MPPT', icon: Cpu, query: 'controller' },
]

// استدعاء البيانات الحقيقية من قاعدة البيانات ومؤقت الـ 50 ثانية
const {
  allProducts,
  allStores,
  allEngineers,
  displayedProducts,
  displayedStores,
  displayedEngineers,
  isLoading,
  errorMessage,
  secondsLeft,
  timerProgress,
  stats,
  fetchVisitorData,
  shuffleProductsNow,
  shuffleStoresNow,
  shuffleEngineersNow,
} = useVisitorLanding()

// نافذة التفاصيل الإيضاحية للقراءة فقط (Browse-Only Modal)
const isDetailModalOpen = ref(false)
const detailType = ref<'product' | 'store' | 'engineer' | null>(null)
const selectedDetailItem = ref<VisitorProductItem | VisitorStoreItem | VisitorEngineerItem | null>(null)

function openDetail(type: 'product' | 'store' | 'engineer', item: any) {
  detailType.value = type
  selectedDetailItem.value = item
  isDetailModalOpen.value = true
}

function closeDetail() {
  isDetailModalOpen.value = false
  detailType.value = null
  selectedDetailItem.value = null
}
</script>

<template>
  <div class="flex flex-col gap-14 sm:gap-20 pb-20">
    <!-- شريط تنبيه الخطأ عند تعذر الاتصال بالخادم -->
    <div v-if="errorMessage" class="container-page pt-4">
      <div class="solar-card border-rose-200 bg-rose-50/70 dark:bg-rose-950/30 p-4 flex items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-200 rounded-2xl">
        <div class="flex items-center gap-2.5">
          <AlertCircle class="size-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <span class="font-bold">{{ errorMessage }}</span>
        </div>
        <button
          type="button"
          @click="fetchVisitorData"
          class="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors shrink-0 cursor-pointer"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- 1. البانر الرئيسي للزائر (Hero Section) المطابق للتصميم السابق -->
    <!-- ============================================================ -->
    <section class="relative overflow-hidden bg-gradient-to-b from-solar-bg-card via-solar-bg-subtle/50 to-solar-bg-page pt-6 sm:pt-12 pb-10 sm:pb-14 border-b border-solar-border-card/60 transition-colors duration-200">
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

          <!-- بطاقات الإحصائيات الحية المسترجعة من قاعدة البيانات -->
          <div class="grid grid-cols-3 gap-3 pt-1">
            <div class="p-3 sm:p-4 rounded-2xl bg-white dark:bg-solar-bg-card border border-solar-border-card shadow-2xs text-center">
              <span class="block text-xl sm:text-2xl font-black font-mono text-solar-navy-dark dark:text-solar-yellow">
                {{ stats.totalProducts }}+
              </span>
              <span class="text-[11px] font-bold text-solar-text-muted mt-0.5 block">منتج معتمد</span>
            </div>

            <div class="p-3 sm:p-4 rounded-2xl bg-white dark:bg-solar-bg-card border border-solar-border-card shadow-2xs text-center">
              <span class="block text-xl sm:text-2xl font-black font-mono text-solar-navy-dark dark:text-solar-yellow">
                {{ stats.totalStores }}+
              </span>
              <span class="text-[11px] font-bold text-solar-text-muted mt-0.5 block">متجر ووكيل</span>
            </div>

            <div class="p-3 sm:p-4 rounded-2xl bg-white dark:bg-solar-bg-card border border-solar-border-card shadow-2xs text-center">
              <span class="block text-xl sm:text-2xl font-black font-mono text-solar-navy-dark dark:text-solar-yellow">
                {{ stats.totalEngineers }}+
              </span>
              <span class="text-[11px] font-bold text-solar-text-muted mt-0.5 block">مهندس مرخص</span>
            </div>
          </div>

          <!-- أزرار التصفح للزائر (Browse-Only تنقل مباشر للصفحات المعتمدة) -->
          <div class="flex flex-wrap items-center gap-3.5 pt-2">
            <NuxtLink
              to="/stores"
              class="btn-primary h-12 px-6 text-sm font-black gap-2 shadow-md cursor-pointer"
            >
              <Store class="size-4.5" />
              <span>دليل المتاجر والوكلاء</span>
            </NuxtLink>

            <NuxtLink
              to="/engineers"
              class="btn-outline h-12 px-6 text-sm font-bold gap-2 cursor-pointer"
            >
              <Users class="size-4.5 text-solar-navy-dark dark:text-solar-yellow" />
              <span>دليل المهندسين المعتمدين</span>
            </NuxtLink>
          </div>
        </div>

        <!-- الصورة على اليسار (المطابقة تماماً للتصميم السابق) -->
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

    <!-- ============================================================ -->
    <!-- 2. قسم "كيف تخدمك منصة سولار هب؟" (3 مسارات رئيسية) -->
    <!-- ============================================================ -->
    <section class="container-page">
      <div class="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <span class="text-xs font-black text-solar-yellow uppercase tracking-widest">حلول متكاملة لجميع الاستخدامات</span>
        <h2 class="text-2xl sm:text-3xl font-black text-solar-text-heading mt-2 mb-3">كيف تخدمك منصة سولار هب؟</h2>
        <p class="text-xs sm:text-sm text-solar-text-body">
          مسارات واضحة وسريعة تلبي كافة احتياجاتك السكنية، التجارية، والمشاريع الزراعية الضخمة.
        </p>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <!-- المسار 1: شراء منتجات ومكونات الطاقة -->
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

          <NuxtLink
            to="/products"
            class="btn-primary w-full py-2.5 text-xs font-black gap-2 justify-center shadow-sm"
          >
            <span>تصفح كتالوج المنتجات</span>
            <ArrowLeft class="size-4" />
          </NuxtLink>
        </div>

        <!-- المسار 2: العثور على مهندس معتمد -->
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

          <NuxtLink
            to="/engineers"
            class="btn-primary w-full py-2.5 text-xs font-black gap-2 justify-center shadow-sm"
          >
            <span>استكشف المهندسين المعتمدين</span>
            <ArrowLeft class="size-4" />
          </NuxtLink>
        </div>

        <!-- المسار 3: التواصل مع المتاجر والموردين -->
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
              تواصل مع كبار الموزعين والوكلاء المعتمدين، واطلع على فواتير رسمية وشهادات جودة وتوريدات للمشاريع الكبيرة.
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

          <NuxtLink
            to="/stores"
            class="btn-primary w-full py-2.5 text-xs font-black gap-2 justify-center shadow-sm"
          >
            <span>دليل المتاجر المعتمدة</span>
            <ArrowLeft class="size-4" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- 3. قسم "الأقسام الرئيسية الأكثر طلباً" (المطابق للتصميم السابق) -->
    <!-- ============================================================ -->
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
          class="flex flex-col items-center justify-center text-center p-4 sm:p-5 rounded-2xl bg-solar-bg-card border border-solar-border-card shadow-sm hover:border-solar-yellow hover:shadow-md transition-all group select-none cursor-pointer"
        >
          <span class="flex size-13 sm:size-14 items-center justify-center rounded-2xl bg-solar-bg-subtle text-solar-navy-dark dark:text-solar-yellow group-hover:bg-solar-yellow group-hover:text-solar-navy-dark transition-colors mb-3">
            <component :is="cat.icon" class="size-6.5" />
          </span>
          <h3 class="text-xs sm:text-sm font-black text-solar-text-heading group-hover:text-solar-navy dark:group-hover:text-solar-yellow transition-colors">{{ cat.label }}</h3>
          <span class="text-[10px] text-solar-text-muted mt-0.5 truncate w-full">{{ cat.sub }}</span>
        </NuxtLink>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- 4. سلايدر المنتجات الشمسية المتجدد كل 50 ثانية من قاعدة البيانات -->
    <!-- ============================================================ -->
    <section class="container-page" aria-label="سلايدر المنتجات الشمسية">
      <!-- ترويسة السلايدر وشريط الـ 50 ثانية -->
      <div class="solar-card p-4 sm:p-5 rounded-3xl mb-6 bg-gradient-to-r from-solar-bg-card to-solar-bg-subtle/50 border border-solar-border-card shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="flex size-8 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow">
                <Zap class="size-4 stroke-[2.5]" />
              </span>
              <h2 class="text-xl sm:text-2xl font-black text-solar-text-heading tracking-tight">
                أحدث وأبرز المنتجات الشمسية (سلايدر حي)
              </h2>
            </div>
            <p class="text-xs text-solar-text-muted mt-1">
              تصفح عشوائي حي للمنتجات من قاعدة البيانات • يتجدد تلقائياً كل 50 ثانية
            </p>
          </div>

          <!-- مؤشر العداد التنازلي وزر التدوير العشوائي الفوري -->
          <div class="flex items-center gap-3 self-start sm:self-auto">
            <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-solar-bg-card border border-solar-border-card text-xs font-mono font-bold shadow-2xs">
              <Clock class="size-3.5 text-solar-yellow animate-spin" style="animation-duration: 8s" />
              <span class="text-solar-text-heading">{{ secondsLeft }} ثانية</span>
            </div>

            <button
              type="button"
              @click="shuffleProductsNow"
              title="عرض منتجات عشوائية أخرى الآن"
              class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-solar-yellow text-solar-navy-dark text-xs font-black hover:bg-solar-yellow-hover transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <RotateCw class="size-3.5 stroke-[2.5]" />
              <span>عشوائي الآن</span>
            </button>
          </div>
        </div>

        <!-- شريط التقدم الزمني للـ 50 ثانية -->
        <div class="w-full bg-slate-200 dark:bg-slate-700/50 h-1.5 rounded-full mt-4 overflow-hidden">
          <div
            class="bg-solar-yellow h-full transition-all duration-1000 ease-linear rounded-full"
            :style="{ width: `${timerProgress}%` }"
          />
        </div>
      </div>

      <!-- محتوى سلايدر المنتجات (Browse-Only: لا طلب سعر، لا مفضلة) -->
      <div v-if="isLoading" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="i in 4" :key="`p-skel-${i}`" class="solar-card p-4 rounded-2xl animate-pulse space-y-3">
          <div class="aspect-[4/3] rounded-xl bg-solar-bg-subtle" />
          <div class="h-3 w-1/3 bg-solar-bg-subtle rounded" />
          <div class="h-4 w-4/5 bg-solar-bg-subtle rounded" />
          <div class="h-3 w-1/2 bg-solar-bg-subtle rounded" />
        </div>
      </div>

      <div v-else-if="displayedProducts.length === 0" class="solar-card p-12 text-center rounded-3xl border-dashed">
        <Package class="size-12 mx-auto text-solar-text-muted mb-3 opacity-60" />
        <h3 class="text-sm font-bold text-solar-text-heading">لا توجد منتجات مسجلة في قاعدة البيانات حالياً</h3>
        <p class="text-xs text-solar-text-muted mt-1">ستظهر المنتجات في السلايدر تلقائياً فور إضافتها من المتاجر.</p>
      </div>

      <!-- بطاقات المنتجات المطابقة تماماً لتصميم بطاقة المنتج في النسخة السابقة -->
      <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="product in displayedProducts"
          :key="product.id"
          class="solar-card flex flex-col justify-between overflow-hidden p-4 hover:border-solar-yellow transition-all duration-300 shadow-xs hover:shadow-md"
        >
          <div>
            <!-- الصورة والعلامة المائية للماركة وبادج الضمان -->
            <div class="relative mb-3 flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-solar-bg-subtle p-3 overflow-hidden border border-solar-border-card/40">
              <img
                :src="product.imageUrl"
                :alt="product.title"
                class="h-full w-full object-contain"
                loading="lazy"
                @error="(e) => ((e.target as HTMLImageElement).src = '/images/hero-solar.png')"
              />
              <span class="absolute bottom-2 left-2 rounded-md bg-solar-bg-card/90 px-2 py-0.5 text-[10px] font-bold text-solar-navy-dark dark:text-solar-yellow border border-solar-border-card/40 shadow-sm">
                {{ product.brand }}
              </span>
              <span
                v-if="product.warrantyPeriod"
                class="absolute top-2 right-2 rounded-md bg-solar-navy-dark/85 text-solar-yellow px-2 py-0.5 text-[9px] font-bold shadow-sm border border-solar-border-card/30"
              >
                {{ product.warrantyPeriod }}
              </span>
            </div>

            <!-- التقييم والنوع -->
            <div class="flex items-center justify-between gap-2 text-xs mb-1.5">
              <span class="text-solar-text-muted text-[11px] truncate">{{ product.category }}</span>
              <div class="flex items-center gap-1 font-bold text-amber-500">
                <Star class="size-3.5 fill-amber-400 text-amber-400" />
                <span>{{ product.rating ?? 4.85 }}</span>
              </div>
            </div>

            <!-- الاسم -->
            <h3 class="text-xs sm:text-sm font-black text-solar-text-heading line-clamp-2 leading-snug mb-2" :title="product.title">
              {{ product.title }}
            </h3>

            <!-- المتجر والموقع -->
            <div class="flex items-center gap-1.5 text-[11px] text-solar-text-muted mb-4">
              <Store class="size-3.5 shrink-0 text-solar-navy-dark dark:text-solar-yellow" />
              <span class="truncate">{{ product.storeName }} ({{ product.governorateName }})</span>
            </div>
          </div>

          <!-- بطاقة التصفح السفلية (Browse-Only: معاينة التفاصيل بدون طلب سعر أو مفضلة) -->
          <div class="flex flex-col gap-2 pt-2 border-t border-solar-border-card/60">
            <div class="flex items-center justify-between text-xs">
              <span class="text-[10px] text-solar-text-muted">السعر الاسترشادي:</span>
              <span class="font-black font-mono text-solar-navy-dark dark:text-solar-yellow">
                {{ product.price ? `${product.price.toLocaleString('en-US')} ر.ي` : 'عند التعاقد' }}
              </span>
            </div>

            <button
              type="button"
              @click="openDetail('product', product)"
              class="btn-primary w-full py-2 text-xs font-black gap-1.5 justify-center shadow-sm cursor-pointer"
            >
              <span>معاينة تفاصيل المنتج</span>
              <ArrowLeft class="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- زر الانتقال لجميع المنتجات في صفحة المنتجات المخصصة -->
      <div class="text-center mt-10">
        <NuxtLink to="/products" class="btn-outline px-8 py-3 text-xs font-black gap-2 shadow-sm hover:border-solar-yellow">
          <span>مشاهدة جميع المنتجات (+{{ stats.totalProducts }})</span>
          <ArrowLeft class="size-4" />
        </NuxtLink>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- 5. سلايدر المتاجر والوكلاء المعتمدين المتجدد كل 50 ثانية من قاعدة البيانات -->
    <!-- ============================================================ -->
    <section class="container-page" aria-label="سلايدر المتاجر المعتمدة">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <span class="text-xs font-black text-solar-yellow uppercase tracking-widest">شركاء التوريد الموثوقون</span>
          <h2 class="text-2xl sm:text-3xl font-black text-solar-text-heading mt-1">المتاجر والوكلاء المعتمدون</h2>
          <p class="text-xs text-solar-text-muted mt-1 max-w-xl">
            متاجر رسمية مرخصة توفر فواتير معتمدة، شحن سريع لجميع المحافظات، وضمانات المصنّعين الأصلية.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="shuffleStoresNow"
            title="عرض متاجر عشوائية أخرى"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-solar-yellow text-solar-navy-dark text-xs font-black hover:bg-solar-yellow-hover transition-all cursor-pointer"
          >
            <RotateCw class="size-3" />
            <span>عشوائي</span>
          </button>

          <NuxtLink
            to="/stores"
            class="btn-outline px-4 py-2 text-xs font-bold gap-1.5 shrink-0"
          >
            <span>دليل المتاجر بالكامل ({{ stats.totalStores }})</span>
            <ArrowLeft class="size-3.5" />
          </NuxtLink>
        </div>
      </div>

      <div v-if="isLoading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 3" :key="`s-skel-${i}`" class="solar-card p-5 rounded-2xl animate-pulse space-y-4">
          <div class="size-14 rounded-xl bg-solar-bg-subtle" />
          <div class="h-4 w-3/4 bg-solar-bg-subtle rounded" />
          <div class="h-3 w-1/2 bg-solar-bg-subtle rounded" />
        </div>
      </div>

      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="store in displayedStores"
          :key="store.id"
          class="solar-card flex flex-col justify-between p-5 hover:border-solar-yellow transition-all shadow-xs hover:shadow-md"
        >
          <div>
            <!-- الرأس والبادج -->
            <div class="flex items-start justify-between gap-3 mb-4">
              <span class="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <ShieldCheck class="size-3 text-blue-600 dark:text-blue-400" />
                <span>معتمد رسمياً</span>
              </span>

              <div class="flex items-center gap-2.5">
                <div class="text-right">
                  <h3 class="text-sm font-black text-solar-text-heading line-clamp-1">{{ store.companyName }}</h3>
                  <p class="text-[11px] text-solar-text-muted flex items-center justify-end gap-1">
                    <MapPin class="size-3" />
                    <span>{{ store.governorateName }}</span>
                  </p>
                </div>
                <div class="size-11 rounded-xl bg-solar-navy-dark text-solar-yellow flex items-center justify-center font-black text-xs shadow-sm overflow-hidden border border-solar-border-card">
                  <img
                    v-if="store.logoUrl && !store.logoUrl.includes('logo-expanded')"
                    :src="store.logoUrl"
                    :alt="store.companyName"
                    class="h-full w-full object-cover"
                  />
                  <span v-else>{{ store.companyName.substring(0, 2) }}</span>
                </div>
              </div>
            </div>

            <!-- إحصائيات المتجر -->
            <div class="grid grid-cols-2 gap-2 text-center p-2.5 rounded-xl bg-solar-bg-subtle mb-4">
              <div>
                <span class="block text-sm font-black text-solar-navy-dark dark:text-solar-yellow">{{ store.productsCount ?? 12 }}+</span>
                <span class="text-[10px] text-solar-text-muted">منتج معتمد</span>
              </div>
              <div class="border-r border-solar-border-card">
                <span class="block text-sm font-black text-amber-500">★ {{ store.rating }}</span>
                <span class="text-[10px] text-solar-text-muted">تقييم المعتمدين</span>
              </div>
            </div>

            <!-- نبذة المتجر -->
            <p class="text-xs text-solar-text-body line-clamp-2 leading-relaxed mb-4">
              {{ store.bio }}
            </p>

            <!-- الوسوم والماركات -->
            <div class="flex flex-wrap gap-1.5 mb-5">
              <span
                v-for="tag in (store.tags || ['ألواح شمسية', 'إنفرترات', 'بطاريات'])"
                :key="tag"
                class="rounded-md bg-solar-bg-card border border-solar-border-card px-2 py-0.5 text-[10px] text-solar-text-body font-medium"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- زر التصفح للزائر -->
          <button
            type="button"
            @click="openDetail('store', store)"
            class="btn-primary w-full py-2.5 text-xs font-black gap-2 justify-center shadow-sm cursor-pointer"
          >
            <span>معاينة بيانات المتجر</span>
            <ArrowLeft class="size-3.5" />
          </button>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- 6. سلايدر المهندسين والاستشاريين المتجدد كل 50 ثانية من قاعدة البيانات -->
    <!-- ============================================================ -->
    <section class="container-page" aria-label="سلايدر المهندسين المعتمدين">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <span class="text-xs font-black text-solar-yellow uppercase tracking-widest">خبرات هندسية موثقة</span>
          <h2 class="text-2xl sm:text-3xl font-black text-solar-text-heading mt-1">مهندسون واستشاريون موثوقون لمشروعك</h2>
          <p class="text-xs text-solar-text-muted mt-1 max-w-xl">
            اختر مهندسك المعتمد لتصميم ومراجعة مخططاتك الشمسية وضمان مطابقتها لأعلى المعايير والمواصفات الهندسية.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="shuffleEngineersNow"
            title="عرض مهندسين عشوائيين آخرين"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-solar-yellow text-solar-navy-dark text-xs font-black hover:bg-solar-yellow-hover transition-all cursor-pointer"
          >
            <RotateCw class="size-3" />
            <span>عشوائي</span>
          </button>

          <NuxtLink
            to="/engineers"
            class="btn-outline px-4 py-2 text-xs font-bold gap-1.5 shrink-0"
          >
            <span>دليل المهندسين بالكامل ({{ stats.totalEngineers }})</span>
            <ArrowLeft class="size-3.5" />
          </NuxtLink>
        </div>
      </div>

      <div v-if="isLoading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 3" :key="`e-skel-${i}`" class="solar-card p-5 rounded-2xl animate-pulse space-y-4">
          <div class="size-14 rounded-full bg-solar-bg-subtle" />
          <div class="h-4 w-3/4 bg-solar-bg-subtle rounded" />
          <div class="h-3 w-1/2 bg-solar-bg-subtle rounded" />
        </div>
      </div>

      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="eng in displayedEngineers"
          :key="eng.id"
          class="solar-card flex flex-col justify-between p-5 hover:border-solar-yellow transition-all shadow-xs hover:shadow-md"
        >
          <div>
            <!-- رأس بطاقة المهندس: الصورة مع النقطة الخضراء والبادج المعتمد -->
            <div class="flex items-start justify-between gap-3 mb-3">
              <span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 class="size-3 text-emerald-600 dark:text-emerald-400" />
                <span>معتمد</span>
              </span>

              <div class="relative shrink-0">
                <img
                  :src="eng.photoUrl"
                  :alt="eng.name"
                  class="w-14 h-14 shrink-0 rounded-full object-cover border-2 border-solar-yellow ring-2 ring-solar-bg-card shadow-sm"
                  @error="(e) => ((e.target as HTMLImageElement).src = '/images/hero-solar.png')"
                />
                <span class="absolute bottom-0 left-0 size-3 rounded-full bg-emerald-500 ring-2 ring-solar-bg-card" />
              </div>
            </div>

            <!-- الاسم والتخصص والوصف -->
            <div class="text-right mb-3">
              <h3 class="text-base font-black text-solar-text-heading">{{ eng.name }}</h3>
              <p class="text-xs font-bold text-solar-navy-dark dark:text-solar-yellow mt-0.5">{{ eng.specialization }}</p>
              <p class="text-xs text-solar-text-body line-clamp-2 leading-relaxed mt-1.5">
                {{ eng.bio }}
              </p>
            </div>

            <!-- معلومات الخبرة والموقع والتقييم والمشاريع -->
            <div class="grid grid-cols-2 gap-2 text-[11px] text-solar-text-muted border-y border-solar-border-card/60 py-3 mb-4">
              <span class="flex items-center gap-1.5 truncate">
                <Clock class="size-3.5 text-solar-navy-dark dark:text-solar-yellow shrink-0" />
                {{ eng.yearsOfExperience }}+ سنوات خبرة
              </span>
              <span class="flex items-center gap-1.5 truncate">
                <MapPin class="size-3.5 text-solar-navy-dark dark:text-solar-yellow shrink-0" />
                {{ eng.governorateName }}
              </span>
              <span class="flex items-center gap-1.5">
                <Star class="size-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <span class="font-bold text-solar-text-heading">{{ eng.rating }}</span> ({{ eng.ratingsCount }} تقييم)
              </span>
              <span class="flex items-center gap-1.5 font-semibold text-solar-navy-dark dark:text-solar-yellow">
                <Award class="size-3.5 text-solar-yellow shrink-0" />
                {{ eng.projectsCount ?? 18 }} مشروع منجز
              </span>
            </div>
          </div>

          <!-- زر التصفح للزائر (Browse-Only: معاينة الملف المهني بدون طلب استشارة) -->
          <button
            type="button"
            @click="openDetail('engineer', eng)"
            class="btn-primary w-full py-2.5 text-xs font-black gap-1.5 justify-center shadow-sm cursor-pointer"
          >
            <span>معاينة الملف المهني</span>
            <ArrowLeft class="size-3.5" />
          </button>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- 7. بانر طلب العروض والمناقصات (CTA Banner) المطابق للتصميم السابق -->
    <!-- ============================================================ -->
    <section class="container-page">
      <div class="relative overflow-hidden rounded-3xl bg-solar-navy-dark p-8 sm:p-12 lg:p-14 text-white shadow-2xl border border-white/10">
        <div class="grid gap-8 lg:grid-cols-12 items-center">
          <!-- الجانب الأيمن: النص والعنوان والأزرار -->
          <div class="flex flex-col gap-4 lg:col-span-7">
            <span class="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-solar-yellow border border-white/10">
              <Sparkles class="size-3.5" />
              <span>منظومة الطاقة المتكاملة بالجمهورية اليمنية</span>
            </span>

            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
              هل تخطط لتركيب نظام طاقة شمسية لمنزلك، مزرعتك أو مصنعك؟
            </h2>

            <p class="text-xs sm:text-sm text-white/70 leading-relaxed max-w-xl">
              اطّلع على شبكة المتاجر الرسمية ونخبة المهندسين المرخصين في اليمن للاستفادة من دراسات الجدوى والضمانات الرسمية المعتمدة.
            </p>

            <div class="flex flex-wrap items-center gap-3 pt-2">
              <NuxtLink
                to="/stores"
                class="btn-primary px-7 py-3 text-sm font-black gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>استكشف المتاجر المعتمدة</span>
                <ArrowLeft class="size-4" />
              </NuxtLink>

              <NuxtLink
                to="/about"
                class="px-6 py-3 rounded-xl border border-white/20 bg-white/5 text-sm font-bold text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <span>عن المنصة وضماناتها</span>
              </NuxtLink>
            </div>
          </div>

          <!-- الجانب الأيسر: الصناديق الثلاثة للميزات -->
          <div class="flex flex-col gap-3 lg:col-span-5">
            <div class="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-yellow">
                <Clock class="size-5" />
              </span>
              <div class="text-right">
                <h4 class="text-xs font-black text-white">استجابة سريعة وتحديث مستمر</h4>
                <p class="text-[11px] text-white/60">بيانات متجددة لحظياً من قاعدة البيانات</p>
              </div>
            </div>

            <div class="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-yellow">
                <ShieldCheck class="size-5" />
              </span>
              <div class="text-right">
                <h4 class="text-xs font-black text-white">ضمان وموثوقية العقود</h4>
                <p class="text-[11px] text-white/60">إشراف هندسي وتوثيق رسمي معتمد</p>
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

    <!-- النافذة المنبثقة الإيضاحية للقراءة فقط (Browse-Only Detail Modal) -->
    <VisitorDetailModal
      :is-open="isDetailModalOpen"
      :type="detailType"
      :item="selectedDetailItem"
      @close="closeDetail"
    />
  </div>
</template>
