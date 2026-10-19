export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  const baseURL = (config.public.apiBaseUrl as string) || (config.public.apiBase as string) || 'http://127.0.0.1:8000/api'

  const apiFetcher = $fetch.create({
    baseURL,
    headers: {
      Accept: 'application/json',
    },
    onRequest({ options }) {
      if (token.value) {
        const headers = new Headers(options.headers)
        if (!headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token.value}`)
        }
        options.headers = headers
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        // Clear token on Unauthorized
        token.value = null
        if (import.meta.client) {
          const route = useRoute()
          // Only redirect if not already on auth pages
          if (!route.path.startsWith('/auth/')) {
            navigateTo('/auth/login')
          }
        }
      }
    },
  })

  return {
    provide: {
      api: apiFetcher,
    },
  }
})
