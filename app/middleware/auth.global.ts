import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const protectedPrefixes = ['/customer', '/admin', '/engineer', '/supplier']
  const isProtected = protectedPrefixes.some(prefix => to.path === prefix || to.path.startsWith(`${prefix}/`))

  const token = useCookie<string | null>('auth_token')
  const authStore = useAuthStore()

  if (isProtected) {
    if (!token.value) {
      return navigateTo('/auth/login')
    }

    if (!authStore.user) {
      const ok = await authStore.initAuth()
      if (!ok || !authStore.user) {
        return navigateTo('/auth/login')
      }
    }

    const role = authStore.user?.role

    // Role-based route protection
    if (to.path.startsWith('/admin') && role !== 'admin') {
      return navigateTo(authStore.getDashboardPath(role))
    }

    if (to.path.startsWith('/supplier') && role !== 'supplier' && role !== 'admin') {
      return navigateTo(authStore.getDashboardPath(role))
    }

    if (to.path.startsWith('/engineer') && role !== 'engineer' && role !== 'admin') {
      return navigateTo(authStore.getDashboardPath(role))
    }
  }
})
