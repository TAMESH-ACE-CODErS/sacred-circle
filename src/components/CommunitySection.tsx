import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Headphones, RefreshCw, Send, Square } from 'lucide-react'
import { SectionHeading } from './SectionHeading'
import { useLanguage } from '../context/LanguageContext'
import { fetchComments, postComment } from '../lib/siteContent'
import type { CommunityComment } from '../types'

const COOLDOWN_MS = 15000

function formatDate(value: string, language: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function CommunitySection() {
  const { t, language } = useLanguage()
  const [comments, setComments] = useState<CommunityComment[]>([])
  const [loading, setLoading] = useState(true)
  const [unconfigured, setUnconfigured] = useState(false)
  const [failed, setFailed] = useState(false)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [posting, setPosting] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [cooldownUntil, setCooldownUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const [speakingKey, setSpeakingKey] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setFailed(false)
    try {
      const feed = await fetchComments()
      setComments(feed.rows)
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

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  const cooldownSeconds = Math.max(0, Math.ceil((cooldownUntil - now) / 1000))

  async function share(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanName = name.trim()
    const cleanMessage = message.trim()

    if (!cleanName) {
      setError(t('comments.nameRequired'))
      setNotice('')
      return
    }
    if (!cleanMessage) {
      setError(t('comments.required'))
      setNotice('')
      return
    }

    const tempId = `local-${Date.now()}`
    const optimistic: CommunityComment = {
      id: tempId,
      name: cleanName,
      message: cleanMessage,
      created_at: new Date().toISOString(),
    }

    setPosting(true)
    setError('')
    setNotice('')
    setComments((current) => [optimistic, ...current])
    try {
      const saved = await postComment({ name: cleanName, message: cleanMessage })
      setComments((current) => current.map((item) => (item.id === tempId ? { ...saved, id: tempId } : item)))
      setUnconfigured(false)
      setMessage('')
      setNotice(t('comments.posted'))
      setCooldownUntil(Date.now() + COOLDOWN_MS)
    } catch {
      setComments((current) => current.filter((item) => item.id !== tempId))
      setError(t('comments.error'))
    } finally {
      setPosting(false)
    }
  }

  function listen(comment: CommunityComment, key: string) {
    if (!('speechSynthesis' in window)) {
      setError(t('comments.listenUnavailable'))
      return
    }
    if (speakingKey === key) {
      window.speechSynthesis.cancel()
      setSpeakingKey(null)
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(`${comment.name}. ${comment.message}`)
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
    utterance.rate = 0.9
    utterance.onend = () => setSpeakingKey(null)
    utterance.onerror = () => setSpeakingKey(null)
    setSpeakingKey(key)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <section id="comments" className="section-shell !pt-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow={t('comments.eyebrow')}
          title={t('comments.title')}
          description={t('comments.description')}
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

      <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card">
          <h3 className="font-display text-2xl">{t('comments.post')}</h3>
          <form onSubmit={share} className="mt-6 space-y-5">
            <div>
              <label htmlFor="comment-name" className="mb-2 block text-base font-semibold">
                {t('comments.nameLabel')}
              </label>
              <input
                id="comment-name"
                type="text"
                className="field"
                value={name}
                maxLength={80}
                required
                autoComplete="name"
                onChange={(event) => setName(event.target.value)}
                placeholder={t('comments.namePlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="comment-message" className="mb-2 block text-base font-semibold">
                {t('comments.messageLabel')}
              </label>
              <textarea
                id="comment-message"
                className="field min-h-[160px]"
                value={message}
                maxLength={2000}
                required
                rows={6}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={t('comments.messagePlaceholder')}
              />
            </div>

            {notice && <p className="text-base font-semibold text-green-800 dark:text-green-300" role="status">{notice}</p>}
            {error && <p className="text-base font-semibold text-red-800 dark:text-red-300" role="alert">{error}</p>}
            {cooldownSeconds > 0 && (
              <p className="text-base" style={{ color: 'var(--muted)' }} role="status">
                {t('comments.cooldown').replace('{seconds}', String(cooldownSeconds))}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary w-full !min-h-[56px]"
              disabled={posting || cooldownSeconds > 0}
            >
              <Send size={19} aria-hidden="true" />
              {posting ? t('comments.posting') : t('comments.post')}
            </button>
            <p className="text-base" style={{ color: 'var(--muted)' }}>{t('comments.noLogin')}</p>
          </form>
        </div>

        <div aria-live="polite">
          <h3 className="font-display text-2xl">{t('comments.feedTitle')}</h3>
          <div className="mt-6 space-y-5">
            {loading && <p className="text-lg" style={{ color: 'var(--muted)' }}>{t('comments.loading')}</p>}
            {!loading && failed && (
              <p className="text-lg" style={{ color: 'var(--muted)' }}>{t('comments.error')}</p>
            )}
            {!loading && !failed && unconfigured && (
              <p className="text-lg" style={{ color: 'var(--muted)' }}>{t('comments.unconfigured')}</p>
            )}
            {!loading && !failed && !unconfigured && comments.length === 0 && (
              <p className="text-lg" style={{ color: 'var(--muted)' }}>{t('comments.empty')}</p>
            )}

            {!failed && !unconfigured && comments.map((comment, index) => {
              const key = comment.id ?? `${comment.created_at}-${index}`
              return (
                <article key={key} className="card !p-6 sm:!p-8">
                  <p className="whitespace-pre-wrap text-lg leading-relaxed sm:text-xl">{comment.message}</p>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-base" style={{ color: 'var(--muted)' }}>
                      <strong style={{ color: 'var(--text)' }}>{comment.name}</strong>
                      <span aria-hidden="true"> · </span>
                      {t('comments.postedOn')} {formatDate(comment.created_at, language)}
                    </p>
                    <button
                      type="button"
                      className="btn-secondary !min-h-[48px] !px-4 !py-2 !text-base"
                      onClick={() => listen(comment, key)}
                      aria-label={speakingKey === key ? t('comments.stop') : t('comments.listen')}
                    >
                      {speakingKey === key ? <Square size={17} /> : <Headphones size={19} />}
                      {speakingKey === key ? t('comments.stop') : t('comments.listen')}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
