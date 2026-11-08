export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const status = body?.status

  if (!id || !status) {
    throw createError({ statusCode: 400, message: 'Missing order id or status' })
  }

  const config = useRuntimeConfig()
  const apiBase = (config.public?.apiBaseUrl as string) || (config.public?.apiBase as string) || 'http://127.0.0.1:8000/api'

  try {
    const res: any = await $fetch(`${apiBase}/admin/orders/${id}/status`, {
      method: 'POST',
      body: { status },
      headers: {
        'Accept': 'application/json',
      },
    })

    return {
      status: 'success',
      data: res?.data || res,
    }
  } catch (err: any) {
    return {
      status: 'error',
      message: String(err?.message || err),
    }
  }
})
