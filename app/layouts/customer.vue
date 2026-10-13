<script setup lang="ts">
import AppToast from '../components/common/AppToast.vue'
import CustomerFooter from '../components/customer/CustomerFooter.vue'
import CustomerHeader from '../components/customer/CustomerHeader.vue'
import CustomerSidebar from '../components/customer/CustomerSidebar.vue'

const route = useRoute()
const isCollapsed = ref(false)
const isMobileOpen = ref(false)
const noticeMessage = ref('')
let noticeTimeout: ReturnType<typeof setTimeout> | undefined

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isMobileOpen.value) isMobileOpen.value = false
}

onMounted(() => {
  const savedState = localStorage.getItem('solar_sidebar_collapsed')
  if (savedState !== null) isCollapsed.value = savedState === 'true'
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (noticeTimeout) clearTimeout(noticeTimeout)
})

watch(() => route.fullPath, () => { isMobileOpen.value = false })

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('solar_sidebar_collapsed', String(isCollapsed.value))
}
const toggleMobile = () => { isMobileOpen.value = !isMobileOpen.value }
const showUnavailable = (label: string) => {
  noticeMessage.value = `${label} — ستتوفر هذه الصفحة لاحقًا.`
  if (noticeTimeout) clearTimeout(noticeTimeout)
  noticeTimeout = setTimeout(() => { noticeMessage.value = '' }, 3500)
}
</script>

<template>
  <div dir="rtl" class="flex min-h-screen bg-solar-bg-page text-solar-text-heading antialiased selection:bg-solar-yellow selection:text-solar-navy-dark">
    <div class="sticky top-0 z-40 hidden h-screen shrink-0 transition-all duration-300 lg:block">
      <CustomerSidebar :is-collapsed="isCollapsed" @toggle="toggleSidebar" @unavailable="showUnavailable" />
    </div>

    <Teleport to="body">
      <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="isMobileOpen" class="fixed inset-0 z-50 flex lg:hidden">
          <button type="button" class="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-label="إغلاق القائمة" @click="isMobileOpen = false" />
          <div class="relative z-10 flex h-screen w-72 max-w-[85vw] flex-col overflow-hidden bg-solar-navy shadow-2xl">
            <CustomerSidebar :is-collapsed="false" is-mobile @close-mobile="isMobileOpen = false" @unavailable="showUnavailable" />
          </div>
        </div>
      </Transition>
    </Teleport>

    <div class="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
      <CustomerHeader @toggle-mobile-menu="toggleMobile" @unavailable="showUnavailable" />
      <main class="flex flex-1 flex-col p-3 sm:p-5 md:p-6 lg:p-8">
        <div class="mx-auto w-full max-w-7xl flex-1"><slot /></div>
        <CustomerFooter class="mt-8 -mx-3 -mb-3 sm:mt-12 sm:-mx-5 sm:-mb-5 md:-mx-6 md:-mb-6 lg:-mx-8 lg:-mb-8" @unavailable="showUnavailable" />
      </main>
    </div>
    <AppToast :message="noticeMessage" />
  </div>
</template>
