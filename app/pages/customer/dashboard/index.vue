<script setup lang="ts">
import DashboardActionCard from '../../../components/customer/dashboard/DashboardActionCard.vue'
import RecentActivityList from '../../../components/customer/dashboard/RecentActivityList.vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'لوحة تحكم العميل | SolarHub',
  description:
    'بوابة العميل لمنصة سولار هب لمتابعة مشتريات وخدمات الطاقة الشمسية.',
})

const authStore = useAuthStore()

const {
  actions,
  activities,
  loading,
  error,
  loadDashboard,
} = useCustomerDashboard()

const userName = computed(
  () => authStore.user?.name || 'عميل سولار هب',
)
</script>

<template>
  <div class="flex flex-col gap-8">
    <header class="flex flex-col gap-2">
      <h1
        class="flex items-center gap-2 text-2xl font-black text-solar-text-heading md:text-3xl"
      >
        <span>مرحبًا بك، {{ userName }}</span>

        <span class="inline-block animate-wave" aria-hidden="true">
          👋
        </span>
      </h1>

      <p class="text-sm leading-relaxed text-solar-text-secondary">
        استكشف المنتجات والخدمات الشمسية، وتواصل مع الخبراء
        والموردين لتلبية احتياجات مشروعك بسهولة.
      </p>
    </header>

    <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardActionCard
        v-for="action in actions"
        :key="action.id"
        :action="action"
      />
    </div>

    <section
      class="flex flex-col gap-4"
      aria-labelledby="recent-heading"
      :aria-busy="loading"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="recent-heading"
          class="text-lg font-bold text-solar-text-heading"
        >
          آخر نشاط
        </h2>

        <NuxtLink
          to="/customer/orders"
          class="text-xs font-semibold text-solar-text-muted hover:text-solar-text-heading"
        >
          عرض طلبات الشراء
        </NuxtLink>
      </div>

      <!-- حالة التحميل -->
      <div
        v-if="loading"
        class="solar-card px-5 py-10 text-center"
        role="status"
        aria-live="polite"
      >
        <p class="text-sm text-solar-text-muted">
          جارٍ تحميل آخر الأنشطة...
        </p>
      </div>

      <template v-else>
        <!-- يظهر الخطأ أيضًا عند نجاح بعض مصادر الأنشطة فقط -->
        <div
          v-if="error"
          class="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <p class="text-sm leading-6 text-red-700">
            {{ error }}
          </p>

          <button
            type="button"
            class="shrink-0 self-start rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            @click="loadDashboard"
          >
            إعادة المحاولة
          </button>
        </div>

        <!-- الأنشطة المسترجعة من الخادم -->
        <RecentActivityList
          v-if="activities.length"
          :activities="activities"
        />

        <!-- حساب لا توجد به أنشطة -->
        <div
          v-else-if="!error"
          class="solar-card px-5 py-10 text-center"
          role="status"
        >
          <h3 class="text-base font-bold text-solar-text-heading">
            لا توجد أنشطة حتى الآن
          </h3>

          <p class="mt-2 text-sm leading-7 text-solar-text-muted">
            ستظهر هنا آخر طلبات الشراء وعروض الأسعار
            وطلبات الخدمات الهندسية الخاصة بحسابك.
          </p>

          <NuxtLink
            to="/customer/services/new"
            class="btn-primary mt-5 inline-flex"
          >
            طلب خدمة هندسية
          </NuxtLink>
        </div>
      </template>
    </section>
  </div>
</template>