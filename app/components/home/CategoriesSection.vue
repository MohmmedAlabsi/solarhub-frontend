<script setup lang="ts">
import { BatteryCharging, Cable, Droplets, Gauge, LayoutGrid, Zap } from 'lucide-vue-next'

const categories = [
  { icon: LayoutGrid, title: 'الألواح الشمسية', subtitle: 'Solar Panels' },
  { icon: BatteryCharging, title: 'بطاريات الطاقة', subtitle: 'Lithium & Gel Batteries' },
  { icon: Zap, title: 'أنظمة الانفرتر', subtitle: 'Hybrid & On-Grid' },
  { icon: Droplets, title: 'مضخات المياه', subtitle: 'Solar Water Pumps' },
  { icon: Cable, title: 'هياكل وكابلات', subtitle: 'Mounting & DC Cables' },
  { icon: Gauge, title: 'أدوات التحكم', subtitle: 'Charge Controllers' },
]
</script>

<template>
  <section class="bg-white py-16 lg:py-24">
    <div class="container-page flex flex-col gap-10">
      <header class="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
        <span class="section-eyebrow">الأقسام الشمسية المعتمدة</span>
        <h2 class="section-title">الأقسام الرئيسية الأكثر طلباً</h2>
        <p class="section-desc">تصفح أهم أقسام الطاقة الشمسية للعثور على ما تحتاجه بسرعة من أفضل المتاجر.</p>
      </header>

      <ul class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <li v-for="category in categories" :key="category.title">
          <NuxtLink
            to="#products"
            class="group flex h-full flex-col items-center gap-3 rounded-2xl border border-surface-line bg-white p-5 text-center transition-all hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-card"
          >
            <span class="flex size-12 items-center justify-center rounded-xl bg-surface text-ink transition-colors group-hover:bg-brand-400">
              <component :is="category.icon" class="size-6" aria-hidden="true" />
            </span>
            <span class="text-sm font-semibold text-ink">{{ category.title }}</span>
            <span class="text-xs text-ink-400" dir="ltr">{{ category.subtitle }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>
