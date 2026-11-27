/**
 * Tiny serverless bridge to the free Google Apps Script web app.
 * Server-side fetch avoids browser CORS and keeps the admin key out of the bundle.
 */
declare const process: { env: Record<string, string | undefined> }

export type QuoteBridgeResult = { status: number; body: unknown }

const SCRIPT_URL =
  process.env.VITE_QUOTES_SCRIPT_URL || process.env.QUOTES_SCRIPT_URL || ''

/** Calls the Apps Script action and normalises its response for the browser. */
export async function callQuotesScript(
  params: Record<string, string> = {},
  payload?: Record<string, unknown>,
  scriptUrl = SCRIPT_URL,
): Promise<QuoteBridgeResult> {
  if (!scriptUrl) {
    return { status: 200, body: { quotes: [], source: 'unconfigured' } }
  }

  try {
    const target = new URL(scriptUrl)
    Object.entries(params).forEach(([key, value]) => {
      if (value) target.searchParams.set(key, value)
    })

    const response = await fetch(target.toString(), {
      method: payload ? 'POST' : 'GET',
      headers: {
        Accept: 'application/json',
        ...(payload ? { 'Content-Type': 'text/plain;charset=utf-8' } : {}),
      },
      ...(payload ? { body: JSON.stringify(payload) } : {}),
    })

    const text = await response.text()
    let parsed: unknown = null
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = null
    }

    if (!response.ok) {
      return {
        status: response.status,
        body:
          parsed && typeof parsed === 'object'
            ? parsed
            : { error: `Google Apps Script returned ${response.status}` },
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      return { status: 502, body: { error: 'Google Apps Script returned an invalid response.' } }
    }

    return { status: 200, body: parsed }
  } catch {
    return { status: 502, body: { error: 'Could not reach the quotes sheet.' } }
  }
}

type RequestLike = {
  method?: string
  url?: string
  body?: unknown
  query?: Record<string, string>
}
type ResponseLike = {
  setHeader: (name: string, value: string) => void
  status: (code: number) => { json: (body: unknown) => void }
}

export default async function handler(request: RequestLike, response: ResponseLike) {
  const method = request.method ?? 'GET'
  if (method !== 'GET' && method !== 'POST') {
    response.setHeader('Allow', 'GET, POST')
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  const query = { ...(request.query ?? {}) }
  if (request.url) {
    new URL(request.url, 'http://localhost').searchParams.forEach((value, key) => {
      query[key] = value
    })
  }

  const payload =
    method === 'POST' && request.body && typeof request.body === 'object'
      ? (request.body as Record<string, unknown>)
      : undefined

  const result = await callQuotesScript(query, payload)
  response.setHeader(
    'Cache-Control',
    method === 'GET' && !query.adminKey
      ? 'public, s-maxage=60, stale-while-revalidate=300'
      : 'no-store',
  )
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.status(result.status).json(result.body)
}
