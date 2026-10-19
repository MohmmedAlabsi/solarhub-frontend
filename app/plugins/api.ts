export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  // Unified Sanctum Token lookup across SSR and Client
  const tokenCookie = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  const getActiveToken = (): string | null => {
    if (tokenCookie.value) return tokenCookie.value;
    if (import.meta.client) {
      try {
        const local = localStorage.getItem('solarhub_token') || localStorage.getItem('auth_token');
        if (local) return local;
      } catch {
        /* storage fallback */
      }
    }
    return null;
  };

  const api = $fetch.create({
    baseURL: config.public.apiBase || 'http://localhost:8000/api',

    onRequest({ options }) {
      options.headers = options.headers || {};
      const headers = options.headers as Record<string, string>;

      // Ensure JSON accept
      headers['Accept'] = 'application/json';

      // Attach Sanctum Bearer token if present
      const token = getActiveToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    },

    onResponse({ response }) {
      // Automatically unwrap standard Laravel ApiResponseTrait { status, message, data, meta }
      if (
        response._data &&
        typeof response._data === 'object' &&
        'status' in response._data &&
        'data' in response._data
      ) {
        const raw = response._data;
        response._data = raw.data;
        // Keep meta/pagination and original message if present
        if (raw.meta) {
          (response._data as any)._meta = raw.meta;
        }
        if (raw.message) {
          (response._data as any)._message = raw.message;
        }
      }
    },

    onResponseError({ response }) {
      const status = response.status;
      const data = response._data;

      // 401 Unauthorized: Session expired or invalid token
      if (status === 401) {
        tokenCookie.value = null;
        if (import.meta.client) {
          try {
            localStorage.removeItem('solarhub_token');
            localStorage.removeItem('solarhub_user');
          } catch {
            /* ignore */
          }
          const router = useRouter();
          router.push('/auth/login');
        }
      }

      // Format helpful error message in Arabic
      let errorMessage = 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.';
      if (data && typeof data === 'object') {
        if (data.message) {
          errorMessage = data.message;
        } else if (data.errors && typeof data.errors === 'object') {
          // Extract first validation error
          const firstKey = Object.keys(data.errors)[0];
          if (firstKey && Array.isArray(data.errors[firstKey])) {
            errorMessage = data.errors[firstKey][0];
          }
        }
      }

      // Attach formatted message for callers
      if (response._data && typeof response._data === 'object') {
        response._data.userMessage = errorMessage;
      }
    }
  });

  return {
    provide: {
      api
    }
  };
});
