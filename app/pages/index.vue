<script setup lang="ts">
useSeoMeta({
  title: 'سولار هب | وجهتك الموثوقة لمنظومات الطاقة الشمسية',
  description: 'تسوّق منتجات الطاقة الشمسية، واعثر على مهندسين معتمدين، وتواصل مع متاجر ووكلاء موثوقين في منصة واحدة.',
})
</script>

<template>
  <div dir="rtl" class="flex min-h-screen flex-col bg-solar-bg-page">
    <LayoutNavbar />
    <main class="flex-1">
      <!-- 1. البانر الرئيسي للزائر -->
      <HomeHeroSection />
      <!-- 2. التصنيفات الرئيسية -->
      <HomeCategoriesSection />
      <!-- 3. أحدث منتجات الطاقة الشمسية -->
      <HomeLatestProductsSection />
      <!-- 4. نخبة المهندسين المعتمدين -->
      <HomeConsultantsSection />
      <!-- 5. دليل المتاجر والوكلاء المعتمدين -->
      <HomeStoresSection />
      <!-- 6. قسم عن المنصة (تم نقله لأسفل الصفحة حسب التوجيه) -->
      <HomeServicesSection />
      <!-- 7. دعوة لاتخاذ إجراء وتواصل -->
      <HomeCtaSection />
    </main>
    <LayoutFooter />
  </div>
</template>
