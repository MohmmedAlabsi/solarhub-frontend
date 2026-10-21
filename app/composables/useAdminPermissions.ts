import type { AdminPermissionGroup, AdminRoleUser } from '../../types/admin'

/**
 * قاموس تعريب وتوصيف الصلاحيات المسجلة في قاعدة البيانات
 */
export const PERMISSION_METADATA: Record<string, { label: string; description: string; group: string }> = {
  // 1. المستخدمين والأدوار
  'users.manage': {
    label: 'إدارة المستخدمين والأدوار الإدارية',
    description: 'عرض وتعديل وتعيين الصلاحيات للمشرفين والتحكم بالحسابات',
    group: 'users_roles',
  },

  // 2. الموردين والمتاجر
  'stores.view-pending': {
    label: 'عرض المتاجر قيد المراجعة',
    description: 'استعراض طلبات الانضمام والمتاجر المعلقة لاعتمادها',
    group: 'suppliers_stores',
  },
  'stores.approve': {
    label: 'اعتماد وقبول المتاجر',
    description: 'الموافقة على السجل التجاري وتفعيل متجر المورد',
    group: 'suppliers_stores',
  },
  'stores.reject': {
    label: 'رفض طلبات المتاجر',
    description: 'رفض طلبات فتح المتجر مع تدوين أسباب الرفض',
    group: 'suppliers_stores',
  },
  'stores.delete': {
    label: 'حذف وتعطيل المتاجر',
    description: 'إزالة أو إيقاف المتجر عن العمل والبيع في المنصة',
    group: 'suppliers_stores',
  },
  'stores.create': {
    label: 'إنشاء متجر جديد',
    description: 'تسجيل وإضافة متجر تجاري في النظام مباشرة',
    group: 'suppliers_stores',
  },
  'stores.update': {
    label: 'تعديل بيانات المتاجر',
    description: 'تحديث بيانات ومواقع المتاجر المسجلة',
    group: 'suppliers_stores',
  },

  // 3. المهندسين والخدمات الهندسية
  'engineers.view-pending': {
    label: 'عرض المهندسين قيد المراجعة',
    description: 'استعراض ملفات المهندسين والفنيين قيد انتظار الاعتماد',
    group: 'engineers_accreditation',
  },
  'engineers.approve': {
    label: 'اعتماد المهندسين',
    description: 'الموافقة على رخص المهندسين وتفعيل عضويتهم المعتمدة',
    group: 'engineers_accreditation',
  },
  'engineers.reject': {
    label: 'رفض اعتماد المهندسين',
    description: 'رفض طلبات التسجيل غير المطابقة للمعايير',
    group: 'engineers_accreditation',
  },
  'engineer-profiles.approve': {
    label: 'اعتماد الملف الفني للمهندس',
    description: 'الموافقة على الخبرات والتخصصات الفنية للمهندس',
    group: 'engineers_accreditation',
  },
  'engineer-profiles.update': {
    label: 'تعديل الملف الفني للمهندس',
    description: 'تحديث النبذة والبيانات المهنية والتخصصات',
    group: 'engineers_accreditation',
  },
  'engineer-certificates.create': {
    label: 'إضافة شهادات المهندسين',
    description: 'رفع وإرفاق شهادات التأهيل والاعتماد',
    group: 'engineers_accreditation',
  },
  'engineer-certificates.delete': {
    label: 'حذف شهادات المهندسين',
    description: 'إلغاء أو حذف شهادة معتمدة من ملف المهندس',
    group: 'engineers_accreditation',
  },
  'portfolio-items.create': {
    label: 'إضافة أعمال سابقة (Portfolio)',
    description: 'إضافة مشاريع ومحطات شمسية منجزة لمعرض الأعمال',
    group: 'engineers_accreditation',
  },
  'portfolio-items.update': {
    label: 'تعديل مشاريع معرض الأعمال',
    description: 'تحديث تفاصيل وصور المحطات الشمسية المنفذة',
    group: 'engineers_accreditation',
  },
  'portfolio-items.delete': {
    label: 'حذف مشاريع من المعرض',
    description: 'إزالة سوابق أعمال من الملف الشخصي',
    group: 'engineers_accreditation',
  },

  // 4. المنتجات والكتالوج الشمسي
  'catalog.manage': {
    label: 'إدارة الكتالوج الشمسي العام',
    description: 'إضافة وتعديل الألواح والمحولات والبطاريات والمواصفات الفنية',
    group: 'catalog_products',
  },
  'store-products.create': {
    label: 'إضافة منتج لمتجر المورد',
    description: 'إدراج معدات شمسية في مخزون متجر محدد',
    group: 'catalog_products',
  },
  'store-products.update': {
    label: 'تعديل منتجات وأسعار المتاجر',
    description: 'تحديث أسعار البيع والكميات المتوفرة في المتاجر',
    group: 'catalog_products',
  },
  'store-products.delete': {
    label: 'حذف منتجات من المتاجر',
    description: 'إزالة منتج أو معدة من رفوف المتجر',
    group: 'catalog_products',
  },

  // 5. طلبات الشراء والمبيعات
  'orders.view': {
    label: 'استعراض طلبات الشراء والفواتير',
    description: 'الاطلاع على كافة طلبات الشراء الصادرة وتفاصيلها',
    group: 'orders_sales',
  },
  'orders.manage-status': {
    label: 'إدارة وتحديث حالات الطلبات',
    description: 'تحديث مراحل الشحن والتجهيز والتسليم للعملاء',
    group: 'orders_sales',
  },
  'orders.cancel': {
    label: 'إلغاء الطلبات واسترداد الأموال',
    description: 'إلغاء طلب الشراء ومعالجة المرتجعات',
    group: 'orders_sales',
  },
  'orders.create': {
    label: 'إنشاء طلب شراء جديد',
    description: 'تسجيل طلب شراء معدات بالنيابة عن العملاء',
    group: 'orders_sales',
  },

  // 6. طلبات الخدمات وعروض الأسعار
  'service-requests.view-open': {
    label: 'استعراض طلبات الخدمات الهندسية',
    description: 'الاطلاع على طلبات الفحص والتركيب والصيانة المفتوحة',
    group: 'services_offers',
  },
  'service-requests.create': {
    label: 'إنشاء طلب خدمة هندسية',
    description: 'تقديم طلب استشارة أو فحص موقع أو تركيب منظومة',
    group: 'services_offers',
  },
  'service-requests.update': {
    label: 'تعديل طلب الخدمة الهندسية',
    description: 'تحديث موقع أو سعة المنظومة في الطلب',
    group: 'services_offers',
  },
  'service-requests.cancel': {
    label: 'إلغاء طلب الخدمة',
    description: 'إلغاء طلب خدمة هندسية قبل التعاقد',
    group: 'services_offers',
  },
  'quote-requests.create': {
    label: 'إنشاء طلب عرض سعر فني',
    description: 'طلب عروض أسعار للمنظومات والمشاريع الشمسية',
    group: 'services_offers',
  },
  'quote-requests.respond': {
    label: 'الرد على عروض الأسعار',
    description: 'تقديم تسعيرة فنية ومقايسة من قبل المورد',
    group: 'services_offers',
  },
  'quote-requests.accept': {
    label: 'قبول عرض السعر الفني',
    description: 'اعتماد العرض والموافقة على التكلفة',
    group: 'services_offers',
  },
  'quote-requests.reject': {
    label: 'رفض عرض السعر',
    description: 'استبعاد عروض الأسعار غير المناسبة',
    group: 'services_offers',
  },
  'offers.create': {
    label: 'تقديم عروض تنفيذ هندسية',
    description: 'إرسال عروض أسعار ومدة تنفيذ من المهندسين',
    group: 'services_offers',
  },
  'offers.update': {
    label: 'تعديل العرض الهندسي',
    description: 'تعديل السعر أو المدة المقترحة في العرض',
    group: 'services_offers',
  },
  'offers.delete': {
    label: 'سحب العرض الهندسي',
    description: 'إلغاء العرض المقدم لطلب الخدمة',
    group: 'services_offers',
  },
  'offers.accept': {
    label: 'ترسية وقبول العرض الهندسي',
    description: 'اختيار المهندس الفائز واعتماد عرضه',
    group: 'services_offers',
  },

  // 7. العمليات المالية والمحافظ
  'order-payments.verify': {
    label: 'التحقق من مدفوعات العملاء',
    description: 'مراجعة سندات التحويل البنكية والمحافظ واعتمادها مالياً',
    group: 'finance_wallets',
  },
  'store-payouts.manage': {
    label: 'إدارة وصرف مستحقات الموردين',
    description: 'حساب عمولة المنصة وتحويل صافي الأرباح للمتاجر',
    group: 'finance_wallets',
  },
  'wallet-providers.manage': {
    label: 'إدارة المحافظ الإلكترونية المعتمدة',
    description: 'إضافة وتعديل وحذف مزودي المحافظ وشعاراتها على Supabase',
    group: 'finance_wallets',
  },

  // 8. إعدادات النظام والإشعارات والتقييمات
  'settings.manage': {
    label: 'إدارة إعدادات المنصة العامة',
    description: 'تحديث بيانات الاتصال، العملة الرسمية ونسبة العمولة',
    group: 'system_settings',
  },
  'notification-templates.manage': {
    label: 'إدارة الإشعارات والرسائل الجماعية',
    description: 'إرسال التنبيهات والإشعارات لمستخدمي المنصة',
    group: 'system_settings',
  },
  'store-ratings.create': {
    label: 'تقييم المتاجر والموردين',
    description: 'كتابة تقييم ومراجعة لأداء المتجر',
    group: 'system_settings',
  },
  'store-ratings.update': {
    label: 'تعديل تقييمات المتاجر',
    description: 'مراجعة وتعديل تقييمات المتاجر والموردين',
    group: 'system_settings',
  },
  'store-ratings.delete': {
    label: 'حذف التقييمات المخالفة للمتاجر',
    description: 'إزالة المراجعات غير اللائقة من المتجر',
    group: 'system_settings',
  },
  'engineer-ratings.create': {
    label: 'تقييم المهندسين',
    description: 'إضافة تقييم جودة عمل وخدمة المهندس',
    group: 'system_settings',
  },
  'engineer-ratings.update': {
    label: 'تعديل تقييمات المهندسين',
    description: 'مراجعة وتحديث تقييمات المهندسين',
    group: 'system_settings',
  },
  'engineer-ratings.delete': {
    label: 'حذف تقييمات المهندسين المخالفة',
    description: 'شطب التقييمات المسيئة أو غير المعتمدة',
    group: 'system_settings',
  },
}

export const useAdminPermissions = () => {
  const { notify } = useAdminNotice()

  // الحالة التفاعلية
  const permissions = useState<{ id: number; name: string }[]>('admin_all_permissions', () => [])
  const adminUsers = useState<AdminRoleUser[]>('admin_role_users', () => [])
  const selectedUserId = useState<number | string>('admin_selected_user_id', () => 1)
  const currentPermissions = useState<string[]>('admin_current_user_permissions', () => [])
  const activeDashboardPermissions = useState<string[]>('admin_active_dashboard_permissions', () => [])

  const isLoading = ref(false)
  const isSaving = ref(false)

  // تعريف المجموعات الست الرئيسية
  const baseGroups = [
    { id: 'users_roles', title: 'إدارة المستخدمين والأدوار الإدارية', icon: 'users', expanded: true },
    { id: 'catalog_products', title: 'إدارة الكتالوج الشمسي والمنتجات', icon: 'package', expanded: true },
    { id: 'suppliers_stores', title: 'إدارة المتاجر والموردين المعتمدين', icon: 'store', expanded: true },
    { id: 'engineers_accreditation', title: 'إدارة المهندسين والاعتماد الفني', icon: 'userCheck', expanded: true },
    { id: 'orders_sales', title: 'إدارة طلبات الشراء والمبيعات', icon: 'shoppingBag', expanded: true },
    { id: 'services_offers', title: 'طلبات الخدمات وعروض الأسعار', icon: 'fileText', expanded: true },
    { id: 'finance_wallets', title: 'الإدارة المالية والمحافظ الإلكترونية', icon: 'creditCard', expanded: true },
    { id: 'system_settings', title: 'إعدادات النظام والإشعارات والتقييمات', icon: 'settings', expanded: true },
  ]

  /**
   * جلب كافة الصلاحيات من قاعدة البيانات والـ API
   */
  const fetchPermissions = async (force = false): Promise<{ id: number; name: string }[]> => {
    if (!force && permissions.value.length > 0) return permissions.value
    isLoading.value = true
    try {
      const res: any = await $fetch('/api/admin/permissions')
      const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
      permissions.value = data
      return data
    } catch (err: any) {
      notify(err?.message || 'تعذر تحميل قائمة الصلاحيات من قاعدة البيانات')
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * جلب قائمة المشرفين والمستخدمين الإداريين
   */
  const fetchAdmins = async (force = false): Promise<AdminRoleUser[]> => {
    if (!force && adminUsers.value.length > 0) return adminUsers.value
    isLoading.value = true
    try {
      const res: any = await $fetch('/api/admin/permissions/admins')
      const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
      adminUsers.value = data

      // ضبط الصلاحيات الافتراضية لأول مستخدم إذا لم يتم التحديد
      if (data.length > 0) {
        const found = data.find((u: any) => String(u.id) === String(selectedUserId.value)) || data[0]
        selectedUserId.value = found.id
        currentPermissions.value = [...(found.all_permissions || found.direct_permissions || [])]

        // إذا كان المستخدم هو مدير النظام، نعين الصلاحيات للداشبورد فورياً
        if (found.role === 'admin' || String(found.id) === '1') {
          activeDashboardPermissions.value = [...currentPermissions.value]
        }
      }

      return data
    } catch (err: any) {
      notify(err?.message || 'تعذر تحميل قائمة المشرفين من قاعدة البيانات')
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * اختيار مشرف وعرض صلاحياته الحالية
   */
  const selectUser = (userId: number | string) => {
    selectedUserId.value = userId
    const target = adminUsers.value.find(u => String(u.id) === String(userId))
    if (target) {
      // ندمج الصلاحيات الموروثة والمباشرة
      const perms = target.all_permissions && target.all_permissions.length > 0
        ? target.all_permissions
        : (target.direct_permissions || [])
      currentPermissions.value = [...perms]
    }
  }

  /**
   * تبديل صلاحية معينة (مباشرة في الواجهة)
   */
  const togglePermission = (permissionName: string, checked: boolean) => {
    if (checked) {
      if (!currentPermissions.value.includes(permissionName)) {
        currentPermissions.value.push(permissionName)
      }
    } else {
      currentPermissions.value = currentPermissions.value.filter(p => p !== permissionName)
    }
  }

  /**
   * حفظ ومزامنة الصلاحيات للمشرف المحدد
   */
  const saveUserPermissions = async (userId: number | string, permsToSave: string[]): Promise<boolean> => {
    isSaving.value = true
    try {
      const res: any = await $fetch(`/api/admin/permissions/users/${userId}/sync`, {
        method: 'POST',
        body: { permissions: permsToSave },
      })

      // تحديث الحالة محلياً
      const target = adminUsers.value.find(u => String(u.id) === String(userId))
      if (target) {
        target.direct_permissions = [...permsToSave]
        target.all_permissions = [...permsToSave]
      }

      // إذا كان هذا المستخدم هو المستخدم النشط للداشبورد، نطبق التعديلات فوراً
      if (String(userId) === String(selectedUserId.value) || String(userId) === '1') {
        activeDashboardPermissions.value = [...permsToSave]
      }

      notify(res?.message || 'تم حفظ وتطبيق الصلاحيات بنجاح.')
      return true
    } catch (err: any) {
      notify(err?.message || 'تعذر حفظ الصلاحيات في الخادم.')
      return false
    } finally {
      isSaving.value = false
    }
  }

  /**
   * تعيين دور إداري للمستخدم
   */
  const assignRole = async (userId: number | string, role: string): Promise<boolean> => {
    isSaving.value = true
    try {
      const res: any = await $fetch(`/api/admin/permissions/users/${userId}/role`, {
        method: 'POST',
        body: { role },
      })

      const target = adminUsers.value.find(u => String(u.id) === String(userId))
      if (target) {
        target.role = role
        target.roleTitle = role === 'admin' ? 'مدير نظام عام (Super Admin)' : 'مشرف إداري'
        if (res?.data?.all_permissions) {
          target.all_permissions = res.data.all_permissions
          currentPermissions.value = [...res.data.all_permissions]
          activeDashboardPermissions.value = [...res.data.all_permissions]
        }
      }

      notify(res?.message || `تم تعيين الدور "${role}" بنجاح.`)
      return true
    } catch (err: any) {
      notify(err?.message || 'تعذر تعيين الدور.')
      return false
    } finally {
      isSaving.value = false
    }
  }

  /**
   * فحص ما إذا كان الأدمن يمتلك صلاحية معينة لتطبيقها في الداشبورد
   */
  const hasPermission = (permission: string): boolean => {
    // مدير النظام يملك كافة الصلاحيات افتراضياً
    const currentUser = adminUsers.value.find(u => String(u.id) === String(selectedUserId.value))
    if (currentUser?.role === 'admin' && (!currentUser.direct_permissions || currentUser.direct_permissions.length === 0)) {
      return true
    }

    if (activeDashboardPermissions.value.length > 0) {
      return activeDashboardPermissions.value.includes(permission)
    }

    return currentPermissions.value.includes(permission)
  }

  /**
   * توليد المجموعات الكاملة مع فحص الصلاحيات المحددة
   */
  const permissionGroups = computed<AdminPermissionGroup[]>(() => {
    const rawList = permissions.value
    const activeSet = new Set(currentPermissions.value)

    return baseGroups.map((group) => {
      // تجميع الصلاحيات التابعة للمجموعة
      const items = rawList
        .filter((p) => {
          const meta = PERMISSION_METADATA[p.name]
          return meta ? meta.group === group.id : false
        })
        .map((p) => {
          const meta = PERMISSION_METADATA[p.name]
          return {
            id: p.name,
            label: meta?.label || p.name,
            description: meta?.description || '',
            checked: activeSet.has(p.name),
          }
        })

      return {
        id: group.id,
        title: group.title,
        icon: group.icon,
        expanded: group.expanded,
        items,
      }
    })
  })

  return {
    permissions,
    adminUsers,
    selectedUserId,
    currentPermissions,
    activeDashboardPermissions,
    permissionGroups,
    isLoading,
    isSaving,
    fetchPermissions,
    fetchAdmins,
    selectUser,
    togglePermission,
    saveUserPermissions,
    assignRole,
    hasPermission,
  }
}
