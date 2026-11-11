import { useAuthStore } from '~/stores/auth'

/**
 * عميل الـ API الموحّد.
 *
 * - مصدر واحد للتوكن: كوكي auth_token فقط (أُزيلت نسخ localStorage وقراءة document.cookie
 *   التي كانت تُعيد التوكن القديم بعد مسحه وتسبب حلقة 401 ← دخول ← لوحة ← 401).
 * - عند 401: إلغاء كل الطلبات الجارية، ثم مسح كامل حالة الدخول (التوكن + المستخدم + الصلاحيات)،
 *   ثم التوجيه للدخول مرة واحدة إذا كانت الصفحة محمية.
 * - مهلة لكل طلب حتى لا تبقى الطلبات معلّقة وتتراكم.
 */
const REQUEST_TIMEOUT_MS = 20000

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const tokenCookie = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 days (نفس SANCTUM_TOKEN_EXPIRATION في الخادم)
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  // تنظيف نسخ التوكن القديمة من localStorage (كانت تُحفظ في إصدارات سابقة)
  if (import.meta.client) {
    try {
      localStorage.removeItem('solarhub_token')
      localStorage.removeItem('auth_token')
    } catch {
      /* ignore */
    }
  }

  const baseURL =
    (config.public.apiBaseUrl as string) ||
    (config.public.apiBase as string) ||
    'http://127.0.0.1:8000/api'

  // كل الطلبات الجارية تتشارك هذا المتحكم حتى نلغيها دفعة واحدة عند انتهاء الجلسة
  let sessionController = import.meta.client ? new AbortController() : null
  let isHandlingUnauthorized = false

  const handleUnauthorized = async () => {
    // مسح الحالة يحدث في الخادم والعميل؛ الإلغاء والتوجيه في العميل فقط
    const authStore = useAuthStore(nuxtApp.$pinia as any)
    authStore.clearAuth()
    tokenCookie.value = null

    if (!import.meta.client || isHandlingUnauthorized) return
    isHandlingUnauthorized = true

    // إلغاء بقية طلبات الصفحة بدل انتظار 401 لكل واحد منها
    sessionController?.abort()
    sessionController = new AbortController()

    try {
      const route = useRoute()
      // التوجيه فقط من الصفحات المحمية؛ الصفحات العامة تبقى كما هي كزائر.
      const isProtected = /^\/(admin|customer|supplier|engineer)(\/|$)/.test(route.path)
      if (isProtected) {
        await navigateTo('/auth/login', { replace: true })
      }
    } finally {
      isHandlingUnauthorized = false
    }
  }

  const apiFetcher = $fetch.create({
    baseURL,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      Accept: 'application/json',
    },

    onRequest({ options }) {
      const token = tokenCookie.value
      const headers = new Headers(options.headers)
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      options.headers = headers

      if (sessionController && !options.signal) {
        options.signal = sessionController.signal
      }
    },

    onResponseError({ request, response }) {
      const status = response.status
      const data = response._data

      // 401: الجلسة منتهية أو التوكن غير صالح. طلبات الدخول والتحقق نفسها يعالجها stores/auth.ts.
      if (status === 401) {
        const reqUrl = String(typeof request === 'string' ? request : (request as Request)?.url || response?.url || '')
        const isAuthEndpoint = reqUrl.includes('/auth/login') || reqUrl.includes('/auth/otp')
        if (!isAuthEndpoint) {
          void handleUnauthorized()
        }
      }

      // رسالة خطأ عربية مفهومة لمن يستدعي الطلب
      let errorMessage = 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.'
      if (status === 429) {
        errorMessage = 'طلبات كثيرة خلال وقت قصير، يرجى الانتظار قليلاً ثم المحاولة.'
      } else if (data && typeof data === 'object') {
        if (data.message) {
          errorMessage = data.message
        } else if (data.errors && typeof data.errors === 'object') {
          const firstKey = Object.keys(data.errors)[0]
          if (firstKey && Array.isArray(data.errors[firstKey])) {
            errorMessage = data.errors[firstKey][0]
          }
        }
      }

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
