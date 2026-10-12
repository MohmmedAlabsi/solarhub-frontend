<script setup lang="ts">
import { Mail, MapPin, MessageCircle, Phone, Share2, Sun, Globe } from 'lucide-vue-next'

const columns = [
  {
    title: 'روابط سريعة',
    links: ['تصفح المنتجات', 'المهندسين والاستشاريين', 'المتاجر والوكلاء', 'حاسبة الأحمال', 'عن المنصة'],
  },
  {
    title: 'الدعم والسياسات',
    links: ['الأسئلة الشائعة', 'سياسة الخصوصية', 'الشروط والأحكام', 'سياسة الاسترجاع', 'انضم كمورد أو مهندس'],
  },
]

const contacts = [
  { icon: Mail, label: 'info@solarhub.com' },
  { icon: Phone, label: '+966 500 000 000' },
  { icon: MapPin, label: 'الرياض، المملكة العربية السعودية' },
]

const socials = [
  { icon: MessageCircle, label: 'واتساب' },
  { icon: Globe, label: 'الموقع' },
  { icon: Share2, label: 'مشاركة' },
]
</script>

<template>
  <footer class="bg-ink text-ink-400">
    <div class="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <span class="flex size-9 items-center justify-center rounded-lg bg-brand-400 text-ink">
            <Sun class="size-5" aria-hidden="true" />
          </span>
          <span class="text-lg font-bold text-white">سولار هب</span>
        </div>
        <p class="text-sm leading-relaxed">
          المنصة المتكاملة الأولى لربط العملاء بمنتجات الطاقة الشمسية والمهندسين المعتمدين والمتاجر الموثوقة.
        </p>
        <ul class="flex items-center gap-2">
          <li v-for="social in socials" :key="social.label">
            <a
              href="#"
              class="flex size-9 items-center justify-center rounded-lg bg-white/5 text-white transition-colors hover:bg-brand-400 hover:text-ink"
              :aria-label="social.label"
            >
              <component :is="social.icon" class="size-4" aria-hidden="true" />
            </a>
          </li>
        </ul>
      </div>

      <div v-for="column in columns" :key="column.title" class="flex flex-col gap-4">
        <h3 class="text-base font-semibold text-white">{{ column.title }}</h3>
        <ul class="flex flex-col gap-3 text-sm">
          <li v-for="link in column.links" :key="link">
            <a href="#" class="transition-colors hover:text-brand-400">{{ link }}</a>
          </li>
        </ul>
      </div>

      <div class="flex flex-col gap-4">
        <h3 class="text-base font-semibold text-white">تواصل معنا</h3>
        <ul class="flex flex-col gap-3 text-sm">
          <li v-for="item in contacts" :key="item.label" class="flex items-center gap-3">
            <component :is="item.icon" class="size-4 shrink-0 text-brand-400" aria-hidden="true" />
            <span dir="auto">{{ item.label }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="border-t border-white/10">
      <div class="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs sm:flex-row">
        <p>© {{ new Date().getFullYear() }} سولار هب. جميع الحقوق محفوظة.</p>
        <p>صُنع بعناية لمستقبل طاقة أنظف</p>
      </div>
    </div>
  </footer>
</template>
