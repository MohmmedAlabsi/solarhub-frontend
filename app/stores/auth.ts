import { defineStore } from 'pinia'
import type { User, UserRole, LoginPayload, RegisterPayload, VerifyOtpPayload } from '~~/types/auth'

export interface UserProfile {
  id: number | string
  name: string
  email: string
  phone: string
  status?: string
  email_verified?: boolean
  email_verified_at?: string | null
  role: 'customer' | 'supplier' | 'engineer' | 'admin' | string | null
  governorate?: {
    id: number
    name_ar: string
  } | string | null
  has_store?: boolean
  has_engineer_profile?: boolean
  onboarding_status?: string
  created_at?: string
  createdAt?: string
  isVerified?: boolean
  permissions?: string[]
}

export const useAuthStore = defineStore('auth', () => {
  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  const authPermissionsCookie = useCookie<string[]>('auth_permissions', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    default: () => [],
  })

  const user = ref<User | null>(null)
  const isInitialized = ref(false)
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isEmailVerified = computed(() => !!user.value?.isVerified)
  const userRole = computed<UserRole | null>(() => (user.value?.role as UserRole) || null)

  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const validationErrors = ref<Record<string, string[]>>({})

  const config = useRuntimeConfig()
  const apiBase = (config.public.apiBaseUrl as string) || (config.public.apiBase as string) || 'http://127.0.0.1:8000/api'

  function setAuth(newUser: any, newToken: string) {
    token.value = newToken
    setUser(newUser)
    isInitialized.value = true
  }

  function setUser(newUser: any | null) {
    if (!newUser) {
      user.value = null
      authPermissionsCookie.value = []
    } else {
      user.value = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
        governorate: typeof newUser.governorate === 'object' ? newUser.governorate?.name_ar : newUser.governorate,
        isVerified: !!(newUser.email_verified || newUser.isVerified || newUser.email_verified_at),
        has_store: newUser.has_store,
        has_engineer_profile: newUser.has_engineer_profile,
        createdAt: newUser.created_at || newUser.createdAt || new Date().toISOString(),
        permissions: Array.isArray(newUser.permissions) ? newUser.permissions : (authPermissionsCookie.value || []),
      }
    }
    isInitialized.value = true
  }

  function setToken(newToken: string | null) {
    token.value = newToken
  }

  function clearAuth() {
    user.value = null
    token.value = null
    authPermissionsCookie.value = []
    isInitialized.value = true
    clearErrors()
  }

  function clearErrors() {
    error.value = null
    validationErrors.value = {}
  }

  /**
   * Internal helper to execute API requests with token injection and error handling
   */
  async function apiRequest<T = any>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
      body?: any
      headers?: Record<string, string>
    } = {}
  ): Promise<{ success: boolean; data?: T; message?: string; error?: string; errors?: Record<string, string[]>; status?: number }> {
    clearErrors()
    const url = `${apiBase}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...options.headers,
    }

    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`
    }

    try {
      const response = await $fetch<{ status: string; message?: string; data?: T }>(url, {
        method: options.method || 'GET',
        headers,
        body: options.body,
      })

      return {
        success: true,
        data: response.data,
        message: response.message,
      }
    } catch (err: any) {
      const errResponse = err?.data
      let message = errResponse?.message || err?.message || 'حدث خطأ في الاتصال بالخادم'
      const errors = errResponse?.errors || {}

      // Friendly translations for common validation errors
      if (errors.email && errors.email[0]?.includes('already been taken')) {
        message = 'البريد الإلكتروني مسجل مسبقاً في المنصة'
      } else if (errors.phone && errors.phone[0]?.includes('already been taken')) {
        message = 'رقم الجوال مسجل مسبقاً في المنصة'
      } else if (errors.password) {
        message = 'كلمة المرور يجب أن تتكون من 8 خانات على الأقل، وتحتوي على أحرف كبيرة وصغيرة وأرقام'
      }

      error.value = message
      validationErrors.value = errors

      return {
        success: false,
        error: message,
        errors,
        status: err?.status || err?.statusCode,
      }
    }
  }

  /**
   * Fetch live permissions for a given user from database/API
   */
  async function fetchUserPermissions(userId?: string | number): Promise<string[]> {
    const targetId = userId || user.value?.id
    if (!targetId) return []

    try {
      const res = await $fetch<{ status: string; data?: { all_permissions?: string[] } }>(`/api/admin/permissions/users/${targetId}`)
      if (res?.status === 'success' && res.data?.all_permissions) {
        const perms = res.data.all_permissions
        if (user.value && String(user.value.id) === String(targetId)) {
          user.value.permissions = perms
          authPermissionsCookie.value = perms
        }
        return perms
      }
    } catch {
      // Fallback silently to existing cookie
    }
    return authPermissionsCookie.value || []
  }

  /**
   * Restore authenticated user session from backend
   */
  async function initAuth() {
    if (!token.value) {
      user.value = null
      isInitialized.value = true
      return null
    }

    try {
      const res = await apiRequest<any>('/auth/me')
      if (res.success && res.data) {
        setUser(res.data)
        if (res.data.id) {
          await fetchUserPermissions(res.data.id)
        }
        return user.value
      } else {
        clearAuth()
        return null
      }
    } catch {
      clearAuth()
      return null
    } finally {
      isInitialized.value = true
    }
  }

  /**
   * Login user with unified login field (email or phone) and password
   */
  async function login(payload: LoginPayload) {
    isLoading.value = true
    try {
      const res = await apiRequest<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: {
          login: payload.login.trim(),
          password: payload.password,
        },
      })

      if (res.success && res.data) {
        token.value = res.data.token
        setUser(res.data.user)
        if (res.data.user?.id) {
          await fetchUserPermissions(res.data.user.id)
        }
        return { success: true, user: user.value }
      }

      return {
        success: false,
        error: res.error,
        errors: res.errors,
        status: res.status,
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Register a new user (customer, engineer, or supplier) directly into the database
   */
  async function register(payload: RegisterPayload) {
    isLoading.value = true
    try {
      const role = payload.role

      if (role === 'customer') {
        const body = {
          name: payload.name.trim(),
          email: payload.email.trim(),
          phone: payload.phone.trim(),
          password: payload.password,
          password_confirmation: payload.password_confirmation,
        }

        const res = await apiRequest<any>('/auth/customer/register', {
          method: 'POST',
          body,
        })

        if (res.success && res.data) {
          const newUser: User = {
            id: res.data.id,
            name: res.data.name,
            email: res.data.email,
            phone: res.data.phone,
            role: 'customer',
            isVerified: false,
            createdAt: res.data.created_at,
          }
          return { success: true, user: newUser, message: res.message }
        }

        return { success: false, error: res.error, errors: res.errors }
      }

      if (role === 'engineer') {
        const engPayload = payload as any
        const formData = new FormData()
        formData.append('name', engPayload.name.trim())
        formData.append('email', engPayload.email.trim())
        formData.append('phone', engPayload.phone.trim())
        formData.append('password', engPayload.password)
        formData.append('password_confirmation', engPayload.password_confirmation)
        
        // License number (required by backend)
        const license = engPayload.licenseNumber || engPayload.license_number || `SCE-${Math.floor(100000 + Math.random() * 900000)}`
        formData.append('license_number', license)

        // CV File
        if (engPayload.cvFile) {
          formData.append('cv', engPayload.cvFile)
        }

        const res = await apiRequest<any>('/auth/engineer/register', {
          method: 'POST',
          body: formData,
        })

        if (res.success && res.data) {
          const newUser: User = {
            id: res.data.id,
            name: res.data.name,
            email: res.data.email,
            phone: res.data.phone,
            role: 'engineer',
            isVerified: false,
            has_engineer_profile: true,
            createdAt: res.data.created_at,
          }
          return { success: true, user: newUser, message: res.message }
        }

        return { success: false, error: res.error, errors: res.errors }
      }

      if (role === 'supplier') {
        const supPayload = payload as any
        const formData = new FormData()
        formData.append('name', supPayload.name.trim())
        formData.append('email', supPayload.email.trim())
        formData.append('phone', supPayload.phone.trim())
        formData.append('password', supPayload.password)
        formData.append('password_confirmation', supPayload.password_confirmation)
        formData.append('company_name', supPayload.companyName?.trim() || supPayload.name.trim())

        // Commercial registry (required by backend)
        const reg = supPayload.commercialRegistry || supPayload.commercial_registry || `CR-${Math.floor(1000000000 + Math.random() * 9000000000)}`
        formData.append('commercial_registry', reg)

        // Store type: wholesaler, retailer, authorized_agent
        const storeType = supPayload.storeType || supPayload.store_type || 'retailer'
        formData.append('store_type', storeType)

        // Address details
        const address = supPayload.addressDetails || supPayload.address_details || supPayload.governorate || 'المملكة العربية السعودية'
        formData.append('address_details', address)

        // Commercial register file
        if (supPayload.commercialRegisterFile) {
          formData.append('commercial_file', supPayload.commercialRegisterFile)
        }

        const res = await apiRequest<any>('/auth/supplier/register', {
          method: 'POST',
          body: formData,
        })

        if (res.success && res.data) {
          const newUser: User = {
            id: res.data.id,
            name: res.data.name,
            email: res.data.email,
            phone: res.data.phone,
            role: 'supplier',
            companyName: supPayload.companyName,
            isVerified: false,
            has_store: true,
            createdAt: res.data.created_at,
          }
          return { success: true, user: newUser, message: res.message }
        }

        return { success: false, error: res.error, errors: res.errors }
      }

      return { success: false, error: 'نوع الحساب غير مدعوم' }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Verify email with 6-digit OTP code
   */
  async function verifyOtp(payload: VerifyOtpPayload) {
    isLoading.value = true
    try {
      const res = await apiRequest<any>('/auth/otp/verify', {
        method: 'POST',
        body: {
          email: payload.email.trim(),
          code: payload.code.trim(),
        },
      })

      if (res.success && res.data) {
        if (user.value) {
          user.value.isVerified = true
        }
        return { success: true, user: res.data, message: res.message }
      }

      return { success: false, error: res.error, errors: res.errors }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Resend OTP verification code
   */
  async function resendOtp(emailInput: string) {
    isLoading.value = true
    try {
      const res = await apiRequest<null>('/auth/otp/resend', {
        method: 'POST',
        body: {
          email: emailInput.trim(),
        },
      })

      return { success: res.success, message: res.message, error: res.error }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Forgot password request
   */
  async function forgotPassword(loginInput: string) {
    isLoading.value = true
    try {
      const res = await apiRequest<null>('/auth/forgot-password', {
        method: 'POST',
        body: {
          email: loginInput.trim(),
        },
      })

      return { success: res.success, message: res.message, error: res.error }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout user and revoke Sanctum access token
   */
  async function logout() {
    try {
      if (token.value) {
        await apiRequest('/auth/logout', { method: 'POST' }).catch(() => {})
      }
    } finally {
      clearAuth()
      navigateTo('/auth/login', { replace: true })
    }
  }

  return {
    user,
    token,
    isInitialized,
    isAuthenticated,
    isEmailVerified,
    userRole,
    isLoading,
    error,
    validationErrors,
    clearErrors,
    setAuth,
    setUser,
    setToken,
    clearAuth,
    initAuth,
    fetchCurrentUser: initAuth,
    fetchUserPermissions,
    login,
    register,
    verifyOtp,
    resendOtp,
    forgotPassword,
    logout,
  }
})
