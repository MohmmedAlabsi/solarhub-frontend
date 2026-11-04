export default defineNuxtRouteMiddleware(async (to) => {
  const token = useCookie<string | null>('auth_token')
  const { fetchCurrentUser, user } = useAuth()

  const path = to.path

  // تصنيف مسارات المصادقة بدقة لمنع حلقات التوجيه اللانهائية
  const isVerifyEmailRoute = path.startsWith('/auth/verify-email')
  const isPasswordResetRoute = path.startsWith('/auth/forgot-password') || path.startsWith('/auth/reset-password')
  const isGuestOnlyAuthRoute = (path.startsWith('/auth/login') || path.startsWith('/auth/register')) && !isVerifyEmailRoute && !isPasswordResetRoute
  const isAuthRoute = path.startsWith('/auth')

  // المسارات المحمية التي تتطلب تسجيل الدخول إجبارياً
  const isAdminRoute = path.startsWith('/admin/') || path === '/admin'
  const isEngineerRoute = (path.startsWith('/engineer/') || path === '/engineer') && !path.startsWith('/engineers')
  const isSupplierRoute = (path.startsWith('/supplier/') || path === '/supplier') && !path.startsWith('/suppliers')
  const isCustomerRoute = path.startsWith('/customer/') || path === '/customer'
  const isProtectedRoute = isAdminRoute || isEngineerRoute || isSupplierRoute || isCustomerRoute

  // 1. إذا كان المسار محمياً ولا يوجد توكن جلسة إطلاقاً
  if (isProtectedRoute && !token.value) {
    if (path !== '/auth/login') {
      return navigateTo('/auth/login', { replace: true })
    }
    return
  }

  // استرجاع بيانات المستخدم إذا كان التوكن موجوداً ولم يتم تحميله بعد
  if (token.value && !user.value) {
    await fetchCurrentUser().catch(() => {})
  }

  // 2. إذا كان المستخدم يحمل توكن جلسة ويزور صفحات الدخول/التسجيل المخصصة للضيوف فقط
  if (isGuestOnlyAuthRoute && token.value && user.value) {
    // إذا كان الحساب غير مفعل بريده، يتم توجيهه حصراً للتحقق من البريد
    if (user.value.isVerified === false) {
      if (path !== '/auth/verify-email') {
        return navigateTo(`/auth/verify-email?email=${encodeURIComponent(user.value.email || '')}`, { replace: true })
      }
      return
    }

    const role = (user.value.role || '').trim().toLowerCase()
    let target = '/customer/dashboard'
    if (role === 'admin') target = '/admin'
    else if (role === 'supplier') target = '/supplier/dashboard'
    else if (role === 'engineer') target = '/engineer/dashboard'

    if (path !== target) {
      return navigateTo(target, { replace: true })
    }
    return
  }

  // 3. التحقق من صلاحية الجلسة للمسارات المحمية
  if (isProtectedRoute && token.value) {
    if (!user.value) {
      // التوكن غير صالح أو انتهت صلاحيته
      if (path !== '/auth/login') {
        return navigateTo('/auth/login', { replace: true })
      }
      return
    }

    // إذا كان البريد غير مفعل، يتم توجيهه لصفحة التحقق بدلاً من طلبات لوحة التحكم
    if (user.value.isVerified === false && !isVerifyEmailRoute) {
      return navigateTo(`/auth/verify-email?email=${encodeURIComponent(user.value.email || '')}`, { replace: true })
    }

    // 4. التحقق من تطابق الأدوار بدون إعادته لصفحة تسجيل الدخول (لمنع الـ Ping-Pong Loop)
    const currentRole = (user.value.role || '').trim().toLowerCase()

    if (isAdminRoute && currentRole !== 'admin') {
      const fallbackTarget = currentRole === 'supplier'
        ? '/supplier/dashboard'
        : currentRole === 'engineer'
          ? '/engineer/dashboard'
          : '/customer/dashboard'
      if (path !== fallbackTarget) {
        return navigateTo(fallbackTarget, { replace: true })
      }
      return
    }

    if (isSupplierRoute && currentRole !== 'supplier' && currentRole !== 'admin') {
      const fallbackTarget = currentRole === 'engineer' ? '/engineer/dashboard' : '/customer/dashboard'
      if (path !== fallbackTarget) {
        return navigateTo(fallbackTarget, { replace: true })
      }
      return
    }

    if (isEngineerRoute && currentRole !== 'engineer' && currentRole !== 'admin') {
      const fallbackTarget = currentRole === 'supplier' ? '/supplier/dashboard' : '/customer/dashboard'
      if (path !== fallbackTarget) {
        return navigateTo(fallbackTarget, { replace: true })
      }
      return
    }

    // 5. التحقق الدقيق من الصلاحيات الإجرائية داخل لوحة تحكم الأدمن
    if (isAdminRoute && currentRole === 'admin') {
      if (String(user.value?.id) !== '1') {
        const adminRoutePermissions: Record<string, string[]> = {
          '/admin/users': ['users.manage'],
          '/admin/roles': ['users.manage'],
          '/admin/permissions': ['users.manage'],
          '/admin/stores': ['stores.view-pending', 'stores.approve', 'stores.reject', 'stores.create', 'stores.update', 'stores.delete'],
          '/admin/engineers': ['engineers.view-pending', 'engineers.approve', 'engineers.reject', 'engineer-profiles.approve', 'engineer-profiles.update'],
          '/admin/products': ['catalog.manage', 'store-products.create', 'store-products.update', 'store-products.delete'],
          '/admin/master-data': ['catalog.manage'],
          '/admin/services': ['service-requests.view-open', 'service-requests.create', 'service-requests.update', 'service-requests.cancel', 'offers.create'],
          '/admin/orders': ['orders.view', 'orders.manage-status', 'orders.cancel', 'orders.create'],
          '/admin/finance': ['order-payments.verify', 'store-payouts.manage', 'wallet-providers.manage'],
          '/admin/reviews': ['store-ratings.create', 'store-ratings.update', 'store-ratings.delete', 'engineer-ratings.create'],
          '/admin/notifications': ['notification-templates.manage'],
          '/admin/settings': ['settings.manage'],
        }

        const matchedRouteKey = Object.keys(adminRoutePermissions).find(prefix => path.startsWith(prefix))
        if (matchedRouteKey) {
          const requiredPerms = adminRoutePermissions[matchedRouteKey]
          const userPerms = user.value?.permissions || useCookie<string[]>('auth_permissions').value || []
          const hasAccess = requiredPerms.some(p => userPerms.includes(p))

          if (!hasAccess && path !== '/admin') {
            return navigateTo('/admin?unauthorized=1', { replace: true })
          }
        }
      }
    }
  }
})
