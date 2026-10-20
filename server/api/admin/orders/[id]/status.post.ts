import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const status = body?.status

  if (!id || !status) {
    throw createError({ statusCode: 400, message: 'Missing order id or status' })
  }

  try {
    const scriptPath = 'G:\\solarhub-frontend\\server\\utils\\update-order-status.php'
    const { stdout, stderr } = await execFileAsync('php', [scriptPath, String(id), String(status)], {
      cwd: 'G:\\solarhub-api',
      timeout: 10000,
    })

    const res = JSON.parse(stdout.trim())
    return {
      status: 'success',
      data: res,
    }
  } catch (err: any) {
    return {
      status: 'error',
      message: String(err?.message || err),
    }
  }
})
