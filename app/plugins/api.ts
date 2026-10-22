export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  // Unified Sanctum Token lookup across SSR and Client
  const tokenCookie = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  const getActiveToken = (): string | null => {
    if (tokenCookie.value) return tokenCookie.value
    if (import.meta.client) {
      try {
        const local = localStorage.getItem('solarhub_token') || localStorage.getItem('auth_token')
        if (local) return local
      } catch {
        /* storage fallback */
      }
    }
    return null
  }

  const baseURL =
    (config.public.apiBaseUrl as string) ||
    (config.public.apiBase as string) ||
    'http://127.0.0.1:8000/api'

  const apiFetcher = $fetch.create({
    baseURL,
    headers: {
      Accept: 'application/json',
    },

    onRequest({ options }) {
      const token = getActiveToken()
      if (token) {
        const headers = new Headers(options.headers)
        if (!headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`)
        }
        options.headers = headers
      }
    },

    onResponseError({ response }) {
      const status = response.status
      const data = response._data

      // 401 Unauthorized: Session expired or invalid token
      if (status === 401) {
        tokenCookie.value = null
        if (import.meta.client) {
          try {
            localStorage.removeItem('solarhub_token')
            localStorage.removeItem('solarhub_user')
            localStorage.removeItem('auth_token')
          } catch {
            /* ignore */
          }

          const route = useRoute()
          // Only redirect if not already on auth pages
          if (!route.path.startsWith('/auth/')) {
            navigateTo('/auth/login')
          }
        }
      }

      // Format helpful error message in Arabic for caller components
      let errorMessage = 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.'
      if (data && typeof data === 'object') {
        if (data.message) {
          errorMessage = data.message
        } else if (data.errors && typeof data.errors === 'object') {
          const firstKey = Object.keys(data.errors)[0]
          if (firstKey && Array.isArray(data.errors[firstKey])) {
            errorMessage = data.errors[firstKey][0]
          }
        }
      }

      // Attach formatted message for callers
      if (response._data && typeof response._data === 'object') {
        response._data.userMessage = errorMessage
      }
    },
  })

  return {
    provide: {
      api: apiFetcher,
    },
  }
})
