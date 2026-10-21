<script setup lang="ts">
import {
  Building2,
  Download,
  Edit,
  Eye,
  FileText,
  Layers,
  MapPin,
  X,
  Zap,
} from 'lucide-vue-next'
import type { EngineerProjectItem } from '~~/app/composables/useEngineerProjects'

const props = defineProps<{
  modelValue: boolean
  project: EngineerProjectItem | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'edit', project: EngineerProjectItem): void
  (e: 'unavailable', label: string): void
}>()

function close() {
  emit('update:modelValue', false)
}

function handleKeydown(event: KeyboardEvent) {
  if (props.modelValue && event.key === 'Escape') close()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue && project"
        class="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        dir="rtl"
        :aria-label="`تفاصيل المشروع ${project.project_title}`"
      >
        <!-- الخلفية المظلمة -->
        <div class="fixed inset-0 bg-solar-navy-dark/60 backdrop-blur-sm" aria-hidden="true" @click="close" />

        <!-- حاوية المودال -->
        <div class="relative w-full max-w-2xl rounded-2xl border border-solar-border-card bg-white shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden">
          <!-- الهيدر -->
          <div class="flex items-center justify-between gap-4 border-b border-solar-border-card px-6 py-4 shrink-0">
            <div class="flex items-center gap-2.5">
              <div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow text-solar-navy-dark shadow-xs">
                <Building2 class="size-5" />
              </div>
              <h3 class="text-base font-black text-solar-text-heading">تفاصيل المشروع</h3>
            </div>
            <button
              type="button"
              class="flex size-8 items-center justify-center rounded-lg text-solar-text-muted hover:bg-solar-bg-subtle transition-colors"
              aria-label="إغلاق النافذة"
              @click="close"
            >
              <X class="size-5" />
            </button>
          </div>

          <!-- جسم النافذة القابل للتمرير -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- الصورة البانورامية مع العنوان -->
            <div class="relative h-56 w-full overflow-hidden rounded-xl bg-solar-bg-subtle shadow-inner">
              <img
                :src="project.image_path"
                :alt="project.project_title"
                class="h-full w-full object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <!-- شارة السعة -->
              <span class="absolute top-4 left-4 flex items-center gap-1 rounded-lg bg-solar-yellow px-3 py-1 text-xs font-black text-solar-navy-dark shadow-sm">
                <Zap class="size-3.5 fill-current" />
                {{ project.system_capacity }}
              </span>

              <!-- عنوان المشروع فوق التدرج -->
              <div class="absolute bottom-4 right-4 left-4 text-right">
                <h4 class="text-lg font-bold text-white drop-shadow-md">
                  {{ project.project_title }}
                </h4>
              </div>
            </div>

            <!-- شبكة تفاصيل ومواصفات المشروع (4 خلايا) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- سعة المنظومة -->
              <div class="flex items-center justify-between rounded-xl bg-solar-bg-subtle/80 p-3.5 border border-solar-border-card/50">
                <div class="text-right">
                  <span class="block text-[11px] text-solar-text-muted font-medium">سعة المنظومة</span>
                  <span class="text-sm font-black text-solar-text-heading">{{ project.system_capacity }}</span>
                </div>
                <div class="flex size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <Zap class="size-4" />
                </div>
              </div>

              <!-- نوع الخدمة -->
              <div class="flex items-center justify-between rounded-xl bg-solar-bg-subtle/80 p-3.5 border border-solar-border-card/50">
                <div class="text-right">
                  <span class="block text-[11px] text-solar-text-muted font-medium">نوع الخدمة</span>
                  <span class="text-sm font-bold text-solar-text-heading">{{ project.service_type_label }}</span>
                </div>
                <div class="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                  <Layers class="size-4" />
                </div>
              </div>

              <!-- المحافظة والموقع -->
              <div class="flex items-center justify-between rounded-xl bg-solar-bg-subtle/80 p-3.5 border border-solar-border-card/50">
                <div class="text-right">
                  <span class="block text-[11px] text-solar-text-muted font-medium">المحافظة والموقع</span>
                  <span class="text-sm font-bold text-solar-text-heading">{{ project.governorate_name }}</span>
                </div>
                <div class="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                  <MapPin class="size-4" />
                </div>
              </div>

              <!-- العنوان التفصيلي -->
              <div class="flex items-center justify-between rounded-xl bg-solar-bg-subtle/80 p-3.5 border border-solar-border-card/50">
                <div class="text-right truncate max-w-[200px]">
                  <span class="block text-[11px] text-solar-text-muted font-medium">العنوان التفصيلي</span>
                  <span class="text-xs font-semibold text-solar-text-heading truncate block">{{ project.address_text }}</span>
                </div>
                <div class="flex size-8 items-center justify-center rounded-lg bg-purple-100 text-purple-800 shrink-0">
                  <Building2 class="size-4" />
                </div>
              </div>
            </div>

            <!-- وصف المشروع والمواصفات الفنية -->
            <div class="text-right">
              <h5 class="text-xs font-bold text-solar-text-heading mb-2">
                وصف المشروع والمواصفات الفنية:
              </h5>
              <div class="rounded-xl border border-solar-border-card bg-solar-bg-subtle/40 p-4">
                <p class="text-xs leading-relaxed text-solar-text-body">
                  {{ project.description }}
                </p>
              </div>
            </div>

            <!-- المرفقات والمخططات المعتمدة -->
            <div v-if="project.file_path" class="text-right">
              <h5 class="text-xs font-bold text-solar-text-heading mb-2">
                المرفقات والمخططات المعتمدة:
              </h5>
              <div class="flex items-center justify-between rounded-xl border border-solar-border-card bg-solar-bg-subtle p-3">
                <div class="flex items-center gap-3">
                  <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                    <FileText class="size-5" />
                  </div>
                  <div class="text-right">
                    <p class="text-xs font-bold text-solar-text-heading">{{ project.file_path }}</p>
                    <p class="text-[11px] text-solar-text-muted">{{ project.file_size_pages }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="flex items-center gap-1.5 rounded-lg border border-solar-border-card bg-white px-3 py-1.5 text-xs font-semibold text-solar-text-body hover:border-solar-navy transition-colors"
                    @click="emit('unavailable', 'معاينة المخطط')"
                  >
                    <Eye class="size-3.5" />
                    معاينة
                  </button>
                  <button
                    type="button"
                    class="flex items-center gap-1.5 rounded-lg border border-solar-border-card bg-white px-3 py-1.5 text-xs font-semibold text-solar-text-body hover:border-solar-navy transition-colors"
                    @click="emit('unavailable', 'تحميل المخطط')"
                  >
                    <Download class="size-3.5" />
                    تحميل
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- الفوتر -->
          <div class="flex items-center justify-between border-t border-solar-border-card px-6 py-4 bg-solar-bg-subtle/30 shrink-0">
            <button
              type="button"
              class="rounded-lg border border-solar-border-card px-4 py-2 text-xs font-bold text-solar-text-secondary hover:bg-solar-bg-subtle transition-colors"
              @click="close"
            >
              إغلاق النافذة
            </button>

            <button
              type="button"
              class="btn-primary flex items-center gap-2 text-xs"
              @click="emit('edit', project)"
            >
              <Edit class="size-4" />
              تعديل بيانات المشروع
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
