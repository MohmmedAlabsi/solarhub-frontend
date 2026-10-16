import process from 'node:process'

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  // Disabled by default because @nuxt/devtools 3.4.2 currently emits a Vite 8
  // configResolved warning. Opt in locally with NUXT_DEVTOOLS=true.
  devtools: { enabled: process.env.NUXT_DEVTOOLS === 'true' },

  // @nuxtjs/tailwindcss 6.14 injects tailwindcss/nesting, which Tailwind
  // 3.4 no longer exposes to Nuxt 4/Vite 8. Keep nesting support through the
  // compatible PostCSS implementation already installed by the module.
  postcss: {
    plugins: {
      'tailwindcss/nesting': false,
      'postcss-nesting': {},
    },
  },

  // تفعيل Tailwind و Pinia
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'ar', dir: 'rtl' },
      title: 'سولار هب | وجهتك الموثوقة لمنظومات الطاقة الشمسية',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'منصة سولار هب تجمع المتاجر والمهندسين المعتمدين ومنتجات الطاقة الشمسية في مكان واحد.' },
        { name: 'theme-color', content: '#F2B705' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap' },
      ],
    },
  },

  // ربط ملفات التنسيقات العامة ومتغيرات الهوية
  css: [
    '~/assets/design-tokens.css',
    '~/assets/main.css',
  ],

  // Laravel API المتغيرات البيئية ورابط
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8000/api',
    }
  },

  // سياسة الرندرة الهجينة (Hybrid Rendering Policy) حسب معايير سولار هب
  routeRules: {
    '/': { prerender: true },
    '/products/**': { swr: 3600 },
    '/customer/**': { ssr: false },
    '/admin/**': { ssr: false },
    '/profile/**': { ssr: false },
    '/dashboard': { redirect: '/customer/dashboard' },
    '/dashboard/**': { redirect: '/customer/dashboard' },
  }
})
