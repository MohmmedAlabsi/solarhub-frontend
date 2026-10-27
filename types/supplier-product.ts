export interface MasterProductSummary {
  id: number
  title: string
  model_number?: string
  description?: string
  category?: { id: number; name_ar: string; name_en?: string }
  brand?: { id: number; name: string }
  images?: Array<{ id: number; image_url?: string; path?: string; is_primary?: boolean }>
  image?: string
}

export interface SupplierProductItem {
  id: number
  master_product_id: number
  title: string
  sku: string
  brand: string
  category: string
  image: string
  unitPrice: number
  stockQuantity: number
  minOrderQty: number
  warrantyPeriod?: string
  status: 'active' | 'out_of_stock' | 'inactive'
  unitLabel?: string
  createdAt?: string
}

export interface CreateSupplierProductInput {
  master_product_id: number
  price: number
  stock_quantity: number
  min_order_qty: number
  warranty_period?: string
  status?: string
}

export interface UpdateSupplierProductInput {
  price?: number
  stock_quantity?: number
  min_order_qty?: number
  warranty_period?: string
  status?: 'active' | 'inactive' | 'out_of_stock'
}
