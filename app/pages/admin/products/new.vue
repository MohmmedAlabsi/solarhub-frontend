<script setup lang="ts">
import {
  ArrowRight,
  Boxes,
  Check,
  FileCheck,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Sliders,
  Star,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-vue-next'
import type { Brand, Category, MasterProduct } from '../../../../types/api'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()
const {
  fetchCategories,
  fetchBrands,
  fetchMasterProduct,
  createMasterProduct,
  updateMasterProduct,
  addSpecification,
  deleteSpecification,
  uploadProductImage,
  deleteProductImage,
  markImageFeatured,
} = useAdminCatalog()

const editId = computed(() => (route.query.edit ? String(route.query.edit) : null))
const isEditMode = computed(() => Boolean(editId.value))

useSeoMeta({
  title: computed(() =>
    isEditMode.value
      ? 'تعديل بيانات المنتج المرجعي | لوحة الإدارة العامة'
      : 'إضافة منتج جديد للكتالوج المرجعي | لوحة الإدارة العامة'
  ),
})

const categories = ref<Category[]>([])
const brands = ref<Brand[]>([])
const isLoadingMeta = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMsg = ref('')

// Form state
const form = ref({
  title: '',
  category_id: '' as string | number,
  brand_id: '' as string | number,
  model_number: '',
  is_active: true,
  description: '',
})

// Datasheet file
const datasheetFile = ref<File | null>(null)
const datasheetInfo = ref<{ name: string; size: string; url?: string } | null>(null)
const datasheetInputRef = ref<HTMLInputElement | null>(null)

// Existing images from server
const existingImages = ref<Array<{ id: number; image_url: string; is_featured: boolean }>>([])

// Local newly uploaded images
interface LocalImageItem {
  id: string
  file: File
  previewUrl: string
  isFeatured: boolean
}
const localImages = ref<LocalImageItem[]>([])
const imageInputRef = ref<HTMLInputElement | null>(null)

// Dynamic specifications
interface SpecItem {
  id?: number
  name: string
  value: string
  unit: string
}
const dynamicSpecs = ref<SpecItem[]>([])

const defaultSpecs: SpecItem[] = [
  { name: 'القدرة القصوى (Pmax)', value: '585', unit: 'W' },
  { name: 'كفاءة اللوح (Module Efficiency)', value: '21.4', unit: '%' },
  { name: 'جهد الدائرة المفتوحة (Voc)', value: '50.15', unit: 'V' },
  { name: 'تيار القصر (Isc)', value: '14.28', unit: 'A' },
]

onMounted(async () => {
  isLoadingMeta.value = true
  try {
    const [catList, brandList] = await Promise.all([
      fetchCategories(),
      fetchBrands(),
    ])
    categories.value = catList
    brands.value = brandList

    if (editId.value) {
      // Load product details for editing
      const product = await fetchMasterProduct(editId.value)
      if (product) {
        form.value = {
          title: product.title || '',
          category_id: product.category?.id || product.category_id || '',
          brand_id: product.brand?.id || product.brand_id || '',
          model_number: product.model_number || '',
          is_active: !!product.is_active,
          description: product.description || '',
        }

        if (product.datasheet_url) {
          datasheetInfo.value = {
            name: `${product.model_number || 'product'}_Datasheet.pdf`,
            size: 'ملف المواصفات الفنية المعتمد (PDF)',
            url: product.datasheet_url,
          }
        }

        if (product.specifications && product.specifications.length > 0) {
          dynamicSpecs.value = product.specifications.map(s => ({
            id: s.id,
            name: s.name,
            value: s.value,
            unit: s.unit || '',
          }))
        } else {
          dynamicSpecs.value = [...defaultSpecs]
        }

        if (product.images && product.images.length > 0) {
          existingImages.value = [...product.images]
        }
      }
    } else {
      dynamicSpecs.value = [...defaultSpecs]
      if (categories.value.length > 0 && !form.value.category_id) {
        form.value.category_id = categories.value[0].id
      }
      if (brands.value.length > 0 && !form.value.brand_id) {
        form.value.brand_id = brands.value[0].id
      }
    }
  } finally {
    isLoadingMeta.value = false
  }
})

function addSpec() {
  dynamicSpecs.value.push({ name: '', value: '', unit: '' })
}

async function removeSpec(index: number) {
  const spec = dynamicSpecs.value[index]
  if (spec.id && isEditMode.value) {
    try {
      await deleteSpecification(spec.id)
    } catch {
      // ignore
    }
  }
  dynamicSpecs.value.splice(index, 1)
}

function triggerDatasheetPicker() {
  datasheetInputRef.value?.click()
}

function onDatasheetChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    datasheetFile.value = file
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2)
    datasheetInfo.value = {
      name: file.name,
      size: `${sizeInMb} ميغابايت • ملف جديد جاهز للرفع`,
    }
  }
}

function triggerImagePicker() {
  imageInputRef.value?.click()
}

function onImagesChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) {
    const files = Array.from(target.files)
    for (const file of files) {
      const isFirst = localImages.value.length === 0 && existingImages.value.length === 0
      localImages.value.push({
        id: Math.random().toString(36).substring(7),
        file,
        previewUrl: URL.createObjectURL(file),
        isFeatured: isFirst,
      })
    }
  }
}

async function setFeaturedExistingImage(imgId: number) {
  try {
    await markImageFeatured(imgId)
    existingImages.value.forEach(img => {
      img.is_featured = img.id === imgId
    })
    localImages.value.forEach(img => {
      img.isFeatured = false
    })
  } catch {
    // handled in composable
  }
}

function setFeaturedLocalImage(index: number) {
  existingImages.value.forEach(img => {
    img.is_featured = false
  })
  localImages.value.forEach((img, i) => {
    img.isFeatured = i === index
  })
}

async function removeExistingImage(index: number) {
  const img = existingImages.value[index]
  if (img?.id) {
    try {
      await deleteProductImage(img.id)
      existingImages.value.splice(index, 1)
    } catch {
      // ignore
    }
  }
}

function removeLocalImage(index: number) {
  const [removed] = localImages.value.splice(index, 1)
  if (removed?.previewUrl) {
    URL.revokeObjectURL(removed.previewUrl)
  }
}

async function handleSubmit() {
  if (!form.value.title || !form.value.category_id || !form.value.brand_id) {
    errorMessage.value = 'يرجى إدخال اسم المنتج واختيار التصنيف والعلامة التجارية.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMsg.value = ''

  try {
    const payload = new FormData()
    payload.append('title', form.value.title)
    payload.append('category_id', String(form.value.category_id))
    payload.append('brand_id', String(form.value.brand_id))
    if (form.value.model_number) {
      payload.append('model_number', form.value.model_number)
    }
    if (form.value.description) {
      payload.append('description', form.value.description)
    }
    payload.append('is_active', form.value.is_active ? '1' : '0')

    if (datasheetFile.value) {
      payload.append('datasheet', datasheetFile.value)
    }

    if (isEditMode.value && editId.value) {
      // EDIT PRODUCT
      payload.append('_method', 'PUT')
      await updateMasterProduct(editId.value, payload)

      // Add newly added dynamic specs
      const newSpecs = dynamicSpecs.value.filter(s => !s.id && s.name.trim() && s.value.trim())
      for (const spec of newSpecs) {
        try {
          await addSpecification({
            product_id: Number(editId.value),
            name: spec.name.trim(),
            value: spec.value.trim(),
            unit: spec.unit?.trim() || null,
          })
        } catch (err) {
          console.warn('Failed to add spec:', spec.name, err)
        }
      }

      // Upload newly added images
      for (const img of localImages.value) {
        try {
          await uploadProductImage(Number(editId.value), img.file, img.isFeatured)
        } catch (err) {
          console.warn('Failed to upload image:', img.file.name, err)
        }
      }

      successMsg.value = 'تم تحديث بيانات المنتج بنجاح!'
    } else {
      // CREATE PRODUCT
      const created = await createMasterProduct(payload)

      // Add specifications
      const validSpecs = dynamicSpecs.value.filter(s => s.name.trim() && s.value.trim())
      for (const spec of validSpecs) {
        try {
          await addSpecification({
            product_id: created.id,
            name: spec.name.trim(),
            value: spec.value.trim(),
            unit: spec.unit?.trim() || null,
          })
        } catch (err) {
          console.warn('Failed to upload spec:', spec.name, err)
        }
      }

      // Upload product images
      for (const img of localImages.value) {
        try {
          await uploadProductImage(created.id, img.file, img.isFeatured)
        } catch (err) {
          console.warn('Failed to upload image:', img.file.name, err)
        }
      }

      successMsg.value = 'تمت إضافة المنتج بنجاح إلى الكتالوج المرجعي!'
    }

    setTimeout(() => {
      router.push('/admin/products')
    }, 1200)
  } catch (err: any) {
    errorMessage.value = err?.data?.userMessage || 'حدث خطأ أثناء حفظ المنتج، يرجى التحقق من المدخلات.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- كارد رأس الصفحة والتنقل -->
    <div class="solar-card p-5 sm:p-7">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-solar-border-card/60 pb-5">
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/admin/products"
            class="flex size-10 items-center justify-center rounded-xl border border-solar-border-card bg-white text-solar-text-body hover:bg-solar-bg-subtle transition-colors shadow-2xs"
            title="العودة لإدارة المنتجات"
          >
            <ArrowRight class="size-5" />
          </NuxtLink>
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-solar-text-heading">
              {{ isEditMode ? `تعديل بيانات المنتج: ${form.title || 'الكتالوج المرجعي'}` : 'إضافة منتج جديد للكتالوج المرجعي' }}
            </h1>
            <p class="mt-0.5 text-xs text-solar-text-muted">
              {{ isEditMode ? 'تحديث المواصفات الفنية المعتمدة للمنتج وإدارتها في النظام' : 'تعريف المواصفات القياسية للمنتج المرجعي لإتاحته للموردين في المنصة' }}
            </p>
          </div>
        </div>

        <NuxtLink
          to="/admin/products"
          class="btn-outline h-10 px-4 text-xs font-bold self-start sm:self-auto"
        >
          إلغاء والعودة
        </NuxtLink>
      </div>

      <!-- نموذج البيانات المتكامل -->
      <form @submit.prevent="handleSubmit" class="mt-6 flex flex-col gap-8 max-w-4xl mx-auto">
        <!-- 1. البيانات الأساسية -->
        <section class="flex flex-col gap-4">
          <div class="flex items-center gap-2 text-sm font-bold text-solar-text-heading border-b border-solar-border-card/60 pb-2">
            <span class="flex size-6 items-center justify-center rounded-md bg-solar-yellow/20 text-solar-navy-dark text-xs font-black">1</span>
            <h3>البيانات الأساسية للمنتج</h3>
          </div>

          <div>
            <label class="block text-xs font-bold text-solar-text-body mb-1.5">
              اسم المنتج المرجعي <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="form.title"
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
              <select v-model="form.category_id" required class="solar-input h-11 text-xs">
                <option disabled value="">اختر التصنيف</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name_ar }} {{ cat.name_en ? `(${cat.name_en})` : '' }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-solar-text-body mb-1.5">
                العلامة التجارية (Brand) <span class="text-rose-500">*</span>
              </label>
              <select v-model="form.brand_id" required class="solar-input h-11 text-xs">
                <option disabled value="">اختر العلامة التجارية</option>
                <option v-for="b in brands" :key="b.id" :value="b.id">
                  {{ b.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="block text-xs font-bold text-solar-text-body mb-1.5">
                رقم الموديل (Model Number) <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="form.model_number"
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
                    v-model="form.is_active"
                    type="radio"
                    :value="true"
                    class="accent-emerald-600 size-4"
                  />
                  <span>مفعل (نشط بالكتالوج)</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    v-model="form.is_active"
                    type="radio"
                    :value="false"
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
              <h3>ملف المواصفات الفنية المعتمد (Technical Datasheet)</h3>
            </div>
            <span class="text-[11px] text-solar-text-muted">PDF بحد أقصى 10MB</span>
          </div>

          <input
            ref="datasheetInputRef"
            type="file"
            accept=".pdf"
            class="hidden"
            @change="onDatasheetChange"
          />

          <div
            v-if="datasheetInfo"
            class="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-4"
          >
            <div class="flex items-center gap-3">
              <div class="flex size-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600 font-black text-xs">
                PDF
              </div>
              <div>
                <p class="text-xs font-bold text-solar-text-heading font-mono">{{ datasheetInfo.name }}</p>
                <p class="text-[11px] text-solar-text-muted mt-0.5">{{ datasheetInfo.size }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <a
                v-if="datasheetInfo.url"
                :href="datasheetInfo.url"
                target="_blank"
                class="rounded-lg border border-solar-border-card bg-white px-3 py-1.5 text-xs font-bold text-solar-navy hover:bg-solar-bg-subtle transition-colors shadow-2xs"
              >
                عرض الملف الحالي
              </a>
              <button
                type="button"
                @click="triggerDatasheetPicker"
                class="rounded-lg border border-solar-border-card bg-white px-3 py-1.5 text-xs font-bold text-solar-text-body hover:bg-solar-bg-subtle transition-colors shadow-2xs"
              >
                تغيير الملف
              </button>
              <button
                type="button"
                @click="datasheetFile = null; datasheetInfo = null"
                class="rounded-lg text-rose-500 hover:bg-rose-50 p-1.5 transition-colors"
                title="إزالة الملف"
              >
                <Trash2 class="size-4" />
              </button>
            </div>
          </div>

          <div
            v-else
            @click="triggerDatasheetPicker"
            class="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-solar-border-card bg-solar-bg-subtle/40 p-6 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/20 transition-all"
          >
            <FileText class="size-8 text-amber-500" />
            <span class="text-xs font-bold text-solar-text-heading">انقر هنا لاختيار ورفع ملف المواصفات الفنية المعتمد (PDF)</span>
            <span class="text-[10px] text-solar-text-muted">الملف التقني المعتمد من الشركة المصنعة لضمان دقة البيانات المعروضة</span>
          </div>
        </section>

        <!-- 3. صور المنتج وتحديد الصورة المميزة -->
        <section class="flex flex-col gap-3">
          <div class="flex items-center justify-between border-b border-solar-border-card/60 pb-2">
            <div class="flex items-center gap-2 text-sm font-bold text-solar-text-heading">
              <span class="flex size-6 items-center justify-center rounded-md bg-solar-yellow/20 text-solar-navy-dark text-xs font-black">3</span>
              <h3>صور المنتج وتحديد الصورة المميزة</h3>
            </div>
            <span class="text-[11px] text-solar-text-muted">انقر على النجمة لاختيار الصورة الرئيسية</span>
          </div>

          <input
            ref="imageInputRef"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            class="hidden"
            @change="onImagesChange"
          />

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <!-- الصور المسجلة مسبقاً في السيرفر -->
            <div
              v-for="(img, idx) in existingImages"
              :key="'existing-' + img.id"
              class="relative flex flex-col items-center justify-center rounded-xl p-3 aspect-square group transition-all"
              :class="[
                img.is_featured
                  ? 'border-2 border-solar-navy bg-white shadow-sm ring-2 ring-amber-400/40'
                  : 'border border-solar-border-card bg-solar-bg-subtle'
              ]"
            >
              <span
                v-if="img.is_featured"
                class="absolute top-2 right-2 rounded-md bg-solar-navy px-1.5 py-0.5 text-[9px] font-black text-white flex items-center gap-1 shadow-xs"
              >
                <Star class="size-2.5 fill-solar-yellow text-solar-yellow" /> المميزة
              </span>
              <button
                v-else
                type="button"
                @click="setFeaturedExistingImage(img.id)"
                class="absolute top-2 right-2 text-slate-400 hover:text-amber-500 transition-colors p-1"
                title="تعيين كصورة مميزة"
              >
                <Star class="size-4" />
              </button>

              <button
                type="button"
                @click="removeExistingImage(idx)"
                class="absolute top-2 left-2 text-rose-500 hover:bg-rose-100/80 rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="حذف الصورة"
              >
                <Trash2 class="size-3.5" />
              </button>

              <img :src="img.image_url" alt="صورة المنتج" class="h-24 w-24 object-contain" />
            </div>

            <!-- الصور المختارة محلياً -->
            <div
              v-for="(img, idx) in localImages"
              :key="'local-' + img.id"
              class="relative flex flex-col items-center justify-center rounded-xl p-3 aspect-square group transition-all"
              :class="[
                img.isFeatured
                  ? 'border-2 border-solar-navy bg-white shadow-sm ring-2 ring-amber-400/40'
                  : 'border border-solar-border-card bg-solar-bg-subtle'
              ]"
            >
              <span
                v-if="img.isFeatured"
                class="absolute top-2 right-2 rounded-md bg-solar-navy px-1.5 py-0.5 text-[9px] font-black text-white flex items-center gap-1 shadow-xs"
              >
                <Star class="size-2.5 fill-solar-yellow text-solar-yellow" /> المميزة
              </span>
              <button
                v-else
                type="button"
                @click="setFeaturedLocalImage(idx)"
                class="absolute top-2 right-2 text-slate-400 hover:text-amber-500 transition-colors p-1"
                title="تعيين كصورة مميزة"
              >
                <Star class="size-4" />
              </button>

              <button
                type="button"
                @click="removeLocalImage(idx)"
                class="absolute top-2 left-2 text-rose-500 hover:bg-rose-100/80 rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="حذف الصورة"
              >
                <Trash2 class="size-3.5" />
              </button>

              <img :src="img.previewUrl" alt="صورة المنتج" class="h-24 w-24 object-contain" />
            </div>

            <div
              @click="triggerImagePicker"
              class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-solar-border-card bg-solar-bg-page p-4 aspect-square text-center cursor-pointer hover:border-amber-500 hover:bg-amber-50/20 transition-all"
            >
              <UploadCloud class="size-7 text-solar-text-muted mb-1.5" />
              <span class="text-xs font-bold text-solar-text-heading">رفع صورة</span>
              <span class="text-[10px] text-solar-text-muted">PNG, JPG, WebP</span>
            </div>
          </div>
        </section>

        <!-- 4. المواصفات الفنية الديناميكية -->
        <section class="flex flex-col gap-3">
          <div class="flex items-center justify-between border-b border-solar-border-card/60 pb-2">
            <div class="flex items-center gap-2 text-sm font-bold text-solar-text-heading">
              <span class="flex size-6 items-center justify-center rounded-md bg-solar-yellow/20 text-solar-navy-dark text-xs font-black">4</span>
              <h3>المواصفات الفنية الديناميكية (Dynamic Specifications)</h3>
            </div>
            <button
              type="button"
              @click="addSpec"
              class="flex items-center gap-1.5 rounded-lg bg-solar-navy/10 px-3 py-1.5 text-xs font-bold text-solar-navy hover:bg-solar-navy hover:text-white transition-colors"
            >
              <Plus class="size-3.5" /> إضافة مواصفة
            </button>
          </div>

          <p class="text-[11px] text-solar-text-muted -mt-1">
            مواصفات قياسية مرنة بحسب نوع المنتج دون حقول صلبة مسبقة (اسم المواصفة، القيمة، الوحدة)
          </p>

          <div class="flex flex-col gap-2">
            <div
              v-for="(spec, idx) in dynamicSpecs"
              :key="idx"
              class="flex items-center gap-2 bg-solar-bg-subtle/50 p-2.5 rounded-xl border border-solar-border-card/60"
            >
              <input
                v-model="spec.name"
                type="text"
                placeholder="اسم المواصفة (مثال: أقصى تيار)"
                class="solar-input h-10 text-xs flex-2 bg-white"
              />
              <input
                v-model="spec.value"
                type="text"
                placeholder="القيمة (مثال: 585)"
                class="solar-input h-10 text-xs flex-1 bg-white font-mono"
              />
              <input
                v-model="spec.unit"
                type="text"
                placeholder="الوحدة (W)"
                class="solar-input h-10 text-xs w-24 bg-white"
              />
              <button
                type="button"
                @click="removeSpec(idx)"
                class="flex size-10 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                aria-label="حذف المواصفة"
              >
                <Trash2 class="size-4" />
              </button>
            </div>
          </div>
        </section>

        <!-- التنبيهات -->
        <p v-if="errorMessage" class="rounded-xl bg-rose-50 p-3.5 text-xs font-bold text-rose-700 flex items-center gap-2 border border-rose-200">
          <X class="size-4 text-rose-600" /> {{ errorMessage }}
        </p>

        <p v-if="successMsg" class="rounded-xl bg-emerald-50 p-3.5 text-xs font-bold text-emerald-800 flex items-center gap-2 border border-emerald-200">
          <Check class="size-4 text-emerald-600" /> {{ successMsg }}
        </p>

        <!-- أزرار الإرسال -->
        <div class="flex items-center justify-end gap-3 pt-6 border-t border-solar-border-card">
          <NuxtLink
            to="/admin/products"
            class="btn-outline h-11 px-6 text-xs font-bold"
          >
            إلغاء التراجع
          </NuxtLink>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="btn-primary h-11 px-8 text-xs font-bold bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md flex items-center gap-2"
          >
            <Loader2 v-if="isSubmitting" class="size-4 animate-spin" />
            <span>{{ isSubmitting ? 'جارٍ الحفظ...' : (isEditMode ? 'حفظ التعديلات' : 'حفظ ونشر في الكتالوج') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
