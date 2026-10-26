<script setup lang="ts">
import {
  ArrowRight,
  Award,
  BatteryCharging,
  Droplets,
  FileText,
  Grid3X3,
  LoaderCircle,
  RefreshCw,
  SlidersHorizontal,
  Star,
  ThermometerSun,
} from 'lucide-vue-next'

import EngineerProfileHeader from '../../../components/customer/engineers/profile/EngineerProfileHeader.vue'
import EngineerProfileTabs from '../../../components/customer/engineers/profile/EngineerProfileTabs.vue'
import EngineerProjectCard from '../../../components/customer/engineers/profile/EngineerProjectCard.vue'

import { useEngineerPublicProfile } from '~/composables/useEngineerPublicProfile'

definePageMeta({
  layout: 'customer',
})

const {
  engineer,
  activeTab,
  backQuery,
  loading,
  error,
  portfolioError,
  ratingError,
  noticeMessage,
  loadProfile,
  selectTab,
  requestService,
  sendMessage,
} = useEngineerPublicProfile()

const backLocation = computed(() => ({
  path: '/customer/engineers',
  query: backQuery.value,
}))

useSeoMeta({
  title: () =>
    engineer.value
      ? `${engineer.value.name} | SolarHub`
      : 'الملف الشخصي للمهندس | SolarHub',
})
</script>

<template>
  <div class="flex min-w-0 flex-col gap-6">
    <!-- مسار التنقل -->
    <nav
      class="flex flex-wrap items-center gap-2 text-xs text-solar-text-muted"
      aria-label="مسار التنقل"
    >
      <NuxtLink
        to="/customer/dashboard"
        class="hover:text-solar-text-heading"
      >
        الرئيسية
      </NuxtLink>

      <span aria-hidden="true">/</span>

      <NuxtLink
        :to="backLocation"
        class="hover:text-solar-text-heading"
      >
        دليل المهندسين المعتمدين
      </NuxtLink>

      <template v-if="engineer">
        <span aria-hidden="true">/</span>

        <span class="font-bold text-solar-text-heading">
          {{ engineer.name }}
        </span>
      </template>
    </nav>

    <!-- تحميل الملف -->
    <section
      v-if="loading"
      class="solar-card px-5 py-16 text-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <LoaderCircle
        class="mx-auto size-9 animate-spin text-solar-navy"
        aria-hidden="true"
      />

      <p class="mt-4 text-sm text-solar-text-muted">
        جارٍ تحميل الملف الشخصي للمهندس...
      </p>
    </section>

    <!-- تعذر تحميل الملف -->
    <section
      v-else-if="error"
      class="rounded-2xl border border-red-200 bg-red-50 px-5 py-12 text-center"
      role="alert"
    >
      <h1 class="text-xl font-bold text-red-800">
        تعذر عرض الملف الشخصي
      </h1>

      <p class="mt-3 text-sm leading-7 text-red-700">
        {{ error }}
      </p>

      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-solar-navy px-5 py-3 text-sm font-bold text-white focus-visible:ring-2 focus-visible:ring-solar-yellow"
          @click="loadProfile"
        >
          <RefreshCw class="size-4" aria-hidden="true" />
          إعادة المحاولة
        </button>

        <NuxtLink
          :to="backLocation"
          class="inline-flex items-center gap-2 rounded-lg border border-solar-border-card bg-white px-5 py-3 text-sm font-bold text-solar-text-heading"
        >
          <ArrowRight class="size-4" aria-hidden="true" />
          العودة إلى الدليل
        </NuxtLink>
      </div>
    </section>

    <!-- بيانات المهندس -->
    <template v-else-if="engineer">
      <EngineerProfileHeader
        :engineer="engineer"
        @service="requestService"
        @message="sendMessage"
      />

      <p
        v-if="ratingError"
        class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-7 text-amber-800"
        role="status"
      >
        {{ ratingError }}
      </p>

      <EngineerProfileTabs
        :active-tab="activeTab"
        :review-count="engineer.verifiedReviews"
        @select="selectTab"
      />

      <!-- نظرة عامة -->
      <template v-if="activeTab === 'overview'">
        <section
          class="solar-card p-5 sm:p-7"
          aria-labelledby="bio-heading"
        >
          <h2
            id="bio-heading"
            class="flex items-center gap-2 text-lg font-extrabold text-solar-text-heading"
          >
            <FileText
              class="size-5 text-amber-700"
              aria-hidden="true"
            />

            النبذة المهنية
          </h2>

          <p class="mt-4 text-sm leading-8 text-solar-text-body">
            {{ engineer.professionalBio }}
          </p>
        </section>

        <section
          class="solar-card p-5 sm:p-7"
          aria-labelledby="expertise-heading"
        >
          <h2
            id="expertise-heading"
            class="flex items-center gap-2 text-lg font-extrabold text-solar-text-heading"
          >
            <SlidersHorizontal
              class="size-5 text-amber-700"
              aria-hidden="true"
            />

            مجالات التخصص
          </h2>

          <div
            v-if="engineer.expertise.length"
            class="mt-5 grid gap-4 md:grid-cols-2"
          >
            <article
              v-for="item in engineer.expertise"
              :key="item.title"
              class="rounded-xl bg-solar-bg-subtle p-5"
            >
              <h3
                class="flex items-center gap-2 text-sm font-extrabold text-solar-text-heading"
              >
                <Grid3X3
                  v-if="item.icon === 'grid'"
                  class="size-5 text-amber-700"
                  aria-hidden="true"
                />

                <Droplets
                  v-else-if="item.icon === 'droplet'"
                  class="size-5 text-amber-700"
                  aria-hidden="true"
                />

                <BatteryCharging
                  v-else-if="item.icon === 'battery'"
                  class="size-5 text-amber-700"
                  aria-hidden="true"
                />

                <ThermometerSun
                  v-else
                  class="size-5 text-amber-700"
                  aria-hidden="true"
                />

                {{ item.title }}
              </h3>

              <p
                v-if="item.description"
                class="mt-2 text-xs leading-6 text-solar-text-muted"
              >
                {{ item.description }}
              </p>
            </article>
          </div>

          <p
            v-else
            class="mt-4 text-sm leading-7 text-solar-text-muted"
          >
            لم تُضف تخصصات لهذا المهندس.
          </p>
        </section>
      </template>

      <!-- معرض المشاريع -->
      <section
        v-else-if="activeTab === 'projects'"
        aria-labelledby="projects-heading"
      >
        <h2
          id="projects-heading"
          class="mb-5 text-lg font-extrabold text-solar-text-heading"
        >
          معرض مشاريع المهندس
        </h2>

        <div
          v-if="portfolioError"
          class="rounded-xl border border-red-200 bg-red-50 p-5"
          role="alert"
        >
          <p class="text-sm leading-7 text-red-700">
            {{ portfolioError }}
          </p>

          <button
            type="button"
            class="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-red-700"
            @click="loadProfile"
          >
            <RefreshCw class="size-4" aria-hidden="true" />
            إعادة المحاولة
          </button>
        </div>

        <div
          v-else-if="engineer.projects.length"
          class="grid gap-5 md:grid-cols-2"
        >
          <EngineerProjectCard
            v-for="project in engineer.projects"
            :key="project.id"
            :project="project"
          />
        </div>

        <div
          v-else
          class="rounded-2xl border border-dashed border-solar-border-card bg-white px-5 py-14 text-center"
        >
          <Grid3X3
            class="mx-auto size-10 text-solar-text-muted"
            aria-hidden="true"
          />

          <h3
            class="mt-4 text-lg font-bold text-solar-text-heading"
          >
            لا توجد مشاريع متاحة للعرض
          </h3>

          <p class="mt-2 text-sm leading-7 text-solar-text-muted">
            ستظهر أعمال المهندس هنا عند إضافتها إلى ملفه.
          </p>
        </div>
      </section>

      <!-- الشهادات -->
      <section
        v-else-if="activeTab === 'certificates'"
        class="solar-card p-5 sm:p-7"
        aria-labelledby="certificates-heading"
      >
        <h2
          id="certificates-heading"
          class="flex items-center gap-2 text-lg font-extrabold text-solar-text-heading"
        >
          <Award
            class="size-5 text-amber-700"
            aria-hidden="true"
          />

          الشهادات والاعتمادات المهنية
        </h2>

        <div
          class="mt-5 rounded-xl border border-dashed border-solar-border-card bg-solar-bg-subtle px-5 py-10 text-center"
        >
          <Award
            class="mx-auto size-9 text-solar-text-muted"
            aria-hidden="true"
          />

          <h3 class="mt-3 font-bold text-solar-text-heading">
            الشهادات غير متاحة للعرض حاليًا
          </h3>

          <p class="mt-2 text-sm leading-7 text-solar-text-muted">
            يمكنك الاطلاع على حالة اعتماد حساب المهندس
            ورقم ترخيصه في أعلى الصفحة.
          </p>
        </div>
      </section>

      <!-- التقييمات -->
      <section
        v-else-if="activeTab === 'reviews'"
        class="solar-card p-5 sm:p-7"
        aria-labelledby="reviews-heading"
      >
        <h2
          id="reviews-heading"
          class="flex items-center gap-2 text-lg font-extrabold text-solar-text-heading"
        >
          <Star
            class="size-5 text-amber-700"
            aria-hidden="true"
          />

          التقييمات والآراء
        </h2>

        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <div class="rounded-xl bg-solar-bg-subtle p-5">
            <p class="text-xs text-solar-text-muted">
              متوسط التقييم
            </p>

            <strong
              class="mt-2 block text-2xl text-solar-text-heading"
            >
              {{ engineer.rating?.toFixed(1) ?? 'غير متاح' }}
            </strong>
          </div>

          <div class="rounded-xl bg-solar-bg-subtle p-5">
            <p class="text-xs text-solar-text-muted">
              عدد التقييمات
            </p>

            <strong
              class="mt-2 block text-2xl text-solar-text-heading"
            >
              {{ engineer.verifiedReviews ?? 'غير متاح' }}
            </strong>
          </div>
        </div>

        <p
          class="mt-5 rounded-xl border border-solar-border-card p-4 text-sm leading-7 text-solar-text-muted"
        >
          تفاصيل التقييمات وتعليقات العملاء غير متاحة
          للعرض حاليًا.
        </p>
      </section>

      <p
        v-if="noticeMessage"
        class="rounded-xl bg-solar-bg-subtle p-4 text-sm leading-7 text-solar-text-heading"
        role="status"
        aria-live="polite"
      >
        {{ noticeMessage }}
      </p>
    </template>
  </div>
</template>