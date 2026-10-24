<script setup lang="ts">
import DashboardActionCard from '../../../components/customer/dashboard/DashboardActionCard.vue'
import RecentActivityList from '../../../components/customer/dashboard/RecentActivityList.vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'customer' })
useSeoMeta({
  title: 'لوحة تحكم العميل | SolarHub',
  description: 'مرحبًا بك في بوابة العميل لمنصة سولار هب لمتابعة مشتريات وخدمات الطاقة الشمسية.',
})
const { actions, activities } = useCustomerDashboard()
const authStore = useAuthStore()
const userName = computed(() => authStore.user?.name || 'وجدان')
</script>

<template>
  <div class="flex flex-col gap-8">
    <header class="flex flex-col gap-2">
      <h1 class="flex items-center gap-2 text-2xl font-black text-solar-text-heading md:text-3xl">
        <span>مرحبًا بك، {{ userName }}</span><span class="inline-block animate-wave">👋</span>
      </h1>
      <p class="text-sm leading-relaxed text-solar-text-secondary">استكشف المنتجات والخدمات الشمسية، وتواصل مع الخبراء والموردين لتلبية احتياجات مشروعك بسهولة.</p>
    </header>

    <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardActionCard v-for="action in actions" :key="action.id" :action="action" />
    </div>

    <section class="flex flex-col gap-4" aria-labelledby="recent-heading">
      <div class="flex items-center justify-between gap-4">
        <h2 id="recent-heading" class="text-lg font-bold text-solar-text-heading">آخر نشاط</h2>
        <NuxtLink to="/customer/orders" class="text-xs font-semibold text-solar-text-muted hover:text-solar-text-heading">عرض التفاصيل الكاملة</NuxtLink>
      </div>
      <RecentActivityList :activities="activities" />
    </section>
  </div>
</template>
