import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  try {
    const scriptPath = 'G:\\solarhub-frontend\\server\\utils\\permissions-ops.php'
    const payloadStr = JSON.stringify({
      user_id: Number(id),
      permissions: body?.permissions || [],
    })
    const { stdout } = await execFileAsync('php', [scriptPath, 'sync_user_permissions', payloadStr], {
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
