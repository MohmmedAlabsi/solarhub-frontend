// ============================================================
// Supplier Order Types
// ============================================================

export type SupplierOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'accepted'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'refunded'

export interface SupplierOrderProductItem {
  id: number
  title: string
  referenceNumber: string
  brand: string
  category: string
  warrantyLabel: string
  image: string
  quantity: number
  unitLabel: string
  unitPrice: number
  totalPrice: number
}

export interface SupplierOrderItem {
  id: number
  order_id: number
  orderNumber: string
  createdAt: string
  clientName: string
  clientPhone: string
  deliveryAddress: string
  governorate: string
  itemsSummary: string
  totalItemsCount: number
  unitLabel: string
  subtotal: number
  taxAmount: number
  totalStoreShare: number
  status: SupplierOrderStatus
  notes: string
  deliveredAt?: string | null
  customerConfirmedAt?: string | null
  items: SupplierOrderProductItem[]
}
