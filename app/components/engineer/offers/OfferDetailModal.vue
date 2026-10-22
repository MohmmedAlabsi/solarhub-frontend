<script setup lang="ts">
import { CheckCircle, Download, Eye, FileText, X } from 'lucide-vue-next'
import type { EngineerOffer } from '~~/app/composables/useEngineerOffers'

const props = defineProps<{
  modelValue: boolean
  offer: EngineerOffer | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

function close() { emit('update:modelValue', false) }

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
        v-if="modelValue && offer"
        class="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        dir="rtl"
        :aria-label="`تفاصيل العرض الهندسي ${offer.id}`"
      >
        <div class="fixed inset-0 bg-solar-navy-dark/60 backdrop-blur-sm" aria-hidden="true" @click="close" />

        <div class="relative w-full max-w-lg rounded-2xl border border-solar-border-card bg-white shadow-2xl z-10 max-h-[90vh] flex flex-col">
          <!-- الهيدر -->
          <div class="flex items-center justify-between gap-4 border-b border-solar-border-card px-6 py-4 shrink-0">
            <div class="flex items-center gap-2.5">
              <div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark">
                <FileText class="size-5" />
              </div>
              <div>
                <h3 class="text-base font-black text-solar-text-heading">تفاصيل العرض الهندسي</h3>
                <p class="text-xs font-mono text-solar-text-muted">{{ offer.id }}</p>
              </div>
            </div>
            <button
              type="button"
              @click="close"
              class="flex size-8 items-center justify-center rounded-lg text-solar-text-muted hover:bg-solar-bg-subtle transition-colors"
              aria-label="إغلاق"
            >
              <X class="size-5" />
            </button>
          </div>

          <!-- جسم المودال قابل للتمرير -->
          <div class="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
            <!-- المقترح الفني ومنهجية العمل -->
            <section>
              <div class="mb-3 flex items-center gap-2 text-sm font-bold text-solar-text-heading">
                <FileText class="size-4 text-solar-text-muted" aria-hidden="true" />
                المقترح الفني ومنهجية العمل
              </div>
              <div class="rounded-xl border border-solar-border-card bg-solar-bg-subtle p-4">
                <p class="text-sm text-solar-text-secondary leading-relaxed mb-3">{{ offer.methodology }}</p>
                <!-- قائمة النقاط إن وجدت -->
                <ul v-if="offer.methodologyPoints && offer.methodologyPoints.length" class="flex flex-col gap-2">
                  <li
                    v-for="(point, index) in offer.methodologyPoints"
                    :key="index"
                    class="flex items-start gap-2.5 text-sm text-solar-text-secondary"
                  >
                    <CheckCircle class="size-4 shrink-0 text-emerald-500 mt-0.5" aria-hidden="true" />
                    <span>{{ point }}</span>
                  </li>
                </ul>
              </div>
            </section>

            <!-- ملف العرض الفني المرفق -->
            <section v-if="offer.attachmentName">
              <div class="mb-3 flex items-center gap-2 text-sm font-bold text-solar-text-heading">
                <FileText class="size-4 text-solar-text-muted" aria-hidden="true" />
                ملف العرض الفني المرفق
              </div>
              <div class="flex items-center justify-between gap-3 rounded-xl border border-solar-border-card bg-solar-bg-subtle p-3">
                <div class="flex items-center gap-3">
                  <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
                    <FileText class="size-5 text-red-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-solar-text-heading">{{ offer.attachmentName }}</p>
                    <p v-if="offer.attachmentSize" class="text-[11px] text-solar-text-muted">{{ offer.attachmentSize }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="flex items-center gap-1 rounded-lg border border-solar-border-card bg-white px-2.5 py-1.5 text-xs font-semibold text-solar-text-body hover:border-solar-navy transition-colors"
                  >
                    <Eye class="size-3.5" aria-hidden="true" />
                    معاينة
                  </button>
                  <button
                    type="button"
                    class="flex items-center gap-1 rounded-lg border border-solar-border-card bg-white px-2.5 py-1.5 text-xs font-semibold text-solar-text-body hover:border-solar-navy transition-colors"
                  >
                    <Download class="size-3.5" aria-hidden="true" />
                    تحميل
                  </button>
                </div>
              </div>
            </section>
          </div>

          <!-- فوتر المودال -->
          <div class="border-t border-solar-border-card px-6 py-4 shrink-0">
            <button
              type="button"
              @click="close"
              class="w-full rounded-lg border border-solar-border-card px-4 py-2.5 text-sm font-semibold text-solar-text-body hover:bg-solar-bg-subtle transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
