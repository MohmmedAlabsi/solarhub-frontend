import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const token = useCookie<string | null>('auth_token')
  const authStore = useAuthStore()

  if (!token.value) {
    // إذا حاول المستخدم الرجوع لأي صفحة إدارية بدون جلسة مسجلة، نوجهه لصفحة الهبوط الرئيسية مباشرة
    if (to.path.startsWith('/admin')) {
      return navigateTo('/', { replace: true })
    }
    return navigateTo('/auth/login', { replace: true })
  }

  // If token exists but user profile not loaded yet, fetch it
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
})
