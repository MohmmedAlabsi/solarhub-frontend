<script setup lang="ts">
import { CheckCircle2, Send, X } from 'lucide-vue-next'
import type { Product } from '~~/types/ecommerce'

interface RfqSubmission {
  product: Product | null
  quantity: number
  notes: string
  city: string
}

const props = defineProps<{
  product: Product | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submitted', rfqData: RfqSubmission): void
}>()

const quantity = ref(1)
const notes = ref('')
const projectCity = ref('الرياض')
const isSubmitted = ref(false)

function submitRfq() {
  isSubmitted.value = true
  setTimeout(() => {
    emit('submitted', {
      product: props.product,
      quantity: quantity.value,
      notes: notes.value,
      city: projectCity.value,
    })
    isSubmitted.value = false
    emit('close')
  }, 1600)
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
          <h3 class="text-lg font-bold text-solar-text-heading">{{ product?.name }}</h3>
          <p class="text-xs text-solar-text-muted">المورد المعتمد: {{ product?.storeName }}</p>
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
            <label class="text-xs font-semibold text-solar-text-body">موقع المشروع / المدينة:</label>
            <select v-model="projectCity" class="solar-input">
              <option value="الرياض">الرياض</option>
              <option value="جدة">جدة</option>
              <option value="الدمام">الدمام</option>
              <option value="القصيم">القصيم</option>
              <option value="المدينة المنورة">المدينة المنورة</option>
            </select>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-solar-text-body">ملاحظات واحتياجات فنية إضافية (اختياري):</label>
          <textarea
            v-model="notes"
            rows="3"
            placeholder="مثال: بحاجة إلى دراسة توافق مع انفرتر هجين، أو توفير كابلات تيار مستمر..."
            class="solar-input resize-none"
          />
        </div>

        <div class="mt-2 flex gap-3">
          <button
            type="button"
            @click="submitRfq"
            class="btn-primary flex-1 gap-2"
          >
            <Send class="size-4" />
            <span>إرسال طلب السعر للمورد</span>
          </button>
          <button
            type="button"
            @click="emit('close')"
            class="btn-outline px-4"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

