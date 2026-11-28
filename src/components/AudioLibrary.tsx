import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { CalendarDays, Clock3, Headphones, KeyRound, LockKeyhole, RefreshCw } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { MediaPlayer } from './MediaPlayer'
import { SectionHeading } from './SectionHeading'
import { useLanguage } from '../context/LanguageContext'
import { fetchAudioSessions } from '../lib/siteContent'
import { verifyAudioPin } from '../lib/sheetApi'
import { trackVisitorEvent } from '../lib/sheetTracker'
import type { AudioSession } from '../types'

function formatDate(value: string, language: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

type Unlocked = { url: string; playerUrl: string; title: string }

export function AudioLibrary() {
  const { t, language } = useLanguage()
  const [rows, setRows] = useState<AudioSession[]>([])
  const [loading, setLoading] = useState(true)
  const [unconfigured, setUnconfigured] = useState(false)
  const [failed, setFailed] = useState(false)
  const [pinFor, setPinFor] = useState<AudioSession | null>(null)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [checking, setChecking] = useState(false)
  const [active, setActive] = useState<Unlocked | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setFailed(false)
    try {
      const feed = await fetchAudioSessions()
      setRows(feed.rows)
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

  function openAudio(audio: AudioSession, url: string, playerUrl = url): void {
    setActive({ url, playerUrl, title: audio.title })
    setPinFor(null)
    setPin('')
    setPinError('')
    trackVisitorEvent('audio_play', { eventDetail: audio.title })
  }

  async function unlock(event: FormEvent): Promise<void> {
    event.preventDefault()
    if (!pinFor || !pin.trim() || checking) return
    setChecking(true)
    setPinError('')
    try {
      const result = await verifyAudioPin(pinFor.id, pin.trim())
      if (!result.ok || !result.audio_preview_url) {
        setPinError(t('audio.pinWrong'))
        return
      }
      let playerUrl = result.audio_preview_url
      try {
        const fileId = new URL(result.audio_preview_url).searchParams.get('id')
        if (fileId) playerUrl = `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview`
      } catch {
        // Keep the direct URL when the response was not a Google Drive link.
      }
      openAudio(pinFor, result.audio_preview_url, playerUrl)
    } catch {
      setPinError(t('audio.pinError'))
    } finally {
      setChecking(false)
    }
  }

  const showFeed = !loading && !failed && !unconfigured

  return (
    <section id="audio" className="section-shell !pt-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow={t('audio.eyebrow')}
          title={t('audio.title')}
          description={t('audio.description')}
        />
        <button
          type="button"
          className="btn-secondary shrink-0"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
          {loading ? t('common.loading') : t('common.refresh')}
        </button>
      </div>

      <div className="mt-8 space-y-5" aria-live="polite">
        {loading && <p className="soft-panel text-center text-lg">{t('audio.loading')}</p>}
        {!loading && failed && <p className="soft-panel text-center text-lg">{t('audio.error')}</p>}
        {!loading && !failed && unconfigured && (
          <p className="soft-panel text-center text-lg">{t('audio.unconfigured')}</p>
        )}
        {showFeed && rows.length === 0 && (
          <p className="soft-panel text-center text-lg">{t('audio.empty')}</p>
        )}

        {showFeed && rows.map((audio) => {
          const canListen = !audio.is_locked && Boolean(audio.media_url)
          return (
            <article key={audio.id} className="card flex flex-col gap-5 !p-6 sm:!p-8">
              <div className="min-w-0">
                <h3 className="font-display text-2xl">{audio.title}</h3>
                {audio.description && <p className="mt-2 text-lg">{audio.description}</p>}
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-base" style={{ color: 'var(--muted)' }}>
                  {audio.created_at && (
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays size={18} aria-hidden="true" />
                      {formatDate(audio.created_at, language)}
                    </span>
                  )}
                  {audio.speaker && (
                    <span className="inline-flex items-center gap-2">
                      <Headphones size={18} aria-hidden="true" />
                      {audio.speaker}
                    </span>
                  )}
                  {audio.duration && (
                    <span className="inline-flex items-center gap-2">
                      <Clock3 size={18} aria-hidden="true" />
                      {audio.duration}
                    </span>
                  )}
                </div>
              </div>

              {canListen ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="btn-primary w-full sm:w-auto"
                    onClick={() => openAudio(audio, audio.media_url)}
                  >
                    <Headphones size={19} aria-hidden="true" />
                    {t('audio.open')}
                  </button>
                  <a href={audio.media_url} target="_blank" rel="noreferrer" className="btn-secondary w-full sm:w-auto">
                    {t('audio.openPlayer')}
                  </a>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-secondary w-full"
                  onClick={() => {
                    setPinFor(audio)
                    setPin('')
                    setPinError('')
                  }}
                >
                  <LockKeyhole size={19} aria-hidden="true" />
                  {t('audio.protected')}
                </button>
              )}
            </article>
          )
        })}
      </div>

      <BottomSheet
        open={Boolean(pinFor)}
        onClose={() => setPinFor(null)}
        title={t('audio.pinTitle')}
        titleId="audio-pin-title"
      >
        <p className="text-lg" style={{ color: 'var(--muted)' }}>
          {pinFor?.title}
        </p>
        <form onSubmit={(event) => void unlock(event)} className="mt-6 space-y-5">
          <label htmlFor="audio-pin-input" className="block text-base font-semibold">
            {t('audio.pinLabel')}
          </label>
          <div className="relative">
            <KeyRound size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} aria-hidden="true" />
            <input
              id="audio-pin-input"
              className="field !h-14 !pl-12 !text-2xl"
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={20}
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              aria-invalid={Boolean(pinError)}
              aria-describedby={pinError ? 'audio-pin-error' : undefined}
            />
          </div>
          {pinError && <p id="audio-pin-error" role="alert" className="text-base font-semibold text-red-800 dark:text-red-300">{pinError}</p>}
          <button type="submit" className="btn-primary w-full !min-h-[56px]" disabled={checking || !pin.trim()}>
            <LockKeyhole size={19} aria-hidden="true" />
            {checking ? t('audio.checking') : t('audio.unlock')}
          </button>
        </form>
      </BottomSheet>

      <BottomSheet
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={active?.title ?? t('audio.title')}
        titleId="audio-player-title"
      >
        {active && (
          <>
            <MediaPlayer url={active.url} mediaType="audio" title={active.title} />
            <a href={active.playerUrl} target="_blank" rel="noreferrer" className="btn-secondary mt-6 w-full">
              {t('audio.openPlayer')}
            </a>
          </>
        )}
      </BottomSheet>
    </section>
  )
}
