<script setup lang="ts">
import {
  ArrowLeft,
  ChevronLeft,
  Lock,
  PackageX,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from 'lucide-vue-next'
import { useCartStore } from '~~/app/stores/cart.store'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'سلة المشتريات | SolarHub',
  description: 'مراجعة وتعديل محتويات سلة مشتريات منظومات الطاقة الشمسية.',
})

const cartStore = useCartStore()
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted">
      <NuxtLink to="/customer/dashboard" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading">سلة المشتريات</span>
    </nav>

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
        @click="cartStore.clearCart"
        class="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1"
      >
        <Trash2 class="size-3.5" />
        <span>تفريغ السلة بالكامل</span>
      </button>
    </div>

    <!-- 1. الحالة الفارغة (Empty State) -->
    <div
      v-if="cartStore.items.length === 0"
      class="flex flex-col items-center justify-center rounded-2xl border border-solar-border-card bg-white p-12 text-center shadow-sm"
    >
      <div class="flex size-24 items-center justify-center rounded-full bg-solar-bg-subtle text-solar-text-muted mb-4">
        <ShoppingCart class="size-12 stroke-[1.5]" />
      </div>
      <h2 class="text-xl font-bold text-solar-text-heading mb-2">سلة المشتريات فارغة حالياً</h2>
      <p class="max-w-md text-sm text-solar-text-muted mb-6">
        لم تقم بإضافة أي من معدات الطاقة الشمسية أو الألواح أو البطاريات بعد. استكشف كتالوج المنتجات واختر أفضل المعدات بأسعار الموردين المعتمدين.
      </p>
      <NuxtLink to="/customer/products" class="btn-primary gap-2">
        <span>تصفح كتالوج المنتجات المعتمدة</span>
        <ArrowLeft class="size-4" />
      </NuxtLink>
    </div>

    <!-- 2. حالة وجود منتجات في السلة -->
    <div v-else class="grid gap-8 lg:grid-cols-12">
      <!-- جدول / قائمة المنتجات (8 أعمدة) -->
      <div class="lg:col-span-8 flex flex-col gap-4">
        <div
          v-for="item in cartStore.items"
          :key="item.product.id"
          class="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-solar-border-card bg-white p-4 sm:p-5 shadow-sm transition-all hover:border-solar-yellow/50"
        >
          <!-- صورة المنتج وبياناته -->
          <div class="flex items-center gap-4 w-full sm:w-auto">
            <div class="flex size-20 shrink-0 items-center justify-center rounded-xl bg-solar-bg-subtle p-2">
              <img :src="item.product.image" :alt="item.product.name" class="h-full w-full object-contain" />
            </div>

            <div class="flex flex-col gap-1 text-right">
              <span class="text-[11px] font-semibold text-solar-text-muted">{{ item.product.category }}</span>
              <NuxtLink :to="`/customer/products/${item.product.id}`" class="text-sm font-bold text-solar-text-heading hover:text-amber-600 line-clamp-1">
                {{ item.product.name }}
              </NuxtLink>
              <span class="text-xs text-solar-text-muted">المورد: {{ item.product.storeName }}</span>
              <span class="text-xs font-bold text-solar-navy-dark sm:hidden">
                {{ (item.product.price * item.quantity).toLocaleString() }} ر.س
              </span>
            </div>
          </div>

          <!-- التحكم بالكمية والسعر والحذف -->
          <div class="flex items-center justify-between w-full sm:w-auto sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
            <!-- عداد الكمية -->
            <div class="flex h-9 items-center rounded-lg border border-solar-border-card bg-white px-2 text-xs font-bold w-24 justify-between">
              <button
                type="button"
                @click="cartStore.updateQuantity(item.product.id, item.quantity - 1)"
                class="text-solar-text-muted hover:text-solar-text-heading px-1 text-base"
              >
                -
              </button>
              <span>{{ item.quantity }}</span>
              <button
                type="button"
                @click="cartStore.updateQuantity(item.product.id, item.quantity + 1)"
                class="text-solar-text-muted hover:text-solar-text-heading px-1 text-base"
              >
                +
              </button>
            </div>

            <!-- السعر الإجمالي للبند -->
            <div class="hidden sm:flex flex-col text-left min-w-[90px]">
              <span class="text-base font-black text-solar-navy-dark">
                {{ (item.product.price * item.quantity).toLocaleString() }}
              </span>
              <span class="text-[10px] text-solar-text-muted">ر.س (شامل الضريبة)</span>
            </div>

            <!-- زر الحذف -->
            <button
              type="button"
              @click="cartStore.removeFromCart(item.product.id)"
              class="flex size-9 items-center justify-center rounded-lg text-solar-text-muted hover:bg-red-50 hover:text-red-500 transition-colors"
              title="حذف من السلة"
            >
              <Trash2 class="size-4" />
            </button>
          </div>
        </div>

        <div class="flex justify-between items-center pt-2">
          <NuxtLink to="/customer/products" class="text-xs font-bold text-solar-text-body hover:text-amber-600 flex items-center gap-1">
            <span>← متابعة التسوق وإضافة معدات أخرى</span>
          </NuxtLink>
        </div>
      </div>

      <!-- ملخص الطلب المالي (4 أعمدة) -->
      <div class="lg:col-span-4 flex flex-col gap-4">
        <div class="flex flex-col gap-4 rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm">
          <h2 class="text-base font-bold text-solar-text-heading border-b border-solar-border-card pb-3">ملخص الحساب</h2>

          <div class="flex flex-col gap-2.5 text-xs">
            <div class="flex items-center justify-between text-solar-text-secondary">
              <span>مجموع المشتريات:</span>
              <span class="font-bold text-solar-text-heading">{{ cartStore.subtotal.toLocaleString() }} ر.س</span>
            </div>

            <div class="flex items-center justify-between text-solar-text-secondary">
              <span>ضريبة القيمة المضافة (15%):</span>
              <span class="font-bold text-solar-text-heading">{{ cartStore.vat.toLocaleString() }} ر.س</span>
            </div>

            <div class="flex items-center justify-between text-solar-text-secondary">
              <span>رسوم الشحن المعتمد:</span>
              <span class="badge-success text-[10px]">شحن آمن مجاني</span>
            </div>
          </div>

          <hr class="border-solar-border-card" />

          <!-- الإجمالي الكلي -->
          <div class="flex items-baseline justify-between">
            <span class="text-sm font-bold text-solar-text-heading">الإجمالي الكلي:</span>
            <div class="flex items-baseline gap-1">
              <span class="text-2xl font-black text-solar-navy-dark">{{ cartStore.total.toLocaleString() }}</span>
              <span class="text-xs font-bold text-solar-text-muted">ريال سعودي</span>
            </div>
          </div>

          <!-- زر المتابعة للدفع -->
          <NuxtLink to="/customer/checkout" class="btn-primary w-full h-12 text-sm gap-2">
            <span>متابعة لإتمام الطلب</span>
            <ChevronLeft class="size-4" />
          </NuxtLink>

          <div class="flex items-center justify-center gap-1.5 text-[11px] text-solar-text-muted pt-2">
            <ShieldCheck class="size-4 text-emerald-600" />
            <span>معاملة مشفرة بأحدث بروتوكولات الأمان SSL 256-bit</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
