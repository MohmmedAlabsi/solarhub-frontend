<script setup lang="ts">
import {
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Store,
  Truck,
  User,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'customer',
})

const route = useRoute()
const orderId = route.params.id || 'SH-8842'

// مراحل التتبع المطابقة لـ (تتبع الطلب.png)
const trackingSteps = [
  {
    title: 'تم تأكيد الطلب والدفع الإلكتروني بنجاح',
    time: '12 أكتوبر 2026 - 10:30 ص',
    description: 'تم التحقق من الحوالة وإصدار الفاتورة الضريبية المعتمدة رقم INV-2026-992',
    status: 'completed',
  },
  {
    title: 'تجهيز الشحنة وفحص الجودة بالمستودع',
    time: '12 أكتوبر 2026 - 02:15 م',
    description: 'تم فحص خلايا الألواح وتغليفها وفق معايير الحماية من الصدمات',
    status: 'completed',
  },
  {
    title: 'تسليم الشحنة للناقل المعتمد (سولار إكسبرس)',
    time: '12 أكتوبر 2026 - 06:45 م',
    description: 'خرجت الشحنة من مستودع الرياض المركزي برقم تتبع TRK-8842-SA',
    status: 'completed',
  },
  {
    title: 'الشحنة في طريقها إليك الآن',
    time: 'اليوم - 09:00 ص',
    description: 'مندوب التوصيل في طريقه إلى موقعك: الرياض - حي الملز',
    status: 'current',
  },
  {
    title: 'التسليم النهائي وتوقيع استلام المطابقة',
    time: 'المتوقع اليوم خلال 3 ساعات',
    description: 'يتم فحص الصناديق وسلامة الأختام قبل إغلاق الطلب',
    status: 'upcoming',
  },
]
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted">
      <NuxtLink to="/customer/dashboard" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <NuxtLink to="/customer/orders" class="hover:text-solar-text-heading">طلباتي</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading">تتبع الطلب #{{ orderId }}</span>
    </nav>

    <!-- بطاقة رأس التتبع وحالة الشحنة -->
    <div class="rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-solar-border-card pb-4">
        <div class="flex items-center gap-3">
          <div class="flex size-12 items-center justify-center rounded-2xl bg-solar-status-info-bg text-solar-status-info-text">
            <Truck class="size-6 animate-pulse" />
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-black text-solar-navy-dark">تتبع الشحنة #{{ orderId }}</h1>
              <span class="badge-info text-xs">شحنتك في طريقها إليك</span>
            </div>
            <span class="text-xs text-solar-text-muted">الناقل المعتمد: أسطول سولار هب اللوجستي المبرد والمحمي</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <a
            href="tel:+966501234567"
            class="btn-outline h-9 px-3.5 text-xs gap-1.5"
          >
            <Phone class="size-3.5" />
            <span>الاتصال بالمندوب</span>
          </a>
        </div>
      </div>

      <!-- الخط الزمني لمراحل التتبع (Timeline) -->
      <div class="relative mt-8 pr-4">
        <div class="absolute top-3 bottom-3 right-7 w-0.5 bg-solar-border-card" />

        <div class="flex flex-col gap-8">
          <div
            v-for="(step, index) in trackingSteps"
            :key="index"
            class="relative flex items-start gap-5 pr-1"
          >
            <!-- الأيقونة وحالة المرحلة -->
            <div
              class="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-all"
              :class="{
                'bg-emerald-500 border-white text-white shadow': step.status === 'completed',
                'bg-solar-yellow border-white text-solar-navy-dark ring-4 ring-solar-yellow/20': step.status === 'current',
                'bg-white border-solar-border-card text-solar-text-muted': step.status === 'upcoming',
              }"
            >
              <CheckCircle2 v-if="step.status === 'completed'" class="size-4" />
              <Truck v-else-if="step.status === 'current'" class="size-4" />
              <span v-else class="text-xs font-bold">{{ index + 1 }}</span>
            </div>

            <!-- تفاصيل المرحلة -->
            <div class="flex flex-col gap-1">
              <div class="flex flex-wrap items-center gap-2">
                <h3
                  class="text-sm font-bold"
                  :class="step.status === 'upcoming' ? 'text-solar-text-muted' : 'text-solar-text-heading'"
                >
                  {{ step.title }}
                </h3>
                <span class="text-[11px] text-solar-text-muted">({{ step.time }})</span>
              </div>
              <p class="text-xs text-solar-text-secondary leading-relaxed">
                {{ step.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- معلومات العنوان وتفاصيل الشحنة -->
    <div class="grid gap-6 md:grid-cols-2">
      <div class="rounded-2xl border border-solar-border-card bg-white p-5 shadow-sm">
        <h3 class="text-sm font-bold text-solar-text-heading border-b border-solar-border-card pb-3 mb-3 flex items-center gap-2">
          <MapPin class="size-4 text-solar-yellow" />
          عنوان التوصيل
        </h3>
        <div class="flex flex-col gap-1.5 text-xs text-solar-text-secondary">
          <span class="font-bold text-solar-text-heading">م. فيصل بن عبدالله العتيبي</span>
          <span>منطقة الرياض - حي الملز</span>
          <span>شارع صلاح الدين الأيوبي - مبنى 14</span>
          <span>هاتف المستلم: +966 50 123 4567</span>
        </div>
      </div>

      <div class="rounded-2xl border border-solar-border-card bg-white p-5 shadow-sm">
        <h3 class="text-sm font-bold text-solar-text-heading border-b border-solar-border-card pb-3 mb-3 flex items-center gap-2">
          <Package class="size-4 text-solar-yellow" />
          محتويات هذه الشحنة
        </h3>
        <div class="flex flex-col gap-2 text-xs">
          <div class="flex justify-between text-solar-text-secondary">
            <span>لوح طاقة شمسية Jinko Tiger Pro 585W (عدد 2)</span>
            <span class="font-bold text-solar-text-heading">شركة شمس الرياض</span>
          </div>
          <div class="flex justify-between text-solar-text-secondary">
            <span>إنفرتر طاقة شمسي هجين Growatt SPF 5000 ES</span>
            <span class="font-bold text-solar-text-heading">شركة شمس الرياض</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
