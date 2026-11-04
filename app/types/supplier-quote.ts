// ============================================================
// Supplier Quote (RFQ) Types
// ============================================================

export type SupplierQuoteStatus =
  | 'pending'
  | 'responded'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'cancelled'

export interface SupplierQuoteCustomer {
  id: number
  name: string
  phone: string
  email: string
}

export interface SupplierQuoteProduct {
  id: number
  title: string
  model_number: string
  sku: string
  brand: string
  category: string
  image: string | null
  warranty_period: string
  governorate: string
  listed_price: number | null
}

export interface SupplierQuoteItem {
  id: number
  quoteRequestNumber: string
  customer: SupplierQuoteCustomer
  product: SupplierQuoteProduct
  productTitle: string
  productCode: string
  productBrand: string
  productCategory: string
  productImage: string
  requestedQuantity: number
  unitLabel: string
  governorate: string
  customerTargetPrice: number | null
  offeredUnitPrice: number | null
  totalPrice: number | null
  status: SupplierQuoteStatus
  customerNotes: string
  storeNotes: string | null
  requestDate: string
  respondedAt: string | null
  acceptedAt: string | null
  rawCreatedAt: string
}

export interface RespondQuoteInput {
  /** ID of the quote to respond to */
  quoteId: number
  /** camelCase alias used by components & composable */
  offeredUnitPrice: number
  storeNotes?: string
  /** snake_case aliases kept for backend serialisation convenience */
  offered_unit_price?: number
  store_notes?: string
}
