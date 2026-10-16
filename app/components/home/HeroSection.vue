<script setup lang="ts">
import { BadgeCheck, Search, ShoppingBag, ClipboardList } from 'lucide-vue-next'

const categories = ['كل الأقسام', 'الألواح الشمسية', 'الانفرترات', 'البطاريات', 'أنظمة متكاملة']
const query = ref('')
const category = ref(categories[0])

function onSearch() {
  navigateTo({ path: '/products', query: { q: query.value || undefined, category: category.value } })
}

const stats = [
  { value: '+1,200', label: 'منتج معتمد' },
  { value: '+150', label: 'مهندس واستشاري' },
  { value: '+80', label: 'متجر ووكيل' },
]
</script>

<template>
  <section class="relative overflow-hidden bg-white">
    <div class="container-page grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-14 lg:py-20">
      <div class="flex flex-col gap-6">
        <span class="inline-flex w-fit items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
          <BadgeCheck class="size-4" aria-hidden="true" />
          منصة الطاقة الشمسية المتكاملة الأولى في المنطقة
        </span>

        <h1 class="text-balance text-3xl font-bold leading-tight text-ink sm:text-4xl lg:text-5xl lg:leading-tight">
          وجهتك الموثوقة لمنظومات ومنتجات
          <span class="text-brand-500">الطاقة الشمسية</span>
          المتكاملة
        </h1>

        <p class="max-w-xl text-pretty text-base leading-relaxed text-ink-500">
          نربط العملاء بأفضل المتاجر المعتمدة والمهندسين المرخّصين في مكان واحد، لتصميم وتركيب منظومات طاقة شمسية
          مستدامة وموثوقة بأسعار تنافسية وضمان حقيقي.
        </p>

        <div class="flex flex-wrap gap-3">
          <NuxtLink to="#products" class="btn-primary">
            <ShoppingBag class="size-4" aria-hidden="true" />
            تصفح المنتجات
          </NuxtLink>
          <NuxtLink to="#consultants" class="btn-outline">
            <ClipboardList class="size-4" aria-hidden="true" />
            طلب استشارة / طلب مشروع
          </NuxtLink>
        </div>

        <form
          class="flex flex-col gap-2 rounded-xl border border-surface-line bg-white p-2 shadow-card sm:flex-row sm:items-center"
          role="search"
          @submit.prevent="onSearch"
        >
          <label for="hero-category" class="sr-only">القسم</label>
          <select
            id="hero-category"
            v-model="category"
            class="rounded-lg border-0 bg-surface px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400 sm:w-40"
          >
            <option v-for="item in categories" :key="item" :value="item">{{ item }}</option>
          </select>
          <label for="hero-search" class="sr-only">ابحث عن منتج</label>
          <div class="flex flex-1 items-center gap-2 px-2">
            <Search class="size-4 shrink-0 text-ink-400" aria-hidden="true" />
            <input
              id="hero-search"
              v-model="query"
              type="search"
              placeholder="ابحث عن لوح، انفرتر، بطارية..."
              class="w-full border-0 bg-transparent py-2.5 text-sm text-ink placeholder:text-ink-400 focus:outline-none"
            >
          </div>
          <button type="submit" class="btn-dark">بحث</button>
        </form>

        <dl class="grid max-w-md grid-cols-3 gap-4 pt-2">
          <div v-for="stat in stats" :key="stat.label" class="flex flex-col gap-1">
            <dt class="order-2 text-xs text-ink-500">{{ stat.label }}</dt>
            <dd class="order-1 text-xl font-bold text-ink" dir="ltr">{{ stat.value }}</dd>
          </div>
        </dl>
      </div>

      <div class="relative">
        <div class="absolute -inset-4 -z-0 rounded-3xl bg-brand-50" aria-hidden="true" />
        <img
          src="/images/hero-solar.png"
          alt="سطح مبنى تجاري مغطى بألواح الطاقة الشمسية"
          class="relative aspect-[4/3] w-full rounded-2xl object-cover shadow-card"
          width="800"
          height="600"
          fetchpriority="high"
        >
      </div>
    </div>
  </section>
</template>
