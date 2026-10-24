export function useTheme() {
  const isDark = useState<boolean>('solar_theme_dark', () => false)

  function applyTheme(dark: boolean) {
    isDark.value = dark
    if (import.meta.client) {
      if (dark) {
        document.documentElement.classList.add('dark')
        try {
          localStorage.setItem('solar_theme', 'dark')
        } catch {}
      } else {
        document.documentElement.classList.remove('dark')
        try {
          localStorage.setItem('solar_theme', 'light')
        } catch {}
      }
    }
  }

  function toggleTheme() {
    applyTheme(!isDark.value)
  }

  function setTheme(mode: 'dark' | 'light') {
    applyTheme(mode === 'dark')
  }

  onMounted(() => {
    try {
      const saved = localStorage.getItem('solar_theme')
      if (saved) {
        applyTheme(saved === 'dark')
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        applyTheme(prefersDark)
      }
    } catch {
      applyTheme(false)
    }
  })

  return {
    isDark,
    toggleTheme,
    setTheme,
  }
}
