import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export default defineEventHandler(async () => {
  try {
    const scriptPath = 'G:\\solarhub-frontend\\server\\utils\\fetch-orders.php'
    const { stdout, stderr } = await execFileAsync('php', [scriptPath], {
      cwd: 'G:\\solarhub-api',
      timeout: 15000,
      maxBuffer: 10 * 1024 * 1024,
    })

    const trimmed = stdout.trim()
    const data = JSON.parse(trimmed)
    return {
      status: 'success',
      message: 'Orders retrieved successfully from database',
      data,
    }
  } catch (err: any) {
    return {
      status: 'error',
      message: String(err?.message || err),
      stderr: String(err?.stderr || ''),
      data: [],
    }
  }
})
