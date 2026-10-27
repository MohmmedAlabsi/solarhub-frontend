<script setup lang="ts">
import { ChevronDown, DollarSign, Info, Loader2, X } from 'lucide-vue-next'
import type { SupplierProductItem, UpdateSupplierProductInput } from '../../../types/supplier-product'

const props = defineProps<{
  isOpen: boolean
  product: SupplierProductItem | null
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: { id: number; input: UpdateSupplierProductInput }): void
}>()

const form = reactive({
  price: 0,
  stock_quantity: 0,
  min_order_qty: 1,
  warranty_period: '',
  status: 'active' as 'active' | 'inactive' | 'out_of_stock',
})

const errors = reactive({
  price: '',
  stock_quantity: '',
  min_order_qty: '',
})

watch(() => props.product, (p) => {
  if (p) {
    form.price = p.unitPrice
    form.stock_quantity = p.stockQuantity
    form.min_order_qty = p.minOrderQty
    form.warranty_period = p.warrantyPeriod || '5 سنوات'
    form.status = p.status
    clearErrors()
  }
}, { immediate: true })

function clearErrors() {
  errors.price = ''
  errors.stock_quantity = ''
  errors.min_order_qty = ''
}

function validate() {
  clearErrors()
  let valid = true

  if (form.price <= 0) {
    errors.price = 'يرجى إدخال سعر صحيح.'
    valid = false
  }

  if (form.stock_quantity < 0) {
    errors.stock_quantity = 'كمية المخزون لا يمكن أن تكون سالبة.'
    valid = false
  }

  if (form.min_order_qty < 1) {
    errors.min_order_qty = 'الحد الأدنى للطلب يجب أن يكون 1 على الأقل.'
    valid = false
  }

  return valid
}

function handleSubmit() {
  if (!props.product || !validate()) return

  emit('submit', {
    id: props.product.id,
    input: {
      price: Number(form.price),
      stock_quantity: Number(form.stock_quantity),
      min_order_qty: Number(form.min_order_qty),
      warranty_period: form.warranty_period,
      status: form.status,
    },
  })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && product"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        @click="emit('close')"
      />

      <!-- Dialog Card -->
      <div class="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-2xl transition-all border border-slate-100 z-10 text-right">
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
          <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-solar-navy border border-amber-200/60">
            <DollarSign class="size-5 text-solar-navy" />
          </span>
          <div>
            <h2 class="text-lg font-black text-slate-900 leading-tight">
              تعديل بيانات المنتج في المتجر
            </h2>
            <p class="mt-1 text-xs font-bold text-solar-navy-dark leading-relaxed truncate max-w-sm">
              {{ product.title }}
            </p>
          </div>
        </div>

        <!-- Info Notice Alert -->
        <div class="flex items-start gap-2.5 rounded-xl bg-blue-50/80 border border-blue-200/60 p-3 mb-5 text-xs text-blue-900 leading-relaxed font-medium">
          <Info class="size-4 text-blue-600 shrink-0 mt-0.5" />
          <span>ملاحظة: البيانات والمواصفات العامة للمنتج تدار مركزياً من كتالوج المنصة ولا يمكن تغييرها هنا.</span>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
          <!-- 1. السعر وكمية المخزون في صف واحد -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1.5">
                السعر الفردي (ر.س) <span class="text-red-500">*</span>
              </label>
              <div class="relative flex items-center">
                <input
                  v-model.number="form.price"
                  type="number"
                  min="0"
                  step="any"
                  class="solar-input h-11 w-full pr-3 pl-12 text-sm font-bold"
                  :class="errors.price ? 'border-red-400' : ''"
                />
                <span class="pointer-events-none absolute left-3 text-xs font-bold text-slate-400">
                  ر.س
                </span>
              </div>
              <p v-if="errors.price" class="mt-1 text-[11px] text-red-500 font-medium">
                {{ errors.price }}
              </p>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1.5">
                كمية المخزون المتوفر <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="form.stock_quantity"
                type="number"
                min="0"
                class="solar-input h-11 w-full text-sm font-bold"
                :class="errors.stock_quantity ? 'border-red-400' : ''"
              />
              <p v-if="errors.stock_quantity" class="mt-1 text-[11px] text-red-500 font-medium">
                {{ errors.stock_quantity }}
              </p>
            </div>
          </div>

          <!-- 2. الحد الأدنى للطلب وفترة الضمان -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1.5">
                الحد الأدنى للطلب <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="form.min_order_qty"
                type="number"
                min="1"
                class="solar-input h-11 w-full text-sm font-bold"
                :class="errors.min_order_qty ? 'border-red-400' : ''"
              />
              <p v-if="errors.min_order_qty" class="mt-1 text-[11px] text-red-500 font-medium">
                {{ errors.min_order_qty }}
              </p>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1.5">
                فترة الضمان <span class="text-red-500">*</span>
              </label>
              <input
                v-model.trim="form.warranty_period"
                type="text"
                placeholder="مثال: 25 سنة"
                class="solar-input h-11 w-full text-sm font-medium"
              />
            </div>
          </div>

          <!-- 3. حالة المنتج في المتجر -->
          <div>
            <label class="block text-xs font-bold text-slate-800 mb-1.5">
              حالة المنتج في المتجر
            </label>
            <div class="relative">
              <select
                v-model="form.status"
                class="solar-input h-11 w-full appearance-none pr-3.5 pl-10 cursor-pointer bg-slate-50 text-xs font-medium"
              >
                <option value="active">نشط (معروض للبيع)</option>
                <option value="inactive">غير نشط (مخفي مؤقتاً)</option>
                <option value="out_of_stock">نفد المخزون</option>
              </select>
              <ChevronDown class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            </div>
          </div>

          <!-- 4. الأزرار السفلية -->
          <div class="flex items-center gap-3 pt-5 mt-2 border-t border-slate-100">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex items-center justify-center gap-2 rounded-xl bg-solar-yellow px-6 py-2.5 text-xs font-black text-solar-navy-dark hover:bg-solar-yellow-hover transition-all active:scale-95 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Loader2 v-if="isSubmitting" class="size-4 animate-spin" />
              <span>حفظ التعديلات</span>
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
