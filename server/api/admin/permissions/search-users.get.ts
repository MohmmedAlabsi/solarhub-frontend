export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = String(query.q || '')

  const config = useRuntimeConfig()
  const apiBase = (config.public?.apiBaseUrl as string) || (config.public?.apiBase as string) || 'http://127.0.0.1:8000/api'

  try {
    const res: any = await $fetch(`${apiBase}/users`, {
      query: {
        search: q,
        per_page: 15,
      },
      headers: { 'Accept': 'application/json' },
    })

    const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
    const mapped = raw.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.roles?.[0]?.name || u.role || 'user',
    }))

    return {
      status: 'success',
      data: mapped,
    }
  } catch (err: any) {
    return {
      status: 'error',
      message: String(err?.message || err),
      data: [],
    }
  }
})
