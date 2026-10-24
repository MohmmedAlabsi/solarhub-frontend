<script setup lang="ts">
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  FileText,
  LogOut,
  MapPin,
  Package,
  PackageCheck,
  PackagePlus,
  Phone,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  TrendingUp,
  User,
} from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth',
})

useSeoMeta({
  title: 'لوحة تحكم المتجر والمورد | SolarHub',
  description: 'بوابة الموردين لإدارة المنتجات، متابعة طلبات الشراء، وإدارة السجل التجاري والتوثيق في منصة سولار هب.',
})

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const userGovernorateName = computed(() => {
  const gov = user.value?.governorate
  if (!gov) return 'اليمن'
  if (typeof gov === 'string') return gov
  return (gov as any).name_ar || 'اليمن'
})

// Store KPI metrics
const stats = ref([
  {
    id: 'orders',
    title: 'الطلبات الجديدة الواردة',
    value: '8',
    unit: 'طلبات تنتظر المعالجة',
    icon: ShoppingBag,
    color: 'text-amber-500 bg-amber-50 border-amber-200',
  },
  {
    id: 'products',
    title: 'المنتجات المسجلة بالمتجر',
    value: '42',
    unit: 'منتجاً نشطاً',
    icon: Package,
    color: 'text-blue-500 bg-blue-50 border-blue-200',
  },
  {
    id: 'revenue',
    title: 'إجمالي المبيعات المكتملة',
    value: '$14,850',
    unit: 'خلال هذا الشهر',
    icon: TrendingUp,
    color: 'text-emerald-500 bg-emerald-50 border-emerald-200',
  },
  {
    id: 'rating',
    title: 'تقييم المتجر والموثوقية',
    value: '4.8',
    unit: 'من 5 (48 تقييماً)',
    icon: Star,
    color: 'text-yellow-500 bg-yellow-50 border-yellow-200',
  },
])

// Recent incoming orders from customers
const recentOrders = ref([
  {
    id: 'ORD-8821',
    customer: 'مؤسسة النور الهندسية',
    items: 'أجهزة إنفرتر Growatt 5KW هجين (عدد 4)',
    amount: '3,800 $',
    date: 'منذ ساعتين',
    status: 'جديد بانتظار التأكيد',
    statusClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'ORD-8819',
    customer: 'صالح بن ناصر',
    items: 'ألواح Jinko Solar 550W N-type (عدد 12)',
    amount: '1,920 $',
    date: 'اليوم، 09:15 ص',
    status: 'قيد التجهيز والشحن',
    statusClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'ORD-8804',
    customer: 'م. سامي النهاري',
    items: 'بطاريات ليثيوم Pylontech 48V 100Ah (عدد 2)',
    amount: '2,600 $',
    date: 'أمس',
    status: 'مكتمل ومسلّم',
    statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
])

// Featured products in the store
const storeProducts = ref([
  {
    id: 'PRD-1',
    name: 'ألواح لونجي هيمو 6 (Longi Hi-MO 6) 580W',
    category: 'ألواح شمسية',
    stock: '150 لوح',
    price: '160 $',
    status: 'نشط',
  },
  {
    id: 'PRD-2',
    name: 'إنفرتر داي (Deye) هجين 8KW ثلاثي الطور',
    category: 'إنفرترات ومحولات',
    stock: '14 جهاز',
    price: '1,450 $',
    status: 'نشط',
  },
  {
    id: 'PRD-3',
    name: 'بطارية ليثيوم فيلستي (Felicity) 10KWh جدارية',
    category: 'بطاريات وتخزين',
    stock: '8 وحدات',
    price: '2,200 $',
    status: 'نشط',
  },
])

const showOrderNotice = ref(false)
const confirmedOrderId = ref('')

function handleConfirmOrder(orderId: string) {
  confirmedOrderId.value = orderId
  showOrderNotice.value = true
  const order = recentOrders.value.find(o => o.id === orderId)
  if (order) {
    order.status = 'تم التأكيد وجاري الشحن'
    order.statusClass = 'bg-blue-50 text-blue-700 border-blue-200'
  }
  setTimeout(() => {
    showOrderNotice.value = false
  }, 4000)
}
</script>

<template>
  <div dir="rtl" class="min-h-screen bg-slate-50 text-solar-text-heading antialiased pb-16">
    <!-- شريط المورد العلوي -->
    <header class="sticky top-0 z-40 border-b border-solar-border-card bg-white shadow-xs">
      <div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-4">
          <NuxtLink to="/" class="flex items-center gap-2">
            <img
              src="/images/logo-expanded-dark-transparent.png"
              alt="SolarHub"
              class="h-9 w-auto object-contain"
            />
          </NuxtLink>
          <span class="hidden h-6 w-px bg-slate-200 sm:block" />
          <div class="hidden sm:flex items-center gap-2">
            <span class="rounded-lg bg-solar-navy px-2.5 py-1 text-xs font-black text-white">
              لوحة تحكم المتجر والمورد
            </span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink
            to="/customer/settings"
            class="flex items-center gap-2 rounded-xl border border-solar-border-card bg-white px-3.5 py-2 text-xs font-bold text-solar-text-heading hover:bg-slate-50 transition-colors"
          >
            <User class="size-4 text-solar-navy" />
            <span class="hidden sm:inline">بيانات المتجر والملف</span>
          </NuxtLink>

          <button
            type="button"
            @click="authStore.logout"
            class="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/60 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100/80 transition-colors cursor-pointer"
          >
            <LogOut class="size-4 text-rose-600" />
            <span>خروج</span>
          </button>
        </div>
      </div>
    </header>

    <!-- محتوى لوحة التحكم -->
    <main class="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <!-- تنبيه معالجة الطلب -->
      <div
        v-if="showOrderNotice"
        class="mb-6 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 animate-in fade-in"
      >
        <div class="flex items-center gap-3">
          <CheckCircle2 class="size-5 text-emerald-600" />
          <span>تم تأكيد الطلب ({{ confirmedOrderId }}) بنجاح وتحويله لمرحلة التجهيز والشحن!</span>
        </div>
      </div>

      <!-- بطاقة المتجر والمورد الترحيبية -->
      <section class="rounded-3xl border border-solar-border-card/80 bg-white p-6 sm:p-8 shadow-xs mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div class="flex items-start gap-4">
            <div class="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-solar-navy text-solar-yellow shadow-md text-2xl font-black">
              <Store class="size-8" />
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <h1 class="text-xl sm:text-2xl font-black text-solar-text-heading">
                  {{ user?.name || 'متجر الطاقة الشمسية' }}
                </h1>
                <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <ShieldCheck class="size-3.5 text-emerald-600" />
                  سجل تجاري موثق
                </span>
              </div>
              <p class="text-xs sm:text-sm text-solar-text-muted flex flex-wrap items-center gap-3 mt-1.5">
                <span class="flex items-center gap-1">
                  <MapPin class="size-3.5 text-solar-navy" />
                  {{ userGovernorateName }}
                </span>
                <span class="flex items-center gap-1">
                  <Phone class="size-3.5 text-solar-navy" />
                  <span dir="ltr">{{ user?.phone || 'لا يوجد هاتف مسجل' }}</span>
                </span>
                <span class="flex items-center gap-1 text-amber-600 font-bold">
                  <Star class="size-3.5 fill-amber-400 text-amber-400" />
                  4.8 (تقييم ممتاز)
                </span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 sm:self-center">
            <NuxtLink
              to="/customer/products"
              class="flex h-11 items-center gap-2 rounded-xl bg-solar-yellow px-4 text-xs font-black text-solar-navy-dark shadow-sm hover:bg-amber-400 transition-all"
            >
              <PackagePlus class="size-4" />
              <span>إضافة منتج جديد</span>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- مؤشرات الأداء الأربعة للمتجر -->
      <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div
          v-for="stat in stats"
          :key="stat.id"
          class="rounded-2xl border border-solar-border-card/80 bg-white p-5 shadow-xs transition-transform hover:-translate-y-0.5"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-solar-text-muted">{{ stat.title }}</span>
            <div :class="['flex size-10 items-center justify-center rounded-xl border', stat.color]">
              <component :is="stat.icon" class="size-5" />
            </div>
          </div>
          <div class="text-2xl font-black text-solar-text-heading">{{ stat.value }}</div>
          <p class="mt-1 text-[11px] font-semibold text-solar-text-muted">{{ stat.unit }}</p>
        </div>
      </section>

      <!-- شبكة المحتوى: طلبات الشراء + المنتجات والتوثيق -->
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <!-- جدول / بطاقات الطلبات الواردة (2 أعمدة) -->
        <section class="lg:col-span-2 flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-black text-solar-text-heading">
                طلبات الشراء وعروض الأسعار الواردة
              </h2>
              <p class="text-xs text-solar-text-muted">
                الطلبات الجديدة التي تنتظر التجهيز والتأكيد من متجرك
              </p>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <div
              v-for="order in recentOrders"
              :key="order.id"
              class="rounded-2xl border border-solar-border-card/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
            >
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 border-b border-slate-100 pb-3">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-xs font-bold text-solar-navy bg-slate-100 px-2 py-0.5 rounded-md">
                    {{ order.id }}
                  </span>
                  <span class="text-xs font-bold text-solar-text-heading">{{ order.customer }}</span>
                </div>
                <div class="flex items-center gap-3 text-xs text-solar-text-muted">
                  <span class="flex items-center gap-1">
                    <Clock class="size-3 text-slate-400" />
                    {{ order.date }}
                  </span>
                  <span :class="['text-[11px] font-bold px-2 py-0.5 rounded-full border', order.statusClass]">
                    {{ order.status }}
                  </span>
                </div>
              </div>

              <div class="text-xs font-bold text-solar-text-heading mb-3">
                {{ order.items }}
              </div>

              <div class="flex items-center justify-between pt-2">
                <span class="text-xs text-solar-text-muted font-medium">
                  القيمة الإجمالية: <strong class="text-solar-navy-dark">{{ order.amount }}</strong>
                </span>
                <button
                  type="button"
                  @click="handleConfirmOrder(order.id)"
                  class="flex items-center gap-1.5 rounded-xl bg-solar-navy px-4 py-2 text-xs font-bold text-white hover:bg-solar-navy-dark transition-colors shadow-xs cursor-pointer"
                >
                  <PackageCheck class="size-3.5 text-solar-yellow" />
                  <span>تأكيد وتجهيز الطلب</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- المنتجات المعروضة + السجل التجاري (عمود واحد) -->
        <section class="flex flex-col gap-6">
          <!-- قائمة منتجات المتجر -->
          <div class="rounded-2xl border border-solar-border-card/80 bg-white p-5 shadow-xs">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-base font-black text-solar-text-heading">
                المنتجات الأكثر طلباً
              </h2>
              <NuxtLink to="/customer/products" class="text-xs font-bold text-solar-navy hover:text-solar-yellow transition-colors">
                عرض الكل
              </NuxtLink>
            </div>

            <div class="flex flex-col gap-3">
              <div
                v-for="prod in storeProducts"
                :key="prod.id"
                class="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5"
              >
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="font-bold text-solar-text-heading">{{ prod.name }}</span>
                </div>
                <div class="flex items-center justify-between text-xs text-solar-text-muted mb-2">
                  <span>{{ prod.category }}</span>
                  <span class="font-bold text-solar-navy-dark">{{ prod.price }}</span>
                </div>
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    المخزون: {{ prod.stock }}
                  </span>
                  <span class="text-slate-400">حالة العرض: {{ prod.status }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- بطاقة التحقق من السجل التجاري والوثائق -->
          <div class="rounded-2xl border border-solar-border-card/80 bg-white p-5 shadow-xs">
            <h3 class="text-sm font-black text-solar-text-heading flex items-center gap-2 mb-3">
              <FileCheck class="size-4 text-emerald-600" />
              <span>السجل التجاري والوثائق الرسمية</span>
            </h3>
            <p class="text-xs text-solar-text-muted leading-relaxed mb-4">
              تم التحقق من وثيقة السجل التجاري والترخيص المرفقة بصيغة PDF وتوثيق متجرك رسمياً في منصة سولار هب.
            </p>
            <NuxtLink
              to="/customer/settings"
              class="flex items-center justify-center gap-1.5 w-full rounded-xl border border-solar-border-card py-2 text-xs font-bold text-solar-navy hover:bg-slate-50 transition-colors"
            >
              <span>مراجعة بيانات المتجر والوثائق</span>
              <ExternalLink class="size-3.5" />
            </NuxtLink>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
