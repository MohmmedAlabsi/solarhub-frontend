<script setup lang="ts">
import { CheckCircle, Download, Eye, FileText, Loader2, PlayCircle, Trash2, X } from 'lucide-vue-next'
import type { EngineerOffer } from '~~/app/composables/useEngineerOffers'

const props = defineProps<{
  modelValue: boolean
  offer: EngineerOffer | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'withdrawn', offerId: number): void
  (e: 'updated'): void
}>()

const { $api } = useNuxtApp()
const isWithdrawing = ref(false)
const actionError = ref('')
const actionNotice = ref('')

// ===== دورة حياة طلب الخدمة للعرض المقبول =====
type LifecycleAction = 'start' | 'mark-done'
const pendingAction = ref<LifecycleAction | null>(null)
const isActing = ref(false)

const stage = computed(() => {
  const o = props.offer
  if (!o || o.status !== 'approved') return null
  if (o.requestStatus === 'completed') return 'completed'
  if (o.requestStatus === 'in_progress') return o.requestDoneAt ? 'awaiting_confirmation' : 'in_progress'
  if (o.requestStatus === 'awarded') return 'awarded'
  return null
})

watch(() => props.offer?.rawId, () => {
  actionError.value = ''
  actionNotice.value = ''
  pendingAction.value = null
})

async function runLifecycleAction() {
  if (!props.offer || !pendingAction.value) return
  isActing.value = true
  actionError.value = ''
  try {
    const res: any = await $api(`/service-requests/${props.offer.rawRequestId}/${pendingAction.value}`, { method: 'POST' })
    actionNotice.value = res?.message || (pendingAction.value === 'start' ? 'تم بدء التنفيذ.' : 'تم إبلاغ العميل بإنهاء العمل.')
    pendingAction.value = null
    emit('updated')
  } catch (err: any) {
    actionError.value = err?.data?.message || 'تعذر تنفيذ الإجراء، حاول مرة أخرى.'
  } finally {
    isActing.value = false
  }
}

function close() { emit('update:modelValue', false) }

function handleKeydown(event: KeyboardEvent) {
  if (props.modelValue && event.key === 'Escape') close()
}

function openAttachment() {
  if (props.offer?.attachmentUrl) {
    window.open(props.offer.attachmentUrl, '_blank')
  }
}

async function handleWithdraw() {
  if (!props.offer) return
  if (!confirm(`هل أنت متأكد من رغبتك في سحب العرض ${props.offer.id}؟`)) return

  try {
    isWithdrawing.value = true
    await $api(`/offers/${props.offer.rawId}`, { method: 'DELETE' })
    emit('withdrawn', props.offer.rawId)
    close()
  } catch (err: any) {
    actionError.value = err?.data?.message || 'تعذر سحب العرض'
  } finally {
    isWithdrawing.value = false
  }
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
            <section v-if="offer.attachmentName || offer.attachmentUrl">
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
                    <p class="text-xs font-semibold text-solar-text-heading">{{ offer.attachmentName || 'ملف العرض الفني' }}</p>
                    <p v-if="offer.attachmentSize" class="text-[11px] text-solar-text-muted">{{ offer.attachmentSize }}</p>
                  </div>
                </div>
                <div v-if="offer.attachmentUrl" class="flex items-center gap-2">
                  <button
                    type="button"
                    class="flex items-center gap-1 rounded-lg border border-solar-border-card bg-white px-2.5 py-1.5 text-xs font-semibold text-solar-text-body hover:border-solar-navy transition-colors"
                    @click="openAttachment"
                  >
                    <Eye class="size-3.5" aria-hidden="true" />
                    معاينة
                  </button>
                  <a
                    :href="offer.attachmentUrl"
                    target="_blank"
                    download
                    class="flex items-center gap-1 rounded-lg border border-solar-border-card bg-white px-2.5 py-1.5 text-xs font-semibold text-solar-text-body hover:border-solar-navy transition-colors"
                  >
                    <Download class="size-3.5" aria-hidden="true" />
                    تحميل
                  </a>
                </div>
              </div>
            </section>
          </div>

          <!-- مرحلة تنفيذ المشروع (للعرض المقبول فقط) -->
          <section v-if="stage" class="mx-6 mb-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs leading-relaxed" data-testid="engineer-lifecycle">
            <h3 class="mb-2 text-sm font-bold text-emerald-900">مرحلة تنفيذ المشروع</h3>
            <p v-if="stage === 'awarded'" class="text-solar-text-body">تم قبول عرضك. ابدأ التنفيذ عندما تكون جاهزاً ليتم إشعار العميل.</p>
            <p v-else-if="stage === 'in_progress'" class="text-solar-text-body">المشروع قيد التنفيذ. عند إنهاء العمل أبلغ العميل ليؤكد الاكتمال.</p>
            <p v-else-if="stage === 'awaiting_confirmation'" class="text-solar-text-body">أبلغت العميل بإنهاء العمل، بانتظار تأكيده للاكتمال.</p>
            <p v-else class="font-bold text-emerald-800">اكتمل المشروع وأكده العميل.</p>

            <div v-if="stage === 'awarded' || stage === 'in_progress'" class="mt-3">
              <div v-if="pendingAction" class="flex flex-wrap items-center gap-2">
                <span class="font-bold text-solar-text-heading">
                  {{ pendingAction === 'start' ? 'تأكيد بدء التنفيذ؟' : 'تأكيد إنهاء العمل وإبلاغ العميل؟' }}
                </span>
                <button type="button" class="btn-primary h-8 px-4 text-xs font-bold gap-1.5" :disabled="isActing" @click="runLifecycleAction">
                  <Loader2 v-if="isActing" class="size-3.5 animate-spin" />
                  <span>نعم، تأكيد</span>
                </button>
                <button type="button" class="btn-outline h-8 px-3 text-xs font-bold" :disabled="isActing" @click="pendingAction = null">تراجع</button>
              </div>
              <button
                v-else-if="stage === 'awarded'"
                type="button"
                class="btn-primary h-9 px-4 text-xs font-bold gap-1.5"
                @click="pendingAction = 'start'"
              >
                <PlayCircle class="size-4" />
                <span>بدء التنفيذ</span>
              </button>
              <button
                v-else
                type="button"
                class="btn-primary h-9 px-4 text-xs font-bold gap-1.5"
                @click="pendingAction = 'mark-done'"
              >
                <CheckCircle class="size-4" />
                <span>تم إنهاء العمل</span>
              </button>
            </div>
          </section>

          <p v-if="actionNotice" class="mx-6 mb-3 rounded-lg bg-emerald-50 p-2.5 text-xs font-bold text-emerald-800" role="status">{{ actionNotice }}</p>
          <p v-if="actionError" class="mx-6 mb-3 rounded-lg bg-red-50 p-2.5 text-xs font-bold text-red-700" role="alert">{{ actionError }}</p>

          <!-- فوتر المودال -->
          <div class="border-t border-solar-border-card px-6 py-4 shrink-0 flex items-center justify-between gap-3">
            <button
              v-if="offer.status === 'pending_review'"
              type="button"
              :disabled="isWithdrawing"
              class="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs sm:text-sm font-bold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
              @click="handleWithdraw"
            >
              <Loader2 v-if="isWithdrawing" class="size-4 animate-spin" />
              <Trash2 v-else class="size-4" />
              <span>{{ isWithdrawing ? 'جاري السحب...' : 'سحب العرض' }}</span>
            </button>
            <div v-else />

            <button
              type="button"
              @click="close"
              class="rounded-lg border border-solar-border-card px-5 py-2 text-xs sm:text-sm font-semibold text-solar-text-body hover:bg-solar-bg-subtle transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
