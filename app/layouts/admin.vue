<script setup lang="ts">
import '../assets/admin-workspace.css'
import AppToast from '../components/common/AppToast.vue'
import AdminFooter from '../components/admin/AdminFooter.vue'
import AdminHeader from '../components/admin/AdminHeader.vue'
import AdminSidebar from '../components/admin/AdminSidebar.vue'

const route = useRoute()
const workspace = useAdminWorkspace()
const { notice } = useAdminNotice()
useHead({
  htmlAttrs: { class: 'admin-portal', lang: 'ar', dir: 'rtl' },
  bodyAttrs: { class: 'admin-portal bg-solar-bg-page' },
})

const isCollapsed = ref(false)
const isMobileOpen = ref(false)
const noticeMessage = ref('')
const drawerPanel = ref<HTMLElement>()
const contentScroll = ref<HTMLElement>()
let returnFocus: HTMLElement | null = null
let desktopMedia: MediaQueryList | undefined
let noticeTimeout: ReturnType<typeof setTimeout> | undefined

const handleKeydown = (event: KeyboardEvent) => {
  if (isMobileOpen.value) {
    if (event.key === 'Tab') {
      const nodes = Array.from(drawerPanel.value?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),[tabindex="0"]') ?? [])
      const first = nodes[0], last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      isMobileOpen.value = false
    }
    return
  }
  const editing = event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"]')
  if (!editing && desktopMedia?.matches && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
    event.preventDefault()
    toggleSidebar()
  }
}

const handleDesktopChange = () => {
  if (desktopMedia?.matches) isMobileOpen.value = false
}

onMounted(() => {
  try {
    const savedState = localStorage.getItem('solar_admin_sidebar_collapsed')
    if (savedState !== null) isCollapsed.value = savedState === 'true'
  } catch {
    /* storage fallback */
  }
  desktopMedia = window.matchMedia('(min-width: 1024px)')
  desktopMedia.addEventListener('change', handleDesktopChange)
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  desktopMedia?.removeEventListener('change', handleDesktopChange)
  if (noticeTimeout) clearTimeout(noticeTimeout)
})

watch(() => route.fullPath, async () => {
  isMobileOpen.value = false
  await nextTick()
  contentScroll.value?.scrollTo({ top: 0, behavior: 'auto' })
})

watch(isMobileOpen, async open => {
  if (open) {
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    await nextTick()
    drawerPanel.value?.querySelector<HTMLElement>('[data-drawer-close]')?.focus({ preventScroll: true })
  } else {
    await nextTick()
    returnFocus?.focus({ preventScroll: true })
    returnFocus = null
  }
})

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  try {
    localStorage.setItem('solar_admin_sidebar_collapsed', String(isCollapsed.value))
  } catch {
    /* fallback */
  }
}

const toggleMobile = () => {
  isMobileOpen.value = !isMobileOpen.value
}

const showUnavailable = (label: string) => {
  noticeMessage.value = `${label} — تم تسجيل الإجراء تجريبياً.`
  if (noticeTimeout) clearTimeout(noticeTimeout)
  noticeTimeout = setTimeout(() => { noticeMessage.value = '' }, 3500)
}
</script>

<template>
  <div dir="rtl" :data-density="workspace.preferences.density" class="admin-workspace flex h-dvh w-full max-w-full overflow-hidden bg-solar-bg-page text-solar-text-heading antialiased selection:bg-solar-yellow selection:text-solar-navy-dark">
    <a href="#admin-main" class="sr-only z-[100] rounded-lg bg-solar-navy-dark px-4 py-3 text-white focus:not-sr-only focus:fixed focus:right-4 focus:top-4">تخطي إلى المحتوى الإداري</a>

    <!-- سايدبار سطح المكتب العائم -->
    <div :inert="isMobileOpen" class="sticky top-0 z-50 hidden h-dvh shrink-0 overflow-visible transition-all duration-300 lg:block p-3">
      <AdminSidebar :is-collapsed="isCollapsed" @toggle="toggleSidebar" @unavailable="showUnavailable" />
    </div>

    <!-- درج القائمة للهواتف الذكية -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="isMobileOpen" id="admin-mobile-navigation" role="dialog" aria-modal="true" aria-label="قائمة تنقل الإدارة" class="fixed inset-0 z-[60] flex lg:hidden">
          <button type="button" tabindex="-1" class="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-label="إغلاق القائمة" @click="isMobileOpen = false" />
          <div ref="drawerPanel" class="relative z-10 flex h-dvh w-72 max-w-[85vw] flex-col overflow-hidden bg-solar-navy shadow-2xl">
            <AdminSidebar :is-collapsed="false" is-mobile @close-mobile="isMobileOpen = false" @unavailable="showUnavailable" />
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- منطقة المحتوى الرئيسية مع الهيدر والتذييل -->
    <div ref="contentScroll" :inert="isMobileOpen" class="flex h-dvh min-w-0 flex-1 scroll-pt-20 flex-col overflow-x-hidden overflow-y-auto">
      <AdminHeader :is-mobile-open="isMobileOpen" @toggle-mobile-menu="toggleMobile" @unavailable="showUnavailable" />
      <main id="admin-main" tabindex="-1" class="mx-auto w-full max-w-7xl flex-1 focus:outline-none p-3 sm:p-5 md:p-6 lg:p-8">
        <slot />
      </main>
      <AdminFooter class="mt-auto w-full shrink-0" @unavailable="showUnavailable" />
    </div>

    <AppToast :message="noticeMessage || notice.message" class="!z-[100]" />
  </div>
</template>

<style scoped>
.admin-workspace { position: fixed; inset: 0; overflow: clip; }
</style>
