export interface CustomerProfileForm {
  fullName: string
  accountType: string
  city: string
  email: string
  phone: string
  address: string
  twoFactorEnabled: boolean
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export type CustomerProfileField = keyof CustomerProfileForm
export type CustomerProfileErrors = Partial<Record<CustomerProfileField, string>>
export type CustomerProfileSaveState = 'idle' | 'saving' | 'success' | 'error'

export interface CustomerProfileSummary {
  initials: string
  customerId: string
  verified: boolean
}

export interface CustomerSession {
  id: string
  browser: string
  operatingSystem: string
  location: string
  isCurrent: boolean
}
