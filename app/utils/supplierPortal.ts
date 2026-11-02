
/**
 * SolarHub Supplier Portal
 * أدوات مساعدة خاصة بواجهات المورد فقط
 */

// استخراج القوائم من استجابات Laravel
export function supplierList<T = Record<string, unknown>>(
  response: any
): { items: T[]; total: number } {
  const outer = response?.data ?? response

  const candidate = Array.isArray(outer)
    ? outer
    : (
        outer?.data ??
        outer?.ratings ??
        outer?.notifications ??
        outer?.items ??
        outer?.orders ??
        outer?.results ??
        []
      )

  const items = Array.isArray(candidate)
    ? candidate
    : Array.isArray(candidate?.data)
      ? candidate.data
      : []

  const total = Number(
    response?.meta?.total ??
    outer?.meta?.total ??
    candidate?.meta?.total ??
    response?.total ??
    outer?.total
  )

  return {
    items: items as T[],
    total: Number.isFinite(total) ? total : items.length
  }
}

// استخراج بيانات سجل واحد
export function supplierRecord<T = Record<string, unknown>>(
  response: any
): T {
  return (response?.data ?? response ?? {}) as T
}

// معالجة أخطاء API
export function supplierError(
  error: any,
  fallback = 'تعذر الاتصال بالخادم. يرجى المحاولة مجدداً.'
): string {
  const data = error?.data
  const first = data?.errors && Object.values(data.errors)[0]

  return String(
    data?.userMessage ||
    data?.message ||
    (Array.isArray(first) ? first[0] : '') ||
    fallback
  )
}

// تنسيق التاريخ بالعربية
export function supplierDate(
  value?: string | null
): string {
  if (!value) return '—'

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('ar-YE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
}

// الوقت النسبي للإشعارات
export function supplierRelativeTime(
  value?: string | null
): string {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000)
  )

  if (seconds < 60) return 'الآن'
  if (seconds < 3600)
    return `منذ ${Math.floor(seconds / 60)} دقيقة`
  if (seconds < 86400)
    return `منذ ${Math.floor(seconds / 3600)} ساعة`
  if (seconds < 172800) return 'أمس'
  if (seconds < 604800)
    return `منذ ${Math.floor(seconds / 86400)} أيام`

  return supplierDate(value)
}

// منع التنقل إلى روابط غير معتمدة عبر الإشعارات
export function safeSupplierDestination(
  raw: unknown
): string | null {
  if (
    typeof raw !== 'string' ||
    !raw.startsWith('/supplier/')
  ) return null

  const pathname = raw.split(/[?#]/, 1)[0]

  const allowed =
    /^\/supplier\/(dashboard|orders|quotes|products|finance|reviews|store|settings|notifications)$/

  return allowed.test(pathname) && !/\s/.test(raw)
    ? raw
    : null
}
