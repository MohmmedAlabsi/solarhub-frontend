<script setup lang="ts">
import { Check, Eye, Heart, ShoppingCart, Star } from 'lucide-vue-next'
import { useCartStore } from '~~/app/stores/cart.store'
import type { Product } from '~~/types/ecommerce'

const props = defineProps<{
  product: Product
  mode?: 'cart' | 'rfq'
}>()

const emit = defineEmits<{
  (e: 'openRfq', product: Product): void
}>()

const cartStore = useCartStore()
const quantity = ref(1)
const isAdded = ref(false)

function handleAdd() {
  cartStore.addToCart(props.product, quantity.value)
  isAdded.value = true
  setTimeout(() => {
    isAdded.value = false
  }, 1800)
}

function handleRfq() {
  emit('openRfq', props.product)
}
</script>

<template>
  <article class="group relative flex flex-col justify-between rounded-2xl border border-solar-border-card bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-hover">
    <!-- رأس البطاقة: الشارة التمييزية + زر المفضلة -->
    <div class="flex items-center justify-between gap-2">
      <!-- الشارة (Tier 1, كود سعودي، دورات، إلخ) -->
      <span
        v-if="product.badge"
        class="rounded-md bg-solar-yellow/20 px-2.5 py-1 text-[11px] font-bold text-solar-navy-dark"
      >
        {{ product.badge }}
      </span>
      <span v-else class="text-[11px] font-medium text-solar-text-muted">{{ product.category }}</span>

      <!-- زر المفضلة -->
      <button
        type="button"
        @click="cartStore.toggleWishlist(product)"
        class="flex size-8 items-center justify-center rounded-full border border-solar-border-card bg-white text-solar-text-muted transition-colors hover:text-red-500 hover:border-red-200"
        :aria-label="cartStore.isInWishlist(product.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'"
      >
        <Heart
          class="size-4"
          :class="cartStore.isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''"
        />
      </button>
    </div>

    <!-- صورة المنتج مع تأثير تكبير لطيف -->
    <NuxtLink :to="`/customer/products/${product.id}`" class="relative my-3 flex h-44 w-full items-center justify-center overflow-hidden rounded-xl bg-solar-bg-subtle/50 p-2">
      <img
        :src="product.image"
        :alt="product.name"
        class="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
    </NuxtLink>

    <!-- معلومات المنتج الأساسية -->
    <div class="flex flex-col gap-1.5">
      <!-- التقييم والفئة -->
      <div class="flex items-center justify-between text-xs">
        <span class="text-solar-text-muted">{{ product.category }}</span>
        <div class="flex items-center gap-1 font-bold text-solar-text-heading">
          <Star class="size-3.5 fill-solar-yellow text-solar-yellow" />
          <span>{{ product.rating }}</span>
          <span class="text-[10px] text-solar-text-muted">({{ product.reviewsCount }})</span>
        </div>
      </div>

      <!-- اسم المنتج -->
      <NuxtLink :to="`/customer/products/${product.id}`" class="line-clamp-2 text-sm font-bold leading-snug text-solar-text-heading hover:text-amber-600">
        {{ product.name }}
      </NuxtLink>

      <!-- اسم المتجر المعتمد والمدينة -->
      <div class="flex items-center gap-1.5 text-xs text-solar-text-muted">
        <span class="inline-block size-1.5 rounded-full bg-emerald-500" />
        <span class="truncate">{{ product.storeName }} • {{ product.storeCity }}</span>
      </div>

      <!-- السعر -->
      <div class="mt-2 flex items-baseline justify-between">
        <span class="text-xs text-solar-text-muted">سعر الوحدة المعتمد:</span>
        <div class="flex items-baseline gap-1">
          <span class="text-lg font-black text-solar-text-heading">{{ product.price.toLocaleString() }}</span>
          <span class="text-xs font-bold text-solar-text-muted">{{ product.currency }}</span>
        </div>
      </div>
    </div>

    <!-- الإجراءات السفلية: عداد الكمية + زر الإضافة للسلة أو طلب السعر -->
    <div class="mt-4 flex flex-col gap-2">
      <!-- شريط الكمية وحالة الإضافة -->
      <div v-if="mode !== 'rfq' && !product.isQuoteOnly" class="flex items-center gap-2">
        <div class="flex h-10 items-center justify-between rounded-lg border border-solar-border-card bg-white px-2 text-xs font-bold w-24">
          <button
            type="button"
            @click="quantity > 1 ? quantity-- : null"
            class="text-solar-text-muted hover:text-solar-text-heading px-1 text-base"
          >
            -
          </button>
          <span>{{ quantity }}</span>
          <button
            type="button"
            @click="quantity++"
            class="text-solar-text-muted hover:text-solar-text-heading px-1 text-base"
          >
            +
          </button>
        </div>

        <button
          type="button"
          @click="handleAdd"
          class="btn-primary flex-1 h-10 text-xs gap-1.5"
          :class="isAdded ? 'bg-emerald-600 text-white' : ''"
        >
          <Check v-if="isAdded" class="size-4" />
          <ShoppingCart v-else class="size-4" />
          <span>{{ isAdded ? 'تمت الإضافة للسلة' : 'أضف إلى السلة' }}</span>
        </button>
      </div>

      <!-- زر طلب عرض السعر إذا كانت الشاشة في وضع RFQ -->
      <button
        v-else
        type="button"
        @click="handleRfq"
        class="btn-primary w-full h-10 text-xs gap-1.5"
      >
        <span>طلب عرض سعر مباشر</span>
      </button>

      <!-- رابط عرض التفاصيل الكاملة -->
      <NuxtLink
        :to="`/customer/products/${product.id}`"
        class="text-center text-xs font-semibold text-solar-text-body hover:text-amber-600 py-1 transition-colors"
      >
        عرض تفاصيل المنتج ←
      </NuxtLink>
    </div>
  </article>
</template>
