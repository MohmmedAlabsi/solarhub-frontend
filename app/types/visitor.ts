// ============================================================
// Visitor / Public Landing Page Types
// ============================================================
// الحقول التي قد لا تتوفر لها بيانات حقيقية من الـ API تكون null،
// والواجهة تخفيها أو تعرض "—" بدل اختراع قيمة.

export interface VisitorProductItem {
  id: number
  title: string
  modelNumber: string | null
  sku: string | null
  brand: string | null
  category: string
  imageUrl: string
  price: number | null
  stockQuantity: number
  warrantyPeriod: string | null
  governorateName: string | null
  storeName: string
  storeId?: number
  /** لا يوجد تقييم للمنتجات في الـ API حالياً */
  rating: number | null
  reviewsCount: number | null
}

export interface VisitorStoreItem {
  id: number
  companyName: string
  governorateName: string | null
  addressDetails: string | null
  bio: string | null
  logoUrl: string
  storeType: string | null
  /** null إذا لم يكن للمتجر تقييمات معتمدة */
  rating: number | null
  ratingsCount: number
  whatsappNumber?: string
  productsCount: number | null
  tags: string[]
}

export interface VisitorEngineerItem {
  id: number
  name: string
  specialization: string | null
  governorateName: string | null
  yearsOfExperience: number | null
  bio: string | null
  photoUrl: string
  /** null إذا لم يكن للمهندس تقييمات معتمدة */
  rating: number | null
  ratingsCount: number
  licenseNumber: string | null
  /** لا يوجد عدد مشاريع في الـ API حالياً */
  projectsCount: number | null
}

/** null = لم تصل أرقام حقيقية من الـ API بعد */
export interface PlatformStats {
  totalProducts: number | null
  totalStores: number | null
  totalEngineers: number | null
}
