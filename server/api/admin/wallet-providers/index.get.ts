export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiBase = (config.public?.apiBaseUrl as string) || (config.public?.apiBase as string) || 'http://127.0.0.1:8000/api'

  try {
    const res: any = await $fetch(`${apiBase}/admin/wallet-providers`, {
      headers: { 'Accept': 'application/json' },
    })

    return res
  } catch (err: any) {
    return {
      status: 'error',
      message: String(err?.message || err),
      data: [],
    }
  }
})
