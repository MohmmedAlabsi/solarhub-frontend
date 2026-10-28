<script setup lang="ts">
import {
  ArrowLeft,
  CheckCircle2,
  Network,
  Package,
  ShieldCheck,
  Store,
  Sun,
  Users,
} from 'lucide-vue-next'

useSeoMeta({
  title: 'عن المنصة | SolarHub',
  description: 'منصة تجمعك بأحدث منتجات الطاقة الشمسية، الموردين المعتمدين، والمهندسين المرخصين في الجمهورية اليمنية.',
})
</script>

<template>
  <div class="container-page py-10 sm:py-16 flex flex-col gap-16 sm:gap-24">
    <!-- 1. البانر الرئيسي لصفحة عن المنصة -->
    <section class="grid gap-10 lg:grid-cols-12 items-center">
      <!-- الصورة على اليسار -->
      <div class="lg:col-span-6 order-2 lg:order-1">
        <div class="overflow-hidden rounded-3xl border border-solar-border-card bg-solar-bg-card p-2 shadow-xl">
          <img
            src="/images/hero-solar.png"
            alt="محطة ألواح طاقة شمسية كهروضوئية متكاملة"
            class="aspect-[4/3] w-full rounded-2xl object-cover"
          />
        </div>
      </div>

      <!-- النصوص على اليمين (RTL) -->
      <div class="flex flex-col gap-5 lg:col-span-6 order-1 lg:order-2 text-right">
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-solar-yellow/15 text-solar-navy-dark dark:text-solar-yellow border border-solar-yellow/30 px-3.5 py-1 text-xs font-black">
            <Sun class="size-3.5 text-solar-yellow" />
            <span>حلول كهروضوئية معتمدة</span>
          </span>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold">
            <ShieldCheck class="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>شبكة موثوقة في الجمهورية اليمنية</span>
          </span>
        </div>

        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-solar-text-heading leading-tight flex items-center gap-2">
          <span>منصة Solar Hub</span>
          <span class="size-3 rounded-full bg-solar-yellow inline-block mt-2 animate-pulse" />
        </h1>

        <p class="text-sm sm:text-base text-solar-text-body leading-relaxed max-w-xl">
          منصة وطنية متكاملة تجمعك بأفضل منتجات الطاقة الكهروضوئية والموردين والمهندسين الاستشاريين في مكان واحد لتسهيل الوصول إلى حلول الطاقة الشمسية النظيفة والموثوقة.
        </p>

        <!-- قائمة التحقق بنقاط ذهبية -->
        <div class="flex flex-col gap-3 pt-2 text-xs sm:text-sm font-bold text-solar-text-heading">
          <div class="flex items-center gap-2.5">
            <CheckCircle2 class="size-5 text-solar-yellow shrink-0" />
            <span>اعتمادات ومواصفات قياسية عالمية ومحلية</span>
          </div>
          <div class="flex items-center gap-2.5">
            <CheckCircle2 class="size-5 text-solar-yellow shrink-0" />
            <span>تواصل تقني مباشر ودعم فني هندسي مستمر</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. قسم "ماذا تقدم Solar Hub؟" (3 كروت) -->
    <section class="flex flex-col items-center text-center gap-4">
      <h2 class="text-2xl sm:text-3xl font-black text-solar-text-heading">ماذا تقدم Solar Hub؟</h2>
      <div class="h-1 w-12 rounded-full bg-solar-yellow mb-8" />

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full text-right">
        <!-- كارت 1: المنتجات -->
        <NuxtLink
          to="/products"
          class="solar-card p-8 flex flex-col items-start gap-4 hover:border-solar-yellow hover:-translate-y-1 transition-all group"
        >
          <span class="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-solar-yellow border border-amber-500/20 group-hover:bg-solar-yellow group-hover:text-solar-navy-dark transition-colors">
            <Package class="size-7" />
          </span>
          <div>
            <h3 class="text-base sm:text-lg font-black text-solar-text-heading mb-1.5 group-hover:text-solar-yellow transition-colors">المنتجات</h3>
            <p class="text-xs text-solar-text-muted leading-relaxed">
              تصفح معدات وحلول الطاقة الشمسية الأصلية المتوفرة عبر الموردين والوكلاء المعتمدين.
            </p>
          </div>
        </NuxtLink>

        <!-- كارت 2: الموردون -->
        <NuxtLink
          to="/stores"
          class="solar-card p-8 flex flex-col items-start gap-4 hover:border-solar-yellow hover:-translate-y-1 transition-all group"
        >
          <span class="flex size-14 items-center justify-center rounded-2xl bg-solar-navy/10 text-solar-navy dark:text-solar-yellow border border-solar-navy/20 group-hover:bg-solar-yellow group-hover:text-solar-navy-dark transition-colors">
            <Store class="size-7" />
          </span>
          <div>
            <h3 class="text-base sm:text-lg font-black text-solar-text-heading mb-1.5 group-hover:text-solar-yellow transition-colors">الموردون</h3>
            <p class="text-xs text-solar-text-muted leading-relaxed">
              تعرّف على كبرى المتاجر الرسمية والوكلاء المعتمدين واستكشف تشكيلات المنتجات والمخزون المتاح.
            </p>
          </div>
        </NuxtLink>

        <!-- كارت 3: المهندسون -->
        <NuxtLink
          to="/engineers"
          class="solar-card p-8 flex flex-col items-start gap-4 hover:border-solar-yellow hover:-translate-y-1 transition-all group"
        >
          <span class="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-solar-yellow border border-amber-500/20 group-hover:bg-solar-yellow group-hover:text-solar-navy-dark transition-colors">
            <Users class="size-7" />
          </span>
          <div>
            <h3 class="text-base sm:text-lg font-black text-solar-text-heading mb-1.5 group-hover:text-solar-yellow transition-colors">المهندسون</h3>
            <p class="text-xs text-solar-text-muted leading-relaxed">
              اكتشف نخبة المهندسين والاستشاريين المعتمدين لطلب الاستشارات والدراسات الفنية لمشروعك.
            </p>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- 3. الصندوق الأوسط "كل ما تحتاجه لحلول الطاقة الشمسية في مكان واحد" -->
    <section class="rounded-3xl bg-solar-bg-card border border-solar-border-card p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-4xl mx-auto shadow-sm">
      <span class="flex size-14 items-center justify-center rounded-2xl bg-solar-bg-subtle text-solar-yellow border border-solar-border-card mb-4 shadow-sm">
        <Network class="size-7" />
      </span>
      <h2 class="text-xl sm:text-2xl font-black text-solar-text-heading mb-3">
        كل ما تحتاجه لحلول الطاقة الشمسية في مكان واحد.
      </h2>
      <p class="text-xs sm:text-sm text-solar-text-body leading-relaxed max-w-2xl">
        تسهل المنصة على المستخدمين وأصحاب المشاريع والشركات الوصول المباشر إلى أحدث المنتجات، الموردين المعتمدين، ونخبة المهندسين والخدمات الفنية بكل يسر وموثوقية في مختلف المحافظات اليمنية.
      </p>
    </section>

    <!-- 4. بانر الدعوة لإجراء "ابدأ باستكشاف Solar Hub" -->
    <section class="rounded-3xl bg-solar-navy-dark p-8 sm:p-12 text-center text-white shadow-2xl flex flex-col items-center justify-center gap-4">
      <h2 class="text-2xl sm:text-3xl font-black text-white">ابدأ باستكشاف Solar Hub</h2>
      <p class="text-xs sm:text-sm text-white/70 max-w-xl leading-relaxed">
        انطلق الآن واستعرض تشكيلة المنتجات والمعدات الكهروضوئية المتوفرة عبر منصتنا.
      </p>
      <NuxtLink
        to="/products"
        class="btn-primary mt-2 px-8 py-3 text-xs sm:text-sm font-black gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
      >
        <span>تصفح المنتجات</span>
        <ArrowLeft class="size-4" />
      </NuxtLink>
    </section>
  </div>
</template>
