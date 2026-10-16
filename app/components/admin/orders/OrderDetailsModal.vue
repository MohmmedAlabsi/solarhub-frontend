<script setup lang="ts">
import { Clock, Info, PackageCheck, ShoppingBag, Truck } from 'lucide-vue-next'
import AdminBadge from '../common/AdminBadge.vue'
import AdminModal from '../common/AdminModal.vue'
import type { AdminOrder } from '../../../../types/admin'

const props = defineProps<{
  modelValue: boolean
  order: AdminOrder | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <AdminModal
    :model-value="modelValue"
    :title="`تفاصيل المورد والمنتجات #${order?.orderNumber || 'ORD-2025-401'}`"
    subtitle="متابعة طلبات شراء المنتجات، التوريدات، وحالات الشحن لكل مورد"
    :icon="ShoppingBag"
    max-width="3xl"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="order" class="flex flex-col gap-6">
      <!-- بطاقات مجموعات الموردين داخل الطلب -->
      <div
        v-for="(group, gIdx) in order.groups"
        :key="gIdx"
        class="rounded-2xl border border-solar-border-card bg-white p-5 shadow-sm"
      >
        <!-- رأس بطاقة المورد -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-solar-border-card/60 pb-4">
          <div class="flex items-center gap-3">
            <span class="flex size-7 items-center justify-center rounded-lg bg-solar-navy text-white text-xs font-black">
              {{ gIdx + 1 }}
            </span>
            <h4 class="text-sm sm:text-base font-extrabold text-solar-text-heading">
              {{ group.supplierName }}
            </h4>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs text-solar-text-muted">المبلغ الفرعي للمورد:</span>
            <span class="text-sm font-black text-solar-text-heading">
              {{ group.subtotal.toLocaleString() }} ر.س
            </span>
          </div>
        </div>

        <!-- تفاصيل حالة الطلب والتسليم والملاحظات -->
        <div class="mt-4 grid gap-3 sm:grid-cols-3 rounded-xl bg-solar-bg-subtle/70 p-3.5 text-xs">
          <div>
            <span class="text-solar-text-muted block mb-1">حالة الطلب لدى المورد:</span>
            <AdminBadge :status="group.status" />
          </div>

          <div>
            <span class="text-solar-text-muted block mb-1">تاريخ التسليم المتوقع:</span>
            <span class="font-bold text-solar-text-heading font-mono">{{ group.deliveryDate }}</span>
          </div>

          <div>
            <span class="text-solar-text-muted block mb-1">تأكيد العميل للاستلام:</span>
            <AdminBadge :status="group.customerConfirmation" />
          </div>
        </div>

        <!-- ملاحظات التجهيز والشحن -->
        <div v-if="group.notes" class="mt-3 flex items-start gap-2 text-xs text-solar-text-body bg-amber-50/60 border border-amber-200/50 p-2.5 rounded-lg">
          <Info class="size-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span class="font-bold text-amber-900">ملاحظات التجهيز:</span> {{ group.notes }}
          </div>
        </div>

        <!-- جدول منتجات المورد -->
        <div class="mt-4 overflow-x-auto rounded-xl border border-solar-border-card/80">
          <table class="w-full text-right text-xs">
            <thead class="bg-solar-bg-subtle/50 text-solar-text-muted font-bold border-b border-solar-border-card">
              <tr>
                <th class="py-2.5 px-3">المنتج (المرتبط بعرض المورد)</th>
                <th class="py-2.5 px-3 text-center">الكمية</th>
                <th class="py-2.5 px-3">سعر الوحدة وقت الطلب</th>
                <th class="py-2.5 px-3 text-left">إجمالي العنصر</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-solar-border-card/60">
              <tr v-for="(prod, pIdx) in group.products" :key="pIdx">
                <td class="py-3 px-3 font-bold text-solar-text-heading">
                  {{ prod.name }}
                </td>
                <td class="py-3 px-3 text-center font-bold text-solar-text-body">
                  {{ prod.quantity }}
                </td>
                <td class="py-3 px-3 font-mono font-bold text-solar-text-heading">
                  {{ prod.unitPrice.toLocaleString() }} ر.س
                </td>
                <td class="py-3 px-3 text-left font-mono font-black text-solar-navy-dark">
                  {{ prod.total.toLocaleString() }} ر.س
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- فوتر النافذة -->
    <template #footer>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-2">
          <span class="text-xs text-solar-text-muted">إجمالي مبلغ الطلب الكلي:</span>
          <span class="text-base font-black text-solar-navy-dark">
            {{ order?.totalAmount.toLocaleString() }} ر.س
          </span>
        </div>

        <button
          type="button"
          @click="close"
          class="btn-primary h-10 px-6 text-xs font-bold bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md"
        >
          إغلاق النافذة
        </button>
      </div>
    </template>
  </AdminModal>
</template>
