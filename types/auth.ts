/**
 * SolarHub TypeScript Contracts for Authentication Module
 * Strict types matching Laravel 11 Auth & User Resources
 */

export type UserRole = 'customer' | 'supplier' | 'engineer' | 'admin'

export interface User {
  id: string | number
  name: string
  email: string
  phone: string
  role: UserRole
  status?: string
  governorate?: string | { id: number; name_ar: string } | null
  location?: {
    lat: number
    lng: number
    address?: string
  }
  companyName?: string
  commercialRegisterUrl?: string
  cvUrl?: string
  avatar?: string
  isVerified: boolean
  isSuspended?: boolean
  has_store?: boolean
  has_engineer_profile?: boolean
  createdAt: string
}

export interface LoginPayload {
  login: string // email or phone
  password: string
  remember?: boolean
}

export interface RegisterBasePayload {
  role: 'customer' | 'supplier' | 'engineer'
  name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
  governorate?: string
  location?: {
    lat: number
    lng: number
    address?: string
  }
}

export interface RegisterCustomerPayload extends RegisterBasePayload {
  role: 'customer'
}

export interface RegisterEngineerPayload extends RegisterBasePayload {
  role: 'engineer'
  licenseNumber?: string
  license_number?: string
  cvFile?: File | null
  cvFileName?: string
}

export interface RegisterSupplierPayload extends RegisterBasePayload {
  role: 'supplier'
  companyName: string
  commercialRegistry?: string
  commercial_registry?: string
  storeType?: 'wholesaler' | 'retailer' | 'authorized_agent'
  store_type?: 'wholesaler' | 'retailer' | 'authorized_agent'
  commercialRegisterFile?: File | null
  commercialRegisterFileName?: string
  addressDetails?: string
  address_details?: string
}

export type RegisterPayload = RegisterCustomerPayload | RegisterEngineerPayload | RegisterSupplierPayload

export interface ForgotPasswordPayload {
  login: string
}

export interface VerifyOtpPayload {
  email: string
  code: string
}
