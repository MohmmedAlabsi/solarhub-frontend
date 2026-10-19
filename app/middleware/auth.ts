export default defineNuxtRouteMiddleware(async () => {
  const token = useCookie<string | null>('auth_token')
  const { fetchCurrentUser, user } = useAuth()

  if (!token.value) {
    return navigateTo('/auth/login')
  }

  // If token exists but user profile not loaded yet, fetch it
  if (!user.value) {
    const fetched = await fetchCurrentUser()
    if (!fetched) {
      return navigateTo('/auth/login')
    }
  }
})
