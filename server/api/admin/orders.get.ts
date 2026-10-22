import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

// ذاكرة تخزين مؤقتة لتسريع التنقل بين التبويبات بنسبة 100% دون تأخير
let cachedOrdersData: any = null
let lastFetchTime = 0
const CACHE_TTL_MS = 15000 // 15 ثانية تخزين مؤقت

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const force = query.force === 'true' || query.force === true

  const now = Date.now()
  if (!force && cachedOrdersData && (now - lastFetchTime < CACHE_TTL_MS)) {
    return cachedOrdersData
  }

  try {
    const scriptPath = 'G:\\solarhub-frontend\\server\\utils\\fetch-orders.php'
    const { stdout, stderr } = await execFileAsync('php', [scriptPath], {
      cwd: 'G:\\solarhub-api',
      timeout: 45000,
      maxBuffer: 10 * 1024 * 1024,
    })

    const trimmed = stdout.trim()
    let parsed: any = null
    try {
      parsed = JSON.parse(trimmed)
    } catch {
      // In case of non-JSON output
      parsed = null
    }

    const result = {
      status: parsed?.status || 'success',
      message: parsed?.message || 'Orders retrieved successfully from database',
      data: parsed?.data ?? (Array.isArray(parsed) ? parsed : []),
    }

    if (result.status === 'success' && Array.isArray(result.data)) {
      cachedOrdersData = result
      lastFetchTime = now
    }

    return result
  } catch (err: any) {
    const fallbackData = cachedOrdersData?.data || []
    return {
      status: 'error',
      message: String(err?.message || err),
      stderr: String(err?.stderr || ''),
      data: fallbackData,
    }
  }
})
