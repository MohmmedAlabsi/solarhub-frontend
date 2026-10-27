export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie<string | null>('auth_token')
  if (!token.value) {
    return navigateTo('/auth/login', { replace: true })
  }
})
