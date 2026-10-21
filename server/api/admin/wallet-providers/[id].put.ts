import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  try {
    const scriptPath = 'G:\\solarhub-frontend\\server\\utils\\finance-ops.php'
    const payloadStr = JSON.stringify({ ...body, id: Number(id) })
    const { stdout } = await execFileAsync('php', [scriptPath, 'update_wallet_provider', payloadStr], {
      cwd: 'G:\\solarhub-api',
      maxBuffer: 10 * 1024 * 1024,
      timeout: 20000,
    })

    return JSON.parse(stdout.trim())
  } catch (err: any) {
    return {
      status: 'error',
      message: String(err?.message || err),
    }
  }
})
