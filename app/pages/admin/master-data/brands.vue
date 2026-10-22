<script setup lang="ts">
import {
  Award,
  ExternalLink,
  Globe,
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
import type { Brand } from '../../../../types/api'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة البيانات الأساسية — العلامات التجارية | لوحة الإدارة العامة' })

const {
  brands,
  isLoading,
  isActionLoading,
  fetchBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} = useAdminMasterData()

// Non-blocking lazy SSR Data Fetching for instant navigation
const { pending } = useLazyAsyncData('admin-master-brands', () => fetchBrands(false), {
  default: () => brands.value,
})

const isRefreshing = ref(false)

async function handleRefreshCurrentTab() {
  isRefreshing.value = true
  try {
    await fetchBrands(true)
  } finally {
    isRefreshing.value = false
  }
}

const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

// Filtered brands
const filteredBrands = computed(() => {
  return brands.value.filter((b) => {
    // Status filter
    if (statusFilter.value === 'active' && !b.is_active) return false
    if (statusFilter.value === 'inactive' && b.is_active) return false

    // Search query
    if (!searchQuery.value.trim()) return true
    const q = searchQuery.value.trim().toLowerCase()
    return (
      b.name.toLowerCase().includes(q) ||
      (b.website && b.website.toLowerCase().includes(q))
    )
  })
})

// Modal & Form State
const isModalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const editingId = ref<number | null>(null)

const form = ref({
  name: '',
  website: '',
  is_active: true,
  logoFile: null as File | null,
  currentLogoUrl: '' as string | null,
})

function openCreateModal() {
  modalMode.value = 'create'
  editingId.value = null
  form.value = {
    name: '',
    website: '',
    is_active: true,
    logoFile: null,
    currentLogoUrl: null,
  }
  isModalOpen.value = true
}

function openEditModal(brand: Brand) {
  modalMode.value = 'edit'
  editingId.value = brand.id
  form.value = {
    name: brand.name,
    website: brand.website || '',
    is_active: brand.is_active !== false,
    logoFile: null,
    currentLogoUrl: brand.logo_url || null,
  }
  isModalOpen.value = true
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    form.value.logoFile = target.files[0]
  }
}

async function handleSaveBrand() {
  if (!form.value.name.trim()) return

  const formData = new FormData()
  formData.append('name', form.value.name.trim())

  if (form.value.website && form.value.website.trim()) {
    let site = form.value.website.trim()
    if (!/^https?:\/\//i.test(site)) {
      site = 'https://' + site
    }
    formData.append('website', site)
  }

  formData.append('is_active', form.value.is_active ? '1' : '0')

  if (form.value.logoFile) {
    formData.append('logo', form.value.logoFile)
  }

  try {
    if (modalMode.value === 'create') {
      await createBrand(formData)
    } else if (editingId.value) {
      await updateBrand(editingId.value, formData)
    }
    isModalOpen.value = false
  } catch {
    /* error handled by composable */
  }
}

// Delete Confirmation
const isDeleteModalOpen = ref(false)
const brandToDelete = ref<Brand | null>(null)

function confirmDelete(brand: Brand) {
  brandToDelete.value = brand
  isDeleteModalOpen.value = true
}

async function executeDelete() {
  if (!brandToDelete.value) return
  const success = await deleteBrand(brandToDelete.value.id)
  if (success) {
    isDeleteModalOpen.value = false
    brandToDelete.value = null
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- عنوان الصفحة الرئيسي -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-solar-text-heading">إدارة البيانات الأساسية</h1>
        <p class="text-xs sm:text-sm text-solar-text-muted mt-1">
          الشركات العالمية المصنعة والعلامات التجارية المعتمدة لمعدات الطاقة المتجددة.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="handleRefreshCurrentTab"
          :disabled="isRefreshing || pending || isLoading"
          class="btn-outline h-10 px-4 text-xs font-bold gap-2 text-solar-text-body hover:bg-solar-bg-subtle"
          title="تحديث بيانات العلامات التجارية من السيرفر"
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
          <span>إضافة علامة تجارية</span>
        </button>
      </div>
    </div>

    <!-- شريط التبويبات الأفقي -->
    <MasterDataTabs />

    <!-- كارد العلامات التجارية والمصنعين -->
    <div class="solar-card p-5 sm:p-7">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-solar-border-card/60 pb-5">
        <div class="flex items-center gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-navy text-white">
            <Award class="size-5" />
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-black text-solar-text-heading">العلامات التجارية والمصنعون</h2>
            <p class="text-xs text-solar-text-muted">
              إجمالي العلامات المعتمدة: {{ brands.length }} علامة تجارية
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
              placeholder="البحث بالاسم أو الموقع..."
              class="solar-input h-10 pr-9 pl-4 text-xs w-full"
            />
          </div>

          <select v-model="statusFilter" class="solar-input h-10 text-xs px-3 min-w-[130px]">
            <option value="all">جميع الحالات</option>
            <option value="active">المفعلة فقط</option>
            <option value="inactive">المعطلة فقط</option>
          </select>
        </div>
      </div>

      <!-- حالة التحميل -->
      <div v-if="pending && brands.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 class="size-8 text-solar-navy animate-spin mb-3" />
        <p class="text-xs font-bold text-solar-text-muted">جاري تحميل العلامات التجارية من السيرفر...</p>
      </div>

      <!-- جدول العلامات التجارية -->
      <div v-else class="mt-6 overflow-x-auto rounded-xl border border-solar-border-card/80">
        <table class="w-full text-right text-xs">
          <thead class="bg-solar-bg-subtle/70 text-solar-text-muted font-bold border-b border-solar-border-card">
            <tr>
              <th class="py-3.5 px-4 font-bold text-center w-16">الشعار</th>
              <th class="py-3.5 px-4 font-bold">اسم العلامة التجارية</th>
              <th class="py-3.5 px-4 font-bold">رابط الموقع الرسمي</th>
              <th class="py-3.5 px-4 font-bold text-center">المنتجات المرتبطة</th>
              <th class="py-3.5 px-4 font-bold text-center">حالة التفعيل</th>
              <th class="py-3.5 px-4 font-bold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-solar-border-card/60">
            <tr
              v-for="item in filteredBrands"
              :key="item.id"
              class="transition-colors hover:bg-solar-bg-subtle/30"
            >
              <!-- الشعار -->
              <td class="py-3.5 px-4 text-center">
                <div v-if="item.logo_url" class="size-10 mx-auto rounded-xl border border-solar-border-card/70 bg-white flex items-center justify-center p-1.5 shadow-2xs">
                  <img :src="item.logo_url" :alt="item.name" class="max-h-full max-w-full object-contain" />
                </div>
                <span v-else class="inline-flex size-10 items-center justify-center rounded-xl bg-sky-50 border border-sky-100 text-solar-navy-dark font-black text-xs">
                  {{ item.name.slice(0, 3).toUpperCase() }}
                </span>
              </td>

              <!-- اسم الماركة -->
              <td class="py-3.5 px-4 font-black text-solar-text-heading text-sm">
                {{ item.name }}
              </td>

              <!-- الموقع الرسمي -->
              <td class="py-3.5 px-4">
                <a
                  v-if="item.website"
                  :href="item.website.startsWith('http') ? item.website : `https://${item.website}`"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-1.5 font-mono text-xs text-sky-700 hover:text-solar-yellow transition-colors"
                  dir="ltr"
                >
                  <ExternalLink class="size-3.5" />
                  <span>{{ item.website.replace(/^https?:\/\//i, '') }}</span>
                </a>
                <span v-else class="text-solar-text-muted">—</span>
              </td>

              <!-- المنتجات المرتبطة -->
              <td class="py-3.5 px-4 text-center font-bold text-solar-text-body">
                <span class="rounded-lg bg-solar-bg-subtle px-2.5 py-1 text-xs">
                  {{ item.products_count ?? item.master_products_count ?? 0 }} منتج
                </span>
              </td>

              <!-- حالة التفعيل -->
              <td class="py-3.5 px-4 text-center">
                <AdminBadge :status="item.is_active !== false ? 'مفعل' : 'معطل'" />
              </td>

              <!-- الإجراءات -->
              <td class="py-3.5 px-4 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    @click="openEditModal(item)"
                    class="flex size-8 items-center justify-center rounded-lg text-solar-text-body hover:bg-solar-bg-subtle hover:text-amber-600 transition-colors"
                    title="تعديل العلامة التجارية"
                  >
                    <Pencil class="size-4" />
                  </button>
                  <button
                    type="button"
                    @click="confirmDelete(item)"
                    class="flex size-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                    title="حذف العلامة التجارية"
                  >
                    <Trash2 class="size-4" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredBrands.length === 0">
              <td colspan="6" class="py-12 text-center text-solar-text-muted">
                لا توجد علامات تجارية مطابقة لمعايير البحث الحالية.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- نافذة إضافة / تعديل علامة تجارية -->
    <AdminModal
      v-model="isModalOpen"
      :title="modalMode === 'create' ? 'إضافة علامة تجارية جديدة' : 'تعديل العلامة التجارية'"
      :subtitle="modalMode === 'create' ? 'تسجيل شركة عالمية مصنعة في قاعدة بيانات المنتجات والكتالوج' : 'تحديث بيانات وشعار العلامة التجارية'"
      :icon="Award"
      max-width="md"
    >
      <form @submit.prevent="handleSaveBrand" class="flex flex-col gap-4">
        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">اسم الماركة / الشركة *</label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="مثال: Jinko Solar أو SMA"
            class="solar-input h-11 text-xs w-full"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">رابط الموقع الرسمي (Website)</label>
          <div class="relative">
            <Globe class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
            <input
              v-model="form.website"
              type="text"
              placeholder="https://jinkosolar.com"
              dir="ltr"
              class="solar-input h-11 text-xs pl-9 pr-3 text-left font-mono w-full"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">شعار العلامة التجارية (Logo)</label>
          <div class="flex items-center gap-3">
            <div v-if="form.currentLogoUrl" class="size-11 shrink-0 rounded-lg border border-solar-border-card p-1 bg-solar-bg-subtle flex items-center justify-center">
              <img :src="form.currentLogoUrl" alt="logo preview" class="max-h-full max-w-full object-contain" />
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              @change="handleFileChange"
              class="solar-input h-11 text-xs py-2 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-solar-navy file:text-white"
            />
          </div>
          <p class="text-[11px] text-solar-text-muted mt-1">امتدادات مسموحة: PNG, JPG, SVG (حتى 2 ميغابايت).</p>
        </div>

        <div class="flex items-center gap-2 pt-1">
          <input
            id="brand-active"
            v-model="form.is_active"
            type="checkbox"
            class="size-4 rounded text-solar-navy focus:ring-solar-navy"
          />
          <label for="brand-active" class="text-xs font-bold text-solar-text-heading cursor-pointer">
            تفعيل العلامة التجارية واعتمادها في الكتالوج
          </label>
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
            <span>{{ modalMode === 'create' ? 'حفظ العلامة' : 'حفظ التعديلات' }}</span>
          </button>
        </div>
      </form>
    </AdminModal>

    <!-- نافذة تأكيد الحذف -->
    <AdminModal
      v-model="isDeleteModalOpen"
      title="تأكيد حذف العلامة التجارية"
      subtitle="حذف الشركة المصنعة من قاعدة البيانات"
      :icon="Trash2"
      max-width="md"
    >
      <div class="flex flex-col gap-4">
        <p class="text-xs text-solar-text-body leading-relaxed">
          هل أنت متأكد من رغبتك في حذف العلامة التجارية
          <strong class="text-rose-600 font-black">"{{ brandToDelete?.name }}"</strong>؟
          إذا كانت هذه العلامة مرتبطة بأي منتجات في الكتالوج، فسيتم منع الحذف لضمان سلامة البيانات.
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
            <span>نعم، حذف العلامة</span>
          </button>
        </div>
      </div>
    </AdminModal>
  </div>
</template>
