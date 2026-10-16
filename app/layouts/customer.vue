<script setup lang="ts">
import AppToast from '../components/common/AppToast.vue'
import CustomerFooter from '../components/customer/CustomerFooter.vue'
import CustomerHeader from '../components/customer/CustomerHeader.vue'
import CustomerSidebar from '../components/customer/CustomerSidebar.vue'

const route = useRoute()
useHead({ htmlAttrs: { class: 'customer-portal' }, bodyAttrs: { class: 'customer-portal' } })
const isCollapsed = ref(false)
const isMobileOpen = ref(false)
const noticeMessage = ref('')
const drawerPanel = ref<HTMLElement>()
const contentScroll = ref<HTMLElement>()
const scrollPositions = new Map<string, number>()
let returnFocus: HTMLElement | null = null
let desktopMedia: MediaQueryList | undefined
let noticeTimeout: ReturnType<typeof setTimeout> | undefined

const handleKeydown = (event: KeyboardEvent) => {
  if (isMobileOpen.value) {
    if (event.key === 'Escape') { event.preventDefault(); isMobileOpen.value = false }
    if (event.key === 'Tab') {
      const focusable = drawerPanel.value?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]')
      const first = focusable?.[0]
      const last = focusable?.[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    return
  }
  const editing = event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"]')
  if (!editing && desktopMedia?.matches && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
    event.preventDefault()
    toggleSidebar()
  }
}
const handleDesktopChange = () => { if (desktopMedia?.matches) isMobileOpen.value = false }

onMounted(() => {
  try {
    const savedState = localStorage.getItem('solar_sidebar_collapsed')
    if (savedState !== null) isCollapsed.value = savedState === 'true'
  } catch { /* Layout preferences remain usable when browser storage is unavailable. */ }
  desktopMedia = window.matchMedia('(min-width: 1024px)')
  desktopMedia.addEventListener('change', handleDesktopChange)
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  desktopMedia?.removeEventListener('change', handleDesktopChange)
  if (noticeTimeout) clearTimeout(noticeTimeout)
})

watch(() => route.fullPath, async (path, previous) => {
  isMobileOpen.value = false
  const previousTop = contentScroll.value?.scrollTop ?? 0
  scrollPositions.set(previous, previousTop)
  await nextTick()
  const samePage = path.split('?')[0] === previous.split('?')[0]
  contentScroll.value?.scrollTo({ top: scrollPositions.get(path) ?? (samePage ? previousTop : 0), behavior: 'auto' })
})
watch(isMobileOpen, async open => {
  if (open) {
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    await nextTick()
    drawerPanel.value?.querySelector<HTMLElement>('[data-drawer-close]')?.focus()
  } else {
    await nextTick()
    returnFocus?.focus()
    returnFocus = null
  }
})

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  try { localStorage.setItem('solar_sidebar_collapsed', String(isCollapsed.value)) } catch { /* In-memory preference remains active. */ }
}
const toggleMobile = () => { isMobileOpen.value = !isMobileOpen.value }
const showUnavailable = (label: string) => {
  noticeMessage.value = `${label} — ستتوفر هذه الصفحة لاحقًا.`
  if (noticeTimeout) clearTimeout(noticeTimeout)
  noticeTimeout = setTimeout(() => { noticeMessage.value = '' }, 3500)
}
</script>

<template>
  <div dir="rtl" class="flex h-dvh w-full max-w-full overflow-hidden bg-solar-bg-page text-solar-text-heading antialiased selection:bg-solar-yellow selection:text-solar-navy-dark">
    <a href="#customer-main" class="sr-only z-[100] rounded-lg bg-solar-navy-dark px-4 py-3 text-white focus:not-sr-only focus:fixed focus:right-4 focus:top-4">تخطي إلى المحتوى</a>
    <div :inert="isMobileOpen" class="sticky top-0 z-50 hidden h-dvh shrink-0 overflow-visible p-3 transition-all duration-300 lg:block">
      <CustomerSidebar :is-collapsed="isCollapsed" @toggle="toggleSidebar" @unavailable="showUnavailable" />
    </div>

    <Teleport to="body">
      <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="isMobileOpen" id="customer-mobile-navigation" role="dialog" aria-modal="true" aria-label="قائمة تنقل العميل" class="fixed inset-0 z-[60] flex lg:hidden">
          <button type="button" tabindex="-1" class="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-label="إغلاق القائمة" @click="isMobileOpen = false" />
          <div ref="drawerPanel" class="relative z-10 flex h-dvh w-72 max-w-[85vw] flex-col overflow-hidden bg-solar-navy shadow-2xl">
            <CustomerSidebar :is-collapsed="false" is-mobile @close-mobile="isMobileOpen = false" @unavailable="showUnavailable" />
          </div>
        </div>
      </Transition>
    </Teleport>

    <div ref="contentScroll" :inert="isMobileOpen" class="flex h-dvh min-w-0 flex-1 scroll-pt-20 flex-col overflow-x-hidden overflow-y-auto">
      <CustomerHeader :is-mobile-open="isMobileOpen" @toggle-mobile-menu="toggleMobile" @unavailable="showUnavailable" />
      <main id="customer-main" tabindex="-1" class="mx-auto w-full max-w-7xl flex-1 p-3 sm:p-5 md:p-6 lg:p-8 focus:outline-none">
        <slot />
      </main>
      <CustomerFooter class="mt-auto w-full shrink-0" @unavailable="showUnavailable" />
    </div>
    <AppToast :message="noticeMessage" />
  </div>
</template>
