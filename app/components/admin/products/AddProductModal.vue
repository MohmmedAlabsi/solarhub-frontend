<script setup lang="ts">
import {
  Boxes,
  Check,
  FileCheck,
  FileText,
  Plus,
  Sliders,
  Star,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-vue-next'
import AdminModal from '../common/AdminModal.vue'
import type { AdminProduct } from '../../../../types/admin'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', product: AdminProduct): void
}>()

const form = ref({
  name: '',
  category: 'الألواح الكهروضوئية (Solar PV Panels)',
  categoryType: 'panel' as const,
  brand: 'Jinko Solar',
  modelNumber: '',
  status: 'active' as 'active' | 'inactive',
  description: '',
  datasheetName: 'Jinko_Tiger_Pro_585W_Datasheet_Rev2.pdf',
  datasheetSize: '1.8 ميغابايت • تم التحقق الفني',
  featuredImageIndex: 0,
})

const dynamicSpecs = ref<Array<{ key: string; value: string; unit: string }>>([
  { key: 'القدرة القصوى (Pmax)', value: '585', unit: 'واط (W)' },
  { key: 'كفاءة اللوح (Module Efficiency)', value: '21.4', unit: '%' },
  { key: 'جهد الدائرة المفتوحة (Voc)', value: '50.15', unit: 'فولت (V)' },
  { key: 'تيار القصر (Isc)', value: '14.28', unit: 'أمبير (A)' },
])

const isSubmitting = ref(false)
const successMsg = ref('')

function addSpec() {
  dynamicSpecs.value.push({ key: '', value: '', unit: '' })
}

function removeSpec(index: number) {
  dynamicSpecs.value.splice(index, 1)
}

function handleSubmit() {
  if (!form.value.name || !form.value.modelNumber) return
  isSubmitting.value = true
  setTimeout(() => {
    isSubmitting.value = false
    successMsg.value = 'تمت إضافة المنتج بنجاح إلى الكتالوج المرجعي!'
    emit('created', {
      id: String(Date.now()),
      name: form.value.name,
      subtitle: form.value.description || 'منتج معتمد مطابق للمواصفات',
      category: form.value.category.split(' ')[0],
      categoryType: form.value.categoryType,
      brand: form.value.brand,
      modelNumber: form.value.modelNumber,
      status: form.value.status,
      datasheet: form.value.datasheetName,
      images: ['/images/product-panel.png'],
      featuredImageIndex: 0,
    })
    setTimeout(() => {
      successMsg.value = ''
      emit('update:modelValue', false)
    }, 1200)
  }, 700)
}
</script>

<template>
  <AdminModal
    :model-value="modelValue"
    title="إضافة منتج جديد للكتالوج المرجعي"
    subtitle="تعريف المواصفات القياسية للمنتج المرجعي لإتاحته للموردين في المنصة"
    :icon="Boxes"
    max-width="3xl"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form @submit.prevent="handleSubmit" class="flex flex-col gap-6">
      <!-- 1. البيانات الأساسية -->
      <section class="flex flex-col gap-4">
        <div class="flex items-center gap-2 text-sm font-bold text-solar-text-heading border-b border-solar-border-card/60 pb-2">
          <span class="flex size-6 items-center justify-center rounded-md bg-solar-yellow/20 text-solar-navy-dark text-xs font-black">1</span>
          <h4>البيانات الأساسية للمنتج</h4>
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">
            اسم المنتج المرجعي <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="مثال: لوح شمسي مونوكريستالين Jinko Tiger Pro 585W ثنائي الوجه"
            class="solar-input h-11 text-xs"
          />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-xs font-bold text-solar-text-body mb-1.5">
              التصنيف <span class="text-rose-500">*</span>
            </label>
            <select v-model="form.category" class="solar-input h-11 text-xs">
              <option value="الألواح الكهروضوئية (Solar PV Panels)">الألواح الكهروضوئية (Solar PV Panels)</option>
              <option value="الإنفرترات والمحولات (Inverters)">الإنفرترات والمحولات (Inverters)</option>
              <option value="بطاريات التخزين (Solar Batteries)">بطاريات التخزين (Solar Batteries)</option>
              <option value="مضخات المياه الشمسية (Solar Pumps)">مضخات المياه الشمسية (Solar Pumps)</option>
              <option value="منظمات الشحن (Charge Controllers)">منظمات الشحن (Charge Controllers)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-solar-text-body mb-1.5">
              العلامة التجارية (Brand) <span class="text-rose-500">*</span>
            </label>
            <select v-model="form.brand" class="solar-input h-11 text-xs">
              <option value="Jinko Solar">Jinko Solar</option>
              <option value="LONGI Solar">LONGI Solar</option>
              <option value="Deye">Deye</option>
              <option value="Huawei">Huawei</option>
              <option value="Victron Energy">Victron Energy</option>
              <option value="Growatt">Growatt</option>
              <option value="Pylontech">Pylontech</option>
              <option value="Grundfos">Grundfos</option>
            </select>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-xs font-bold text-solar-text-body mb-1.5">
              رقم الموديل (Model Number) <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="form.modelNumber"
              type="text"
              required
              placeholder="مثال: JKM585M-7RL3-TV"
              class="solar-input h-11 text-xs font-mono"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-solar-text-body mb-1.5">
              حالة تفعيل المنتج <span class="text-rose-500">*</span>
            </label>
            <div class="flex items-center gap-4 h-11 rounded-xl border border-solar-border-card px-4 bg-solar-bg-subtle/50 text-xs font-bold">
              <label class="flex items-center gap-2 cursor-pointer text-emerald-800">
                <input
                  v-model="form.status"
                  type="radio"
                  value="active"
                  class="accent-emerald-600 size-4"
                />
                <span>مفعل (نشط بالكتالوج)</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  v-model="form.status"
                  type="radio"
                  value="inactive"
                  class="accent-slate-500 size-4"
                />
                <span>معطل (مسودة)</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">
            الوصف التعريفي المرجعي
          </label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="لوح طاقة شمسية عالي الكفاءة بتكنولوجيا الخلايا نصف المقطوعة Half-Cell وتصميم ثنائي الوجه Bifacial لتوليد طاقة إضافية من الإشعاع المنعكس."
            class="solar-input p-3 text-xs resize-y"
          />
        </div>
      </section>

      <!-- 2. ملف المواصفات الفنية المعتمد -->
      <section class="flex flex-col gap-3">
        <div class="flex items-center justify-between border-b border-solar-border-card/60 pb-2">
          <div class="flex items-center gap-2 text-sm font-bold text-solar-text-heading">
            <span class="flex size-6 items-center justify-center rounded-md bg-solar-yellow/20 text-solar-navy-dark text-xs font-black">2</span>
            <h4>ملف المواصفات الفنية المعتمد (Technical Datasheet)</h4>
          </div>
          <span class="text-[11px] text-solar-text-muted">PDF بحد أقصى 15MB</span>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/40 p-4">
          <div class="flex items-center gap-3">
            <div class="flex size-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600 font-black text-xs">
              PDF
            </div>
            <div>
              <p class="text-xs font-bold text-solar-text-heading font-mono">{{ form.datasheetName }}</p>
              <p class="text-[11px] text-solar-text-muted mt-0.5">{{ form.datasheetSize }}</p>
            </div>
          </div>
          <button
            type="button"
            class="rounded-lg border border-solar-border-card bg-white px-3 py-1.5 text-xs font-bold text-solar-text-body hover:bg-solar-bg-subtle transition-colors shadow-2xs"
          >
            تغيير الملف
          </button>
        </div>
      </section>

      <!-- 3. صور المنتج وتحديد الصورة المميزة -->
      <section class="flex flex-col gap-3">
        <div class="flex items-center justify-between border-b border-solar-border-card/60 pb-2">
          <div class="flex items-center gap-2 text-sm font-bold text-solar-text-heading">
            <span class="flex size-6 items-center justify-center rounded-md bg-solar-yellow/20 text-solar-navy-dark text-xs font-black">3</span>
            <h4>صور المنتج وتحديد الصورة المميزة</h4>
          </div>
          <span class="text-[11px] text-solar-text-muted">انقر على النجمة لاختيار الصورة الرئيسية</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <!-- الكارد 1: الصورة المميزة -->
          <div class="relative flex flex-col items-center justify-center rounded-xl border-2 border-solar-navy bg-white p-3 aspect-square shadow-sm">
            <span class="absolute top-2 right-2 rounded-md bg-solar-navy px-1.5 py-0.5 text-[9px] font-black text-white flex items-center gap-1">
              <Star class="size-2.5 fill-solar-yellow text-solar-yellow" /> المميزة
            </span>
            <img src="/images/product-panel.png" alt="لوح شمسي" class="h-20 object-contain" />
          </div>

          <!-- الكارد 2 -->
          <div class="relative flex flex-col items-center justify-center rounded-xl border border-solar-border-card bg-solar-bg-subtle p-3 aspect-square">
            <button type="button" class="absolute top-2 right-2 text-slate-400 hover:text-solar-yellow">
              <Star class="size-4" />
            </button>
            <div class="size-10 rounded-lg bg-white flex items-center justify-center text-slate-400">
              <Sliders class="size-5" />
            </div>
          </div>

          <!-- الكارد 3 -->
          <div class="relative flex flex-col items-center justify-center rounded-xl border border-solar-border-card bg-solar-bg-subtle p-3 aspect-square">
            <button type="button" class="absolute top-2 right-2 text-slate-400 hover:text-solar-yellow">
              <Star class="size-4" />
            </button>
            <div class="size-10 rounded-lg bg-white flex items-center justify-center text-slate-400">
              <FileCheck class="size-5" />
            </div>
          </div>

          <!-- الكارد 4: رفع صورة -->
          <div class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-solar-border-card bg-solar-bg-page p-3 aspect-square text-center cursor-pointer hover:border-solar-yellow hover:bg-amber-50/20 transition-all">
            <UploadCloud class="size-6 text-solar-text-muted mb-1" />
            <span class="text-xs font-bold text-solar-text-heading">رفع صورة</span>
            <span class="text-[10px] text-solar-text-muted">PNG, JPG</span>
          </div>
        </div>
      </section>

      <!-- 4. المواصفات الفنية الديناميكية -->
      <section class="flex flex-col gap-3">
        <div class="flex items-center justify-between border-b border-solar-border-card/60 pb-2">
          <div class="flex items-center gap-2 text-sm font-bold text-solar-text-heading">
            <span class="flex size-6 items-center justify-center rounded-md bg-solar-yellow/20 text-solar-navy-dark text-xs font-black">4</span>
            <h4>المواصفات الفنية الديناميكية (Dynamic Specifications)</h4>
          </div>
          <button
            type="button"
            @click="addSpec"
            class="flex items-center gap-1 rounded-lg bg-solar-navy/10 px-2.5 py-1 text-xs font-bold text-solar-navy hover:bg-solar-navy hover:text-white transition-colors"
          >
            <Plus class="size-3.5" /> إضافة مواصفة
          </button>
        </div>

        <div class="flex flex-col gap-2">
          <div
            v-for="(spec, idx) in dynamicSpecs"
            :key="idx"
            class="flex items-center gap-2 bg-solar-bg-subtle/50 p-2 rounded-xl border border-solar-border-card/60"
          >
            <input
              v-model="spec.key"
              type="text"
              placeholder="اسم المواصفة (مثال: أقصى تيار)"
              class="solar-input h-9 text-xs flex-2 bg-white"
            />
            <input
              v-model="spec.value"
              type="text"
              placeholder="القيمة (مثال: 585)"
              class="solar-input h-9 text-xs flex-1 bg-white font-mono"
            />
            <input
              v-model="spec.unit"
              type="text"
              placeholder="الوحدة (W)"
              class="solar-input h-9 text-xs w-20 bg-white"
            />
            <button
              type="button"
              @click="removeSpec(idx)"
              class="flex size-9 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
              aria-label="حذف المواصفة"
            >
              <Trash2 class="size-4" />
            </button>
          </div>
        </div>
      </section>

      <p v-if="successMsg" class="rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
        <Check class="size-4 text-emerald-600" /> {{ successMsg }}
      </p>

      <!-- الأزرار السفلية -->
      <div class="flex items-center justify-end gap-3 pt-4 border-t border-solar-border-card">
        <button
          type="button"
          @click="emit('update:modelValue', false)"
          class="btn-outline h-11 px-6 text-xs font-bold"
        >
          إلغاء التراجع
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="btn-primary h-11 px-8 text-xs font-bold bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md"
        >
          {{ isSubmitting ? 'جارٍ الحفظ...' : 'حفظ ونشر في الكتالوج' }}
        </button>
      </div>
    </form>
  </AdminModal>
</template>
