<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, Info, Tags } from 'lucide-vue-next'
import ServiceProjectSummary from '../../../components/customer/services/ServiceProjectSummary.vue'
import ServiceEngineerOffer from '../../../components/customer/services/ServiceEngineerOffer.vue'
import { useCustomerServiceProject } from '../../../composables/useCustomerServiceProject'

definePageMeta({
  layout: 'customer',
})

const {
  project,
  offers,
  loading,
  error,
  offersError,
  notFound,
  statusLabel,
  noticeMessage,
  acceptanceError,
  accepting,
  pendingOffer,
  canAcceptOffers,
  requiresRefresh,
  loadProject,
  requestAcceptance,
  cancelAcceptance,
  confirmAcceptance,
} = useCustomerServiceProject()

const offersCount = computed<number | null>(() => {
  if (
    loading.value
    || error.value
    || offersError.value
    || !project.value
  ) {
    return null
  }

  return offers.value.length
})

const offersNotice = computed(() => {
  if (!project.value) return ''

  switch (project.value.status) {
    case 'open_for_bids':
      return 'راجع المقترح والتكلفة ومدة التنفيذ قبل قبول العرض.'
    case 'awarded':
      return 'تم قبول عرض لهذا الطلب، ولا يمكن قبول عرض آخر.'
    case 'in_progress':
      return 'الطلب قيد التنفيذ، وقبول العروض مغلق.'
    case 'completed':
      return 'اكتمل الطلب، وقبول العروض مغلق.'
    case 'cancelled':
      return 'هذا الطلب ملغى، ولا يمكن قبول عروضه.'
    default:
      return 'قبول العروض غير متاح لهذه الحالة.'
  }
})

useSeoMeta({
  title: () => {
    if (project.value) {
      return `الطلب #${project.value.id} وعروض المهندسين | SolarHub`
    }

    return 'تفاصيل طلب الخدمة | SolarHub'
  },
})
</script>

<template>
  <div dir="rtl" class="flex min-w-0 flex-col gap-6">
    <nav
      class="flex flex-wrap items-center gap-2 text-xs text-solar-text-muted"
      aria-label="مسار التنقل"
    >
      <NuxtLink to="/customer/dashboard">
        الرئيسية
      </NuxtLink>

      <span aria-hidden="true">‹</span>

      <NuxtLink to="/customer/services/history">
        طلبات الخدمات الخاصة بي
      </NuxtLink>

      <span aria-hidden="true">‹</span>

      <span class="text-solar-text-heading">
        تفاصيل الطلب
      </span>
    </nav>

    <header
      class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"
    >
      <div>
        <h1 class="text-2xl font-bold text-solar-text-heading md:text-3xl">
          تفاصيل الطلب وعروض المهندسين
        </h1>

        <p class="mt-3 text-sm leading-7 text-solar-text-muted">
          راجع بيانات طلبك والعروض المقدمة قبل اتخاذ قرار القبول.
        </p>
      </div>

      <NuxtLink
        to="/customer/services/history"
        class="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-solar-border-card bg-white px-4 py-3 text-xs font-bold text-solar-text-heading focus-visible:ring-2 focus-visible:ring-solar-yellow"
      >
        <ArrowRight class="size-4" aria-hidden="true" />
        العودة إلى طلباتي
      </NuxtLink>
    </header>

    <p
      v-if="noticeMessage"
      role="status"
      aria-live="polite"
      class="rounded-xl bg-emerald-50 p-4 text-sm leading-7 text-emerald-800"
    >
      {{ noticeMessage }}
    </p>

    <section
      v-if="loading"
      role="status"
      aria-live="polite"
      class="rounded-xl border border-solar-border-card bg-white px-5 py-14 text-center text-sm text-solar-text-muted"
    >
      جارٍ تحميل الطلب وعروض المهندسين…
    </section>

    <section
      v-else-if="error"
      role="alert"
      class="rounded-xl border border-red-200 bg-red-50 p-6"
    >
      <p class="text-sm leading-7 text-red-800">
        {{ error }}
      </p>

      <button
        type="button"
        :disabled="accepting"
        class="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-bold text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
        @click="loadProject"
      >
        إعادة المحاولة
      </button>
    </section>

    <section
      v-else-if="notFound"
      class="rounded-xl border border-dashed border-solar-border-card bg-white px-5 py-14 text-center"
    >
      <h2 class="text-xl font-bold text-solar-text-heading">
        الطلب غير موجود ضمن طلبات حسابك
      </h2>

      <p class="mt-3 text-sm leading-7 text-solar-text-muted">
        تحقق من رقم الطلب ومن تسجيل الدخول بالحساب الذي نشره.
      </p>

      <NuxtLink
        to="/customer/services/history"
        class="mt-5 inline-flex rounded-lg bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark"
      >
        عرض طلباتي
      </NuxtLink>
    </section>

    <template v-else-if="project">
      <ServiceProjectSummary
        :project="project"
        :offers-count="offersCount"
      />

      <section
        class="flex min-w-0 flex-col gap-5"
        aria-labelledby="offers-heading"
      >
        <div
          class="flex flex-col justify-between gap-4 rounded-xl bg-solar-status-info-bg p-5 sm:flex-row sm:items-center"
        >
          <div>
            <h2
              id="offers-heading"
              class="flex flex-wrap items-center gap-2 text-lg font-bold text-solar-text-heading"
            >
              <Tags class="size-5" aria-hidden="true" />

              عروض المهندسين

              <span
                v-if="offersCount !== null"
                class="rounded-full bg-solar-navy-dark px-3 py-1 text-xs text-white"
              >
                {{ offersCount }}
              </span>
            </h2>

            <p class="mt-2 text-xs leading-6 text-solar-text-muted">
              حالة الطلب: {{ statusLabel }}
            </p>
          </div>

          <button
            type="button"
            :disabled="accepting"
            class="shrink-0 self-start rounded-lg border border-solar-border-card bg-white px-4 py-2 text-xs font-bold text-solar-text-heading disabled:cursor-not-allowed disabled:opacity-50"
            @click="loadProject"
          >
            تحديث البيانات
          </button>
        </div>

        <p
          class="flex items-start gap-2 rounded-xl border border-solar-border-card bg-white p-4 text-sm leading-7 text-solar-text-body"
        >
          <Info
            class="mt-1 size-4 shrink-0 text-amber-700"
            aria-hidden="true"
          />

          {{ offersNotice }}
        </p>

        <section
          v-if="acceptanceError"
          role="alert"
          class="rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <p class="text-sm leading-7 text-red-800">
            {{ acceptanceError }}
          </p>

          <button
            type="button"
            :disabled="accepting"
            class="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-bold text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
            @click="loadProject"
          >
            تحديث حالة الطلب
          </button>
        </section>

        <section
          v-if="offersError"
          role="alert"
          class="rounded-xl border border-amber-200 bg-amber-50 p-5"
        >
          <p class="text-sm leading-7 text-amber-900">
            {{ offersError }}
          </p>

          <button
            type="button"
            :disabled="accepting"
            class="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-bold text-amber-900 disabled:cursor-not-allowed disabled:opacity-50"
            @click="loadProject"
          >
            إعادة تحميل العروض
          </button>
        </section>

        <template v-else>
          <p
            v-if="requiresRefresh && !acceptanceError"
            role="status"
            class="rounded-xl bg-amber-50 p-4 text-sm leading-7 text-amber-900"
          >
            حدّث بيانات الطلب للتحقق من حالته قبل قبول أي عرض.
          </p>

          <ServiceEngineerOffer
            v-for="offer in offers"
            :key="offer.id"
            :offer="offer"
            :locked="!canAcceptOffers"
            :busy="accepting"
            :confirming="pendingOffer?.id === offer.id"
            @accept="requestAcceptance(offer.id)"
            @cancel="cancelAcceptance"
            @confirm="confirmAcceptance"
          />

          <div
            v-if="!offers.length"
            class="rounded-xl border border-dashed border-solar-border-card bg-white px-5 py-14 text-center"
          >
            <Tags
              class="mx-auto size-10 text-solar-text-muted"
              aria-hidden="true"
            />

            <h3 class="mt-4 text-lg font-bold text-solar-text-heading">
              لا توجد عروض لهذا الطلب
            </h3>

            <p
              v-if="project.status === 'open_for_bids'"
              class="mt-3 text-sm leading-7 text-solar-text-muted"
            >
              ستظهر العروض هنا عندما يقدمها المهندسون.
            </p>
          </div>
        </template>
      </section>
    </template>
  </div>
</template>