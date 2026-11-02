export const useAdminLogoutModal = () => {
  const isOpen = useState<boolean>('admin_logout_modal_open', () => false)
  const isLoggingOut = useState<boolean>('admin_logout_in_progress', () => false)
  const { logout } = useAuth()

  const openLogoutModal = () => {
    isOpen.value = true
  }

  const closeLogoutModal = () => {
    if (isLoggingOut.value) return
    isOpen.value = false
  }

  const confirmLogout = async () => {
    isLoggingOut.value = true
    try {
      if (import.meta.client) {
        sessionStorage.setItem('solar_just_logged_out', '1')
      }
      await logout()
      isOpen.value = false
    } finally {
      isLoggingOut.value = false
    }
  }

  return {
    isOpen,
    isLoggingOut,
    openLogoutModal,
    closeLogoutModal,
    confirmLogout,
  }
}
