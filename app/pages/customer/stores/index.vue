<script setup lang="ts">
import {
  Building2,
  ChevronLeft,
  MapPin,
  Package,
  Phone,
  Search,
  ShieldCheck,
  Star,
  Store,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'دليل المتاجر والوكلاء المعتمدين | SolarHub',
  description: 'ابحث عن كبرى شركات ومستوردي معدات الطاقة الشمسية الموثقين في المملكة.',
})

const searchQuery = ref('')
const selectedCity = ref('الكل')

const stores = ref([
  {
    id: 'shams-riyadh',
    name: 'شركة شمس الرياض للمهمات الكهروضوئية',
    legalName: 'شركة شمس الرياض للتجارة والمقاولات الكهروضوئية',
    city: 'الرياض - حي الملز',
    rating: 4.95,
    reviewsCount: 142,
    productsCount: 86,
    verified: true,
    tierBadge: 'وكيل Tier 1 عالمي',
    crNumber: '1010482910',
    description: 'الوكيل والموزع المعتمد لألواح Jinko Solar ومحولات Growatt في المنطقة الوسطى مع توفير أطول فترات ضمان معتمدة.',
    phone: '+966 11 482 9900',
  },
  {
    id: 'sahraa-energy',
    name: 'مؤسسة طاقة الصحراء للتوريدات المتقدمة',
    legalName: 'مؤسسة طاقة الصحراء للطاقة البديلة',
    city: 'الدمام - المدينة الصناعية',
    rating: 4.88,
    reviewsCount: 98,
    productsCount: 64,
    verified: true,
    tierBadge: 'موزع ليثيوم معتمد',
    crNumber: '2050198422',
    description: 'متخصصون في بطاريات الليثيوم Pylontech وأنظمة إدارة الطاقة Victron Energy ومضخات الآبار للمشاريع الزراعية.',
    phone: '+966 13 833 4411',
  },
  {
    id: 'nebras-solutions',
    name: 'شركة نبراس الحلول للطاقة المتجددة',
    legalName: 'شركة نبراس الحلول الهندسية المحدودة',
    city: 'جدة - طريق الملك فهد',
    rating: 4.82,
    reviewsCount: 76,
    productsCount: 42,
    verified: true,
    tierBadge: 'وكيل Deye معتمد',
    crNumber: '4030281944',
    description: 'المورد الرائد لمحولات Deye الهجينة وشواحن السيارات الكهربائية وأنظمة الحماية الكهروضوئية بالمملكة.',
    phone: '+966 12 660 7722',
  },
  {
    id: 'amana-group',
    name: 'مجموعة الأمانة لتجهيزات الطاقة والآبار',
    legalName: 'مجموعة الأمانة للتوريدات الزراعية',
    city: 'القصيم - بريدة',
    rating: 4.91,
    reviewsCount: 110,
    productsCount: 55,
    verified: true,
    tierBadge: 'شريك Grundfos',
    crNumber: '1131049281',
    description: 'حلول ضخ المياه بالطاقة الشمسية للآبار العميقة والمزارع الكبرى، وكلاء معتمدون لمضخات Grundfos SQFlex الدنماركية.',
    phone: '+966 16 381 2299',
  },
])

const filteredStores = computed(() => {
  return stores.value.filter((s) => {
    const matchSearch = !searchQuery.value || s.name.includes(searchQuery.value) || s.description.includes(searchQuery.value)
    const matchCity = selectedCity.value === 'الكل' || s.city.includes(selectedCity.value)
    return matchSearch && matchCity
  })
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted">
      <NuxtLink to="/customer/dashboard" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading">دليل المتاجر والوكلاء المعتمدين</span>
    </nav>

    <div class="flex flex-col gap-2">
      <h1 class="text-2xl font-black text-solar-text-heading">دليل المتاجر والوكلاء المعتمدين</h1>
      <p class="text-sm text-solar-text-secondary">
        تواصل مع الوكلاء الرسميين لعلامات الطاقة العالمية واشترِ معداتك بضمانات رسمية مباشرة من المورد.
      </p>
    </div>

    <!-- شريط البحث والتصفية -->
    <div class="flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-solar-border-card bg-white p-4 shadow-sm">
      <div class="relative flex-1 w-full">
        <Search class="absolute top-3.5 right-3.5 size-4 text-solar-text-muted" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="ابحث باسم المتجر أو المورد أو العلامة التجارية..."
          class="solar-input pr-10"
        />
      </div>

      <select v-model="selectedCity" class="solar-input sm:w-48">
        <option value="الكل">كافة المناطق والمدن</option>
        <option value="الرياض">منطقة الرياض</option>
        <option value="جدة">منطقة مكة / جدة</option>
        <option value="الدمام">المنطقة الشرقية / الدمام</option>
        <option value="القصيم">منطقة القصيم</option>
      </select>
    </div>

    <!-- شبكة المتاجر -->
    <div class="grid gap-6 md:grid-cols-2">
      <article
        v-for="store in filteredStores"
        :key="store.id"
        class="flex flex-col justify-between rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm transition-all hover:border-solar-yellow/60 hover:shadow-hover"
      >
        <div class="flex flex-col gap-3">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3.5">
              <div class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-solar-navy text-white shadow-sm">
                <Building2 class="size-7" />
              </div>

              <div class="flex flex-col">
                <div class="flex items-center gap-2">
                  <h2 class="text-base font-bold text-solar-text-heading">{{ store.name }}</h2>
                  <ShieldCheck class="size-4 text-emerald-500 shrink-0" title="سجل تجاري موثق" />
                </div>
                <span class="text-xs text-solar-text-muted flex items-center gap-1 mt-0.5">
                  <MapPin class="size-3.5 text-solar-yellow" />
                  {{ store.city }}
                </span>
              </div>
            </div>

            <span class="badge-success text-[10px] shrink-0">{{ store.tierBadge }}</span>
          </div>

          <p class="text-xs leading-relaxed text-solar-text-secondary line-clamp-2">
            {{ store.description }}
          </p>

          <div class="flex flex-wrap items-center gap-4 text-xs pt-2 border-t border-solar-border-card">
            <div class="flex items-center gap-1 font-bold text-solar-text-heading">
              <Star class="size-3.5 fill-solar-yellow text-solar-yellow" />
              <span>{{ store.rating }}</span>
              <span class="text-solar-text-muted">({{ store.reviewsCount }} تقييم)</span>
            </div>

            <div class="flex items-center gap-1 text-solar-text-secondary">
              <Package class="size-3.5 text-solar-navy" />
              <span>{{ store.productsCount }} منتج معتمد</span>
            </div>

            <span class="text-[11px] text-solar-text-muted mr-auto">س.ت: {{ store.crNumber }}</span>
          </div>
        </div>

        <div class="mt-5 pt-3 border-t border-solar-border-card flex items-center justify-between">
          <a :href="`tel:${store.phone}`" class="text-xs text-solar-text-muted hover:text-solar-text-heading flex items-center gap-1">
            <Phone class="size-3.5" />
            <span>{{ store.phone }}</span>
          </a>

          <NuxtLink :to="`/customer/stores/${store.id}`" class="btn-primary h-9 px-4 text-xs gap-1.5">
            <span>زيارة المتجر واستعراض المنتجات</span>
            <ChevronLeft class="size-4" />
          </NuxtLink>
        </div>
      </article>
    </div>
  </div>
</template>
