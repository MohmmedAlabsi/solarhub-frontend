export interface AdminProduct {
  id: string
  name: string
  nameEn?: string
  subtitle: string
  category: string
  categoryEn?: string
  categoryType: 'panel' | 'inverter' | 'battery' | 'pump' | 'controller' | 'mounting'
  brand: string
  modelNumber: string
  status: 'active' | 'inactive'
  datasheet?: string
  images: string[]
  featuredImageIndex: number
  specs?: Record<string, string>
}

export interface AdminOrderProduct {
  name: string
  quantity: string
  unitPrice: number
  total: number
}

export interface AdminSupplierOrderGroup {
  supplierId: string
  supplierName: string
  subtotal: number
  status: 'تم الشحن' | 'قيد التجهيز' | 'تم التسليم' | 'ملغي'
  deliveryDate: string
  customerConfirmation: 'قيد الانتظار' | 'تم الاستلام' | 'مرفوض'
  notes: string
  products: AdminOrderProduct[]
}

export interface AdminOrder {
  id: string
  orderNumber: string
  customerName: string
  customerAvatarText: string
  city: string
  address: string
  totalAmount: number
  status: 'قيد المعالجة' | 'قيد التجهيز والشحن' | 'تم التسليم' | 'مكتمل' | 'ملغي'
  createdAt: string
  groups: AdminSupplierOrderGroup[]
}

export interface AdminPayment {
  id: string
  orderNumber: string
  walletProvider: string
  amount: number
  transactionRef: string
  receiptImage?: string
  status: 'تم التحقق' | 'قيد المراجعة' | 'مرفوض'
  verifierName?: string
  paymentDate: string
  verificationDate?: string
}

export interface AdminPayout {
  id: string
  subOrderId: string
  storeName: string
  storeInitials: string
  bankAccount: {
    bankName: string
    accountType: string
    iban: string
  }
  totalAmount: number
  commissionRate: number
  commissionAmount: number
  netAmount: number
  payoutStatus: 'مكتمل' | 'قيد الانتظار' | 'فشل الصرف'
  transferRef?: string
  payoutDate?: string
}

export interface AdminCategory {
  id: string
  nameAr: string
  nameEn: string
  type: 'رئيسي' | 'فرعي'
  parentName?: string
  slug: string
  productsCount: number
  status: 'active' | 'inactive'
}

export interface AdminBrand {
  id: string
  name: string
  logoText: string
  website: string
  productsCount: number
  status: 'active' | 'inactive'
}

export interface AdminSpecialty {
  id: string
  title: string
  code: string
  description: string
  engineersCount: number
  status: 'active' | 'inactive'
  iconType: 'grid' | 'battery' | 'droplet' | 'wrench' | 'shield'
}

export interface AdminServiceType {
  id: string
  title: string
  code: string
  description: string
  completedOrdersCount: number
  status: 'active' | 'inactive'
  iconType: 'solar' | 'battery' | 'droplet' | 'search' | 'clipboard'
}

export interface AdminCity {
  id: string
  nameAr: string
  nameEn: string
  code: string
  status: 'active' | 'inactive'
}

export interface AdminPermissionItem {
  id: string
  label: string
  description?: string
  checked: boolean
}

export interface AdminPermissionGroup {
  id: string
  title: string
  icon: string
  items: AdminPermissionItem[]
  expanded?: boolean
}

export interface AdminRoleUser {
  id: string | number
  name: string
  role: string
  roleTitle?: string
  role_title?: string
  email?: string
  phone?: string
  status?: string
  direct_permissions?: string[]
  all_permissions?: string[]
  roles?: string[]
  created_at?: string
  avatarText?: string
  permissions?: string[]
}

export type AdminApproval = 'approved' | 'pending' | 'rejected'
export type AdminAudience = 'all' | 'customers' | 'suppliers' | 'engineers' | 'specific'
export type AdminUserStatus = 'active' | 'inactive' | 'suspended'

export interface AdminUser {
  id: string
  name: string
  email: string
  phone: string
  city: string
  role: 'عميل سكني' | 'عميل تجاري' | 'مهندس طاقة شمسية' | 'مورد معتمد' | string
  active: boolean
  status?: AdminUserStatus
  createdAt: string
}
export interface AdminDocument { id: string; name: string; size: string; url?: string }
export interface AdminSupplier {
  id: string; name: string; owner: string; email: string; phone: string
  commercialNumber: string; taxNumber: string; city: string; address: string
  governorate?: string; coordinates?: { lat: number; lng: number } | null
  latitude?: number | null; longitude?: number | null; whatsapp?: string; logo?: string
  storeType: 'وكيل معتمد' | 'متجر متخصص' | 'موزع رئيسي' | 'موزع معتمد' | string
  approval: AdminApproval; description: string; rejectionReason: string; document?: AdminDocument
}
export interface AdminEngineer {
  id: string; name: string; title: string; email: string; phone: string; city: string
  governorate?: string; coordinates?: { lat: number; lng: number } | null
  latitude?: number | null; longitude?: number | null
  license: string; licenseAuthority: string; experience: number; specialties: string[]
  approval: AdminApproval; approvedAt?: string; bio: string; rejectionReason: string
  documents: AdminDocument[]; image?: string
}
export type AdminServiceStatus = 'open' | 'awarded' | 'executing' | 'completed' | 'cancelled'
export interface AdminServiceOffer {
  id: string; engineerId: string; price: number; duration: number; proposal: string
  status: 'قيد الانتظار' | 'مقبول' | 'مرفوض'; document?: AdminDocument
}
export interface AdminServiceRequest {
  id: string; client: string; service: string; city: string; capacity: number
  status: AdminServiceStatus; location: string; coordinates?: string; description: string
  documents: AdminDocument[]; offers: AdminServiceOffer[]
}
export interface AdminReview {
  id: string; orderId: string; client: string; targetId: string; targetName?: string; score: number
  comment: string; approved: boolean
}
export interface AdminBroadcast {
  id: string; title: string; content: string; audience: AdminAudience
  targetUser?: { id: number | string; name: string; email?: string } | null
  readPercentage: number | null; createdAt: string; simulated?: boolean
}
export interface AdminPlatformSettings {
  nameAr: string; nameEn: string; email: string; phone: string; maintenance: boolean
}
export interface AdminDisplayPreferences { language: 'ar'; theme: 'light'; density: 'comfortable' | 'compact' }
export interface AdminDirectoryDraft extends Pick<AdminUser, 'name' | 'email' | 'phone' | 'city' | 'role'>,
  Pick<AdminSupplier, 'owner' | 'commercialNumber' | 'taxNumber' | 'address' | 'storeType'>,
  Pick<AdminEngineer, 'title' | 'license' | 'experience'> { specialties: string }
export type AdminDirectoryKind = 'user' | 'supplier' | 'engineer'
