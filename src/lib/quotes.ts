import type { CommunityQuote, QuoteCategory, QuoteStatus } from '../types'

type QuoteResponse = {
  quotes?: CommunityQuote[]
  quote?: CommunityQuote
  error?: string
  source?: string
}

export type QuoteFeed = {
  quotes: CommunityQuote[]
  unconfigured: boolean
}

async function readJson(response: Response): Promise<QuoteResponse> {
  const data = (await response.json().catch(() => ({}))) as QuoteResponse
  if (!response.ok || data.error) throw new Error(data.error ?? 'The quotes service is unavailable.')
  return data
}

export async function fetchQuotes(adminKey?: string): Promise<QuoteFeed> {
  const params = new URLSearchParams({ action: adminKey ? 'list_all' : 'list' })
  if (adminKey) params.set('adminKey', adminKey)
  const data = await readJson(await fetch(`/api/quotes?${params.toString()}`))
  return {
    quotes: Array.isArray(data.quotes) ? data.quotes : [],
    unconfigured: data.source === 'unconfigured',
  }
}

export async function createQuote(input: {
  author_name: string
  category: QuoteCategory
  content: string
}): Promise<CommunityQuote> {
  const data = await readJson(
    await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...input }),
    }),
  )
  if (!data.quote) throw new Error('The reflection was not saved.')
  return data.quote
}

export async function updateQuote(
  input: {
    id: string
    author_name: string
    category: QuoteCategory
    content: string
    status: QuoteStatus
  },
  adminKey: string,
): Promise<void> {
  await readJson(
    await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', adminKey, ...input }),
    }),
  )
}

export async function deleteQuote(id: string, adminKey: string): Promise<void> {
  await readJson(
    await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', adminKey, id }),
    }),
  )
}
