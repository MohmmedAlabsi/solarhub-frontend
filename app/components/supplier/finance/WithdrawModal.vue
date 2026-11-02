<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <!-- الخلفية المعتمة -->
      <div
        class="fixed inset-0 bg-solar-navy-dark/70 backdrop-blur-xs transition-opacity"
        @click="$emit('close')"
      />

      <!-- بطاقة المودال -->
      <div
        class="relative w-full max-w-lg rounded-3xl bg-white dark:bg-solar-bg-card p-6 shadow-2xl border border-solar-border-card transition-all z-10 space-y-6"
      >
        <!-- الترويسة -->
        <div class="flex items-center justify-between border-b border-solar-border-card pb-4">
          <div class="flex items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-2xl bg-solar-yellow/20 text-solar-yellow-dark">
              <Wallet class="size-5" />
            </div>
            <div>
              <h3 class="text-lg font-black text-solar-text-heading">طلب سحب الأرباح</h3>
              <p class="text-xs text-solar-text-muted mt-0.5">تحويل الأرباح المستحقة إلى محفظتك الإلكترونية أو حسابك البنكي</p>
            </div>
          </div>
          <button
            type="button"
            @click="$emit('close')"
            class="flex size-8 items-center justify-center rounded-xl bg-solar-bg-subtle text-solar-text-muted hover:text-solar-text-heading transition-colors"
          >
            <X class="size-4" />
          </button>
        </div>

        <!-- معلومات الرصيد المتاح -->
        <div class="rounded-2xl bg-solar-bg-subtle p-4 border border-solar-border-card flex items-center justify-between">
          <div>
            <div class="text-xs text-solar-text-muted">الرصيد المتاح للسحب حالياً</div>
            <div class="text-xl font-black text-solar-text-heading font-mono mt-0.5">
              {{ availableBalance.toLocaleString('en-US') }} <span class="text-xs font-sans text-solar-text-muted">ر.س</span>
            </div>
          </div>
          <button
            type="button"
            @click="form.amount = availableBalance"
            class="text-xs font-bold text-solar-yellow-dark hover:underline"
          >
            سحب الكل
          </button>
        </div>

        <!-- نموذج البيانات -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- المبلغ المطلوب -->
          <div>
            <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
              المبلغ المراد سحبه (ر.س) <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model.number="form.amount"
                type="number"
                min="100"
                :max="availableBalance"
                step="any"
                required
                placeholder="أدخل المبلغ..."
                class="solar-input w-full pr-4 pl-12 py-2.5 text-sm font-mono font-bold rounded-xl"
              />
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-solar-text-muted">
                ر.س
              </span>
            </div>
            <p v-if="form.amount > availableBalance" class="text-xs text-rose-500 mt-1 font-bold">
              المبلغ المطلوب يتجاوز الرصيد المتاح للسحب.
            </p>
          </div>

          <!-- طريقة السحب -->
          <div>
            <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
              طريقة التحويل <span class="text-rose-500">*</span>
            </label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="form.method = 'wallet'"
                :class="[
                  form.method === 'wallet'
                    ? 'border-solar-yellow bg-solar-yellow/10 text-solar-navy-dark font-black'
                    : 'border-solar-border-card bg-solar-bg-subtle text-solar-text-muted font-bold',
                  'flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs transition-all',
                ]"
              >
                <Smartphone class="size-4 text-solar-yellow-dark" />
                <span>محفظة إلكترونية</span>
              </button>
              <button
                type="button"
                @click="form.method = 'bank'"
                :class="[
                  form.method === 'bank'
                    ? 'border-solar-yellow bg-solar-yellow/10 text-solar-navy-dark font-black'
                    : 'border-solar-border-card bg-solar-bg-subtle text-solar-text-muted font-bold',
                  'flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs transition-all',
                ]"
              >
                <Building2 class="size-4 text-solar-yellow-dark" />
                <span>حساب بنكي (آيبان)</span>
              </button>
            </div>
          </div>

          <!-- تفاصيل المحفظة الإلكترونية -->
          <div v-if="form.method === 'wallet'" class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
                مزود المحفظة <span class="text-rose-500">*</span>
              </label>
              <select
                v-model="form.walletProviderName"
                required
                class="solar-input w-full p-2.5 text-xs rounded-xl"
              >
                <option value="كريمي جوال (Kuraimi)">كريمي جوال (Kuraimi)</option>
                <option value="محفظة كاش (Cash)">محفظة كاش (Cash)</option>
                <option value="ون كاش (OneCash)">ون كاش (OneCash)</option>
                <option value="فلوسك (Floosak)">فلوسك (Floosak - كاك بنك)</option>
                <option value="جوالي (Jawali)">جوالي (Jawali)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
                رقم حساب المحفظة / الهاتف المسجل <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="form.accountNumber"
                type="text"
                required
                placeholder="مثال: 77XXXXXXX أو رقم الحساب"
                class="solar-input w-full p-2.5 text-xs font-mono rounded-xl"
              />
            </div>
          </div>

          <!-- تفاصيل الحساب البنكي -->
          <div v-else class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
                اسم البنك <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="form.walletProviderName"
                type="text"
                required
                placeholder="مثال: مصرف الراجحي / البنك الأهلي / بنك التضامن"
                class="solar-input w-full p-2.5 text-xs rounded-xl"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
                رقم الآيبان الدولي (IBAN) <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="form.accountNumber"
                type="text"
                required
                placeholder="SAXX XXXX XXXX XXXX XXXX XXXX"
                class="solar-input w-full p-2.5 text-xs font-mono uppercase rounded-xl"
              />
            </div>
          </div>

          <!-- اسم صاحب الحساب -->
          <div>
            <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
              اسم المستفيد المطابق للحساب <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="form.accountHolderName"
              type="text"
              required
              placeholder="الاسم الرباعي كما هو مسجل في البنك أو المحفظة"
              class="solar-input w-full p-2.5 text-xs rounded-xl"
            />
          </div>

          <!-- ملاحظات إضافية -->
          <div>
            <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
              ملاحظات للمالية (اختياري)
            </label>
            <textarea
              v-model="form.notes"
              rows="2"
              placeholder="أي تفاصيل إضافية لتسهيل عملية التحويل..."
              class="solar-input w-full p-2.5 text-xs rounded-xl resize-none"
            />
          </div>

          <!-- أزرار الإجراء -->
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-solar-border-card">
            <button
              type="button"
              @click="$emit('close')"
              class="rounded-xl border border-solar-border-card px-4 py-2.5 text-xs font-bold text-solar-text-body hover:bg-solar-bg-subtle transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              :disabled="isSubmitting || form.amount <= 0 || form.amount > availableBalance"
              class="flex items-center gap-2 rounded-xl bg-solar-yellow px-5 py-2.5 text-xs font-black text-solar-navy-dark hover:brightness-105 active:scale-95 disabled:opacity-40 transition-all cursor-pointer shadow-md"
            >
              <Loader2 v-if="isSubmitting" class="size-4 animate-spin" />
              <ArrowUpRight v-else class="size-4" />
              <span>تأكيد طلب السحب</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Wallet,
  X,
  Smartphone,
  Building2,
  ArrowUpRight,
  Loader2,
} from 'lucide-vue-next'
import type { WithdrawRequestInput } from '~/types/supplier-finance'

const props = defineProps<{
  isOpen: boolean
  availableBalance: number
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: WithdrawRequestInput): void
}>()

const form = ref<WithdrawRequestInput>({
  amount: 1000,
  method: 'wallet',
  walletProviderName: 'كريمي جوال (Kuraimi)',
  accountNumber: '',
  accountHolderName: '',
  notes: '',
})

function handleSubmit() {
  if (form.value.amount > 0 && form.value.amount <= props.availableBalance) {
    emit('submit', { ...form.value })
  }
}
</script>
