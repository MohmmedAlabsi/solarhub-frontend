export interface SupplierQuoteItem {
  id: number
  quoteRequestNumber: string
  productTitle: string
  productCode: string
  productSpecs: string
  productEfficiency: string
  requestedQuantity: number
  unitLabel: string
  requestDate: string
  deliveryLocation: string
  clientNotes: string
  clientName?: string
  status: 'pending' | 'responded' | 'accepted' | 'rejected' | 'cancelled'
  quotedUnitPrice?: number
  quotedTotalPrice?: number
  supplierNotes?: string
  validUntil?: string
}

export interface RespondQuoteInput {
  quoteId: number
  unitPrice: number
  totalPrice: number
  supplierNotes?: string
  validityDays?: number
}
