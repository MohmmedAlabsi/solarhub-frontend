<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

type Tab = 'all' | 'panels' | 'inverters' | 'batteries' | 'systems'

const tabs: { id: Tab; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'panels', label: 'ألواح شمسية' },
  { id: 'inverters', label: 'انفرترات' },
  { id: 'batteries', label: 'بطاريات' },
  { id: 'systems', label: 'أنظمة متكاملة' },
]

const products = [
  {
    id: 1,
    type: 'panels' as Tab,
    category: 'الألواح الشمسية',
    brand: 'Jinko Solar',
    image: '/images/product-panel.png',
    title: 'لوح شمسي جينكو Tiger Neo مونو كريستال 580 واط',
    specs: 'N-Type · كفاءة 22.5% · ضمان 25 سنة',
    price: 520,
    old_price: 590,
    rating: 4.9,
    store: 'شركة شمس الرياض للطاقة',
  },
  {
    id: 2,
    type: 'inverters' as Tab,
    category: 'انفرترات',
    brand: 'Deye',
    image: '/images/product-inverter.png',
    title: 'انفرتر هجين Deye بقدرة 8 كيلوواط أحادي الطور',
    specs: 'MPPT مزدوج · واي فاي · ضمان 5 سنوات',
    price: 4850,
    rating: 4.8,
    store: 'مؤسسة طاقة المستقبل',
  },
  {
    id: 3,
    type: 'batteries' as Tab,
    category: 'بطاريات',
    brand: 'Pylontech',
    image: '/images/product-battery.png',
    title: 'بطارية ليثيوم Pylontech US5000 بسعة 4.8 كيلوواط ساعة',
    specs: 'LiFePO4 · 6000 دورة · قابلة للتوسعة',
    price: 6200,
    old_price: 6900,
    rating: 4.7,
    store: 'مجموعة الإضاءة الذكية',
  },
  {
    id: 4,
    type: 'systems' as Tab,
    category: 'أنظمة متكاملة',
    brand: 'Growatt',
    image: '/images/product-kit.png',
    title: 'منظومة منزلية متكاملة 10 كيلوواط مع التخزين',
    specs: 'ألواح + انفرتر + بطاريات · تركيب مجاني',
    price: 28500,
    rating: 5.0,
    store: 'شركة شمس الرياض للطاقة',
  },
]

const activeTab = ref<Tab>('all')
const visibleProducts = computed(() =>
  activeTab.value === 'all' ? products : products.filter(p => p.type === activeTab.value),
)
</script>

<template>
  <section id="products" class="bg-surface py-16 lg:py-24">
    <div class="container-page flex flex-col gap-10">
      <div class="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <header class="flex flex-col gap-3">
          <span class="section-eyebrow">منتجات مختارة بعناية</span>
          <h2 class="section-title">أحدث وأبرز المنتجات الشمسية</h2>
        </header>

        <div role="tablist" aria-label="تصفية المنتجات" class="flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            role="tab"
            :aria-selected="activeTab === tab.id"
            class="shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            :class="activeTab === tab.id ? 'bg-ink text-white' : 'border border-surface-line bg-white text-ink-500 hover:text-ink'"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <CommonProductCard
          v-for="product in visibleProducts"
          :key="product.id"
          :image="product.image"
          :title="product.title"
          :specs="product.specs"
          :price="product.price"
          :old_price="product.old_price"
          :rating="product.rating"
          :category="product.category"
          :brand="product.brand"
          :store="product.store"
        />
      </div>

      <div class="flex justify-center">
        <NuxtLink to="/products" class="btn-outline">
          مشاهدة جميع المنتجات (+1,200)
          <ArrowLeft class="size-4" aria-hidden="true" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
