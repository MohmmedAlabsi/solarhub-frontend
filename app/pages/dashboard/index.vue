<script setup lang="ts">
import AppToast from '../../components/common/AppToast.vue'
import DashboardActionCard from '../../components/dashboard/DashboardActionCard.vue'
import RecentActivityList from '../../components/dashboard/RecentActivityList.vue'
import type { DashboardAction, RecentActivity } from '../../../types/dashboard'
definePageMeta({ layout: 'customer' })
useHead({ title: 'لوحة تحكم العميل | سولار هب' })
const { actions, activities, unavailableMessage, showComingSoon } = useCustomerDashboard()
const selectAction = (action: DashboardAction) => showComingSoon(action.title)
const showDetails = (activity: RecentActivity) => showComingSoon(`تفاصيل ${activity.id}`)
</script>
<template>
  <section class="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:px-5 lg:py-5">
    <header><h1 class="text-3xl font-bold tracking-tight text-[#142f49]">مرحبًا بك، وجدان 👋</h1><p class="mt-1 text-base text-[#656a72]">استكشف المنتجات والخدمات الشمسية، وتواصل مع الخبراء والموردين لتلبية احتياجات مشروعك بسهولة.</p></header>
    <div class="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><DashboardActionCard v-for="action in actions" :key="action.id" :action="action" @select="selectAction" /></div>
    <section class="mt-8" aria-labelledby="recent-heading"><div class="mb-4 flex items-center justify-between"><h2 id="recent-heading" class="text-xl font-bold">آخر نشاط</h2><button type="button" class="text-sm text-[#56616b] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f8b900]" @click="showComingSoon('كل الأنشطة')">عرض التفاصيل</button></div><RecentActivityList :activities="activities" @details="showDetails" /></section>
    <AppToast :message="unavailableMessage" />
  </section>
</template>

