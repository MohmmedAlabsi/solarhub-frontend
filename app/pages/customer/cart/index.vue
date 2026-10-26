<script setup lang="ts">
import {
  ArrowLeft,
  ChevronLeft,
  Loader2,
  Lock,
  PackageX,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Truck,
} from 'lucide-vue-next'
import { useCartStore } from '~~/app/stores/cart.store'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'سلة المشتريات | SolarHub',
  description: 'مراجعة وتعديل محتويات سلة مشتريات منظومات ومعدات الطاقة الشمسية.',
})

const cartStore = useCartStore()
const isClearing = ref(false)

async function handleClearCart() {
  if (confirm('هل أنت متأكد من رغبتك في تفريغ سلة المشتريات بالكامل؟')) {
    isClearing.value = true
    try {
      await cartStore.clearCart()
    } finally {
      isClearing.value = false
    }
  }
}

onMounted(async () => {
  await cartStore.fetchCart()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- فتات الخبز (Breadcrumbs) -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/customer/dashboard" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading">سلة المشتريات</span>
    </nav>

    <!-- شريط العنوان والعمليات -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-black text-solar-text-heading">سلة المشتريات</h1>
        <span v-if="cartStore.items.length > 0" class="badge-info text-xs">
          {{ cartStore.totalItemsCount }} منتجات
        </span>
      </div>

      <button
        v-if="cartStore.items.length > 0"
        type="button"
        @click="handleClearCart"
        :disabled="isClearing"
        class="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
      >
        <Loader2 v-if="isClearing" class="size-3.5 animate-spin" />
        <Trash2 v-else class="size-3.5" />
        <span>تفريغ السلة بالكامل</span>
      </button>
    </div>

    <!-- مؤشر التحميل الأولي -->
    <div v-if="cartStore.isLoading && cartStore.items.length === 0" class="flex flex-col items-center justify-center py-20">
      <Loader2 class="size-10 animate-spin text-solar-yellow mb-4" />
      <p class="text-sm font-semibold text-solar-text-muted">جاري تحميل عناصر سلة المشتريات...</p>
    </div>

    <!-- 1. الحالة الفارغة (Empty State) -->
    <div
      v-else-if="cartStore.items.length === 0"
      class="flex flex-col items-center justify-center rounded-2xl border border-solar-border-card bg-white p-12 text-center shadow-sm"
    >
      <div class="flex size-24 items-center justify-center rounded-full bg-solar-bg-subtle text-solar-text-muted mb-4">
        <ShoppingCart class="size-12 stroke-[1.5]" />
      </div>
      <h2 class="text-xl font-bold text-solar-text-heading mb-2">سلة المشتريات فارغة حالياً</h2>
      <p class="max-w-md text-sm text-solar-text-muted mb-6">
        لم تقم بإضافة أي من معدات الطاقة الشمسية أو الألواح أو المحولات بعد. استكشف كتالوج المنتجات واختر أفضل المعدات بأسعار الوكلاء المعتمدين.
      </p>
      <NuxtLink to="/customer/products" class="btn-primary gap-2">
        <span>تصفح كتالوج المنتجات المعتمدة</span>
        <ArrowLeft class="size-4" />
      </NuxtLink>
    </div>

    <!-- 2. حالة وجود منتجات في السلة (الحالة الممتلئة) -->
    <div v-else class="grid gap-8 lg:grid-cols-12">
      <!-- قائمة المنتجات (8 أعمدة) -->
      <div class="lg:col-span-8 flex flex-col gap-4">
        <div
          v-for="item in cartStore.items"
          :key="item.id || item.product.id"
          class="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-solar-border-card bg-white p-4 sm:p-5 shadow-sm transition-all hover:border-solar-yellow/50"
        >
          <!-- صورة المنتج وبياناته -->
          <div class="flex items-center gap-4 w-full sm:w-auto flex-1">
            <div class="flex size-20 shrink-0 items-center justify-center rounded-xl bg-solar-bg-subtle p-2 overflow-hidden">
              <img
                :src="item.product.image || '/images/product-panel.png'"
                :alt="item.product.name"
                class="h-full w-full object-contain"
              />
            </div>

            <div class="flex flex-col gap-1 text-right flex-1 min-w-0">
              <span class="text-[11px] font-semibold text-solar-text-muted">{{ item.product.category }}</span>
              <NuxtLink
                :to="`/customer/products/${item.product.id}`"
                class="text-sm font-bold text-solar-text-heading hover:text-amber-600 line-clamp-1"
              >
                {{ item.product.name }}
              </NuxtLink>
              <span class="text-xs text-solar-text-muted truncate">
                المورد المعتمد: {{ item.product.storeName }}
              </span>
              <span class="text-xs font-bold text-solar-navy-dark sm:hidden mt-1">
                {{ Number(item.line_total ?? (item.product.price * item.quantity)).toLocaleString() }} ر.س
              </span>
            </div>
          </div>

          <!-- التحكم بالكمية والسعر والحذف -->
          <div class="flex items-center justify-between w-full sm:w-auto sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
            <!-- أزرار زيادة وإنقاص الكمية -->
            <div class="flex h-9 items-center justify-between rounded-lg border border-solar-border-card bg-white px-2 text-xs font-bold w-24">
              <button
                type="button"
                @click="cartStore.updateQuantity(item.id || item.product.id, item.quantity - 1)"
                :disabled="cartStore.isUpdating[item.id || item.product.id]"
                class="text-solar-text-muted hover:text-solar-text-heading px-1 text-base disabled:opacity-50"
              >
                -
              </button>
              <span class="flex items-center justify-center">
                <Loader2 v-if="cartStore.isUpdating[item.id || item.product.id]" class="size-3 animate-spin text-solar-yellow" />
                <span v-else>{{ item.quantity }}</span>
              </span>
              <button
                type="button"
                @click="cartStore.updateQuantity(item.id || item.product.id, item.quantity + 1)"
                :disabled="cartStore.isUpdating[item.id || item.product.id]"
                class="text-solar-text-muted hover:text-solar-text-heading px-1 text-base disabled:opacity-50"
              >
                +
              </button>
            </div>

            <!-- إجمالي السطر للمكتبي -->
            <div class="hidden sm:flex flex-col text-left">
              <span class="text-sm font-black text-solar-text-heading">
                {{ Number(item.line_total ?? (item.product.price * item.quantity)).toLocaleString() }} ر.س
              </span>
              <span class="text-[10px] text-solar-text-muted">
                ({{ Number(item.product.price).toLocaleString() }} ر.س / وحدة)
              </span>
            </div>

            <!-- زر حذف العنصر -->
            <button
              type="button"
              @click="cartStore.removeFromCart(item.id || item.product.id)"
              class="flex size-8 items-center justify-center rounded-lg text-solar-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
              title="إزالة من السلة"
            >
              <Trash2 class="size-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- بطاقة ملخص الطلب والإجمالي (4 أعمدة) -->
      <div class="lg:col-span-4 flex flex-col gap-4">
        <div class="rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm flex flex-col gap-4">
          <h2 class="text-base font-bold text-solar-text-heading border-b border-solar-border-card pb-3">
            ملخص الطلب
          </h2>

          <div class="flex flex-col gap-3 text-xs">
            <div class="flex items-center justify-between text-solar-text-body">
              <span>المجموع الفرعي ({{ cartStore.totalItemsCount }} منتجات)</span>
              <span class="font-bold text-solar-text-heading">{{ cartStore.subtotal.toLocaleString() }} ر.س</span>
            </div>

            <div class="flex items-center justify-between text-solar-text-body">
              <span>ضريبة القيمة المضافة (15%)</span>
              <span class="font-bold text-solar-text-heading">{{ cartStore.vat.toLocaleString() }} ر.س</span>
            </div>

            <div class="flex items-center justify-between text-solar-text-body">
              <span>رسوم الشحن والتوصيل</span>
              <span class="font-bold" :class="cartStore.shippingFee === 0 ? 'text-emerald-600' : 'text-solar-text-heading'">
                {{ cartStore.shippingFee === 0 ? 'شحن مجاني' : `${cartStore.shippingFee} ر.س` }}
              </span>
            </div>

            <div class="border-t border-solar-border-card pt-3 flex items-baseline justify-between text-base">
              <span class="font-bold text-solar-text-heading">الإجمالي المستحق:</span>
              <div class="flex items-baseline gap-1">
                <span class="text-xl font-black text-solar-navy-dark">{{ cartStore.total.toLocaleString() }}</span>
                <span class="text-xs font-bold text-solar-text-muted">ر.س</span>
              </div>
            </div>
          </div>

          <NuxtLink
            to="/customer/checkout"
            class="btn-primary w-full h-12 text-sm gap-2 justify-center mt-2"
          >
            <Lock class="size-4" />
            <span>متابعة إتمام الطلب والدفع</span>
          </NuxtLink>

          <!-- شارات الثقة والأمان -->
          <div class="flex flex-col gap-2 pt-3 border-t border-solar-border-card text-[11px] text-solar-text-muted">
            <div class="flex items-center gap-2">
              <ShieldCheck class="size-4 text-emerald-600 shrink-0" />
              <span>دفع آمن 100% مع ضمان فواتير ضريبية معتمدة</span>
            </div>
            <div class="flex items-center gap-2">
              <Truck class="size-4 text-blue-600 shrink-0" />
              <span>شحن وتوصيل مخصص للمعدات الكهروضوئية الحساسة</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
