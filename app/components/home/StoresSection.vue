<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

const stores = [
  {
    logo: 'شر',
    name: 'شركة شمس الرياض للطاقة',
    description: 'وكيل معتمد لأبرز علامات الألواح والانفرترات مع خدمات التركيب والصيانة.',
    rating: 4.9,
    badge: 'وكيل معتمد',
    location: 'الرياض',
    productsCount: 145,
    tags: ['Jinko', 'Deye', 'Longi'],
  },
  {
    logo: 'طم',
    name: 'مؤسسة طاقة المستقبل للتوريدات',
    description: 'توريد معدات الطاقة الشمسية للمشاريع التجارية والصناعية بأسعار الجملة.',
    rating: 4.7,
    badge: 'مورد معتمد',
    location: 'جدة',
    productsCount: 98,
    tags: ['Growatt', 'Huawei'],
  },
  {
    logo: 'مإ',
    name: 'مجموعة الإضاءة الذكية للطاقة',
    description: 'متخصصون في حلول التخزين وبطاريات الليثيوم وأنظمة الطاقة الاحتياطية.',
    rating: 4.8,
    badge: 'وكيل معتمد',
    location: 'الدمام',
    productsCount: 112,
    tags: ['Pylontech', 'BYD', 'Victron'],
  },
]
</script>

<template>
  <section id="stores" class="bg-surface py-16 lg:py-24">
    <div class="container-page flex flex-col gap-10">
      <div class="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <header class="flex max-w-2xl flex-col gap-3">
          <span class="section-eyebrow">شبكة التوريد الموثوقة</span>
          <h2 class="section-title">المتاجر والوكلاء المعتمدون</h2>
          <p class="section-desc">تسوّق بثقة من متاجر ووكلاء تم التحقق من سجلاتهم التجارية وجودة منتجاتهم وخدماتهم.</p>
        </header>
        <NuxtLink to="#stores" class="btn-outline shrink-0">
          استعراض جميع المتاجر
          <ArrowLeft class="size-4" aria-hidden="true" />
        </NuxtLink>
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CommonStoreCard v-for="store in stores" :key="store.name" v-bind="store" />
      </div>
    </div>
  </section>
</template>
