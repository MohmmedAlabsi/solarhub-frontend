import type { AdminUser, AdminUserStatus } from '../../types/admin'

export const useAdminUsers = () => {
  const { $api } = useNuxtApp()
  const { notify } = useAdminNotice()

  const users = useState<AdminUser[]>('admin_users_data', () => [])
  const isLoading = ref(false)
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
      const res: any = await $api('/users?per_page=100')

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
        if (item.has_store) {
          role = 'مورد معتمد'
        } else if (item.has_engineer_profile) {
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
    error,
    fetchUsers,
    updateUserStatus,
  }
}
