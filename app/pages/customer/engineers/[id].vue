<script setup lang="ts">
import { ArrowRight, Award, BatteryCharging, Droplets, FileText, Grid3X3, SlidersHorizontal, ThermometerSun } from 'lucide-vue-next'
import EngineerCertificateCard from '../../../components/customer/engineers/profile/EngineerCertificateCard.vue'
import EngineerProfileHeader from '../../../components/customer/engineers/profile/EngineerProfileHeader.vue'
import EngineerProfileTabs from '../../../components/customer/engineers/profile/EngineerProfileTabs.vue'
import EngineerProjectCard from '../../../components/customer/engineers/profile/EngineerProjectCard.vue'
import EngineerReviews from '../../../components/customer/engineers/profile/EngineerReviews.vue'

definePageMeta({ layout: 'customer' })
const { engineer, activeTab, backQuery, noticeMessage, selectTab, requestService, sendMessage } = useEngineerProfile()
useSeoMeta({ title: () => engineer.value ? `${engineer.value.name} | SolarHub` : 'المهندس غير موجود | SolarHub' })
</script>

<template>
  <div class="flex flex-col gap-6">
    <nav class="flex flex-wrap items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/customer/dashboard" class="hover:text-solar-text-heading">الرئيسية</NuxtLink><span>/</span>
      <NuxtLink :to="{ path: '/customer/engineers', query: backQuery }" class="hover:text-solar-text-heading">دليل المهندسين المعتمدين</NuxtLink>
      <template v-if="engineer"><span>/</span><span class="font-bold text-solar-text-heading">{{ engineer.name }}</span></template>
    </nav>

    <template v-if="engineer">
      <EngineerProfileHeader :engineer="engineer" @service="requestService" @message="sendMessage" />
      <EngineerProfileTabs :active-tab="activeTab" :review-count="engineer.verifiedReviews" @select="selectTab" />

      <template v-if="activeTab === 'overview'">
        <section class="solar-card p-5 sm:p-7" aria-labelledby="bio-heading">
          <h2 id="bio-heading" class="flex items-center gap-2 text-lg font-extrabold text-solar-text-heading"><FileText class="size-5 text-amber-700" aria-hidden="true" /> النبذة المهنية</h2>
          <p class="mt-4 text-sm leading-8 text-solar-text-body">{{ engineer.professionalBio }}</p>
        </section>
        <section class="solar-card p-5 sm:p-7" aria-labelledby="expertise-heading">
          <h2 id="expertise-heading" class="flex items-center gap-2 text-lg font-extrabold text-solar-text-heading"><SlidersHorizontal class="size-5 text-amber-700" aria-hidden="true" /> مجالات التخصص الدقيقة</h2>
          <div class="mt-5 grid gap-4 md:grid-cols-2">
            <article v-for="item in engineer.expertise" :key="item.title" class="rounded-xl bg-solar-bg-subtle p-5">
              <h3 class="flex items-center gap-2 text-sm font-extrabold text-solar-text-heading">
                <Grid3X3 v-if="item.icon === 'grid'" class="size-5 text-amber-700" aria-hidden="true" /><Droplets v-else-if="item.icon === 'droplet'" class="size-5 text-amber-700" aria-hidden="true" /><BatteryCharging v-else-if="item.icon === 'battery'" class="size-5 text-amber-700" aria-hidden="true" /><ThermometerSun v-else class="size-5 text-amber-700" aria-hidden="true" />{{ item.title }}
              </h3>
              <p class="mt-2 text-xs leading-6 text-solar-text-muted">{{ item.description }}</p>
            </article>
          </div>
        </section>
      </template>

      <EngineerReviews v-else-if="activeTab === 'reviews'" :engineer="engineer" />
      <section v-else-if="activeTab === 'projects'" aria-labelledby="projects-heading">
        <h2 id="projects-heading" class="sr-only">معرض المشاريع المنفذة</h2>
        <div v-if="engineer.projects.length" class="grid gap-5 md:grid-cols-2">
          <EngineerProjectCard v-for="project in engineer.projects" :key="project.id" :project="project" />
        </div>
        <div v-else class="rounded-2xl border border-dashed border-solar-border-card bg-white px-5 py-14 text-center">
          <Grid3X3 class="mx-auto size-10 text-solar-text-muted" aria-hidden="true" />
          <h3 class="mt-4 text-lg font-bold text-solar-text-heading">لا توجد مشاريع متاحة</h3>
          <p class="mt-2 text-sm text-solar-text-muted">لم تُضف مشاريع لهذا المهندس ضمن البيانات التجريبية بعد.</p>
        </div>
      </section>
      <section v-else-if="activeTab === 'certificates'" class="solar-card p-5 sm:p-7" aria-labelledby="certificates-heading">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 id="certificates-heading" class="flex items-center gap-2 text-lg font-extrabold text-solar-text-heading"><Award class="size-5 text-amber-700" aria-hidden="true" /> الشهادات والاعتمادات المهنية الرسمية</h2>
          <p class="text-xs text-solar-text-muted">بيانات تجريبية موثقة ضمن العرض فقط</p>
        </div>
        <div v-if="engineer.certificates.length" class="mt-5 grid gap-5 md:grid-cols-2">
          <EngineerCertificateCard v-for="certificate in engineer.certificates" :key="certificate.id" :certificate="certificate" />
        </div>
        <div v-else class="mt-5 rounded-xl border border-dashed border-solar-border-card bg-solar-bg-subtle px-5 py-12 text-center">
          <Award class="mx-auto size-9 text-solar-text-muted" aria-hidden="true" /><h3 class="mt-3 font-bold text-solar-text-heading">لا توجد شهادات متاحة</h3><p class="mt-2 text-sm text-solar-text-muted">لم تُضف شهادات لهذا المهندس ضمن البيانات التجريبية بعد.</p>
        </div>
      </section>
    </template>

    <section v-else class="rounded-2xl border border-dashed border-solar-border-card bg-white px-5 py-16 text-center">
      <h1 class="text-2xl font-black text-solar-text-heading">المهندس غير موجود</h1><p class="mt-3 text-sm text-solar-text-muted">تعذر العثور على ملف مهندس مطابق لهذا المعرّف.</p><NuxtLink :to="{ path: '/customer/engineers', query: backQuery }" class="mt-6 inline-flex items-center gap-2 rounded-xl bg-solar-yellow px-5 py-3 text-sm font-bold text-solar-navy-dark"><ArrowRight class="size-4" aria-hidden="true" /> العودة إلى دليل المهندسين</NuxtLink>
    </section>

    <p v-if="noticeMessage" class="fixed bottom-5 left-1/2 z-[70] w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-xl bg-solar-navy-dark px-5 py-3 text-center text-sm font-medium text-white shadow-xl" role="status" aria-live="polite">{{ noticeMessage }}</p>
  </div>
</template>
