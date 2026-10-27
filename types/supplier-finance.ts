export type SupplierPayoutStatus = 'completed' | 'pending' | 'failed'

export interface SupplierSettlementItem {
  id: number
  orderStoreId?: number
  orderNumber: string
  orderDate?: string
  grossAmount: number
  commissionRate: number
  commissionAmount: number
  netPayout: number
  status: SupplierPayoutStatus
  payoutDate: string
  payoutNote?: string
  transferReference?: string
  bankOrWalletName?: string
}

export interface SupplierFinanceSummary {
  totalSettled: number
  totalPending: number
  totalCommissions: number
  netAvailable: number
  settlementsCount: number
}
