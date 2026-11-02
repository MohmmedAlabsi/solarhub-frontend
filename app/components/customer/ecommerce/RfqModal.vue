<script setup lang="ts">
import { AlertCircle, CheckCircle2, Loader2, Send, X } from 'lucide-vue-next'
import { useCustomerProducts } from '~~/app/composables/useCustomerProducts'

interface RfqSubmission {
  product: any
  quantity: number
  notes: string
  targetPrice?: number | null
}

const props = defineProps<{
  product: any
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submitted', rfqData: RfqSubmission): void
}>()

const { sendQuoteRequest, isActionLoading } = useCustomerProducts()

const quantity = ref(1)
const notes = ref('')
const targetPrice = ref<number | null>(null)
const isSubmitted = ref(false)
const errorMessage = ref<string | null>(null)

watch(() => props.isOpen, (open) => {
  if (open) {
    quantity.value = props.product?.minOrderQty || 1
    notes.value = ''
    targetPrice.value = null
    isSubmitted.value = false
    errorMessage.value = null
  }
})

async function submitRfq() {
  if (!props.product) return

  const storeProductId = props.product.storeProductId || props.product.id
  errorMessage.value = null

  try {
    await sendQuoteRequest({
      store_product_id: Number(storeProductId),
      quantity: quantity.value,
      customer_target_price: targetPrice.value,
      customer_notes: notes.value,
    })

    isSubmitted.value = true
    emit('submitted', {
      product: props.product,
      quantity: quantity.value,
      notes: notes.value,
      targetPrice: targetPrice.value,
    })

    setTimeout(() => {
      isSubmitted.value = false
      emit('close')
    }, 2000)
  } catch (err: any) {
    console.error('Failed to submit quote request:', err)
    errorMessage.value = err?.userMessage || err?.data?.message || err?.message || 'حدث خطأ أثناء إرسال طلب عرض السعر، يرجى التأكد من تسجيل الدخول والمحاولة لاحقاً.'
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- خلفية معتمة -->
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')" />

    <!-- محتوى النافذة المنبثقة -->
    <div class="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl z-10 text-right">
      <button
        type="button"
        @click="emit('close')"
        class="absolute top-5 left-5 text-solar-text-muted hover:text-solar-text-heading"
      >
        <X class="size-5" />
      </button>

      <!-- حالة النجاح -->
      <div v-if="isSubmitted" class="flex flex-col items-center justify-center py-8 text-center">
        <div class="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4 animate-bounce">
          <CheckCircle2 class="size-10" />
        </div>
        <h3 class="text-xl font-bold text-solar-text-heading mb-2">تم إرسال طلب عرض السعر بنجاح!</h3>
        <p class="text-sm text-solar-text-secondary max-w-xs">
          سيقوم المورد أو الوكيل المعتمد بالرد على طلبك بعرض سعر مخصص ومواصفات فنية خلال أقل من 24 ساعة.
        </p>
      </div>

      <!-- نموذج الطلب -->
      <div v-else class="flex flex-col gap-4">
        <div class="flex flex-col gap-1 border-b border-solar-border-card pb-4">
          <span class="text-xs font-bold text-amber-600">طلب عرض سعر مخصص (RFQ)</span>
          <h3 class="text-lg font-bold text-solar-text-heading">{{ product?.name || product?.title }}</h3>
          <p class="text-xs text-solar-text-muted">المورد المعتمد: {{ product?.storeName || 'الوكيل المعتمد' }}</p>
        </div>

        <!-- رسالة الخطأ إن وجدت -->
        <div v-if="errorMessage" class="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          <AlertCircle class="size-4 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-solar-text-body">الكمية المطلوبة (بالوحدات):</label>
            <input
              v-model.number="quantity"
              type="number"
              min="1"
              class="solar-input"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-solar-text-body">السعر المستهدف للوحدة (اختياري):</label>
            <input
              v-model.number="targetPrice"
              type="number"
              min="0"
              placeholder="مثال: 450 ر.س"
              class="solar-input"
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-solar-text-body">ملاحظات واحتياجات فنية إضافية (اختياري):</label>
          <textarea
            v-model="notes"
            rows="3"
            placeholder="حدد أي تفاصيل هندسية، اشتراطات التركيب، أو متطلبات الفاتورة والضمان..."
            class="solar-input resize-none"
          />
        </div>

        <div class="flex items-center justify-end gap-3 pt-2 border-t border-solar-border-card">
          <button
            type="button"
            @click="emit('close')"
            class="btn-outline text-xs px-4 py-2.5"
            :disabled="isActionLoading"
          >
            إلغاء
          </button>

          <button
            type="button"
            @click="submitRfq"
            class="btn-primary text-xs px-6 py-2.5 gap-2"
            :disabled="isActionLoading"
          >
            <Loader2 v-if="isActionLoading" class="size-4 animate-spin" />
            <Send v-else class="size-4" />
            <span>إرسال الطلب للمورد</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
