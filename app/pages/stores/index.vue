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
} from 'lucide-vue-next'
import { visitorStores } from '~~/app/data/visitor-mock'

useSeoMeta({
  title: 'دليل المتاجر والوكلاء المعتمدين لتقنيات الطاقة الشمسية | SolarHub',
  description: 'تصفح واكتشف كبرى المتاجر الرسمية، الوكلاء الحصريين والموزعين المعتمدين في المملكة لمنتجات الطاقة الكهروضوئية.',
})

// فلاتر البحث
const searchQuery = ref('')
const selectedType = ref('all')
const selectedCity = ref('all')
const selectedRating = ref('all')
const selectedCategory = ref('all')
const selectedSort = ref('rating')

const cities = ['all', 'الرياض', 'جدة', 'الدمام', 'القصيم', 'المدينة المنورة']

const filteredStores = computed(() => {
  return visitorStores.filter((store) => {
    const matchQuery =
      !searchQuery.value ||
      store.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      store.city.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      store.brands.some(b => b.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      store.tags.some(t => t.toLowerCase().includes(searchQuery.value.toLowerCase()))

    const matchType = selectedType.value === 'all' || store.badge === selectedType.value
    const matchCity = selectedCity.value === 'all' || store.city.includes(selectedCity.value)

    return matchQuery && matchType && matchCity
  })
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

    <!-- رأس الصفحة (Hero Header) المطابق لـ visitor_4.png -->
    <div class="grid gap-6 lg:grid-cols-12 items-center bg-white rounded-3xl border border-solar-border-card p-6 sm:p-8 lg:p-10 shadow-sm">
      <div class="flex flex-col gap-3 lg:col-span-8">
        <div class="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800">
          <span class="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>متاجر ووكلاء معتمدون ومفحوصون 100%</span>
        </div>

        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-solar-text-heading">
          دليل المتاجر والوكلاء المعتمدين لتقنيات الطاقة الشمسية
        </h1>

        <p class="text-xs sm:text-sm text-solar-text-body leading-relaxed max-w-2xl">
          تصفح واكتشف كبرى المتاجر الرسمية، الوكلاء الحصريين والموزعين المعتمدين في المملكة لمنتجات الطاقة الكهروضوئية المضمونة والمعتمدة وفق كود البناء السعودي.
        </p>
      </div>

      <!-- إحصائيات رأس الصفحة -->
      <div class="grid grid-cols-3 gap-2.5 lg:col-span-4 border-t lg:border-t-0 lg:border-r border-solar-border-card pt-4 lg:pt-0 lg:pr-6 text-center">
        <div class="flex flex-col gap-1 p-2">
          <span class="text-lg sm:text-xl font-black text-solar-navy-dark">+86</span>
          <span class="text-[11px] text-solar-text-muted">متجر ووكيل معتمد</span>
        </div>
        <div class="flex flex-col gap-1 p-2 border-x border-solar-border-card">
          <span class="text-lg sm:text-xl font-black text-solar-yellow">4.9 ★</span>
          <span class="text-[11px] text-solar-text-muted">متوسط التقييم</span>
        </div>
        <div class="flex flex-col gap-1 p-2">
          <span class="text-lg sm:text-xl font-black text-emerald-600">100%</span>
          <span class="text-[11px] text-solar-text-muted">فواتير وضمانات أصلية</span>
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
          placeholder="ابحث باسم المتجر، الوكيل، العلامة التجارية، أو المدينة..."
          class="flex-1 bg-transparent px-4 py-3 text-xs sm:text-sm text-solar-text-heading placeholder-solar-text-muted focus:outline-none"
        />
        <button type="button" class="btn-dark px-6 py-3 text-xs font-bold gap-2 rounded-xl">
          <Search class="size-4" />
          <span>بحث</span>
        </button>
      </div>

      <!-- القوائم المنسدلة للتصفية الخمسة المطابقة لـ visitor_4.png -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-3.5 rounded-2xl bg-white border border-solar-border-card text-xs font-bold shadow-sm">
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

        <!-- المدينة / المنطقة -->
        <div class="flex flex-col gap-1">
          <label class="text-solar-text-muted text-[10px]">المدينة / المنطقة</label>
          <select v-model="selectedCity" class="rounded-lg border border-solar-border-card bg-solar-bg-subtle px-3 py-2 text-xs text-solar-text-heading focus:outline-none focus:border-solar-yellow font-semibold">
            <option value="all">جميع المدن والمناطق</option>
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

        <!-- مجال التوريد -->
        <div class="flex flex-col gap-1">
          <label class="text-solar-text-muted text-[10px]">مجال التوريد</label>
          <select v-model="selectedCategory" class="rounded-lg border border-solar-border-card bg-solar-bg-subtle px-3 py-2 text-xs text-solar-text-heading focus:outline-none focus:border-solar-yellow font-semibold">
            <option value="all">جميع المنتجات والحلول</option>
            <option value="panels">ألواح ومحولات</option>
            <option value="pumps">مضخات زراعية</option>
            <option value="batteries">بطاريات وتخزين</option>
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
      </div>
    </div>

    <!-- ترويسة النتائج -->
    <div class="flex items-center justify-between text-xs text-solar-text-muted border-b border-solar-border-card pb-2">
      <span class="font-bold text-solar-text-heading">عرض النتائج من 1 إلى {{ filteredStores.length }}</span>
      <span class="rounded-full bg-solar-bg-subtle px-3 py-1 font-bold text-solar-navy">المتاجر والوكلاء المتاحون ({{ filteredStores.length }} متاجر)</span>
    </div>

    <!-- شبكة بطاقات المتاجر الثمانية المطابقة لـ visitor_4.png -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="store in filteredStores"
        :key="store.id"
        class="solar-card flex flex-col justify-between p-5 hover:border-solar-yellow transition-all"
      >
        <div>
          <!-- الرأس والبادجات -->
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
              <span class="size-1.5 rounded-full bg-emerald-500" />
              <span>متاح للتوريد</span>
            </span>

            <span
              class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border"
              :class="store.badge === 'وكيل رسمي' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : (store.badge === 'موزع معتمد' ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-amber-50 text-amber-800 border-amber-200')"
            >
              <ShieldCheck class="size-3" />
              <span>{{ store.badge }}</span>
            </span>
          </div>

          <!-- شعار واسم المتجر والموقع -->
          <div class="flex items-center gap-3 mb-4">
            <div class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-solar-navy text-white font-black text-sm shadow-sm ring-1 ring-white/10">
              {{ store.name.substring(0, 2) }}
            </div>
            <div class="text-right flex-1 min-w-0">
              <h2 class="text-xs sm:text-sm font-black text-solar-text-heading line-clamp-1" :title="store.name">
                {{ store.name }}
              </h2>
              <p class="text-[11px] text-solar-text-muted mt-0.5 flex items-center gap-1">
                <MapPin class="size-3 shrink-0" />
                <span class="truncate">{{ store.address }}</span>
              </p>
            </div>
          </div>

          <!-- صندوق الإحصائيات -->
          <div class="grid grid-cols-2 gap-2 text-center p-2.5 rounded-xl bg-solar-bg-subtle mb-4">
            <div>
              <span class="block text-sm font-black text-solar-navy-dark">{{ store.productsCount }} منتج</span>
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
              class="rounded-md bg-white border border-solar-border-card px-2 py-0.5 text-[10px] text-solar-text-body font-medium"
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

    <!-- الترقيم والصفحات المطابق لـ visitor_4.png -->
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
        <button type="button" class="size-8 rounded-lg bg-solar-yellow text-solar-navy-dark text-xs font-black">1</button>
        <button type="button" class="size-8 rounded-lg bg-white border border-solar-border-card text-solar-text-heading text-xs font-bold hover:bg-solar-bg-subtle">2</button>
        <button type="button" class="size-8 rounded-lg bg-white border border-solar-border-card text-solar-text-heading text-xs font-bold hover:bg-solar-bg-subtle">3</button>
        <span class="px-1 text-solar-text-muted text-xs">...</span>
        <button type="button" class="size-8 rounded-lg bg-white border border-solar-border-card text-solar-text-heading text-xs font-bold hover:bg-solar-bg-subtle">11</button>
      </div>

      <button
        type="button"
        class="flex items-center gap-1 text-xs font-bold text-solar-navy hover:text-solar-yellow transition-colors"
      >
        <span>التالي</span>
        <ChevronLeft class="size-4" />
      </button>
    </div>

    <!-- الكروت الأربعة للضمانات في الأسفل المطابقة لـ visitor_4.png -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-6 border-t border-solar-border-card/60">
      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark">
          <ShieldCheck class="size-5 text-solar-navy-dark" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">فحص التراخيص والسجلات</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">تحقق دوري وشامل من السجل التجاري والشهادات الهندسية لجميع الموردين المدرجين.</p>
        </div>
      </div>

      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark">
          <Zap class="size-5 text-solar-navy-dark" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">ضمانات مصنعية رسمية</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">تغطية كفالة الوكيل تصل حتى 25 سنة على كفاءة الألواح و 10 سنوات على الإنفرترات.</p>
        </div>
      </div>

      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark">
          <Truck class="size-5 text-solar-navy-dark" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">شحن ونقل متخصص</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">أسطول لوجستي مجهز ومخصص لنقل بطاريات الليثيوم والألواح الحساسة بدون أضرار.</p>
        </div>
      </div>

      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark">
          <Wrench class="size-5 text-solar-navy-dark" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">مطابقة أحمال واستشارات</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">دعم فني مباشر للتأكد من توافقية المحولات والألواح مع شبكة شركة الكهرباء.</p>
        </div>
      </div>
    </div>
  </div>
</template>
