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

  let activeFetchCurrentUserPromise: Promise<any> | null = null

  /**
   * Fetch current authenticated user profile (deduplicated in-flight singleton)
   */
  const fetchCurrentUser = async () => {
    if (activeFetchCurrentUserPromise) {
      return activeFetchCurrentUserPromise
    }

    if (!token.value) {
      authStore.clearAuth()
      return null
    }

    activeFetchCurrentUserPromise = (async () => {
      try {
        const response = await $api<ApiSuccessResponse<UserProfile>>('/auth/me', {
          method: 'GET',
        })

        if (response?.data) {
          authStore.setUser(response.data)
          if (response.data.id && (!response.data.permissions || response.data.permissions.length === 0)) {
            await authStore.fetchUserPermissions(response.data.id).catch(() => {})
          }
          return response.data
        }
        return null
      } catch (err: any) {
        if (err?.status === 401) {
          authStore.clearAuth()
        }
        return null
      }
    })().finally(() => {
      activeFetchCurrentUserPromise = null
    })

    return activeFetchCurrentUserPromise
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
      navigateTo('/auth/login', { replace: true })
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
