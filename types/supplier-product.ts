export interface MasterProductImage {
  id: number
  url: string
  image_url?: string
  image_path?: string
  is_featured: boolean
}

export interface MasterProductSummary {
  id: number
  title: string
  model_number?: string
  description?: string
  category_id?: number
  brand_id?: number
  category?: { id: number; name_ar: string; name_en?: string }
  brand?: { id: number; name: string }
  images?: MasterProductImage[]
  image?: string
}

export interface GovernorateItem {
  id: number
  name_ar: string
  name_en?: string
}

export interface SupplierProductItem {
  id: number
  master_product_id: number
  title: string
  sku: string
  brand: string
  category: string
  governorate_id?: number | null
  governorate_name?: string
  image: string
  images?: MasterProductImage[]
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
  governorate_id?: number | null
  price: number
  stock_quantity: number
  min_order_qty: number
  warranty_period?: string
  status?: string
}

export interface UpdateSupplierProductInput {
  governorate_id?: number | null
  price?: number
  stock_quantity?: number
  min_order_qty?: number
  warranty_period?: string
  status?: 'active' | 'inactive' | 'out_of_stock'
}
