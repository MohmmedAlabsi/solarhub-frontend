export interface SupplierOrderProductItem {
  id: number
  title: string
  referenceNumber: string
  warrantyLabel: string
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
  itemsSummary: string
  totalItemsCount: number
  unitLabel: string
  subtotal: number
  taxAmount: number
  totalStoreShare: number
  status: 'pending' | 'accepted' | 'shipped' | 'delivered' | 'completed' | 'rejected' | 'cancelled'
  items: SupplierOrderProductItem[]
}
