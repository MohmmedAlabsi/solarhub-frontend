<script setup lang="ts">
useSeoMeta({
  title: 'سولار هب | وجهتك الموثوقة لمنظومات الطاقة الشمسية',
  description: 'تسوّق منتجات الطاقة الشمسية، واعثر على مهندسين معتمدين، وتواصل مع متاجر ووكلاء موثوقين في منصة واحدة.',
})
</script>

<template>
  <div dir="rtl" class="flex min-h-screen flex-col">
    <LayoutNavbar />
    <main class="flex-1">
      <HomeHeroSection />
      <HomeServicesSection />
      <HomeCategoriesSection />
      <HomeLatestProductsSection />
      <HomeConsultantsSection />
      <HomeStoresSection />
      <HomeCtaSection />
    </main>
    <LayoutFooter />
  </div>
</template>
