import type { AdminAudience, AdminBroadcast } from '../../types/admin'

export function useAdminNotifications() {
  const { $api } = useNuxtApp()
  const { notify } = useAdminNotice()

  const notifications = useState<AdminBroadcast[]>('admin_notifications_list', () => [])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchNotifications() {
    loading.value = true
    error.value = null
    try {
      const response = await $api<{
        status: string
        data: Array<{
          id: string
          title: string
          content: string
          audience: AdminAudience
          read_percentage: number | null
          readPercentage?: number | null
          created_at: string
          createdAt?: string
        }>
      }>('/api/admin/notifications')

      if (response && response.data) {
        notifications.value = response.data.map(item => ({
          id: item.id,
          title: item.title,
          content: item.content,
          audience: (['all', 'customers', 'suppliers', 'engineers'].includes(item.audience) ? item.audience : 'all') as AdminAudience,
          readPercentage: item.readPercentage ?? item.read_percentage ?? null,
          createdAt: item.createdAt || item.created_at,
        }))
      }
    } catch (err: any) {
      console.error('Failed to load admin notifications:', err)
      error.value = 'تعذر تحميل الإشعارات من الخادم.'
    } finally {
      loading.value = false
    }
  }

  async function broadcastNotification(payload: { title: string; content: string; audience: AdminAudience }) {
    const response = await $api<{
      status: string
      message?: string
      data: {
        id: string
        title: string
        content: string
        audience: AdminAudience
        read_percentage: number | null
        created_at: string
      }
    }>('/api/admin/notifications/broadcast', {
      method: 'POST',
      body: payload,
    })

    if (response && response.data) {
      const newBroadcast: AdminBroadcast = {
        id: response.data.id,
        title: response.data.title,
        content: response.data.content,
        audience: response.data.audience,
        readPercentage: response.data.read_percentage ?? 0,
        createdAt: response.data.created_at,
      }
      notifications.value.unshift(newBroadcast)
      notify('تم إرسال الإشعار العام إلى المستخدمين المستهدفين بنجاح.')
      return true
    }
    return false
  }

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    broadcastNotification,
  }
}
