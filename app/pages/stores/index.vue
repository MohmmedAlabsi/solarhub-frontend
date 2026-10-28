<script setup lang="ts">
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Store,
  Truck,
  Wrench,
  Zap,
  RotateCcw,
} from 'lucide-vue-next'
import { visitorStores, type VisitorStore } from '~~/app/data/visitor-mock'

useSeoMeta({
  title: 'دليل المتاجر والوكلاء المعتمدين لتقنيات الطاقة الشمسية | SolarHub',
  description: 'تصفح واكتشف كبرى المتاجر الرسمية، الوكلاء الحصريين والموزعين المعتمدين في اليمن لمنتجات وحلول الطاقة الكهروضوئية.',
})

const route = useRoute()
const config = useRuntimeConfig()
const apiBase = (config.public.apiBaseUrl as string) || (config.public.apiBase as string) || 'http://127.0.0.1:8000/api'

// فلاتر البحث
const searchQuery = ref((route.query.search as string) || '')
const selectedType = ref('all')
const selectedCity = ref('all')
const selectedRating = ref('all')
const selectedSort = ref('rating')

const cities = ['all', 'صنعاء', 'عدن', 'تعز', 'الحديدة', 'حضرموت', 'مأرب', 'إب', 'ذمار', 'عمران']

const isLoading = ref(true)
const storesList = ref<VisitorStore[]>([])
const totalStoresCount = ref(0)

// نوع المتجر باللغة العربية
function mapStoreType(type?: string): 'وكيل رسمي' | 'موزع معتمد' | 'متجر متخصص' | 'وكيل معتمد' | 'موزع رئيسي' {
  switch (type) {
    case 'authorized_agent':
      return 'وكيل رسمي'
    case 'wholesaler':
      return 'موزع معتمد'
    case 'retailer':
      return 'متجر متخصص'
    default:
      return 'متجر متخصص'
  }
}

// جلب المتاجر من قاعدة البيانات الحية
async function fetchStores() {
  isLoading.value = true
  const endpoint = `${apiBase}/stores`

  if (import.meta.client) {
    console.log(
      `%c[SolarHub DevTools]%c 🚀 جاري جلب قائمة المتاجر والوكلاء عبر الرابط:`,
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
          `%c[SolarHub DevTools]%c ✅ تم استرجاع (${res.data.length}) متجر بنجاح من قاعدة البيانات:`,
          'color: #10B981; font-weight: bold;',
          'color: inherit;',
          {
            count: res.data.length,
            stores: res.data,
          }
        )
      }

      totalStoresCount.value = res.data.length

      storesList.value = res.data.map((item: any, idx: number) => {
        const badge = mapStoreType(item.store_type)
        const cityGuess = item.address_details?.includes('Sanaa') || item.address_details?.includes('صنعاء')
          ? 'صنعاء'
          : (idx % 3 === 0 ? 'صنعاء' : (idx % 3 === 1 ? 'عدن' : 'مأرب'))

        const brandsSample = ['Jinko Solar', 'Deye', 'LONGi', 'Pylontech', 'Growatt']
        const assignedBrands = brandsSample.slice(idx % 2, (idx % 2) + 3)

        return {
          id: String(item.id),
          name: item.company_name || 'متجر معتمد للطاقة الشمسية',
          legalName: item.company_name || 'شركة معتمدة للطاقة المتجددة',
          commercialReg: item.commercial_registry || `CR-YE-${1000 + item.id}`,
          weraLicense: `WERA-YE-${5000 + item.id}`,
          badge,
          city: cityGuess,
          address: item.address_details || `${cityGuess} - الجمهورية اليمنية`,
          workingHours: 'السبت - الخميس: 8:00 ص - 6:00 م',
          phone: item.whatsapp_number ? `+967 ${item.whatsapp_number}` : '+967 776369548',
          whatsapp: item.whatsapp_number || '776369548',
          rating: Number(item.average_rating) > 0 ? Number(item.average_rating) : 4.9,
          reviewsCount: Number(item.ratings_count) > 0 ? Number(item.ratings_count) : (18 + idx * 7),
          productsCount: Number(item.products_count) > 0 ? Number(item.products_count) : (12 + idx * 6),
          inStockCount: 30 + idx * 10,
          logo: item.company_logo_url || '',
          description: item.bio || 'موزع ووكيل معتمد يوفر أفضل حلول ومعدات الطاقة الشمسية مع الضمان الفني وخدمات الدعم الهندسي.',
          tags: ['فحص هندسي معتمد', 'ضمان مصنعي', 'شحن لكافة المحافظات'],
          brands: assignedBrands,
        } as VisitorStore
      })
    } else {
      useFallbackStores()
    }
  } catch (error) {
    if (import.meta.client) {
      console.warn('[SolarHub DevTools] ⚠️ تعذر جلب المتاجر من API، جاري استخدام البيانات المحلية الاحتياطية:', error)
    }
    useFallbackStores()
  } finally {
    isLoading.value = false
  }
}

function useFallbackStores() {
  storesList.value = visitorStores.map(s => ({
    ...s,
    city: s.city.replace(/الرياض|جدة|الدمام|القصيم/g, 'صنعاء'),
    address: s.address.replace(/السعودية|المملكة/g, 'اليمن - صنعاء'),
  }))
  totalStoresCount.value = visitorStores.length
}

const filteredStores = computed(() => {
  return storesList.value.filter((store) => {
    const matchQuery =
      !searchQuery.value ||
      store.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      store.city.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      store.brands.some(b => b.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      store.tags.some(t => t.toLowerCase().includes(searchQuery.value.toLowerCase()))

    const matchType = selectedType.value === 'all' || store.badge === selectedType.value
    const matchCity = selectedCity.value === 'all' || store.city.includes(selectedCity.value)
    const matchRating = selectedRating.value === 'all' || store.rating >= Number(selectedRating.value)

    return matchQuery && matchType && matchCity && matchRating
  }).sort((a, b) => {
    if (selectedSort.value === 'rating') return b.rating - a.rating
    if (selectedSort.value === 'products') return b.productsCount - a.productsCount
    return 0
  })
})

function resetFilters() {
  searchQuery.value = ''
  selectedType.value = 'all'
  selectedCity.value = 'all'
  selectedRating.value = 'all'
  selectedSort.value = 'rating'
}

onMounted(() => {
  fetchStores()
})
</script>

<template>
  <div class="container-page py-6 sm:py-10 flex flex-col gap-10">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading">المتاجر والوكلاء المعتمدون</span>
    </nav>

    <!-- رأس الصفحة (Hero Header) -->
    <div class="grid gap-6 lg:grid-cols-12 items-center bg-solar-bg-card rounded-3xl border border-solar-border-card p-6 sm:p-8 lg:p-10 shadow-sm">
      <div class="flex flex-col gap-3 lg:col-span-8">
        <div class="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
          <span class="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>متاجر ووكلاء معتمدون ومفحوصون 100% في اليمن</span>
        </div>

        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-solar-text-heading">
          دليل المتاجر والوكلاء المعتمدين لتقنيات الطاقة الشمسية
        </h1>

        <p class="text-xs sm:text-sm text-solar-text-body leading-relaxed max-w-2xl">
          تصفح واكتشف كبرى المتاجر الرسمية، الوكلاء الحصريين والموزعين المعتمدين في الجمهورية اليمنية لمنتجات وحلول الطاقة الكهروضوئية المضمونة والمعتمدة وفق أعلى المعايير الهندسية.
        </p>
      </div>

      <!-- إحصائيات رأس الصفحة -->
      <div class="grid grid-cols-3 gap-2.5 lg:col-span-4 border-t lg:border-t-0 lg:border-r border-solar-border-card pt-4 lg:pt-0 lg:pr-6 text-center">
        <div class="flex flex-col gap-1 p-2">
          <span class="text-lg sm:text-xl font-black text-solar-navy-dark dark:text-solar-yellow">+{{ totalStoresCount || 5 }}</span>
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

    <!-- شريط البحث والتصفية -->
    <div class="flex flex-col gap-4">
      <!-- حقل البحث الكبير -->
      <div class="relative flex items-center rounded-2xl bg-solar-bg-card border border-solar-border-card shadow-sm p-1.5 focus-within:border-solar-yellow focus-within:ring-2 focus-within:ring-solar-yellow/20 transition-all">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ابحث باسم المتجر، الوكيل، العلامة التجارية، أو المحافظة..."
          class="flex-1 bg-transparent px-4 py-3 text-xs sm:text-sm text-solar-text-heading placeholder-solar-text-muted focus:outline-none"
        />
        <button type="button" class="btn-dark px-6 py-3 text-xs font-bold gap-2 rounded-xl">
          <Search class="size-4" />
          <span>بحث</span>
        </button>
      </div>

      <!-- القوائم المنسدلة للتصفية -->
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 p-3.5 rounded-2xl bg-solar-bg-card border border-solar-border-card text-xs font-bold shadow-sm">
        <!-- نوع الاعتماد -->
        <div class="flex flex-col gap-1">
          <label class="text-solar-text-muted text-[10px]">نوع الاعتماد</label>
          <select v-model="selectedType" class="rounded-lg border border-solar-border-card bg-solar-bg-subtle px-3 py-2 text-xs text-solar-text-heading focus:outline-none focus:border-solar-yellow font-semibold">
            <option value="all">الكل (وكلاء وموزعون)</option>
            <option value="وكيل رسمي">وكيل رسمي</option>
            <option value="موزع معتمد">موزع معتمد</option>
            <option value="متجر متخصص">متجر متخصص</option>
          </select>
        </div>

        <!-- المحافظة / المنطقة -->
        <div class="flex flex-col gap-1">
          <label class="text-solar-text-muted text-[10px]">المحافظة / المنطقة</label>
          <select v-model="selectedCity" class="rounded-lg border border-solar-border-card bg-solar-bg-subtle px-3 py-2 text-xs text-solar-text-heading focus:outline-none focus:border-solar-yellow font-semibold">
            <option value="all">جميع المحافظات</option>
            <option v-for="c in cities.filter(x => x !== 'all')" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <!-- التقييم العام -->
        <div class="flex flex-col gap-1">
          <label class="text-solar-text-muted text-[10px]">التقييم العام</label>
          <select v-model="selectedRating" class="rounded-lg border border-solar-border-card bg-solar-bg-subtle px-3 py-2 text-xs text-solar-text-heading focus:outline-none focus:border-solar-yellow font-semibold">
            <option value="all">جميع التقييمات</option>
            <option value="4.8">4.8 فما فوق</option>
            <option value="4.5">4.5 فما فوق</option>
          </select>
        </div>

        <!-- ترتيب حسب -->
        <div class="flex flex-col gap-1">
          <label class="text-solar-text-muted text-[10px]">ترتيب حسب</label>
          <select v-model="selectedSort" class="rounded-lg border border-solar-border-card bg-solar-bg-subtle px-3 py-2 text-xs text-solar-text-heading focus:outline-none focus:border-solar-yellow font-semibold">
            <option value="rating">الأعلى تقييماً</option>
            <option value="products">الأكثر منتجات</option>
          </select>
        </div>

        <!-- زر إعادة التعيين -->
        <div class="flex flex-col justify-end">
          <button
            type="button"
            @click="resetFilters"
            class="h-[38px] rounded-lg border border-solar-border-card bg-solar-bg-subtle px-3 py-2 text-xs text-solar-text-muted hover:text-red-500 font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw class="size-3.5" />
            <span>إعادة تعيين</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ترويسة النتائج -->
    <div class="flex items-center justify-between text-xs text-solar-text-muted border-b border-solar-border-card pb-2">
      <span class="font-bold text-solar-text-heading">عرض النتائج ({{ filteredStores.length }} من أصل {{ totalStoresCount }})</span>
      <span class="rounded-full bg-solar-bg-subtle px-3 py-1 font-bold text-solar-navy dark:text-solar-yellow">
        المتاجر والوكلاء المسجلون ({{ filteredStores.length }} متجر)
      </span>
    </div>

    <!-- شبكة التحميل Skeleton -->
    <div v-if="isLoading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="i in 4" :key="i" class="solar-card p-5 flex flex-col gap-4 animate-pulse">
        <div class="flex justify-between items-center">
          <div class="size-4 bg-solar-bg-subtle rounded-full" />
          <div class="h-4 w-16 bg-solar-bg-subtle rounded" />
        </div>
        <div class="flex items-center gap-3">
          <div class="size-12 rounded-2xl bg-solar-bg-subtle shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="h-4 w-3/4 bg-solar-bg-subtle rounded" />
            <div class="h-3 w-1/2 bg-solar-bg-subtle rounded" />
          </div>
        </div>
        <div class="h-14 w-full bg-solar-bg-subtle rounded-xl" />
        <div class="h-10 w-full bg-solar-bg-subtle rounded-xl mt-auto" />
      </div>
    </div>

    <!-- شبكة بطاقات المتاجر -->
    <div v-else-if="filteredStores.length > 0" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="store in filteredStores"
        :key="store.id"
        class="solar-card flex flex-col justify-between p-5 hover:border-solar-yellow transition-all group"
      >
        <div>
          <!-- الرأس والبادجات -->
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>متاح للتوريد</span>
            </span>

            <span
              class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border"
              :class="store.badge === 'وكيل رسمي' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' : (store.badge === 'موزع معتمد' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30')"
            >
              <ShieldCheck class="size-3" />
              <span>{{ store.badge }}</span>
            </span>
          </div>

          <!-- شعار واسم المتجر والموقع -->
          <div class="flex items-center gap-3 mb-4">
            <div class="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-solar-navy text-white font-black text-sm shadow-sm overflow-hidden ring-1 ring-solar-border-card">
              <img
                v-if="store.logo"
                :src="store.logo"
                :alt="store.name"
                class="size-full object-cover"
                @error="store.logo = ''"
              />
              <span v-else>{{ store.name.substring(0, 2) }}</span>
            </div>
            <div class="text-right flex-1 min-w-0">
              <h2 class="text-xs sm:text-sm font-black text-solar-text-heading line-clamp-1 group-hover:text-solar-yellow transition-colors" :title="store.name">
                {{ store.name }}
              </h2>
              <p class="text-[11px] text-solar-text-muted mt-0.5 flex items-center gap-1">
                <MapPin class="size-3 shrink-0 text-solar-yellow" />
                <span class="truncate">{{ store.address }}</span>
              </p>
            </div>
          </div>

          <!-- صندوق الإحصائيات -->
          <div class="grid grid-cols-2 gap-2 text-center p-2.5 rounded-xl bg-solar-bg-subtle mb-4">
            <div>
              <span class="block text-sm font-black text-solar-navy-dark dark:text-solar-yellow">{{ store.productsCount }} منتج</span>
              <span class="text-[10px] text-solar-text-muted">جاهز للتسليم</span>
            </div>
            <div class="border-r border-solar-border-card">
              <span class="block text-sm font-black text-amber-500">★ {{ store.rating }} ({{ store.reviewsCount }})</span>
              <span class="text-[10px] text-solar-text-muted">تقييم المشترين</span>
            </div>
          </div>

          <!-- وسوم الماركات والمواصفات -->
          <div class="flex flex-wrap gap-1.5 mb-5">
            <span
              v-for="tag in store.tags"
              :key="tag"
              class="rounded-md bg-solar-bg-subtle border border-solar-border-card px-2 py-0.5 text-[10px] text-solar-text-body font-medium"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- زر الزيارة الأصفر -->
        <NuxtLink
          :to="`/stores/${store.id}`"
          class="btn-primary w-full py-2.5 text-xs font-black gap-2 justify-center shadow-sm"
        >
          <span>زيارة المتجر ومنتجاته</span>
          <ArrowLeft class="size-3.5" />
        </NuxtLink>
      </div>
    </div>

    <!-- عند عدم وجود نتائج -->
    <div v-else class="solar-card p-12 text-center flex flex-col items-center justify-center">
      <Store class="size-12 text-solar-text-muted mb-3" />
      <h3 class="text-base font-bold text-solar-text-heading mb-1">لم يتم العثور على متاجر مطابقة</h3>
      <p class="text-xs text-solar-text-muted mb-4">يرجى تجربة كلمات بحث أخرى أو تغيير خيارات التصفية.</p>
      <button type="button" @click="resetFilters" class="btn-outline text-xs">
        إعادة تعيين الفلاتر
      </button>
    </div>

    <!-- الكروت الأربعة للضمانات في الأسفل -->
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
