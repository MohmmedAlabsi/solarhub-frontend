/**
 * SolarHub TypeScript Contracts for Authentication Module
 * Strict types matching Laravel 11 Auth & User Resources
 */

export type UserRole = 'customer' | 'supplier' | 'engineer'

export interface User {
  id: string | number
  name: string
  email: string
  phone: string
  role: UserRole
  governorate?: string
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
  createdAt: string
}

export interface LoginPayload {
  login: string // email or phone
  password: string
  remember?: boolean
}

export interface RegisterBasePayload {
  role: UserRole
  name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
  governorate: string
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
  cvFile?: File | null
  cvFileName?: string
}

export interface RegisterSupplierPayload extends RegisterBasePayload {
  role: 'supplier'
  companyName: string
  commercialRegisterFile?: File | null
  commercialRegisterFileName?: string
}

export type RegisterPayload = RegisterCustomerPayload | RegisterEngineerPayload | RegisterSupplierPayload

export interface ForgotPasswordPayload {
  login: string
}

export interface VerifyOtpPayload {
  email: string
  code: string
}
