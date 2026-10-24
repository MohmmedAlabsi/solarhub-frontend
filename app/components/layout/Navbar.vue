<script setup lang="ts">
import { LayoutDashboard, LogIn, LogOut, Menu, ShieldCheck, Sun, User, UserPlus, X } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useTheme } from '~/composables/useTheme'
import ThemeToggle from '~/components/common/ThemeToggle.vue'

const route = useRoute()
const authStore = useAuthStore()
const { isDark } = useTheme()

const dashboardPath = computed(() => authStore.getDashboardPath())
const roleLabel = computed(() => {
  const role = authStore.userRole
  if (role === 'admin') return 'لوحة الإدارة'
  if (role === 'supplier') return 'لوحة المتجر'
  if (role === 'engineer') return 'بوابة المهندس'
  return 'بوابة العميل'
})

const navLinks = [
  { label: 'الرئيسية', to: '/' },
  { label: 'المنتجات', to: '/products' },
  { label: 'الموردون', to: '/stores' },
  { label: 'المهندسون', to: '/engineers' },
  { label: 'عن المنصة', to: '/about' },
]

function isLinkActive(to: string) {
  if (to === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(to)
}

const isMobileOpen = ref(false)
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-solar-border-card bg-solar-bg-card/95 backdrop-blur-md transition-colors duration-200 shadow-sm">
    <nav class="container-page flex h-20 items-center justify-between gap-4" aria-label="التنقل الرئيسي لمنصة سولار هب">
      <!-- شعار المنصة الكبير المعتمد (يتغير تلقائياً حسب الوضع الداكن والنهاري) -->
      <NuxtLink to="/" class="flex items-center transition-transform hover:scale-[1.02]" aria-label="سولار هب - الرئيسية">
        <img
          v-if="!isDark"
          src="/images/logo-expanded-dark-transparent.png"
          alt="Solar Hub - Your Hub For Solar Solutions"
          class="h-10 sm:h-12 w-auto max-w-[170px] sm:max-w-[200px] object-contain drop-shadow-sm"
        />
        <img
          v-else
          src="/images/logo-expanded-transparent.png"
          alt="Solar Hub - Your Hub For Solar Solutions"
          class="h-10 sm:h-12 w-auto max-w-[170px] sm:max-w-[200px] object-contain drop-shadow-sm"
        />
      </NuxtLink>

      <!-- روابط التنقل الرئيسية للشاشات الكبيرة مع مؤشر التبويب النشط -->
      <ul class="hidden items-center gap-8 lg:flex">
        <li v-for="link in navLinks" :key="link.to">
          <NuxtLink
            :to="link.to"
            class="relative py-2 text-sm font-semibold transition-all duration-200"
            :class="isLinkActive(link.to)
              ? 'text-solar-navy-dark dark:text-solar-yellow font-black border-b-2 border-solar-yellow pb-1'
              : 'text-solar-text-body hover:text-solar-text-heading hover:border-b-2 hover:border-solar-border-card pb-1'"
            :aria-current="isLinkActive(link.to) ? 'page' : undefined"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>

      <!-- أزرار تسجيل الدخول وإنشاء الحساب وبوابة العميل + زر الوضع الداكن -->
      <div class="hidden items-center gap-3 lg:flex">
        <!-- زر تبديل الوضع الداكن/النهاري -->
        <ThemeToggle />

        <template v-if="authStore.isAuthenticated">
          <!-- زر الانتقال للوحة التحكم الخاصة بالدور -->
          <NuxtLink
            :to="dashboardPath"
            class="btn-primary px-3.5 py-2 text-xs font-black gap-1.5 shadow-sm"
            :title="`الانتقال إلى ${roleLabel}`"
          >
            <LayoutDashboard class="size-4" />
            <span>{{ roleLabel }}</span>
          </NuxtLink>

          <!-- زر لوحة الإدارة إذا كان المستخدم أدمن -->
          <NuxtLink
            v-if="authStore.userRole === 'admin'"
            to="/admin"
            class="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-xl bg-solar-navy text-white hover:bg-solar-navy-dark shadow-sm transition-all hover:scale-[1.02] active:scale-95"
            title="لوحة تحكم الإدارة"
          >
            <ShieldCheck class="size-4 text-solar-yellow stroke-[2.5]" />
            <span>لوحة الأدمن</span>
          </NuxtLink>

          <!-- اسم المستخدم وتسجيل الخروج -->
          <button
            type="button"
            @click="authStore.logout"
            class="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 px-2.5 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            title="تسجيل الخروج"
          >
            <LogOut class="size-4" />
            <span>خروج</span>
          </button>
        </template>

        <template v-else>
          <NuxtLink
            to="/auth/login"
            class="text-xs font-bold text-solar-text-heading px-3 py-2 rounded-lg hover:bg-solar-bg-subtle transition-colors flex items-center gap-1.5"
          >
            <LogIn class="size-4 text-solar-navy dark:text-solar-yellow" />
            <span>تسجيل الدخول</span>
          </NuxtLink>

          <NuxtLink
            to="/auth/register"
            class="btn-dark px-4 py-2 text-xs font-bold gap-1.5 shadow-sm"
          >
            <UserPlus class="size-4" />
            <span>إنشاء حساب</span>
          </NuxtLink>
        </template>
      </div>

      <!-- عناصر الجوال: زر الوضع الداكن وزر القائمة -->
      <div class="flex items-center gap-2 lg:hidden">
        <ThemeToggle />

        <button
          type="button"
          class="flex size-10 items-center justify-center rounded-xl border border-solar-border-card bg-solar-bg-card text-solar-text-heading hover:bg-solar-bg-subtle active:scale-95 transition-all"
          :aria-expanded="isMobileOpen"
          aria-controls="mobile-nav-drawer"
          @click="isMobileOpen = !isMobileOpen"
        >
          <span class="sr-only">{{ isMobileOpen ? 'إغلاق القائمة' : 'فتح القائمة' }}</span>
          <X v-if="isMobileOpen" class="size-5" />
          <Menu v-else class="size-5" />
        </button>
      </div>
    </nav>

    <!-- قائمة الجوال المنسدلة -->
    <div v-show="isMobileOpen" id="mobile-nav-drawer" class="border-t border-solar-border-card bg-solar-bg-card p-4 shadow-xl lg:hidden">
      <ul class="flex flex-col gap-1.5">
        <li v-for="link in navLinks" :key="link.to">
          <NuxtLink
            :to="link.to"
            class="block rounded-xl px-4 py-2.5 text-sm font-bold transition-colors"
            :class="isLinkActive(link.to) ? 'bg-solar-yellow text-solar-navy-dark font-black' : 'text-solar-text-heading hover:bg-solar-bg-subtle'"
            @click="isMobileOpen = false"
          >
            {{ link.label }}
          </NuxtLink>
        </li>

        <li class="mt-4 pt-4 border-t border-solar-border-card flex flex-col gap-2.5">
          <template v-if="authStore.isAuthenticated">
            <NuxtLink
              :to="dashboardPath"
              class="btn-primary w-full text-center py-2.5 text-xs font-black flex items-center justify-center gap-1.5"
              @click="isMobileOpen = false"
            >
              <LayoutDashboard class="size-4" />
              <span>{{ roleLabel }}</span>
            </NuxtLink>
            <button
              type="button"
              @click="() => { isMobileOpen = false; authStore.logout(); }"
              class="w-full text-center py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 rounded-xl"
            >
              تسجيل الخروج
            </button>
          </template>
          <template v-else>
            <div class="grid grid-cols-2 gap-2">
              <NuxtLink
                to="/auth/login"
                class="btn-outline text-center py-2 text-xs font-bold"
                @click="isMobileOpen = false"
              >
                تسجيل الدخول
              </NuxtLink>
              <NuxtLink
                to="/auth/register"
                class="btn-dark text-center py-2 text-xs font-bold"
                @click="isMobileOpen = false"
              >
                إنشاء حساب
              </NuxtLink>
            </div>
          </template>
        </li>
      </ul>
    </div>
  </header>
</template>
