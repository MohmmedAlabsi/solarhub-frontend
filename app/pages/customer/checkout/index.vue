<script setup lang="ts">
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  FileText,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
  Truck,
  User,
} from 'lucide-vue-next'
import { useCartStore } from '~~/app/stores/cart.store'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'إتمام الطلب والدفع | SolarHub',
  description: 'أكمل بياناتك لتأكيد الشحن وتجهيز مشترياتك مباشرة من المستودعات المعتمدة.',
})

const cartStore = useCartStore()

// بيانات التوصيل المعتمدة كما في التصميم
const fullName = ref('م. فيصل بن عبدالله العتيبي')
const email = ref('faisal.alotaibi@energytech.sa')
const phone = ref('50 123 4567')

// عنوان التوصيل
const region = ref('منطقة الرياض')
const cityDistrict = ref('الرياض - حي الملز')
const addressLine = ref('شارع صلاح الدين الأيوبي - مبنى 14')
const deliveryCoordinates = ref<{ lat: number; lng: number } | null>({ lat: 24.6657, lng: 46.7324 })
const isMapModalOpen = ref(false)

function handleLocationSelected(loc: { address: string; lat: number; lng: number; governorate?: string }) {
  deliveryCoordinates.value = { lat: loc.lat, lng: loc.lng }
  addressLine.value = loc.address
  if (loc.governorate) {
    region.value = loc.governorate
  }
  const parts = loc.address.split('-')
  if (parts.length > 1) {
    cityDistrict.value = `${parts[0].trim()} - ${parts[1].trim()}`
  } else {
    cityDistrict.value = loc.address
  }
}

// طريقة الدفع
const paymentMethod = ref<'card' | 'apple_pay' | 'sadad'>('card')

// نافذة نجاح الطلب
const isSuccessModalOpen = ref(false)
const orderNumber = ref('SH-8842')

function handlePlaceOrder() {
  isSuccessModalOpen.value = true
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted">
      <NuxtLink to="/customer/dashboard" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <NuxtLink to="/customer/cart" class="hover:text-solar-text-heading">سلة المشتريات</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading">إتمام الطلب</span>
    </nav>

    <!-- شريط المراحل (Stepper) -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-solar-text-heading">إتمام الطلب</h1>
          <p class="text-xs text-solar-text-muted">أكمل بياناتك لتأكيد الشحن وتجهيز مشترياتك مباشرة من المستودعات المعتمدة</p>
        </div>

        <div class="hidden sm:flex items-center gap-3 text-xs font-bold">
          <div class="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
            <Check class="size-3.5" />
            <span>1 السلة</span>
          </div>
          <span class="text-solar-text-muted">←</span>
          <div class="flex items-center gap-1.5 rounded-full bg-solar-yellow px-3 py-1 text-solar-navy-dark shadow-sm">
            <span>2 إتمام الطلب</span>
          </div>
          <span class="text-solar-text-muted">←</span>
          <div class="flex items-center gap-1.5 rounded-full bg-solar-bg-subtle px-3 py-1 text-solar-text-muted">
            <span>3 التأكيد</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid gap-8 lg:grid-cols-12">
      <!-- خطوات الطلب الأربعة (8 أعمدة) -->
      <div class="lg:col-span-8 flex flex-col gap-6">
        <!-- الخطوة 1: معلومات التوصيل -->
        <section class="rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm">
          <div class="flex items-center gap-3 border-b border-solar-border-card pb-4 mb-4">
            <span class="flex size-7 items-center justify-center rounded-full bg-solar-navy-dark text-xs font-bold text-white">1</span>
            <h2 class="text-base font-bold text-solar-text-heading">معلومات التوصيل</h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="sm:col-span-2 flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-solar-text-body">الاسم الكامل للمستلم</label>
              <div class="relative">
                <User class="absolute top-3.5 right-3.5 size-4 text-solar-text-muted" />
                <input v-model="fullName" type="text" class="solar-input pr-10" />
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-solar-text-body">البريد الإلكتروني للوثائق</label>
              <div class="relative">
                <Mail class="absolute top-3.5 right-3.5 size-4 text-solar-text-muted" />
                <input v-model="email" type="email" class="solar-input pr-10" />
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-solar-text-body">رقم الجوال للتأكيد</label>
              <div class="relative flex">
                <span class="inline-flex items-center rounded-r-lg border border-l-0 border-solar-border-input bg-solar-bg-subtle px-3 text-xs font-bold text-solar-text-heading">
                  🇸🇦 +966
                </span>
                <input v-model="phone" type="tel" class="solar-input rounded-r-none" />
              </div>
            </div>
          </div>
        </section>

        <!-- الخطوة 2: عنوان التوصيل -->
        <section class="rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between border-b border-solar-border-card pb-4 mb-4">
            <div class="flex items-center gap-3">
              <span class="flex size-7 items-center justify-center rounded-full bg-solar-navy-dark text-xs font-bold text-white">2</span>
              <h2 class="text-base font-bold text-solar-text-heading">عنوان التوصيل</h2>
            </div>
            <button
              type="button"
              @click="isMapModalOpen = true"
              class="inline-flex items-center gap-1.5 rounded-xl border border-solar-yellow bg-solar-yellow/20 px-3.5 py-1.5 text-xs font-bold text-solar-navy-dark hover:bg-solar-yellow/30 transition-all cursor-pointer shadow-2xs"
            >
              <MapPin class="size-4 text-solar-navy-dark" />
              <span>تحديد الموقع عبر الخريطة</span>
            </button>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-solar-text-body">المنطقة / المحافظة</label>
              <input v-model="region" type="text" class="solar-input" />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-solar-text-body">المدينة / الحي</label>
              <div class="relative">
                <MapPin class="absolute top-3.5 right-3.5 size-4 text-solar-text-muted" />
                <input v-model="cityDistrict" type="text" class="solar-input pr-10" />
              </div>
            </div>

            <div class="sm:col-span-2 flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-solar-text-body">العنوان بالتفصيل</label>
              <input v-model="addressLine" type="text" class="solar-input" />
            </div>
          </div>
        </section>

        <!-- الخطوة 3: مراجعة الطلب والمتاجر المعتمدة -->
        <section class="rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between border-b border-solar-border-card pb-4 mb-4">
            <div class="flex items-center gap-3">
              <span class="flex size-7 items-center justify-center rounded-full bg-solar-navy-dark text-xs font-bold text-white">3</span>
              <h2 class="text-base font-bold text-solar-text-heading">الطلب والمتاجر</h2>
            </div>
            <NuxtLink to="/customer/cart" class="text-xs font-bold text-amber-600 hover:underline">
              تعديل السلة ←
            </NuxtLink>
          </div>

          <div class="rounded-xl bg-blue-50/70 p-3 text-xs text-blue-900 border border-blue-200 mb-4">
            ℹ️ سيتم معالجة منتجات كل متجر كجزء مستقل من الطلب لضمان سرعة وتكامل التوصيل.
          </div>

          <!-- متجر 1: شركة شمس الرياض -->
          <div class="flex flex-col gap-3 border-b border-solar-border-card pb-4 mb-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Store class="size-4 text-solar-navy" />
                <span class="text-xs font-bold text-solar-text-heading">شركة شمس الرياض للمهمات الكهروضوئية</span>
                <span class="badge-info text-[10px]">وكيل معتمد</span>
              </div>
              <span class="text-xs font-bold text-solar-navy-dark">مجموع المتجر: 4,120 ر.س</span>
            </div>

            <div class="flex flex-col gap-2 pr-6">
              <div class="flex items-center justify-between text-xs text-solar-text-secondary">
                <span>لوح طاقة شمسية Jinko Tiger Pro 585W ثنائي الأوجه (الكمية: 2)</span>
                <span class="font-bold text-solar-text-heading">970 ر.س</span>
              </div>
              <div class="flex items-center justify-between text-xs text-solar-text-secondary">
                <span>إنفرتر طاقة شمسي هجين Growatt SPF 5000 ES بقدرة 5kW (الكمية: 1)</span>
                <span class="font-bold text-solar-text-heading">3,150 ر.س</span>
              </div>
            </div>
          </div>

          <!-- متجر 2: مؤسسة طاقة الصحراء -->
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Store class="size-4 text-solar-navy" />
                <span class="text-xs font-bold text-solar-text-heading">مؤسسة طاقة الصحراء للتوريدات المتقدمة</span>
                <span class="badge-warning text-[10px]">موزع معتمد</span>
              </div>
              <span class="text-xs font-bold text-solar-navy-dark">مجموع المتجر: 6,450 ر.س</span>
            </div>

            <div class="flex items-center justify-between text-xs text-solar-text-secondary pr-6">
              <span>بطارية ليثيوم Pylontech US5000 48V 4.8kWh (الكمية: 1)</span>
              <span class="font-bold text-solar-text-heading">6,450 ر.س</span>
            </div>
          </div>
        </section>

        <!-- الخطوة 4: خيارات الدفع الإلكتروني -->
        <section class="rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm">
          <div class="flex items-center gap-3 border-b border-solar-border-card pb-4 mb-4">
            <span class="flex size-7 items-center justify-center rounded-full bg-solar-navy-dark text-xs font-bold text-white">4</span>
            <h2 class="text-base font-bold text-solar-text-heading">الدفع</h2>
          </div>

          <div class="flex flex-col gap-3">
            <!-- خيار 1: مدى / بطاقة ائتمانية -->
            <label
              class="flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-colors"
              :class="paymentMethod === 'card' ? 'border-solar-yellow bg-solar-yellow/5' : 'border-solar-border-card hover:bg-solar-bg-subtle'"
            >
              <div class="flex items-center gap-3">
                <input v-model="paymentMethod" type="radio" value="card" class="accent-solar-yellow" />
                <div class="flex flex-col">
                  <span class="text-xs font-bold text-solar-text-heading">بطاقة مدى / بطاقة ائتمانية</span>
                  <span class="text-[11px] text-solar-text-muted">دفع فوري مباشر عبر مدى، فيزا، ماستركارد</span>
                </div>
              </div>
              <div class="flex items-center gap-1.5 text-xs font-bold text-solar-navy">
                <span class="rounded bg-gray-100 px-2 py-0.5">mada</span>
                <span class="rounded bg-gray-100 px-2 py-0.5">VISA</span>
                <span class="rounded bg-gray-100 px-2 py-0.5">Mastercard</span>
              </div>
            </label>

            <!-- خيار 2: Apple Pay -->
            <label
              class="flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-colors"
              :class="paymentMethod === 'apple_pay' ? 'border-solar-yellow bg-solar-yellow/5' : 'border-solar-border-card hover:bg-solar-bg-subtle'"
            >
              <div class="flex items-center gap-3">
                <input v-model="paymentMethod" type="radio" value="apple_pay" class="accent-solar-yellow" />
                <div class="flex flex-col">
                  <span class="text-xs font-bold text-solar-text-heading">Apple Pay</span>
                  <span class="text-[11px] text-solar-text-muted">الدفع السريع والآمن بلمسة واحدة</span>
                </div>
              </div>
              <span class="rounded bg-black px-3 py-1 text-xs font-bold text-white"> Pay</span>
            </label>

            <!-- خيار 3: التحويل البنكي المباشر / سداد -->
            <label
              class="flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-colors"
              :class="paymentMethod === 'sadad' ? 'border-solar-yellow bg-solar-yellow/5' : 'border-solar-border-card hover:bg-solar-bg-subtle'"
            >
              <div class="flex items-center gap-3">
                <input v-model="paymentMethod" type="radio" value="sadad" class="accent-solar-yellow" />
                <div class="flex flex-col">
                  <span class="text-xs font-bold text-solar-text-heading">التحويل البنكي المباشر / سداد</span>
                  <span class="text-[11px] text-solar-text-muted">إصدار فاتورة أولية برقم الآيبان وسداد للمنشآت</span>
                </div>
              </div>
              <span class="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-900">سداد SADAD</span>
            </label>
          </div>

          <div class="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <ShieldCheck class="size-4 shrink-0 text-emerald-600" />
            <span>دفع إلكتروني آمن ومشفر 100% وفق متطلبات البنك المركزي السعودي</span>
          </div>
        </section>
      </div>

      <!-- ملخص الطلب المالي الثابت (4 أعمدة) -->
      <div class="lg:col-span-4 flex flex-col gap-4">
        <div class="sticky top-28 flex flex-col gap-4 rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm">
          <h2 class="text-base font-bold text-solar-text-heading border-b border-solar-border-card pb-3">ملخص الطلب المالي</h2>

          <div class="flex flex-col gap-2.5 text-xs">
            <div class="flex items-center justify-between text-solar-text-secondary">
              <span>عدد العناصر:</span>
              <span class="font-bold text-solar-text-heading">4 منتجات (في متجرين)</span>
            </div>

            <div class="flex items-center justify-between text-solar-text-secondary">
              <span>مجموع المشتريات:</span>
              <span class="font-bold text-solar-text-heading">9,191.30 ر.س</span>
            </div>

            <div class="flex items-center justify-between text-solar-text-secondary">
              <span>ضريبة القيمة المضافة (15%):</span>
              <span class="font-bold text-solar-text-heading">1,378.70 ر.س</span>
            </div>

            <div class="flex items-center justify-between text-solar-text-secondary">
              <span>رسوم الشحن المعتمد:</span>
              <span class="badge-success text-[10px]">شحن آمن مجاني</span>
            </div>
          </div>

          <hr class="border-solar-border-card" />

          <!-- الإجمالي الكلي المطلوب سداده -->
          <div class="flex flex-col gap-1">
            <span class="text-xs text-solar-text-muted">الإجمالي الكلي المطلوب سداده:</span>
            <div class="flex items-baseline justify-between">
              <span class="text-3xl font-black text-solar-navy-dark">10,570</span>
              <span class="text-sm font-bold text-solar-text-heading">ريال سعودي</span>
            </div>
            <span class="text-[10px] text-solar-text-muted">شامل ضريبة القيمة المضافة والشحن المباشر</span>
          </div>

          <!-- زر تأكيد وإتمام الطلب -->
          <button
            type="button"
            @click="handlePlaceOrder"
            class="btn-primary w-full h-12 text-sm gap-2 mt-2"
          >
            <span>تأكيد وإتمام الطلب</span>
            <ChevronLeft class="size-4" />
          </button>

          <NuxtLink
            to="/customer/cart"
            class="text-center text-xs font-semibold text-solar-text-muted hover:text-solar-text-heading py-1"
          >
            العودة إلى سلة المشتريات
          </NuxtLink>

          <div class="flex items-center justify-center gap-1.5 text-[11px] text-solar-text-muted pt-2 border-t border-solar-border-card">
            <Lock class="size-3.5 text-solar-text-muted" />
            <span>معاملة مشفرة بأحدث بروتوكولات الأمان SSL 256-bit</span>
          </div>
        </div>
      </div>
    </div>

    <!-- نافذة تأكيد نجاح الطلب (تأكيد نجاح الطلب.png) -->
    <div v-if="isSuccessModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div class="relative w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl z-10">
        <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4 animate-bounce">
          <CheckCircle2 class="size-10" />
        </div>

        <h3 class="text-xl font-black text-solar-text-heading mb-1">تم تأكيد طلبك بنجاح!</h3>
        <p class="text-xs text-solar-text-muted mb-4">شكراً لثقتك بمنصة SolarHub</p>

        <div class="rounded-xl bg-solar-bg-subtle p-4 mb-6 text-right text-xs flex flex-col gap-2 border border-solar-border-card">
          <div class="flex justify-between">
            <span class="text-solar-text-muted">رقم الطلب المعتمد:</span>
            <span class="font-black text-solar-navy-dark">#{{ orderNumber }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-solar-text-muted">المبلغ الإجمالي المسدد:</span>
            <span class="font-bold text-solar-text-heading">10,570 ريال سعودي</span>
          </div>
          <div class="flex justify-between">
            <span class="text-solar-text-muted">الحالة الحالية:</span>
            <span class="badge-info text-[10px]">قيد التجهيز من المستودعات</span>
          </div>
        </div>

        <div class="flex flex-col gap-2.5">
          <NuxtLink :to="`/customer/orders/${orderNumber}/track`" class="btn-primary w-full gap-2">
            <Truck class="size-4" />
            <span>تتبع مسار وحالة الشحنة الآن</span>
          </NuxtLink>
          <NuxtLink to="/customer/products" class="btn-outline w-full">
            <span>العودة لكتالوج المنتجات</span>
          </NuxtLink>
        </div>
      </div>
    </div>
    <!-- نافذة اختيار موقع التوصيل على الخريطة -->
    <CommonMapLocationModal
      :is-open="isMapModalOpen"
      :current-location="addressLine"
      :initial-coordinates="deliveryCoordinates || undefined"
      title="تحديد موقع التوصيل والتسليم بدقة"
      subtitle="حدد موقع المبنى أو المستودع على الخريطة لضمان سرعة ودقة توصيل الشحنة"
      @close="isMapModalOpen = false"
      @select="handleLocationSelected"
    />
  </div>
</template>
