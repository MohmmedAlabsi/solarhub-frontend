export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',

  devtools: {
    enabled: false,
  },

  devServer: {
    loadingTemplate: () => '',
  },

  spaLoadingTemplate: false,

  // Keep the Nuxt plugin and application stores on one Pinia module in SSR.
  nitro: {
    externals: {
      inline: ['pinia'],
    },
  },

  typescript: {
    typeCheck: false,
    strict: false,
    shim: false,
  },

  postcss: {
    plugins: {
      'tailwindcss/nesting': false,
      'postcss-nesting': {},
    },
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  app: {
    head: {
      htmlAttrs: {
        lang: 'ar',
        dir: 'rtl',
      },

      title:
        'سولار هب | وجهتك الموثوقة لمنظومات الطاقة الشمسية',

      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          name: 'description',
          content:
            'منصة سولار هب تجمع المتاجر والمهندسين المعتمدين ومنتجات الطاقة الشمسية في مكان واحد.',
        },
        {
          name: 'theme-color',
          content: '#F2B705',
        },
      ],

      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href:
            'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap',
        },
      ],

      script: [
        {
          innerHTML:
            `(function(){try{var t=localStorage.getItem('solar_theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&d)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})()`,

          type: 'text/javascript',
        },
      ],
    },
  },

  css: [
    'leaflet/dist/leaflet.css',
    '~/assets/design-tokens.css',
    '~/assets/main.css',
  ],

  runtimeConfig: {
    public: {
      // عنوان Laravel API.
      apiBase: 'http://127.0.0.1:8000/api',
      apiBaseUrl: 'http://127.0.0.1:8000/api',

      // عنوان الحاوية العامة للصور.
      // تُحدد قيمته عبر NUXT_PUBLIC_ASSET_BASE_URL.
      assetBaseUrl: '',

      appName: 'SolarHub',
    },
  },

  routeRules: {
    '/products/**': {
      swr: 3600,
    },

    '/admin/products': {
      ssr: true,
    },

    '/admin/products/**': {
      ssr: true,
    },

    '/admin/master-data': {
      ssr: true,
    },

    '/admin/master-data/**': {
      ssr: true,
    },

    '/admin/orders': {
      ssr: true,
    },

    '/admin/orders/**': {
      ssr: true,
    },

    '/customer/**': {
      ssr: false,
    },

    '/engineer/**': {
      ssr: false,
    },

    '/auth/**': {
      ssr: false,
    },

    '/admin/**': {
      ssr: false,
    },

    '/profile/**': {
      ssr: false,
    },

    '/dashboard': {
      redirect: '/customer/dashboard',
    },

    '/dashboard/**': {
      redirect: '/customer/dashboard',
    },
  },
})
