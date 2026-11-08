export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const status = body?.status

  if (!id || !status) {
    throw createError({ statusCode: 400, message: 'Missing payment id or status' })
  }

  const config = useRuntimeConfig()
  const apiBase = (config.public?.apiBaseUrl as string) || (config.public?.apiBase as string) || 'http://127.0.0.1:8000/api'

  try {
    const res: any = await $fetch(`${apiBase}/admin/finance/payments/${id}/status`, {
      method: 'POST',
      body: { status },
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
