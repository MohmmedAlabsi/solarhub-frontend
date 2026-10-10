export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  // تفعيل Tailwind و Pinia
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  // ربط ملف التنسيقات العام
  css: ['~/assets/main.css'],

  // Laravel API المتغيرات البيئية ورابط
  runtimeConfig: {
    public: {
      // Nuxt سيقوم بتحديث هذه القيمة تلقائياً من ملف .env
      apiBase: 'http://localhost:8000/api',
    }
  },

  // الرندرة الهجينة: SSR للواجهة، و SPA للوحة التحكم
  routeRules: {
    '/': { prerender: true },
    '/products/**': { swr: 3600 },
    '/admin/**': { ssr: false },
    '/profile/**': { ssr: false },
  }
})