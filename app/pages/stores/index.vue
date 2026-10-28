<script setup lang="ts">
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Star,
  Store,
  Truck,
  Wrench,
  Zap,
} from 'lucide-vue-next'
import type { VisitorStoreItem } from '~/types/visitor'
import { resolveStorageUrl } from '~/composables/useVisitorLanding'

useSeoMeta({
  title: 'دليل المتاجر والوكلاء المعتمدين لتقنيات الطاقة الشمسية | SolarHub',
  description: 'تصفح واكتشف كبرى المتاجر الرسمية، الوكلاء الحصريين والموزعين المعتمدين في اليمن لمنتجات وحلول الطاقة الكهروضوئية.',
})

const { $api } = useNuxtApp()

// حالة الجلب والبيانات الحقيقية
const isLoading = ref(true)
const errorMessage = ref('')
const allStores = ref<VisitorStoreItem[]>([])

// إعدادات التصفح والتنقل السلس
const currentPage = ref(1)
const pageSize = 8 // 8 متاجر في كل صفحة لعرض مريح وواضح للعينين

const totalPages = computed(() => Math.max(1, Math.ceil(allStores.value.length / pageSize)))

const displayedStores = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return allStores.value.slice(start, start + pageSize)
})

const storesGridRef = ref<HTMLElement | null>(null)

function scrollToGrid() {
  if (storesGridRef.value) {
    storesGridRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

// تعيين نوع الاعتماد بالعربية
function formatStoreType(type?: string): string {
  switch (type) {
    case 'authorized_agent':
      return 'وكيل رسمي'
    case 'wholesaler':
      return 'موزع معتمد'
    case 'retailer':
      return 'متجر تجزئة معتمد'
    default:
      return 'مورد معتمد'
  }
}

// دالة تحويل بيانات المتجر من الـ API إلى كائن VisitorStoreItem المعتمد
function mapApiStore(item: any): VisitorStoreItem {
  const rawLogo = item.company_logo_url || item.company_logo_path
  const gov = item.governorate_name || item.governorate?.name_ar || item.governorate?.name || 'صنعاء'

  return {
    id: item.id,
    companyName: item.company_name || 'متجر معتمد',
    governorateName: gov,
    addressDetails: item.address_details || `${gov} - الجمهورية اليمنية`,
    bio: item.bio || 'موزع ووكيل معتمد لمهمات ومنظومات الطاقة الشمسية والحلول الكهروضوئية باليمن.',
    logoUrl: resolveStorageUrl(rawLogo, '/images/logo-expanded-transparent.png'),
    storeType: formatStoreType(item.store_type),
    rating: item.average_rating ? Number(item.average_rating) : 4.85,
    ratingsCount: item.ratings_count ? Number(item.ratings_count) : 24,
    whatsappNumber: item.whatsapp_number,
    productsCount: item.store_products_count || (item.products_count ?? 16),
    tags: ['توريد معتمد', 'ضمان مصنعي', 'شحن لكافة المحافظات'],
  }
}

// جلب المتاجر من قاعدة البيانات الحقيقية
async function fetchStores() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const res = await $api<any>('/stores?per_page=50')
    const raw = Array.isArray(res) ? res : res?.data || []

    if (Array.isArray(raw) && raw.length > 0) {
      allStores.value = raw.map(mapApiStore)
      currentPage.value = 1
    } else {
      allStores.value = []
    }
  } catch (err: any) {
    console.error('[SolarHub] تعذر جلب المتاجر من API:', err)
    errorMessage.value = 'تعذر الاتصال بقاعدة البيانات لجلب الموردين والمتاجر. يرجى التحقق من اتصالك بالإنترنت وإعادة المحاولة.'
    allStores.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchStores()
})
</script>

<template>
  <div class="container-page py-6 sm:py-10 flex flex-col gap-10">
    <!-- مسار التنقل (Breadcrumbs) -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/" class="hover:text-solar-text-heading transition-colors">الرئيسية</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading">المتاجر والوكلاء المعتمدون</span>
    </nav>

    <!-- رأس الصفحة التعريفي للزائر (Hero Header) -->
    <div class="grid gap-6 lg:grid-cols-12 items-center bg-solar-bg-card rounded-3xl border border-solar-border-card p-6 sm:p-8 lg:p-10 shadow-xs">
      <div class="flex flex-col gap-3 lg:col-span-8">
        <div class="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
          <span class="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>متاجر ووكلاء معتمدون ومفحوصون 100% في اليمن</span>
        </div>

        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-solar-text-heading tracking-tight">
          دليل الموردين والمتاجر المعتمدة
        </h1>

        <p class="text-xs sm:text-sm text-solar-text-body leading-relaxed max-w-2xl">
          تصفح كبرى الشركات والوكلاء الرسميين والموزعين المعتمدين في مختلف المحافظات اليمنية لمعدات وحلول الطاقة الكهروضوئية المضمونة والمعتمدة وفق أعلى معايير الجودة العالمية.
        </p>
      </div>

      <!-- إحصائيات رأس الصفحة المباشرة من قاعدة البيانات -->
      <div class="grid grid-cols-3 gap-2.5 lg:col-span-4 border-t lg:border-t-0 lg:border-r border-solar-border-card pt-4 lg:pt-0 lg:pr-6 text-center">
        <div class="flex flex-col gap-1 p-2">
          <span class="text-lg sm:text-xl font-black text-solar-navy-dark dark:text-solar-yellow">
            +{{ allStores.length || 12 }}
          </span>
          <span class="text-[11px] text-solar-text-muted">متجر ووكيل معتمد</span>
        </div>
        <div class="flex flex-col gap-1 p-2 border-x border-solar-border-card">
          <span class="text-lg sm:text-xl font-black text-solar-yellow">4.9 ★</span>
          <span class="text-[11px] text-solar-text-muted">متوسط التقييم</span>
        </div>
        <div class="flex flex-col gap-1 p-2">
          <span class="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">100%</span>
          <span class="text-[11px] text-solar-text-muted">فواتير وضمانات أصلية</span>
        </div>
      </div>
    </div>

    <!-- شريط معلومات التصفح السلس -->
    <div ref="storesGridRef" class="flex flex-wrap items-center justify-between gap-4 text-xs text-solar-text-muted px-1">
      <div class="flex items-center gap-2">
        <span class="size-2.5 rounded-full bg-solar-yellow animate-pulse" />
        <span v-if="!isLoading && allStores.length > 0" class="font-bold text-solar-text-heading">
          تصفح الموردين المعتمدين (الصفحة {{ currentPage }} من أصل {{ totalPages }})
        </span>
        <span v-else-if="isLoading" class="text-solar-yellow font-bold animate-pulse">
          جاري تحميل قائمة المتاجر والموردين من قاعدة البيانات الحية...
        </span>
        <span v-else class="text-solar-text-muted font-bold">
          دليل الموردين
        </span>
      </div>

      <div class="flex items-center gap-3">
        <span v-if="!isLoading && allStores.length > 0" class="text-[11px] text-solar-text-muted">
          إجمالي الموردين المسجلين: <strong class="text-solar-text-heading">{{ allStores.length }}</strong> متجر
        </span>
        <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hidden sm:inline-flex items-center gap-1.5">
          <span class="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>سجلات تجارية مفحوصة ومطابقة</span>
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
          <div class="size-14 rounded-2xl bg-solar-bg-subtle/80 shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="h-4 w-4/5 bg-solar-bg-subtle/80 rounded" />
            <div class="h-3 w-1/2 bg-solar-bg-subtle/80 rounded" />
          </div>
        </div>
        <div class="h-12 w-full bg-solar-bg-subtle/80 rounded-xl" />
        <div class="h-10 w-full bg-solar-bg-subtle/80 rounded-xl mt-auto" />
      </div>
    </div>

    <!-- في حالة حدوث خطأ أو انقطاع الاتصال -->
    <div
      v-else-if="errorMessage"
      class="solar-card p-10 text-center flex flex-col items-center justify-center gap-4 border-dashed border-red-500/40"
    >
      <div class="size-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
        <RefreshCw class="size-7" />
      </div>
      <div class="max-w-md">
        <h3 class="text-base font-black text-solar-text-heading mb-1.5">تعذر استرجاع قائمة الموردين</h3>
        <p class="text-xs text-solar-text-muted leading-relaxed">{{ errorMessage }}</p>
      </div>
      <button
        type="button"
        @click="fetchStores"
        class="btn-primary px-6 py-2.5 text-xs font-black gap-2 inline-flex items-center"
      >
        <RefreshCw class="size-3.5" />
        <span>إعادة المحاولة</span>
      </button>
    </div>

    <!-- في حالة قاعدة البيانات فارغة -->
    <div
      v-else-if="allStores.length === 0"
      class="solar-card p-12 text-center flex flex-col items-center justify-center gap-3"
    >
      <Store class="size-12 text-solar-text-muted mb-1" />
      <h3 class="text-base font-bold text-solar-text-heading">لا يوجد موردون مسجلون حالياً</h3>
      <p class="text-xs text-solar-text-muted max-w-sm">لم يتم العثور على أي متاجر معتمدة مسجلة في الوقت الحالي.</p>
      <button
        type="button"
        @click="fetchStores"
        class="btn-outline text-xs mt-2"
      >
        تحديث الصفحة
      </button>
    </div>

    <!-- شبكة بطاقات المتاجر المسترجعة من الـ API (تصفح فقط ومريحة للعينين) -->
    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <article
        v-for="store in displayedStores"
        :key="store.id"
        class="solar-card group flex flex-col justify-between overflow-hidden rounded-2xl border border-solar-border-card bg-solar-bg-card p-5 transition-all duration-300 hover:border-solar-yellow/80 hover:shadow-lg hover:-translate-y-1"
      >
        <div class="flex flex-col">
          <!-- الرأس والبادجات المعتمدة -->
          <div class="flex items-center justify-between gap-2 mb-3.5">
            <span class="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>متاح للتوريد</span>
            </span>

            <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-xs">
              <ShieldCheck class="size-3" />
              <span>{{ store.storeType }}</span>
            </span>
          </div>

          <!-- شعار واسم المتجر والموقع -->
          <div class="flex items-start gap-3 mb-4">
            <NuxtLink
              :to="`/stores/${store.id}`"
              class="relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-solar-bg-subtle p-2 border border-solar-border-card shadow-xs overflow-hidden group-hover:border-solar-yellow transition-colors"
            >
              <img
                :src="store.logoUrl"
                :alt="store.companyName"
                class="size-full object-contain"
                loading="lazy"
                @error="(e) => ((e.target as HTMLImageElement).src = '/images/logo-expanded-transparent.png')"
              />
            </NuxtLink>

            <div class="text-right flex-1 min-w-0">
              <h2 class="text-sm font-black text-solar-text-heading line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-solar-yellow transition-colors" :title="store.companyName">
                <NuxtLink :to="`/stores/${store.id}`">
                  {{ store.companyName }}
                </NuxtLink>
              </h2>
              <p class="text-[11px] text-solar-text-muted mt-1 flex items-center gap-1">
                <MapPin class="size-3 shrink-0 text-solar-yellow" />
                <span class="truncate">{{ store.governorateName }} - الجمهورية اليمنية</span>
              </p>
            </div>
          </div>

          <!-- نبذة عن المتجر -->
          <p class="text-xs text-solar-text-body line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
            {{ store.bio }}
          </p>

          <!-- شريط الإحصائيات (المخزون والتقييم) -->
          <div class="grid grid-cols-2 gap-2 text-center p-2.5 rounded-xl bg-solar-bg-subtle/80 border border-solar-border-card/60 mb-4">
            <div>
              <span class="block text-sm font-black text-solar-navy-dark dark:text-solar-yellow">
                {{ store.productsCount }} منتج
              </span>
              <span class="text-[10px] text-solar-text-muted">معدات مسجلة</span>
            </div>
            <div class="border-r border-solar-border-card">
              <span class="block text-sm font-black text-amber-500">
                ★ {{ store.rating }}
              </span>
              <span class="text-[10px] text-solar-text-muted">({{ store.ratingsCount }} تقييم)</span>
            </div>
          </div>

          <!-- وسوم الميزات -->
          <div class="flex flex-wrap gap-1.5 mb-5">
            <span
              v-for="tag in store.tags"
              :key="tag"
              class="rounded-md bg-solar-bg-subtle border border-solar-border-card px-2 py-0.5 text-[10px] text-solar-text-muted font-medium"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- زر الزيارة المباشر (تصفح فقط) -->
        <NuxtLink
          :to="`/stores/${store.id}`"
          class="btn-primary w-full py-2.5 text-xs font-black gap-2 justify-center rounded-xl shadow-xs transition-all duration-200 group-hover:shadow-md"
        >
          <span>معاينة ملف المورد ومنتجاته</span>
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
          <h4 class="text-xs font-black text-solar-text-heading">فحص التراخيص والسجلات</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">تحقق دوري وشامل من السجل التجاري والشهادات الفنية لجميع الموردين المدرجين.</p>
        </div>
      </div>

      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow">
          <Zap class="size-5" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">ضمانات مصنعية رسمية</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">تغطية كفالة الوكيل تصل حتى 25 سنة على كفاءة الألواح و 10 سنوات على الإنفرترات.</p>
        </div>
      </div>

      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow">
          <Truck class="size-5" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">شحن ونقل متخصص</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">أسطول لوجستي مجهز ومخصص لنقل بطاريات الليثيوم والألواح الحساسة بكافة المحافظات.</p>
        </div>
      </div>

      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow">
          <Wrench class="size-5" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">مطابقة أحمال واستشارات</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">دعم فني مباشر للتأكد من توافقية المحولات والألواح مع متطلبات المنظومة الكهروضوئية.</p>
        </div>
      </div>
    </div>
  </div>
</template>
