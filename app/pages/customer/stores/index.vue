<script setup lang="ts">
import {
  ChevronLeft,
  Loader2,
  MapPin,
  Package,
  Phone,
  Search,
  ShieldCheck,
  Star,
  Store,
} from 'lucide-vue-next'
import { useCustomerProducts } from '~~/app/composables/useCustomerProducts'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'دليل المتاجر والوكلاء المعتمدين | SolarHub',
  description: 'ابحث عن كبرى شركات ومستوردي معدات الطاقة الشمسية الموثقين والمعتمدين.',
})

const { $api } = useNuxtApp()
const { governorates, fetchGovernorates } = useCustomerProducts()

interface StoreItem {
  id: string | number
  name: string
  legalName: string
  city: string
  address: string
  rating: number
  reviewsCount: number
  productsCount: number
  verified: boolean
  tierBadge: string
  description: string
  phone: string
  logo?: string
}

const stores = ref<StoreItem[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const selectedCity = ref('الكل')

onMounted(async () => {
  isLoading.value = true
  try {
    const [storesRes, _] = await Promise.all([
      $api<any>('/stores?per_page=100'),
      fetchGovernorates(),
    ])

    const rawList = (Array.isArray(storesRes)
      ? storesRes
      : (Array.isArray(storesRes?.data) ? storesRes.data : (Array.isArray(storesRes?.data?.data) ? storesRes.data.data : [])))
      .filter((s: any) => s.approval_status === 'approved')

    stores.value = rawList.map((s: any) => ({
      id: s.id,
      name: s.company_name || 'متجر معتمد',
      legalName: s.company_name || 'شركة معتمدة',
      city: s.governorate_name || s.governorate || s.city || 'اليمن',
      address: s.address_details || s.governorate_name || s.governorate || 'المركز الرئيسي',
      rating: Number(s.average_rating) || 4.9,
      reviewsCount: Number(s.ratings_count) || 0,
      productsCount: Number(s.store_products_count || s.products_count) || 0,
      verified: s.approval_status === 'approved',
      tierBadge: s.store_type === 'wholesaler' ? 'وكيل ومورد رئيسي' : 'متجر معتمد',
      description: s.bio || 'مورد معتمد لمنتجات ومعدات الطاقة الشمسية لدى منصة SolarHub.',
      phone: s.whatsapp_number || '',
      logo: s.company_logo_url,
    }))
  } catch (err) {
    console.error('Failed to load stores:', err)
  } finally {
    isLoading.value = false
  }
})

const filteredStores = computed(() => {
  return stores.value.filter((s) => {
    const q = searchQuery.value.trim().toLowerCase()
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.city.toLowerCase().includes(q)
    const matchCity = selectedCity.value === 'الكل' || s.city.includes(selectedCity.value)
    return matchSearch && matchCity
  })
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
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
          placeholder="ابحث باسم المتجر أو المورد أو المحافظة..."
          class="solar-input pr-10"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <select v-model="selectedCity" class="solar-input sm:w-48 text-xs font-medium">
          <option value="الكل">كافة المحافظات والمناطق</option>
          <option v-for="gov in governorates" :key="gov.id" :value="gov.name_ar">
            {{ gov.name_ar }}
          </option>
        </select>
      </div>
    </div>

    <!-- مؤشر التحميل -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <Loader2 class="size-8 animate-spin text-solar-yellow mb-2" />
      <span class="text-xs text-solar-text-muted">جاري تحميل دليل المتاجر والوكلاء المعتمدين...</span>
    </div>

    <!-- شبكة المتاجر -->
    <div v-else-if="filteredStores.length > 0" class="grid gap-5 md:grid-cols-2">
      <div
        v-for="store in filteredStores"
        :key="store.id"
        class="flex flex-col justify-between rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm hover:border-solar-yellow/60 transition-all group"
      >
        <div class="flex flex-col gap-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="flex size-14 shrink-0 items-center justify-center rounded-xl bg-solar-bg-subtle text-solar-navy overflow-hidden">
                <img v-if="store.logo" :src="store.logo" :alt="store.name" class="size-full object-contain p-1" />
                <Store v-else class="size-7" />
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2">
                  <h2 class="text-base font-bold text-solar-text-heading group-hover:text-amber-600 transition-colors">
                    {{ store.name }}
                  </h2>
                  <ShieldCheck v-if="store.verified" class="size-4 text-emerald-500" title="متجر موثق ومعتمد" />
                </div>
                <span class="text-xs text-solar-text-muted flex items-center gap-1 mt-0.5">
                  <MapPin class="size-3 text-solar-yellow" />
                  {{ store.city }}
                </span>
              </div>
            </div>

            <span class="badge-success text-[11px] whitespace-nowrap">{{ store.tierBadge }}</span>
          </div>

          <p class="text-xs leading-relaxed text-solar-text-secondary line-clamp-2">
            {{ store.description }}
          </p>

          <div class="flex flex-wrap items-center gap-4 text-xs text-solar-text-muted border-t border-solar-border-card pt-3">
            <div class="flex items-center gap-1">
              <Star class="size-3.5 fill-solar-yellow text-solar-yellow" />
              <span class="font-bold text-solar-text-heading">{{ store.rating }}</span>
              <span>({{ store.reviewsCount }} تقييم)</span>
            </div>
            <div v-if="store.phone" class="flex items-center gap-1">
              <Phone class="size-3.5 text-solar-yellow" />
              <bdi>{{ store.phone }}</bdi>
            </div>
          </div>
        </div>

        <div class="mt-5 flex items-center justify-between border-t border-solar-border-card pt-4">
          <div class="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <ShieldCheck class="size-4" />
            <span>متجر معتمد وموثق</span>
          </div>
          <NuxtLink :to="`/customer/stores/${store.id}`" class="btn-primary h-9 px-4 text-xs gap-1.5">
            <span>زيارة المتجر</span>
            <ChevronLeft class="size-3.5" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- حالة عدم العثور على نتائج -->
    <div
      v-else
      class="flex flex-col items-center justify-center rounded-2xl border border-solar-border-card bg-white p-12 text-center shadow-sm"
    >
      <Store class="size-12 text-solar-text-muted mb-3" />
      <h3 class="text-base font-bold text-solar-text-heading mb-1">لم يتم العثور على أي متجر مطابق للبحث</h3>
      <p class="text-xs text-solar-text-muted mb-4">جرب البحث بكلمات مختلفة أو اختر محافظة أخرى.</p>
      <button type="button" class="btn-outline text-xs" @click="searchQuery = ''; selectedCity = 'الكل'">
        إعادة تعيين الفلاتر
      </button>
    </div>
  </div>
</template>
