export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const permission = body?.permission
  const enable = body?.enable ?? true

  if (!id || !permission) {
    throw createError({ statusCode: 400, message: 'Missing user id or permission' })
  }

  const config = useRuntimeConfig()
  const apiBase = (config.public?.apiBaseUrl as string) || (config.public?.apiBase as string) || 'http://127.0.0.1:8000/api'

  try {
    const res: any = await $fetch(`${apiBase}/admin/users/${id}/permissions`, {
      method: enable ? 'POST' : 'DELETE',
      body: { permission },
      headers: { 'Accept': 'application/json' },
    })

    return res
  } catch (err: any) {
    return {
      status: 'error',
      message: String(err?.message || err),
    }
  }
})
