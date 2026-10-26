import { useAuthStore } from '~/stores/auth'

type ApiRecord = Record<string, unknown>

function asRecord(value: unknown): ApiRecord | undefined {
  if (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    return value as ApiRecord
  }

  return undefined
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const router = useRouter()

  const tokenCookie = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  const baseURL = String(
    config.public.apiBaseUrl ||
      config.public.apiBase ||
      'http://127.0.0.1:8000/api',
  ).replace(/\/+$/, '')

  const assetBaseUrl = String(
    config.public.assetBaseUrl || '',
  ).trim()

  let imageBase: URL | undefined

  try {
    const url = new URL(assetBaseUrl)

    if (
      ['http:', 'https:'].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    ) {
      imageBase = url
    }
  } catch {
    imageBase = undefined
  }

  // قراءة توكن تسجيل الدخول.
  function getActiveToken(): string | null {
    if (tokenCookie.value) {
      return tokenCookie.value
    }

    if (import.meta.client) {
      try {
        return (
          localStorage.getItem('solarhub_token') ||
          localStorage.getItem('auth_token')
        )
      } catch {
        return null
      }
    }

    return null
  }

  // تحويل مسار صورة عامة إلى رابط كامل.
  function resolvePublicImage(
    value: string,
  ): string | null {
    const path = value.trim()

    if (
      !path ||
      path.startsWith('//') ||
      path.includes('\\') ||
      /[\u0000-\u001F\u007F]/.test(path)
    ) {
      return null
    }

    // المحافظة على الرابط الكامل إذا أعاده الخادم.
    try {
      const url = new URL(path)

      return ['http:', 'https:'].includes(url.protocol)
        ? url.href
        : null
    } catch {
      // المسار النسبي يعالج في الأسفل.
    }

    if (!imageBase) {
      return null
    }

    const parts = path
      .replace(/^\/+/, '')
      .split('/')

    if (
      parts.some(
        part => !part || part === '.' || part === '..',
      )
    ) {
      return null
    }

    return (
      imageBase.href.replace(/\/+$/, '') +
      '/' +
      parts.map(part => encodeURIComponent(part)).join('/')
    )
  }

  // دعم القوائم المباشرة والقوائم المغلفة داخل data.
  function normalizeImages(
    value: unknown,
    field: 'profile_photo_path' | 'image_path',
  ): void {
    if (Array.isArray(value)) {
      for (const item of value) {
        normalizeImages(item, field)
      }

      return
    }

    const record = asRecord(value)

    if (!record) {
      return
    }

    if (Array.isArray(record.data)) {
      normalizeImages(record.data, field)
      return
    }

    if (typeof record[field] === 'string') {
      record[field] = resolvePublicImage(record[field])
    }
  }

  function requestPath(request: unknown): string {
    const value =
      typeof request === 'string'
        ? request
        : request instanceof Request
          ? request.url
          : ''

    try {
      return new URL(value, baseURL + '/').pathname
    } catch {
      return ''
    }
  }

  const apiFetcher = $fetch.create({
    baseURL,

    headers: {
      Accept: 'application/json',
    },

    // إرفاق التوكن بالطلبات.
    onRequest({ options }) {
      const token = getActiveToken()

      if (!token) {
        return
      }

      const headers = new Headers(options.headers)

      if (!headers.has('Authorization')) {
        headers.set('Authorization', 'Bearer ' + token)
      }

      options.headers = headers
    },

    // تجهيز صور المهندسين ومشاريعهم بعد استلام الرد.
    onResponse({ request, options, response }) {
      if (
        !response.ok ||
        String(options.method || 'GET').toUpperCase() !== 'GET'
      ) {
        return
      }

      const body = asRecord(response._data)

      if (!body || body.status !== 'success') {
        return
      }

      const path = requestPath(request)

      // صور معرض مشاريع المهندس.
      if (
        /\/engineers\/\d+\/portfolio-items\/?$/.test(path)
      ) {
        normalizeImages(body.data, 'image_path')
        return
      }

      // صور الدليل والملف الشخصي للمهندس.
      if (/\/engineers(?:\/\d+)?\/?$/.test(path)) {
        normalizeImages(body.data, 'profile_photo_path')
      }
    },

    async onResponseError({ response }) {
      const body = asRecord(response._data)

      if (body) {
        let message =
          typeof body.message === 'string'
            ? body.message
            : ''

        const errors = asRecord(body.errors)

        if (!message && errors) {
          const first = Object.values(errors).find(
            value => Array.isArray(value),
          )

          if (
            Array.isArray(first) &&
            typeof first[0] === 'string'
          ) {
            message = first[0]
          }
        }

        body.userMessage =
          message ||
          'حدث خطأ غير متوقع. حاول مجددًا.'
      }

      // تنظيف بيانات الجلسة عند رفض التوكن.
      if (response.status !== 401) {
        return
      }

      tokenCookie.value = null
      authStore.clearAuth()

      if (import.meta.client) {
        try {
          localStorage.removeItem('solarhub_token')
          localStorage.removeItem('solarhub_user')
          localStorage.removeItem('auth_token')
        } catch {
          // بيانات المصادقة في Cookies مُسحت بالفعل.
        }

        if (
          !router.currentRoute.value.path.startsWith('/auth/')
        ) {
          await nuxtApp.runWithContext(() =>
            navigateTo('/auth/login'),
          )
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