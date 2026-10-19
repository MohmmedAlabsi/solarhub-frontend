import { storeToRefs } from 'pinia'
import { useAuthStore, type UserProfile } from '~/stores/auth'

export interface ApiSuccessResponse<T> {
  status: 'success'
  message?: string
  data: T
}

export interface ApiErrorResponse {
  status?: string
  message: string
  errors?: Record<string, string[]>
}

export const useAuth = () => {
  const { $api } = useNuxtApp()
  const authStore = useAuthStore()
  const { user, token, isAuthenticated, isEmailVerified, userRole } = storeToRefs(authStore)

  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const validationErrors = ref<Record<string, string[]>>({})

  const clearErrors = () => {
    error.value = null
    validationErrors.value = {}
  }

  /**
   * Helper to format backend validation error messages
   */
  const handleApiError = (err: any) => {
    clearErrors()
    if (err?.data) {
      const data = err.data
      if (data.errors) {
        validationErrors.value = data.errors
      }
      error.value = data.message || 'حدث خطأ غير متوقع'
    } else if (err?.message) {
      error.value = err.message
    } else {
      error.value = 'تعذر الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت'
    }
    return {
      message: error.value,
      errors: validationErrors.value,
    }
  }

  /**
   * Log in user
   */
  const loginUser = async (credentials: { login: string; password: string }, role?: string) => {
    isLoading.value = true
    clearErrors()

    try {
      const endpoint = role ? `/auth/${role}/login` : '/auth/login'
      const response = await $api<ApiSuccessResponse<{ user: UserProfile; token: string }>>(endpoint, {
        method: 'POST',
        body: credentials,
      })

      if (response?.data?.token && response?.data?.user) {
        authStore.setAuth(response.data.user, response.data.token)
      }

      return {
        success: true,
        data: response.data,
        message: response.message,
      }
    } catch (err: any) {
      const errDetail = handleApiError(err)
      return {
        success: false,
        error: errDetail.message,
        errors: errDetail.errors,
        status: err?.status || err?.statusCode,
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Register a new user based on role
   */
  const registerUser = async (
    role: 'customer' | 'engineer' | 'supplier',
    payload: FormData | Record<string, any>
  ) => {
    isLoading.value = true
    clearErrors()

    try {
      let response: ApiSuccessResponse<UserProfile>

      if (role === 'customer') {
        // Customer registration (JSON or FormData)
        response = await $api<ApiSuccessResponse<UserProfile>>('/auth/customer/register', {
          method: 'POST',
          body: payload,
        })
      } else if (role === 'engineer') {
        // Engineer registration with CV file (multipart/form-data)
        response = await $api<ApiSuccessResponse<UserProfile>>('/auth/engineer/register', {
          method: 'POST',
          body: payload,
        })
      } else if (role === 'supplier') {
        // Supplier registration with commercial register file (multipart/form-data)
        response = await $api<ApiSuccessResponse<UserProfile>>('/auth/supplier/register', {
          method: 'POST',
          body: payload,
        })
      } else {
        throw new Error('نوع الحساب غير صالح')
      }

      return {
        success: true,
        data: response.data,
        message: response.message,
      }
    } catch (err: any) {
      const errDetail = handleApiError(err)
      return {
        success: false,
        error: errDetail.message,
        errors: errDetail.errors,
        status: err?.status || err?.statusCode,
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Verify email OTP code
   */
  const verifyOtp = async (email: string, code: string) => {
    isLoading.value = true
    clearErrors()

    try {
      const response = await $api<ApiSuccessResponse<UserProfile>>('/auth/otp/verify', {
        method: 'POST',
        body: { email, code },
      })

      if (response?.data && authStore.user) {
        authStore.setUser({
          ...authStore.user,
          ...response.data,
          email_verified: true,
          email_verified_at: new Date().toISOString(),
        })
      }

      return {
        success: true,
        data: response.data,
        message: response.message,
      }
    } catch (err: any) {
      const errDetail = handleApiError(err)
      return {
        success: false,
        error: errDetail.message,
        errors: errDetail.errors,
        status: err?.status || err?.statusCode,
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Resend email OTP code
   */
  const resendOtp = async (email: string) => {
    isLoading.value = true
    clearErrors()

    try {
      const response = await $api<ApiSuccessResponse<null>>('/auth/otp/resend', {
        method: 'POST',
        body: { email },
      })

      return {
        success: true,
        message: response.message,
      }
    } catch (err: any) {
      const errDetail = handleApiError(err)
      return {
        success: false,
        error: errDetail.message,
        errors: errDetail.errors,
        status: err?.status || err?.statusCode,
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Request password reset link
   */
  const forgotPassword = async (email: string) => {
    isLoading.value = true
    clearErrors()

    try {
      const response = await $api<ApiSuccessResponse<null>>('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      })

      return {
        success: true,
        message: response.message,
      }
    } catch (err: any) {
      const errDetail = handleApiError(err)
      return {
        success: false,
        error: errDetail.message,
        errors: errDetail.errors,
        status: err?.status || err?.statusCode,
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch current authenticated user profile
   */
  const fetchCurrentUser = async () => {
    if (!token.value) {
      authStore.clearAuth()
      return null
    }

    try {
      const response = await $api<ApiSuccessResponse<UserProfile>>('/auth/me', {
        method: 'GET',
      })

      if (response?.data) {
        authStore.setUser(response.data)
        return response.data
      }
      return null
    } catch (err: any) {
      if (err?.status === 401) {
        authStore.clearAuth()
      }
      return null
    }
  }

  /**
   * Log out user
   */
  const logout = async () => {
    isLoading.value = true
    try {
      if (token.value) {
        await $api('/auth/logout', {
          method: 'POST',
        }).catch(() => {})
      }
    } finally {
      authStore.clearAuth()
      isLoading.value = false
      navigateTo('/auth/login')
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isEmailVerified,
    userRole,
    isLoading,
    error,
    validationErrors,
    clearErrors,
    loginUser,
    registerUser,
    verifyOtp,
    resendOtp,
    forgotPassword,
    fetchCurrentUser,
    logout,
  }
}
