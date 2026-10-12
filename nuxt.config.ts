export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  // تفعيل Tailwind و Pinia
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  tailwindcss: {
    config: {
      theme: {
        extend: {
          fontFamily: {
            sans: ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
          },
          colors: {
            brand: { 50: '#FEFCE8', 100: '#FEF9C3', 400: '#FACC15', 500: '#EAB308', 600: '#CA8A04' },
            ink: { DEFAULT: '#0F172A', 800: '#1E293B', 700: '#334155', 500: '#64748B', 400: '#94A3B8' },
            surface: { DEFAULT: '#F4F6FB', line: '#E5E9F2' },
          },
          boxShadow: {
            card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.04)',
          },
        },
      },
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ar', dir: 'rtl' },
      title: 'سولار هب | وجهتك الموثوقة لمنظومات الطاقة الشمسية',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'منصة سولار هب تجمع المتاجر والمهندسين المعتمدين ومنتجات الطاقة الشمسية في مكان واحد.' },
        { name: 'theme-color', content: '#FACC15' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap' },
      ],
    },
  },

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
