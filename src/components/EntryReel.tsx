import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CalendarCheck2, MessageCircle, Youtube } from 'lucide-react'
import { copy, WHATSAPP_URL, YOUTUBE_URL } from '../config/site'
import { getFounderImage } from '../config/mediaManifest'
import { useLanguage } from '../context/LanguageContext'
import { trackVisitorEvent } from '../lib/sheetTracker'

const ABOUT_LOCK_MS = 3000
const REEL_SLIDE_MS = 2500
const REEL_SLIDES = 4

const reelLines = [
  { en: '28+ years of practice', hi: '28+ वर्षों की साधना' },
  { en: '100+ healing modalities', hi: '100+ हीलिंग विधियाँ' },
  { en: 'Free 2-hour Sunday sessions', hi: 'निःशुल्क 2 घंटे के रविवार सत्र' },
  { en: 'Everyone is welcome', hi: 'सभी का स्वागत है' },
]

const reactions = [
  { key: 'namaste', labelKey: 'intro.reactionNamaste' as const },
  { key: 'inspiring', labelKey: 'intro.reactionInspiring' as const },
  { key: 'joinSunday', labelKey: 'intro.reactionJoin' as const },
]

type Props = { onEnter: (destination?: string) => void }

export function EntryReel({ onEnter }: Props) {
  const [stage, setStage] = useState<'reel' | 'about'>('reel')
  const [slideIndex, setSlideIndex] = useState(0)
  const [aboutElapsed, setAboutElapsed] = useState(0)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [toast, setToast] = useState('')
  const [remindersRequested, setRemindersRequested] = useState(false)

  const enteredRef = useRef(false)
  const aboutStartedRef = useRef(0)
  const toastTimerRef = useRef<number | null>(null)
  const reminderTimerRef = useRef<number | null>(null)
  const reducedMotion = useReducedMotion()
  const { t, language } = useLanguage()
  const isHindi = language === 'hi'
  const locked = aboutElapsed < ABOUT_LOCK_MS

  function enterWebsite(destination?: string): void {
    if (enteredRef.current) return
    enteredRef.current = true
    onEnter(destination)
  }

  // Stage 1: a short, self-running presentation with no progress bars.
  useEffect(() => {
    if (stage !== 'reel') return
    const slideTimer = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % REEL_SLIDES)
    }, REEL_SLIDE_MS)
    const advanceTimer = window.setTimeout(() => setStage('about'), REEL_SLIDE_MS * REEL_SLIDES)
    return () => {
      window.clearInterval(slideTimer)
      window.clearTimeout(advanceTimer)
    }
  }, [stage])

  // Stage 2: taps are ignored for the first 3 seconds.
  useEffect(() => {
    if (stage !== 'about') return
    aboutStartedRef.current = performance.now()
    setAboutElapsed(0)
    const timer = window.setInterval(() => {
      if (!enteredRef.current) setAboutElapsed(performance.now() - aboutStartedRef.current)
    }, 100)
    return () => window.clearInterval(timer)
  }, [stage])

  useEffect(
    () => () => {
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current)
      if (reminderTimerRef.current !== null) window.clearTimeout(reminderTimerRef.current)
    },
    [],
  )

  function showToast(message: string): void {
    setToast(message)
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setToast(''), 2200)
  }

  function goToAbout(): void {
    trackVisitorEvent('reel_skipped', { eventDetail: 'Skip reel to About' })
    setStage('about')
  }

  function handleAboutTap(): void {
    if (locked) return
    trackVisitorEvent('reel_skipped', { eventDetail: 'Tap anywhere after About' })
    enterWebsite()
  }

  function react(key: string, label: string): void {
    setCounts((current) => ({ ...current, [key]: (current[key] ?? 0) + 1 }))
    showToast(t('intro.thankYou'))
    trackVisitorEvent('brochure_reaction', { eventDetail: label })
  }

  function openTracked(url: string, type: 'youtube_click' | 'whatsapp_click', detail: string): void {
    trackVisitorEvent(type, { eventDetail: detail })
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function requestReminders(): void {
    if (remindersRequested) return
    setRemindersRequested(true)
    showToast(t('intro.remindersOn'))
    trackVisitorEvent('sunday_cta_click', { eventDetail: 'Get Sunday Reminders' })
    reminderTimerRef.current = window.setTimeout(() => enterWebsite('sunday-checkin'), 900)
  }

  const transition = reducedMotion ? 0.01 : 0.6
  const line = reelLines[slideIndex]

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0.01 : 0.35 }}
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#FAF7F2] px-5 py-5 text-center text-[#211D19] sm:px-10 sm:py-7"
      aria-label={stage === 'about' ? t('common.tapAnywhere') : t('intro.presentationTitle')}
      role={stage === 'about' ? 'button' : undefined}
      tabIndex={stage === 'about' ? 0 : undefined}
      aria-disabled={stage === 'about' ? locked : undefined}
      onClick={stage === 'about' ? handleAboutTap : undefined}
      onKeyDown={
        stage === 'about'
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleAboutTap()
              }
            }
          : undefined
      }
    >
      {stage === 'reel' ? (
        <>
          <div className="mx-auto flex w-full max-w-5xl items-start justify-between gap-3">
            <p className="pt-3 text-base font-semibold uppercase tracking-[0.18em] text-[#8A6B45]">
              Sacred Circle
            </p>
            <button
              type="button"
              onClick={goToAbout}
              className="inline-flex min-h-[56px] items-center rounded-full border-2 border-[#77593C] bg-[#B71C1C] px-6 text-lg font-bold text-white shadow-calm transition-transform hover:-translate-y-0.5"
            >
              {t('intro.skipAbout')}
            </button>
          </div>

          <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center py-6">
            <p className="mb-4 text-base font-semibold uppercase tracking-[0.18em] text-[#8A6B45]">
              {t('intro.presentationTitle')}
            </p>
            <h1 className="!text-3xl sm:!text-5xl">{copy.foundersEn}</h1>
            <p className="mt-3 text-xl text-[#6B6357] sm:text-2xl">{copy.teachingEn}</p>

            <div className="my-6 h-px w-24 bg-[#D9CBB4]" aria-hidden="true" />

            <h2 className="devanagari !text-2xl sm:!text-4xl">{copy.foundersHi}</h2>
            <p className="devanagari mt-3 text-xl text-[#6B6357] sm:text-2xl">{copy.teachingHi}</p>

            <div className="mt-8 min-h-[3rem]" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={slideIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: transition }}
                  className={`text-lg font-semibold text-[#77593C] sm:text-xl ${isHindi ? 'devanagari' : ''}`}
                >
                  {isHindi ? line.hi : line.en}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-3" aria-label="Reactions">
              {reactions.map((reaction) => {
                const label = t(reaction.labelKey)
                return (
                  <button
                    key={reaction.key}
                    type="button"
                    onClick={() => react(reaction.key, label)}
                    className="inline-flex min-h-[56px] items-center gap-2 rounded-full border-2 border-[#E4D8C5] bg-[#FFFDF8] px-5 text-base font-bold text-[#211D19] shadow-calm transition-transform hover:-translate-y-0.5"
                  >
                    <span>{label}</span>
                    {counts[reaction.key] ? (
                      <span className="rounded-full bg-[#B71C1C] px-2 py-0.5 text-base font-bold text-white">
                        {counts[reaction.key]}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => openTracked(YOUTUBE_URL, 'youtube_click', 'Intro reel')}
                className="inline-flex min-h-[52px] items-center gap-2 rounded-full border-2 border-[#E4D8C5] bg-[#FFFDF8] px-5 text-base font-bold text-[#211D19]"
              >
                <Youtube size={19} aria-hidden="true" />
                {t('intro.youtubeLibrary')}
              </button>
              <button
                type="button"
                onClick={() => openTracked(WHATSAPP_URL, 'whatsapp_click', 'Intro reel')}
                className="inline-flex min-h-[52px] items-center gap-2 rounded-full border-2 border-[#E4D8C5] bg-[#FFFDF8] px-5 text-base font-bold text-[#211D19]"
              >
                <MessageCircle size={19} aria-hidden="true" />
                {t('intro.whatsappCircle')}
              </button>
              <button
                type="button"
                aria-pressed={remindersRequested}
                onClick={requestReminders}
                className="inline-flex min-h-[56px] items-center gap-2 rounded-full bg-[#B71C1C] px-6 text-base font-bold text-white"
              >
                <CalendarCheck2 size={19} aria-hidden="true" />
                {t('intro.reminders')}
              </button>
            </div>
          </div>

          <p className="mx-auto shrink-0 text-base font-semibold text-[#6B6357]">
            {t('intro.brochureNote')}
          </p>
        </>
      ) : (
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center py-4">
          <p className="mb-2 text-base font-semibold uppercase tracking-[0.18em] text-[#8A6B45]">
            {t('intro.storyEyebrow')}
          </p>
          <h1 className="!text-2xl sm:!text-4xl">{t('intro.storyTitle')}</h1>
          <p className={`mt-2 text-lg font-semibold text-[#6B6357] ${isHindi ? 'devanagari' : ''}`}>
            {isHindi ? copy.foundersHi : copy.foundersEn}
          </p>

          <div className="mx-auto mt-5 flex w-full max-w-3xl flex-col items-center gap-5 rounded-[2rem] border-2 border-[#E4D8C5] bg-[#FFFDF8] p-5 text-left shadow-calm sm:flex-row sm:p-7">
            <img
              src={getFounderImage('clientMF')}
              alt={copy.foundersEn}
              className="h-32 w-32 shrink-0 rounded-full object-cover object-top sm:h-44 sm:w-44"
            />
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="text-base font-bold uppercase tracking-wide text-[#8A6B45]">
                {t('intro.card1Figure')} · {t('intro.card3Figure')}
              </p>
              <p className="mt-2 text-lg leading-relaxed text-[#6B6357]">{t('intro.card1Text')}</p>
              <p className="mt-2 text-lg leading-relaxed text-[#6B6357]">{t('intro.card2Text')}</p>
            </div>
          </div>

          <div className="mx-auto mt-4 grid w-full max-w-4xl gap-4 text-left sm:grid-cols-2">
            <div className="rounded-2xl border border-[#E4D8C5] bg-[#FFFDF8] p-5">
              <p className="text-base font-bold uppercase tracking-wide text-[#8A6B45]">{t('intro.card3Title')}</p>
              <p className="mt-2 text-base leading-relaxed text-[#6B6357]">{t('intro.card3Text')}</p>
            </div>
            <div className="rounded-2xl border border-[#E4D8C5] bg-[#FFFDF8] p-5">
              <p className="text-base font-bold uppercase tracking-wide text-[#8A6B45]">{t('intro.card4Title')}</p>
              <p className="mt-2 text-base leading-relaxed text-[#6B6357]">{t('intro.card4Text')}</p>
            </div>
          </div>

          <div className="mt-7 min-h-[3.5rem] px-2">
            {!locked && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
                className="text-lg font-bold text-[#B71C1C] sm:text-xl"
              >
                {t('common.tapAnywhere')}
              </motion.p>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-[#2E7D32] px-6 py-3 text-lg font-bold text-white shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
