// ============================================================
// Supplier Finance / Payouts Types
// ============================================================

export type SupplierPayoutStatus = 'pending' | 'completed' | 'failed'

export interface SupplierSettlementItem {
  id: number
  orderStoreId?: number
  orderNumber: string
  orderDate: string
  grossAmount: number
  commissionRate: number
  commissionAmount: number
  netPayout: number
  status: SupplierPayoutStatus
  payoutDate: string
  payoutNote: string
  transferReference: string
  bankOrWalletName: string
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
  notes?: string
  /** طريقة التحويل: محفظة إلكترونية أو حساب بنكي */
  method?: 'wallet' | 'bank'
  walletProviderName?: string
  accountNumber?: string
  accountHolderName?: string
}
