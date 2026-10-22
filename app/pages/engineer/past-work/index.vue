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
  filteredProjects,
  search,
  serviceTypeFilter,
  serviceTypesList,
  addProject,
  deleteProject,
} = useEngineerProjects()

const isAddModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const selectedProject = ref<EngineerProjectItem | null>(null)
const toastMessage = ref('')

function openAddModal() {
  isAddModalOpen.value = true
}

function openDetailModal(project: EngineerProjectItem) {
  selectedProject.value = project
  isDetailModalOpen.value = true
}

function handleEditProject(project: EngineerProjectItem) {
  isDetailModalOpen.value = false
  // للتبسيط، نفتح رسالة أو نعدل
  showToast(`تعديل مشروع: ${project.project_title}`)
}

function handleDeleteProject(id: number) {
  if (confirm('هل أنت متأكد من حذف هذا المشروع من أعمالك السابقة؟')) {
    deleteProject(id)
    showToast('تم حذف المشروع بنجاح')
  }
}

function handleProjectCreated(payload: NewProjectPayload) {
  addProject(payload)
  showToast('تمت إضافة المشروع الجديد بنجاح!')
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

    <!-- شبكة بطاقات المشاريع المنجزة -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <!-- بطاقات المشاريع الحالية -->
      <ProjectCard
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
        @view="openDetailModal"
        @edit="openDetailModal"
        @delete="handleDeleteProject"
        @unavailable="showToast"
      />

      <!-- بطاقة إضافة نموذج عمل جديد التفاعلية المفرغة -->
      <AddProjectCard @add="openAddModal" />
    </div>

    <!-- حالة عدم وجود نتائج عند البحث -->
    <div
      v-if="filteredProjects.length === 0"
      class="rounded-2xl border border-dashed border-solar-border-card bg-white p-12 text-center"
    >
      <p class="text-sm font-semibold text-solar-text-heading">لا توجد مشاريع تطابق شروط البحث الحالية</p>
      <button
        type="button"
        class="mt-3 text-xs font-bold text-solar-yellow hover:underline"
        @click="search = ''; serviceTypeFilter = 'all'"
      >
        إعادة ضبط الفلاتر
      </button>
    </div>

    <!-- نافذة تفاصيل المشروع (Modal) -->
    <ProjectDetailModal
      v-model="isDetailModalOpen"
      :project="selectedProject"
      @edit="handleEditProject"
      @unavailable="showToast"
    />

    <!-- نافذة إضافة مشروع جديد (Modal) -->
    <AddProjectModal
      v-model="isAddModalOpen"
      @submit="handleProjectCreated"
    />

    <!-- Toast للتنبيهات السريعة -->
    <AppToast :message="toastMessage" />
  </div>
</template>
