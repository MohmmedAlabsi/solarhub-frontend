export type CustomerNotificationTab = 'inbox' | 'sent' | 'unread'
export type NotificationLoadStatus = 'success' | 'loading' | 'error'
export type NotificationViewState = Exclude<NotificationLoadStatus, 'success'> | 'ready' | 'empty' | 'filtered-empty'
export type NotificationPreviewMode = 'empty' | 'empty-inbox' | 'empty-sent' | 'loading' | 'error'
export type CustomerNotificationCategory = 'shipping' | 'engineering' | 'financial' | 'building' | 'quote' | 'consultation'

interface CustomerNotificationBase {
  id: string
  category: CustomerNotificationCategory
  title: string
  description: string
  timeLabel: string
  action: { label: string; destination: string } | { label: string; unavailableMessage: string }
}

export interface CustomerNotification extends CustomerNotificationBase {
  direction: 'inbox'
  isRead: boolean
}

export interface SentCustomerNotification extends CustomerNotificationBase {
  direction: 'sent'
  /** Fixture state, never evidence of server delivery or recipient reading. */
  status: 'sent' | 'pending'
}

export type CustomerNotificationItem = CustomerNotification | SentCustomerNotification

export type NotificationOverviewSummary =
  | { kind: 'inbox'; totalCount: number; unreadCount: number }
  | { kind: 'sent'; totalCount: number; pendingCount: number }

export interface CustomerNotificationMailbox {
  inbox: CustomerNotification[]
  sent: SentCustomerNotification[]
}
