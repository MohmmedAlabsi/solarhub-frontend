<script setup lang="ts">
import {
  CornerUpLeft,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Tag,
  User,
  X,
} from 'lucide-vue-next'
import type { SupplierQuoteItem } from '~/types/supplier-quote'

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
      <div class="relative w-full max-w-xl rounded-2xl bg-white dark:bg-solar-bg-card p-5 sm:p-7 shadow-2xl transition-all border border-solar-border-card z-10 text-right max-h-[90vh] overflow-y-auto">
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
        <div class="flex items-start gap-3.5 mb-5">
          <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-solar-navy border border-amber-200/60 shadow-2xs">
            <FileText class="size-5 text-solar-navy-dark dark:text-solar-yellow" />
          </span>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-black text-solar-text-heading leading-tight">
                تفاصيل طلب عرض السعر
              </h2>
              <span class="font-mono text-xs font-bold text-solar-yellow bg-solar-navy-dark px-2 py-0.5 rounded-md">
                {{ quote.quoteRequestNumber }}
              </span>
            </div>
            <p class="mt-1 text-xs text-solar-text-muted leading-relaxed">
              تاريخ تقديم الطلب: {{ quote.requestDate }}
            </p>
          </div>
        </div>

        <!-- Section 1: بيانات العميل والتواصل -->
        <div class="rounded-xl border border-solar-border-card bg-solar-bg-subtle/50 p-4 mb-4">
          <div class="flex items-center gap-1.5 text-xs font-bold text-solar-text-heading mb-3">
            <User class="size-4 text-solar-navy-dark dark:text-solar-yellow" />
            <span>بيانات العميل صاحب الطلب</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div class="bg-white dark:bg-solar-bg-card rounded-lg p-3 border border-solar-border-card">
              <div class="text-[10px] font-semibold text-solar-text-muted">اسم العميل:</div>
              <div class="mt-1 font-bold text-solar-text-heading truncate">
                {{ quote.customer.name }}
              </div>
            </div>

            <div class="bg-white dark:bg-solar-bg-card rounded-lg p-3 border border-solar-border-card">
              <div class="text-[10px] font-semibold text-solar-text-muted flex items-center gap-1">
                <Phone class="size-3" />
                <span>رقم الهاتف:</span>
              </div>
              <div class="mt-1 font-mono font-bold text-solar-text-heading dir-ltr text-right">
                {{ quote.customer.phone || '–' }}
              </div>
            </div>

            <div class="bg-white dark:bg-solar-bg-card rounded-lg p-3 border border-solar-border-card">
              <div class="text-[10px] font-semibold text-solar-text-muted flex items-center gap-1">
                <Mail class="size-3" />
                <span>البريد الإلكتروني:</span>
              </div>
              <div class="mt-1 font-medium text-solar-text-heading truncate text-[11px]">
                {{ quote.customer.email || '–' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: بيانات المنتج المطلوب -->
        <div class="rounded-xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 p-4 mb-4">
          <div class="flex items-center gap-3">
            <img
              v-if="quote.productImage"
              :src="quote.productImage"
              :alt="quote.productTitle"
              class="size-16 rounded-lg object-contain bg-white dark:bg-solar-bg-card border border-solar-border-card shrink-0 p-1"
              @error="(e) => ((e.target as HTMLImageElement).src = '/images/hero-solar.png')"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span v-if="quote.productBrand" class="rounded bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                  {{ quote.productBrand }}
                </span>
                <span v-if="quote.productCategory" class="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-solar-text-muted">
                  {{ quote.productCategory }}
                </span>
              </div>
              <div class="mt-1 font-black text-sm text-solar-text-heading truncate">
                {{ quote.productTitle }}
              </div>
              <div class="mt-0.5 text-[11px] font-mono text-solar-text-muted">
                الكود: {{ quote.productCode }}
              </div>
            </div>
          </div>

          <div class="mt-3 pt-3 border-t border-blue-200/50 dark:border-blue-900/50 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <span class="text-solar-text-muted text-[11px]">الكمية المطلوبة:</span>
              <div class="font-black text-solar-text-heading">{{ quote.requestedQuantity }} {{ quote.unitLabel }}</div>
            </div>
            <div>
              <span class="text-solar-text-muted text-[11px]">السعر الأساسي بالمتجر:</span>
              <div class="font-mono font-bold text-solar-text-heading">
                {{ quote.product.listed_price ? `${quote.product.listed_price.toLocaleString('en-US')} ر.س` : '–' }}
              </div>
            </div>
            <div>
              <span class="text-solar-text-muted text-[11px]">المحافظة / التغطية:</span>
              <div class="font-bold text-solar-text-heading">{{ quote.governorate }}</div>
            </div>
          </div>
        </div>

        <!-- Section 3: تفاصيل التسعير والأسعار المعروضة -->
        <div class="rounded-xl border border-solar-border-card bg-white dark:bg-solar-bg-card p-4 mb-4">
          <div class="text-xs font-bold text-solar-text-heading mb-3 flex items-center gap-1.5">
            <Tag class="size-4 text-solar-navy-dark dark:text-solar-yellow" />
            <span>بيانات التفاوض والأسعار</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div class="rounded-lg bg-solar-bg-subtle p-3 border border-solar-border-card">
              <div class="text-[10px] font-semibold text-solar-text-muted">السعر المستهدف من العميل:</div>
              <div class="mt-1 font-black text-sm" :class="quote.customerTargetPrice ? 'text-amber-600' : 'text-solar-text-muted'">
                {{ quote.customerTargetPrice ? `${quote.customerTargetPrice.toLocaleString('en-US')} ر.س` : 'لم يُحدد' }}
              </div>
            </div>

            <div class="rounded-lg bg-solar-bg-subtle p-3 border border-solar-border-card">
              <div class="text-[10px] font-semibold text-solar-text-muted">سعر الوحدة المعروض من المتجر:</div>
              <div class="mt-1 font-black text-sm" :class="quote.offeredUnitPrice ? 'text-blue-600' : 'text-solar-text-muted'">
                {{ quote.offeredUnitPrice ? `${quote.offeredUnitPrice.toLocaleString('en-US')} ر.س` : 'بانتظار تقديم العرض' }}
              </div>
            </div>

            <div class="rounded-lg bg-blue-50/60 dark:bg-blue-950/40 p-3 border border-blue-200/60 dark:border-blue-900/60">
              <div class="text-[10px] font-semibold text-blue-700 dark:text-blue-300">إجمالي العرض المعروض:</div>
              <div class="mt-1 font-black text-sm font-mono text-solar-navy-dark dark:text-solar-yellow">
                {{ quote.totalPrice ? `${quote.totalPrice.toLocaleString('en-US')} ر.س` : '–' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Section 4: الملاحظات -->
        <div class="space-y-3 mb-6">
          <div class="rounded-xl border border-solar-border-card bg-white dark:bg-solar-bg-card p-3.5">
            <div class="text-[11px] font-bold text-solar-text-muted mb-1">ملاحظات العميل:</div>
            <p class="text-xs text-solar-text-body font-medium leading-relaxed italic bg-solar-bg-subtle p-2.5 rounded-lg border border-solar-border-card">
              "{{ quote.customerNotes }}"
            </p>
          </div>

          <div v-if="quote.storeNotes" class="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5">
            <div class="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mb-1">ملاحظات المتجر المرسلة للعميل:</div>
            <p class="text-xs text-solar-text-heading font-medium leading-relaxed">
              {{ quote.storeNotes }}
            </p>
          </div>
        </div>

        <!-- Section 5: الإجراءات السفلية -->
        <div class="flex items-center justify-between gap-3 pt-4 border-t border-solar-border-card">
          <button
            v-if="quote.status === 'pending'"
            type="button"
            @click="emit('respond', quote)"
            class="flex items-center gap-2 rounded-xl bg-solar-yellow px-6 py-2.5 text-xs font-black text-solar-navy-dark hover:bg-solar-yellow-hover transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <span>تقديم وتعديل عرض السعر</span>
            <CornerUpLeft class="size-4 stroke-[2.5]" />
          </button>
          <span v-else />

          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2 text-xs font-bold text-solar-text-muted hover:text-solar-text-heading transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
