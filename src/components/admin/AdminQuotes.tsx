import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Check, Eye, EyeOff, KeyRound, Pencil, RefreshCw, Trash2, X } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { deleteQuote, fetchQuotes, updateQuote } from '../../lib/quotes'
import type { CommunityQuote, QuoteCategory, QuoteStatus } from '../../types'

const SESSION_KEY = 'sc-quotes-admin-key'
const categories: QuoteCategory[] = ['quote', 'opinion', 'reflection']
const statuses: QuoteStatus[] = ['published', 'hidden']

function storedKey(): string {
  try {
    return sessionStorage.getItem(SESSION_KEY) ?? ''
  } catch {
    return ''
  }
}

function categoryLabelKey(category: QuoteCategory) {
  return `quotes.category${category.charAt(0).toUpperCase()}${category.slice(1)}` as
    | 'quotes.categoryQuote'
    | 'quotes.categoryOpinion'
    | 'quotes.categoryReflection'
}

export function AdminQuotes() {
  const { t } = useLanguage()
  const [keyInput, setKeyInput] = useState(storedKey)
  const [adminKey, setAdminKey] = useState(storedKey)
  const [quotes, setQuotes] = useState<CommunityQuote[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState({ author_name: '', category: 'reflection' as QuoteCategory, content: '', status: 'published' as QuoteStatus })
  const [busyId, setBusyId] = useState('')

  const load = useCallback(async (key: string) => {
    if (!key) return
    setLoading(true)
    setError('')
    try {
      const feed = await fetchQuotes(key)
      setQuotes(feed.quotes)
    } catch {
      setError(t('admin.listError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (adminKey) void load(adminKey)
  }, [adminKey, load])

  function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const key = keyInput.trim()
    if (!key) {
      setError(t('admin.keyRequired'))
      return
    }
    try {
      sessionStorage.setItem(SESSION_KEY, key)
    } catch {
      // The key still works for this tab even if storage is unavailable.
    }
    setAdminKey(key)
    setNotice(t('admin.unlocked'))
  }

  function startEdit(quote: CommunityQuote) {
    setEditingId(quote.id)
    setDraft({
      author_name: quote.author_name,
      category: quote.category,
      content: quote.content,
      status: quote.status,
    })
    setError('')
  }

  async function save(id: string) {
    setBusyId(id)
    setError('')
    try {
      await updateQuote({ id, ...draft }, adminKey)
      setEditingId(null)
      setNotice(t('admin.saved'))
      await load(adminKey)
    } catch {
      setError(t('admin.listError'))
    } finally {
      setBusyId('')
    }
  }

  async function toggleStatus(quote: CommunityQuote) {
    setBusyId(quote.id)
    setError('')
    try {
      await updateQuote(
        {
          id: quote.id,
          author_name: quote.author_name,
          category: quote.category,
          content: quote.content,
          status: quote.status === 'published' ? 'hidden' : 'published',
        },
        adminKey,
      )
      setNotice(t('admin.saved'))
      await load(adminKey)
    } catch {
      setError(t('admin.listError'))
    } finally {
      setBusyId('')
    }
  }

  async function remove(id: string) {
    if (!window.confirm(t('admin.confirmDelete'))) return
    setBusyId(id)
    setError('')
    try {
      await deleteQuote(id, adminKey)
      setNotice(t('admin.deleted'))
      if (editingId === id) setEditingId(null)
      await load(adminKey)
    } catch {
      setError(t('admin.listError'))
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="card">
      <p className="eyebrow">{t('admin.tab.quotes')}</p>
      <h2 className="!text-2xl">{t('admin.quotesTitle')}</h2>
      <p className="mt-3 text-base" style={{ color: 'var(--muted)' }}>
        {t('admin.quotesDescription')}
      </p>

      {!adminKey ? (
        <form onSubmit={unlock} className="mt-7 max-w-xl space-y-4">
          <div>
            <label htmlFor="quotes-admin-key" className="mb-2 block text-base font-semibold">
              {t('admin.keyLabel')}
            </label>
            <input
              id="quotes-admin-key"
              type="password"
              className="field min-h-[52px]"
              value={keyInput}
              onChange={(event) => setKeyInput(event.target.value)}
              autoComplete="off"
            />
            <p className="mt-2 text-base" style={{ color: 'var(--muted)' }}>
              {t('admin.keyHelp')}
            </p>
          </div>
          <button type="submit" className="btn-primary !min-h-[52px]">
            <KeyRound size={19} aria-hidden="true" />
            {t('admin.unlock')}
          </button>
        </form>
      ) : (
        <>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void load(adminKey)}
              disabled={loading}
              className="btn-secondary disabled:opacity-60"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
              {loading ? t('common.loading') : t('common.refresh')}
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  sessionStorage.removeItem(SESSION_KEY)
                } catch {
                  // Nothing to clear if storage is disabled.
                }
                setAdminKey('')
                setKeyInput('')
                setQuotes([])
                setNotice('')
              }}
              className="btn-secondary"
            >
              <X size={18} aria-hidden="true" />
              {t('common.signOut')}
            </button>
          </div>

          {notice && <p className="mt-5 text-base font-semibold text-green-800 dark:text-green-300" role="status">{notice}</p>}
          {error && <p className="mt-5 text-base font-semibold text-red-800 dark:text-red-300" role="alert">{error}</p>}

          {loading && <p className="mt-7 text-lg" style={{ color: 'var(--muted)' }}>{t('admin.listLoading')}</p>}
          {!loading && quotes.length === 0 && !error && (
            <p className="mt-7 text-lg" style={{ color: 'var(--muted)' }}>{t('admin.noQuotes')}</p>
          )}

          <div className="mt-7 space-y-5">
            {quotes.map((quote) => {
              const isEditing = editingId === quote.id
              const isBusy = busyId === quote.id
              return (
                <article key={quote.id} className="rounded-2xl border p-5 sm:p-7" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-base font-semibold" htmlFor={`author-${quote.id}`}>
                          {t('admin.authorLabel')}
                        </label>
                        <input
                          id={`author-${quote.id}`}
                          className="field"
                          value={draft.author_name}
                          maxLength={80}
                          onChange={(event) => setDraft({ ...draft, author_name: event.target.value })}
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-base font-semibold" htmlFor={`category-${quote.id}`}>
                            {t('admin.categoryLabel')}
                          </label>
                          <select
                            id={`category-${quote.id}`}
                            className="field min-h-[52px]"
                            value={draft.category}
                            onChange={(event) => setDraft({ ...draft, category: event.target.value as QuoteCategory })}
                          >
                            {categories.map((item) => (
                              <option key={item} value={item}>{t(categoryLabelKey(item))}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-base font-semibold" htmlFor={`status-${quote.id}`}>
                            {t('admin.statusLabel')}
                          </label>
                          <select
                            id={`status-${quote.id}`}
                            className="field min-h-[52px]"
                            value={draft.status}
                            onChange={(event) => setDraft({ ...draft, status: event.target.value as QuoteStatus })}
                          >
                            {statuses.map((item) => (
                              <option key={item} value={item}>
                                {item === 'published' ? t('admin.statusPublished') : t('admin.statusHidden')}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-base font-semibold" htmlFor={`content-${quote.id}`}>
                          {t('admin.contentLabel')}
                        </label>
                        <textarea
                          id={`content-${quote.id}`}
                          className="field min-h-[140px]"
                          rows={5}
                          maxLength={4000}
                          value={draft.content}
                          onChange={(event) => setDraft({ ...draft, content: event.target.value })}
                        />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          className="btn-primary disabled:opacity-60"
                          disabled={isBusy}
                          onClick={() => void save(quote.id)}
                        >
                          <Check size={18} aria-hidden="true" />
                          {isBusy ? t('common.saving') : t('common.save')}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => setEditingId(null)}>
                          <X size={18} aria-hidden="true" />
                          {t('common.cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap text-lg leading-relaxed">{quote.content}</p>
                      <p className="mt-3 text-base" style={{ color: 'var(--muted)' }}>
                        {quote.author_name || t('quotes.anonymous')} · {t(categoryLabelKey(quote.category))} ·{' '}
                        {quote.status === 'published' ? t('admin.statusPublished') : t('admin.statusHidden')}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button type="button" className="btn-secondary" onClick={() => startEdit(quote)}>
                          <Pencil size={18} aria-hidden="true" />
                          {t('common.edit')}
                        </button>
                        <button
                          type="button"
                          className="btn-secondary disabled:opacity-60"
                          disabled={isBusy}
                          onClick={() => void toggleStatus(quote)}
                        >
                          {quote.status === 'published' ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                          {quote.status === 'published' ? t('common.hide') : t('common.show')}
                        </button>
                        <button
                          type="button"
                          className="btn-secondary !text-red-800 disabled:opacity-60 dark:!text-red-300"
                          disabled={isBusy}
                          onClick={() => void remove(quote.id)}
                        >
                          <Trash2 size={18} aria-hidden="true" />
                          {t('common.delete')}
                        </button>
                      </div>
                    </>
                  )}
                </article>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
