export interface VisitorProductItem {
  id: number
  title: string
  modelNumber: string
  sku: string
  brand: string
  category: string
  imageUrl: string
  price: number | null
  stockQuantity: number
  warrantyPeriod: string
  governorateName: string
  storeName: string
  storeId?: number
}

export interface VisitorStoreItem {
  id: number
  companyName: string
  governorateName: string
  addressDetails: string
  bio: string
  logoUrl: string
  storeType: string
  rating: number
  ratingsCount: number
  whatsappNumber?: string
}

export interface VisitorEngineerItem {
  id: number
  name: string
  specialization: string
  governorateName: string
  yearsOfExperience: number
  bio: string
  photoUrl: string
  rating: number
  ratingsCount: number
  licenseNumber: string
}

export interface PlatformStats {
  totalProducts: number
  totalStores: number
  totalEngineers: number
}
