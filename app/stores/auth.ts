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
  default_coordinates?: string | null
  store?: any
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

  const authUserCookie = useCookie<any | null>('auth_user', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    default: () => null,
  })

  const user = ref<User | null>(authUserCookie.value || null)
  const isInitialized = ref(!!authUserCookie.value)
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
    authUserCookie.value = null
    authPermissionsCookie.value = []
    isInitialized.value = true
    return
  }

  type StoredUser = User & {
    onboarding_status?: string
  }

  // نحافظ على البيانات السابقة للحساب نفسه فقط.
  const previous: StoredUser | null =
    user.value
    && String(user.value.id) === String(newUser.id)
      ? user.value
      : null

  const hasField = (field: string): boolean =>
    Object.prototype.hasOwnProperty.call(newUser, field)

  const governorate = hasField('governorate')
    ? newUser.governorate
    : previous?.governorate

  let verified = previous?.isVerified ?? false

  if (typeof newUser.email_verified === 'boolean') {
    verified = newUser.email_verified
  } else if (hasField('email_verified_at')) {
    verified = Boolean(newUser.email_verified_at)
  } else if (typeof newUser.isVerified === 'boolean') {
    verified = newUser.isVerified
  }

  const permissions = Array.isArray(newUser.permissions)
    ? newUser.permissions
    : previous?.permissions ?? []

  const normalizedUser: StoredUser = {
    id: newUser.id,

    name: newUser.name ?? previous?.name ?? '',
    email: newUser.email ?? previous?.email ?? '',
    phone: newUser.phone ?? previous?.phone ?? '',

    // مسار تحديث الملف الشخصي لا يعيد role.
    role: hasField('role')
      ? newUser.role
      : previous?.role,

    status: hasField('status')
      ? newUser.status
      : previous?.status,

    governorate:
      governorate && typeof governorate === 'object'
        ? governorate.name_ar
          ?? governorate.name
          ?? governorate.name_en
          ?? null
        : governorate ?? null,

    isVerified: verified,

    // غياب الحقل يختلف عن إعادته بقيمة null.
    default_coordinates: hasField('default_coordinates')
      ? newUser.default_coordinates ?? null
      : previous?.default_coordinates ?? null,

    store: hasField('store')
      ? newUser.store
      : newUser.has_store === false
        ? null
        : previous?.store ?? null,

    has_store: typeof newUser.has_store === 'boolean'
      ? newUser.has_store
      : previous?.has_store,

    has_engineer_profile:
      typeof newUser.has_engineer_profile === 'boolean'
        ? newUser.has_engineer_profile
        : previous?.has_engineer_profile,

    onboarding_status: hasField('onboarding_status')
      ? newUser.onboarding_status
      : previous?.onboarding_status,

    createdAt:
      newUser.created_at
      || newUser.createdAt
      || previous?.createdAt
      || '',

    permissions,
  }

  user.value = normalizedUser
  authUserCookie.value = normalizedUser
  authPermissionsCookie.value = permissions

  isInitialized.value = true
}

  function setToken(newToken: string | null) {
    token.value = newToken
  }

  function clearAuth() {
    user.value = null
    token.value = null
    authUserCookie.value = null
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
        const body: Record<string, any> = {
          name: payload.name.trim(),
          email: payload.email.trim(),
          phone: payload.phone.trim(),
          password: payload.password,
          password_confirmation: payload.password_confirmation,
        }

        if (payload.governorate) body.governorate = payload.governorate
        if (payload.governorate_id) body.governorate_id = payload.governorate_id

        const custCoords = (payload as any).default_coordinates || (payload as any).location_coordinates || (payload.location?.lat && payload.location?.lng ? `POINT(${payload.location.lng} ${payload.location.lat})` : null)
        if (custCoords) {
          body.default_coordinates = custCoords
          body.location_coordinates = custCoords
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

        // Governorate & Coordinates
        if (engPayload.governorate) formData.append('governorate', engPayload.governorate)
        if (engPayload.governorate_id) formData.append('governorate_id', String(engPayload.governorate_id))
        if (engPayload.location?.address) formData.append('address_details', engPayload.location.address)
        if (engPayload.address_details || engPayload.addressDetails) formData.append('address_details', engPayload.address_details || engPayload.addressDetails)

        const engCoords = engPayload.default_coordinates || engPayload.location_coordinates || (engPayload.location?.lat && engPayload.location?.lng ? `POINT(${engPayload.location.lng} ${engPayload.location.lat})` : null)
        if (engCoords) {
          formData.append('location_coordinates', engCoords)
          formData.append('default_coordinates', engCoords)
        }

        // CV File (strictly PDF)
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

        // Address details & Governorate
        const address = supPayload.addressDetails || supPayload.address_details || supPayload.location?.address || supPayload.governorate || 'صنعاء'
        formData.append('address_details', address)
        if (supPayload.governorate) formData.append('governorate', supPayload.governorate)
        if (supPayload.governorate_id) formData.append('governorate_id', String(supPayload.governorate_id))

        const supCoords = supPayload.default_coordinates || supPayload.location_coordinates || (supPayload.location?.lat && supPayload.location?.lng ? `POINT(${supPayload.location.lng} ${supPayload.location.lat})` : null)
        if (supCoords) {
          formData.append('location_coordinates', supCoords)
          formData.append('default_coordinates', supCoords)
        }

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
   * Reset password with token from email link
   */
  async function resetPassword(payload: {
    email: string
    token: string
    password: string
    password_confirmation: string
  }) {
    isLoading.value = true
    try {
      const res = await apiRequest<null>('/auth/reset-password', {
        method: 'POST',
        body: {
          email: payload.email.trim(),
          token: payload.token.trim(),
          password: payload.password,
          password_confirmation: payload.password_confirmation,
        },
      })

      return { success: res.success, message: res.message, error: res.error, errors: res.errors }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update authenticated user's own profile (PUT /my/profile)
   */
  async function updateProfile(data: {
    name?: string
    phone?: string
    governorate_id?: number
    default_coordinates?: string
    current_password?: string
    password?: string
    password_confirmation?: string
  }) {
    isLoading.value = true
    try {
      const res = await apiRequest<any>('/my/profile', {
        method: 'PUT',
        body: data,
      })

      if (res.success && res.data) {
        setUser(res.data)
        return { success: true, user: user.value, message: res.message || 'تم تحديث الملف الشخصي بنجاح' }
      }

      return { success: false, error: res.error, errors: res.errors }
    } finally {
      isLoading.value = false
    }
  }
  /**
   * Update store details (location, address, whatsapp, bio, etc.)
   */
  async function updateStore(storeId: number | string, data: {
    company_name?: string
    address_details?: string
    location_coordinates?: string
    whatsapp_number?: string
    store_type?: string
    bio?: string
  }) {
    isLoading.value = true
    try {
      const res = await apiRequest<any>(`/stores/${storeId}`, {
        method: 'PUT',
        body: data,
      })
      if (res.success && res.data) {
        if (user.value && (user.value as any).store) {
          (user.value as any).store = { ...(user.value as any).store, ...res.data }
        }
        return { success: true, store: res.data, message: res.message || 'تم تحديث بيانات المتجر والمستودع بنجاح' }
      }
      return { success: false, error: res.error, errors: res.errors }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get appropriate dashboard path based on role
   */
  function getDashboardPath(role?: string | null): string {
    const targetRole = (role || user.value?.role || '').trim().toLowerCase()
    if (targetRole === 'admin') return '/admin'
    if (targetRole === 'supplier') return '/supplier/dashboard'
    if (targetRole === 'engineer') return '/engineer/dashboard'
    return '/customer/dashboard'
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
    resetPassword,
    updateProfile,
    updateStore,
    getDashboardPath,
    logout,
  }
})
