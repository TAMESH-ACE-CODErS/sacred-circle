import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { RefreshCw, Send } from 'lucide-react'
import { SectionHeading } from './SectionHeading'
import { useLanguage } from '../context/LanguageContext'
import { createQuote, fetchQuotes } from '../lib/quotes'
import type { QuoteCategory } from '../types'

const categories: QuoteCategory[] = ['quote', 'opinion', 'reflection']

function formatDate(timestamp: string, language: string): string {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function QuotesSection() {
  const { t, language } = useLanguage()
  const [quotes, setQuotes] = useState<Awaited<ReturnType<typeof fetchQuotes>>['quotes']>([])
  const [loading, setLoading] = useState(true)
  const [unconfigured, setUnconfigured] = useState(false)
  const [failed, setFailed] = useState(false)
  const [authorName, setAuthorName] = useState('')
  const [category, setCategory] = useState<QuoteCategory>('reflection')
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setFailed(false)
    try {
      const feed = await fetchQuotes()
      setQuotes(feed.quotes)
      setUnconfigured(feed.unconfigured)
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function post(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = content.trim()
    if (!text) {
      setError(t('quotes.required'))
      setNotice('')
      return
    }

    setPosting(true)
    setError('')
    setNotice('')
    try {
      const created = await createQuote({
        author_name: authorName.trim(),
        category,
        content: text,
      })
      setQuotes((current) => [created, ...current.filter((quote) => quote.id !== created.id)])
      setUnconfigured(false)
      setContent('')
      setNotice(t('quotes.posted'))
    } catch {
      setError(t('quotes.error'))
    } finally {
      setPosting(false)
    }
  }

  return (
    <section id="quotes" className="section-shell !pt-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow={t('quotes.eyebrow')}
          title={t('quotes.title')}
          description={t('quotes.description')}
        />
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="btn-secondary shrink-0 disabled:opacity-60"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
          {loading ? t('common.loading') : t('common.refresh')}
        </button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card">
          <h3 className="font-display text-2xl">{t('quotes.post')}</h3>
          <form onSubmit={post} className="mt-6 space-y-5">
            <div>
              <label htmlFor="quote-author" className="mb-2 block text-base font-semibold">
                {t('quotes.nameLabel')}
              </label>
              <input
                id="quote-author"
                type="text"
                className="field"
                value={authorName}
                maxLength={80}
                onChange={(event) => setAuthorName(event.target.value)}
                placeholder={t('quotes.namePlaceholder')}
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="quote-category" className="mb-2 block text-base font-semibold">
                {t('quotes.categoryLabel')}
              </label>
              <select
                id="quote-category"
                className="field min-h-[52px]"
                value={category}
                onChange={(event) => setCategory(event.target.value as QuoteCategory)}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {t(`quotes.category${item.charAt(0).toUpperCase()}${item.slice(1)}` as 'quotes.categoryQuote')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="quote-content" className="mb-2 block text-base font-semibold">
                {t('quotes.contentLabel')}
              </label>
              <textarea
                id="quote-content"
                className="field min-h-[150px]"
                value={content}
                maxLength={4000}
                onChange={(event) => setContent(event.target.value)}
                placeholder={t('quotes.contentPlaceholder')}
                rows={5}
              />
            </div>

            {notice && <p className="text-base font-semibold text-green-800 dark:text-green-300" role="status">{notice}</p>}
            {error && <p className="text-base font-semibold text-red-800 dark:text-red-300" role="alert">{error}</p>}

            <button type="submit" className="btn-primary w-full !min-h-[56px]" disabled={posting}>
              <Send size={19} aria-hidden="true" />
              {posting ? t('quotes.posting') : t('quotes.post')}
            </button>
            <p className="text-base" style={{ color: 'var(--muted)' }}>
              {t('quotes.noLogin')}
            </p>
          </form>
        </div>

        <div aria-live="polite">
          <h3 className="font-display text-2xl">{t('quotes.title')}</h3>
          <div className="mt-6 space-y-5">
            {loading && <p className="text-lg" style={{ color: 'var(--muted)' }}>{t('quotes.loading')}</p>}

            {!loading && failed && (
              <p className="text-lg" style={{ color: 'var(--muted)' }}>{t('quotes.error')}</p>
            )}

            {!loading && !failed && unconfigured && (
              <p className="text-lg" style={{ color: 'var(--muted)' }}>{t('quotes.unconfigured')}</p>
            )}

            {!loading && !failed && !unconfigured && quotes.length === 0 && (
              <p className="text-lg" style={{ color: 'var(--muted)' }}>{t('quotes.empty')}</p>
            )}

            {!failed && !unconfigured && quotes.map((quote) => (
              <article key={quote.id} className="card !p-6 sm:!p-8">
                <p className="whitespace-pre-wrap text-lg leading-relaxed sm:text-xl">{quote.content}</p>
                <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-base" style={{ color: 'var(--muted)' }}>
                  <strong style={{ color: 'var(--text)' }}>{quote.author_name || t('quotes.anonymous')}</strong>
                  <span aria-hidden="true">·</span>
                  <span>{t(`quotes.category${quote.category.charAt(0).toUpperCase()}${quote.category.slice(1)}` as 'quotes.categoryQuote')}</span>
                  <span aria-hidden="true">·</span>
                  <span>{t('quotes.postedOn')} {formatDate(quote.timestamp, language)}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
