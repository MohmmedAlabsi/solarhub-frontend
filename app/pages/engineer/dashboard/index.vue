<script setup lang="ts">
import EngineerStatCard from '../../../components/engineer/dashboard/EngineerStatCard.vue'
import EngineerWorkItem from '../../../components/engineer/dashboard/EngineerWorkItem.vue'
import { useAuthStore } from '~~/app/stores/auth'

definePageMeta({ layout: 'engineer' })
useSeoMeta({
  title: 'لوحة تحكم المهندس | SolarHub',
  description: 'متابعة طلبات الخدمات الهندسية المتاحة وحالة عروضك الفنية والمالية المقدمة.',
})

const { stats, workItems, isLoading } = useEngineerDashboard()
const authStore = useAuthStore()
const engineerName = computed(() => authStore.user?.name || 'م. أحمد الشمري')
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- رأس الصفحة: الترحيب -->
    <header class="flex flex-col gap-2 text-right">
      <h1 class="text-2xl font-black text-solar-text-heading md:text-3xl">
        مرحبًا بك، {{ engineerName }}
      </h1>
      <p class="text-sm leading-relaxed text-solar-text-secondary">
        هنا يمكنك متابعة طلبات الخدمات الهندسية المتاحة، وحالة عروضك الفنية والمالية المقدمة.
      </p>
    </header>

    <!-- بطاقات الإحصاء -->
    <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <EngineerStatCard v-for="stat in stats" :key="stat.id" :stat="stat" />
    </div>

    <!-- قسم متابعة أعمال المهندس -->
    <section class="flex flex-col gap-4" aria-labelledby="work-heading">
      <div class="flex items-center justify-between gap-4">
        <h2 id="work-heading" class="text-lg font-bold text-solar-text-heading">
          متابعة أعمال المهندس
        </h2>
        <span class="text-xs text-solar-text-muted">إجراءات سريعة</span>
      </div>

      <div class="flex flex-col gap-3">
        <EngineerWorkItem v-for="item in workItems" :key="item.id" :item="item" />
      </div>
    </section>
  </div>
</template>
