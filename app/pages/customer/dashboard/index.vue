<script setup lang="ts">
import {
  ArrowLeft,
  ChevronLeft,
  Clock,
  FileText,
  Package,
  ShoppingBag,
  Truck,
  Wrench,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'لوحة تحكم العميل | SolarHub',
  description: 'مرحبًا بك في بوابة العميل لمنصة سولار هب لمتابعة مشتريات وخدمات الطاقة الشمسية.',
})

// البطاقات الأربعة السريعة المطابقة للتصميم (لوحة تحكم العميل.png)
const quickActions = [
  {
    title: 'تصفح المنتجات',
    desc: 'استكشف الألواح والمحولات والبطاريات المعتمدة',
    btnText: 'تصفح الآن',
    btnClass: 'btn-dark',
    icon: Package,
    to: '/customer/products',
  },
  {
    title: 'طلب خدمة',
    desc: 'استشارات فنية، دراسات جدوى ومخططات معتمدة',
    btnText: 'طلب خدمة',
    btnClass: 'btn-primary',
    icon: Wrench,
    to: '/customer/services',
  },
  {
    title: 'طلبات عروض الأسعار',
    desc: 'إرسال ومتابعة عروض الأسعار المخصصة (RFQ)',
    btnText: 'عرض الطلبات',
    btnClass: 'btn-dark',
    icon: FileText,
    to: '/customer/orders?tab=quotes',
  },
  {
    title: 'طلباتي',
    desc: 'متابعة أوامر الشراء وحالات الشحن والتسليم',
    btnText: 'متابعة الطلبات',
    btnClass: 'btn-primary',
    icon: ShoppingBag,
    to: '/customer/orders',
  },
]

// سجل آخر نشاط
const recentActivities = [
  {
    id: 'SH-8842',
    title: 'طلب شراء #SH-8842 – لوح Jinko Tiger Pro 585W (شمس الرياض)',
    status: 'شحنتك في طريقها إليك',
    statusClass: 'badge-info',
    time: 'قبل 15 دقيقة',
    icon: Truck,
    to: '/customer/orders/SH-8842/track',
  },
  {
    id: 'RFQ-1049',
    title: 'طلب عرض سعر #RFQ-1049 – إنفرتر هجين Deye 8kW (مؤسسة طاقة الصحراء)',
    status: 'تم استلام عرض السعر',
    statusClass: 'badge-warning',
    time: 'قبل ساعتين',
    icon: FileText,
    to: '/customer/orders?tab=quotes',
  },
  {
    id: 'SR-302',
    title: 'طلب خدمة هندسية #SR-302 – دراسة جدوى وتوافق كود SBC (م. أحمد الشمري)',
    status: 'قيد المراجعة الفنية',
    statusClass: 'badge-warning',
    time: 'أمس',
    icon: Wrench,
    to: '/customer/services',
  },
]
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- التحية والترحيب الرسمي -->
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-black text-solar-text-heading md:text-3xl flex items-center gap-2">
        <span>مرحبًا بك، وجدان</span>
        <span class="inline-block animate-wave">👋</span>
      </h1>
      <p class="text-sm text-solar-text-secondary leading-relaxed">
        استكشف المنتجات والخدمات الشمسية، وتواصل مع الخبراء والموردين لتلبية احتياجات مشروعك بسهولة.
      </p>
    </header>

    <!-- البطاقات الأربعة التفاعلية السريعة -->
    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <article
        v-for="action in quickActions"
        :key="action.title"
        class="flex flex-col justify-between rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm transition-all hover:border-solar-yellow/60 hover:shadow-hover text-center items-center"
      >
        <div class="flex size-14 items-center justify-center rounded-2xl bg-solar-bg-subtle text-solar-navy mb-4">
          <component :is="action.icon" class="size-6" />
        </div>

        <div class="flex flex-col gap-1.5 mb-6">
          <h2 class="text-base font-bold text-solar-text-heading">{{ action.title }}</h2>
          <p class="text-xs text-solar-text-muted leading-relaxed">{{ action.desc }}</p>
        </div>

        <NuxtLink :to="action.to" :class="[action.btnClass, 'w-full h-10 text-xs']">
          {{ action.btnText }}
        </NuxtLink>
      </article>
    </div>

    <!-- سجل آخر نشاط (Recent Activity) -->
    <section class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-solar-text-heading">آخر نشاط</h2>
        <NuxtLink to="/customer/orders" class="text-xs font-semibold text-solar-text-muted hover:text-solar-text-heading">
          عرض التفاصيل الكاملة
        </NuxtLink>
      </div>

      <div class="rounded-2xl border border-solar-border-card bg-white p-2 shadow-sm divide-y divide-solar-border-card">
        <div
          v-for="item in recentActivities"
          :key="item.id"
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-solar-bg-subtle/50 transition-colors rounded-xl"
        >
          <div class="flex items-center gap-3.5">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-status-info-bg text-solar-status-info-text">
              <component :is="item.icon" class="size-5" />
            </div>

            <div class="flex flex-col gap-0.5">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs font-bold text-solar-text-heading">{{ item.title }}</span>
                <span :class="item.statusClass" class="text-[10px]">{{ item.status }}</span>
              </div>
              <span class="text-[11px] text-solar-text-muted">{{ item.time }}</span>
            </div>
          </div>

          <NuxtLink
            :to="item.to"
            class="text-xs font-bold text-solar-text-body hover:text-amber-600 flex items-center gap-1 self-end sm:self-auto"
          >
            <span>عرض التفاصيل</span>
            <ChevronLeft class="size-3.5" />
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
