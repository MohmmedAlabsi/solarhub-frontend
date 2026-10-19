/**
 * SolarHub Core API Types & Contracts
 * المتغيرات والأنماط البرمجية الموحدة لربط الفرونت إند مع الـ Laravel API
 */

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface Category {
  id: number;
  name_ar: string;
  name_en: string;
  slug?: string;
  parent_id?: number | null;
  icon_url?: string | null;
  children?: Category[];
  products_count?: number;
  master_products_count?: number;
}

export interface Brand {
  id: number;
  name: string;
  logo_url?: string | null;
  website?: string | null;
  is_active?: boolean;
  products_count?: number;
  master_products_count?: number;
  created_at?: string;
}

export interface Governorate {
  id: number;
  name_ar: string;
  name_en?: string | null;
  is_active?: boolean;
}

export interface ServiceType {
  id: number;
  name: string;
  description?: string | null;
  icon?: string | null;
  is_active?: boolean;
  completed_orders_count?: number;
}

export interface Specialization {
  id: number;
  name: string;
  description?: string | null;
  is_active?: boolean;
  engineers_count?: number;
}

export interface ProductSpecification {
  id: number;
  product_id: number;
  name: string;
  value: string;
  unit?: string | null;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_path?: string;
  image_url: string;
  is_featured: boolean;
}

export interface MasterProduct {
  id: number;
  title: string;
  model_number?: string | null;
  description?: string | null;
  datasheet_file?: string | null;
  datasheet_url?: string | null;
  category_id?: number;
  brand_id?: number;
  category?: {
    id: number;
    name_ar: string;
    name_en: string;
  };
  brand?: {
    id: number;
    name: string;
  };
  specifications?: ProductSpecification[];
  images?: ProductImage[];
  stores_count?: number;
  is_active: boolean;
  created_at?: string;
}

export interface StoreProduct {
  id: number;
  store_id: number;
  product_id: number;
  price: number;
  original_price?: number | null;
  stock_quantity: number;
  warranty_period?: string | null;
  delivery_available?: boolean;
  is_active: boolean;
  master_product?: MasterProduct;
  store?: {
    id: number;
    name: string;
    city?: string;
    rating?: number;
  };
}

export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  delivery_governorate_id: number;
  total_amount: number;
  delivery_address: string;
  delivery_coordinates?: string | null;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  created_at: string;
  updated_at?: string;
  customer?: {
    id: number;
    name: string;
    phone?: string;
    email?: string;
  };
  governorate?: Governorate;
  order_stores?: OrderStore[];
  payments?: OrderPayment[];
}

export interface OrderItem {
  id: number;
  store_product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name?: string;
  product_image?: string;
}

export interface OrderStore {
  id: number;
  order_id: number;
  store_id: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shipping_cost: number;
  total: number;
  store_name?: string;
  items?: OrderItem[];
  created_at: string;
}

export interface OrderPayment {
  id: number;
  order_id: number;
  wallet_provider_id?: number;
  wallet_provider_name?: string;
  amount: number;
  transaction_reference?: string;
  receipt_path?: string;
  status: 'pending' | 'verified' | 'rejected';
  verified_by?: number | null;
  created_at: string;
}

export interface StorePayout {
  id: number;
  store_id: number;
  store_name?: string;
  amount: number;
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
  status: 'pending' | 'completed' | 'failed';
  transfer_reference?: string;
  bank_account?: {
    bank_name: string;
    iban: string;
  };
  created_at: string;
}
