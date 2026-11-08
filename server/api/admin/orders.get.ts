// خادم وسيط سريع ومباشر يستعلم من Laravel API دون إطلاق أي عمليات فرعية (No Child Process)
let cachedOrdersData: any = null
let lastFetchTime = 0
const CACHE_TTL_MS = 15000 // 15 ثانية تخزين مؤقت لتسريع التبويبات

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const force = query.force === 'true' || query.force === true

  const now = Date.now()
  if (!force && cachedOrdersData && (now - lastFetchTime < CACHE_TTL_MS)) {
    return cachedOrdersData
  }

  const config = useRuntimeConfig()
  const apiBase = (config.public?.apiBaseUrl as string) || (config.public?.apiBase as string) || 'http://127.0.0.1:8000/api'

  try {
    const res: any = await $fetch(`${apiBase}/admin/orders`, {
      query: { per_page: 50 },
      headers: {
        'Accept': 'application/json',
      },
    })

    const result = {
      status: 'success',
      message: 'Orders retrieved successfully from API',
      data: Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []),
    }

    if (Array.isArray(result.data)) {
      cachedOrdersData = result
      lastFetchTime = now
    }

    return result
  } catch (err: any) {
    // إذا تعذر الوصول، إرجاع الكاش أو مصفوفة فارغة دون تعطيل الخادم
    return {
      status: 'success',
      message: 'Fallback cached orders',
      data: cachedOrdersData?.data || [],
    }
  }
})
