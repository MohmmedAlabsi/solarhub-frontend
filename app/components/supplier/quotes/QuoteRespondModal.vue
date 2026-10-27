<script setup lang="ts">
import { Loader2, Send, SunMedium, X } from 'lucide-vue-next'
import type { SupplierQuoteItem, RespondQuoteInput } from '../../../types/supplier-quote'

const props = defineProps<{
  isOpen: boolean
  quote: SupplierQuoteItem | null
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: RespondQuoteInput): void
}>()

const unitPrice = ref<number>(0)
const supplierNotes = ref('')
const validityDays = ref(14)
const errorMessage = ref('')

watch(() => props.quote, (q) => {
  if (q) {
    unitPrice.value = q.quotedUnitPrice || 0
    supplierNotes.value = q.supplierNotes || ''
    errorMessage.value = ''
  }
}, { immediate: true })

const totalPrice = computed(() => {
  if (!props.quote || !unitPrice.value || unitPrice.value <= 0) return 0
  return unitPrice.value * props.quote.requestedQuantity
})

function handleSubmit() {
  errorMessage.value = ''
  if (!props.quote) return

  if (unitPrice.value <= 0) {
    errorMessage.value = 'يرجى إدخال سعر بيع صحيح أكبر من 0.'
    return
  }

  emit('submit', {
    quoteId: props.quote.id,
    unitPrice: Number(unitPrice.value),
    totalPrice: Number(totalPrice.value),
    supplierNotes: supplierNotes.value.trim(),
    validityDays: validityDays.value,
  })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && quote"
      class="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        @click="emit('close')"
      />

      <!-- Dialog Card -->
      <div class="relative w-full max-w-lg rounded-2xl bg-white p-5 sm:p-7 shadow-2xl transition-all border border-slate-100 z-10 text-right max-h-[90vh] overflow-y-auto">
        <!-- Close Button -->
        <button
          type="button"
          @click="emit('close')"
          class="absolute left-5 top-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X class="size-5" />
        </button>

        <!-- Header -->
        <div class="mb-5">
          <h2 class="text-lg font-black text-slate-900 leading-tight">
            تقديم تسعير لطلب عرض السعر
          </h2>
          <p class="mt-1 text-xs text-slate-500 leading-relaxed">
            إدخال السعر وملاحظات المورد الخاصة بالطلب ({{ quote.quoteRequestNumber }})
          </p>
        </div>

        <!-- Product Summary Card -->
        <div class="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 mb-4 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100/80 text-solar-navy border border-amber-200/50">
              <SunMedium class="size-4 text-solar-yellow stroke-[2.5]" />
            </span>
            <div>
              <div class="text-[10px] text-slate-400 font-semibold">المنتج المطلوب:</div>
              <div class="text-xs font-black text-slate-900 line-clamp-1">
                {{ quote.productTitle }}
              </div>
            </div>
          </div>

          <div class="shrink-0 text-left">
            <div class="text-[10px] text-slate-400 font-semibold">الكمية المطلوبة</div>
            <div class="text-xs font-black text-slate-900">
              {{ quote.requestedQuantity }} {{ quote.unitLabel }}
            </div>
          </div>
        </div>

        <!-- Client Note Alert -->
        <div class="rounded-xl border border-blue-100 bg-blue-50/50 p-3 mb-5 text-xs text-slate-700">
          <div class="font-bold text-slate-900 mb-1 flex items-center gap-1">
            <span>ملاحظة العميل الواردة:</span>
          </div>
          <p class="text-slate-600 leading-relaxed font-medium italic">
            "{{ quote.clientNotes }}"
          </p>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
          <!-- أسعار الوحدة والإجمالي -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1.5">
                سعر الوحدة المعروض (ر.س) <span class="text-red-500">*</span>
              </label>
              <div class="relative flex items-center">
                <input
                  v-model.number="unitPrice"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="أدخل سعر اللوح الواحد بدون ضريبة..."
                  class="solar-input h-11 w-full pr-3 pl-12 text-sm font-bold"
                  :class="errorMessage ? 'border-red-400' : ''"
                />
                <span class="pointer-events-none absolute left-3 text-xs font-bold text-slate-400">
                  ر.س
                </span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1.5">
                إجمالي السعر المعروض ({{ quote.requestedQuantity }} {{ quote.unitLabel }})
              </label>
              <div class="h-11 rounded-xl border border-slate-200 bg-blue-50/50 px-3.5 flex items-center justify-between text-xs font-mono font-bold text-blue-950">
                <span>{{ totalPrice ? totalPrice.toLocaleString('en-US') : 'يُحسب تلقائياً...' }}</span>
                <span class="text-slate-500">ر.س</span>
              </div>
            </div>
          </div>

          <p v-if="errorMessage" class="text-[11px] text-red-500 font-bold -mt-2">
            {{ errorMessage }}
          </p>

          <!-- ملاحظات المورد على العرض -->
          <div>
            <label class="block text-xs font-bold text-slate-800 mb-1.5">
              ملاحظات المورد على العرض
            </label>
            <textarea
              v-model.trim="supplierNotes"
              rows="3"
              placeholder="السعر يشمل شهادة المطابقة وشهادة الضمان المصنعي والتوصيل للموقع المذكور..."
              class="solar-input w-full p-3 text-xs font-medium leading-relaxed resize-none"
            />
          </div>

          <!-- الأزرار السفلية -->
          <div class="flex items-center gap-3 pt-4 mt-1 border-t border-slate-100">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex items-center justify-center gap-2 rounded-xl bg-solar-yellow px-6 py-2.5 text-xs font-black text-solar-navy-dark hover:bg-solar-yellow-hover transition-all active:scale-95 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Loader2 v-if="isSubmitting" class="size-4 animate-spin" />
              <Send v-else class="size-4 stroke-[2.5]" />
              <span>إرسال عرض السعر للعميل</span>
            </button>

            <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
