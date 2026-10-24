export default defineNuxtRouteMiddleware(async (to) => {
  const token = useCookie<string | null>('auth_token')
  const { fetchCurrentUser, user } = useAuth()

  const path = to.path

  // قائمة المسارات العامة المتاحة للزوار بدون تسجيل دخول
  const isAuthRoute = path.startsWith('/auth')
  const isLandingPage = path === '/'

  // المسارات المحمية التي تتطلب تسجيل الدخول إجبارياً
  const isAdminRoute = path.startsWith('/admin')
  const isEngineerRoute = path.startsWith('/engineer')
  const isCustomerRoute = path.startsWith('/customer')
  const isProtectedRoute = isAdminRoute || isEngineerRoute || isCustomerRoute

  // 1. إذا كان المسار محمياً ولا يوجد توكن جلسة إطلاقاً
  if (isProtectedRoute && !token.value) {
    return navigateTo('/auth/login', { replace: true })
  }

  // 2. إذا كان المستخدم يحمل توكن جلسة ويزور صفحات تسجيل الدخول أو التسجيل
  if (isAuthRoute && token.value) {
    if (!user.value) {
      await fetchCurrentUser()
    }

    if (user.value) {
      const role = user.value.role
      if (role === 'admin') {
        return navigateTo('/admin', { replace: true })
      } else if (role === 'engineer') {
        return navigateTo('/engineer/dashboard', { replace: true })
      } else {
        return navigateTo('/customer/dashboard', { replace: true })
      }
    }
  }

  // 3. التحقق من صلاحية الجلسة واسترجاع المستخدم للمسارات المحمية
  if (isProtectedRoute && token.value) {
    if (!user.value) {
      const fetched = await fetchCurrentUser()
      if (!fetched) {
        return navigateTo('/auth/login', { replace: true })
      }
    }

    // 4. التحقق من تطابق الأدوار والوصول غير المصرح به
    const currentRole = user.value?.role

    // لوحة تحكم الأدمن تتطلب دور admin حصراً
    if (isAdminRoute && currentRole !== 'admin') {
      return navigateTo('/auth/login', { replace: true })
    }

    // لوحة المهندس تتطلب دور engineer (أو admin)
    if (isEngineerRoute && currentRole !== 'engineer' && currentRole !== 'admin') {
      return navigateTo('/auth/login', { replace: true })
    }
  }
})
