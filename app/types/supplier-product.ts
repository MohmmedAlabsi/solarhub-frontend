// ============================================================
// Supplier Product Types
// ============================================================

export interface SupplierGovernorateItem {
  id: number
  name_ar: string
  name_en?: string
}

export interface MasterProductImage {
  id?: number
  image_path?: string
  image_url?: string
  url?: string
  is_featured?: boolean
}

export interface MasterProductSummary {
  id: number
  title: string
  model_number?: string
  description?: string
  category_id?: number
  brand_id?: number
  category?: { id?: number; name?: string; name_ar?: string }
  brand?: { id?: number; name?: string }
  images?: MasterProductImage[]
  image?: string
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
  warrantyPeriod: string
  status: 'active' | 'out_of_stock' | 'inactive'
  unitLabel: string
  createdAt?: string
}

export interface CreateSupplierProductInput {
  master_product_id: number
  price: number
  stock_quantity: number
  min_order_qty: number
  warranty_period?: string
  governorate_id?: number | null
  /** حالة المنتج الأولية — القيمة تأتي من <select> في AddProductModal */
  status?: string
}

export interface UpdateSupplierProductInput {
  price?: number
  stock_quantity?: number
  min_order_qty?: number
  warranty_period?: string
  governorate_id?: number | null
  status?: 'active' | 'out_of_stock' | 'inactive'
}
