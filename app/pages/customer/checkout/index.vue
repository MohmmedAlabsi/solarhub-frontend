<script setup lang="ts">
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  FileText,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
  Truck,
  User,
  Wallet,
} from 'lucide-vue-next'
import { useCustomerOrders, type ApiOrder } from '~~/app/composables/useCustomerOrders'
import { useCartStore } from '~~/app/stores/cart.store'
import { useAuthStore } from '~~/app/stores/auth'

definePageMeta({
  layout: 'customer',
})

useSeoMeta({
  title: 'إتمام الطلب وتحديد التوصيل والدفع | SolarHub',
  description: 'أكمل بياناتك لتأكيد الشحن وتجهيز مشترياتك مباشرة من المستودعات المعتمدة.',
})

const cartStore = useCartStore()
const authStore = useAuthStore()
const {
  governorates,
  walletProviders,
  fetchGovernorates,
  fetchWalletProviders,
  placeOrder,
  isActionLoading,
} = useCustomerOrders()

// بيانات العميل المعتمدة
const fullName = ref(authStore.user?.name || '')
const email = ref(authStore.user?.email || '')
const phone = ref(authStore.user?.phone || '')

// عنوان وبيانات التوصيل
const selectedGovernorateId = ref<number | null>(null)
const addressDetails = ref('')
const notes = ref('')
const deliveryCoordinates = ref<string | null>(null)

// طريقة الدفع
const paymentMethod = ref<'wallet' | 'cod' | 'bank_transfer'>('wallet')
const selectedWalletId = ref<number | null>(null)
const selectedWallet = computed(() => walletProviders.value.find(p => p.id === selectedWalletId.value))

// نافذة نجاح الطلب
const isSuccessModalOpen = ref(false)
const createdOrder = ref<ApiOrder | null>(null)
const errorMessage = ref<string | null>(null)

// التحقق من الحقول
const isFormValid = computed(() => {
  return (
    Boolean(addressDetails.value.trim()) &&
    Boolean(fullName.value.trim()) &&
    cartStore.items.length > 0
  )
})

async function handlePlaceOrder() {
  if (!isFormValid.value) {
    errorMessage.value = 'يرجى استكمال عنوان التوصيل وبيانات الاستلام.'
    return
  }

  errorMessage.value = null
  try {
    const order = await placeOrder({
      delivery_governorate_id: selectedGovernorateId.value,
      delivery_address: addressDetails.value.trim() + (notes.value ? ` (ملاحظات: ${notes.value.trim()})` : ''),
      delivery_coordinates: deliveryCoordinates.value,
    })

    createdOrder.value = order
    isSuccessModalOpen.value = true

    // تفريغ السلة بعد إنشاء الطلب بنجاح
    await cartStore.fetchCart()
  } catch (err: any) {
    console.error('Failed to create order:', err)
    errorMessage.value =
      err?.userMessage || err?.data?.message || err?.message || 'حدث خطأ أثناء تأكيد الطلب، يرجى المحاولة مرة أخرى.'
  }
}

onMounted(async () => {
  await Promise.allSettled([
    fetchGovernorates(),
    fetchWalletProviders(),
    cartStore.fetchCart(),
  ])

  if (governorates.value.length > 0 && !selectedGovernorateId.value) {
    selectedGovernorateId.value = governorates.value[0]?.id || null
  }
  if (walletProviders.value.length > 0 && !selectedWalletId.value) {
    selectedWalletId.value = walletProviders.value[0]?.id || null
  }
  if (authStore.user) {
    fullName.value = authStore.user.name || fullName.value
    email.value = authStore.user.email || email.value
    phone.value = authStore.user.phone || phone.value
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
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
          <h1 class="text-2xl font-black text-solar-text-heading">إتمام الطلب وتحديد التوصيل والدفع</h1>
          <p class="text-xs text-solar-text-muted">أكمل بياناتك لتأكيد الشحن وتجهيز مشترياتك مباشرة من المستودعات المعتمدة</p>
        </div>

        <div class="hidden sm:flex items-center gap-3 text-xs font-bold">
          <NuxtLink to="/customer/cart" class="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 hover:bg-emerald-100">
            <Check class="size-3.5" />
            <span>1 السلة</span>
          </NuxtLink>
          <span class="text-solar-text-muted">←</span>
          <div class="flex items-center gap-1.5 rounded-full bg-solar-yellow px-3 py-1 text-solar-navy-dark shadow-sm">
            <span>2 إتمام الطلب</span>
          </div>
          <span class="text-solar-text-muted">←</span>
          <div class="flex items-center gap-1.5 rounded-full bg-solar-bg-subtle px-3 py-1 text-solar-text-muted">
            <span>3 التأكيد والتتبع</span>
          </div>
        </div>
      </div>
    </div>

    <!-- تنبيه عند خلو السلة -->
    <div
      v-if="cartStore.items.length === 0"
      class="flex flex-col items-center justify-center rounded-2xl border border-solar-border-card bg-white p-12 text-center shadow-sm"
    >
      <div class="flex size-16 items-center justify-center rounded-full bg-solar-bg-subtle text-solar-text-muted mb-4">
        <Store class="size-8 stroke-[1.5]" />
      </div>
      <h2 class="text-lg font-bold text-solar-text-heading mb-2">لا توجد منتجات في السلة لإتمام الطلب</h2>
      <p class="max-w-md text-xs text-solar-text-muted mb-6">
        قم بإضافة ألواح أو محولات أو بطاريات من كتالوج المتاجر المعتمدة أولاً لمتابعة الشراء.
      </p>
      <NuxtLink to="/customer/products" class="btn-primary gap-2 text-xs px-6 py-2.5">
        <span>تصفح كتالوج المنتجات</span>
        <ArrowLeft class="size-4" />
      </NuxtLink>
    </div>

    <!-- شبكة النموذج والملخص -->
    <div v-else class="grid gap-8 lg:grid-cols-12">
      <!-- نموذج البيانات (8 أعمدة) -->
      <div class="lg:col-span-8 flex flex-col gap-6">
        <!-- رسالة الخطأ إن وجدت -->
        <div v-if="errorMessage" class="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs text-red-700 border border-red-200">
          <AlertCircle class="size-5 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- 1. بيانات المستلم -->
        <div class="rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm flex flex-col gap-4">
          <div class="flex items-center gap-2 border-b border-solar-border-card pb-3">
            <User class="size-5 text-solar-yellow" />
            <h2 class="text-base font-bold text-solar-text-heading">1. بيانات المستلم والتواصل</h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-solar-text-body">الاسم الكامل:</label>
              <input
                v-model="fullName"
                type="text"
                placeholder="اسم المستلم"
                class="solar-input"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-solar-text-body">رقم الهاتف:</label>
              <input
                v-model="phone"
                type="tel"
                placeholder="77XXXXXXX"
                class="solar-input"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-solar-text-body">البريد الإلكتروني:</label>
              <input
                v-model="email"
                type="email"
                placeholder="example@domain.com"
                class="solar-input"
              />
            </div>
          </div>
        </div>

        <!-- 2. عنوان التوصيل والموقع -->
        <div class="rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm flex flex-col gap-4">
          <div class="flex items-center gap-2 border-b border-solar-border-card pb-3">
            <MapPin class="size-5 text-solar-yellow" />
            <h2 class="text-base font-bold text-solar-text-heading">2. موقع وعنوان التوصيل</h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-solar-text-body">المحافظة / المنطقة:</label>
              <select v-model="selectedGovernorateId" class="solar-input">
                <option v-for="gov in governorates" :key="gov.id" :value="gov.id">
                  {{ gov.name_ar }}
                </option>
              </select>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-solar-text-body">العنوان التفصيلي (المدينة، الحي، الشارع):</label>
              <input
                v-model="addressDetails"
                type="text"
                placeholder="مثال: صنعاء - حدة - بجوار جولة الرويشان"
                class="solar-input"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-solar-text-body">ملاحظات تسليم خاصة للشاحنة / الرافعة (اختياري):</label>
            <textarea
              v-model="notes"
              rows="2"
              placeholder="مثال: يرجى الاتصال قبل الوصول بنصف ساعة، يتوفر ونش تنزيل في الموقع..."
              class="solar-input resize-none"
            />
          </div>
        </div>

        <!-- 3. طريقة الدفع -->
        <div class="rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm flex flex-col gap-4">
          <div class="flex items-center gap-2 border-b border-solar-border-card pb-3">
            <Wallet class="size-5 text-solar-yellow" />
            <h2 class="text-base font-bold text-solar-text-heading">3. طريقة الدفع المعتمدة</h2>
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            <!-- خيار المحافظ الإلكترونية -->
            <label
              class="flex flex-col gap-2 rounded-xl border p-4 cursor-pointer transition-all"
              :class="paymentMethod === 'wallet' ? 'border-amber-500 bg-amber-50/30 ring-1 ring-amber-500' : 'border-solar-border-card hover:bg-solar-bg-subtle'"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-solar-text-heading">محفظة إلكترونية</span>
                <input
                  v-model="paymentMethod"
                  type="radio"
                  value="wallet"
                  class="accent-amber-600"
                />
              </div>
              <p class="text-[11px] text-solar-text-muted">الدفع عبر الكريمي، ون كاش، فلوسك، جايبي...</p>
            </label>

            <!-- خيار الدفع عند الاستلام -->
            <label
              class="flex flex-col gap-2 rounded-xl border p-4 cursor-pointer transition-all"
              :class="paymentMethod === 'cod' ? 'border-amber-500 bg-amber-50/30 ring-1 ring-amber-500' : 'border-solar-border-card hover:bg-solar-bg-subtle'"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-solar-text-heading">الدفع عند الاستلام</span>
                <input
                  v-model="paymentMethod"
                  type="radio"
                  value="cod"
                  class="accent-amber-600"
                />
              </div>
              <p class="text-[11px] text-solar-text-muted">الدفع نقداً بعد فحص ومطابقة الشحنة في الموقع</p>
            </label>

            <!-- خيار الحوالة البنكية -->
            <label
              class="flex flex-col gap-2 rounded-xl border p-4 cursor-pointer transition-all"
              :class="paymentMethod === 'bank_transfer' ? 'border-amber-500 bg-amber-50/30 ring-1 ring-amber-500' : 'border-solar-border-card hover:bg-solar-bg-subtle'"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-solar-text-heading">حوالة بنكية مباشرة</span>
                <input
                  v-model="paymentMethod"
                  type="radio"
                  value="bank_transfer"
                  class="accent-amber-600"
                />
              </div>
              <p class="text-[11px] text-solar-text-muted">إيداع في حساب المنصة المعتمد مع إرفاق السند</p>
            </label>
          </div>

          <!-- تفاصيل مزود المحفظة عند اختيار المحفظة -->
          <div v-if="paymentMethod === 'wallet'" class="flex flex-col gap-3 pt-3 border-t border-solar-border-card">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-solar-text-heading">اختر المحفظة الإلكترونية المعتمدة:</span>
              <span v-if="walletProviders.length" class="text-[11px] text-solar-text-muted">
                {{ walletProviders.length }} محافظ إلكترونية متوفرة
              </span>
            </div>

            <!-- شبكة بطاقات المحافظ مع الشعارات الرسمية المخزنة بقاعدة البيانات -->
            <div v-if="walletProviders.length > 0" class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              <button
                v-for="provider in walletProviders"
                :key="provider.id"
                type="button"
                @click="selectedWalletId = provider.id"
                class="relative flex flex-col items-center justify-center gap-2 rounded-2xl border p-3.5 transition-all text-center cursor-pointer group"
                :class="selectedWalletId === provider.id
                  ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-400/40 shadow-sm'
                  : 'border-solar-border-card bg-white hover:border-amber-300 hover:bg-solar-bg-subtle/50'"
              >
                <!-- شارة الاختيار النشط -->
                <div
                  v-if="selectedWalletId === provider.id"
                  class="absolute -top-1.5 -left-1.5 flex size-5 items-center justify-center rounded-full bg-amber-600 text-white shadow-xs"
                >
                  <Check class="size-3 stroke-[3]" />
                </div>

                <!-- الشعار المخصص المخزن في قاعدة البيانات -->
                <div class="flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 shadow-2xs border border-solar-border-card/60">
                  <img
                    v-if="provider.logo_url"
                    :src="provider.logo_url"
                    :alt="provider.name_ar"
                    class="h-full w-full object-contain transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  <Wallet v-else class="size-6 text-solar-text-muted" />
                </div>

                <!-- اسم المحفظة -->
                <div class="flex flex-col items-center">
                  <span class="text-xs font-bold text-solar-text-heading line-clamp-1">{{ provider.name_ar }}</span>
                  <span v-if="provider.name_en" class="text-[10px] text-solar-text-muted font-mono tracking-tight">{{ provider.name_en }}</span>
                </div>
              </button>
            </div>

            <!-- تنبيه توضيحي للمحفظة المختارة -->
            <div
              v-if="selectedWallet"
              class="flex items-start gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 text-xs text-amber-950"
            >
              <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-700">
                <CheckCircle2 class="size-4" />
              </div>
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold">الدفع عبر محفظة: {{ selectedWallet.name_ar }}</span>
                  <span v-if="selectedWallet.code" class="rounded bg-amber-200/80 px-1.5 py-0.5 text-[10px] font-mono font-bold text-amber-900">
                    {{ selectedWallet.code }}
                  </span>
                </div>
                <p class="text-[11px] text-amber-900/80 leading-relaxed">
                  سيتم تزويدك برقم حساب المحفظة المعتمد لدى SolarHub فور تأكيد الطلب، مع إمكانية رفع إشعار السداد مباشرة لتجهيز الشحنة والتوصيل دون أي تأخير.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- العمود الأيسر: ملخص الطلب والتأكيد (4 أعمدة) -->
      <div class="lg:col-span-4 flex flex-col gap-4">
        <div class="rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm flex flex-col gap-4">
          <h2 class="text-base font-bold text-solar-text-heading border-b border-solar-border-card pb-3">
            ملخص المشتريات
          </h2>

          <!-- قائمة مختصرة بالمنتجات -->
          <div class="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
            <div
              v-for="item in cartStore.items"
              :key="item.id || item.product.id"
              class="flex items-center justify-between gap-3 text-xs border-b border-solar-border-card/50 pb-2"
            >
              <div class="flex items-center gap-2 min-w-0">
                <span class="flex size-5 shrink-0 items-center justify-center rounded bg-solar-bg-subtle font-bold text-[10px]">
                  {{ item.quantity }}x
                </span>
                <span class="truncate font-semibold text-solar-text-heading">{{ item.product.name }}</span>
              </div>
              <span class="font-bold text-solar-navy-dark shrink-0">
                {{ Number(item.line_total ?? (item.product.price * item.quantity)).toLocaleString() }} ر.س
              </span>
            </div>
          </div>

          <!-- تفصيل المبالغ -->
          <div class="flex flex-col gap-2.5 text-xs pt-2">
            <div class="flex items-center justify-between text-solar-text-body">
              <span>المجموع الفرعي</span>
              <span class="font-bold text-solar-text-heading">{{ cartStore.subtotal.toLocaleString() }} ر.س</span>
            </div>

            <div class="flex items-center justify-between text-solar-text-body">
              <span>ضريبة القيمة المضافة (15%)</span>
              <span class="font-bold text-solar-text-heading">{{ cartStore.vat.toLocaleString() }} ر.س</span>
            </div>

            <div class="flex items-center justify-between text-solar-text-body">
              <span>رسوم الشحن والتوصيل</span>
              <span class="font-bold text-emerald-600">
                {{ cartStore.shippingFee === 0 ? 'مجاني' : `${cartStore.shippingFee} ر.س` }}
              </span>
            </div>

            <div class="border-t border-solar-border-card pt-3 flex items-baseline justify-between text-base">
              <span class="font-bold text-solar-text-heading">الإجمالي المستحق:</span>
              <div class="flex items-baseline gap-1">
                <span class="text-xl font-black text-solar-navy-dark">{{ cartStore.total.toLocaleString() }}</span>
                <span class="text-xs font-bold text-solar-text-muted">ر.س</span>
              </div>
            </div>
          </div>

          <!-- زر تأكيد الطلب -->
          <button
            type="button"
            @click="handlePlaceOrder"
            :disabled="isActionLoading || !isFormValid"
            class="btn-primary w-full h-12 text-sm gap-2 justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="isActionLoading" class="size-4 animate-spin" />
            <Lock v-else class="size-4" />
            <span>تأكيد الطلب والشحن الآن</span>
          </button>

          <!-- شارات الثقة والأمان -->
          <div class="flex flex-col gap-2 pt-3 border-t border-solar-border-card text-[11px] text-solar-text-muted">
            <div class="flex items-center gap-2">
              <ShieldCheck class="size-4 text-emerald-600 shrink-0" />
              <span>فواتير ضريبية إلكترونية معتمدة للمعدات</span>
            </div>
            <div class="flex items-center gap-2">
              <Truck class="size-4 text-blue-600 shrink-0" />
              <span>تغليف ونقل آمن وفق اشتراطات Tier 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- نافذة نجاح الطلب المنبثقة -->
    <div v-if="isSuccessModalOpen && createdOrder" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      <div class="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl z-10 text-right">
        <div class="flex flex-col items-center justify-center py-6 text-center">
          <div class="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4 animate-bounce">
            <CheckCircle2 class="size-10" />
          </div>

          <h3 class="text-xl font-black text-solar-text-heading mb-1">تم تأكيد طلبك بنجاح!</h3>
          <p class="text-xs font-bold text-solar-navy-dark mb-3">
            رقم الطلب: <span class="text-amber-600">{{ createdOrder.order_number }}</span>
          </p>

          <p class="text-xs text-solar-text-secondary max-w-xs mb-6 leading-relaxed">
            تم إرسال تفاصيل الطلب إلى المتاجر المعتمدة لبدء تجهيز المعدات وفحصها قبل التسليم لأسطول الشحن.
          </p>

          <div class="flex flex-col sm:flex-row gap-3 w-full">
            <NuxtLink
              :to="`/customer/orders/${createdOrder.id}/track`"
              class="btn-primary flex-1 text-xs py-3 justify-center gap-2"
            >
              <Truck class="size-4" />
              <span>تتبع مسار الشحنة الآن</span>
            </NuxtLink>

            <NuxtLink
              to="/customer/orders"
              class="btn-outline flex-1 text-xs py-3 justify-center"
            >
              الذهاب إلى سجل طلباتي
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
