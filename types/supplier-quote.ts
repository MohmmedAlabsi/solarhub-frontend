export type SupplierQuoteStatus = 'pending' | 'responded' | 'accepted' | 'rejected' | 'cancelled'

export interface SupplierQuoteCustomer {
  id: number
  name: string
  phone?: string
  email?: string
}

export interface SupplierQuoteStoreProduct {
  id: number
  title: string
  model_number?: string
  sku?: string
  brand?: string
  category?: string
  image?: string | null
  warranty_period?: string
  governorate?: string
  listed_price?: number | null
  store?: {
    id: number
    company_name: string
  }
}

export interface SupplierQuoteItem {
  id: number
  quoteRequestNumber: string
  customer: SupplierQuoteCustomer
  product: SupplierQuoteStoreProduct
  productTitle: string
  productCode: string
  productBrand: string
  productCategory: string
  productImage?: string | null
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
  quoteId: number
  offeredUnitPrice: number
  storeNotes?: string
}
