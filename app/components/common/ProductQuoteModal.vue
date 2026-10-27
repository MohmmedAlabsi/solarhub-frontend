<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Building2,
  Compass,
  Store,
  ShieldCheck,
  ArrowLeft,
  LogIn,
  UserPlus,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-vue-next'
import type { VisitorProduct } from '~~/app/data/visitor-mock'
import { useAuthStore } from '~~/app/stores/auth'

const props = defineProps<{
  isOpen: boolean
  product: VisitorProduct | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submitted', data: any): void
}>()

const authStore = useAuthStore()

// حالة النموذج
const quantity = ref(10)
const targetPrice = ref<number | ''>('')
const customerNotes = ref('')
const isSubmitting = ref(false)
const isSubmitted = ref(false)
const quoteRefNumber = ref('')

// إعادة تعيين النموذج عند فتح النافذة بمنتج جديد
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    quantity.value = 10
    targetPrice.value = ''
    customerNotes.value = ''
    isSubmitting.value = false
    isSubmitted.value = false
    quoteRefNumber.value = ''
  }
})

// إغلاق النافذة
function handleClose() {
  emit('close')
}

// زيادة / إنقاص الكمية
function incrementQuantity(amount = 1) {
  quantity.value = Math.max(1, (quantity.value || 0) + amount)
}

function decrementQuantity(amount = 1) {
  if (quantity.value > amount) {
    quantity.value -= amount
  } else {
    quantity.value = 1
  }
}

// إرسال طلب السعر للعميل
async function handleSubmitQuote() {
  if (!props.product) return
  isSubmitting.value = true

  try {
    // محاكاة إرسال الطلب وإصدار رقم مرجعي رسمي
    await new Promise((resolve) => setTimeout(resolve, 600))
    quoteRefNumber.value = `QR-${Math.floor(10000 + Math.random() * 90000)}`
    isSubmitted.value = true
    emit('submitted', {
      product: props.product,
      quantity: quantity.value,
      targetPrice: targetPrice.value,
      notes: customerNotes.value,
      refNumber: quoteRefNumber.value,
    })
  } finally {
    isSubmitting.value = false
  }
}

// التوجيهات
function navigateToLogin() {
  handleClose()
  const redirect = props.product ? `/products/${props.product.id}` : '/'
  navigateTo(`/auth/login?redirect=${encodeURIComponent(redirect)}`)
}

function navigateToRegister() {
  handleClose()
  navigateTo('/auth/register?role=customer')
}

function navigateToOrders() {
  handleClose()
  navigateTo('/customer/orders')
}

function navigateToSupplierDashboard() {
  handleClose()
  navigateTo('/supplier/dashboard')
}

function navigateToProductDetails() {
  if (!props.product) return
  handleClose()
  navigateTo(`/products/${props.product.id}`)
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen && product"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-modal-title"
      >
        <!-- خلفية معتمة -->
        <div
          class="fixed inset-0 bg-solar-navy-dark/75 backdrop-blur-sm transition-opacity"
          @click="handleClose"
        />

        <!-- نافذة المودال الرئيسية -->
        <div class="relative w-full max-w-lg rounded-3xl bg-solar-bg-card p-6 sm:p-7 shadow-2xl border border-solar-border-card z-10 my-8 transition-colors duration-200">
          <!-- زر الإغلاق العلوي -->
          <button
            type="button"
            @click="handleClose"
            class="absolute top-4 left-4 flex size-8 items-center justify-center rounded-xl bg-solar-bg-subtle text-solar-text-muted transition-colors hover:bg-solar-border-card hover:text-solar-text-heading"
            aria-label="إغلاق النافذة"
          >
            <X class="size-4" />
          </button>

          <!-- رأس المودال: تفاصيل المنتج المحدد -->
          <div class="flex items-center gap-3.5 pb-4 mb-5 border-b border-solar-border-card/70">
            <div class="relative size-16 shrink-0 rounded-2xl bg-solar-bg-subtle border border-solar-border-card/60 p-2 flex items-center justify-center overflow-hidden">
              <img
                :src="product.image"
                :alt="product.name"
                class="size-full object-contain"
              />
            </div>

            <div class="flex flex-col text-right flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="rounded bg-solar-yellow/20 px-2 py-0.5 text-[10px] font-black text-solar-navy-dark dark:text-solar-yellow">
                  {{ product.brand }}
                </span>
                <span class="text-[11px] text-solar-text-muted truncate">
                  {{ product.storeName }}
                </span>
              </div>
              <h3 id="quote-modal-title" class="text-xs sm:text-sm font-black text-solar-text-heading leading-snug truncate" :title="product.name">
                {{ product.name }}
              </h3>
            </div>
          </div>

          <!-- ================= الحاله 1: نجاح الإرسال للعميل ================= -->
          <div v-if="isSubmitted" class="flex flex-col items-center text-center py-4">
            <div class="size-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mb-4 shadow-sm">
              <CheckCircle2 class="size-8 stroke-[2.5]" />
            </div>

            <h3 class="text-lg font-black text-solar-text-heading mb-1.5">
              تم إرسال طلب عرض السعر بنجاح!
            </h3>
            <p class="text-xs text-solar-text-body max-w-sm mb-4 leading-relaxed">
              تم توجيه طلبك مباشرة إلى <span class="font-bold text-solar-text-heading">({{ product.storeName }})</span>. سيقوم فريق المبيعات بمراجعة الكمية والمواصفات وتقديم عرض السعر الرسمي لك.
            </p>

            <!-- بطاقة تفاصيل الطلب المرجعية -->
            <div class="w-full rounded-2xl bg-solar-bg-subtle border border-solar-border-card p-3.5 text-xs mb-6 text-right space-y-1.5">
              <div class="flex justify-between items-center">
                <span class="text-solar-text-muted">الرقم المرجعي للطلب:</span>
                <span class="font-mono font-bold text-solar-text-heading">{{ quoteRefNumber }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-solar-text-muted">الكمية المطلوبة:</span>
                <span class="font-bold text-solar-text-heading">{{ quantity }} وحدة / لوح</span>
              </div>
              <div v-if="targetPrice" class="flex justify-between items-center">
                <span class="text-solar-text-muted">السعر المقترح:</span>
                <span class="font-bold text-solar-text-heading">{{ targetPrice }} $</span>
              </div>
            </div>

            <!-- أزرار الإجراءات بعد الإرسال -->
            <div class="flex flex-col sm:flex-row gap-2.5 w-full">
              <button
                type="button"
                @click="navigateToOrders"
                class="btn-primary flex-1 py-2.5 text-xs font-black gap-2 justify-center shadow-sm"
              >
                <span>الانتقال لمتابعة طلباتي</span>
                <ArrowLeft class="size-4" />
              </button>

              <button
                type="button"
                @click="handleClose"
                class="btn-outline flex-1 py-2.5 text-xs font-bold justify-center"
              >
                <span>متابعة التصفح</span>
              </button>
            </div>
          </div>

          <!-- ================= الحاله 2: زائر غير مسجل ================= -->
          <div v-else-if="!authStore.isAuthenticated" class="flex flex-col text-center py-2">
            <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-sm">
              <FileText class="size-7" />
            </div>

            <h3 class="text-base sm:text-lg font-black text-solar-text-heading mb-2">
              طلب عرض سعر رسمي
            </h3>
            <p class="text-xs text-solar-text-muted leading-relaxed mb-6 max-w-sm mx-auto">
              لإرسال طلب عرض سعر لـ ({{ product.name }}) والتواصل مباشرة مع المورد المعتمد، يرجى تسجيل الدخول بحسابك أو إنشاء حساب عميل جديد.
            </p>

            <div class="flex flex-col gap-2.5">
              <button
                type="button"
                @click="navigateToLogin"
                class="btn-primary w-full py-2.5 text-xs font-black gap-2 justify-center shadow-sm"
              >
                <LogIn class="size-4" />
                <span>تسجيل الدخول للمتابعة</span>
              </button>

              <button
                type="button"
                @click="navigateToRegister"
                class="btn-outline w-full py-2.5 text-xs font-bold gap-2 justify-center"
              >
                <UserPlus class="size-4" />
                <span>إنشاء حساب عميل جديد</span>
              </button>
            </div>
          </div>

          <!-- ================= الحاله 3: حساب مهندس معتمد ================= -->
          <div v-else-if="authStore.userRole === 'engineer'" class="flex flex-col text-right py-2">
            <div class="flex items-center gap-3 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 mb-4">
              <Compass class="size-6 shrink-0 text-blue-500" />
              <div>
                <h4 class="text-xs font-black">حساب مهندس استشاري معتمد</h4>
                <p class="text-[11px] opacity-80">أنت مسجل حالياً بحساب مهندس مرخص</p>
              </div>
            </div>

            <p class="text-xs text-solar-text-body leading-relaxed mb-5">
              طلبات عروض الأسعار للشراء والتوريد المباشر مخصصة لحسابات العملاء والمستفيدين. بصفتك مهندساً معتمداً، يمكنك الاطلاع على المواصفات التقنية الدقيقة لهذا اللوح الشمسي واستخدامه في دراساتك ومخططاتك الهندسية.
            </p>

            <div class="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                @click="navigateToProductDetails"
                class="btn-primary flex-1 py-2.5 text-xs font-black gap-2 justify-center shadow-sm"
              >
                <FileText class="size-4" />
                <span>استعراض المواصفات الفنية الكاملة</span>
              </button>

              <button
                type="button"
                @click="handleClose"
                class="btn-outline py-2.5 px-4 text-xs font-bold justify-center"
              >
                <span>إغلاق</span>
              </button>
            </div>
          </div>

          <!-- ================= الحاله 4: حساب متجر / مورد ================= -->
          <div v-else-if="authStore.userRole === 'supplier'" class="flex flex-col text-right py-2">
            <div class="flex items-center gap-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 mb-4">
              <Store class="size-6 shrink-0 text-amber-500" />
              <div>
                <h4 class="text-xs font-black">حساب متجر ومورد معتمد</h4>
                <p class="text-[11px] opacity-80">أنت مسجل حالياً كشريك توريد</p>
              </div>
            </div>

            <p class="text-xs text-solar-text-body leading-relaxed mb-5">
              طلبات عروض الأسعار مخصصة للمشترين والعملاء. لإدارة منتجاتك، تحديث قوائم الأسعار، واستقبال طلبات عروض أسعار عملائك، يمكنك زيارة لوحة تحكم المتجر.
            </p>

            <div class="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                @click="navigateToSupplierDashboard"
                class="btn-primary flex-1 py-2.5 text-xs font-black gap-2 justify-center shadow-sm"
              >
                <Store class="size-4" />
                <span>الذهاب للوحة تحكم المتجر</span>
              </button>

              <button
                type="button"
                @click="handleClose"
                class="btn-outline py-2.5 px-4 text-xs font-bold justify-center"
              >
                <span>إغلاق</span>
              </button>
            </div>
          </div>

          <!-- ================= الحاله 5: عميل مسجل (Customer) أو أدمن ================= -->
          <form v-else @submit.prevent="handleSubmitQuote" class="flex flex-col gap-4 text-right">
            <div class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl w-fit">
              <ShieldCheck class="size-4" />
              <span>طلب سعر رسمي ومباشر للمنتج</span>
            </div>

            <!-- حقل الكمية المطلوبة -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-black text-solar-text-heading flex items-center justify-between">
                <span>الكمية المطلوبة (بالألواح / الوحدات) *</span>
                <span class="text-[10px] text-solar-text-muted">الحد الأدنى: 1</span>
              </label>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="decrementQuantity(1)"
                  class="flex size-10 items-center justify-center rounded-xl border border-solar-border-card bg-solar-bg-subtle text-solar-text-heading hover:bg-solar-border-card transition-colors select-none"
                  aria-label="إنقاص الكمية"
                >
                  <Minus class="size-4" />
                </button>

                <input
                  v-model.number="quantity"
                  type="number"
                  min="1"
                  required
                  class="solar-input flex-1 text-center font-bold font-mono h-10"
                />

                <button
                  type="button"
                  @click="incrementQuantity(1)"
                  class="flex size-10 items-center justify-center rounded-xl border border-solar-border-card bg-solar-bg-subtle text-solar-text-heading hover:bg-solar-border-card transition-colors select-none"
                  aria-label="زيادة الكمية"
                >
                  <Plus class="size-4" />
                </button>
              </div>

              <!-- أزرار الاختيار السريع للكميات -->
              <div class="flex items-center gap-1.5 pt-1">
                <span class="text-[10px] text-solar-text-muted">كميات شائعة:</span>
                <button
                  v-for="preset in [10, 20, 50, 100]"
                  :key="preset"
                  type="button"
                  @click="quantity = preset"
                  class="px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors select-none"
                  :class="quantity === preset ? 'bg-solar-yellow text-solar-navy-dark border-solar-yellow' : 'bg-solar-bg-subtle text-solar-text-body border-solar-border-card hover:border-solar-yellow'"
                >
                  {{ preset }} لوح
                </button>
              </div>
            </div>

            <!-- حقل السعر المستهدف (اختياري) -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-solar-text-heading flex items-center justify-between">
                <span>السعر المستهدف للقطعة (اختياري)</span>
                <span class="text-[10px] text-solar-text-muted">بالدولار الأمريكي ($)</span>
              </label>
              <input
                v-model.number="targetPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="مثال: 95.00 (اتركه فارغاً للحصول على أفضل سعر متاح)"
                class="solar-input text-xs h-10"
              />
            </div>

            <!-- ملاحظات العميل وموقع التسليم -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-solar-text-heading">
                ملاحظات إضافية أو مكان التسليم (اختياري)
              </label>
              <textarea
                v-model="customerNotes"
                rows="2"
                placeholder="مثال: مطلوب توريد وشحن إلى صنعاء، مع التأكيد على توافر شهادات الفحص الأصلية..."
                class="solar-input text-xs py-2 resize-none"
              ></textarea>
            </div>

            <!-- زر الإرسال -->
            <div class="flex items-center gap-2.5 pt-2">
              <button
                type="submit"
                :disabled="isSubmitting || quantity < 1"
                class="btn-primary flex-1 h-11 text-xs font-black gap-2 justify-center shadow-sm disabled:opacity-60"
              >
                <FileText class="size-4" />
                <span v-if="!isSubmitting">إرسال طلب عرض السعر</span>
                <span v-else>جاري الإرسال...</span>
              </button>

              <button
                type="button"
                @click="handleClose"
                class="btn-outline h-11 px-4 text-xs font-bold"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
