export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  // مصدر واحد للتوكن: كوكي auth_token (نفس المرجع الذي يستخدمه stores/auth.ts).
  // أُزيلت القراءة الاحتياطية من localStorage و document.cookie لأنها كانت قد تعيد
  // إحياء توكن أُلغي للتو عند وصول طلبات متزامنة بعد استجابة 401.
  const tokenCookie = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  const baseURL =
    (config.public.apiBaseUrl as string) ||
    (config.public.apiBase as string) ||
    'http://127.0.0.1:8000/api'

  // كل الطلبات الجارية تتشارك هذا المتحكم حتى نلغيها دفعة واحدة عند انتهاء الجلسة
  let sessionController = import.meta.client ? new AbortController() : null
  let isHandlingUnauthorized = false

  const handleUnauthorized = async () => {
    if (!import.meta.client || isHandlingUnauthorized) return
    isHandlingUnauthorized = true

    // 1. إلغاء بقية طلبات اللوحة بدل انتظار 401 لكل واحد منها
    sessionController?.abort()
    sessionController = new AbortController()

    // 2. مسح الجلسة بالكامل: التوكن والمستخدم والصلاحيات (الكوكيز و localStorage و Pinia)
    try {
      useAuthStore().clearAuth()
    } catch {
      tokenCookie.value = null
    }

    // 3. تحويل واحد إلى صفحة الدخول
    try {
      const route = useRoute()
      if (!route.path.startsWith('/auth')) {
        await navigateTo('/auth/login', { replace: true })
      }
    } finally {
      isHandlingUnauthorized = false
    }
  }

  const apiFetcher = $fetch.create({
    baseURL,
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

      // 401: الجلسة منتهية أو التوكن ملغى. الاستثناء الوحيد: طلبات المصادقة نفسها،
      // فهذه يعالجها stores/auth.ts (initAuth/login/otp).
      if (status === 401) {
        const reqUrl = String(typeof request === 'string' ? request : (request as Request)?.url || response?.url || '')
        const isAuthEndpoint = reqUrl.includes('/auth/')
        if (!isAuthEndpoint) {
          void handleUnauthorized()
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
