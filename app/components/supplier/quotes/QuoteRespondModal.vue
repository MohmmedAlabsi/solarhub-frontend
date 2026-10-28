<script setup lang="ts">
import { Loader2, Send, Tag, X } from 'lucide-vue-next'
import type { SupplierQuoteItem, RespondQuoteInput } from '~/types/supplier-quote'

const props = defineProps<{
  isOpen: boolean
  quote: SupplierQuoteItem | null
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: RespondQuoteInput): void
}>()

const offeredUnitPrice = ref<number | ''>('')
const storeNotes = ref('')
const errorMessage = ref('')

watch(
  () => props.quote,
  (q) => {
    if (q) {
      offeredUnitPrice.value = q.offeredUnitPrice || q.customerTargetPrice || ''
      storeNotes.value = q.storeNotes || ''
      errorMessage.value = ''
    }
  },
  { immediate: true }
)

const calculatedTotalPrice = computed(() => {
  if (!props.quote || !offeredUnitPrice.value || Number(offeredUnitPrice.value) <= 0) return 0
  return Math.round(Number(offeredUnitPrice.value) * props.quote.requestedQuantity * 100) / 100
})

function handleSubmit() {
  errorMessage.value = ''
  if (!props.quote) return

  const price = Number(offeredUnitPrice.value)
  if (!price || price <= 0) {
    errorMessage.value = 'يرجى إدخال سعر بيع صحيح للوحدة أكبر من صفر.'
    return
  }

  emit('submit', {
    quoteId: props.quote.id,
    offeredUnitPrice: price,
    storeNotes: storeNotes.value.trim() || undefined,
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
      <div class="relative w-full max-w-lg rounded-2xl bg-white dark:bg-solar-bg-card p-5 sm:p-7 shadow-2xl transition-all border border-solar-border-card z-10 text-right max-h-[90vh] overflow-y-auto">
        <!-- Close Button -->
        <button
          type="button"
          @click="emit('close')"
          class="absolute left-5 top-5 p-1 rounded-lg text-solar-text-muted hover:text-solar-text-heading hover:bg-solar-bg-subtle transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X class="size-5" />
        </button>

        <!-- Header -->
        <div class="mb-5">
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-black text-solar-text-heading leading-tight">
              تقديم تسعير لطلب عرض السعر
            </h2>
            <span class="font-mono text-xs font-bold text-solar-yellow bg-solar-navy-dark px-2 py-0.5 rounded-md">
              {{ quote.quoteRequestNumber }}
            </span>
          </div>
          <p class="mt-1 text-xs text-solar-text-muted leading-relaxed">
            العميل: <span class="font-bold text-solar-text-heading">{{ quote.customer.name }}</span>
            <span v-if="quote.customer.phone && quote.customer.phone !== '–'" class="mr-1 font-mono">({{ quote.customer.phone }})</span>
          </p>
        </div>

        <!-- Product Summary Card -->
        <div class="rounded-xl border border-solar-border-card bg-solar-bg-subtle/60 p-3.5 mb-4 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <img
              v-if="quote.productImage"
              :src="quote.productImage"
              :alt="quote.productTitle"
              class="size-12 rounded-lg object-contain bg-white dark:bg-solar-bg-card border border-solar-border-card shrink-0 p-1"
              @error="(e) => ((e.target as HTMLImageElement).src = '/images/hero-solar.png')"
            />
            <div class="min-w-0">
              <div class="text-[10px] text-solar-text-muted font-semibold">المنتج المطلوب:</div>
              <div class="text-xs font-black text-solar-text-heading truncate">
                {{ quote.productTitle }}
              </div>
              <div class="text-[10px] font-mono text-solar-text-muted">
                {{ quote.productCode }}
              </div>
            </div>
          </div>

          <div class="shrink-0 text-left">
            <div class="text-[10px] text-solar-text-muted font-semibold">الكمية المطلوبة</div>
            <div class="text-sm font-black text-solar-text-heading font-mono">
              {{ quote.requestedQuantity }} {{ quote.unitLabel }}
            </div>
          </div>
        </div>

        <!-- Target Price Notice if available -->
        <div
          v-if="quote.customerTargetPrice"
          class="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 p-3 mb-4 text-xs"
        >
          <div class="flex items-center justify-between">
            <span class="font-bold text-amber-800 dark:text-amber-300">السعر المستهدف المقترح من العميل:</span>
            <span class="font-black font-mono text-amber-900 dark:text-amber-200">
              {{ quote.customerTargetPrice.toLocaleString('en-US') }} ر.س
            </span>
          </div>
        </div>

        <!-- Client Note Alert if available -->
        <div
          v-if="quote.customerNotes"
          class="rounded-xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 p-3 mb-5 text-xs text-solar-text-body"
        >
          <div class="font-bold text-solar-text-heading mb-1">
            ملاحظة العميل:
          </div>
          <p class="text-solar-text-muted leading-relaxed font-medium italic">
            "{{ quote.customerNotes }}"
          </p>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
          <!-- أسعار الوحدة والإجمالي -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
                سعر الوحدة المعروض (ر.س) <span class="text-red-500">*</span>
              </label>
              <div class="relative flex items-center">
                <input
                  v-model="offeredUnitPrice"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="مثال: 450"
                  class="solar-input h-11 w-full pr-3 pl-12 text-sm font-bold font-mono"
                  :class="errorMessage ? 'border-red-400' : ''"
                  required
                />
                <span class="pointer-events-none absolute left-3 text-xs font-bold text-solar-text-muted">
                  ر.س
                </span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
                إجمالي السعر للكمية ({{ quote.requestedQuantity }})
              </label>
              <div class="h-11 rounded-xl border border-solar-border-card bg-blue-50/50 dark:bg-blue-950/40 px-3.5 flex items-center justify-between text-xs font-mono font-black text-solar-navy-dark dark:text-solar-yellow">
                <span>{{ calculatedTotalPrice ? calculatedTotalPrice.toLocaleString('en-US') : 'يُحسب تلقائياً...' }}</span>
                <span class="text-solar-text-muted text-[11px]">ر.س</span>
              </div>
            </div>
          </div>

          <p v-if="errorMessage" class="text-[11px] text-red-500 font-bold -mt-2">
            {{ errorMessage }}
          </p>

          <!-- ملاحظات المورد على العرض -->
          <div>
            <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
              ملاحظات المتجر للعميل (اختياري)
            </label>
            <textarea
              v-model.trim="storeNotes"
              rows="3"
              placeholder="اكتب تفاصيل التوريد، مدة صلاحية العرض، أو شروط الضمان الإضافية..."
              class="solar-input w-full p-3 text-xs font-medium leading-relaxed resize-none"
              maxlength="1000"
            />
          </div>

          <!-- الأزرار السفلية -->
          <div class="flex items-center gap-3 pt-4 mt-1 border-t border-solar-border-card">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex items-center justify-center gap-2 rounded-xl bg-solar-yellow px-6 py-2.5 text-xs font-black text-solar-navy-dark hover:bg-solar-yellow-hover transition-all active:scale-95 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Loader2 v-if="isSubmitting" class="size-4 animate-spin" />
              <Send v-else class="size-4 stroke-[2.5]" />
              <span>إرسال وتثبيت عرض السعر</span>
            </button>

            <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2.5 text-xs font-bold text-solar-text-muted hover:text-solar-text-heading transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
