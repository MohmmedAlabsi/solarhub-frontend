import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = String(query.q || '')

  try {
    const scriptPath = 'G:\\solarhub-frontend\\server\\utils\\permissions-ops.php'
    const payloadStr = JSON.stringify({ query: q })
    const { stdout } = await execFileAsync('php', [scriptPath, 'search_users', payloadStr], {
      cwd: 'G:\\solarhub-api',
      timeout: 10000,
    })

    return JSON.parse(stdout.trim())
  } catch (err: any) {
    return {
      status: 'error',
      message: String(err?.message || err),
    }
  }
})
