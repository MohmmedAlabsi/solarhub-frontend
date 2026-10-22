<script setup lang="ts">
import {
  BatteryCharging,
  Droplets,
  Eye,
  Grid,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  Wrench,
} from 'lucide-vue-next'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import AdminModal from '../../../components/admin/common/AdminModal.vue'
import MasterDataTabs from '../../../components/admin/master-data/MasterDataTabs.vue'
import type { Specialization } from '../../../../types/api'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة البيانات الأساسية — التخصصات | لوحة الإدارة العامة' })

const {
  specialties,
  isLoading,
  isActionLoading,
  fetchSpecialties,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
} = useAdminMasterData()

// Non-blocking lazy SSR Data Fetching
const { pending } = useLazyAsyncData('admin-master-specialties', () => fetchSpecialties(false), {
  default: () => specialties.value,
})

const isRefreshing = ref(false)
const searchQuery = ref('')

// Selected specialty for modals
const selectedSpecialty = ref<Specialization | null>(null)
const isDetailModalOpen = ref(false)
const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

// Forms
const newSpec = ref({
  name: '',
  description: '',
  is_active: true,
})

const editSpec = ref({
  id: 0,
  name: '',
  description: '',
  is_active: true,
})

function getSpecialtyIcon(name: string) {
  const n = (name || '').toLowerCase()
  if (n.includes('شمس') || n.includes('on-grid') || n.includes('شبك')) return Grid
  if (n.includes('بطار') || n.includes('تخزين') || n.includes('bess')) return BatteryCharging
  if (n.includes('مضخ') || n.includes('مياه') || n.includes('ري') || n.includes('زراع')) return Droplets
  if (n.includes('فحص') || n.includes('صيانة') || n.includes('اختبار')) return Wrench
  if (n.includes('كود') || n.includes('sbc') || n.includes('مطابق')) return ShieldCheck
  return Grid
}

const filteredSpecialties = computed(() => {
  if (!searchQuery.value.trim()) return specialties.value
  const q = searchQuery.value.trim().toLowerCase()
  return specialties.value.filter(
    s => s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q))
  )
})

// Action Handlers
async function handleRefreshCurrentTab() {
  isRefreshing.value = true
  try {
    await fetchSpecialties(true)
  } finally {
    isRefreshing.value = false
  }
}

function viewDetails(spec: Specialization) {
  selectedSpecialty.value = spec
  isDetailModalOpen.value = true
}

function openEditModal(spec: Specialization) {
  selectedSpecialty.value = spec
  editSpec.value = {
    id: spec.id,
    name: spec.name,
    description: spec.description || '',
    is_active: spec.is_active !== false,
  }
  isEditModalOpen.value = true
}

function openDeleteModal(spec: Specialization) {
  selectedSpecialty.value = spec
  isDeleteModalOpen.value = true
}

async function handleAddSpecialty() {
  if (!newSpec.value.name.trim()) return
  try {
    await createSpecialty({
      name: newSpec.value.name.trim(),
      description: newSpec.value.description.trim() || undefined,
      is_active: newSpec.value.is_active,
    })
    isAddModalOpen.value = false
    newSpec.value = { name: '', description: '', is_active: true }
  } catch {
    /* error handled in composable */
  }
}

async function handleUpdateSpecialty() {
  if (!editSpec.value.name.trim() || !editSpec.value.id) return
  try {
    await updateSpecialty(editSpec.value.id, {
      name: editSpec.value.name.trim(),
      description: editSpec.value.description.trim() || undefined,
      is_active: editSpec.value.is_active,
    })
    isEditModalOpen.value = false
  } catch {
    /* error handled in composable */
  }
}

async function executeDelete() {
  if (!selectedSpecialty.value) return
  try {
    await deleteSpecialty(selectedSpecialty.value.id)
    isDeleteModalOpen.value = false
    selectedSpecialty.value = null
  } catch {
    /* error handled in composable */
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
          إدارة وتوثيق مجالات التخصص الهندسي والاعتمادات المهنية للخبراء في منظومة سولار هب.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="handleRefreshCurrentTab"
          :disabled="isRefreshing || pending || isLoading"
          class="btn-outline h-10 px-4 text-xs font-bold gap-2 text-solar-text-body hover:bg-solar-bg-subtle"
          title="تحديث بيانات التخصصات من السيرفر"
        >
          <RefreshCw class="size-4" :class="{ 'animate-spin': isRefreshing || pending || isLoading }" />
          <span>تحديث</span>
        </button>

        <button
          type="button"
          @click="isAddModalOpen = true"
          class="btn-primary h-10 px-5 text-xs font-bold gap-2 bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md"
        >
          <Plus class="size-4" />
          <span>إضافة تخصص جديد</span>
        </button>
      </div>
    </div>

    <!-- شريط التبويبات -->
    <MasterDataTabs />

    <!-- كارد التخصصات المهنية للمهندسين -->
    <div class="solar-card p-5 sm:p-7">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-solar-border-card/60 pb-5">
        <div class="flex items-center gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-navy text-white">
            <Users class="size-5" />
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-black text-solar-text-heading">التخصصات المهنية للمهندسين المعتمدين</h2>
            <p class="text-xs text-solar-text-muted">
              مجالات الاعتماد الهندسي الدقيق المسجلة في قاعدة بيانات المنظومة: {{ specialties.length }} تخصص
            </p>
          </div>
        </div>

        <!-- البحث -->
        <div class="relative min-w-[200px] sm:min-w-[280px]">
          <Search class="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="البحث في مجالات التخصص..."
            class="solar-input h-10 pr-9 pl-4 text-xs w-full"
          />
        </div>
      </div>

      <!-- حالة التحميل الأولي فقط -->
      <div v-if="(pending || isRefreshing) && specialties.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 class="size-8 text-solar-navy animate-spin mb-3" />
        <p class="text-xs font-bold text-solar-text-muted">جاري تحميل مجالات التخصص المهني من السيرفر...</p>
      </div>

      <!-- جدول التخصصات -->
      <div v-else class="mt-6 overflow-x-auto rounded-xl border border-solar-border-card/80">
        <table class="w-full text-right text-xs">
          <thead class="bg-solar-bg-subtle/70 text-solar-text-muted font-bold border-b border-solar-border-card">
            <tr>
              <th class="py-3.5 px-4 font-bold text-center w-14">الرمز</th>
              <th class="py-3.5 px-4 font-bold">اسم التخصص ومجال الاعتماد</th>
              <th class="py-3.5 px-4 font-bold">النطاق والوصف الفني</th>
              <th class="py-3.5 px-4 font-bold text-center">المهندسون المعتمدون</th>
              <th class="py-3.5 px-4 font-bold text-center">حالة التفعيل</th>
              <th class="py-3.5 px-4 font-bold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-solar-border-card/60">
            <tr
              v-for="item in filteredSpecialties"
              :key="item.id"
              class="transition-colors hover:bg-solar-bg-subtle/30"
            >
              <!-- الأيقونة -->
              <td class="py-4 px-4 text-center">
                <span class="inline-flex size-9 items-center justify-center rounded-xl bg-solar-bg-subtle text-solar-navy shadow-2xs">
                  <component :is="getSpecialtyIcon(item.name)" class="size-4" />
                </span>
              </td>

              <!-- اسم التخصص -->
              <td class="py-4 px-4">
                <p class="font-extrabold text-solar-text-heading text-sm">{{ item.name }}</p>
                <p class="font-mono text-[11px] text-solar-text-muted mt-0.5">SPEC-0{{ item.id }}</p>
              </td>

              <!-- الوصف -->
              <td class="py-4 px-4 text-solar-text-body leading-relaxed max-w-md">
                <p class="line-clamp-2 text-xs text-solar-text-muted font-medium">
                  {{ item.description || 'مجال تخصص معتمد لدى الهيئة ومرخص في المنصة.' }}
                </p>
              </td>

              <!-- عدد المهندسين المعتمدين -->
              <td class="py-4 px-4 text-center">
                <span class="inline-flex items-center gap-1 rounded-lg bg-solar-bg-subtle px-2.5 py-1 text-xs font-bold text-solar-text-heading">
                  <Users class="size-3 text-solar-text-muted" />
                  <span>{{ item.engineers_count ?? 0 }} مهندس</span>
                </span>
              </td>

              <!-- حالة التفعيل -->
              <td class="py-4 px-4 text-center">
                <AdminBadge :status="item.is_active !== false ? 'مفعل' : 'معطل'" />
              </td>

              <!-- الإجراءات (أيقونة التعديل، أيقونة الحذف، وأيقونة المعاينة) -->
              <td class="py-4 px-4 text-center">
                <div class="inline-flex items-center justify-center gap-1.5">
                  <!-- أيقونة التعديل -->
                  <button
                    type="button"
                    @click="openEditModal(item)"
                    class="size-8 inline-flex items-center justify-center rounded-lg text-solar-navy bg-sky-50 hover:bg-sky-100 hover:text-solar-navy-dark transition-colors border border-sky-100"
                    title="تعديل التخصص"
                  >
                    <Pencil class="size-3.5" />
                  </button>

                  <!-- أيقونة الحذف -->
                  <button
                    type="button"
                    @click="openDeleteModal(item)"
                    class="size-8 inline-flex items-center justify-center rounded-lg text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-colors border border-red-100"
                    title="حذف التخصص"
                  >
                    <Trash2 class="size-3.5" />
                  </button>

                  <!-- أيقونة المعاينة -->
                  <button
                    type="button"
                    @click="viewDetails(item)"
                    class="size-8 inline-flex items-center justify-center rounded-lg text-solar-text-muted bg-solar-bg-subtle hover:bg-slate-200 hover:text-solar-text-heading transition-colors border border-solar-border-card"
                    title="معاينة التفاصيل"
                  >
                    <Eye class="size-3.5" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredSpecialties.length === 0">
              <td colspan="6" class="py-12 text-center text-solar-text-muted">
                لا توجد تخصصات مطابقة لمعايير البحث الحالية.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- نافذة إضافة تخصص جديد -->
    <AdminModal
      v-model="isAddModalOpen"
      title="إضافة تخصص مهني جديد"
      subtitle="تسجيل مجال اعتماد هندسي جديد في المنظومة"
      :icon="Users"
      max-width="md"
    >
      <form @submit.prevent="handleAddSpecialty" class="flex flex-col gap-4">
        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">مسمى التخصص الهندسي *</label>
          <input
            v-model="newSpec.name"
            type="text"
            required
            placeholder="مثال: هندسة أنظمة الطاقة الشمسية الهجينة BESS"
            class="solar-input h-11 text-xs w-full"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">النطاق والوصف الفني للتخصص</label>
          <textarea
            v-model="newSpec.description"
            rows="3"
            placeholder="دراسة ومطابقة كود SBC وتصميم منظومات تخزين الطاقة..."
            class="solar-input text-xs w-full py-2.5 resize-none"
          />
        </div>

        <div class="flex items-center gap-2 pt-1">
          <input
            id="spec-active"
            v-model="newSpec.is_active"
            type="checkbox"
            class="size-4 rounded text-solar-navy focus:ring-solar-navy"
          />
          <label for="spec-active" class="text-xs font-bold text-solar-text-heading cursor-pointer">
            تفعيل التخصص واعتماده في ملفات تسجيل المهندسين
          </label>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-solar-border-card mt-2">
          <button
            type="button"
            @click="isAddModalOpen = false"
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
            <span>حفظ التخصص</span>
          </button>
        </div>
      </form>
    </AdminModal>

    <!-- نافذة تعديل تخصص موجود -->
    <AdminModal
      v-model="isEditModalOpen"
      title="تعديل التخصص المهني"
      subtitle="تحديث مسمى ووصف وحالة التخصص الهندسي"
      :icon="Pencil"
      max-width="md"
    >
      <form @submit.prevent="handleUpdateSpecialty" class="flex flex-col gap-4">
        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">مسمى التخصص الهندسي *</label>
          <input
            v-model="editSpec.name"
            type="text"
            required
            placeholder="مسمى التخصص..."
            class="solar-input h-11 text-xs w-full"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">النطاق والوصف الفني للتخصص</label>
          <textarea
            v-model="editSpec.description"
            rows="3"
            placeholder="وصف التخصص ومعايير الاعتماد..."
            class="solar-input text-xs w-full py-2.5 resize-none"
          />
        </div>

        <div class="flex items-center gap-2 pt-1">
          <input
            id="edit-spec-active"
            v-model="editSpec.is_active"
            type="checkbox"
            class="size-4 rounded text-solar-navy focus:ring-solar-navy"
          />
          <label for="edit-spec-active" class="text-xs font-bold text-solar-text-heading cursor-pointer">
            تفعيل التخصص واعتماده في ملفات تسجيل المهندسين
          </label>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-solar-border-card mt-2">
          <button
            type="button"
            @click="isEditModalOpen = false"
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
            <span>حفظ التعديلات</span>
          </button>
        </div>
      </form>
    </AdminModal>

    <!-- نافذة تأكيد حذف تخصص مهني -->
    <AdminModal
      v-model="isDeleteModalOpen"
      title="تأكيد حذف التخصص المهني"
      subtitle="هذا الإجراء يؤدي إلى إزالة التخصص من منظومة الاعتماد المهني"
      :icon="Trash2"
      max-width="sm"
    >
      <div v-if="selectedSpecialty" class="flex flex-col gap-4">
        <p class="text-xs text-solar-text-body leading-relaxed">
          هل أنت متأكد من رغبتك في حذف التخصص:
          <span class="font-extrabold text-solar-text-heading">"{{ selectedSpecialty.name }}"</span>؟
        </p>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-solar-border-card mt-2">
          <button
            type="button"
            @click="isDeleteModalOpen = false"
            :disabled="isActionLoading"
            class="btn-outline h-10 px-5 text-xs font-bold"
          >
            إلغاء
          </button>
          <button
            type="button"
            @click="executeDelete"
            :disabled="isActionLoading"
            class="btn-primary h-10 px-6 text-xs font-bold gap-2 bg-red-600 text-white hover:bg-red-700 shadow-md"
          >
            <Loader2 v-if="isActionLoading" class="size-4 animate-spin" />
            <span>تأكيد الحذف</span>
          </button>
        </div>
      </div>
    </AdminModal>

    <!-- نافذة معاينة تفاصيل التخصص -->
    <AdminModal
      v-model="isDetailModalOpen"
      title="تفاصيل التخصص الهندسي"
      subtitle="استعراض مجالات الخبرة والاعتماد المهني"
      :icon="Users"
      max-width="md"
    >
      <div v-if="selectedSpecialty" class="flex flex-col gap-4">
        <div class="flex items-center gap-3 p-3.5 rounded-xl bg-solar-bg-subtle/80 border border-solar-border-card">
          <div class="size-11 rounded-xl bg-solar-navy text-white flex items-center justify-center shrink-0">
            <component :is="getSpecialtyIcon(selectedSpecialty.name)" class="size-5" />
          </div>
          <div>
            <h3 class="font-black text-sm text-solar-text-heading">{{ selectedSpecialty.name }}</h3>
            <p class="text-xs text-solar-text-muted font-mono mt-0.5">رمز التخصص: SPEC-0{{ selectedSpecialty.id }}</p>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-heading mb-1.5">معايير ونطاق الاعتماد المهني:</label>
          <div class="p-3.5 rounded-xl border border-solar-border-card bg-white text-xs text-solar-text-body leading-relaxed whitespace-pre-line">
            {{ selectedSpecialty.description || 'تخصص مهني معتمد وفق الكود والمعايير الهندسية المعمول بها.' }}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-2">
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p class="text-[11px] text-solar-text-muted font-bold">المهندسون المرتبطون</p>
            <p class="text-xs font-black text-solar-navy mt-1">
              {{ selectedSpecialty.engineers_count ?? 0 }} مهندس معتمد
            </p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p class="text-[11px] text-solar-text-muted font-bold">الربط البرمجي</p>
            <p class="text-xs font-black text-emerald-600 mt-1">
              متصل بقاعدة البيانات API
            </p>
          </div>
        </div>

        <div class="flex justify-end pt-4 border-t border-solar-border-card">
          <button
            type="button"
            @click="isDetailModalOpen = false"
            class="btn-primary h-10 px-6 text-xs font-bold bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md"
          >
            إغلاق
          </button>
        </div>
      </div>
    </AdminModal>
  </div>
</template>
