import {
  computed,
  onBeforeUnmount,
  onMounted,
  watch,
} from 'vue'
import { useAuthStore } from '../stores/auth'
import { fetchAllApiRows } from '../utils/apiCollection'

export interface CustomerApiNotification {
  id: string
  event_id?: string | null
  template_code?: string | null
  type: string
  title?: string | null
  body?: string | null
  action_url?: string | null

  sender?: {
    type: string
    id?: number | string | null
    name?: string | null
  } | null

  recipient_count: number
  is_read: boolean
  read_at?: string | null
  created_at?: string | null
}

interface ApiResponse<T> {
  status: string
  message?: string
  data: T
}

interface NotificationCollectionResponse {
  status: string
  message?: string

  data:
    | CustomerApiNotification[]
    | {
        data: CustomerApiNotification[]
        last_page?: number
        meta?: {
          last_page?: number
        }
      }

  meta?: {
    last_page?: number
  }
}

interface NotificationState {
  owner: string | null
  revision: number

  inbox: CustomerApiNotification[]
  outbox: CustomerApiNotification[]

  inboxLoaded: boolean
  outboxLoaded: boolean

  inboxLoading: boolean
  outboxLoading: boolean

  inboxError: string
  outboxError: string
  mutationError: string

  markingId: string | null
  markingAll: boolean
}

type Mailbox = 'inbox' | 'outbox'

function emptyState(
  owner: string | null,
  revision: number,
): NotificationState {
  return {
    owner,
    revision,
    inbox: [],
    outbox: [],
    inboxLoaded: false,
    outboxLoaded: false,
    inboxLoading: false,
    outboxLoading: false,
    inboxError: '',
    outboxError: '',
    mutationError: '',
    markingId: null,
    markingAll: false,
  }
}

export function useCustomerNotifications() {
  const auth = useAuthStore()
  const { $api } = useNuxtApp()

  const state = useState<NotificationState>(
    'customer-notifications-api',
    () => emptyState(null, 0),
  )

  let mounted = false

  const accountId = computed<string | null>(() => {
    if (!auth.isAuthenticated || !auth.user?.id) {
      return null
    }

    return String(auth.user.id)
  })

  const inbox = computed(() => state.value.inbox)
  const outbox = computed(() => state.value.outbox)

  const inboxLoaded = computed(() => state.value.inboxLoaded)
  const outboxLoaded = computed(() => state.value.outboxLoaded)

  const inboxLoading = computed(() => state.value.inboxLoading)
  const outboxLoading = computed(() => state.value.outboxLoading)

  const inboxError = computed(() => state.value.inboxError)
  const outboxError = computed(() => state.value.outboxError)
  const mutationError = computed(() => state.value.mutationError)

  const markingId = computed(() => state.value.markingId)
  const markingAll = computed(() => state.value.markingAll)

  const mutationBusy = computed(() =>
    state.value.markingAll || state.value.markingId !== null,
  )

  const inboxCount = computed<number | null>(() => {
    if (
      !state.value.inboxLoaded
      || state.value.inboxLoading
      || state.value.inboxError
    ) {
      return null
    }

    return state.value.inbox.length
  })

  const unreadCount = computed<number | null>(() => {
    if (inboxCount.value === null) return null

    return state.value.inbox.filter(item => !item.is_read).length
  })

  const sentCount = computed<number | null>(() => {
    if (
      !state.value.outboxLoaded
      || state.value.outboxLoading
      || state.value.outboxError
    ) {
      return null
    }

    return state.value.outbox.length
  })

  function isCurrent(owner: string, revision: number): boolean {
    return accountId.value === owner
      && state.value.owner === owner
      && state.value.revision === revision
  }

  async function loadMailbox(
    mailbox: Mailbox,
    force = false,
  ): Promise<void> {
    const loadingKey = mailbox === 'inbox'
      ? 'inboxLoading'
      : 'outboxLoading'

    const loadedKey = mailbox === 'inbox'
      ? 'inboxLoaded'
      : 'outboxLoaded'

    const errorKey = mailbox === 'inbox'
      ? 'inboxError'
      : 'outboxError'

    const owner = accountId.value

    if (!owner) {
      state.value[errorKey] = 'سجّل الدخول لعرض الإشعارات.'
      return
    }

    if (
      state.value[loadingKey]
      || mutationBusy.value
      || (!force && state.value[loadedKey])
    ) {
      return
    }

    const revision = state.value.revision

    state.value[loadingKey] = true
    state.value[errorKey] = ''

    try {
      const rows = await fetchAllApiRows<CustomerApiNotification>(
        query => $api<NotificationCollectionResponse>(
          `/my/notifications/${mailbox}`,
          { query },
        ),
        100,
      )

      if (!isCurrent(owner, revision)) return

      state.value[mailbox] = rows
      state.value[loadedKey] = true
    } catch {
      if (!isCurrent(owner, revision)) return

      state.value[loadedKey] = false

      state.value[errorKey] = mailbox === 'inbox'
        ? 'تعذر تحميل الإشعارات الواردة. أعد المحاولة.'
        : 'تعذر تحميل الإشعارات الصادرة. أعد المحاولة.'
    } finally {
      if (isCurrent(owner, revision)) {
        state.value[loadingKey] = false
      }
    }
  }

  function loadInbox(force = false) {
    return loadMailbox('inbox', force)
  }

  function loadOutbox(force = false) {
    return loadMailbox('outbox', force)
  }

  async function markRead(id: string): Promise<boolean> {
    const owner = accountId.value

    if (
      !owner
      || mutationBusy.value
      || state.value.inboxLoading
    ) {
      return false
    }

    const notification = state.value.inbox.find(
      item => String(item.id) === String(id),
    )

    if (!notification) return false
    if (notification.is_read) return true

    const revision = state.value.revision

    state.value.markingId = String(notification.id)
    state.value.mutationError = ''

    try {
      const response = await $api<
        ApiResponse<CustomerApiNotification>
      >(
        `/my/notifications/${encodeURIComponent(notification.id)}/read`,
        {
          method: 'PATCH',
          retry: 0,
        },
      )

      if (!isCurrent(owner, revision)) return false

      if (
        response.status !== 'success'
        || !response.data
        || String(response.data.id) !== String(notification.id)
        || response.data.is_read !== true
      ) {
        throw new Error('Read status was not confirmed')
      }

      state.value.inbox = state.value.inbox.map(item =>
        String(item.id) === String(notification.id)
          ? response.data
          : item,
      )

      return true
    } catch {
      if (!isCurrent(owner, revision)) return false

      state.value.mutationError =
        'تعذر تأكيد حفظ حالة القراءة. حدّث الإشعارات للتحقق.'

      return false
    } finally {
      if (isCurrent(owner, revision)) {
        state.value.markingId = null
      }
    }
  }

  async function markAllRead(): Promise<boolean> {
    const owner = accountId.value

    if (
      !owner
      || mutationBusy.value
      || state.value.inboxLoading
      || !state.value.inboxLoaded
      || state.value.inboxError
    ) {
      return false
    }

    if (unreadCount.value === 0) return true

    const revision = state.value.revision

    state.value.markingAll = true
    state.value.mutationError = ''

    try {
      const response = await $api<ApiResponse<null>>(
        '/my/notifications/read-all',
        {
          method: 'PATCH',
          retry: 0,
        },
      )

      if (!isCurrent(owner, revision)) return false

      if (response.status !== 'success') {
        throw new Error('Read status was not confirmed')
      }

      state.value.inbox = state.value.inbox.map(item => ({
        ...item,
        is_read: true,
      }))

      return true
    } catch {
      if (!isCurrent(owner, revision)) return false

      state.value.mutationError =
        'تعذر تأكيد تحديد جميع الإشعارات كمقروءة. حدّث القائمة للتحقق.'

      return false
    } finally {
      if (isCurrent(owner, revision)) {
        state.value.markingAll = false
      }
    }
  }

  function clearMutationError() {
    state.value.mutationError = ''
  }

  watch(
    accountId,
    owner => {
      if (state.value.owner !== owner) {
        state.value = emptyState(
          owner,
          state.value.revision + 1,
        )
      }

      if (mounted && owner) {
        void loadInbox()
      }
    },
    {
      immediate: true,
      flush: 'sync',
    },
  )

  onMounted(() => {
    mounted = true
    void loadInbox()
  })

  onBeforeUnmount(() => {
    mounted = false
  })

  return {
    inbox,
    outbox,
    inboxLoaded,
    outboxLoaded,
    inboxLoading,
    outboxLoading,
    inboxError,
    outboxError,
    mutationError,
    inboxCount,
    unreadCount,
    sentCount,
    markingId,
    markingAll,
    mutationBusy,
    loadInbox,
    loadOutbox,
    markRead,
    markAllRead,
    clearMutationError,
  }
}