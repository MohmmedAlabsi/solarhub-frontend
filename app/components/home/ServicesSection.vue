<script setup lang="ts">
import { CheckCircle2, HardHat, ShoppingCart, Store } from 'lucide-vue-next'

const services = [
  {
    icon: ShoppingCart,
    tag: 'المتجر الشامل',
    title: 'شراء منتجات ومعدات الطاقة',
    description: 'تصفح آلاف المنتجات الأصلية من ألواح وانفرترات وبطاريات، وقارن الأسعار والمواصفات بين المتاجر المعتمدة.',
    points: ['منتجات أصلية بضمان الوكيل', 'مقارنة الأسعار بين المتاجر', 'توصيل وتركيب حسب الطلب'],
    cta: 'تصفح كتالوج المنتجات',
    to: '#products',
  },
  {
    icon: HardHat,
    tag: 'توفير فنيين',
    title: 'العثور على مهندس معتمد',
    description: 'احصل على استشارة من مهندسين وفنيين موثّقين لتصميم منظومتك وحساب الأحمال واختيار المكونات المناسبة.',
    points: ['مهندسون موثّقون ومراجَعون', 'حاسبة أحمال وتصميم منظومة', 'متابعة التركيب والصيانة'],
    cta: 'استكشف المهندسين',
    to: '#consultants',
  },
  {
    icon: Store,
    tag: 'للمتاجر والموردين',
    title: 'التواصل مع المتاجر والموردين',
    description: 'تواصل مباشرة مع الوكلاء والموزعين المعتمدين لطلبات الجملة والمشاريع التجارية بعروض أسعار مخصصة.',
    points: ['وكلاء رسميون للعلامات العالمية', 'عروض أسعار للمشاريع الكبيرة', 'تقييمات حقيقية من العملاء'],
    cta: 'دليل المتاجر المعتمدة',
    to: '#stores',
  },
]
</script>

<template>
  <section id="services" class="bg-surface py-16 lg:py-24">
    <div class="container-page flex flex-col gap-10">
      <header class="flex max-w-2xl flex-col gap-3">
        <span class="section-eyebrow">حلول متكاملة لجميع احتياجاتك</span>
        <h2 class="section-title">كيف تخدمك منصة سولار هب؟</h2>
        <p class="section-desc">مسارات واضحة وبسيطة لتلبية احتياجاتك المنزلية والتجارية والمشاريع الزراعية المتعلقة بالطاقة الشمسية.</p>
      </header>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="service in services"
          :key="service.title"
          class="flex flex-col gap-5 rounded-2xl border border-surface-line bg-white p-6 shadow-card"
        >
          <span class="flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <component :is="service.icon" class="size-6" aria-hidden="true" />
          </span>
          <div class="flex flex-col gap-2">
            <span class="text-xs font-semibold text-ink-400">{{ service.tag }}</span>
            <h3 class="text-lg font-bold text-ink">{{ service.title }}</h3>
            <p class="text-sm leading-relaxed text-ink-500">{{ service.description }}</p>
          </div>
          <ul class="flex flex-col gap-2.5">
            <li v-for="point in service.points" :key="point" class="flex items-center gap-2 text-sm text-ink-700">
              <CheckCircle2 class="size-4 shrink-0 text-emerald-500" aria-hidden="true" />
              {{ point }}
            </li>
          </ul>
          <NuxtLink :to="service.to" class="btn-primary mt-auto w-full">{{ service.cta }}</NuxtLink>
        </article>
      </div>
    </div>
  </section>
</template>
