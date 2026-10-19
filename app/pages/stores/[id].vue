<script setup lang="ts">
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Search,
  ShieldCheck,
  Star,
  Store,
  Truck,
  Wrench,
  Zap,
} from 'lucide-vue-next'
import { visitorStores, visitorProducts } from '~~/app/data/visitor-mock'
import { useAuthModal } from '~~/app/composables/useAuthModal'

const route = useRoute()
const storeId = route.params.id as string
const authModal = useAuthModal()

const store = computed(() => {
  const match = visitorStores.find(s => s.id === storeId) || visitorStores[0]
  if (!match) throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  return match
})

useSeoMeta({
  title: computed(() => `${store.value.name} | SolarHub`),
  description: computed(() => store.value.description),
})

const activeTab = ref<'products' | 'reviews'>('products')
const selectedFilter = ref('all')

const storeProducts = computed(() => {
  if (selectedFilter.value === 'all') {
    return visitorProducts
  }
  return visitorProducts.filter(p => p.categoryType === selectedFilter.value)
})

function handleStoreQuote() {
  authModal.open({
    title: 'لطلب عرض سعر للمشاريع، يرجى تسجيل الدخول',
    message: `سجّل الدخول إلى حسابك أو أنشئ حساباً جديداً لإرسال طلب عرض سعر مباشر لـ (${store.value.name}) واستلام عروض الأسعار وفواتير الضمان.`,
    actionType: 'quote',
  })
}

function handleWhatsApp() {
  window.open(`https://wa.me/${store.value.whatsapp.replace(/[^0-9]/g, '')}`, '_blank')
}

const isMapModalOpen = ref(false)
</script>

<template>
  <div class="container-page py-6 sm:py-10 flex flex-col gap-8">
    <!-- Breadcrumbs -->
    <nav class="flex flex-wrap items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <NuxtLink to="/stores" class="hover:text-solar-text-heading">المتاجر والوكلاء المعتمدون</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading truncate max-w-xs">{{ store.name }}</span>
    </nav>

    <!-- بطاقة رأس المتجر الكبيرة المطابقة لـ visitor_8.png -->
    <div class="solar-card p-6 sm:p-8 flex flex-col gap-6">
      <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <!-- معلومات المتجر والشعار -->
        <div class="flex flex-col sm:flex-row items-start gap-5 flex-1 min-w-0">
          <div class="flex size-20 sm:size-24 shrink-0 items-center justify-center rounded-2xl bg-solar-navy text-white text-xl font-black shadow-md border-2 border-solar-yellow/30">
            {{ store.name.substring(0, 2) }}
          </div>

          <div class="flex flex-col gap-2 text-right flex-1 min-w-0">
            <h1 class="text-xl sm:text-2xl lg:text-3xl font-black text-solar-text-heading leading-tight">
              {{ store.name }}
            </h1>

            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 w-fit">
                <CheckCircle2 class="size-3.5 text-emerald-600 shrink-0" />
                <span>سجل تجاري موثق {{ store.commercialReg }} - {{ store.weraLicense }}</span>
              </span>
            </div>

            <p class="text-xs sm:text-sm text-solar-text-body leading-relaxed max-w-3xl mt-1">
              {{ store.description }}
            </p>
          </div>
        </div>

        <!-- أزرار التواصل وطلب العرض على اليسار -->
        <div class="flex flex-col gap-2.5 shrink-0 w-full sm:w-56 lg:w-60">
          <button
            type="button"
            @click="handleWhatsApp"
            class="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs sm:text-sm font-black text-white hover:bg-emerald-700 shadow-sm transition-all whitespace-nowrap"
          >
            <MessageCircle class="size-4 shrink-0" />
            <span>تواصل عبر واتساب</span>
          </button>

          <button
            type="button"
            @click="handleStoreQuote"
            class="flex h-11 items-center justify-center gap-2 rounded-xl bg-solar-navy text-white hover:bg-solar-navy-dark px-5 text-xs sm:text-sm font-black shadow-sm transition-all whitespace-nowrap"
          >
            <FileText class="size-4 text-solar-yellow shrink-0" />
            <span>طلب عرض سعر للمشاريع</span>
          </button>
        </div>
      </div>

      <!-- الشريط السفلي للبيانات الميدانية والمواعيد والتقييمات المطابق لـ visitor_8.png -->
      <div class="rounded-xl bg-slate-50 border border-slate-100 p-3 sm:px-5 sm:py-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm text-solar-text-muted">
        <button
          type="button"
          @click="isMapModalOpen = true"
          class="flex items-center gap-2 hover:text-solar-navy-dark transition-colors cursor-pointer group text-right"
          title="عرض موقع المتجر على الخريطة التفاعلية"
        >
          <MapPin class="size-4 text-solar-navy shrink-0 group-hover:text-solar-yellow transition-colors" />
          <span class="truncate underline decoration-dotted">{{ store.address }}</span>
        </button>
        <div class="flex items-center gap-2">
          <Clock class="size-4 text-solar-navy shrink-0" />
          <span>{{ store.workingHours }}</span>
        </div>
        <div class="flex items-center gap-2 font-bold text-solar-text-heading">
          <Star class="size-4 fill-amber-400 text-amber-400 shrink-0" />
          <span>{{ store.rating }} ({{ store.reviewsCount }} تقييم موثق من المشترين)</span>
        </div>
        <div class="flex items-center gap-2 text-emerald-700 font-bold">
          <Package class="size-4 text-emerald-600 shrink-0" />
          <span>{{ store.inStockCount }} منتج معتمد وجاهز للتسليم الفوري</span>
        </div>
      </div>
    </div>

    <!-- الكروت الأربعة للضمانات في متجر شمس الرياض المطابقة لـ visitor_8.png -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark">
          <ShieldCheck class="size-5 text-solar-navy-dark" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">فحص التراخيص والسجلات</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">سجل تجاري ساري وتراخيص معتمدة.</p>
        </div>
      </div>

      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark">
          <Zap class="size-5 text-solar-navy-dark" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">ضمانات مصنعية رسمية</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">حتى 25 سنة على الألواح و 10 للإنفرترات.</p>
        </div>
      </div>

      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark">
          <Truck class="size-5 text-solar-navy-dark" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">شحن ونقل مخصص ومجهز</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">حماية تامة للألواح والبطاريات الحساسة.</p>
        </div>
      </div>

      <div class="solar-card flex items-start gap-3 p-4">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark">
          <Wrench class="size-5 text-solar-navy-dark" />
        </span>
        <div class="text-right">
          <h4 class="text-xs font-black text-solar-text-heading">مطابقة أحمال ودعم هندسي</h4>
          <p class="text-[11px] text-solar-text-muted leading-relaxed mt-0.5">دعم فني مباشر مع المهندسين المعتمدين.</p>
        </div>
      </div>
    </div>

    <!-- تبويبات المتجر (المنتجات والمخزون المتاح / التقييمات) المطابقة لـ visitor_8.png -->
    <div class="flex flex-col gap-6">
      <div class="flex items-center gap-3 border-b border-solar-border-card pb-2">
        <button
          type="button"
          @click="activeTab = 'products'"
          class="flex items-center gap-2 py-2 px-1 text-sm font-black border-b-2 transition-all"
          :class="activeTab === 'products' ? 'border-solar-yellow text-solar-navy-dark' : 'border-transparent text-solar-text-muted hover:text-solar-text-heading'"
        >
          <Package class="size-4" />
          <span>المنتجات والمخزون المتاح ({{ storeProducts.length }} مختارة)</span>
        </button>

        <button
          type="button"
          @click="activeTab = 'reviews'"
          class="flex items-center gap-2 py-2 px-1 text-sm font-bold border-b-2 transition-all"
          :class="activeTab === 'reviews' ? 'border-solar-yellow text-solar-navy-dark' : 'border-transparent text-solar-text-muted hover:text-solar-text-heading'"
        >
          <Star class="size-4" />
          <span>التقييمات والآراء (145)</span>
        </button>
      </div>

      <!-- فلاتر تصنيف منتجات المتجر -->
      <div v-if="activeTab === 'products'" class="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          @click="selectedFilter = 'all'"
          class="rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap"
          :class="selectedFilter === 'all' ? 'bg-solar-navy-dark text-white font-black shadow-sm' : 'bg-white border border-solar-border-card text-solar-text-heading hover:bg-solar-bg-subtle'"
        >
          الكل ({{ visitorProducts.length }})
        </button>
        <button
          type="button"
          @click="selectedFilter = 'panel'"
          class="rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap"
          :class="selectedFilter === 'panel' ? 'bg-solar-navy-dark text-white font-black shadow-sm' : 'bg-white border border-solar-border-card text-solar-text-heading hover:bg-solar-bg-subtle'"
        >
          ألواح شمسية
        </button>
        <button
          type="button"
          @click="selectedFilter = 'inverter'"
          class="rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap"
          :class="selectedFilter === 'inverter' ? 'bg-solar-navy-dark text-white font-black shadow-sm' : 'bg-white border border-solar-border-card text-solar-text-heading hover:bg-solar-bg-subtle'"
        >
          إنفرترات ومحولات
        </button>
        <button
          type="button"
          @click="selectedFilter = 'battery'"
          class="rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap"
          :class="selectedFilter === 'battery' ? 'bg-solar-navy-dark text-white font-black shadow-sm' : 'bg-white border border-solar-border-card text-solar-text-heading hover:bg-solar-bg-subtle'"
        >
          بطاريات تخزين
        </button>
        <button
          type="button"
          @click="selectedFilter = 'controller'"
          class="rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap"
          :class="selectedFilter === 'controller' ? 'bg-solar-navy-dark text-white font-black shadow-sm' : 'bg-white border border-solar-border-card text-solar-text-heading hover:bg-solar-bg-subtle'"
        >
          منظمات MPPT
        </button>
      </div>

      <!-- شبكة منتجات المتجر المطابقة لـ visitor_8.png -->
      <div v-if="activeTab === 'products'" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="product in storeProducts"
          :key="product.id"
          class="solar-card flex flex-col justify-between overflow-hidden p-4 hover:border-solar-yellow transition-all"
        >
          <div>
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
                @click="handleStoreQuote"
                class="absolute top-2 left-2 flex size-7 items-center justify-center rounded-full bg-white/90 text-solar-text-muted hover:text-rose-500 shadow-sm"
                aria-label="إضافة للمفضلة"
              >
                <Heart class="size-3.5" />
              </button>
            </div>

            <div class="flex items-center justify-between gap-2 text-xs mb-1.5">
              <span class="text-solar-text-muted text-[11px] font-semibold">{{ product.category }}</span>
              <div class="flex items-center gap-1 font-bold text-amber-500">
                <Star class="size-3.5 fill-amber-400 text-amber-400" />
                <span>{{ product.rating }}</span>
              </div>
            </div>

            <h3 class="text-xs sm:text-sm font-black text-solar-text-heading line-clamp-2 leading-snug mb-2" :title="product.name">
              {{ product.name }}
            </h3>

            <div class="flex items-center gap-1.5 text-[11px] text-solar-text-muted mb-4">
              <Store class="size-3.5 shrink-0" />
              <span class="truncate">{{ store.name }}</span>
            </div>
          </div>

          <div class="flex flex-col gap-2 pt-2 border-t border-solar-border-card/60">
            <button
              type="button"
              @click="handleStoreQuote"
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

      <!-- تبويب التقييمات -->
      <div v-else class="solar-card p-6 flex flex-col gap-4">
        <h3 class="text-sm font-black text-solar-text-heading">تقييمات وآراء العملاء (145 تقييم)</h3>
        <div class="space-y-4">
          <div class="border-b border-solar-border-card pb-4">
            <div class="flex items-center justify-between mb-1">
              <span class="font-bold text-xs text-solar-text-heading">م. فهد السبيعي</span>
              <div class="flex text-amber-400"><Star v-for="i in 5" :key="i" class="size-3.5 fill-amber-400" /></div>
            </div>
            <p class="text-xs text-solar-text-body">توريد سريع للألواح والإنفرترات، الفواتير الضريبية وشهادات المنشأ الأصلية تم استلامها بالكامل.</p>
          </div>
          <div class="border-b border-solar-border-card pb-4">
            <div class="flex items-center justify-between mb-1">
              <span class="font-bold text-xs text-solar-text-heading">شركة أبراج نجد</span>
              <div class="flex text-amber-400"><Star v-for="i in 5" :key="i" class="size-3.5 fill-amber-400" /></div>
            </div>
            <p class="text-xs text-solar-text-body">تعامل احترافي ودعم فني ممتاز في اختيار كابلات ومحولات متوافقة مع متطلبات شركة الكهرباء.</p>
          </div>
        </div>
      </div>
    </div>
    <!-- نافذة استعراض موقع المتجر والمستودع على الخريطة -->
    <CommonMapLocationModal
      :is-open="isMapModalOpen"
      :current-location="store.address"
      :title="`موقع متجر ${store.name} على الخريطة`"
      subtitle="الموقع الفعلي للمتجر والمستودعات المعتمدة لاستلام وفحص البضائع وتنسيق الشحن"
      @close="isMapModalOpen = false"
      @select="isMapModalOpen = false"
    />
  </div>
</template>
