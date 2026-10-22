export default defineNuxtRouteMiddleware(async (to) => {
  const token = useCookie<string | null>('auth_token')
  const { fetchCurrentUser, user } = useAuth()

  if (!token.value) {
    // إذا حاول المستخدم الرجوع لأي صفحة إدارية بدون جلسة مسجلة، نوجهه لصفحة الهبوط الرئيسية مباشرة
    if (to.path.startsWith('/admin')) {
      return navigateTo('/', { replace: true })
    }
    return navigateTo('/auth/login', { replace: true })
  }

  // If token exists but user profile not loaded yet, fetch it
  if (!user.value) {
    const fetched = await fetchCurrentUser()
    if (!fetched) {
      if (to.path.startsWith('/admin')) {
        return navigateTo('/', { replace: true })
      }
      return navigateTo('/auth/login', { replace: true })
    }
  }
})
