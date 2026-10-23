import type { AdminUser } from '../../types/admin'

export const useAdminUsers = () => {
  const { $api } = useNuxtApp()
  const { notify } = useAdminNotice()

  const users = useState<AdminUser[]>('admin_users_data', () => [])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * جلب قائمة المستخدمين من الخادم
   */
  const fetchUsers = async (force = false): Promise<AdminUser[]> => {
    if (!force && users.value.length > 0) {
      return users.value
    }

    isLoading.value = true
    error.value = null

    try {
      const res: any = await $api('/users')
      let rawList: any[] = []

      if (Array.isArray(res)) {
        rawList = res
      } else if (Array.isArray(res?.data)) {
        rawList = res.data
      } else if (Array.isArray(res?.data?.data)) {
        rawList = res.data.data
      }

      const mapped: AdminUser[] = rawList.map((item: any) => {
        let role = 'عميل سكني'
        if (item.has_store) {
          role = 'مورد معتمد'
        } else if (item.has_engineer_profile) {
          role = 'مهندس طاقة شمسية'
        }

        return {
          id: String(item.id),
          name: item.name || 'مستخدم المنصة',
          email: item.email || '',
          phone: item.phone || '—',
          city: item.governorate?.name_ar || 'اليمن',
          role: role as any,
          active: item.status === 'active',
          createdAt: item.created_at || new Date().toISOString(),
        }
      })

      // الاحتفاظ بالتعديلات التي قد تكون حدثت محلياً
      if (users.value.length > 0) {
        const localStatusMap = new Map(users.value.map(u => [u.id, u.active]))
        mapped.forEach(u => {
          if (localStatusMap.has(u.id)) {
            u.active = localStatusMap.get(u.id)!
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
   * تحديث حالة المستخدم (نشط / غير نشط) عبر الـ API
   */
  const updateUserStatus = async (userId: string, newActive: boolean): Promise<boolean> => {
    const targetUser = users.value.find(u => u.id === userId)
    const prevActive = targetUser ? targetUser.active : !newActive

    // تحديث متفائل
    if (targetUser) {
      targetUser.active = newActive
    }

    try {
      await $api(`/users/${userId}/status`, {
        method: 'PATCH',
        body: {
          status: newActive ? 'active' : 'inactive',
        },
      })

      notify(newActive ? 'تم تفعيل الحساب بنجاح.' : 'تم إلغاء تنشيط الحساب بنجاح.')
      return true
    } catch (err: any) {
      console.error('Failed to update user status:', err)
      // التراجع في حال الفشل
      if (targetUser) {
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
    error,
    fetchUsers,
    updateUserStatus,
  }
}
