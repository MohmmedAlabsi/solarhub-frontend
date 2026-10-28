<script setup lang="ts">
import {
  Ban,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  User,
  X,
  XCircle,
} from 'lucide-vue-next'
import type { SupplierOrderItem, SupplierOrderStatus } from '~/types/supplier-order'

const props = defineProps<{
  isOpen: boolean
  order: SupplierOrderItem | null
  isUpdating?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updateStatus', status: SupplierOrderStatus, notes?: string): void
}>()

const orderNotes = ref('')
const isNotesOpen = ref(false)

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      orderNotes.value = props.order?.notes || ''
      isNotesOpen.value = false
    }
  }
)

function handleImageError(e: Event) {
  const target = e.target as HTMLImageElement
  target.src = '/images/product-panel.png'
}

function handleAction(status: SupplierOrderStatus) {
  emit('updateStatus', status, orderNotes.value.trim() || undefined)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && order"
      class="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <!-- الخلفية المعتمة -->
      <div
        class="fixed inset-0 bg-solar-navy-dark/70 backdrop-blur-xs transition-opacity"
        @click="emit('close')"
      />

      <!-- بطاقة المودال -->
      <div
        class="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-solar-bg-card p-5 sm:p-7 shadow-2xl transition-all border border-solar-border-card z-10 text-right max-h-[92vh] overflow-y-auto space-y-5"
      >
        <!-- زر الإغلاق -->
        <button
          type="button"
          @click="emit('close')"
          class="absolute left-5 top-5 flex size-8 items-center justify-center rounded-xl bg-solar-bg-subtle text-solar-text-muted hover:text-solar-text-heading transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X class="size-4" />
        </button>

        <!-- الترويسة -->
        <div class="flex items-start gap-3.5 border-b border-solar-border-card pb-4">
          <div class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow">
            <Truck class="size-6 stroke-[2.2]" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-black text-solar-text-heading leading-tight">
                تفاصيل طلب الشراء والتوصيل
              </h2>
              <span
                class="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-solar-bg-subtle border border-solar-border-card text-solar-text-heading"
              >
                {{ order.orderNumber }}
              </span>
            </div>
            <p class="mt-0.5 text-xs text-solar-text-muted leading-relaxed">
              المعلومات الفنية والمالية للشحنة وعناوين التسليم المعتمدة في المنصة
            </p>
          </div>
        </div>

        <!-- معلومات العميل ووجهة الشحن -->
        <div class="rounded-2xl border border-solar-border-card bg-solar-bg-subtle p-4 space-y-3">
          <div class="flex items-center justify-between border-b border-solar-border-card/60 pb-2 text-xs">
            <div class="flex items-center gap-1.5 font-bold text-solar-text-heading">
              <User class="size-3.5 text-solar-yellow-dark" />
              <span>بيانات العميل المستلم:</span>
              <span class="font-black text-solar-navy-dark dark:text-solar-yellow">{{ order.clientName }}</span>
            </div>
            <div class="flex items-center gap-1.5 font-bold font-mono text-solar-text-muted" dir="ltr">
              <Phone class="size-3 text-solar-text-muted" />
              <span>{{ order.clientPhone }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span class="text-[11px] font-bold text-solar-text-muted">عنوان وجهة الشحن:</span>
              <div class="mt-0.5 font-extrabold text-solar-text-heading flex items-start gap-1">
                <MapPin class="size-3.5 shrink-0 text-rose-500 mt-0.5" />
                <span>{{ order.deliveryAddress }}</span>
              </div>
            </div>

            <div>
              <span class="text-[11px] font-bold text-solar-text-muted">نطاق المحافظة وتاريخ الطلب:</span>
              <div class="mt-0.5 font-bold text-solar-text-heading flex items-center gap-2">
                <span class="inline-flex rounded-lg bg-solar-bg-card px-2 py-0.5 text-[11px] border border-solar-border-card">
                  {{ order.governorate || 'شامل' }}
                </span>
                <span class="text-xs text-solar-text-muted font-normal">({{ order.createdAt }})</span>
              </div>
            </div>
          </div>
        </div>

        <!-- قائمة المنتجات المطلوبة وصورها -->
        <div>
          <div class="flex items-center justify-between text-xs font-bold text-solar-text-heading mb-2">
            <div class="flex items-center gap-1.5">
              <FileText class="size-3.5 text-solar-yellow-dark" />
              <span>المنتجات والكميات المطلوبة من متجرك</span>
            </div>
            <span class="text-[11px] font-bold text-solar-text-muted">
              {{ order.items.length }} بنود مطلوبة
            </span>
          </div>

          <div class="overflow-x-auto rounded-2xl border border-solar-border-card">
            <table class="w-full text-right text-xs">
              <thead class="bg-solar-bg-subtle text-solar-text-muted border-b border-solar-border-card text-[11px] font-bold">
                <tr>
                  <th class="py-3 px-3">المنتج والمواصفات</th>
                  <th class="py-3 px-3 text-center">الكمية</th>
                  <th class="py-3 px-3 text-center">سعر الوحدة</th>
                  <th class="py-3 px-3 text-center">الإجمالي</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-solar-border-card bg-white dark:bg-solar-bg-card">
                <tr v-for="item in order.items" :key="item.id">
                  <td class="py-3 px-3">
                    <div class="flex items-center gap-2.5">
                      <div class="size-11 shrink-0 rounded-xl bg-solar-bg-subtle p-0.5 border border-solar-border-card flex items-center justify-center overflow-hidden">
                        <img
                          :src="item.image || '/images/product-panel.png'"
                          :alt="item.title"
                          @error="handleImageError"
                          class="h-full w-full object-contain"
                        />
                      </div>
                      <div class="min-w-0">
                        <div class="font-black text-solar-text-heading leading-tight truncate max-w-xs">
                          {{ item.title }}
                        </div>
                        <div class="mt-0.5 text-[10px] text-solar-text-muted font-mono flex items-center gap-2">
                          <span>{{ item.referenceNumber }}</span>
                          <span v-if="item.warrantyLabel">• {{ item.warrantyLabel }}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-3 text-center font-black font-mono text-solar-text-heading">
                    {{ item.quantity }} {{ item.unitLabel }}
                  </td>
                  <td class="py-3 px-3 text-center font-bold font-mono text-solar-text-muted">
                    {{ item.unitPrice.toLocaleString('en-US') }} <span class="text-[10px]">ر.س</span>
                  </td>
                  <td class="py-3 px-3 text-center font-black font-mono text-solar-text-heading">
                    {{ item.totalPrice.toLocaleString('en-US') }} <span class="text-[10px] font-normal text-solar-text-muted">ر.س</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ملخص الحسابات المالية لحصة المتجر -->
        <div class="rounded-2xl border border-solar-border-card bg-solar-bg-subtle p-4 space-y-2 text-xs">
          <div class="flex items-center justify-between text-solar-text-muted">
            <span>إجمالي المنتجات (غير شامل الضريبة):</span>
            <span class="font-bold font-mono text-solar-text-heading">{{ order.subtotal.toLocaleString('en-US') }} ر.س</span>
          </div>
          <div class="flex items-center justify-between text-solar-text-muted">
            <span>ضريبة القيمة المضافة (15%):</span>
            <span class="font-bold font-mono text-solar-text-heading">{{ order.taxAmount.toLocaleString('en-US') }} ر.س</span>
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-solar-border-card text-sm font-black text-solar-text-heading">
            <span>الإجمالي المستحق لمتجرك:</span>
            <span class="text-base text-solar-navy-dark dark:text-solar-yellow font-mono">{{ order.totalStoreShare.toLocaleString('en-US') }} ر.س</span>
          </div>
        </div>

        <!-- حقل الملاحظات إذا أراد المتجر إضافة ملاحظات -->
        <div v-if="isNotesOpen" class="space-y-1.5">
          <label class="block text-xs font-bold text-solar-text-heading">
            ملاحظات الشحنة والتوصيل (اختياري):
          </label>
          <textarea
            v-model="orderNotes"
            rows="2"
            placeholder="أدخل أي ملاحظات حول التجهيز أو أسباب الرفض..."
            class="solar-input w-full p-2.5 text-xs rounded-xl resize-none"
          />
        </div>

        <!-- الأزرار والإجراءات التشغيلية وفق حالة الطلب -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-solar-border-card">
          <!-- أزرار الإجراءات للطلبات المعلقة -->
          <div v-if="order.status === 'pending'" class="flex items-center gap-2.5">
            <button
              type="button"
              :disabled="isUpdating"
              @click="handleAction('accepted')"
              class="flex items-center gap-2 rounded-xl bg-solar-yellow px-5 py-2.5 text-xs font-black text-solar-navy-dark hover:brightness-105 active:scale-95 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Loader2 v-if="isUpdating" class="size-4 animate-spin" />
              <Check v-else class="size-4 stroke-[3]" />
              <span>قبول الطلب وتجهيز الشحنة</span>
            </button>

            <button
              type="button"
              :disabled="isUpdating"
              @click="handleAction('rejected')"
              class="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <XCircle class="size-4" />
              <span>رفض الطلب</span>
            </button>
          </div>

          <!-- زر تأكيد الشحن للطلبات المقبولة -->
          <div v-else-if="order.status === 'accepted'" class="flex items-center gap-2.5">
            <button
              type="button"
              :disabled="isUpdating"
              @click="handleAction('shipped')"
              class="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white hover:bg-blue-700 active:scale-95 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Loader2 v-if="isUpdating" class="size-4 animate-spin" />
              <Truck v-else class="size-4" />
              <span>تأكيد شحن الطلب وتزويد التتبع</span>
            </button>

            <button
              type="button"
              :disabled="isUpdating"
              @click="handleAction('cancelled')"
              class="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Ban class="size-4" />
              <span>إلغاء الطلب</span>
            </button>
          </div>

          <!-- زر تأكيد التسليم للطلبات المشحونة -->
          <div v-else-if="order.status === 'shipped'" class="flex items-center gap-2.5">
            <button
              type="button"
              :disabled="isUpdating"
              @click="handleAction('delivered')"
              class="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-700 active:scale-95 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Loader2 v-if="isUpdating" class="size-4 animate-spin" />
              <CheckCircle2 v-else class="size-4" />
              <span>تأكيد تسليم الشحنة للعميل</span>
            </button>
          </div>

          <!-- شارة إتمام التسليم للطلبات المكتملة -->
          <div v-else-if="order.status === 'delivered' || order.status === 'completed'" class="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 class="size-4.5" />
            <span>تم تسليم الشحنة للعميل بنجاح</span>
          </div>

          <!-- شارة الطلب الملغي أو المرفوض -->
          <div v-else class="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400">
            <XCircle class="size-4.5" />
            <span>الطلب مغلق ({{ order.status === 'rejected' ? 'مرفوض' : 'ملغي' }})</span>
          </div>

          <div class="flex items-center gap-2 mr-auto">
            <button
              v-if="!isNotesOpen && (order.status === 'pending' || order.status === 'accepted')"
              type="button"
              @click="isNotesOpen = true"
              class="text-xs font-bold text-solar-yellow-dark hover:underline cursor-pointer"
            >
              + إضافة ملاحظة
            </button>

            <button
              type="button"
              @click="emit('close')"
              class="rounded-xl border border-solar-border-card px-4 py-2 text-xs font-bold text-solar-text-body hover:bg-solar-bg-subtle transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
