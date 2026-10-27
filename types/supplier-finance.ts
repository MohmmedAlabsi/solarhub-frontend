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

export interface WithdrawRequestInput {
  amount: number
  method: 'wallet' | 'bank'
  walletProviderId?: number
  walletProviderName?: string
  accountNumber: string
  accountHolderName: string
  notes?: string
}
