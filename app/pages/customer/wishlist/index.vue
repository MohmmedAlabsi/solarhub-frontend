<script setup lang="ts">
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from 'lucide-vue-next'
import { useCartStore } from '~~/app/stores/cart.store'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'قائمة المفضلة | SolarHub',
  description: 'المنتجات والمعدات المحفوظة للشراء لاحقاً في منصة سولار هب.',
})

const cartStore = useCartStore()

// إذا كانت المفضلة فارغة في البداية نضع منتج افتراضي لإظهار التصميم عند أول فتح
onMounted(() => {
  if (cartStore.wishlist.length === 0) {
    cartStore.wishlist = [
      {
        id: '1',
        name: 'لوح طاقة شمسية Jinko Tiger Pro 585W ثنائي الأوجه',
        category: 'ألواح كهروضوئية',
        categoryType: 'panel',
        brand: 'Jinko Solar',
        model: 'Tiger Pro 585W',
        storeName: 'شركة شمس الرياض للمهمات الكهروضوئية',
        storeCity: 'الرياض',
        price: 485,
        currency: 'ر.س',
        rating: 4.9,
        reviewsCount: 48,
        image: '/images/product-panel.png',
        badge: 'Tier 1 Global',
        specs: { power: '585W' },
        inStock: true,
      },
      {
        id: '3',
        name: 'بطارية ليثيوم Pylontech US5000 48V 4.8kWh دورات تفريغ 6000+',
        category: 'تخزين ليثيوم',
        categoryType: 'battery',
        brand: 'Pylontech',
        model: 'US5000',
        storeName: 'مؤسسة طاقة الصحراء للتوريدات',
        storeCity: 'الدمام',
        price: 6450,
        currency: 'ر.س',
        rating: 5.0,
        reviewsCount: 89,
        image: '/images/product-battery.png',
        badge: '6000+ دورة',
        specs: { capacity: '4.8kWh' },
        inStock: true,
      },
    ]
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted">
      <NuxtLink to="/customer/dashboard" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading">المفضلة</span>
    </nav>

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-black text-solar-text-heading">قائمة المفضلة</h1>
        <span v-if="cartStore.wishlist.length > 0" class="badge-info text-xs">
          {{ cartStore.wishlist.length }} منتجات محفوظة
        </span>
      </div>
    </div>

    <!-- 1. الحالة الفارغة (المفضلة فارغة.png) -->
    <div
      v-if="cartStore.wishlist.length === 0"
      class="flex flex-col items-center justify-center rounded-2xl border border-solar-border-card bg-white p-12 text-center shadow-sm"
    >
      <div class="flex size-24 items-center justify-center rounded-full bg-rose-50 text-rose-500 mb-4">
        <Heart class="size-12 stroke-[1.5]" />
      </div>
      <h2 class="text-xl font-bold text-solar-text-heading mb-2">قائمة المفضلة فارغة حالياً</h2>
      <p class="max-w-md text-sm text-solar-text-muted mb-6">
        لم تقم بحفظ أي من المنتجات بعد. يمكنك حفظ الألواح والبطاريات والإنفرترات بالضغط على رمز القلب للرجوع إليها ومقارنتها في أي وقت.
      </p>
      <NuxtLink to="/customer/products" class="btn-primary gap-2">
        <span>تصفح المنتجات وأضف للمفضلة</span>
        <ArrowLeft class="size-4" />
      </NuxtLink>
    </div>

    <!-- 2. شبكة المنتجات في المفضلة -->
    <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div
        v-for="product in cartStore.wishlist"
        :key="product.id"
        class="flex flex-col justify-between rounded-2xl border border-solar-border-card bg-white p-4 shadow-sm hover:border-solar-yellow/50 transition-all"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs text-solar-text-muted">{{ product.category }}</span>
          <button
            type="button"
            @click="cartStore.toggleWishlist(product)"
            class="text-red-500 hover:text-red-700 p-1"
            title="حذف من المفضلة"
          >
            <Trash2 class="size-4" />
          </button>
        </div>

        <NuxtLink :to="`/customer/products/${product.id}`" class="my-3 flex h-40 items-center justify-center bg-solar-bg-subtle/50 rounded-xl p-2">
          <img :src="product.image" :alt="product.name" class="h-full w-full object-contain" />
        </NuxtLink>

        <div class="flex flex-col gap-1 text-right">
          <NuxtLink :to="`/customer/products/${product.id}`" class="text-sm font-bold text-solar-text-heading hover:text-amber-600 line-clamp-1">
            {{ product.name }}
          </NuxtLink>
          <span class="text-xs text-solar-text-muted">{{ product.storeName }}</span>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="text-base font-black text-solar-navy-dark">{{ product.price.toLocaleString() }} ر.س</span>
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <button
            type="button"
            @click="cartStore.addToCart(product, 1)"
            class="btn-primary flex-1 h-9 text-xs gap-1.5"
          >
            <ShoppingCart class="size-3.5" />
            <span>نقل إلى السلة</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
