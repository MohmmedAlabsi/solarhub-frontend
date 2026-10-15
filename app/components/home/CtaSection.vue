<script setup lang="ts">
import { ArrowLeft, Clock, FileCheck2, ShieldCheck } from 'lucide-vue-next'

const highlights = [
  { icon: Clock, title: 'استجابة سريعة خلال 24 ساعة', desc: 'عروض أسعار من عدة متاجر' },
  { icon: FileCheck2, title: 'دراسة مجانية للأحمال', desc: 'بواسطة مهندس معتمد' },
  { icon: ShieldCheck, title: 'ضمان وخدمة ما بعد البيع', desc: 'متابعة حتى التشغيل الكامل' },
]
</script>

<template>
  <section class="bg-white py-16 lg:py-24">
    <div class="container-page">
      <div class="relative overflow-hidden rounded-3xl bg-ink-800 px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
        <div class="pointer-events-none absolute -start-24 -top-24 size-72 rounded-full bg-brand-400/10 blur-3xl" aria-hidden="true" />
        <div class="relative grid items-center gap-10 lg:grid-cols-2">
          <div class="flex flex-col gap-5">
            <h2 class="text-balance text-2xl font-bold leading-snug text-white md:text-3xl">
              هل تخطط لتركيب نظام طاقة شمسية لمنزلك، مزرعتك أو مصنعك؟
            </h2>
            <p class="text-pretty text-sm leading-relaxed text-ink-400 md:text-base">
              أخبرنا بمواصفات مشروعك واحتياجاتك، وسنقوم بربطك بأفضل المهندسين والمتاجر المعتمدة لتقديم عروض أسعار تنافسية
              خلال 24 ساعة.
            </p>
            <NuxtLink to="/auth/register" class="btn-primary w-fit">
              اطلب عرض سعر لمشروعك الآن
              <ArrowLeft class="size-4" aria-hidden="true" />
            </NuxtLink>
          </div>

          <ul class="flex flex-col gap-3">
            <li
              v-for="item in highlights"
              :key="item.title"
              class="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <span class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-400 text-ink">
                <component :is="item.icon" class="size-5" aria-hidden="true" />
              </span>
              <div class="flex flex-col gap-0.5">
                <span class="text-sm font-semibold text-white">{{ item.title }}</span>
                <span class="text-xs text-ink-400">{{ item.desc }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
