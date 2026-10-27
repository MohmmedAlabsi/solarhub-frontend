<script setup lang="ts">
import { CornerUpLeft, FileText, MapPin, Package, ShieldCheck, SunMedium, X } from 'lucide-vue-next'
import type { SupplierQuoteItem } from '../../../types/supplier-quote'

defineProps<{
  isOpen: boolean
  quote: SupplierQuoteItem | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'respond', quote: SupplierQuoteItem): void
}>()
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
      <div class="relative w-full max-w-xl rounded-2xl bg-white p-5 sm:p-7 shadow-2xl transition-all border border-slate-100 z-10 text-right max-h-[90vh] overflow-y-auto">
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
        <div class="flex items-start gap-3.5 mb-5">
          <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-solar-navy border border-amber-200/60 shadow-2xs">
            <FileText class="size-5 text-solar-navy-dark" />
          </span>
          <div>
            <h2 class="text-lg font-black text-slate-900 leading-tight">
              تفاصيل طلب عرض السعر
            </h2>
            <p class="mt-1 text-xs text-slate-500 leading-relaxed">
              مراجعة المواصفات الفنية وملاحظات العميل للتسعير (طلب {{ quote.quoteRequestNumber }})
            </p>
          </div>
        </div>

        <!-- Section 1: بيانات ومواصفات المنتج المطلوب -->
        <div class="rounded-xl border border-blue-100 bg-blue-50/40 p-4 mb-4">
          <div class="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
            <SunMedium class="size-4 text-solar-yellow stroke-[2.5]" />
            <span>بيانات ومواصفات المنتج المطلوب</span>
          </div>

          <div class="font-black text-sm text-slate-900">
            {{ quote.productTitle }}
          </div>
          <div class="text-[11px] font-mono text-slate-500 mt-0.5">
            كود المنتج: {{ quote.productCode }}
          </div>

          <div class="mt-3 pt-3 border-t border-blue-200/50 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600">
            <div>
              <span class="font-bold text-slate-800">القدرة والمواصفات:</span> {{ quote.productSpecs }}
            </div>
            <div>
              <span class="font-bold text-slate-800">الكفاءة والضمان:</span> {{ quote.productEfficiency }}
            </div>
          </div>
        </div>

        <!-- Section 2: تفاصيل الكمية والتسليم المحددة -->
        <div class="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 mb-4">
          <div class="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-3">
            <Package class="size-3.5 text-solar-navy" />
            <span>تفاصيل الكمية والتسليم المحددة</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-white rounded-lg p-3 border border-slate-100">
              <div class="text-[11px] font-semibold text-slate-400">الكمية المطلوبة:</div>
              <div class="mt-1 text-sm font-black text-slate-900">
                {{ quote.requestedQuantity }} {{ quote.unitLabel }}
              </div>
              <div class="text-[10px] text-slate-400">(بواقع حزمة منصة شحن قياسية)</div>
            </div>

            <div class="bg-white rounded-lg p-3 border border-slate-100">
              <div class="text-[11px] font-semibold text-slate-400">موقع التسليم المطلوب:</div>
              <div class="mt-1 text-xs font-bold text-slate-800">
                {{ quote.deliveryLocation }}
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: ملاحظات العميل -->
        <div class="rounded-xl border border-slate-200 bg-white p-4 mb-6">
          <div class="text-xs font-bold text-slate-700 mb-2">ملاحظات العميل:</div>
          <p class="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
            "{{ quote.clientNotes }}"
          </p>
        </div>

        <!-- Section 4: الإجراءات السفلية -->
        <div class="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            v-if="quote.status === 'pending'"
            type="button"
            @click="emit('respond', quote)"
            class="flex items-center gap-2 rounded-xl bg-solar-yellow px-6 py-2.5 text-xs font-black text-solar-navy-dark hover:bg-solar-yellow-hover transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <span>الانتقال للرد والتسعير</span>
            <CornerUpLeft class="size-4" />
          </button>
          <span v-else />

          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
