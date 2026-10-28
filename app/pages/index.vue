<script setup lang="ts">
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  FileCheck2,
  FileText,
  HelpCircle,
  Info,
  Layers,
  MapPin,
  Package,
  RefreshCw,
  RotateCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Sun,
  Truck,
  Users,
  Wrench,
  Zap,
} from 'lucide-vue-next'
import { useVisitorLanding } from '~/composables/useVisitorLanding'
import VisitorDetailModal from '~/components/visitor/VisitorDetailModal.vue'
import type { VisitorProductItem, VisitorStoreItem, VisitorEngineerItem } from '~/types/visitor'

useSeoMeta({
  title: 'سولار هب | المنصة الوطنية المعتمدة لمنظومات وحلول الطاقة الشمسية',
  description: 'بوابة تصفح معتمدة لمنتجات الطاقة الشمسية والمتاجر المرخصة والمهندسين الاستشاريين في الجمهورية اليمنية.',
})

const route = useRoute()
const router = useRouter()

// التبويبات الأربعة الرئيسية
type VisitorTab = 'home' | 'stores' | 'engineers' | 'about'
const activeTab = ref<VisitorTab>('home')

// مزامنة التبويب مع بارامتر الرابط (?tab=...)
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && ['home', 'stores', 'engineers', 'about'].includes(newTab as string)) {
      activeTab.value = newTab as VisitorTab
    }
  },
  { immediate: true }
)

function switchTab(tab: VisitorTab) {
  activeTab.value = tab
  router.replace({ query: { ...route.query, tab: tab === 'home' ? undefined : tab } })
}

// استدعاء المتحكم الرئيسي والبيانات الحقيقية والمؤقت 50 ثانية
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

// نافذة التفاصيل الإيضاحية للقراءة فقط
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
  <div class="flex flex-col gap-10 sm:gap-14 pb-20">
    <!-- شريط التبويبات الأربعة العلوية الموحدة للزائر -->
    <header class="sticky top-20 z-40 bg-solar-bg-card/95 backdrop-blur-md border-b border-solar-border-card shadow-xs transition-colors">
      <div class="container-page py-3">
        <nav class="flex items-center justify-center sm:justify-start gap-2 overflow-x-auto no-scrollbar" aria-label="أقسام بوابة الزائر">
          <!-- 1. الرئيسية -->
          <button
            type="button"
            @click="switchTab('home')"
            class="flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 select-none"
            :class="activeTab === 'home'
              ? 'bg-solar-yellow text-solar-navy-dark font-black shadow-sm ring-2 ring-solar-yellow/30'
              : 'text-solar-text-body hover:text-solar-text-heading hover:bg-solar-bg-subtle'"
          >
            <Sun class="size-4" :class="activeTab === 'home' ? 'stroke-[2.5]' : ''" />
            <span>الرئيسية</span>
          </button>

          <!-- 2. الموردون -->
          <button
            type="button"
            @click="switchTab('stores')"
            class="flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 select-none"
            :class="activeTab === 'stores'
              ? 'bg-solar-yellow text-solar-navy-dark font-black shadow-sm ring-2 ring-solar-yellow/30'
              : 'text-solar-text-body hover:text-solar-text-heading hover:bg-solar-bg-subtle'"
          >
            <Store class="size-4" :class="activeTab === 'stores' ? 'stroke-[2.5]' : ''" />
            <span>الموردون والمتاجر</span>
            <span v-if="stats.totalStores > 0" class="rounded-full bg-solar-navy-dark/10 dark:bg-white/10 px-2 py-0.2 text-[10px] font-mono">
              {{ stats.totalStores }}
            </span>
          </button>

          <!-- 3. المهندسون -->
          <button
            type="button"
            @click="switchTab('engineers')"
            class="flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 select-none"
            :class="activeTab === 'engineers'
              ? 'bg-solar-yellow text-solar-navy-dark font-black shadow-sm ring-2 ring-solar-yellow/30'
              : 'text-solar-text-body hover:text-solar-text-heading hover:bg-solar-bg-subtle'"
          >
            <Users class="size-4" :class="activeTab === 'engineers' ? 'stroke-[2.5]' : ''" />
            <span>المهندسون والاستشاريون</span>
            <span v-if="stats.totalEngineers > 0" class="rounded-full bg-solar-navy-dark/10 dark:bg-white/10 px-2 py-0.2 text-[10px] font-mono">
              {{ stats.totalEngineers }}
            </span>
          </button>

          <!-- 4. عن المنصة -->
          <button
            type="button"
            @click="switchTab('about')"
            class="flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 select-none"
            :class="activeTab === 'about'
              ? 'bg-solar-yellow text-solar-navy-dark font-black shadow-sm ring-2 ring-solar-yellow/30'
              : 'text-solar-text-body hover:text-solar-text-heading hover:bg-solar-bg-subtle'"
          >
            <Info class="size-4" :class="activeTab === 'about' ? 'stroke-[2.5]' : ''" />
            <span>عن المنصة</span>
          </button>
        </nav>
      </div>
    </header>

    <!-- شريط تنبيه الخطأ أو عدم توفر الإنترنت -->
    <div v-if="errorMessage" class="container-page">
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

    <!-- ========================================== -->
    <!-- التبويب الأول: الرئيسية (Home Tab) -->
    <!-- ========================================== -->
    <template v-if="activeTab === 'home'">
      <!-- 1. البانر الرئيسي للزائر (Hero Section) -->
      <section class="relative overflow-hidden bg-gradient-to-b from-solar-bg-card via-solar-bg-subtle/50 to-solar-bg-page pt-6 sm:pt-12 pb-10 sm:pb-14 border-b border-solar-border-card/60">
        <div class="container-page grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <!-- الجانب الأيمن: النص والإحصائيات الحية -->
          <div class="flex flex-col gap-5 lg:col-span-7 text-right">
            <div class="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-950/40 px-3.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-2xs">
              <span class="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>منصة حلول الطاقة الشمسية المعتمدة</span>
            </div>

            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-solar-text-heading leading-[1.25] tracking-tight">
              وجهتك الموثوقة لمنظومات ومنتجات
              <span class="text-solar-yellow underline decoration-solar-yellow/40 underline-offset-8">الطاقة الشمسية</span>
              المتكاملة
            </h1>

            <p class="text-sm sm:text-base leading-relaxed text-solar-text-body max-w-2xl">
              تصفح أحدث معدات ومنظومات الطاقة الشمسية باليمن والشرق الأوسط، وتعرف على شبكة كبار الموردين المعتمدين ونخبة الاستشاريين المرخصين.
            </p>

            <!-- بطاقات المؤشرات الإحصائية الحية المسترجعة من قاعدة البيانات -->
            <div class="grid grid-cols-3 gap-3 pt-2">
              <div class="p-3.5 rounded-2xl bg-white dark:bg-solar-bg-card border border-solar-border-card shadow-2xs text-center">
                <span class="block text-xl sm:text-2xl font-black font-mono text-solar-navy-dark dark:text-solar-yellow">
                  {{ stats.totalProducts }}+
                </span>
                <span class="text-[11px] font-bold text-solar-text-muted mt-0.5 block">منتج معتمد</span>
              </div>

              <div class="p-3.5 rounded-2xl bg-white dark:bg-solar-bg-card border border-solar-border-card shadow-2xs text-center">
                <span class="block text-xl sm:text-2xl font-black font-mono text-solar-navy-dark dark:text-solar-yellow">
                  {{ stats.totalStores }}+
                </span>
                <span class="text-[11px] font-bold text-solar-text-muted mt-0.5 block">متجر ووكيل</span>
              </div>

              <div class="p-3.5 rounded-2xl bg-white dark:bg-solar-bg-card border border-solar-border-card shadow-2xs text-center">
                <span class="block text-xl sm:text-2xl font-black font-mono text-solar-navy-dark dark:text-solar-yellow">
                  {{ stats.totalEngineers }}+
                </span>
                <span class="text-[11px] font-bold text-solar-text-muted mt-0.5 block">مهندس مرخص</span>
              </div>
            </div>

            <!-- أزرار التصفح السريعة للتنقل بين التبويبات -->
            <div class="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                @click="switchTab('stores')"
                class="flex items-center gap-2 px-5 py-3 rounded-xl bg-solar-navy-dark text-white text-xs sm:text-sm font-black hover:bg-slate-800 transition-all active:scale-95 shadow-md cursor-pointer"
              >
                <Store class="size-4 text-solar-yellow" />
                <span>استكشف دليل الموردين</span>
              </button>

              <button
                type="button"
                @click="switchTab('engineers')"
                class="flex items-center gap-2 px-5 py-3 rounded-xl border border-solar-border-card bg-white dark:bg-solar-bg-card text-xs sm:text-sm font-bold text-solar-text-heading hover:bg-solar-bg-subtle transition-all active:scale-95 shadow-2xs cursor-pointer"
              >
                <Users class="size-4 text-solar-navy-dark dark:text-solar-yellow" />
                <span>استكشف دليل المهندسين</span>
              </button>
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

      <!-- 2. سلايدر المنتجات الشمسية المتجدد كل 50 ثانية من قاعدة البيانات -->
      <section class="container-page" aria-label="سلايدر المنتجات المتجدد">
        <!-- ترويسة السلايدر ومؤشر الـ 50 ثانية -->
        <div class="solar-card p-4 sm:p-5 rounded-3xl mb-6 bg-gradient-to-r from-solar-bg-card to-solar-bg-subtle/50 border border-solar-border-card shadow-xs">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="flex size-8 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow">
                  <Zap class="size-4 stroke-[2.5]" />
                </span>
                <h2 class="text-xl sm:text-2xl font-black text-solar-text-heading tracking-tight">
                  سلايدر منتجات الطاقة الشمسية
                </h2>
              </div>
              <p class="text-xs text-solar-text-muted mt-1">
                تصفح عشوائي حي للمنتجات من قاعدة البيانات • يتجدد تلقائياً كل 50 ثانية
              </p>
            </div>

            <!-- مؤشر العداد التنازلي والتدوير اليدوي -->
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

        <!-- محتوى سلايدر المنتجات (Browse-Only) -->
        <!-- حالة التحميل -->
        <div v-if="isLoading" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="i in 4" :key="`p-skel-${i}`" class="solar-card p-4 rounded-3xl animate-pulse space-y-3">
            <div class="aspect-[4/3] rounded-2xl bg-solar-bg-subtle" />
            <div class="h-3 w-1/3 bg-solar-bg-subtle rounded" />
            <div class="h-4 w-4/5 bg-solar-bg-subtle rounded" />
            <div class="h-3 w-1/2 bg-solar-bg-subtle rounded" />
          </div>
        </div>

        <!-- حالة لا توجد بيانات في قاعدة البيانات -->
        <div v-else-if="displayedProducts.length === 0" class="solar-card p-12 text-center rounded-3xl border-dashed">
          <Package class="size-12 mx-auto text-solar-text-muted mb-3 opacity-60" />
          <h3 class="text-sm font-bold text-solar-text-heading">لا توجد منتجات مسجلة في قاعدة البيانات حالياً</h3>
          <p class="text-xs text-solar-text-muted mt-1">ستظهر المنتجات في السلايدر تلقائياً فور إضافتها من المتاجر.</p>
        </div>

        <!-- بطاقات المنتجات للزائر (Browse-Only: لا طلب سعر، لا مفضلة، لا شراء) -->
        <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="product in displayedProducts"
            :key="product.id"
            class="solar-card p-4 rounded-3xl flex flex-col justify-between hover:border-solar-yellow transition-all duration-300 shadow-xs hover:shadow-md"
          >
            <div>
              <!-- صورة المنتج مع بادج الماركة والتصنيف -->
              <div class="relative mb-3 flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-solar-bg-subtle p-3 overflow-hidden border border-solar-border-card/50">
                <img
                  :src="product.imageUrl"
                  :alt="product.title"
                  class="h-full w-full object-contain"
                  loading="lazy"
                  @error="(e) => ((e.target as HTMLImageElement).src = '/images/hero-solar.png')"
                />
                <span class="absolute bottom-2 left-2 rounded-md bg-solar-bg-card/90 px-2 py-0.5 text-[10px] font-bold text-solar-navy-dark dark:text-solar-yellow border border-solar-border-card/40 shadow-2xs">
                  {{ product.brand }}
                </span>
                <span class="absolute top-2 right-2 rounded-md bg-solar-navy-dark/85 text-solar-yellow px-2 py-0.5 text-[9px] font-bold shadow-2xs">
                  {{ product.warrantyPeriod }}
                </span>
              </div>

              <!-- التصنيف -->
              <div class="text-solar-text-muted text-[11px] font-semibold mb-1">
                {{ product.category }}
              </div>

              <!-- اسم المنتج -->
              <h3 class="text-xs sm:text-sm font-black text-solar-text-heading line-clamp-2 leading-snug mb-2" :title="product.title">
                {{ product.title }}
              </h3>

              <!-- المتجر والموقع -->
              <div class="flex items-center gap-1.5 text-[11px] text-solar-text-muted mb-3">
                <Store class="size-3.5 shrink-0 text-solar-navy-dark dark:text-solar-yellow" />
                <span class="truncate">{{ product.storeName }} ({{ product.governorateName }})</span>
              </div>
            </div>

            <!-- بطاقة التصفح السفلية (زر إيضاحي للقراءة فقط) -->
            <div class="pt-3 border-t border-solar-border-card flex items-center justify-between">
              <div>
                <span class="text-[10px] text-solar-text-muted block">السعر الاسترشادي:</span>
                <span class="text-xs font-black font-mono text-solar-navy-dark dark:text-solar-yellow">
                  {{ product.price ? `${product.price.toLocaleString('en-US')} ر.س` : 'حسب الكمية' }}
                </span>
              </div>

              <button
                type="button"
                @click="openDetail('product', product)"
                class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-solar-bg-subtle text-solar-text-heading text-xs font-bold hover:bg-solar-yellow hover:text-solar-navy-dark transition-colors cursor-pointer"
              >
                <span>تفاصيل</span>
                <ArrowLeft class="size-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. مسارات الخدمة الثلاثة بالمنصة -->
      <section class="container-page" aria-label="مسارات الخدمة بالمنصة">
        <div class="text-center max-w-3xl mx-auto mb-10">
          <span class="text-xs font-black text-solar-yellow uppercase tracking-widest">منظومة موحدة لقطاع الطاقة</span>
          <h2 class="text-2xl sm:text-3xl font-black text-solar-text-heading mt-1 mb-2">كيف تخدمك منصة سولار هب؟</h2>
          <p class="text-xs sm:text-sm text-solar-text-body">
            ربط موثوق يجمع المستهلكين بالمتاجر والوكلاء المعتمدين والمهندسين المرخصين في مكان واحد.
          </p>
        </div>

        <div class="grid gap-6 sm:grid-cols-3">
          <!-- المسار 1 -->
          <div class="solar-card p-6 sm:p-7 rounded-3xl flex flex-col justify-between">
            <div>
              <div class="size-12 rounded-2xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow flex items-center justify-center mb-4">
                <Sun class="size-6 text-amber-500" />
              </div>
              <h3 class="text-base font-black text-solar-text-heading mb-2">توريد المعدات الأصلية</h3>
              <p class="text-xs text-solar-text-body leading-relaxed mb-4">
                اقتناء مباشر من كبار الموردين والوكلاء المعتمدين مع شهادات مطابقة وفواتير رسمية وضمانات مصنعية معتمدة.
              </p>
            </div>
            <button
              type="button"
              @click="switchTab('stores')"
              class="w-full py-2.5 rounded-xl border border-solar-border-card bg-solar-bg-subtle text-xs font-bold text-solar-text-heading hover:bg-solar-yellow hover:text-solar-navy-dark transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>استعراض المتاجر</span>
              <ArrowLeft class="size-3.5" />
            </button>
          </div>

          <!-- المسار 2 -->
          <div class="solar-card p-6 sm:p-7 rounded-3xl flex flex-col justify-between border-solar-yellow/50">
            <div>
              <div class="size-12 rounded-2xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow flex items-center justify-center mb-4">
                <Users class="size-6 text-amber-500" />
              </div>
              <h3 class="text-base font-black text-solar-text-heading mb-2">الاستشارات والإشراف الهندسي</h3>
              <p class="text-xs text-solar-text-body leading-relaxed mb-4">
                مهندسون استشاريون مرخصون لدراسات الجدوى الفنية، حساب الأحمال، وتصميم المخططات والمطابقة لمعايير السلامة.
              </p>
            </div>
            <button
              type="button"
              @click="switchTab('engineers')"
              class="w-full py-2.5 rounded-xl bg-solar-yellow text-xs font-black text-solar-navy-dark hover:bg-solar-yellow-hover transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>استعراض المهندسين</span>
              <ArrowLeft class="size-3.5" />
            </button>
          </div>

          <!-- المسار 3 -->
          <div class="solar-card p-6 sm:p-7 rounded-3xl flex flex-col justify-between">
            <div>
              <div class="size-12 rounded-2xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow flex items-center justify-center mb-4">
                <ShieldCheck class="size-6 text-emerald-500" />
              </div>
              <h3 class="text-base font-black text-solar-text-heading mb-2">الضمانات وحماية الاستثمار</h3>
              <p class="text-xs text-solar-text-body leading-relaxed mb-4">
                توثيق رسمي للعقود والمشتريات لحماية استثمارات مشاريع الطاقة السكنية والتجارية والزراعية باليمن.
              </p>
            </div>
            <button
              type="button"
              @click="switchTab('about')"
              class="w-full py-2.5 rounded-xl border border-solar-border-card bg-solar-bg-subtle text-xs font-bold text-solar-text-heading hover:bg-solar-yellow hover:text-solar-navy-dark transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>عن المنصة وضماناتها</span>
              <ArrowLeft class="size-3.5" />
            </button>
          </div>
        </div>
      </section>
    </template>

    <!-- ========================================== -->
    <!-- التبويب الثاني: الموردون والمتاجر (Stores Tab) -->
    <!-- ========================================== -->
    <template v-else-if="activeTab === 'stores'">
      <section class="container-page space-y-8" aria-label="دليل الموردين والمتاجر">
        <!-- ترويسة التبويب ومؤشر الـ 50 ثانية -->
        <div class="solar-card p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-solar-bg-card to-solar-bg-subtle/50 border border-solar-border-card shadow-xs">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="flex size-9 items-center justify-center rounded-2xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow">
                  <Store class="size-5 stroke-[2.2]" />
                </span>
                <h1 class="text-2xl sm:text-3xl font-black text-solar-text-heading tracking-tight">
                  دليل المتاجر والموردين المعتمدين
                </h1>
              </div>
              <p class="text-xs sm:text-sm text-solar-text-muted mt-1.5">
                تصفح قائمة الوكلاء والموزعين الرسميين لمعدات الطاقة • سلايدر المتاجر يتجدد تلقائياً كل 50 ثانية
              </p>
            </div>

            <!-- مؤشر الـ 50 ثانية مع زر التدوير العشوائي -->
            <div class="flex items-center gap-3 self-start sm:self-auto">
              <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-solar-bg-card border border-solar-border-card text-xs font-mono font-bold shadow-2xs">
                <Clock class="size-3.5 text-solar-yellow animate-spin" style="animation-duration: 8s" />
                <span class="text-solar-text-heading">{{ secondsLeft }} ثانية</span>
              </div>

              <button
                type="button"
                @click="shuffleStoresNow"
                title="عرض متاجر عشوائية أخرى الآن"
                class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-solar-yellow text-solar-navy-dark text-xs font-black hover:bg-solar-yellow-hover transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                <RotateCw class="size-3.5 stroke-[2.5]" />
                <span>عشوائي الآن</span>
              </button>
            </div>
          </div>

          <!-- شريط التقدم 50 ثانية -->
          <div class="w-full bg-slate-200 dark:bg-slate-700/50 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              class="bg-solar-yellow h-full transition-all duration-1000 ease-linear rounded-full"
              :style="{ width: `${timerProgress}%` }"
            />
          </div>
        </div>

        <!-- 1. سلايدر المتاجر المميزة (يتجدد كل 50 ثانية) -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <Sparkles class="size-4 text-solar-yellow" />
              <h2 class="text-base sm:text-lg font-black text-solar-text-heading">
                متاجر مختارة في هذه الدورة ({{ displayedStores.length }})
              </h2>
            </div>
            <span class="text-xs text-solar-text-muted">عرض تصفح للزائر فقط</span>
          </div>

          <!-- بطاقات المتاجر في السلايدر -->
          <div v-if="isLoading" class="grid gap-6 sm:grid-cols-3">
            <div v-for="i in 3" :key="`s-skel-${i}`" class="solar-card p-6 rounded-3xl animate-pulse space-y-4">
              <div class="size-16 rounded-2xl bg-solar-bg-subtle" />
              <div class="h-4 w-3/4 bg-solar-bg-subtle rounded" />
              <div class="h-3 w-1/2 bg-solar-bg-subtle rounded" />
              <div class="h-10 w-full bg-solar-bg-subtle rounded-xl" />
            </div>
          </div>

          <div v-else-if="displayedStores.length === 0" class="solar-card p-12 text-center rounded-3xl border-dashed">
            <Store class="size-12 mx-auto text-solar-text-muted mb-3 opacity-60" />
            <h3 class="text-sm font-bold text-solar-text-heading">لا توجد متاجر مسجلة في قاعدة البيانات حالياً</h3>
          </div>

          <div v-else class="grid gap-6 sm:grid-cols-3">
            <div
              v-for="store in displayedStores"
              :key="store.id"
              class="solar-card p-6 rounded-3xl flex flex-col justify-between hover:border-solar-yellow transition-all duration-300 shadow-xs hover:shadow-md"
            >
              <div>
                <!-- رأس المتجر -->
                <div class="flex items-start justify-between gap-3 mb-4">
                  <div class="size-14 rounded-2xl bg-solar-bg-subtle p-2 border border-solar-border-card flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      :src="store.logoUrl"
                      :alt="store.companyName"
                      class="h-full w-full object-contain"
                      @error="(e) => ((e.target as HTMLImageElement).src = '/images/logo-expanded-transparent.png')"
                    />
                  </div>

                  <span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 class="size-3" />
                    <span>معتمد</span>
                  </span>
                </div>

                <h3 class="text-base font-black text-solar-text-heading mb-1 line-clamp-1">
                  {{ store.companyName }}
                </h3>

                <p class="text-xs text-solar-text-muted flex items-center gap-1 mb-3">
                  <MapPin class="size-3 text-solar-navy-dark dark:text-solar-yellow shrink-0" />
                  <span>{{ store.governorateName }}</span>
                </p>

                <p class="text-xs text-solar-text-body line-clamp-2 leading-relaxed mb-4">
                  {{ store.bio }}
                </p>
              </div>

              <div class="pt-3 border-t border-solar-border-card flex items-center justify-between">
                <span class="text-xs font-bold text-solar-text-muted">{{ store.storeType }}</span>

                <button
                  type="button"
                  @click="openDetail('store', store)"
                  class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-solar-bg-subtle text-solar-text-heading text-xs font-bold hover:bg-solar-yellow hover:text-solar-navy-dark transition-colors cursor-pointer"
                >
                  <span>استعراض</span>
                  <ArrowLeft class="size-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. شبكة كافة المتاجر المعتمدة من قاعدة البيانات للتصفح العام -->
        <div class="pt-6 border-t border-solar-border-card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-black text-solar-text-heading">
              كافة المتاجر والوكلاء المسجلين ({{ allStores.length }})
            </h2>
            <span class="text-xs text-solar-text-muted">تصفح حر للقراءة فقط</span>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="store in allStores"
              :key="`all-s-${store.id}`"
              class="solar-card p-4 rounded-2xl flex items-center justify-between gap-3 hover:border-solar-yellow transition-all"
            >
              <div class="flex items-center gap-3 min-w-0">
                <img
                  :src="store.logoUrl"
                  :alt="store.companyName"
                  class="size-11 rounded-xl object-contain bg-solar-bg-subtle p-1 border border-solar-border-card shrink-0"
                  @error="(e) => ((e.target as HTMLImageElement).src = '/images/logo-expanded-transparent.png')"
                />
                <div class="min-w-0">
                  <div class="text-xs font-black text-solar-text-heading truncate">{{ store.companyName }}</div>
                  <div class="text-[10px] text-solar-text-muted flex items-center gap-1 mt-0.5">
                    <MapPin class="size-2.5" />
                    <span>{{ store.governorateName }}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                @click="openDetail('store', store)"
                class="px-2.5 py-1 rounded-lg bg-solar-bg-subtle text-[11px] font-bold text-solar-text-heading hover:bg-solar-yellow hover:text-solar-navy-dark transition-colors shrink-0 cursor-pointer"
              >
                تفاصيل
              </button>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- ========================================== -->
    <!-- التبويب الثالث: المهندسون والاستشاريون (Engineers Tab) -->
    <!-- ========================================== -->
    <template v-else-if="activeTab === 'engineers'">
      <section class="container-page space-y-8" aria-label="دليل المهندسين والاستشاريين">
        <!-- ترويسة التبويب ومؤشر الـ 50 ثانية -->
        <div class="solar-card p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-solar-bg-card to-solar-bg-subtle/50 border border-solar-border-card shadow-xs">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="flex size-9 items-center justify-center rounded-2xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow">
                  <Users class="size-5 stroke-[2.2]" />
                </span>
                <h1 class="text-2xl sm:text-3xl font-black text-solar-text-heading tracking-tight">
                  دليل المهندسين والاستشاريين المرخصين
                </h1>
              </div>
              <p class="text-xs sm:text-sm text-solar-text-muted mt-1.5">
                نخبة المهندسين المعتمدين في دراسات الجدوى والإشراف الفني • السلايدر يتجدد تلقائياً كل 50 ثانية
              </p>
            </div>

            <!-- مؤشر الـ 50 ثانية مع زر التدوير العشوائي -->
            <div class="flex items-center gap-3 self-start sm:self-auto">
              <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-solar-bg-card border border-solar-border-card text-xs font-mono font-bold shadow-2xs">
                <Clock class="size-3.5 text-solar-yellow animate-spin" style="animation-duration: 8s" />
                <span class="text-solar-text-heading">{{ secondsLeft }} ثانية</span>
              </div>

              <button
                type="button"
                @click="shuffleEngineersNow"
                title="عرض مهندسين عشوائيين آخرين الآن"
                class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-solar-yellow text-solar-navy-dark text-xs font-black hover:bg-solar-yellow-hover transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                <RotateCw class="size-3.5 stroke-[2.5]" />
                <span>عشوائي الآن</span>
              </button>
            </div>
          </div>

          <!-- شريط التقدم 50 ثانية -->
          <div class="w-full bg-slate-200 dark:bg-slate-700/50 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              class="bg-solar-yellow h-full transition-all duration-1000 ease-linear rounded-full"
              :style="{ width: `${timerProgress}%` }"
            />
          </div>
        </div>

        <!-- 1. سلايدر المهندسين المميزين (يتجدد كل 50 ثانية) -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <Sparkles class="size-4 text-solar-yellow" />
              <h2 class="text-base sm:text-lg font-black text-solar-text-heading">
                مهندسون مختارون في هذه الدورة ({{ displayedEngineers.length }})
              </h2>
            </div>
            <span class="text-xs text-solar-text-muted">عرض تصفح للزائر فقط</span>
          </div>

          <!-- بطاقات المهندسين في السلايدر -->
          <div v-if="isLoading" class="grid gap-6 sm:grid-cols-3">
            <div v-for="i in 3" :key="`e-skel-${i}`" class="solar-card p-6 rounded-3xl animate-pulse space-y-4">
              <div class="size-16 rounded-full bg-solar-bg-subtle" />
              <div class="h-4 w-3/4 bg-solar-bg-subtle rounded" />
              <div class="h-3 w-1/2 bg-solar-bg-subtle rounded" />
              <div class="h-10 w-full bg-solar-bg-subtle rounded-xl" />
            </div>
          </div>

          <div v-else-if="displayedEngineers.length === 0" class="solar-card p-12 text-center rounded-3xl border-dashed">
            <Users class="size-12 mx-auto text-solar-text-muted mb-3 opacity-60" />
            <h3 class="text-sm font-bold text-solar-text-heading">لا يوجد مهندسون مسجلون في قاعدة البيانات حالياً</h3>
          </div>

          <div v-else class="grid gap-6 sm:grid-cols-3">
            <div
              v-for="eng in displayedEngineers"
              :key="eng.id"
              class="solar-card p-6 rounded-3xl flex flex-col justify-between hover:border-solar-yellow transition-all duration-300 shadow-xs hover:shadow-md"
            >
              <div>
                <div class="flex items-start justify-between gap-3 mb-4">
                  <div class="relative shrink-0">
                    <img
                      :src="eng.photoUrl"
                      :alt="eng.name"
                      class="size-14 rounded-2xl object-cover border-2 border-solar-yellow shadow-xs"
                      @error="(e) => ((e.target as HTMLImageElement).src = '/images/hero-solar.png')"
                    />
                    <span class="absolute -bottom-1 -left-1 size-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-solar-bg-card" />
                  </div>

                  <span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 class="size-3" />
                    <span>مرخص</span>
                  </span>
                </div>

                <h3 class="text-base font-black text-solar-text-heading mb-1">
                  {{ eng.name }}
                </h3>

                <p class="text-xs font-bold text-solar-navy-dark dark:text-solar-yellow mb-2 line-clamp-1">
                  {{ eng.specialization }}
                </p>

                <p class="text-xs text-solar-text-body line-clamp-2 leading-relaxed mb-4">
                  {{ eng.bio }}
                </p>
              </div>

              <div class="pt-3 border-t border-solar-border-card flex items-center justify-between text-xs">
                <span class="text-solar-text-muted flex items-center gap-1">
                  <Clock class="size-3" />
                  <span>{{ eng.yearsOfExperience }}+ سنوات خبرة</span>
                </span>

                <button
                  type="button"
                  @click="openDetail('engineer', eng)"
                  class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-solar-bg-subtle text-solar-text-heading text-xs font-bold hover:bg-solar-yellow hover:text-solar-navy-dark transition-colors cursor-pointer"
                >
                  <span>استعراض</span>
                  <ArrowLeft class="size-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. شبكة كافة المهندسين المسجلين من قاعدة البيانات للتصفح العام -->
        <div class="pt-6 border-t border-solar-border-card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-black text-solar-text-heading">
              كافة المهندسين والاستشاريين المعتمدين ({{ allEngineers.length }})
            </h2>
            <span class="text-xs text-solar-text-muted">تصفح حر للقراءة فقط</span>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="eng in allEngineers"
              :key="`all-e-${eng.id}`"
              class="solar-card p-4 rounded-2xl flex items-center justify-between gap-3 hover:border-solar-yellow transition-all"
            >
              <div class="flex items-center gap-3 min-w-0">
                <img
                  :src="eng.photoUrl"
                  :alt="eng.name"
                  class="size-11 rounded-xl object-cover border border-solar-yellow shrink-0"
                  @error="(e) => ((e.target as HTMLImageElement).src = '/images/hero-solar.png')"
                />
                <div class="min-w-0">
                  <div class="text-xs font-black text-solar-text-heading truncate">{{ eng.name }}</div>
                  <div class="text-[10px] text-solar-text-muted truncate mt-0.5">{{ eng.specialization }}</div>
                </div>
              </div>

              <button
                type="button"
                @click="openDetail('engineer', eng)"
                class="px-2.5 py-1 rounded-lg bg-solar-bg-subtle text-[11px] font-bold text-solar-text-heading hover:bg-solar-yellow hover:text-solar-navy-dark transition-colors shrink-0 cursor-pointer"
              >
                تفاصيل
              </button>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- ========================================== -->
    <!-- التبويب الرابع: عن المنصة (About Platform Tab) -->
    <!-- ========================================== -->
    <template v-else-if="activeTab === 'about'">
      <section class="container-page space-y-12" aria-label="عن منصة سولار هب">
        <!-- ترويسة تعريفية عن المنصة -->
        <div class="solar-card p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-solar-bg-card via-solar-bg-subtle/40 to-solar-bg-card border border-solar-border-card shadow-sm text-center max-w-4xl mx-auto">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-solar-yellow/20 px-3.5 py-1 text-xs font-black text-solar-navy-dark dark:text-solar-yellow mb-4">
            <ShieldCheck class="size-4" />
            <span>المنصة الرائدة في حلول الطاقة المتجددة</span>
          </span>

          <h1 class="text-3xl sm:text-4xl font-black text-solar-text-heading leading-tight mb-4">
            عن منصة سولار هب (SolarHub)
          </h1>

          <p class="text-sm sm:text-base leading-relaxed text-solar-text-body max-w-2xl mx-auto">
            منصة رقمية موثوقة تهدف إلى تنظيم وتطوير سوق الطاقة الشمسية الكهروضوئية في اليمن، من خلال الربط المباشر والآمن بين المستهلكين وأصحاب المشاريع من جهة، وكبار الوكلاء والموردين المعتمدين ونخبة المهندسين المرخصين من جهة أخرى.
          </p>
        </div>

        <!-- الرؤية والرسالة والأهداف -->
        <div class="grid gap-6 sm:grid-cols-3">
          <div class="solar-card p-6 sm:p-8 rounded-3xl border border-solar-border-card">
            <div class="size-12 rounded-2xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow flex items-center justify-center mb-4">
              <Compass class="size-6 text-amber-500" />
            </div>
            <h2 class="text-lg font-black text-solar-text-heading mb-2">رؤيتنا</h2>
            <p class="text-xs sm:text-sm text-solar-text-body leading-relaxed">
              أن نكون المرجع الأول والموثوق لحلول الطاقة المتجددة في المنطقة، وتحقيق أعلى مستويات الجودة والسلامة والشفافية في اقتناء وتركيب المنظومات الكهروضوئية.
            </p>
          </div>

          <div class="solar-card p-6 sm:p-8 rounded-3xl border border-solar-border-card">
            <div class="size-12 rounded-2xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow flex items-center justify-center mb-4">
              <Sparkles class="size-6 text-amber-500" />
            </div>
            <h2 class="text-lg font-black text-solar-text-heading mb-2">رسالتنا</h2>
            <p class="text-xs sm:text-sm text-solar-text-body leading-relaxed">
              تمكين الأفراد والمؤسسات والقطاع الزراعي من الوصول إلى منتجات طاقة أصلية معتمدة وخدمات هندسية رصينة بأسعار تنافسية وضمانات رسمية موثقة.
            </p>
          </div>

          <div class="solar-card p-6 sm:p-8 rounded-3xl border border-solar-border-card">
            <div class="size-12 rounded-2xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow flex items-center justify-center mb-4">
              <Award class="size-6 text-emerald-500" />
            </div>
            <h2 class="text-lg font-black text-solar-text-heading mb-2">معايير الاعتماد</h2>
            <p class="text-xs sm:text-sm text-solar-text-body leading-relaxed">
              تخضع جميع المتاجر للفحص القانوني والتجاري، ويخضع المهندسون للتحقق من رخص المزاولة، وتخضع المنتجات لمطابقة مواصفات الجودة العالمية Tier 1.
            </p>
          </div>
        </div>

        <!-- بروتوكول الضمانات الرسمية -->
        <div class="solar-card p-6 sm:p-8 rounded-3xl border border-solar-border-card bg-solar-bg-card">
          <h2 class="text-xl font-black text-solar-text-heading mb-6 text-center">
            بروتوكول الضمانات وجودة المعدات
          </h2>

          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div class="p-4 rounded-2xl bg-solar-bg-subtle text-center">
              <span class="text-2xl font-black font-mono text-solar-navy-dark dark:text-solar-yellow block mb-1">25 سنة</span>
              <span class="text-xs font-bold text-solar-text-heading block">كفالة أداء الألواح</span>
              <span class="text-[11px] text-solar-text-muted mt-1 block">ضمان إنتاجية لا تقل عن 84.8%</span>
            </div>

            <div class="p-4 rounded-2xl bg-solar-bg-subtle text-center">
              <span class="text-2xl font-black font-mono text-solar-navy-dark dark:text-solar-yellow block mb-1">5-10 سنوات</span>
              <span class="text-xs font-bold text-solar-text-heading block">ضمان المحولات الهجينة</span>
              <span class="text-[11px] text-solar-text-muted mt-1 block">ضمان مصنعي وتوفير قطع الغيار</span>
            </div>

            <div class="p-4 rounded-2xl bg-solar-bg-subtle text-center">
              <span class="text-2xl font-black font-mono text-solar-navy-dark dark:text-solar-yellow block mb-1">6000 دورة</span>
              <span class="text-xs font-bold text-solar-text-heading block">عمر بطاريات الليثيوم</span>
              <span class="text-[11px] text-solar-text-muted mt-1 block">خلايا LiFePO4 بدرجة أمان قصوى</span>
            </div>

            <div class="p-4 rounded-2xl bg-solar-bg-subtle text-center">
              <span class="text-2xl font-black font-mono text-solar-navy-dark dark:text-solar-yellow block mb-1">100%</span>
              <span class="text-xs font-bold text-solar-text-heading block">توثيق وفواتير نظامية</span>
              <span class="text-[11px] text-solar-text-muted mt-1 block">سجلات تجارية وعقود رسمية</span>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- النافذة المنبثقة الإيضاحية للقراءة فقط -->
    <VisitorDetailModal
      :is-open="isDetailModalOpen"
      :type="detailType"
      :item="selectedDetailItem"
      @close="closeDetail"
    />
  </div>
</template>
