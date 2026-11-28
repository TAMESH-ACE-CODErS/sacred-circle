import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CalendarCheck2, MessageCircle, Youtube } from 'lucide-react'
import { copy, WHATSAPP_URL, YOUTUBE_URL } from '../config/site'
import { getFounderImage } from '../config/mediaManifest'
import { useLanguage } from '../context/LanguageContext'
import { trackVisitorEvent } from '../lib/sheetTracker'

const INTRO_LOCK_MS = 3000
const IDLE_MS = 5000
const PRESENTATION_SLIDE_MS = 2500
const PRESENTATION_SLIDES = 4

const reactions = [
  { key: 'namaste', labelKey: 'intro.reactionNamaste' as const },
  { key: 'inspiring', labelKey: 'intro.reactionInspiring' as const },
  { key: 'joinSunday', labelKey: 'intro.reactionJoin' as const },
]

const facts = [
  { figureKey: 'intro.card1Figure' as const, titleKey: 'intro.card1Title' as const, textKey: 'intro.card1Text' as const },
  { figureKey: 'intro.card2Figure' as const, titleKey: 'intro.card2Title' as const, textKey: 'intro.card2Text' as const },
  { figureKey: 'intro.card3Figure' as const, titleKey: 'intro.card3Title' as const, textKey: 'intro.card3Text' as const },
  { figureKey: 'intro.card4Figure' as const, titleKey: 'intro.card4Title' as const, textKey: 'intro.card4Text' as const },
]

const slides = [
  { name: copy.foundersEn, teaching: copy.teachingEn, nameHi: copy.foundersHi, teachingHi: copy.teachingHi },
  { name: '28+ years · 100+ modalities', teaching: 'Learn, practise and teach healing & meditation', nameHi: '28+ वर्ष · 100+ विधियाँ', teachingHi: 'हीलिंग और ध्यान सीखें, अभ्यास करें और सिखाएँ' },
  { name: 'Free 2-Hour Weekly Sunday Sessions', teaching: 'Every Sunday, 4:00 PM IST · Everyone welcome', nameHi: 'निःशुल्क साप्ताहिक रविवार 2 घंटे सत्र', teachingHi: 'हर रविवार, 4:00 अपराह्न IST · सभी स्वागत योग्य' },
  { name: 'Library · WhatsApp · Reminders', teaching: 'Stay connected with Lina Bhave & Diwakar Raipure', nameHi: 'लाइब्रेरी · व्हाट्सएप · याद दिलाना', teachingHi: 'लीना भावे एवं दिवाकर रायपुरे से जुड़े रहें' },
]

type Props = { onEnter: (destination?: string) => void }

export function EntryReel({ onEnter }: Props) {
  const [stage, setStage] = useState<'brochure' | 'presentation'>('brochure')
  const [elapsed, setElapsed] = useState(0)
  const [slideIndex, setSlideIndex] = useState(0)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [toast, setToast] = useState('')
  const [remindersRequested, setRemindersRequested] = useState(false)

  const startedRef = useRef(0)
  const enteredRef = useRef(false)
  const toastTimerRef = useRef<number | null>(null)
  const reminderTimerRef = useRef<number | null>(null)
  const reducedMotion = useReducedMotion()
  const { t, language } = useLanguage()
  const isHindi = language === 'hi'

  const locked = elapsed < INTRO_LOCK_MS
  const secondsLeft = locked ? Math.max(1, Math.ceil((INTRO_LOCK_MS - elapsed) / 1000)) : 0
  const idleSeconds = locked ? 0 : Math.min(5, Math.floor((elapsed - INTRO_LOCK_MS) / 1000))

  function brochureSeconds(): number {
    return Math.round(elapsed / 1000)
  }

  function enterWebsite(destination?: string): void {
    if (enteredRef.current) return
    enteredRef.current = true
    onEnter(destination)
  }

  useEffect(() => {
    startedRef.current = performance.now()
    const timer = window.setInterval(() => {
      if (!enteredRef.current) setElapsed(performance.now() - startedRef.current)
    }, 100)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (locked || stage !== 'brochure') return
    const timer = window.setTimeout(() => setStage('presentation'), IDLE_MS)
    return () => window.clearTimeout(timer)
  }, [locked, stage])

  useEffect(() => {
    if (stage !== 'presentation') return
    setSlideIndex(0)
    const slideTimer = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % PRESENTATION_SLIDES)
    }, PRESENTATION_SLIDE_MS)
    const finishTimer = window.setTimeout(
      () => enterWebsite(),
      PRESENTATION_SLIDE_MS * PRESENTATION_SLIDES,
    )
    return () => {
      window.clearInterval(slideTimer)
      window.clearTimeout(finishTimer)
    }
    // enterWebsite is guarded by a ref and intentionally stable for this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function pressEnter(): void {
    trackVisitorEvent('reel_skipped', {
      eventDetail: stage === 'presentation' ? 'Enter during presentation' : 'Enter after brochure',
      timeOnBrochureSec: brochureSeconds(),
    })
    enterWebsite()
  }

  function react(key: string, label: string): void {
    setCounts((current) => ({ ...current, [key]: (current[key] ?? 0) + 1 }))
    showToast(t('intro.thankYou'))
    trackVisitorEvent('brochure_reaction', {
      eventDetail: label,
      timeOnBrochureSec: brochureSeconds(),
    })
  }

  function openTracked(url: string, type: 'youtube_click' | 'whatsapp_click', detail: string): void {
    trackVisitorEvent(type, {
      eventDetail: detail,
      timeOnBrochureSec: brochureSeconds(),
    })
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function requestReminders(): void {
    if (remindersRequested) return
    setRemindersRequested(true)
    showToast(t('intro.remindersOn'))
    trackVisitorEvent('sunday_cta_click', {
      eventDetail: 'Get Sunday Reminders',
      timeOnBrochureSec: brochureSeconds(),
    })
    reminderTimerRef.current = window.setTimeout(() => enterWebsite('sunday-checkin'), 900)
  }

  const transition = reducedMotion ? 0.01 : 0.7
  const progress = Math.min(100, (elapsed / (INTRO_LOCK_MS + IDLE_MS)) * 100)
  const slide = slides[slideIndex]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0.01 : 0.35 }}
      className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-[#FAF7F2] px-5 py-5 text-center text-[#211D19] sm:px-10 sm:py-7"
      aria-label={stage === 'presentation' ? t('intro.presentationTitle') : t('intro.storyTitle')}
    >
      <div className="mx-auto flex w-full max-w-5xl items-start justify-between gap-3">
        <p className="pt-3 text-base font-semibold uppercase tracking-[0.18em] text-[#8A6B45]">
          Sacred Circle
        </p>
        <button
          type="button"
          disabled={locked}
          onClick={pressEnter}
          className="inline-flex min-h-[56px] items-center rounded-full border-2 border-[#77593C] px-5 text-lg font-bold shadow-calm disabled:cursor-not-allowed disabled:bg-[#FFFDF8] disabled:text-[#77593C] disabled:opacity-75 enabled:bg-[#B71C1C] enabled:text-white"
          aria-label={
            locked
              ? t('intro.enterWebsiteCountdown').replace('{seconds}', String(secondsLeft))
              : t('intro.enterWebsite')
          }
        >
          {locked
            ? t('intro.enterWebsiteCountdown').replace('{seconds}', String(secondsLeft))
            : t('intro.enterWebsite')}
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {stage === 'brochure' ? (
            <motion.div
              key="brochure"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: transition }}
              className="w-full py-5"
            >
              <p className="mb-2 text-base font-semibold uppercase tracking-[0.18em] text-[#8A6B45]">
                {t('intro.storyEyebrow')}
              </p>
              <h1 className="!text-3xl sm:!text-4xl">{t('intro.storyTitle')}</h1>
              <p className={`mt-2 text-lg font-semibold text-[#6B6357] ${isHindi ? 'devanagari' : ''}`}>
                {isHindi ? copy.foundersHi : copy.foundersEn}
              </p>

              <div className="mx-auto mt-6 flex max-w-3xl flex-col items-center gap-6 rounded-[2rem] border-2 border-[#E4D8C5] bg-[#FFFDF8] p-5 text-left shadow-calm sm:flex-row sm:p-7">
                <img
                  src={getFounderImage('clientMF')}
                  alt={copy.foundersEn}
                  className="h-32 w-32 shrink-0 rounded-full object-cover object-top sm:h-44 sm:w-44"
                />
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="text-base font-semibold uppercase tracking-wide text-[#8A6B45]">
                    {t('intro.card1Figure')}
                  </p>
                  <p className="mt-2 text-xl leading-relaxed text-[#6B6357]">
                    {isHindi ? t('intro.card1Text') : t('intro.card1Text')}
                  </p>
                </div>
              </div>

              <div className="mx-auto mt-5 grid max-w-4xl gap-4 text-left sm:grid-cols-2">
                {facts.slice(1).map((fact) => (
                  <div key={fact.titleKey} className="rounded-2xl border border-[#E4D8C5] bg-[#FFFDF8] p-5">
                    <p className="text-base font-bold uppercase tracking-wide text-[#8A6B45]">{t(fact.figureKey)}</p>
                    <h2 className="mt-2 !text-xl">{t(fact.titleKey)}</h2>
                    <p className="mt-2 text-base leading-relaxed text-[#6B6357]">{t(fact.textKey)}</p>
                  </div>
                ))}
              </div>

              <div className="mx-auto mt-6 flex max-w-4xl flex-wrap justify-center gap-3" aria-label="Brochure reactions">
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

              <div className="mx-auto mt-5 flex max-w-4xl flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => openTracked(YOUTUBE_URL, 'youtube_click', 'Full About brochure')}
                  className="inline-flex min-h-[52px] items-center gap-2 rounded-full border-2 border-[#E4D8C5] bg-[#FFFDF8] px-5 text-base font-bold text-[#211D19]"
                >
                  <Youtube size={19} aria-hidden="true" />
                  {t('intro.youtubeLibrary')}
                </button>
                <button
                  type="button"
                  onClick={() => openTracked(WHATSAPP_URL, 'whatsapp_click', 'Full About brochure')}
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

              <div className="mx-auto mt-6 max-w-xl">
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-[#E4D8C5]"
                  role="progressbar"
                  aria-label={t('intro.brochureProgress')}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress)}
                >
                  <div
                    className="h-full rounded-full bg-[#B71C1C]"
                    style={{ width: `${progress}%`, transition: reducedMotion ? 'none' : 'width 120ms linear' }}
                  />
                </div>
                <p className="mt-3 text-base font-semibold text-[#77593C]" aria-live="polite">
                  {locked
                    ? t('intro.enterWebsiteCountdown').replace('{seconds}', String(secondsLeft))
                    : `${t('intro.takeYourTime')} ${t('intro.idleCountdown').replace('{seconds}', String(5 - idleSeconds))}`}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="presentation"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: transition }}
              className="w-full py-8"
            >
              <p className="text-base font-semibold uppercase tracking-[0.18em] text-[#8A6B45]">
                {t('intro.presentationTitle')}
              </p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={slideIndex}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: reducedMotion ? 0.01 : 0.6 }}
                  className="mx-auto mt-10 max-w-4xl"
                >
                  <h1 className={`!text-3xl sm:!text-5xl ${isHindi ? 'devanagari' : ''}`}>
                    {isHindi ? slide.nameHi : slide.name}
                  </h1>
                  <p className={`mt-6 text-xl text-[#6B6357] sm:text-3xl ${isHindi ? 'devanagari' : ''}`}>
                    {isHindi ? slide.teachingHi : slide.teaching}
                  </p>
                </motion.div>
              </AnimatePresence>
              <p className="mt-12 text-base font-semibold text-[#77593C]">
                {t('intro.presentationProgress')
                  .replace('{current}', String(slideIndex + 1))
                  .replace('{total}', String(PRESENTATION_SLIDES))}
              </p>
              <div className="mx-auto mt-4 flex max-w-md gap-2" aria-hidden="true">
                {Array.from({ length: PRESENTATION_SLIDES }, (_, index) => (
                  <span
                    key={index}
                    className="h-2 flex-1 rounded-full transition-colors duration-300"
                    style={{ background: index === slideIndex ? '#B71C1C' : '#D9CBB4' }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mx-auto shrink-0 text-base font-semibold text-[#6B6357]">
        {t('intro.skipOnlyNote')}
      </p>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="pointer-events-none fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-full bg-[#2E7D32] px-6 py-3 text-lg font-bold text-white shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
