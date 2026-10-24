<script setup lang="ts">
import {
  Building2,
  Clock,
  Loader2,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Star,
  Store,
} from 'lucide-vue-next'
import { useCustomerProducts, type CustomerProductView } from '~~/app/composables/useCustomerProducts'
import CustomerEcommerceProductCard from '~/components/customer/ecommerce/ProductCard.vue'
import CommonMapLocationModal from '~/components/common/MapLocationModal.vue'

definePageMeta({
  layout: 'customer',
})

const route = useRoute()
const { $api } = useNuxtApp()
const { fetchStoreProducts } = useCustomerProducts()

const storeId = Array.isArray(route.params.id) ? (route.params.id[0] ?? '') : (route.params.id ?? '')

const isLoading = ref(true)
const store = ref<any | null>(null)
const storeProducts = ref<CustomerProductView[]>([])
const isMapModalOpen = ref(false)

useSeoMeta({
  title: () => (store.value ? `${store.value.name} | SolarHub` : 'الملف التعريفي للمتجر | SolarHub'),
  description: () => store.value?.description || 'المورد والوكيل المعتمد لمعدات الطاقة الشمسية.',
})

onMounted(async () => {
  isLoading.value = true
  try {
    const [storeRes, productsRes] = await Promise.all([
      $api<any>(`/stores/${storeId}`).catch(() => null),
      fetchStoreProducts({ store_id: storeId }).catch(() => []),
    ])

    const rawStore = storeRes?.data || storeRes
    if (rawStore) {
      const governorate = rawStore.governorate_name || rawStore.governorate || rawStore.user?.governorate?.name_ar || rawStore.city || 'اليمن'
      const coords = parseCoordinates(rawStore.location_coordinates || rawStore.coordinates, governorate)

      store.value = {
        id: rawStore.id,
        name: rawStore.company_name || 'متجر معتمد',
        legalName: rawStore.company_name,
        city: governorate,
        address: rawStore.address_details || governorate,
        coordinates: coords,
        phone: rawStore.whatsapp_number || '',
        workingHours: 'السبت - الخميس: 8:00 ص - 6:00 م',
        rating: Number(rawStore.average_rating) || 4.9,
        reviewsCount: Number(rawStore.ratings_count) || 0,
        verified: rawStore.approval_status === 'approved',
        tierBadge: rawStore.store_type === 'wholesaler' ? 'وكيل ومورد رئيسي' : 'متجر معتمد',
        description: rawStore.bio || 'مورد معتمد لمعدات ومنظومات الطاقة الشمسية في منصة SolarHub.',
        logo: rawStore.company_logo_url,
      }
    }

    storeProducts.value = Array.isArray(productsRes) ? productsRes : ((productsRes as any)?.data || [])
  } catch (err) {
    console.error('Error fetching store details:', err)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- مؤشر التحميل -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-24">
      <Loader2 class="size-8 animate-spin text-solar-yellow mb-2" />
      <span class="text-xs text-solar-text-muted">جاري تحميل بيانات المتجر والمنتجات التابعة له...</span>
    </div>

    <!-- المحتوى بعد التحميل -->
    <template v-else-if="store">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
        <NuxtLink to="/customer/dashboard" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
        <span>/</span>
        <NuxtLink to="/customer/stores" class="hover:text-solar-text-heading">دليل المتاجر</NuxtLink>
        <span>/</span>
        <span class="font-bold text-solar-text-heading truncate">{{ store.name }}</span>
      </nav>

      <!-- بانر ورأس الملف التعريفي للمتجر -->
      <div class="relative overflow-hidden rounded-2xl border border-solar-border-card bg-white shadow-sm">
        <div class="h-36 bg-gradient-to-l from-solar-navy via-solar-navy-dark to-slate-900 px-6 py-4 flex items-end">
          <span class="badge-success text-xs mb-2">{{ store.tierBadge }}</span>
        </div>

        <div class="p-6">
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-14 mb-4">
            <div class="flex items-end gap-4">
              <div class="flex size-20 sm:size-24 shrink-0 items-center justify-center rounded-2xl bg-white border-4 border-white shadow-md text-solar-navy overflow-hidden">
                <img v-if="store.logo" :src="store.logo" :alt="store.name" class="size-full object-contain p-1" />
                <Building2 v-else class="size-10 sm:size-12" />
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2">
                  <h1 class="text-xl sm:text-2xl font-black text-solar-text-heading">{{ store.name }}</h1>
                  <ShieldCheck v-if="store.verified" class="size-5 text-emerald-500" title="متجر معتمد وموثق" />
                </div>
                <span class="text-xs text-solar-text-muted flex items-center gap-1 mt-0.5">
                  <MapPin class="size-3 text-solar-yellow" />
                  {{ store.city }}
                </span>
              </div>
            </div>

            <div v-if="store.phone" class="flex items-center gap-2">
              <a :href="`tel:${store.phone}`" class="btn-primary h-10 px-4 text-xs gap-1.5">
                <Phone class="size-4" />
                <span>اتصال بالمبيعات</span>
              </a>
            </div>
          </div>

          <p class="text-xs leading-relaxed text-solar-text-secondary max-w-4xl pt-2 border-t border-solar-border-card">
            {{ store.description }}
          </p>

          <!-- شبكة بيانات المتجر والاعتماد -->
          <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 border-t border-solar-border-card pt-4 text-xs">
            <button
              type="button"
              class="flex items-center gap-2.5 text-solar-text-secondary hover:text-solar-navy-dark transition-colors cursor-pointer group text-right"
              title="عرض موقع المتجر على الخريطة التفاعلية"
              @click="isMapModalOpen = true"
            >
              <MapPin class="size-4 text-solar-yellow shrink-0 group-hover:scale-110 transition-transform" />
              <span class="underline decoration-dotted truncate">{{ store.address }}</span>
            </button>

            <div class="flex items-center gap-2.5 text-solar-text-secondary">
              <Clock class="size-4 text-solar-yellow shrink-0" />
              <span>{{ store.workingHours }}</span>
            </div>

            <div class="flex items-center gap-2.5 text-solar-text-secondary">
              <ShieldCheck class="size-4 text-emerald-500 shrink-0" />
              <span>ضمان أصلي ومعتمد 100%</span>
            </div>

            <div class="flex items-center gap-2.5 text-solar-text-secondary">
              <Star class="size-4 fill-solar-yellow text-solar-yellow shrink-0" />
              <span>التقييم: {{ store.rating }} ({{ store.reviewsCount }} تقييم)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- قسم المنتجات المعروضة من هذا المتجر -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-solar-text-heading">
            المنتجات والمعدات المعتمدة من هذا المتجر ({{ storeProducts.length }})
          </h2>
          <span class="text-xs text-solar-text-muted">جميع المنتجات أصلية بضمانات معتمدة</span>
        </div>

        <div v-if="storeProducts.length > 0" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <CustomerEcommerceProductCard
            v-for="product in storeProducts"
            :key="product.id"
            :product="product"
          />
        </div>

        <div
          v-else
          class="flex flex-col items-center justify-center rounded-2xl border border-solar-border-card bg-white p-12 text-center"
        >
          <Package class="size-10 text-solar-text-muted mb-2" />
          <h3 class="text-sm font-bold text-solar-text-heading mb-1">لا توجد منتجات معروضة حالياً لهذا المتجر</h3>
          <p class="text-xs text-solar-text-muted max-w-sm">
            يمكنك تصفح باقي المتاجر أو استعراض الكتالوج المرجعي للمنتجات لطلب عروض أسعار.
          </p>
          <NuxtLink to="/customer/products" class="btn-primary text-xs mt-4">
            تصفح كتالوج المنتجات
          </NuxtLink>
        </div>
      </div>

      <!-- نافذة استعراض موقع المتجر والمستودع على الخريطة التفاعلية -->
      <CommonMapLocationModal
        :is-open="isMapModalOpen"
        :initial-coordinates="store.coordinates"
        :current-location="store.address"
        :title="`موقع متجر ${store.name} على الخريطة`"
        subtitle="الموقع الفعلي للمتجر والمستودعات المعتمدة لاستلام وفحص البضائع وتنسيق الشحن"
        @close="isMapModalOpen = false"
        @select="isMapModalOpen = false"
      />
    </template>

<<<<<<< HEAD
    <!-- نافذة استعراض موقع المتجر والمستودع على الخريطة -->
    <CommonMapLocationModal
      :is-open="isMapModalOpen"
      :current-location="store.locationCoordinates || store.address"
      :title="`موقع متجر ${store.name} على الخريطة`"
      subtitle="الموقع الفعلي للمتجر والمستودعات المعتمدة لاستلام وفحص البضائع وتنسيق الشحن"
      @close="isMapModalOpen = false"
      @select="isMapModalOpen = false"
    />
=======
    <!-- في حال عدم العثور على المتجر -->
    <div v-else class="flex flex-col items-center justify-center py-20 text-center">
      <Store class="size-12 text-solar-text-muted mb-3" />
      <h2 class="text-lg font-bold text-solar-text-heading mb-1">المتجر غير موجود أو غير معتمد</h2>
      <NuxtLink to="/customer/stores" class="btn-primary text-xs mt-3">
        العودة إلى دليل المتاجر
      </NuxtLink>
    </div>
>>>>>>> origin/main
  </div>
</template>
