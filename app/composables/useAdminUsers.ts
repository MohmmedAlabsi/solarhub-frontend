import type { AdminUser, AdminUserStatus } from '../../types/admin'

export interface CreateAdminUserPayload {
  name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
  governorate_id?: number | null
  status?: AdminUserStatus
  default_coordinates?: string | null
}

export const useAdminUsers = () => {
  const { $api } = useNuxtApp()
  const { notify } = useAdminNotice()

  const users = useState<AdminUser[]>('admin_users_data', () => [])
  const isLoading = ref(false)
  const isActionLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * جلب كافة المستخدمين المسجلين في النظام (بما في ذلك النشطين وغير النشطين والمعلقين)
   */
  const fetchUsers = async (force = false): Promise<AdminUser[]> => {
    if (!force && users.value.length > 0) {
      return users.value
    }

    isLoading.value = true
    error.value = null

    try {
      let rawList: any[] = []

      // 1. طلب قائمة المستخدمين مع تحديد حد أقصى (per_page=100) لجلب الجميع دفعة واحدة
      const res: any = await $api('/users?per_page=50')

      if (Array.isArray(res)) {
        rawList = res
      } else if (Array.isArray(res?.data)) {
        rawList = res.data
      } else if (Array.isArray(res?.data?.data)) {
        rawList = res.data.data
      }

      // 2. آلية احتياطية (Fallback): في حال كان الخادم يجلب 20 مستخدماً فقط لكل صفحة
      if (rawList.length === 20) {
        let nextPage = 2
        let hasMore = true

        while (hasMore) {
          try {
            const nextRes: any = await $api(`/users?page=${nextPage}`)
            let nextBatch: any[] = []

            if (Array.isArray(nextRes)) {
              nextBatch = nextRes
            } else if (Array.isArray(nextRes?.data)) {
              nextBatch = nextRes.data
            } else if (Array.isArray(nextRes?.data?.data)) {
              nextBatch = nextRes.data.data
            }

            if (nextBatch.length > 0) {
              rawList.push(...nextBatch)
              if (nextBatch.length < 20) {
                hasMore = false
              } else {
                nextPage++
              }
            } else {
              hasMore = false
            }
          } catch (err) {
            console.warn(`Could not fetch users page ${nextPage}:`, err)
            hasMore = false
          }
        }
      }

      // تجنب أي تكرار عبر المعرف الفريد ID
      const uniqueUsersMap = new Map<string, any>()
      rawList.forEach(item => {
        if (item && item.id != null) {
          uniqueUsersMap.set(String(item.id), item)
        }
      })

      const mapped: AdminUser[] = Array.from(uniqueUsersMap.values()).map((item: any) => {
        let role = 'عميل سكني'
        const itemRoles = Array.isArray(item.roles) ? item.roles : (item.role ? [item.role] : [])
        if (itemRoles.includes('admin') || item.role === 'admin') {
          role = 'مسؤول نظام'
        } else if (item.has_store || itemRoles.includes('supplier')) {
          role = 'مورد معتمد'
        } else if (item.has_engineer_profile || itemRoles.includes('engineer')) {
          role = 'مهندس طاقة شمسية'
        }

        const userStatus: AdminUserStatus =
          item.status === 'suspended' ? 'suspended' : item.status === 'inactive' ? 'inactive' : 'active'

        return {
          id: String(item.id),
          name: item.name || 'مستخدم المنصة',
          email: item.email || '',
          phone: item.phone || '—',
          city: item.governorate?.name_ar || 'اليمن',
          role: role as any,
          active: userStatus === 'active',
          status: userStatus,
          createdAt: item.created_at || new Date().toISOString(),
        }
      })

      // الاحتفاظ بالحالات المعدلة محلياً إذا كان هناك تفاعل سابق
      if (users.value.length > 0) {
        const localStatusMap = new Map(users.value.map(u => [u.id, { active: u.active, status: u.status }]))
        mapped.forEach(u => {
          if (localStatusMap.has(u.id)) {
            const local = localStatusMap.get(u.id)!
            u.active = local.active
            u.status = local.status
          }
        })
      }

      users.value = mapped
      return users.value
    } catch (err: any) {
      console.error('Failed to fetch users:', err)
      error.value = err?.userMessage || err?.message || 'تعذر تحميل قائمة المستخدمين من الخادم.'
      return users.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * إنشاء حساب مسؤول جديد (Admin) عبر الـ API
   */
  const createUser = async (
    payload: CreateAdminUserPayload
  ): Promise<{ success: boolean; error?: string; errors?: Record<string, string[]> }> => {
    isActionLoading.value = true
    try {
      const res: any = await $api('/users', {
        method: 'POST',
        body: payload,
      })

      const raw = res?.data || res
      const userStatus: AdminUserStatus =
        raw.status === 'suspended' ? 'suspended' : raw.status === 'inactive' ? 'inactive' : 'active'

      const newUser: AdminUser = {
        id: String(raw.id),
        name: raw.name || payload.name,
        email: raw.email || payload.email,
        phone: raw.phone || payload.phone,
        city: raw.governorate?.name_ar || 'اليمن',
        role: 'مسؤول نظام',
        active: userStatus === 'active',
        status: userStatus,
        createdAt: raw.created_at || new Date().toISOString(),
      }

      // إضافة المستخدم الجديد مباشرة في بداية القائمة
      users.value = [newUser, ...users.value.filter(u => u.id !== newUser.id)]

      notify('تم إنشاء حساب المسؤول بنجاح.')
      return { success: true }
    } catch (err: any) {
      console.error('Failed to create admin user:', err)
      const fieldErrors = err?.data?.errors || err?.response?._data?.errors || {}
      const msg = err?.data?.message || err?.userMessage || err?.message || 'تعذر إنشاء حساب المسؤول. يرجى مراجعة الحقول.'
      notify(msg)
      return {
        success: false,
        error: msg,
        errors: fieldErrors,
      }
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * تحديث حالة المستخدم (نشط / غير نشط / معلق) عبر الـ API
   */
  const updateUserStatus = async (userId: string, newStatus: AdminUserStatus): Promise<boolean> => {
    const targetUser = users.value.find(u => u.id === userId)
    const prevStatus = targetUser?.status ?? (targetUser?.active ? 'active' : 'inactive')
    const prevActive = targetUser?.active ?? true

    // تحديث متفائل (Optimistic Update)
    if (targetUser) {
      targetUser.status = newStatus
      targetUser.active = newStatus === 'active'
    }

    try {
      await $api(`/users/${userId}/status`, {
        method: 'PATCH',
        body: {
          status: newStatus,
        },
      })

      const statusMessages: Record<AdminUserStatus, string> = {
        active: 'تم تنشيط الحساب بنجاح.',
        inactive: 'تم إيقاف تنشيط الحساب بنجاح.',
        suspended: 'تم تعليق / حظر الحساب بنجاح.',
      }

      notify(statusMessages[newStatus] || 'تم تحديث حالة المستخدم بنجاح.')
      return true
    } catch (err: any) {
      console.error('Failed to update user status:', err)
      // التراجع في حال الفشل
      if (targetUser) {
        targetUser.status = prevStatus
        targetUser.active = prevActive
      }
      const msg = err?.userMessage || err?.data?.message || err?.message || 'فشل تحديث حالة المستخدم.'
      notify(msg)
      return false
    }
  }

  return {
    users,
    isLoading,
    isActionLoading,
    error,
    fetchUsers,
    createUser,
    updateUserStatus,
  }
}
