<script setup lang="ts">
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  Heart,
  Search,
  ShieldCheck,
  Star,
  Store,
  Truck,
  Wrench,
  Zap,
} from 'lucide-vue-next'
import { visitorProducts } from '~~/app/data/visitor-mock'
import { useAuthModal } from '~~/app/composables/useAuthModal'

useSeoMeta({
  title: 'كتالوج المنتجات ومكونات الطاقة الكهروضوئية | SolarHub',
  description: 'تصفح وشراء أكثر من 1,240 منتج أصلي من كبرى الماركات العالمية (Tier 1) مباشرة من الوكلاء والموزعين المعتمدين.',
})

const route = useRoute()
const authModal = useAuthModal()

// حقول البحث والتصفية
const searchQuery = ref('')
const selectedBrand = ref('all')
const selectedCity = ref('all')
const selectedType = ref((route.query.type as string) || 'all')

const currentPage = ref(1)

const brands = ['all', 'Jinko Solar', 'Deye', 'Pylontech', 'LONGI', 'Growatt', 'Grundfos', 'Huawei', 'Victron Energy']
const cities = ['all', 'الرياض', 'جدة', 'الدمام', 'القصيم', 'المدينة المنورة', 'صنعاء']
const types = [
  { value: 'all', label: 'كافة الأنواع' },
  { value: 'panel', label: 'ألواح كهروضوئية' },
  { value: 'inverter', label: 'محولات هجينة' },
  { value: 'battery', label: 'بطاريات ليثيوم' },
  { value: 'pump', label: 'مضخات مياه' },
  { value: 'controller', label: 'منظمات MPPT' },
]

const filteredProducts = computed(() => {
  return visitorProducts.filter((product) => {
    const matchQuery =
      !searchQuery.value ||
      product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      product.model.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchBrand = selectedBrand.value === 'all' || product.brand === selectedBrand.value
    const matchCity = selectedCity.value === 'all' || product.storeCity.includes(selectedCity.value)
    const matchType = selectedType.value === 'all' || product.categoryType === selectedType.value

    return matchQuery && matchBrand && matchCity && matchType
  })
})

function handleQuote(productName: string) {
  authModal.open({
    title: 'لإرسال طلب عرض سعر، يرجى تسجيل الدخول',
    message: `سجّل الدخول إلى حسابك أو أنشئ حساباً جديداً لتتمكن من إرسال طلب عرض سعر لـ (${productName}) ومتابعة عروض الموردين مباشرة.`,
    actionType: 'quote',
  })
}
</script>

<template>
  <div class="container-page py-6 sm:py-10 flex flex-col gap-10">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading">كتالوج المنتجات ومكونات الطاقة</span>
    </nav>

    <!-- رأس الصفحة (Hero Header) المطابق لـ visitor_7.png -->
    <div class="grid gap-6 lg:grid-cols-12 items-center bg-white rounded-3xl border border-solar-border-card p-6 sm:p-8 lg:p-10 shadow-sm">
      <div class="flex flex-col gap-3 lg:col-span-8">
        <div class="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-800">
          <span class="size-2 rounded-full bg-solar-yellow animate-pulse" />
          <span>أكبر منصة معتمدة لمعدات الطاقة في المملكة واليمن</span>
        </div>

        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-solar-text-heading">
          كتالوج المنتجات ومكونات الطاقة الكهروضوئية
        </h1>

        <p class="text-xs sm:text-sm text-solar-text-body leading-relaxed max-w-2xl">
          تصفح وشراء أكثر من 1,240 منتج أصلي من كبرى الماركات العالمية (Tier 1) مباشرة من الوكلاء والموزعين المعتمدين مع فواتير ضريبية وضمانات مصنعية حتى 25 عاماً.
        </p>
      </div>

      <!-- إحصائيات رأس الصفحة -->
      <div class="grid grid-cols-3 gap-2.5 lg:col-span-4 border-t lg:border-t-0 lg:border-r border-solar-border-card pt-4 lg:pt-0 lg:pr-6 text-center">
        <div class="flex flex-col gap-1 p-2">
          <span class="text-lg sm:text-xl font-black text-solar-navy-dark">+1,240</span>
          <span class="text-[11px] text-solar-text-muted">معدة مسجلة</span>
        </div>
        <div class="flex flex-col gap-1 p-2 border-x border-solar-border-card">
          <span class="text-lg sm:text-xl font-black text-solar-yellow">86</span>
          <span class="text-[11px] text-solar-text-muted">متجر معتمد</span>
        </div>
        <div class="flex flex-col gap-1 p-2">
          <span class="text-lg sm:text-xl font-black text-emerald-600">Tier 1</span>
          <span class="text-[11px] text-solar-text-muted">معايير فحص عالمية</span>
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
          placeholder="ابحث باسم المنتج، الموديل، الماركة (مثل: Jinko 585W, Deye 8kW, Pylontech US5000)..."
          class="flex-1 bg-transparent px-4 py-3 text-xs sm:text-sm text-solar-text-heading placeholder-solar-text-muted focus:outline-none"
        />
        <button type="button" class="btn-dark px-6 py-3 text-xs font-bold gap-2 rounded-xl">
          <Search class="size-4" />
          <span>بحث</span>
        </button>
      </div>

      <!-- القوائم المنسدلة للتصفية المطابقة لـ visitor_7.png -->
      <div class="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-white border border-solar-border-card text-xs font-bold shadow-sm">
        <div class="flex items-center gap-1.5 text-solar-navy font-black pl-2 border-l border-solar-border-card shrink-0">
          <Filter class="size-4 text-solar-yellow" />
          <span>تصفية النتائج:</span>
        </div>

        <!-- فلتر الماركة -->
        <div class="flex items-center gap-1.5">
          <span class="text-solar-text-muted text-[11px]">الماركة:</span>
          <select v-model="selectedBrand" class="rounded-lg border border-solar-border-card bg-solar-bg-subtle px-3 py-1.5 text-xs text-solar-text-heading focus:outline-none focus:border-solar-yellow font-semibold">
            <option value="all">الكل</option>
            <option v-for="brand in brands.filter(b => b !== 'all')" :key="brand" :value="brand">{{ brand }}</option>
          </select>
        </div>

        <!-- فلتر المحافظة -->
        <div class="flex items-center gap-1.5">
          <span class="text-solar-text-muted text-[11px]">المحافظة:</span>
          <select v-model="selectedCity" class="rounded-lg border border-solar-border-card bg-solar-bg-subtle px-3 py-1.5 text-xs text-solar-text-heading focus:outline-none focus:border-solar-yellow font-semibold">
            <option value="all">كافة المناطق</option>
            <option v-for="city in cities.filter(c => c !== 'all')" :key="city" :value="city">{{ city }}</option>
          </select>
        </div>

        <!-- فلتر النوع -->
        <div class="flex items-center gap-1.5">
          <span class="text-solar-text-muted text-[11px]">النوع:</span>
          <select v-model="selectedType" class="rounded-lg border border-solar-border-card bg-solar-bg-subtle px-3 py-1.5 text-xs text-solar-text-heading focus:outline-none focus:border-solar-yellow font-semibold">
            <option v-for="type in types" :key="type.value" :value="type.value">{{ type.label }}</option>
          </select>
        </div>

        <button
          v-if="searchQuery || selectedBrand !== 'all' || selectedCity !== 'all' || selectedType !== 'all'"
          type="button"
          @click="searchQuery = ''; selectedBrand = 'all'; selectedCity = 'all'; selectedType = 'all'"
          class="mr-auto text-[11px] text-red-600 hover:underline"
        >
          إعادة تعيين الفلاتر
        </button>
      </div>
    </div>

    <!-- شبكة المنتجات الثمانية المطابقة لـ visitor_7.png -->
    <div v-if="filteredProducts.length > 0" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
            <span class="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold text-solar-navy shadow-sm">
              {{ product.brand }}
            </span>
            <button
              type="button"
              @click="handleQuote(product.name)"
              class="absolute top-2 left-2 flex size-7 items-center justify-center rounded-full bg-white/90 text-solar-text-muted hover:text-rose-500 shadow-sm"
              aria-label="إضافة للمفضلة"
            >
              <Heart class="size-3.5" />
            </button>
          </div>

          <!-- التقييم والنوع -->
          <div class="flex items-center justify-between gap-2 text-xs mb-1.5">
            <span class="text-solar-text-muted text-[11px] font-semibold">{{ product.category }}</span>
            <div class="flex items-center gap-1 font-bold text-amber-500">
              <Star class="size-3.5 fill-amber-400 text-amber-400" />
              <span>{{ product.rating }}</span>
              <span class="text-solar-text-muted text-[10px]">({{ product.reviewsCount }})</span>
            </div>
          </div>

          <!-- العنوان -->
          <h2 class="text-xs sm:text-sm font-black text-solar-text-heading line-clamp-2 leading-snug mb-2" :title="product.name">
            {{ product.name }}
          </h2>

          <!-- المتجر والموقع -->
          <div class="flex items-center gap-1.5 text-[11px] text-solar-text-muted mb-4">
            <Store class="size-3.5 shrink-0" />
            <span class="truncate">{{ product.storeName }} · {{ product.storeCity.split('-')[0] }}</span>
          </div>
        </div>

        <!-- الأزرار -->
        <div class="flex flex-col gap-2 pt-2 border-t border-solar-border-card/60">
          <button
            type="button"
            @click="handleQuote(product.name)"
            class="btn-primary w-full py-2 text-xs font-black gap-1.5 justify-center shadow-sm"
          >
            <FileText class="size-3.5" />
            <span>طلب سعر</span>
          </button>
          <NuxtLink
            :to="`/products/${product.id}`"
            class="text-center text-xs font-bold text-solar-text-body hover:text-solar-navy transition-colors flex items-center justify-center gap-1"
          >
            <span>عرض تفاصيل المنتج</span>
            <ArrowLeft class="size-3" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- في حالة عدم وجود نتائج -->
    <div v-else class="solar-card p-12 text-center flex flex-col items-center justify-center">
      <Search class="size-12 text-solar-text-muted mb-3" />
      <h3 class="text-base font-bold text-solar-text-heading mb-1">لم يتم العثور على منتجات مطابقة للبحث</h3>
      <p class="text-xs text-solar-text-muted mb-4">يرجى تجربة كلمات بحث أخرى أو إعادة تعيين الفلاتر.</p>
      <button
        type="button"
        @click="searchQuery = ''; selectedBrand = 'all'; selectedCity = 'all'; selectedType = 'all'"
        class="btn-outline text-xs"
      >
        إعادة تعيين الفلاتر
      </button>
    </div>

    <!-- الترقيم والصفحات المطابقة لـ visitor_7.png -->
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
        <button type="button" class="size-8 rounded-lg bg-white border border-solar-border-card text-solar-text-heading text-xs font-bold hover:bg-solar-bg-subtle">4</button>
        <span class="px-1 text-solar-text-muted text-xs">...</span>
        <button type="button" class="size-8 rounded-lg bg-white border border-solar-border-card text-solar-text-heading text-xs font-bold hover:bg-solar-bg-subtle">42</button>
      </div>

      <button
        type="button"
        class="flex items-center gap-1 text-xs font-bold text-solar-navy hover:text-solar-yellow transition-colors"
      >
        <span>التالي</span>
        <ChevronLeft class="size-4" />
      </button>
    </div>

    <!-- الكروت الأربعة للضمانات في الأسفل المطابقة لـ visitor_7.png -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-6 border-t border-solar-border-card/60">
      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark">
          <ShieldCheck class="size-5 text-solar-navy-dark" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">وكلاء وموردون موثوقون</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">سجلات تجارية مفحوصة ومطابقة للكود والمواصفات الخليجية.</p>
        </div>
      </div>

      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark">
          <Truck class="size-5 text-solar-navy-dark" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">شحن مخصص للمعدات</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">تغليف آمن وناقلون معتمدون لنقل الألواح والبطاريات الحساسة.</p>
        </div>
      </div>

      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark">
          <Zap class="size-5 text-solar-navy-dark" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">ضمانات معتمدة حتى 25 سنة</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">فواتير إلكترونية ضريبية وضمان خطي مباشر مع كل طلبية.</p>
        </div>
      </div>

      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark">
          <Wrench class="size-5 text-solar-navy-dark" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">مطابقة أحمال هندسية</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">إشراف هندسي للتأكد من توافق المكونات قبل الشحن والتثبيت.</p>
        </div>
      </div>
    </div>
  </div>
</template>
