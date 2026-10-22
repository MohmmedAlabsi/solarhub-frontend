<script setup lang="ts">
import {
  Boxes,
  FolderTree,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-vue-next'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import AdminModal from '../../../components/admin/common/AdminModal.vue'
import MasterDataTabs from '../../../components/admin/master-data/MasterDataTabs.vue'
import type { Category } from '../../../../types/api'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة البيانات الأساسية — التصنيفات | لوحة الإدارة العامة' })

const {
  categories,
  isLoading,
  isActionLoading,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = useAdminMasterData()

// Non-blocking lazy SSR Data Fetching for instant navigation
const { refresh, pending } = useLazyAsyncData('admin-master-categories', () => fetchCategories(false), {
  default: () => categories.value,
})

const searchQuery = ref('')
const selectedType = ref<'all' | 'parent' | 'sub'>('all')

const isRefreshing = ref(false)

async function handleRefreshCurrentTab() {
  isRefreshing.value = true
  try {
    await fetchCategories(true)
  } finally {
    isRefreshing.value = false
  }
}

// Flatten categories for table view (parents + sub-categories)
interface FlatCategory {
  id: number
  name_ar: string
  name_en: string
  slug: string
  is_sub: boolean
  parent_id: number | null
  parent_name?: string
  icon_url?: string | null
  products_count: number
}

const flatCategories = computed<FlatCategory[]>(() => {
  const list: FlatCategory[] = []
  for (const cat of categories.value) {
    list.push({
      id: cat.id,
      name_ar: cat.name_ar,
      name_en: cat.name_en,
      slug: cat.slug || '',
      is_sub: false,
      parent_id: null,
      icon_url: cat.icon_url,
      products_count: cat.products_count ?? cat.master_products_count ?? 0,
    })

    if (Array.isArray(cat.children) && cat.children.length > 0) {
      for (const sub of cat.children) {
        list.push({
          id: sub.id,
          name_ar: sub.name_ar,
          name_en: sub.name_en,
          slug: sub.slug || '',
          is_sub: true,
          parent_id: cat.id,
          parent_name: cat.name_ar,
          icon_url: sub.icon_url,
          products_count: sub.products_count ?? sub.master_products_count ?? 0,
        })
      }
    }
  }
  return list
})

// Filtered categories
const filteredCategories = computed(() => {
  return flatCategories.value.filter((cat) => {
    // Type filter
    if (selectedType.value === 'parent' && cat.is_sub) return false
    if (selectedType.value === 'sub' && !cat.is_sub) return false

    // Search query
    if (!searchQuery.value.trim()) return true
    const q = searchQuery.value.trim().toLowerCase()
    return (
      cat.name_ar.toLowerCase().includes(q) ||
      cat.name_en.toLowerCase().includes(q) ||
      cat.slug.toLowerCase().includes(q) ||
      (cat.parent_name && cat.parent_name.toLowerCase().includes(q))
    )
  })
})

// Modal & Form State
const isModalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const editingId = ref<number | null>(null)

const form = ref({
  name_ar: '',
  name_en: '',
  slug: '',
  is_sub: false,
  parent_id: null as number | null,
  iconFile: null as File | null,
  currentIconUrl: '' as string | null,
})

// Auto-generate slug from name_en
function handleNameEnInput() {
  if (modalMode.value === 'create' && form.value.name_en) {
    form.value.slug = form.value.name_en
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
}

function openCreateModal() {
  modalMode.value = 'create'
  editingId.value = null
  form.value = {
    name_ar: '',
    name_en: '',
    slug: '',
    is_sub: false,
    parent_id: null,
    iconFile: null,
    currentIconUrl: null,
  }
  isModalOpen.value = true
}

function openEditModal(cat: FlatCategory) {
  modalMode.value = 'edit'
  editingId.value = cat.id
  form.value = {
    name_ar: cat.name_ar,
    name_en: cat.name_en,
    slug: cat.slug,
    is_sub: cat.is_sub,
    parent_id: cat.parent_id,
    iconFile: null,
    currentIconUrl: cat.icon_url || null,
  }
  isModalOpen.value = true
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    form.value.iconFile = target.files[0]
  }
}

async function handleSaveCategory() {
  if (!form.value.name_ar || !form.value.name_en || !form.value.slug) return

  const formData = new FormData()
  formData.append('name_ar', form.value.name_ar.trim())
  formData.append('name_en', form.value.name_en.trim())
  formData.append('slug', form.value.slug.trim())

  if (form.value.is_sub && form.value.parent_id) {
    formData.append('parent_id', String(form.value.parent_id))
  }

  if (form.value.iconFile) {
    formData.append('icon', form.value.iconFile)
  }

  try {
    if (modalMode.value === 'create') {
      await createCategory(formData)
    } else if (editingId.value) {
      await updateCategory(editingId.value, formData)
    }
    isModalOpen.value = false
  } catch {
    /* error handled by composable */
  }
}

// Delete Confirmation
const isDeleteModalOpen = ref(false)
const categoryToDelete = ref<FlatCategory | null>(null)

function confirmDelete(cat: FlatCategory) {
  categoryToDelete.value = cat
  isDeleteModalOpen.value = true
}

async function executeDelete() {
  if (!categoryToDelete.value) return
  const success = await deleteCategory(categoryToDelete.value.id)
  if (success) {
    isDeleteModalOpen.value = false
    categoryToDelete.value = null
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- عنوان الصفحة الرئيسي والموجّه -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-solar-text-heading">إدارة البيانات الأساسية</h1>
        <p class="text-xs sm:text-sm text-solar-text-muted mt-1">
          إدارة وضبط شجرة التصنيفات الرئيسية والفرعية المعتمدة للمنتجات والكتالوج الكهروضوئي المرجعي.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="handleRefreshCurrentTab"
          :disabled="isRefreshing || pending || isLoading"
          class="btn-outline h-10 px-4 text-xs font-bold gap-2 text-solar-text-body hover:bg-solar-bg-subtle"
          title="تحديث بيانات التصنيفات من السيرفر"
        >
          <RefreshCw class="size-4" :class="{ 'animate-spin': isRefreshing || pending || isLoading }" />
          <span>تحديث</span>
        </button>

        <button
          type="button"
          @click="openCreateModal"
          class="btn-primary h-10 px-5 text-xs font-bold gap-2 bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md"
        >
          <Plus class="size-4" />
          <span>إضافة تصنيف جديد</span>
        </button>
      </div>
    </div>

    <!-- شريط التبويبات الأفقي للبيانات الأساسية -->
    <MasterDataTabs />

    <!-- كارد شجرة التصنيفات -->
    <div class="solar-card p-5 sm:p-7">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-solar-border-card/60 pb-5">
        <div class="flex items-center gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-navy text-white">
            <FolderTree class="size-5" />
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-black text-solar-text-heading">شجرة التصنيفات (رئيسية وفرعية)</h2>
            <p class="text-xs text-solar-text-muted">
              إجمالي التصنيفات المعتمدة: {{ flatCategories.length }} تصنيف
            </p>
          </div>
        </div>

        <!-- فلاتر والبحث -->
        <div class="flex flex-wrap items-center gap-2.5">
          <div class="relative min-w-[200px] sm:min-w-[260px]">
            <Search class="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="البحث بالاسم أو الرابط..."
              class="solar-input h-10 pr-9 pl-4 text-xs w-full"
            />
          </div>

          <select v-model="selectedType" class="solar-input h-10 text-xs px-3 min-w-[130px]">
            <option value="all">جميع الأنواع</option>
            <option value="parent">رئيسية فقط</option>
            <option value="sub">فرعية فقط</option>
          </select>
        </div>
      </div>

      <!-- حالة التحميل -->
      <div v-if="pending && flatCategories.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 class="size-8 text-solar-navy animate-spin mb-3" />
        <p class="text-xs font-bold text-solar-text-muted">جاري تحميل التصنيفات من السيرفر...</p>
      </div>

      <!-- جدول التصنيفات -->
      <div v-else class="mt-6 overflow-x-auto rounded-xl border border-solar-border-card/80">
        <table class="w-full text-right text-xs">
          <thead class="bg-solar-bg-subtle/70 text-solar-text-muted font-bold border-b border-solar-border-card">
            <tr>
              <th class="py-3.5 px-4 font-bold text-center w-12">#</th>
              <th class="py-3.5 px-4 font-bold">اسم التصنيف (عربي / ENGLISH)</th>
              <th class="py-3.5 px-4 font-bold text-center">نوع التصنيف</th>
              <th class="py-3.5 px-4 font-bold">التصنيف الرئيسي التابع له</th>
              <th class="py-3.5 px-4 font-bold font-mono">كود الرابط (SLUG)</th>
              <th class="py-3.5 px-4 font-bold text-center">المنتجات المرتبطة</th>
              <th class="py-3.5 px-4 font-bold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-solar-border-card/60">
            <tr
              v-for="(item, idx) in filteredCategories"
              :key="item.id"
              class="transition-colors hover:bg-solar-bg-subtle/30"
            >
              <!-- رقم السجل أو الأيقونة -->
              <td class="py-3.5 px-4 text-center">
                <div v-if="item.icon_url" class="size-8 mx-auto rounded-lg overflow-hidden border border-solar-border-card/70 bg-white flex items-center justify-center p-1">
                  <img :src="item.icon_url" :alt="item.name_ar" class="max-h-full max-w-full object-contain" />
                </div>
                <span v-else class="text-solar-text-muted font-mono text-[11px]">{{ idx + 1 }}</span>
              </td>

              <!-- اسم التصنيف -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-2.5">
                  <span v-if="item.is_sub" class="text-solar-text-muted text-sm pr-2">↳</span>
                  <div>
                    <p class="font-extrabold text-solar-text-heading text-sm">{{ item.name_ar }}</p>
                    <p class="text-[11px] text-solar-text-muted font-sans" dir="ltr">{{ item.name_en }}</p>
                  </div>
                </div>
              </td>

              <!-- نوع التصنيف -->
              <td class="py-3.5 px-4 text-center">
                <span
                  class="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-black"
                  :class="!item.is_sub ? 'bg-solar-navy text-white' : 'bg-sky-100 text-sky-800'"
                >
                  {{ !item.is_sub ? 'رئيسي' : 'فرعي' }}
                </span>
              </td>

              <!-- التصنيف الرئيسي -->
              <td class="py-3.5 px-4 text-solar-text-body font-medium">
                {{ item.parent_name || '—' }}
              </td>

              <!-- SLUG -->
              <td class="py-3.5 px-4 font-mono font-bold text-solar-navy-dark">
                {{ item.slug }}
              </td>

              <!-- المنتجات المرتبطة -->
              <td class="py-3.5 px-4 text-center font-bold text-solar-text-body">
                <span class="rounded-lg bg-solar-bg-subtle px-2.5 py-1 text-xs">
                  {{ item.products_count }} منتج
                </span>
              </td>

              <!-- الإجراءات -->
              <td class="py-3.5 px-4 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    @click="openEditModal(item)"
                    class="flex size-8 items-center justify-center rounded-lg text-solar-text-body hover:bg-solar-bg-subtle hover:text-amber-600 transition-colors"
                    title="تعديل التصنيف"
                  >
                    <Pencil class="size-4" />
                  </button>
                  <button
                    type="button"
                    @click="confirmDelete(item)"
                    class="flex size-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                    title="حذف التصنيف"
                  >
                    <Trash2 class="size-4" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredCategories.length === 0">
              <td colspan="7" class="py-12 text-center text-solar-text-muted">
                لا توجد تصنيفات مطابقة لمعايير البحث الحالية.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- نافذة إضافة / تعديل تصنيف -->
    <AdminModal
      v-model="isModalOpen"
      :title="modalMode === 'create' ? 'إضافة تصنيف جديد' : 'تعديل التصنيف'"
      :subtitle="modalMode === 'create' ? 'إضافة تصنيف رئيسي أو فرعي لشجرة المنتجات والكتالوج' : 'تحديث بيانات ومسمى التصنيف في النظام'"
      :icon="Boxes"
      max-width="lg"
    >
      <form @submit.prevent="handleSaveCategory" class="flex flex-col gap-4">
        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">الاسم بالعربية *</label>
          <input
            v-model="form.name_ar"
            type="text"
            required
            placeholder="مثال: ألواح كهروضوئية أحادية البلورة"
            class="solar-input h-11 text-xs w-full"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">الاسم بالإنجليزية (ENGLISH) *</label>
          <input
            v-model="form.name_en"
            type="text"
            required
            @input="handleNameEnInput"
            placeholder="Monocrystalline Solar Panels"
            dir="ltr"
            class="solar-input h-11 text-xs text-right w-full"
          />
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label class="block text-xs font-bold text-solar-text-body mb-1.5">نوع التصنيف</label>
            <select v-model="form.is_sub" class="solar-input h-11 text-xs w-full">
              <option :value="false">تصنيف رئيسي</option>
              <option :value="true">تصنيف فرعي</option>
            </select>
          </div>

          <div v-if="form.is_sub">
            <label class="block text-xs font-bold text-solar-text-body mb-1.5">التصنيف الرئيسي التابع له *</label>
            <select v-model="form.parent_id" required class="solar-input h-11 text-xs w-full">
              <option :value="null" disabled>اختر التصنيف الرئيسي</option>
              <option
                v-for="c in categories.filter(x => !editingId || x.id !== editingId)"
                :key="c.id"
                :value="c.id"
              >
                {{ c.name_ar }} ({{ c.name_en }})
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">كود الرابط الموحد (SLUG) *</label>
          <input
            v-model="form.slug"
            type="text"
            required
            placeholder="monocrystalline-panels"
            dir="ltr"
            class="solar-input h-11 text-xs font-mono text-right w-full"
          />
        </div>

        <!-- رفع أيقونة التصنيف -->
        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">أيقونة أو رمز التصنيف</label>
          <div class="flex items-center gap-3">
            <div v-if="form.currentIconUrl" class="size-11 shrink-0 rounded-lg border border-solar-border-card p-1 bg-solar-bg-subtle flex items-center justify-center">
              <img :src="form.currentIconUrl" alt="icon preview" class="max-h-full max-w-full object-contain" />
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              @change="handleFileChange"
              class="solar-input h-11 text-xs py-2 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-solar-navy file:text-white"
            />
          </div>
          <p class="text-[11px] text-solar-text-muted mt-1">امتدادات مسموحة: SVG, PNG, JPG (حتى 1 ميغابايت).</p>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-solar-border-card mt-2">
          <button
            type="button"
            @click="isModalOpen = false"
            :disabled="isActionLoading"
            class="btn-outline h-10 px-5 text-xs font-bold"
          >
            إلغاء
          </button>
          <button
            type="submit"
            :disabled="isActionLoading"
            class="btn-primary h-10 px-6 text-xs font-bold gap-2 bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md"
          >
            <Loader2 v-if="isActionLoading" class="size-4 animate-spin" />
            <span>{{ modalMode === 'create' ? 'حفظ التصنيف' : 'حفظ التعديلات' }}</span>
          </button>
        </div>
      </form>
    </AdminModal>

    <!-- نافذة تأكيد الحذف -->
    <AdminModal
      v-model="isDeleteModalOpen"
      title="تأكيد حذف التصنيف"
      subtitle="يرجى الانتباه إلى تأثير حذف التصنيف على شجرة الكتالوج"
      :icon="Trash2"
      max-width="md"
    >
      <div class="flex flex-col gap-4">
        <p class="text-xs text-solar-text-body leading-relaxed">
          هل أنت متأكد من رغبتك في حذف التصنيف
          <strong class="text-rose-600 font-black">"{{ categoryToDelete?.name_ar }}"</strong>؟
          إذا كان هذا التصنيف يحتوي على تصنيفات فرعية أو منتجات مرتبطة، فسيتم رفض العملية من قبل النظام لحماية البيانات.
        </p>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-solar-border-card">
          <button
            type="button"
            @click="isDeleteModalOpen = false"
            :disabled="isActionLoading"
            class="btn-outline h-10 px-5 text-xs font-bold"
          >
            تراجع
          </button>
          <button
            type="button"
            @click="executeDelete"
            :disabled="isActionLoading"
            class="btn-primary h-10 px-6 text-xs font-bold gap-2 bg-rose-600 text-white hover:bg-rose-700 shadow-md"
          >
            <Loader2 v-if="isActionLoading" class="size-4 animate-spin" />
            <span>نعم، حذف التصنيف</span>
          </button>
        </div>
      </div>
    </AdminModal>
  </div>
</template>
