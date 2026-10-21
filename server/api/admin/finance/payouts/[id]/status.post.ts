import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const status = body?.status
  const transfer_reference = body?.transfer_reference

  if (!id || !status) {
    throw createError({ statusCode: 400, message: 'Missing payout id or status' })
  }

  try {
    const scriptPath = 'G:\\solarhub-frontend\\server\\utils\\finance-ops.php'
    const payloadStr = JSON.stringify({
      id: Number(id),
      status: String(status),
      transfer_reference: transfer_reference ? String(transfer_reference) : null,
    })
    const { stdout } = await execFileAsync('php', [scriptPath, 'update_payout_status', payloadStr], {
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
