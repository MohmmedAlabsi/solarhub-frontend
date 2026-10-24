export function useTheme() {
  const themeCookie = useCookie<'dark' | 'light'>('solar_theme', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    default: () => 'light',
  })

  const isDark = useState<boolean>('solar_theme_dark', () => themeCookie.value === 'dark')

  function applyTheme(dark: boolean) {
    isDark.value = dark
    themeCookie.value = dark ? 'dark' : 'light'

    if (import.meta.client) {
      if (dark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }

      try {
        localStorage.setItem('solar_theme', dark ? 'dark' : 'light')
      } catch {}
    }
  }

  function toggleTheme() {
    applyTheme(!isDark.value)
  }

  function setTheme(mode: 'dark' | 'light') {
    applyTheme(mode === 'dark')
  }

  function initTheme() {
    if (!import.meta.client) return

    try {
      const saved = localStorage.getItem('solar_theme')
      if (saved === 'dark' || saved === 'light') {
        applyTheme(saved === 'dark')
      } else if (themeCookie.value) {
        applyTheme(themeCookie.value === 'dark')
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        applyTheme(prefersDark)
      }

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        try {
          if (!localStorage.getItem('solar_theme')) {
            applyTheme(e.matches)
          }
        } catch {}
      })
    } catch {
      applyTheme(false)
    }
  }

  return {
    isDark,
    toggleTheme,
    setTheme,
    initTheme,
  }
}
