<script setup lang="ts">
import { Filter, Plus, Search } from 'lucide-vue-next'
import AppToast from '~/components/common/AppToast.vue'
import AddProjectCard from '~/components/engineer/past-work/AddProjectCard.vue'
import AddProjectModal from '~/components/engineer/past-work/AddProjectModal.vue'
import ProjectCard from '~/components/engineer/past-work/ProjectCard.vue'
import ProjectDetailModal from '~/components/engineer/past-work/ProjectDetailModal.vue'
import {
  useEngineerProjects,
  type EngineerProjectItem,
  type NewProjectPayload,
} from '~~/app/composables/useEngineerProjects'

definePageMeta({ layout: 'engineer' })
useSeoMeta({
  title: 'أعمالي السابقة | SolarHub - بوابة المهندسين',
  description: 'استعراض وإدارة المشاريع المنجزة ونماذج الأعمال المعتمدة للمهندس.',
})

const {
  projects,
  filteredProjects,
  search,
  serviceTypeFilter,
  serviceTypesList,
  governoratesList,
  isLoading,
  error,
  addProject,
  updateProject,
  deleteProject,
} = useEngineerProjects()

const isProjectModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const selectedProject = ref<EngineerProjectItem | null>(null)
const editingProject = ref<EngineerProjectItem | null>(null)
const toastMessage = ref('')

function openAddModal() {
  editingProject.value = null
  isProjectModalOpen.value = true
}

function openEditModal(project: EngineerProjectItem) {
  editingProject.value = project
  isProjectModalOpen.value = true
}

function openDetailModal(project: EngineerProjectItem) {
  selectedProject.value = project
  isDetailModalOpen.value = true
}

async function handleDeleteProject(id: number) {
  if (!confirm('هل أنت متأكد من حذف هذا المشروع من أعمالك السابقة؟')) return

  try {
    await deleteProject(id)
    showToast('تم حذف المشروع بنجاح')
  } catch (err: any) {
    showToast(err?.data?.message || 'تعذر حذف المشروع')
  }
}

async function handleProjectSubmit(payload: NewProjectPayload, isEdit: boolean, id?: number) {
  if (isEdit && id) {
    await updateProject(id, payload)
    showToast('تم تحديث بيانات المشروع بنجاح!')
  } else {
    await addProject(payload)
    showToast('تمت إضافة المشروع الجديد بنجاح!')
  }
}

function showToast(msg: string) {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 3500)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- رأس الصفحة مع زر إضافة مشروع جديد -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-right">
      <div class="space-y-1">
        <h1 class="text-2xl font-black text-solar-text-heading md:text-3xl">
          أعمالي السابقة
        </h1>
        <p class="text-xs sm:text-sm text-solar-text-secondary">
          استعراض وإدارة المشاريع المنجزة ونماذج الأعمال المعتمدة للمهندس
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-solar-navy-dark px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:bg-solar-navy active:scale-95 self-start sm:self-auto"
        @click="openAddModal"
      >
        <Plus class="size-4 stroke-[2.5]" />
        <span>إضافة مشروع جديد</span>
      </button>
    </div>

    <!-- شريط البحث والفلترة -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <!-- حقل البحث -->
      <div class="relative sm:col-span-2">
        <input
          v-model="search"
          type="search"
          placeholder="البحث في المشاريع السابقة بالعنوان أو الكلمات الدلالية..."
          class="w-full rounded-xl border border-solar-border-input bg-white py-2.5 pr-10 pl-4 text-xs text-solar-text-heading placeholder:text-solar-text-muted focus:border-solar-yellow focus:outline-none focus:ring-1 focus:ring-solar-yellow shadow-xs"
        />
        <Search class="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
      </div>

      <!-- فلتر نوع الخدمة -->
      <div class="relative">
        <select
          v-model="serviceTypeFilter"
          class="w-full appearance-none rounded-xl border border-solar-border-input bg-white py-2.5 pr-10 pl-8 text-xs text-solar-text-heading focus:border-solar-yellow focus:outline-none focus:ring-1 focus:ring-solar-yellow shadow-xs cursor-pointer"
        >
          <option value="all">نوع الخدمة (الكل)</option>
          <option v-for="type in serviceTypesList" :key="type.id" :value="type.id">
            {{ type.label }}
          </option>
        </select>
        <Filter class="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted pointer-events-none" />
      </div>
    </div>

    <!-- مؤشر التحميل -->
    <div v-if="isLoading" class="flex items-center justify-center py-16 text-solar-navy">
      <div class="size-8 animate-spin rounded-full border-4 border-solar-navy border-t-transparent" />
    </div>

    <!-- شبكة بطاقات المشاريع المنجزة -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <!-- بطاقات المشاريع الحالية -->
      <ProjectCard
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
        @view="openDetailModal"
        @edit="openEditModal"
        @delete="handleDeleteProject"
      />

      <!-- بطاقة إضافة نموذج عمل جديد التفاعلية المفرغة -->
      <AddProjectCard @add="openAddModal" />
    </div>

    <!-- حالة عدم وجود نتائج عند البحث أو قائمة فارغة -->
    <div
      v-if="!isLoading && filteredProjects.length === 0"
      class="rounded-2xl border border-dashed border-solar-border-card bg-white p-12 text-center"
    >
      <p class="text-sm font-semibold text-solar-text-heading">
        {{ search || serviceTypeFilter !== 'all' ? 'لا توجد مشاريع تطابق شروط البحث الحالية' : 'لم تقم بإضافة نماذج أعمال سابقة بعد' }}
      </p>
      <button
        v-if="search || serviceTypeFilter !== 'all'"
        type="button"
        class="mt-3 text-xs font-bold text-solar-yellow hover:underline"
        @click="search = ''; serviceTypeFilter = 'all'"
      >
        إعادة ضبط الفلاتر
      </button>
      <button
        v-else
        type="button"
        class="mt-3 text-xs font-bold text-solar-navy hover:underline"
        @click="openAddModal"
      >
        أضف أول نموذج عمل الآن
      </button>
    </div>

    <!-- نافذة تفاصيل المشروع (Modal) -->
    <ProjectDetailModal
      v-model="isDetailModalOpen"
      :project="selectedProject"
      @edit="openEditModal"
    />

    <!-- نافذة إضافة وتعديل مشروع (Modal) -->
    <AddProjectModal
      v-model="isProjectModalOpen"
      :edit-project="editingProject"
      :service-types-list="serviceTypesList"
      :governorates-list="governoratesList"
      :submit-action="handleProjectSubmit"
    />

    <!-- Toast للتنبيهات السريعة -->
    <AppToast :message="toastMessage" />
  </div>
</template>
