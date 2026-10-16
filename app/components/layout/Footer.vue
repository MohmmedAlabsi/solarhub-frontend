<script setup lang="ts">
import { Globe, Mail, MapPin, Phone, Share2, Sun } from 'lucide-vue-next'

const quickLinks = [
  { label: 'الرئيسية', to: '/' },
  { label: 'كتالوج المنتجات والأنظمة', to: '/products' },
  { label: 'دليل المهندسين المعتمدين', to: '/engineers' },
  { label: 'المتاجر والوكلاء المعتمدون', to: '/stores' },
  { label: 'بوابة العميل', to: '/customer/dashboard' },
  { label: 'لوحة تحكم الإدارة (الأدمن)', to: '/admin' },
  { label: 'عن سولار هب ورؤيتنا', to: '/about' },
]

const policyLinks = [
  { label: 'شروط الاستخدام والخدمة', to: '/terms' },
  { label: 'سياسة الخصوصية وحماية البيانات', to: '/privacy' },
  { label: 'معايير اعتماد المهندسين والموردين', to: '/engineers' },
  { label: 'الضمانات وخدمات ما بعد البيع', to: '/about' },
  { label: 'الأسئلة الشائعة والمساعدة', to: '/about' },
]

const contacts = [
  { icon: Mail, label: 'support@solarhub.energy', href: 'mailto:support@solarhub.energy' },
  { icon: Phone, label: '+966 800 124 7652 / +966 11 400 0000', href: 'tel:+9668001247652' },
  { icon: MapPin, label: 'المملكة العربية السعودية، الرياض · الجمهورية اليمنية، صنعاء', href: '#' },
]
</script>

<template>
  <footer class="bg-solar-navy-dark text-white/80 border-t border-solar-navy-light/20 pt-16 pb-8" dir="rtl">
    <div class="container-page grid gap-10 sm:grid-cols-2 lg:grid-cols-4 pb-12">
      <!-- العمود 1: عن المنصة والهوية -->
      <div class="flex flex-col gap-4">
        <NuxtLink to="/" class="flex items-center transition-transform hover:scale-[1.02]" aria-label="سولار هب - الرئيسية">
          <img
            src="/images/logo-expanded-transparent.png"
            alt="Solar Hub - Your Hub For Solar Solutions"
            class="h-10 sm:h-12 w-auto max-w-[190px] sm:max-w-[210px] object-contain drop-shadow"
          />
        </NuxtLink>

        <p class="text-xs leading-relaxed text-white/70">
          المنصة العربية الأولى المتخصصة في حلول وتقنيات الطاقة الشمسية. نربط بين نخبة المهندسين المعتمدين والموردين المرخصين لتمكين مستقبل الطاقة النظيفة.
        </p>

        <div class="flex items-center gap-2 pt-1 text-xs text-emerald-400 font-semibold">
          <span class="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>منصة موثقة ومرخصة لخدمات الطاقة المتجددة</span>
        </div>

        <!-- شبكات التواصل -->
        <div class="flex items-center gap-2 pt-2">
          <a
            href="#"
            class="flex size-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-solar-yellow hover:text-solar-navy-dark transition-colors"
            aria-label="مشاركة"
          >
            <Share2 class="size-4" />
          </a>
          <a
            href="#"
            class="flex size-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-solar-yellow hover:text-solar-navy-dark transition-colors"
            aria-label="الموقع"
          >
            <Globe class="size-4" />
          </a>
        </div>
      </div>

      <!-- العمود 2: روابط سريعة -->
      <div class="flex flex-col gap-4">
        <h3 class="text-sm font-black text-white border-r-2 border-solar-yellow pr-2.5">روابط سريعة</h3>
        <ul class="flex flex-col gap-2.5 text-xs">
          <li v-for="link in quickLinks" :key="link.label">
            <NuxtLink :to="link.to" class="text-white/70 hover:text-solar-yellow transition-colors">
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- العمود 3: الدعم والسياسات -->
      <div class="flex flex-col gap-4">
        <h3 class="text-sm font-black text-white border-r-2 border-solar-yellow pr-2.5">الدعم والسياسات</h3>
        <ul class="flex flex-col gap-2.5 text-xs">
          <li v-for="link in policyLinks" :key="link.label">
            <NuxtLink :to="link.to" class="text-white/70 hover:text-solar-yellow transition-colors">
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- العمود 4: تواصل معنا -->
      <div class="flex flex-col gap-4">
        <h3 class="text-sm font-black text-white border-r-2 border-solar-yellow pr-2.5">تواصل معنا</h3>
        <ul class="flex flex-col gap-3 text-xs">
          <li v-for="item in contacts" :key="item.label" class="flex items-start gap-2.5">
            <component :is="item.icon" class="size-4 shrink-0 text-solar-yellow mt-0.5" />
            <a v-if="item.href !== '#'" :href="item.href" class="text-white/70 hover:text-solar-yellow transition-colors dir-ltr text-right">
              {{ item.label }}
            </a>
            <span v-else class="text-white/70 leading-relaxed">{{ item.label }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- الشريط السفلي لحقوق الملكية والتوافق الهندسي -->
    <div class="border-t border-white/10 pt-6">
      <div class="container-page flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/50">
        <p>© 2025 منصة سولار هب (Solar Hub). جميع الحقوق محفوظة لرواد الطاقة النظيفة.</p>
        <p class="flex items-center gap-2">
          <span>مطابق للمواصفات والمقاييس (SASO) والكود الهندسي (SEC)</span>
          <span>·</span>
          <span class="text-solar-yellow/80">نحو مستقبل طاقة مستدام ونظيف</span>
        </p>
      </div>
    </div>
  </footer>
</template>
