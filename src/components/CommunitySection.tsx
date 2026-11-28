import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Headphones, MessageCircle, RefreshCw, Send, Square } from 'lucide-react'
import { SectionHeading } from './SectionHeading'
import { BottomSheet } from './BottomSheet'
import { useLanguage } from '../context/LanguageContext'
import { currentVisitorContext } from '../lib/sheetTracker'
import { createPost, createReply, fetchPosts, fetchReplies } from '../lib/siteContent'
import type { CommunityPost, CommunityReply } from '../types'

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

function metaLine(parts: (string | undefined)[]): string {
  return parts.filter((part) => Boolean(part?.trim())).join(' · ')
}

export function CommunitySection() {
  const { t, language } = useLanguage()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [replies, setReplies] = useState<CommunityReply[]>([])
  const [loading, setLoading] = useState(true)
  const [unconfigured, setUnconfigured] = useState(false)
  const [failed, setFailed] = useState(false)

  const [name, setName] = useState('')
  const [postText, setPostText] = useState('')
  const [city, setCity] = useState('')
  const [profession, setProfession] = useState('')
  const [interests, setInterests] = useState('')
  const [referral, setReferral] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [website, setWebsite] = useState('')
  const [openToConnect, setOpenToConnect] = useState(false)
  const [posting, setPosting] = useState(false)
  const [postSheetOpen, setPostSheetOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyName, setReplyName] = useState('')
  const [replyText, setReplyText] = useState('')
  const [replyCity, setReplyCity] = useState('')
  const [replyProfession, setReplyProfession] = useState('')
  const [replyCompany, setReplyCompany] = useState('')
  const [replyEmail, setReplyEmail] = useState('')
  const [replyPhone, setReplyPhone] = useState('')
  const [replyPosting, setReplyPosting] = useState(false)
  const [replyNotice, setReplyNotice] = useState('')
  const [replyError, setReplyError] = useState('')

  const [cooldownUntil, setCooldownUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const [speakingKey, setSpeakingKey] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setFailed(false)
    try {
      const [postFeed, replyFeed] = await Promise.all([fetchPosts(), fetchReplies()])
      setPosts(postFeed.rows)
      setReplies(replyFeed.rows)
      setUnconfigured(postFeed.unconfigured && replyFeed.unconfigured)
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

  async function sharePost(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const text = postText.trim()
    if (!text) {
      setError(t('wall.required'))
      setNotice('')
      return
    }

    const tempId = `local-post-${Date.now()}`
    const optimistic: CommunityPost = {
      id: tempId,
      timestamp: new Date().toISOString(),
      name: name.trim() || t('wall.anonymous'),
      post_text: text,
      city: city.trim(),
      profession_role: profession.trim(),
      interests: interests.trim(),
      status: 'published',
    }

    setPosting(true)
    setError('')
    setNotice('')
    setPosts((current) => [optimistic, ...current])
    try {
      const saved = await createPost({
        name: optimistic.name,
        post_text: text,
        email: email.trim(),
        phone_whatsapp: phone.trim(),
        city: optimistic.city,
        profession_role: optimistic.profession_role,
        company_or_business: company.trim(),
        website_or_linkedin: website.trim(),
        interests: optimistic.interests,
        referral_source: referral.trim(),
        open_to_connect: openToConnect,
        language_used: language === 'hi' ? 'hi' : 'en',
        ...currentVisitorContext(),
      })
      setPosts((current) => current.map((post) => (post.id === tempId ? saved : post)))
      setPostText('')
      setUnconfigured(false)
      setNotice(t('wall.posted'))
      setCooldownUntil(Date.now() + COOLDOWN_MS)
      setPostSheetOpen(false)
    } catch {
      setPosts((current) => current.filter((post) => post.id !== tempId))
      setError(t('wall.error'))
    } finally {
      setPosting(false)
    }
  }

  function startReply(postId: string): void {
    setReplyTo((current) => (current === postId ? null : postId))
    setReplyName('')
    setReplyText('')
    setReplyCity('')
    setReplyProfession('')
    setReplyCompany('')
    setReplyEmail('')
    setReplyPhone('')
    setReplyNotice('')
    setReplyError('')
  }

  async function shareReply(event: FormEvent<HTMLFormElement>, postId: string): Promise<void> {
    event.preventDefault()
    const text = replyText.trim()
    if (!text) {
      setReplyError(t('wall.required'))
      setReplyNotice('')
      return
    }

    const tempId = `local-reply-${Date.now()}`
    const displayName = replyName.trim() || t('wall.anonymous')
    const optimistic: CommunityReply = {
      comment_id: tempId,
      id: tempId,
      parent_post_id: postId,
      timestamp: new Date().toISOString(),
      name: displayName,
      comment_text: text,
      message: text,
      city: replyCity.trim(),
      profession_role: replyProfession.trim(),
      status: 'published',
    }

    setReplyPosting(true)
    setReplyError('')
    setReplyNotice('')
    setReplies((current) => [optimistic, ...current])
    try {
      const saved = await createReply({
        parent_post_id: postId,
        name: displayName,
        comment_text: text,
        email: replyEmail.trim(),
        phone_whatsapp: replyPhone.trim(),
        city: optimistic.city,
        profession_role: optimistic.profession_role,
        company_or_business: replyCompany.trim(),
      })
      setReplies((current) => current.map((reply) => (reply.comment_id === tempId ? saved : reply)))
      setReplyText('')
      setReplyNotice(t('wall.replyPosted'))
      setUnconfigured(false)
    } catch {
      setReplies((current) => current.filter((reply) => reply.comment_id !== tempId))
      setReplyError(t('wall.error'))
    } finally {
      setReplyPosting(false)
    }
  }

  function listen(item: { name: string; text: string }, key: string): void {
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
    const utterance = new SpeechSynthesisUtterance(`${item.name}. ${item.text}`)
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
    utterance.rate = 0.9
    utterance.onend = () => setSpeakingKey(null)
    utterance.onerror = () => setSpeakingKey(null)
    setSpeakingKey(key)
    window.speechSynthesis.speak(utterance)
  }

  const showFeed = !loading && !failed && !unconfigured

  return (
    <section id="comments" className="section-shell !pt-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow={t('wall.eyebrow')}
          title={t('wall.title')}
          description={t('wall.description')}
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
        <div className="card min-w-0 sm:hidden">
          <h3 className="font-display text-2xl">{t('wall.title')}</h3>
          <p className="mt-3 text-lg" style={{ color: 'var(--muted)' }}>{t('wall.description')}</p>
          <button type="button" className="btn-primary mt-6 w-full !min-h-[56px]" onClick={() => setPostSheetOpen(true)}>
            <Send size={19} aria-hidden="true" />
            {t('wall.submit')}
          </button>
          {notice && <p className="mt-4 text-base font-semibold text-green-800 dark:text-green-300" role="status">{notice}</p>}
          {error && <p className="mt-4 text-base font-semibold text-red-800 dark:text-red-300" role="alert">{error}</p>}
        </div>

        <div className="card hidden min-w-0 sm:block">
          <h3 className="font-display text-2xl">{t('wall.title')}</h3>
          <form onSubmit={sharePost} className="mt-6 space-y-5">
            <div className="min-w-0">
              <label htmlFor="wall-name" className="mb-2 block text-base font-semibold">{t('wall.nameLabel')}</label>
              <input
                id="wall-name"
                className="field"
                type="text"
                value={name}
                maxLength={80}
                autoComplete="name"
                placeholder={t('wall.namePlaceholder')}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="min-w-0">
              <label htmlFor="wall-text" className="mb-2 block text-base font-semibold">{t('wall.textLabel')}</label>
              <textarea
                id="wall-text"
                className="field min-h-[160px]"
                value={postText}
                maxLength={4000}
                rows={6}
                placeholder={t('wall.textPlaceholder')}
                onChange={(event) => setPostText(event.target.value)}
              />
            </div>

            <details>
              <summary className="inline-flex min-h-[52px] cursor-pointer items-center gap-2 rounded-full border px-5 text-base font-semibold" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                {t('wall.moreDetails')}
              </summary>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="min-w-0">
                  <label htmlFor="wall-city" className="mb-2 block text-base font-semibold">{t('wall.cityLabel')}</label>
                  <input id="wall-city" className="field" type="text" value={city} maxLength={100} onChange={(event) => setCity(event.target.value)} />
                </div>
                <div className="min-w-0">
                  <label htmlFor="wall-profession" className="mb-2 block text-base font-semibold">{t('wall.professionLabel')}</label>
                  <input id="wall-profession" className="field" type="text" value={profession} maxLength={120} onChange={(event) => setProfession(event.target.value)} />
                </div>
                <div className="min-w-0">
                  <label htmlFor="wall-interests" className="mb-2 block text-base font-semibold">{t('wall.interestsLabel')}</label>
                  <input id="wall-interests" className="field" type="text" value={interests} maxLength={160} onChange={(event) => setInterests(event.target.value)} />
                </div>
                <div className="min-w-0">
                  <label htmlFor="wall-referral" className="mb-2 block text-base font-semibold">{t('wall.referralLabel')}</label>
                  <input id="wall-referral" className="field" type="text" value={referral} maxLength={160} onChange={(event) => setReferral(event.target.value)} />
                </div>
                <div className="min-w-0">
                  <label htmlFor="wall-phone" className="mb-2 block text-base font-semibold">{t('wall.phoneLabel')}</label>
                  <input id="wall-phone" className="field" type="tel" value={phone} maxLength={60} onChange={(event) => setPhone(event.target.value)} />
                </div>
                <div className="min-w-0">
                  <label htmlFor="wall-email" className="mb-2 block text-base font-semibold">{t('wall.emailLabel')}</label>
                  <input id="wall-email" className="field" type="email" value={email} maxLength={160} onChange={(event) => setEmail(event.target.value)} />
                </div>
                <div className="min-w-0">
                  <label htmlFor="wall-company" className="mb-2 block text-base font-semibold">{t('wall.companyLabel')}</label>
                  <input id="wall-company" className="field" type="text" value={company} maxLength={160} onChange={(event) => setCompany(event.target.value)} />
                </div>
                <div className="min-w-0">
                  <label htmlFor="wall-website" className="mb-2 block text-base font-semibold">{t('wall.websiteLabel')}</label>
                  <input id="wall-website" className="field" type="text" value={website} maxLength={300} onChange={(event) => setWebsite(event.target.value)} />
                </div>
              </div>
            </details>

            <label htmlFor="wall-open" className="flex min-h-[56px] cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-base font-semibold" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <input
                id="wall-open"
                type="checkbox"
                checked={openToConnect}
                onChange={(event) => setOpenToConnect(event.target.checked)}
                className="h-6 w-6 shrink-0 accent-current"
              />
              <span>{t('wall.openLabel')}</span>
            </label>

            {notice && <p className="text-base font-semibold text-green-800 dark:text-green-300" role="status">{notice}</p>}
            {error && <p className="text-base font-semibold text-red-800 dark:text-red-300" role="alert">{error}</p>}
            {cooldownSeconds > 0 && (
              <p className="text-base" style={{ color: 'var(--muted)' }} role="status">
                {t('wall.cooldown').replace('{seconds}', String(cooldownSeconds))}
              </p>
            )}

            <button type="submit" className="btn-primary w-full !min-h-[56px]" disabled={posting || cooldownSeconds > 0}>
              <Send size={19} aria-hidden="true" />
              {posting ? t('wall.posting') : t('wall.submit')}
            </button>
            <p className="text-base leading-relaxed" style={{ color: 'var(--muted)' }}>{t('wall.privacy')}</p>
          </form>
        </div>

        <div className="min-w-0" aria-live="polite">
          <h3 className="font-display text-2xl">{t('wall.feedTitle')}</h3>
          <div className="mt-6 space-y-5">
            {loading && <p className="text-lg" style={{ color: 'var(--muted)' }}>{t('wall.loading')}</p>}
            {!loading && failed && (
              <p className="text-lg" style={{ color: 'var(--muted)' }}>{t('wall.error')}</p>
            )}
            {!loading && !failed && unconfigured && (
              <p className="text-lg" style={{ color: 'var(--muted)' }}>{t('wall.unconfigured')}</p>
            )}
            {showFeed && posts.length === 0 && (
              <p className="text-lg" style={{ color: 'var(--muted)' }}>{t('wall.empty')}</p>
            )}

            {showFeed && posts.map((post) => {
              const postReplies = replies.filter((reply) => reply.parent_post_id === post.id)
              const postKey = `post-${post.id}`
              const meta = metaLine([post.city, post.profession_role, post.interests])
              const postAuthor = post.name || t('wall.anonymous')

              return (
                <article key={post.id} className="card min-w-0 !p-6 sm:!p-8">
                  <p className="whitespace-pre-wrap text-lg leading-relaxed sm:text-xl">{post.post_text}</p>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-base" style={{ color: 'var(--muted)' }}>
                      <strong style={{ color: 'var(--text)' }}>{postAuthor}</strong>
                      <span aria-hidden="true"> · </span>
                      {formatDate(post.timestamp, language)}
                      {meta && <><span aria-hidden="true"> · </span>{meta}</>}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="btn-secondary !min-h-[48px] !px-4 !py-2 !text-base"
                        onClick={() => listen({ name: postAuthor, text: post.post_text }, postKey)}
                        aria-label={speakingKey === postKey ? t('wall.stop') : t('wall.listen')}
                      >
                        {speakingKey === postKey ? <Square size={17} aria-hidden="true" /> : <Headphones size={19} aria-hidden="true" />}
                        {speakingKey === postKey ? t('wall.stop') : t('wall.listen')}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary !min-h-[48px] !px-4 !py-2 !text-base"
                        onClick={() => startReply(post.id)}
                        aria-expanded={replyTo === post.id}
                      >
                        <MessageCircle size={19} aria-hidden="true" />
                        {t('wall.replyButton')}
                      </button>
                      <span className="self-center text-base" style={{ color: 'var(--muted)' }}>
                        {t('wall.repliesCount').replace('{count}', String(postReplies.length))}
                      </span>
                    </div>
                  </div>

                  {replyTo === post.id && (
                    <form onSubmit={(event) => void shareReply(event, post.id)} className="mt-6 rounded-2xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                      <h4 className="font-display text-lg">{t('wall.replyTitle')}</h4>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div className="min-w-0">
                          <label htmlFor={`reply-name-${post.id}`} className="mb-2 block text-base font-semibold">{t('wall.replyName')}</label>
                          <input id={`reply-name-${post.id}`} className="field" type="text" value={replyName} maxLength={80} onChange={(event) => setReplyName(event.target.value)} />
                        </div>
                        <div className="min-w-0">
                          <label htmlFor={`reply-text-${post.id}`} className="mb-2 block text-base font-semibold">{t('wall.replyText')}</label>
                          <textarea id={`reply-text-${post.id}`} className="field min-h-[96px]" value={replyText} maxLength={2000} rows={3} onChange={(event) => setReplyText(event.target.value)} />
                        </div>
                      </div>
                      <details className="mt-4">
                        <summary className="inline-flex min-h-[52px] cursor-pointer items-center gap-2 rounded-full border px-5 text-base font-semibold" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                          {t('wall.moreDetails')}
                        </summary>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <div className="min-w-0">
                            <label htmlFor={`reply-city-${post.id}`} className="mb-2 block text-base font-semibold">{t('wall.cityLabel')}</label>
                            <input id={`reply-city-${post.id}`} className="field" type="text" value={replyCity} maxLength={100} onChange={(event) => setReplyCity(event.target.value)} />
                          </div>
                          <div className="min-w-0">
                            <label htmlFor={`reply-profession-${post.id}`} className="mb-2 block text-base font-semibold">{t('wall.professionLabel')}</label>
                            <input id={`reply-profession-${post.id}`} className="field" type="text" value={replyProfession} maxLength={120} onChange={(event) => setReplyProfession(event.target.value)} />
                          </div>
                          <div className="min-w-0">
                            <label htmlFor={`reply-company-${post.id}`} className="mb-2 block text-base font-semibold">{t('wall.companyLabel')}</label>
                            <input id={`reply-company-${post.id}`} className="field" type="text" value={replyCompany} maxLength={160} onChange={(event) => setReplyCompany(event.target.value)} />
                          </div>
                          <div className="min-w-0">
                            <label htmlFor={`reply-phone-${post.id}`} className="mb-2 block text-base font-semibold">{t('wall.phoneLabel')}</label>
                            <input id={`reply-phone-${post.id}`} className="field" type="tel" value={replyPhone} maxLength={60} onChange={(event) => setReplyPhone(event.target.value)} />
                          </div>
                          <div className="min-w-0 sm:col-span-2">
                            <label htmlFor={`reply-email-${post.id}`} className="mb-2 block text-base font-semibold">{t('wall.emailLabel')}</label>
                            <input id={`reply-email-${post.id}`} className="field" type="email" value={replyEmail} maxLength={160} onChange={(event) => setReplyEmail(event.target.value)} />
                          </div>
                        </div>
                      </details>
                      {replyNotice && <p className="mt-4 text-base font-semibold text-green-800 dark:text-green-300" role="status">{replyNotice}</p>}
                      {replyError && <p className="mt-4 text-base font-semibold text-red-800 dark:text-red-300" role="alert">{replyError}</p>}
                      <button type="submit" className="btn-primary mt-5 w-full !min-h-[52px]" disabled={replyPosting}>
                        <Send size={18} aria-hidden="true" />
                        {replyPosting ? t('wall.posting') : t('wall.replyButton')}
                      </button>
                    </form>
                  )}

                  {postReplies.length > 0 && (
                    <div className="mt-6 space-y-4 border-t pt-5" style={{ borderColor: 'var(--border)' }}>
                      <h4 className="font-display text-lg">{t('wall.replyTitle')}</h4>
                      {postReplies.map((reply) => {
                        const replyKey = `reply-${reply.comment_id ?? reply.id}`
                        const replyAuthor = reply.name || t('wall.anonymous')
                        const replyMeta = metaLine([reply.city, reply.profession_role])
                        const replyBody = reply.comment_text ?? reply.message ?? ''
                        return (
                          <div key={replyKey} className="rounded-2xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                            <p className="whitespace-pre-wrap text-lg leading-relaxed">{replyBody}</p>
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                              <p className="text-base" style={{ color: 'var(--muted)' }}>
                                <strong style={{ color: 'var(--text)' }}>{replyAuthor}</strong>
                                <span aria-hidden="true"> · </span>
                                {formatDate(reply.timestamp, language)}
                                {replyMeta && <><span aria-hidden="true"> · </span>{replyMeta}</>}
                              </p>
                              <button
                                type="button"
                                className="btn-secondary !min-h-[48px] !px-4 !py-2 !text-base"
                                onClick={() => listen({ name: replyAuthor, text: replyBody }, replyKey)}
                                aria-label={speakingKey === replyKey ? t('wall.stop') : t('wall.listen')}
                              >
                                {speakingKey === replyKey ? <Square size={17} aria-hidden="true" /> : <Headphones size={19} aria-hidden="true" />}
                                {speakingKey === replyKey ? t('wall.stop') : t('wall.listen')}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      </div>

      <BottomSheet
        open={postSheetOpen}
        onClose={() => setPostSheetOpen(false)}
        title={t('wall.title')}
        titleId="wall-sheet-title"
      >
        <form onSubmit={sharePost} className="space-y-5">
          <label htmlFor="sheet-wall-name" className="block text-base font-semibold">{t('wall.nameLabel')}</label>
          <input
            id="sheet-wall-name"
            className="field"
            type="text"
            value={name}
            maxLength={80}
            autoComplete="name"
            placeholder={t('wall.namePlaceholder')}
            onChange={(event) => setName(event.target.value)}
          />
          <label htmlFor="sheet-wall-text" className="block text-base font-semibold">{t('wall.textLabel')}</label>
          <textarea
            id="sheet-wall-text"
            className="field min-h-[160px]"
            value={postText}
            maxLength={4000}
            rows={5}
            placeholder={t('wall.textPlaceholder')}
            onChange={(event) => setPostText(event.target.value)}
          />
          <details>
            <summary className="inline-flex min-h-[52px] cursor-pointer items-center gap-2 rounded-full border px-5 text-base font-semibold" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              {t('wall.moreDetails')}
            </summary>
            <div className="mt-5 grid gap-4">
              <input className="field" aria-label={t('wall.cityLabel')} placeholder={t('wall.cityLabel')} value={city} maxLength={100} onChange={(event) => setCity(event.target.value)} />
              <input className="field" aria-label={t('wall.professionLabel')} placeholder={t('wall.professionLabel')} value={profession} maxLength={120} onChange={(event) => setProfession(event.target.value)} />
              <input className="field" aria-label={t('wall.interestsLabel')} placeholder={t('wall.interestsLabel')} value={interests} maxLength={160} onChange={(event) => setInterests(event.target.value)} />
              <input className="field" aria-label={t('wall.referralLabel')} placeholder={t('wall.referralLabel')} value={referral} maxLength={160} onChange={(event) => setReferral(event.target.value)} />
              <input className="field" type="tel" aria-label={t('wall.phoneLabel')} placeholder={t('wall.phoneLabel')} value={phone} maxLength={60} onChange={(event) => setPhone(event.target.value)} />
              <input className="field" type="email" aria-label={t('wall.emailLabel')} placeholder={t('wall.emailLabel')} value={email} maxLength={160} onChange={(event) => setEmail(event.target.value)} />
              <input className="field" aria-label={t('wall.companyLabel')} placeholder={t('wall.companyLabel')} value={company} maxLength={160} onChange={(event) => setCompany(event.target.value)} />
              <input className="field" aria-label={t('wall.websiteLabel')} placeholder={t('wall.websiteLabel')} value={website} maxLength={300} onChange={(event) => setWebsite(event.target.value)} />
            </div>
          </details>
          <label className="flex min-h-[56px] items-center gap-3 rounded-2xl border px-4 text-base" style={{ borderColor: 'var(--border)' }}>
            <input type="checkbox" className="h-6 w-6" checked={openToConnect} onChange={(event) => setOpenToConnect(event.target.checked)} />
            {t('wall.openLabel')}
          </label>
          {error && <p role="alert" className="text-base font-semibold text-red-800 dark:text-red-300">{error}</p>}
          <button type="submit" className="btn-primary w-full !min-h-[56px]" disabled={posting || cooldownSeconds > 0}>
            <Send size={19} aria-hidden="true" />
            {posting ? t('wall.posting') : t('wall.submit')}
          </button>
          <p className="text-base" style={{ color: 'var(--muted)' }}>{t('wall.privacy')}</p>
        </form>
      </BottomSheet>
    </section>
  )
}
