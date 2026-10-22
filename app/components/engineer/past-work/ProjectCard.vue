<script setup lang="ts">
import { Download, Edit3, FileText, MapPin, Trash2, Zap } from 'lucide-vue-next'
import type { EngineerProjectItem } from '~~/app/composables/useEngineerProjects'

const props = defineProps<{
  project: EngineerProjectItem
}>()

const emit = defineEmits<{
  (e: 'view', project: EngineerProjectItem): void
  (e: 'edit', project: EngineerProjectItem): void
  (e: 'delete', id: number): void
  (e: 'unavailable', label: string): void
}>()
</script>

<template>
  <div class="group flex flex-col overflow-hidden rounded-2xl border border-solar-border-card bg-white shadow-card transition-all duration-200 hover:border-solar-yellow/50 hover:shadow-hover">
    <!-- الصورة العلوية مع الشارات -->
    <div class="relative h-44 w-full overflow-hidden bg-solar-bg-subtle">
      <img
        :src="project.image_path"
        :alt="project.project_title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <!-- تدرج لوني خفيف -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

      <!-- شارة نوع الخدمة -->
      <span class="absolute top-3 right-3 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white">
        {{ project.service_type_label }}
      </span>

      <!-- شارة السعة بالأصفر -->
      <span class="absolute top-3 left-3 flex items-center gap-1 rounded-lg bg-solar-yellow px-2.5 py-1 text-xs font-black text-solar-navy-dark shadow-sm">
        <Zap class="size-3.5 fill-current" />
        {{ project.system_capacity }}
      </span>
    </div>

    <!-- تفاصيل المشروع -->
    <div class="flex flex-1 flex-col p-5">
      <!-- عنوان المشروع -->
      <h3
        class="cursor-pointer text-base font-bold text-solar-text-heading hover:text-solar-yellow transition-colors line-clamp-1"
        @click="emit('view', project)"
      >
        {{ project.project_title }}
      </h3>

      <!-- الموقع -->
      <p class="mt-1 flex items-center gap-1.5 text-xs text-solar-text-muted">
        <MapPin class="size-3.5 shrink-0 text-solar-yellow" />
        <span class="truncate">{{ project.address_text }}</span>
      </p>

      <!-- الوصف -->
      <p class="mt-2 text-xs leading-relaxed text-solar-text-secondary line-clamp-2">
        {{ project.description }}
      </p>

      <!-- المرفق المعتمد (PDF) -->
      <div
        v-if="project.file_path"
        class="mt-4 flex items-center justify-between rounded-xl border border-solar-border-card bg-solar-bg-subtle/80 p-2.5 text-xs transition-colors hover:bg-solar-bg-subtle"
      >
        <div class="flex items-center gap-2 overflow-hidden">
          <FileText class="size-4 shrink-0 text-red-500" />
          <span class="truncate font-medium text-solar-text-heading max-w-[190px]">{{ project.file_path }}</span>
        </div>
        <button
          type="button"
          class="flex size-7 shrink-0 items-center justify-center rounded-lg text-solar-text-muted hover:bg-white hover:text-solar-navy-dark transition-all"
          title="تحميل الملف"
          @click.stop="emit('unavailable', 'تحميل الملف')"
        >
          <Download class="size-3.5" />
        </button>
      </div>

      <!-- فاصل وأزرار الإجراءات -->
      <div class="mt-auto pt-4 border-t border-solar-border-card/60 flex items-center justify-between">
        <button
          type="button"
          class="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
          @click="emit('delete', project.id)"
        >
          <Trash2 class="size-3.5" />
          <span>حذف</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-1.5 text-xs font-bold text-solar-navy hover:text-solar-yellow-active transition-colors"
          @click="emit('edit', project)"
        >
          <Edit3 class="size-3.5" />
          <span>تعديل</span>
        </button>
      </div>
    </div>
  </div>
</template>
