/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/composables/**/*.{js,ts}',
    './app/plugins/**/*.{js,ts}',
    './app/app.{js,ts,vue}',
  ],
  theme: {
    extend: {
      colors: {
        solar: {
          yellow: {
            DEFAULT: '#F2B705',
            hover: '#DCA90E',
            active: '#C79607',
            light: '#FCC019',
            tint: '#FEF8E7',
          },
          navy: {
            DEFAULT: '#243B53',
            dark: '#0C253C',
            hover: '#1B2D3C',
            light: '#334E68',
            divider: '#3E556D',
          },
          bg: {
            page: 'var(--solar-bg-page, #F9F9FF)',
            card: 'var(--solar-bg-card, #FFFFFF)',
            subtle: 'var(--solar-bg-subtle, #F1F5F9)',
          },
          border: {
            card: 'var(--solar-border-card, #DBDDE1)',
            input: 'var(--solar-border-input, #CBD5E1)',
          },
          text: {
            heading: 'var(--solar-text-heading, #0C253C)',
            body: 'var(--solar-text-body, #334E68)',
            secondary: 'var(--solar-text-secondary, #5A5E63)',
            muted: 'var(--solar-text-muted, #727579)',
          },
          status: {
            success: '#059669',
            'success-bg': '#ECFDF5',
            'success-text': '#065F46',
            info: '#2563EB',
            'info-bg': '#E8EEFF',
            'info-text': '#1D4ED8',
            warning: '#F59E0B',
            'warning-bg': '#FEF3C7',
            'warning-text': '#B45309',
            danger: '#DC2626',
            'danger-bg': '#FEE2E2',
            'danger-text': '#B91C1C',
          },
        },
        // Backward compatibility for existing home components
        brand: { 50: '#FEFCE8', 100: '#FEF9C3', 400: '#F2B705', 500: '#DCA90E', 600: '#CA8A04' },
        ink: { DEFAULT: '#0C253C', 800: '#243B53', 700: '#334E68', 500: '#5A5E63', 400: '#727579' },
        surface: { DEFAULT: '#F9F9FF', line: '#DBDDE1' },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', 'Cairo', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        hover: '0 10px 25px -5px rgba(12, 37, 60, 0.08), 0 8px 10px -6px rgba(12, 37, 60, 0.04)',
        sidebar: '4px 0 20px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'solar-btn': '8px',
        'solar-card': '12px',
        'solar-modal': '16px',
      },
    },
  },
  plugins: [],
}
