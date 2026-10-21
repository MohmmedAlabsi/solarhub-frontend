import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export default defineEventHandler(async () => {
  try {
    const scriptPath = 'G:\\solarhub-frontend\\server\\utils\\permissions-ops.php'
    const { stdout } = await execFileAsync('php', [scriptPath, 'fetch_admins'], {
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
