export default defineNuxtRouteMiddleware(async (to) => {
  const token = useCookie<string | null>('auth_token')
  const { fetchCurrentUser, user } = useAuth()

  const path = to.path

  // قائمة المسارات العامة المتاحة للزوار بدون تسجيل دخول
  const isAuthRoute = path.startsWith('/auth')
  const isLandingPage = path === '/'

  // المسارات المحمية التي تتطلب تسجيل الدخول إجبارياً
  const isAdminRoute = path.startsWith('/admin/') || path === '/admin'
  const isEngineerRoute = (path.startsWith('/engineer/') || path === '/engineer') && !path.startsWith('/engineers')
  const isSupplierRoute = (path.startsWith('/supplier/') || path === '/supplier') && !path.startsWith('/suppliers')
  const isCustomerRoute = path.startsWith('/customer/') || path === '/customer'
  const isProtectedRoute = isAdminRoute || isEngineerRoute || isSupplierRoute || isCustomerRoute

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
      const role = (user.value.role || '').trim().toLowerCase()
      if (role === 'admin') {
        return navigateTo('/admin', { replace: true })
      } else if (role === 'supplier') {
        return navigateTo('/supplier/dashboard', { replace: true })
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
    const currentRole = (user.value?.role || '').trim().toLowerCase()

    // لوحة تحكم الأدمن تتطلب دور admin حصراً
    if (isAdminRoute && currentRole !== 'admin') {
      return navigateTo('/auth/login', { replace: true })
    }

    // لوحة المورد تتطلب دور supplier (أو admin)
    if (isSupplierRoute && currentRole !== 'supplier' && currentRole !== 'admin') {
      return navigateTo('/auth/login', { replace: true })
    }

    // لوحة المهندس تتطلب دور engineer (أو admin)
    if (isEngineerRoute && currentRole !== 'engineer' && currentRole !== 'admin') {
      return navigateTo('/auth/login', { replace: true })
    }

    // 5. التحقق الدقيق من الصلاحيات الإجرائية داخل لوحة تحكم الأدمن
    if (isAdminRoute && currentRole === 'admin') {
      // مدير النظام الرئيسي (Super Admin - User ID: 1) يمتلك حق الوصول الكامل لجميع الصفحات
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

          if (!hasAccess) {
            return navigateTo('/admin?unauthorized=1', { replace: true })
          }
        }
      }
    }
  }
})
