<script setup lang="ts">
import {
  Check,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  X,
  XCircle,
} from 'lucide-vue-next'
import type { SupplierOrderItem } from '../../../types/supplier-order'

const props = defineProps<{
  isOpen: boolean
  order: SupplierOrderItem | null
  isUpdating?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updateStatus', status: 'accepted' | 'rejected' | 'shipped' | 'delivered' | 'completed'): void
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && order"
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
      <div class="relative w-full max-w-2xl rounded-2xl bg-white p-5 sm:p-7 shadow-2xl transition-all border border-slate-100 z-10 text-right max-h-[90vh] overflow-y-auto">
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
        <div class="flex items-start gap-3.5 mb-6">
          <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-solar-navy border border-amber-200/60 shadow-2xs">
            <Truck class="size-5 text-solar-navy-dark" />
          </span>
          <div>
            <h2 class="text-lg font-black text-slate-900 leading-tight">
              بيانات التوصيل وتفاصيل الشحنة
            </h2>
            <p class="mt-1 text-xs text-slate-500 leading-relaxed">
              التفاصيل الفنية والتسليم المباشر لمشتريات المتجر (طلب {{ order.orderNumber }})
            </p>
          </div>
        </div>

        <!-- Section 1: بيانات وجهة الشحن والتواصل المعتمد -->
        <div class="mb-5">
          <div class="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
            <MapPin class="size-3.5 text-solar-navy" />
            <span>بيانات وجهة الشحن والتواصل المعتمد</span>
          </div>
          <div class="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div class="text-[11px] font-semibold text-slate-400">عنوان التسليم المعتمد:</div>
              <div class="mt-1 text-xs font-extrabold text-slate-900">
                {{ order.deliveryAddress }}
              </div>
            </div>
            <div>
              <div class="text-[11px] font-semibold text-slate-400">رقم التواصل المعتمد للطلب:</div>
              <div class="mt-1 text-xs font-bold font-mono text-slate-800" dir="ltr">
                {{ order.clientPhone }}
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: المنتجات والكميات المطلوبة -->
        <div class="mb-5">
          <div class="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <div class="flex items-center gap-1.5">
              <FileText class="size-3.5 text-solar-navy" />
              <span>المنتجات والكميات المطلوبة من متجرك بالتفصيل</span>
            </div>
            <span class="text-[11px] font-semibold text-slate-400">
              {{ order.items.length }} منتجات مطلوبة
            </span>
          </div>

          <div class="overflow-x-auto rounded-xl border border-slate-200">
            <table class="w-full text-right text-xs">
              <thead class="bg-slate-50 text-slate-500 border-b border-slate-200 text-[10px] font-bold">
                <tr>
                  <th class="py-2.5 px-3">المنتج والمواصفات</th>
                  <th class="py-2.5 px-3 text-center">الكمية</th>
                  <th class="py-2.5 px-3 text-center">سعر الوحدة</th>
                  <th class="py-2.5 px-3 text-center">الإجمالي</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                <tr v-for="item in order.items" :key="item.id">
                  <td class="py-3 px-3">
                    <div class="font-bold text-slate-900 leading-tight">
                      {{ item.title }}
                    </div>
                    <div class="mt-0.5 text-[10px] text-slate-400 font-medium">
                      الرقم المرجعي: {{ item.referenceNumber }} • {{ item.warrantyLabel }}
                    </div>
                  </td>
                  <td class="py-3 px-3 text-center font-bold text-slate-800">
                    {{ item.quantity }} {{ item.unitLabel }}
                  </td>
                  <td class="py-3 px-3 text-center font-medium text-slate-600">
                    {{ item.unitPrice.toLocaleString('en-US') }} <span class="text-[10px]">ر.س</span>
                  </td>
                  <td class="py-3 px-3 text-center font-black text-slate-900">
                    {{ item.totalPrice.toLocaleString('en-US') }} <span class="text-[10px] font-normal text-slate-500">ر.س</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section 3: ملخص الحسابات المالية -->
        <div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4 mb-6 flex flex-col gap-2 text-xs">
          <div class="flex items-center justify-between text-slate-600">
            <span>إجمالي المنتجات (غير شامل الضريبة):</span>
            <span class="font-bold font-mono">{{ order.subtotal.toLocaleString('en-US') }} ر.س</span>
          </div>
          <div class="flex items-center justify-between text-slate-600">
            <span>ضريبة القيمة المضافة (15%):</span>
            <span class="font-bold font-mono">{{ order.taxAmount.toLocaleString('en-US') }} ر.س</span>
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
            <span>الإجمالي الكلي لحصة المتجر:</span>
            <span class="text-base text-solar-navy-dark font-mono">{{ order.totalStoreShare.toLocaleString('en-US') }} ر.س</span>
          </div>
        </div>

        <!-- Section 4: الإجراءات السفلية -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div class="flex items-center gap-3">
            <!-- قبول الطلب وتجهيز الشحنة -->
            <button
              v-if="order.status === 'pending'"
              type="button"
              :disabled="isUpdating"
              @click="emit('updateStatus', 'accepted')"
              class="flex items-center gap-2 rounded-xl bg-solar-navy-dark px-5 py-2.5 text-xs font-black text-white hover:bg-slate-800 transition-all active:scale-95 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Check class="size-4" />
              <span>قبول الطلب وتجهيز الشحنة</span>
            </button>

            <!-- تأكيد شحن الطلب -->
            <button
              v-else-if="order.status === 'accepted'"
              type="button"
              :disabled="isUpdating"
              @click="emit('updateStatus', 'shipped')"
              class="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white hover:bg-blue-700 transition-all active:scale-95 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Truck class="size-4" />
              <span>تأكيد شحن الطلب</span>
            </button>

            <!-- زر رفض الطلب -->
            <button
              v-if="order.status === 'pending'"
              type="button"
              :disabled="isUpdating"
              @click="emit('updateStatus', 'rejected')"
              class="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 p-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <XCircle class="size-4" />
              <span>رفض الطلب</span>
            </button>
          </div>

          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer mr-auto"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
