<script setup lang="ts">
const route = useRoute()

// حالة طي السايدبار المكتبي
const isCollapsed = ref(false)
// حالة فتح الدرج الجانبي في الشاشات الصغيرة
const isMobileOpen = ref(false)

onMounted(() => {
  const savedState = localStorage.getItem('solar_sidebar_collapsed')
  if (savedState !== null) {
    isCollapsed.value = savedState === 'true'
  }

  // إغلاق الدرج عند الضغط على زر Esc
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isMobileOpen.value) {
      isMobileOpen.value = false
    }
  }
  window.addEventListener('keydown', handleKeydown)
  onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
})

// إغلاق الدرج الجانبي تلقائياً عند تغيير الصفحة في الهواتف
watch(
  () => route.fullPath,
  () => {
    isMobileOpen.value = false
  }
)

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('solar_sidebar_collapsed', String(isCollapsed.value))
}

function toggleMobile() {
  isMobileOpen.value = !isMobileOpen.value
}
</script>

<template>
  <div dir="rtl" class="flex min-h-screen bg-solar-bg-page text-solar-text-heading antialiased selection:bg-solar-yellow selection:text-solar-navy-dark">
    <!-- 1. السايدبار المكتبي الثابت (يظهر للشاشات المتوسطة والكبيرة lg وما فوق) -->
    <div class="hidden lg:block shrink-0 sticky top-0 h-screen z-40 transition-all duration-300">
      <CustomerSidebar
        :is-collapsed="isCollapsed"
        @toggle="toggleSidebar"
      />
    </div>

    <!-- 2. السايدبار المتجاوب للأجهزة الذكية واللوحية (Mobile/Tablet Drawer) -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isMobileOpen"
          class="fixed inset-0 z-50 flex lg:hidden"
        >
          <!-- خلفية التعتيم الضبابي -->
          <div
            class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            @click="isMobileOpen = false"
          />

          <!-- لوحة الدرج الجانبي المنزلق من اليمين (RTL) -->
          <div class="relative flex w-72 max-w-[85vw] flex-col bg-solar-navy shadow-2xl z-10 h-screen overflow-hidden">
            <CustomerSidebar
              :is-collapsed="false"
              :is-mobile="true"
              @close-mobile="isMobileOpen = false"
            />
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 3. جسم الصفحة الكامل المتجاوب -->
    <div class="flex flex-1 flex-col min-w-0 min-h-screen overflow-x-hidden">
      <!-- رأس الصفحة -->
      <CustomerHeader @toggle-mobile-menu="toggleMobile" />

      <!-- المحتوى الرئيسي المتكيف مع جميع مقاسات الشاشات -->
      <main class="flex-1 flex flex-col p-3 sm:p-5 md:p-6 lg:p-8">
        <div class="flex-1 w-full max-w-7xl mx-auto">
          <slot />
        </div>

        <!-- تذييل الصفحة من أصل الصفحة نفسها في أسفلها -->
        <CustomerFooter class="mt-8 sm:mt-12 -mx-3 -mb-3 sm:-mx-5 sm:-mb-5 md:-mx-6 md:-mb-6 lg:-mx-8 lg:-mb-8" />
      </main>
    </div>
  </div>
</template>
