<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

const consultants = [
  {
    image: '/images/consultant-1.png',
    name: 'م. أحمد الشمري',
    specialty: 'مهندس أنظمة طاقة شمسية',
    location: 'الرياض',
    bio: 'متخصص في تصميم المنظومات السكنية والتجارية الهجينة وحساب الأحمال بدقة.',
    rating: 4.9,
    experience: 8,
    projects: 140,
  },
  {
    image: '/images/consultant-2.png',
    name: 'م. سارة القحطاني',
    specialty: 'استشارية كفاءة الطاقة',
    location: 'جدة',
    bio: 'خبيرة في دراسات الجدوى وتحسين كفاءة استهلاك الطاقة للمنشآت الصناعية.',
    rating: 4.8,
    experience: 6,
    projects: 95,
  },
  {
    image: '/images/consultant-3.png',
    name: 'م. طارق العتيبي',
    specialty: 'مهندس مضخات ومشاريع زراعية',
    location: 'القصيم',
    bio: 'تنفيذ أنظمة ضخ المياه بالطاقة الشمسية للمزارع والمشاريع الزراعية الكبيرة.',
    rating: 4.9,
    experience: 12,
    projects: 210,
  },
]
</script>

<template>
  <section id="consultants" class="bg-white py-16 lg:py-24">
    <div class="container-page flex flex-col gap-10">
      <div class="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <header class="flex max-w-2xl flex-col gap-3">
          <span class="section-eyebrow">الخبرة الهندسية الموثوقة</span>
          <h2 class="section-title">مهندسون واستشاريون موثوقون لمشروعك</h2>
          <p class="section-desc">نخبة من المهندسين المعتمدين لمساعدتك في تصميم منظومتك واختيار المكونات المثالية لاحتياجاتك.</p>
        </header>
        <NuxtLink to="#consultants" class="btn-outline shrink-0">
          دليل المهندسين الكامل
          <ArrowLeft class="size-4" aria-hidden="true" />
        </NuxtLink>
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CommonConsultantCard
          v-for="consultant in consultants"
          :key="consultant.name"
          v-bind="consultant"
        />
      </div>
    </div>
  </section>
</template>
