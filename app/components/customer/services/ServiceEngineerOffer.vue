<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { CircleCheck, FileText, UserRound } from 'lucide-vue-next'
import type { CustomerServiceOffer } from '../../../composables/useCustomerServiceProject'

const props = withDefaults(
  defineProps<{
    offer: CustomerServiceOffer
    locked?: boolean
    confirming?: boolean
    busy?: boolean
  }>(),
  {
    locked: false,
    confirming: false,
    busy: false,
  },
)

const emit = defineEmits<{
  accept: []
  cancel: []
  confirm: []
}>()

const config = useRuntimeConfig()
const confirmButton = ref<HTMLButtonElement | null>(null)
const imageFailed = ref(false)

const engineerName = computed(() =>
  props.offer.engineer?.name?.trim() || 'مهندس',
)

const engineerProfileUrl = computed(() => {
  const id = Number(props.offer.engineer?.id)

  if (!Number.isSafeInteger(id) || id <= 0) return null

  return `/customer/engineers/${id}`
})

function validHttpUrl(value: string): string {
  try {
    const url = new URL(value)

    if (
      !['http:', 'https:'].includes(url.protocol)
      || url.username
      || url.password
    ) {
      return ''
    }

    return url.href
  } catch {
    return ''
  }
}

const engineerImage = computed(() => {
  const path = props.offer.engineer?.profile_photo_path?.trim()

  if (!path) return ''

  if (/^https?:\/\//i.test(path)) {
    return validHttpUrl(path)
  }

  if (
    path.startsWith('//')
    || /[\\:\u0000-\u001f\u007f?#%]/.test(path)
  ) {
    return ''
  }

  const segments = path.replace(/^\/+/, '').split('/')

  if (
    segments.some(segment =>
      !segment || segment === '.' || segment === '..',
    )
  ) {
    return ''
  }

  const base = validHttpUrl(
    String(config.public.assetBaseUrl || ''),
  )

  if (!base) return ''

  const baseUrl = new URL(base)

  if (baseUrl.search || baseUrl.hash) return ''

  const encodedPath = segments
    .map(segment => encodeURIComponent(segment))
    .join('/')

  return `${base.replace(/\/+$/, '')}/${encodedPath}`
})

watch(engineerImage, () => {
  imageFailed.value = false
})

const experienceYears = computed<number | null>(() => {
  const raw = props.offer.engineer?.years_of_experience

  if (
    raw === null
    || raw === undefined
    || String(raw).trim() === ''
  ) {
    return null
  }

  const value = Number(raw)

  return Number.isInteger(value) && value >= 0
    ? value
    : null
})

const price = computed<number | null>(() => {
  const raw = props.offer.proposed_cost

  if (
    raw === null
    || raw === undefined
    || String(raw).trim() === ''
  ) {
    return null
  }

  const value = Number(raw)

  return Number.isFinite(value) && value >= 0
    ? value
    : null
})

const priceLabel = computed(() => {
  if (price.value === null) return 'غير متاحة'

  return new Intl.NumberFormat('ar', {
    maximumFractionDigits: 2,
  }).format(price.value)
})

const durationDays = computed<number | null>(() => {
  const value = Number(props.offer.execution_time_days)

  return Number.isSafeInteger(value) && value > 0
    ? value
    : null
})

const accepted = computed(() =>
  props.offer.status === 'accepted',
)

const statusLabel = computed(() => {
  switch (props.offer.status) {
    case 'accepted':
      return 'تم قبول العرض'
    case 'rejected':
      return 'عرض مرفوض'
    case 'pending':
      return 'بانتظار قرارك'
    default:
      return 'حالة العرض غير معروفة'
  }
})

const statusClasses = computed(() => {
  switch (props.offer.status) {
    case 'accepted':
      return 'bg-emerald-50 text-emerald-800'
    case 'rejected':
      return 'bg-red-50 text-red-800'
    default:
      return 'bg-slate-100 text-slate-700'
  }
})

const attachmentName = computed(() => {
  const path = props.offer.proposal_file

  if (!path) return ''

  const cleanPath = path.split(/[?#]/)[0] || ''
  const segments = cleanPath.split(/[\\/]/).filter(Boolean)

  return segments.at(-1)?.slice(0, 200) || 'مرفق العرض'
})

const canAccept = computed(() =>
  props.offer.status === 'pending'
  && !props.locked
  && !props.busy
  && price.value !== null
  && durationDays.value !== null,
)

const acceptButtonLabel = computed(() => {
  if (accepted.value) return 'تم قبول العرض'

  if (props.offer.status === 'rejected') {
    return 'عرض مرفوض'
  }

  if (props.busy && props.confirming) {
    return 'جارٍ حفظ القبول…'
  }

  return 'قبول العرض'
})

function requestAcceptance() {
  if (!canAccept.value || props.confirming) return

  emit('accept')
}

function confirmAcceptance() {
  if (!canAccept.value || !props.confirming) return

  emit('confirm')
}

function cancelAcceptance() {
  if (props.busy) return

  emit('cancel')
}

watch(
  () => props.confirming,
  async value => {
    if (!value) return

    await nextTick()

    if (props.confirming && !props.busy) {
      confirmButton.value?.focus()
    }
  },
)
</script>

<template>
  <article
    class="solar-card min-w-0 overflow-hidden p-0 sm:p-0"
    :aria-labelledby="`offer-${offer.id}`"
    :aria-busy="busy && confirming"
  >
    <div
      v-if="accepted"
      class="flex items-center gap-2 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-800"
    >
      <CircleCheck class="size-4 shrink-0" aria-hidden="true" />
      تم قبول هذا العرض
    </div>

    <div class="p-5 sm:p-8">
      <div
        class="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"
      >
        <div class="flex min-w-0 items-center gap-4">
          <div
            class="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100"
          >
            <img
              v-if="engineerImage && !imageFailed"
              :src="engineerImage"
              :alt="`صورة ${engineerName}`"
              width="64"
              height="64"
              loading="lazy"
              class="size-full object-cover"
              @error="imageFailed = true"
            >

            <UserRound
              v-else
              class="size-8 text-slate-400"
              aria-hidden="true"
            />
          </div>

          <div class="min-w-0">
            <h3
              :id="`offer-${offer.id}`"
              class="break-words text-lg font-bold text-solar-text-heading"
            >
              <NuxtLink
                v-if="engineerProfileUrl"
                :to="engineerProfileUrl"
                class="rounded hover:underline focus-visible:ring-2 focus-visible:ring-solar-yellow"
              >
                {{ engineerName }}
              </NuxtLink>

              <span v-else>{{ engineerName }}</span>
            </h3>

            <p class="mt-2 text-xs text-solar-text-muted">
              <template v-if="experienceYears !== null">
                سنوات الخبرة: {{ experienceYears }}
              </template>

              <template v-else>
                سنوات الخبرة غير متاحة
              </template>
            </p>

            <span
              class="mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold"
              :class="statusClasses"
            >
              {{ statusLabel }}
            </span>
          </div>
        </div>

        <dl
          class="grid shrink-0 grid-cols-2 gap-5 rounded-xl bg-solar-status-info-bg p-4 text-center"
        >
          <div>
            <dt class="text-xs text-solar-text-muted">
              التكلفة المقترحة
            </dt>

            <dd class="mt-2 text-xl font-bold text-solar-text-heading">
              {{ priceLabel }}
            </dd>

            <dd class="mt-1 text-[11px] text-solar-text-muted">
              العملة غير محددة
            </dd>
          </div>

          <div>
            <dt class="text-xs text-solar-text-muted">
              مدة التنفيذ
            </dt>

            <dd class="mt-2 text-xl font-bold text-solar-text-heading">
              {{ durationDays === null ? 'غير متاحة' : durationDays }}
            </dd>

            <dd
              v-if="durationDays !== null"
              class="mt-1 text-[11px] text-solar-text-muted"
            >
              يوم
            </dd>
          </div>
        </dl>
      </div>

      <section class="mt-6 rounded-xl bg-solar-bg-page p-5">
        <h4
          class="flex items-center gap-2 text-sm font-bold text-solar-text-heading"
        >
          <FileText class="size-4 shrink-0" aria-hidden="true" />
          المقترح الفني
        </h4>

        <p
          class="mt-3 whitespace-pre-line break-words text-sm leading-7 text-solar-text-body"
        >
          {{ offer.technical_proposal?.trim() || 'لا يوجد وصف فني مرفق.' }}
        </p>
      </section>

      <div
        class="mt-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-start"
      >
        <div class="min-w-0 text-xs text-solar-text-muted">
          <template v-if="attachmentName">
            <p class="flex items-start gap-2">
              <FileText
                class="size-4 shrink-0"
                aria-hidden="true"
              />

              <span class="break-all">{{ attachmentName }}</span>
            </p>

            <p class="mt-2 leading-6">
              المرفق محفوظ؛ التنزيل غير متاح حاليًا.
            </p>
          </template>

          <p v-else>
            لا توجد مرفقات لهذا العرض.
          </p>
        </div>

        <div class="flex shrink-0 flex-wrap gap-3">
          <NuxtLink
            v-if="engineerProfileUrl"
            :to="engineerProfileUrl"
            class="rounded-lg bg-solar-status-info-bg px-4 py-3 text-xs font-bold text-solar-text-heading focus-visible:ring-2 focus-visible:ring-solar-yellow"
          >
            عرض ملف المهندس
          </NuxtLink>

          <button
            type="button"
            :disabled="!canAccept || confirming"
            class="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-xs font-bold text-white focus-visible:ring-2 focus-visible:ring-solar-yellow disabled:cursor-not-allowed disabled:opacity-60"
            :class="accepted ? 'bg-emerald-700' : 'bg-solar-navy'"
            @click="requestAcceptance"
          >
            <CircleCheck
              v-if="accepted"
              class="size-4"
              aria-hidden="true"
            />

            {{ acceptButtonLabel }}
          </button>
        </div>
      </div>

      <section
        v-if="confirming && offer.status === 'pending'"
        class="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4"
        :aria-labelledby="`confirm-offer-${offer.id}`"
        @keydown.esc.stop.prevent="cancelAcceptance"
      >
        <h4
          :id="`confirm-offer-${offer.id}`"
          class="text-sm font-bold text-solar-text-heading"
        >
          تأكيد قبول العرض
        </h4>

        <p class="mt-2 text-sm leading-7 text-solar-text-body">
          هل تؤكد قبول عرض {{ engineerName }}
          بقيمة {{ priceLabel }}؟
          سيُحفظ قرارك، ويُغلق الطلب أمام قبول العروض الأخرى.
        </p>

        <div class="mt-4 flex flex-wrap gap-3">
          <button
            ref="confirmButton"
            type="button"
            :disabled="!canAccept"
            class="rounded-lg bg-solar-navy px-4 py-2 text-sm font-bold text-white focus-visible:ring-2 focus-visible:ring-solar-yellow disabled:cursor-not-allowed disabled:opacity-60"
            @click="confirmAcceptance"
          >
            {{ busy ? 'جارٍ حفظ القبول…' : 'تأكيد قبول العرض' }}
          </button>

          <button
            type="button"
            :disabled="busy"
            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-solar-text-heading focus-visible:ring-2 focus-visible:ring-solar-yellow disabled:cursor-not-allowed disabled:opacity-60"
            @click="cancelAcceptance"
          >
            تراجع
          </button>
        </div>
      </section>
    </div>
  </article>
</template>