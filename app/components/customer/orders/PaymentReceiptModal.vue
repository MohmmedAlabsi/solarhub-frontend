<script setup lang="ts">
import { CheckCircle2, Loader2, Upload, X } from 'lucide-vue-next'

/**
 * رفع إيصال الدفع لطلب قائم (كل الطلبات مدفوعة مسبقاً: محفظة إلكترونية أو حوالة بنكية).
 * يُستخدم من صفحة طلبات العميل حتى لو أُغلقت نافذة النجاح بعد إتمام الطلب، وبعد رفض إيصال سابق.
 */
const props = defineProps<{
  modelValue: boolean
  order: { id: number; order_number: string; total_amount: number | string } | null
  /** المبلغ المتبقي غير المغطى بدفعات معتمدة أو قيد المراجعة */
  remaining: number
  walletProviders: { id: number; name_ar: string; is_active?: boolean }[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submitted'): void
}>()

const { $api } = useNuxtApp()
const method = ref<'wallet' | 'bank_transfer'>('wallet')
const walletId = ref<number | null>(null)
const reference = ref('')
const file = ref<File | null>(null)
const isSubmitting = ref(false)
const error = ref('')
const done = ref(false)

watch(() => props.modelValue, (open) => {
  if (!open) return
  method.value = 'wallet'
  walletId.value = props.walletProviders.find(w => w.is_active !== false)?.id ?? null
  reference.value = ''
  file.value = null
  error.value = ''
  done.value = false
})

// قائمة المحافظ قد تصل بعد فتح النافذة: اختر أول محفظة فعّالة تلقائياً
watch(() => props.walletProviders, (list) => {
  if (!walletId.value) walletId.value = list.find(w => w.is_active !== false)?.id ?? null
})

function close() {
  if (!isSubmitting.value) emit('update:modelValue', false)
}

function onFile(e: Event) {
  file.value = (e.target as HTMLInputElement).files?.[0] || null
}

async function submit() {
  if (!props.order) return
  if (!file.value) {
    error.value = 'يرجى اختيار صورة أو ملف PDF لإيصال الدفع.'
    return
  }
  if (method.value === 'wallet' && !walletId.value) {
    error.value = 'يرجى اختيار المحفظة الإلكترونية التي دفعت منها.'
    return
  }
  isSubmitting.value = true
  error.value = ''
  try {
    const form = new FormData()
    form.append('order_id', String(props.order.id))
    form.append('amount', String(props.remaining))
    if (method.value === 'wallet' && walletId.value) form.append('wallet_provider_id', String(walletId.value))
    if (reference.value.trim()) form.append('transaction_reference', reference.value.trim())
    form.append('receipt', file.value)
    await $api('/order_payments', { method: 'POST', body: form })
    done.value = true
    emit('submitted')
  } catch (err: any) {
    error.value = err?.data?.message || 'تعذر رفع إيصال الدفع، حاول مرة أخرى.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue && order" class="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl" role="dialog" aria-modal="true" :aria-label="`رفع إيصال الدفع للطلب ${order.order_number}`">
      <div class="fixed inset-0 bg-black/60 backdrop-blur-xs" @click="close" />
      <div class="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-solar-border-card flex flex-col gap-4 text-right">
        <button type="button" class="absolute left-4 top-4 rounded-lg p-1 text-solar-text-muted hover:bg-solar-bg-subtle" aria-label="إغلاق" @click="close">
          <X class="size-4" />
        </button>
        <div>
          <h3 class="text-base font-bold text-solar-text-heading">رفع إيصال الدفع</h3>
          <p class="mt-1 text-xs text-solar-text-muted">
            الطلب <span class="font-bold text-solar-text-heading">#{{ order.order_number }}</span> —
            المبلغ المطلوب: <span class="font-bold text-amber-700">{{ remaining.toLocaleString('ar-YE') }} ر.ي</span>
          </p>
        </div>

        <div v-if="done" class="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700" role="status">
          <CheckCircle2 class="size-4 shrink-0" />
          <span>تم رفع الإيصال وهو الآن قيد المراجعة من الإدارة. لن يُشحن الطلب قبل اعتماد الدفعة.</span>
        </div>

        <form v-else class="flex flex-col gap-3" @submit.prevent="submit">
          <fieldset class="grid grid-cols-2 gap-2">
            <legend class="mb-1 text-xs font-bold text-solar-text-heading">طريقة الدفع</legend>
            <label class="flex items-center gap-2 rounded-xl border p-3 text-xs font-bold cursor-pointer" :class="method === 'wallet' ? 'border-amber-500 bg-amber-50/40' : 'border-solar-border-card'">
              <input v-model="method" type="radio" value="wallet" class="accent-amber-600" />
              محفظة إلكترونية
            </label>
            <label class="flex items-center gap-2 rounded-xl border p-3 text-xs font-bold cursor-pointer" :class="method === 'bank_transfer' ? 'border-amber-500 bg-amber-50/40' : 'border-solar-border-card'">
              <input v-model="method" type="radio" value="bank_transfer" class="accent-amber-600" />
              حوالة بنكية
            </label>
          </fieldset>

          <label v-if="method === 'wallet'" class="flex flex-col gap-1 text-xs font-bold text-solar-text-heading">
            المحفظة
            <select v-model="walletId" class="solar-input text-xs">
              <option :value="null" disabled>اختر المحفظة</option>
              <option v-for="w in walletProviders.filter(w => w.is_active !== false)" :key="w.id" :value="w.id">{{ w.name_ar }}</option>
            </select>
          </label>

          <input v-model="reference" type="text" maxlength="150" placeholder="رقم العملية / المرجع (اختياري)" class="solar-input text-xs" />

          <label class="flex flex-col gap-1 text-xs font-bold text-solar-text-heading">
            صورة الإيصال (JPG أو PNG أو PDF)
            <input type="file" accept="image/jpeg,image/png,application/pdf" class="text-xs font-normal" @change="onFile" />
          </label>

          <p v-if="error" class="text-xs font-bold text-red-600" role="alert">{{ error }}</p>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-solar-border-card">
            <button type="button" class="btn-outline h-9 px-4 text-xs font-bold" :disabled="isSubmitting" @click="close">إلغاء</button>
            <button type="submit" class="btn-primary h-9 px-5 text-xs font-bold gap-2" :disabled="isSubmitting">
              <Loader2 v-if="isSubmitting" class="size-4 animate-spin" />
              <Upload v-else class="size-4" />
              <span>{{ isSubmitting ? 'جارٍ الرفع...' : 'رفع الإيصال' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
