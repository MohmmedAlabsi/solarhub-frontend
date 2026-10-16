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
  id: string
  name: string
  role: string
  roleTitle: string
  avatarText: string
  permissions: string[]
}
