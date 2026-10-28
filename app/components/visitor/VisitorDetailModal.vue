<script setup lang="ts">
import {
  Award,
  Building2,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Package,
  ShieldCheck,
  Star,
  Store,
  User,
  Wrench,
  X,
} from 'lucide-vue-next'
import type { VisitorProductItem, VisitorStoreItem, VisitorEngineerItem } from '~/types/visitor'

const props = defineProps<{
  isOpen: boolean
  type: 'product' | 'store' | 'engineer' | null
  item: VisitorProductItem | VisitorStoreItem | VisitorEngineerItem | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const product = computed(() => (props.type === 'product' ? (props.item as VisitorProductItem) : null))
const store = computed(() => (props.type === 'store' ? (props.item as VisitorStoreItem) : null))
const engineer = computed(() => (props.type === 'engineer' ? (props.item as VisitorEngineerItem) : null))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && item"
      class="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <!-- الخلفية الضبابية -->
      <div
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        @click="emit('close')"
      />

      <!-- بطاقة النافذة الإيضاحية للقراءة فقط -->
      <div class="relative w-full max-w-lg rounded-3xl bg-white dark:bg-solar-bg-card p-6 sm:p-7 shadow-2xl transition-all border border-solar-border-card z-10 text-right max-h-[90vh] overflow-y-auto">
        <!-- زر الإغلاق -->
        <button
          type="button"
          @click="emit('close')"
          class="absolute left-5 top-5 p-1 rounded-xl text-solar-text-muted hover:text-solar-text-heading hover:bg-solar-bg-subtle transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X class="size-5" />
        </button>

        <!-- 1. تفاصيل المنتج (Product Details) -->
        <div v-if="product" class="space-y-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="rounded-lg bg-solar-yellow/20 px-2.5 py-1 text-xs font-black text-solar-navy-dark dark:text-solar-yellow">
              {{ product.category }}
            </span>
            <span v-if="product.brand" class="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-bold text-solar-text-muted">
              {{ product.brand }}
            </span>
          </div>

          <div class="aspect-[4/3] w-full rounded-2xl bg-solar-bg-subtle p-4 flex items-center justify-center border border-solar-border-card overflow-hidden">
            <img
              :src="product.imageUrl"
              :alt="product.title"
              class="h-full w-full object-contain"
              @error="(e) => ((e.target as HTMLImageElement).src = '/images/hero-solar.png')"
            />
          </div>

          <div>
            <h2 class="text-lg font-black text-solar-text-heading leading-tight">
              {{ product.title }}
            </h2>
            <div class="mt-1 flex items-center gap-2 text-xs font-mono text-solar-text-muted">
              <span>كود الموديل: {{ product.modelNumber }}</span>
              <span>•</span>
              <span>الرمز: {{ product.sku }}</span>
            </div>
          </div>

          <!-- المواصفات الأساسية للزائر -->
          <div class="rounded-2xl border border-solar-border-card bg-solar-bg-subtle/50 p-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span class="text-solar-text-muted text-[11px]">المتجر المعتمد:</span>
              <div class="font-bold text-solar-text-heading truncate flex items-center gap-1 mt-0.5">
                <Store class="size-3.5 text-solar-navy-dark dark:text-solar-yellow shrink-0" />
                <span>{{ product.storeName }}</span>
              </div>
            </div>

            <div>
              <span class="text-solar-text-muted text-[11px]">المحافظة / التغطية:</span>
              <div class="font-bold text-solar-text-heading flex items-center gap-1 mt-0.5">
                <MapPin class="size-3.5 text-solar-navy-dark dark:text-solar-yellow shrink-0" />
                <span>{{ product.governorateName }}</span>
              </div>
            </div>

            <div>
              <span class="text-solar-text-muted text-[11px]">الضمان المصنعي:</span>
              <div class="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <ShieldCheck class="size-3.5 shrink-0" />
                <span>{{ product.warrantyPeriod }}</span>
              </div>
            </div>

            <div>
              <span class="text-solar-text-muted text-[11px]">حالة التوفر:</span>
              <div class="font-bold text-solar-text-heading mt-0.5">
                <span v-if="product.stockQuantity > 0" class="text-emerald-600 dark:text-emerald-400">متوفر بالمخزون</span>
                <span v-else class="text-amber-600">متوفر عند الطلب</span>
              </div>
            </div>
          </div>

          <div v-if="product.price" class="p-4 rounded-2xl bg-solar-yellow/10 border border-solar-yellow/30 flex items-center justify-between">
            <span class="text-xs font-bold text-solar-text-muted">السعر الاسترشادي:</span>
            <span class="text-lg font-black font-mono text-solar-navy-dark dark:text-solar-yellow">
              {{ product.price.toLocaleString('en-US') }} ر.س
            </span>
          </div>

          <p class="text-[11px] text-solar-text-muted text-center pt-2">
            ملاحظة: هذا العرض مخصص لتصفح الزوار فقط. لإتمام عمليات الشراء أو طلب التسعير، يلزم تسجيل الدخول بحساب معتمد.
          </p>
        </div>

        <!-- 2. تفاصيل المتجر (Store Details) -->
        <div v-else-if="store" class="space-y-4">
          <div class="flex items-center gap-3.5">
            <img
              :src="store.logoUrl"
              :alt="store.companyName"
              class="size-16 rounded-2xl object-contain bg-solar-bg-subtle p-2 border border-solar-border-card shrink-0"
              @error="(e) => ((e.target as HTMLImageElement).src = '/images/logo-expanded-transparent.png')"
            />
            <div>
              <div class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-1">
                <CheckCircle2 class="size-3" />
                <span>متجر معتمد رسمي</span>
              </div>
              <h2 class="text-base sm:text-lg font-black text-solar-text-heading leading-tight">
                {{ store.companyName }}
              </h2>
              <p class="text-xs text-solar-text-muted flex items-center gap-1 mt-0.5">
                <MapPin class="size-3" />
                <span>{{ store.governorateName }} - {{ store.addressDetails }}</span>
              </p>
            </div>
          </div>

          <div class="rounded-2xl border border-solar-border-card bg-solar-bg-subtle/50 p-4 text-xs">
            <div class="text-[11px] font-bold text-solar-text-muted mb-1.5">نبذة المتجر:</div>
            <p class="text-solar-text-body leading-relaxed font-medium">
              {{ store.bio }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3 text-center">
            <div class="p-3 rounded-2xl bg-solar-bg-subtle border border-solar-border-card">
              <span class="text-[10px] text-solar-text-muted block">نوع الاعتماد:</span>
              <span class="text-xs font-bold text-solar-text-heading mt-0.5 block">{{ store.storeType }}</span>
            </div>
            <div class="p-3 rounded-2xl bg-solar-bg-subtle border border-solar-border-card">
              <span class="text-[10px] text-solar-text-muted block">التقييم العام:</span>
              <span class="text-xs font-black text-amber-500 mt-0.5 block flex items-center justify-center gap-1">
                <Star class="size-3.5 fill-amber-400 text-amber-400" />
                <span>{{ store.rating }}</span>
                <span class="text-[10px] text-solar-text-muted font-normal">({{ store.ratingsCount }} تقييم)</span>
              </span>
            </div>
          </div>

          <p class="text-[11px] text-solar-text-muted text-center pt-2">
            جميع المتاجر على المنصة مسجلة بسجلات تجارية وتخضع لبروتوكول الضمانات والفواتير المعتمدة.
          </p>
        </div>

        <!-- 3. تفاصيل المهندس (Engineer Details) -->
        <div v-else-if="engineer" class="space-y-4">
          <div class="flex items-center gap-3.5">
            <img
              :src="engineer.photoUrl"
              :alt="engineer.name"
              class="size-16 rounded-2xl object-cover bg-solar-bg-subtle p-0.5 border-2 border-solar-yellow shrink-0 shadow-sm"
              @error="(e) => ((e.target as HTMLImageElement).src = '/images/hero-solar.png')"
            />
            <div>
              <div class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-1">
                <CheckCircle2 class="size-3" />
                <span>مهندس معتمد ومصرح</span>
              </div>
              <h2 class="text-base sm:text-lg font-black text-solar-text-heading leading-tight">
                {{ engineer.name }}
              </h2>
              <p class="text-xs font-bold text-solar-navy-dark dark:text-solar-yellow mt-0.5">
                {{ engineer.specialization }}
              </p>
            </div>
          </div>

          <div class="rounded-2xl border border-solar-border-card bg-solar-bg-subtle/50 p-4 text-xs">
            <div class="text-[11px] font-bold text-solar-text-muted mb-1.5">النبذة المهنية والخبرات:</div>
            <p class="text-solar-text-body leading-relaxed font-medium">
              {{ engineer.bio }}
            </p>
          </div>

          <div class="grid grid-cols-3 gap-2.5 text-center text-xs">
            <div class="p-3 rounded-2xl bg-solar-bg-subtle border border-solar-border-card">
              <span class="text-[10px] text-solar-text-muted block">سنوات الخبرة:</span>
              <span class="text-xs font-black text-solar-text-heading mt-0.5 block font-mono">{{ engineer.yearsOfExperience }}+ سنوات</span>
            </div>
            <div class="p-3 rounded-2xl bg-solar-bg-subtle border border-solar-border-card">
              <span class="text-[10px] text-solar-text-muted block">المحافظة:</span>
              <span class="text-xs font-bold text-solar-text-heading mt-0.5 block">{{ engineer.governorateName }}</span>
            </div>
            <div class="p-3 rounded-2xl bg-solar-bg-subtle border border-solar-border-card">
              <span class="text-[10px] text-solar-text-muted block">التقييم:</span>
              <span class="text-xs font-black text-amber-500 mt-0.5 block flex items-center justify-center gap-1">
                <Star class="size-3 fill-amber-400 text-amber-400" />
                <span>{{ engineer.rating }}</span>
              </span>
            </div>
          </div>

          <p class="text-[11px] text-solar-text-muted text-center pt-2">
            تم التحقق من رخصة المزاولة والمؤهلات الأكاديمية بواسطة فريق التحقق الهندسي لسولار هب.
          </p>
        </div>

        <!-- زر الإغلاق السفلي -->
        <div class="pt-4 mt-2 border-t border-solar-border-card flex justify-end">
          <button
            type="button"
            @click="emit('close')"
            class="px-5 py-2.5 rounded-xl bg-solar-bg-subtle text-xs font-bold text-solar-text-heading hover:bg-solar-border-card transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
