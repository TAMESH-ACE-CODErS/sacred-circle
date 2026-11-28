import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { getLatestVideos } from './api/youtube'
import { callQuotesScript } from './api/quotes'
import { callSiteScript } from './api/site'

// Mirrors the Vercel /api/youtube function during `npm run dev`.
const youtubeDevApi: Plugin = {
  name: 'youtube-api-dev',
  configureServer(server) {
    server.middlewares.use('/api/youtube', async (_request, response) => {
      try {
        const data = await getLatestVideos()
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.setHeader('Cache-Control', 'public, s-maxage=1800')
        response.end(JSON.stringify(data))
      } catch {
        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.end(JSON.stringify({ videos: [], source: 'fallback' }))
      }
    })
  },
}

type DevRequest = {
  method?: string
  url?: string
  on: (event: string, listener: (chunk?: unknown) => void) => void
}

function readJsonBody(request: DevRequest): Promise<Record<string, unknown> | undefined> {
  return new Promise((resolve) => {
    let raw = ''
    request.on('data', (chunk) => {
      raw += String(chunk ?? '')
    })
    request.on('end', () => {
      try {
        resolve(raw ? (JSON.parse(raw) as Record<string, unknown>) : undefined)
      } catch {
        resolve(undefined)
      }
    })
    request.on('error', () => resolve(undefined))
  })
}

// Mirrors the Vercel /api/quotes function during `npm run dev`.
function quotesDevApi(scriptUrl: string): Plugin {
  return {
    name: 'quotes-api-dev',
    configureServer(server) {
      server.middlewares.use('/api/quotes', async (request, response) => {
        const devRequest = request as unknown as DevRequest
        const method = devRequest.method ?? 'GET'
        const query: Record<string, string> = {}
        new URL(devRequest.url ?? '/', 'http://localhost').searchParams.forEach((value, key) => {
          query[key] = value
        })
        const payload = method === 'POST' ? await readJsonBody(devRequest) : undefined
        const result = await callQuotesScript(query, payload, scriptUrl)

        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.setHeader(
          'Cache-Control',
          method === 'GET' && !query.adminKey
            ? 'public, s-maxage=60, stale-while-revalidate=300'
            : 'no-store',
        )
        response.statusCode = result.status
        response.end(JSON.stringify(result.body))
      })
    },
  }
}

// Mirrors the Vercel /api/site function during `npm run dev`.
function siteDevApi(scriptUrl: string, adminPin: string): Plugin {
  return {
    name: 'site-api-dev',
    configureServer(server) {
      server.middlewares.use('/api/site', async (request, response) => {
        const devRequest = request as unknown as DevRequest
        const method = devRequest.method ?? 'GET'
        const query: Record<string, string> = {}
        new URL(devRequest.url ?? '/', 'http://localhost').searchParams.forEach((value, key) => {
          query[key] = value
        })
        const payload = method === 'POST' ? await readJsonBody(devRequest) : undefined
        const result = await callSiteScript(query, payload, scriptUrl, adminPin)

        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.setHeader('Cache-Control', method === 'GET' ? 'public, s-maxage=60' : 'no-store')
        response.statusCode = result.status
        response.end(JSON.stringify(result.body))
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const quotesScriptUrl = env.VITE_QUOTES_SCRIPT_URL || env.QUOTES_SCRIPT_URL || ''
  const siteScriptUrl =
    env.VITE_SHEET_API_URL ||
    env.VITE_SACRED_SHEET_URL ||
    env.SHEET_API_URL ||
    env.SACRED_SHEET_URL ||
    'https://script.google.com/macros/s/AKfycbz-JRfwXkgh-RJwCirMU86PurG26AXnF0zbulnQkA45WVEbBlLhfMkaBfnRD_qS5kfi/exec'
  const siteAdminPin =
    env.VITE_ADMIN_PIN ||
    env.ADMIN_PIN ||
    env.VITE_ADMIN_KEY ||
    env.ADMIN_KEY ||
    ''

  return {
    plugins: [react(), youtubeDevApi, quotesDevApi(quotesScriptUrl), siteDevApi(siteScriptUrl, siteAdminPin)],
    server: { port: 5173 },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            motion: ['framer-motion'],
            supabase: ['@supabase/supabase-js'],
          },
        },
      },
    },
  }
})
