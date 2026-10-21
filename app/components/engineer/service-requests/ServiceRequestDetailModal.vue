<script setup lang="ts">
import { ArrowLeft, Download, Eye, FileText, Info, MapPin, Tag, X } from 'lucide-vue-next'
import type { EngineerServiceRequest } from '~~/app/composables/useEngineerServiceRequests'

const props = defineProps<{
  modelValue: boolean
  request: EngineerServiceRequest | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit-offer', request: EngineerServiceRequest): void
  (e: 'unavailable', label: string): void
}>()

function close() { emit('update:modelValue', false) }
function goToSubmit() {
  if (props.request) {
    close()
    emit('submit-offer', props.request)
  }
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
        v-if="modelValue && request"
        class="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        dir="rtl"
        :aria-label="`تفاصيل طلب الخدمة ${request.id}`"
      >
        <!-- خلفية ضبابية -->
        <div class="fixed inset-0 bg-solar-navy-dark/60 backdrop-blur-sm" aria-hidden="true" @click="close" />

        <!-- محتوى المودال -->
        <div class="relative w-full max-w-lg rounded-2xl border border-solar-border-card bg-white shadow-2xl z-10">
          <!-- الهيدر -->
          <div class="flex items-center justify-between gap-4 border-b border-solar-border-card px-6 py-4">
            <div class="flex items-center gap-2.5">
              <div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark">
                <Info class="size-5" />
              </div>
              <div>
                <h3 class="text-base font-black text-solar-text-heading">تفاصيل طلب الخدمة</h3>
                <p class="text-xs font-mono text-solar-text-muted">{{ request.id }}</p>
              </div>
            </div>
            <button
              type="button"
              @click="close"
              class="flex size-8 items-center justify-center rounded-lg text-solar-text-muted hover:bg-solar-bg-subtle hover:text-solar-text-heading transition-colors"
              aria-label="إغلاق"
            >
              <X class="size-5" />
            </button>
          </div>

          <!-- الجسم -->
          <div class="flex flex-col gap-5 p-6">
            <!-- نطاق العمل ومواصفات الطلب -->
            <section>
              <div class="mb-2 flex items-center gap-2 text-sm font-bold text-solar-text-heading">
                <FileText class="size-4 text-solar-text-muted" aria-hidden="true" />
                نطاق العمل ومواصفات الطلب
              </div>
              <div class="rounded-xl border border-solar-border-card bg-solar-bg-subtle p-4">
                <p class="text-sm text-solar-text-secondary leading-relaxed">{{ request.scopeDescription }}</p>
              </div>
            </section>

            <!-- تفاصيل الموقع الإضافية -->
            <section>
              <div class="mb-2 flex items-center gap-2 text-sm font-bold text-solar-text-heading">
                <MapPin class="size-4 text-solar-text-muted" aria-hidden="true" />
                تفاصيل الموقع الإضافية
              </div>
              <div class="rounded-xl border border-solar-border-card bg-solar-bg-subtle p-4">
                <div class="flex items-start justify-between gap-3">
                  <p class="text-sm text-solar-text-secondary">{{ request.additionalLocation }}</p>
                  <span
                    v-if="request.locationTag"
                    class="flex shrink-0 items-center gap-1 rounded-lg border border-solar-border-card bg-white px-2 py-1 text-xs font-semibold text-solar-text-body"
                  >
                    <Tag class="size-3" aria-hidden="true" />
                    {{ request.locationTag }}
                  </span>
                </div>
              </div>
            </section>

            <!-- مرفق الطلب التقني -->
            <section v-if="request.attachmentName">
              <div class="mb-2 flex items-center gap-2 text-sm font-bold text-solar-text-heading">
                <FileText class="size-4 text-solar-text-muted" aria-hidden="true" />
                مرفق الطلب (ملف تقني)
              </div>
              <div class="flex items-center justify-between gap-3 rounded-xl border border-solar-border-card bg-solar-bg-subtle p-3">
                <div class="flex items-center gap-3">
                  <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
                    <FileText class="size-5 text-red-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-solar-text-heading">{{ request.attachmentName }}</p>
                    <p class="text-[11px] text-solar-text-muted">{{ request.attachmentSize }} · تم التحقق من الفريق</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="flex items-center gap-1 rounded-lg border border-solar-border-card bg-white px-2.5 py-1.5 text-xs font-semibold text-solar-text-body hover:border-solar-navy hover:text-solar-navy transition-colors"
                    @click="$emit('unavailable', 'معاينة الملف')"
                  >
                    <Eye class="size-3.5" aria-hidden="true" />
                    معاينة
                  </button>
                  <button
                    type="button"
                    class="flex items-center gap-1 rounded-lg border border-solar-border-card bg-white px-2.5 py-1.5 text-xs font-semibold text-solar-text-body hover:border-solar-navy hover:text-solar-navy transition-colors"
                    @click="$emit('unavailable', 'تحميل الملف')"
                  >
                    <Download class="size-3.5" aria-hidden="true" />
                    تحميل
                  </button>
                </div>
              </div>
            </section>
          </div>

          <!-- الفوتر -->
          <div class="flex items-center justify-between gap-3 border-t border-solar-border-card px-6 py-4">
            <button
              type="button"
              @click="close"
              class="rounded-lg border border-solar-border-card px-4 py-2 text-sm font-semibold text-solar-text-body hover:bg-solar-bg-subtle transition-colors"
            >
              إغلاق
            </button>
            <button
              type="button"
              @click="goToSubmit"
              class="btn-primary flex items-center gap-2 text-sm"
            >
              <ArrowLeft class="size-4" aria-hidden="true" />
              الانتقال لتقديم عرض
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
