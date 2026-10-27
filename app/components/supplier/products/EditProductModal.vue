<script setup lang="ts">
import {
  ChevronDown,
  DollarSign,
  Info,
  Loader2,
  MapPin,
  Pencil,
  ShieldCheck,
  X,
} from 'lucide-vue-next'
import type {
  SupplierProductItem,
  GovernorateItem,
  UpdateSupplierProductInput,
} from '~/types/supplier-product'

const props = defineProps<{
  isOpen: boolean
  product: SupplierProductItem | null
  governorates: GovernorateItem[]
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
  governorate_id: null as number | null,
  status: 'active' as 'active' | 'inactive' | 'out_of_stock',
})

const errors = reactive({
  price: '',
  stock_quantity: '',
  min_order_qty: '',
})

watch(
  () => props.product,
  (p) => {
    if (p) {
      form.price = p.unitPrice
      form.stock_quantity = p.stockQuantity
      form.min_order_qty = p.minOrderQty
      form.warranty_period = p.warrantyPeriod || '5 سنوات'
      form.governorate_id = p.governorate_id || null
      form.status = p.status
      clearErrors()
    }
  },
  { immediate: true }
)

function clearErrors() {
  errors.price = ''
  errors.stock_quantity = ''
  errors.min_order_qty = ''
}

function handleImageError(e: Event) {
  const target = e.target as HTMLImageElement
  target.src = '/images/product-panel.png'
}

function validate() {
  clearErrors()
  let valid = true

  if (form.price <= 0) {
    errors.price = 'يرجى إدخال سعر بيع صحيح أكبر من 0.'
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
      governorate_id: form.governorate_id ? Number(form.governorate_id) : null,
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
        class="fixed inset-0 bg-solar-navy-dark/70 backdrop-blur-xs transition-opacity"
        @click="emit('close')"
      />

      <!-- Dialog Card -->
      <div
        class="relative w-full max-w-xl rounded-3xl bg-white dark:bg-solar-bg-card p-6 sm:p-7 shadow-2xl transition-all border border-solar-border-card z-10 text-right space-y-5"
      >
        <!-- Close Button -->
        <button
          type="button"
          @click="emit('close')"
          class="absolute left-5 top-5 flex size-8 items-center justify-center rounded-xl bg-solar-bg-subtle text-solar-text-muted hover:text-solar-text-heading transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X class="size-4" />
        </button>

        <!-- Header -->
        <div class="flex items-start gap-3.5 border-b border-solar-border-card pb-4">
          <div class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-solar-yellow/20 text-solar-navy-dark dark:text-solar-yellow">
            <Pencil class="size-5.5 stroke-[2.2]" />
          </div>
          <div>
            <h2 class="text-lg font-black text-solar-text-heading leading-tight">
              تعديل بيانات المنتج في متجرك
            </h2>
            <p class="mt-0.5 text-xs text-solar-text-muted leading-relaxed">
              تحديث الأسعار والمخزون وفترة الضمان ونطاق التوصيل
            </p>
          </div>
        </div>

        <!-- معاينة المنتج وصورته الحقيقية المجلوبة من قاعدة البيانات -->
        <div class="rounded-2xl border border-solar-border-card bg-solar-bg-subtle p-3.5 flex items-center gap-3.5">
          <div class="size-16 shrink-0 rounded-xl bg-white dark:bg-solar-bg-card p-1 border border-solar-border-card flex items-center justify-center overflow-hidden">
            <img
              :src="product.image || '/images/product-panel.png'"
              :alt="product.title"
              @error="handleImageError"
              class="h-full w-full object-contain"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-xs font-black text-solar-text-heading leading-snug line-clamp-2">
              {{ product.title }}
            </div>
            <div class="flex items-center gap-2 mt-1 text-[11px] text-solar-text-muted">
              <span class="font-mono">{{ product.sku }}</span>
              <span>•</span>
              <span class="font-bold text-solar-yellow-dark">{{ product.brand }}</span>
              <span>•</span>
              <span>{{ product.category }}</span>
            </div>
          </div>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- 1. السعر وكمية المخزون في صف واحد -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
                السعر الفردي للبيع (ر.س) <span class="text-rose-500">*</span>
              </label>
              <div class="relative flex items-center">
                <input
                  v-model.number="form.price"
                  type="number"
                  min="0"
                  step="any"
                  class="solar-input h-11 w-full pr-3 pl-12 text-sm font-black font-mono rounded-xl"
                  :class="errors.price ? 'border-rose-400' : ''"
                />
                <span class="pointer-events-none absolute left-3 text-xs font-bold text-solar-text-muted">
                  ر.س
                </span>
              </div>
              <p v-if="errors.price" class="mt-1 text-[11px] text-rose-500 font-bold">
                {{ errors.price }}
              </p>
            </div>

            <div>
              <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
                الكمية المتوفرة بالمخزون <span class="text-rose-500">*</span>
              </label>
              <input
                v-model.number="form.stock_quantity"
                type="number"
                min="0"
                class="solar-input h-11 w-full text-sm font-black font-mono rounded-xl"
                :class="errors.stock_quantity ? 'border-rose-400' : ''"
              />
              <p v-if="errors.stock_quantity" class="mt-1 text-[11px] text-rose-500 font-bold">
                {{ errors.stock_quantity }}
              </p>
            </div>
          </div>

          <!-- 2. الحد الأدنى للطلب وفترة الضمان -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
                الحد الأدنى للطلب (الكمية) <span class="text-rose-500">*</span>
              </label>
              <input
                v-model.number="form.min_order_qty"
                type="number"
                min="1"
                class="solar-input h-11 w-full text-sm font-black font-mono rounded-xl"
                :class="errors.min_order_qty ? 'border-rose-400' : ''"
              />
              <p v-if="errors.min_order_qty" class="mt-1 text-[11px] text-rose-500 font-bold">
                {{ errors.min_order_qty }}
              </p>
            </div>

            <div>
              <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
                فترة الضمان المقدمة <span class="text-rose-500">*</span>
              </label>
              <input
                v-model.trim="form.warranty_period"
                type="text"
                placeholder="مثال: 25 سنة، 5 سنوات"
                class="solar-input h-11 w-full text-xs font-bold rounded-xl"
              />
            </div>
          </div>

          <!-- 3. نطاق التغطية / المحافظة وحالة العرض -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
                نطاق التوصيل / المحافظة
              </label>
              <div class="relative">
                <select
                  v-model="form.governorate_id"
                  class="solar-input h-11 w-full appearance-none pr-3.5 pl-10 cursor-pointer text-xs font-bold rounded-xl"
                >
                  <option :value="null">كافة المحافظات (توصيل شامل)</option>
                  <option v-for="gov in governorates" :key="gov.id" :value="gov.id">
                    {{ gov.name_ar }}
                  </option>
                </select>
                <ChevronDown class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-solar-text-heading mb-1.5">
                حالة المنتج في المتجر
              </label>
              <div class="relative">
                <select
                  v-model="form.status"
                  class="solar-input h-11 w-full appearance-none pr-3.5 pl-10 cursor-pointer text-xs font-bold rounded-xl"
                >
                  <option value="active">نشط (معروض للبيع)</option>
                  <option value="inactive">غير نشط (مخفي مؤقتاً)</option>
                  <option value="out_of_stock">نفد المخزون</option>
                </select>
                <ChevronDown class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
              </div>
            </div>
          </div>

          <!-- 4. الأزرار السفلية -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-solar-border-card">
            <button
              type="button"
              @click="emit('close')"
              class="rounded-xl border border-solar-border-card px-4 py-2.5 text-xs font-bold text-solar-text-body hover:bg-solar-bg-subtle transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex items-center justify-center gap-2 rounded-xl bg-solar-yellow px-6 py-2.5 text-xs font-black text-solar-navy-dark hover:brightness-105 transition-all active:scale-95 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Loader2 v-if="isSubmitting" class="size-4 animate-spin" />
              <span>حفظ التعديلات في قاعدة البيانات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
