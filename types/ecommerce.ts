/**
 * SolarHub TypeScript Contracts for E-Commerce Module (Mohamed)
 * Strict types matching Laravel 11 API Resources
 */

export interface Product {
  id: string | number
  name: string
  category: string
  categoryType: 'panel' | 'inverter' | 'battery' | 'pump' | 'controller' | 'accessories'
  brand: string
  model: string
  storeName: string
  storeCity: string
  price: number
  currency: string
  rating: number
  reviewsCount: number
  image: string
  specs?: {
    power?: string
    efficiency?: string
    voltage?: string
    current?: string
    capacity?: string
    warranty?: string
    origin?: string
    tier?: string
  }
  isQuoteOnly?: boolean
  badge?: string
  inStock: boolean
  stockQuantity?: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Store {
  id: string | number
  name: string
  legalName?: string
  city: string
  address: string
  phone: string
  email: string
  rating: number
  reviewsCount: number
  verified: boolean
  tierBadge?: string
  logo?: string
  banner?: string
  description?: string
  productsCount: number
  commercialRegNo?: string
}

export interface OrderItem {
  productId: string | number
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  image: string
  storeName: string
}

export interface Order {
  id: string
  orderNumber: string
  date: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  statusLabel: string
  items: OrderItem[]
  subtotal: number
  vat: number
  shippingFee: number
  total: number
  shippingAddress: {
    fullName: string
    phone: string
    city: string
    addressLine: string
  }
  paymentMethod: 'mada' | 'apple_pay' | 'sadad' | 'card'
  trackingSteps?: {
    title: string
    date: string
    done: boolean
    current?: boolean
  }[]
}

export interface QuoteRequest {
  id: string
  quoteNumber: string
  date: string
  productName: string
  storeName: string
  quantity: number
  status: 'received' | 'reviewing' | 'responded' | 'rejected'
  statusLabel: string
  notes?: string
  targetLocation?: string
}

