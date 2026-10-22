<script setup lang="ts">
import {
  Globe,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-vue-next'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import AdminModal from '../../../components/admin/common/AdminModal.vue'
import MasterDataTabs from '../../../components/admin/master-data/MasterDataTabs.vue'
import type { Governorate } from '../../../../types/api'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة البيانات الأساسية — المحافظات | لوحة الإدارة العامة' })

const {
  cities,
  isLoading,
  isActionLoading,
  fetchCities,
  createCity,
  updateCity,
  deleteCity,
} = useAdminMasterData()

// Non-blocking lazy SSR Data Fetching for instant navigation
const { pending } = useLazyAsyncData('admin-master-cities', () => fetchCities(false), {
  default: () => cities.value,
})

const isRefreshing = ref(false)

async function handleRefreshCurrentTab() {
  isRefreshing.value = true
  try {
    await fetchCities(true)
  } finally {
    isRefreshing.value = false
  }
}

const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

// Filtered governorates
const filteredCities = computed(() => {
  return cities.value.filter((c) => {
    // Status filter
    if (statusFilter.value === 'active' && !c.is_active) return false
    if (statusFilter.value === 'inactive' && c.is_active) return false

    // Search query
    if (!searchQuery.value.trim()) return true
    const q = searchQuery.value.trim().toLowerCase()
    return (
      c.name_ar.toLowerCase().includes(q) ||
      (c.name_en && c.name_en.toLowerCase().includes(q))
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
  is_active: true,
})

function openCreateModal() {
  modalMode.value = 'create'
  editingId.value = null
  form.value = {
    name_ar: '',
    name_en: '',
    is_active: true,
  }
  isModalOpen.value = true
}

function openEditModal(city: Governorate) {
  modalMode.value = 'edit'
  editingId.value = city.id
  form.value = {
    name_ar: city.name_ar,
    name_en: city.name_en || '',
    is_active: city.is_active !== false,
  }
  isModalOpen.value = true
}

async function handleSaveCity() {
  if (!form.value.name_ar.trim()) return

  const payload = {
    name_ar: form.value.name_ar.trim(),
    name_en: form.value.name_en.trim() || undefined,
    is_active: form.value.is_active,
  }

  try {
    if (modalMode.value === 'create') {
      await createCity(payload)
    } else if (editingId.value) {
      await updateCity(editingId.value, payload)
    }
    isModalOpen.value = false
  } catch {
    /* error handled by composable */
  }
}

// Delete Confirmation
const isDeleteModalOpen = ref(false)
const cityToDelete = ref<Governorate | null>(null)

function confirmDelete(city: Governorate) {
  cityToDelete.value = city
  isDeleteModalOpen.value = true
}

async function executeDelete() {
  if (!cityToDelete.value) return
  const success = await deleteCity(cityToDelete.value.id)
  if (success) {
    isDeleteModalOpen.value = false
    cityToDelete.value = null
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
          إدارة وضبط النطاقات الجغرافية والمحافظات المعتمدة لتقديم الخدمات والشحن في المنظومة.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="handleRefreshCurrentTab"
          :disabled="isRefreshing || pending || isLoading"
          class="btn-outline h-10 px-4 text-xs font-bold gap-2 text-solar-text-body hover:bg-solar-bg-subtle"
          title="تحديث بيانات المحافظات من السيرفر"
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
          <span>إضافة محافظة جديدة</span>
        </button>
      </div>
    </div>

    <!-- شريط التبويبات -->
    <MasterDataTabs />

    <!-- كارد قائمة المحافظات -->
    <div class="solar-card p-5 sm:p-7">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-solar-border-card/60 pb-5">
        <div class="flex items-center gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-navy text-white">
            <MapPin class="size-5" />
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-black text-solar-text-heading">قائمة المحافظات والمناطق الإدارية</h2>
            <p class="text-xs text-solar-text-muted">
              إجمالي المحافظات المسجلة: {{ cities.length }} محافظة
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
              placeholder="البحث بالاسم العربي أو الإنجليزي..."
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
      <div v-if="pending && cities.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 class="size-8 text-solar-navy animate-spin mb-3" />
        <p class="text-xs font-bold text-solar-text-muted">جاري تحميل المحافظات من السيرفر...</p>
      </div>

      <!-- جدول المحافظات -->
      <div v-else class="mt-6 overflow-x-auto rounded-xl border border-solar-border-card/80">
        <table class="w-full text-right text-xs">
          <thead class="bg-solar-bg-subtle/70 text-solar-text-muted font-bold border-b border-solar-border-card">
            <tr>
              <th class="py-3.5 px-4 font-bold text-center w-12">#</th>
              <th class="py-3.5 px-4 font-bold">اسم المحافظة (بالعربية)</th>
              <th class="py-3.5 px-4 font-bold">NAME (ENGLISH)</th>
              <th class="py-3.5 px-4 font-bold text-center">حالة التفعيل</th>
              <th class="py-3.5 px-4 font-bold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-solar-border-card/60">
            <tr
              v-for="(item, idx) in filteredCities"
              :key="item.id"
              class="transition-colors hover:bg-solar-bg-subtle/30"
            >
              <!-- الترتيب -->
              <td class="py-4 px-4 text-center font-mono text-solar-text-muted text-xs">
                {{ idx + 1 }}
              </td>

              <!-- الاسم بالعربية -->
              <td class="py-4 px-4 font-black text-solar-text-heading text-sm">
                <span class="inline-flex items-center gap-2">
                  <span
                    class="size-2 rounded-full"
                    :class="item.is_active !== false ? 'bg-solar-yellow' : 'bg-slate-300'"
                  />
                  <span>{{ item.name_ar }}</span>
                </span>
              </td>

              <!-- Name in English -->
              <td class="py-4 px-4 font-mono font-medium text-solar-text-body text-xs" dir="ltr">
                {{ item.name_en || '—' }}
              </td>

              <!-- حالة التفعيل -->
              <td class="py-4 px-4 text-center">
                <AdminBadge :status="item.is_active !== false ? 'مفعل' : 'معطل مؤقتاً'" />
              </td>

              <!-- الإجراءات -->
              <td class="py-4 px-4 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    @click="openEditModal(item)"
                    class="flex size-8 items-center justify-center rounded-lg text-solar-text-body hover:bg-solar-bg-subtle hover:text-amber-600 transition-colors"
                    title="تعديل المحافظة"
                  >
                    <Pencil class="size-4" />
                  </button>
                  <button
                    type="button"
                    @click="confirmDelete(item)"
                    class="flex size-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                    title="حذف المحافظة"
                  >
                    <Trash2 class="size-4" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredCities.length === 0">
              <td colspan="5" class="py-12 text-center text-solar-text-muted">
                لا توجد محافظات مطابقة لمعايير البحث الحالية.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- نافذة إضافة / تعديل محافظة -->
    <AdminModal
      v-model="isModalOpen"
      :title="modalMode === 'create' ? 'إضافة محافظة جديدة' : 'تعديل بيانات المحافظة'"
      :subtitle="modalMode === 'create' ? 'توسيع التغطية الجغرافية لخدمات وعمليات المنصة' : 'تحديث مسمى المحافظة وحالة تفعيلها'"
      :icon="MapPin"
      max-width="md"
    >
      <form @submit.prevent="handleSaveCity" class="flex flex-col gap-4">
        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">اسم المحافظة / المنطقة بالعربية *</label>
          <input
            v-model="form.name_ar"
            type="text"
            required
            placeholder="مثال: الرياض أو صنعاء أو عدن"
            class="solar-input h-11 text-xs w-full"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">الاسم بالإنجليزية (ENGLISH)</label>
          <input
            v-model="form.name_en"
            type="text"
            placeholder="Riyadh Region"
            dir="ltr"
            class="solar-input h-11 text-xs text-right font-mono w-full"
          />
        </div>

        <div class="flex items-center gap-2 pt-1">
          <input
            id="city-active"
            v-model="form.is_active"
            type="checkbox"
            class="size-4 rounded text-solar-navy focus:ring-solar-navy"
          />
          <label for="city-active" class="text-xs font-bold text-solar-text-heading cursor-pointer">
            تفعيل المحافظة للشحن وتقديم الخدمات
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
            <span>{{ modalMode === 'create' ? 'حفظ المنطقة' : 'حفظ التعديلات' }}</span>
          </button>
        </div>
      </form>
    </AdminModal>

    <!-- نافذة تأكيد الحذف -->
    <AdminModal
      v-model="isDeleteModalOpen"
      title="تأكيد حذف المحافظة"
      subtitle="حذف النطاق الجغرافي من قاعدة البيانات"
      :icon="Trash2"
      max-width="md"
    >
      <div class="flex flex-col gap-4">
        <p class="text-xs text-solar-text-body leading-relaxed">
          هل أنت متأكد من رغبتك في حذف محافظة
          <strong class="text-rose-600 font-black">"{{ cityToDelete?.name_ar }}"</strong>؟
          إذا كانت هذه المحافظة مرتبطة بأي مستخدمين أو منتجات متاجر، فسيتم منع الحذف لحماية اتساق البيانات.
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
            <span>نعم، حذف المحافظة</span>
          </button>
        </div>
      </div>
    </AdminModal>
  </div>
</template>
