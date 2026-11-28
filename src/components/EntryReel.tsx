import { useEffect, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { copy } from '../config/site'
import { getFounderImage } from '../config/mediaManifest'
import { useLanguage } from '../context/LanguageContext'
import type { TranslationKey } from '../i18n/translations'

const introLines = [
  { name: copy.foundersEn, teaching: copy.teachingEn, devanagari: false },
  { name: copy.foundersHi, teaching: copy.teachingHi, devanagari: true },
]

// From the founders' own about page at sacredcirclegroup.com/about.
const aboutCards: { figure: TranslationKey; title: TranslationKey; text: TranslationKey }[] = [
  { figure: 'intro.card1Figure', title: 'intro.card1Title', text: 'intro.card1Text' },
  { figure: 'intro.card2Figure', title: 'intro.card2Title', text: 'intro.card2Text' },
  { figure: 'intro.card3Figure', title: 'intro.card3Title', text: 'intro.card3Text' },
  { figure: 'intro.card4Figure', title: 'intro.card4Title', text: 'intro.card4Text' },
]

const REEL_MS = 1800 * introLines.length // 3.6s bilingual reel
const BROCHURE_MS = 5000 // compulsory five-second brochure

type Props = { onEnter: () => void }

export function EntryReel({ onEnter }: Props) {
  const [stage, setStage] = useState<'reel' | 'brochure'>('reel')
  const [lineIndex, setLineIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(5)
  const [canContinue, setCanContinue] = useState(false)
  const reducedMotion = useReducedMotion()
  const { t, language } = useLanguage()

  useEffect(() => {
    if (stage !== 'reel') return
    const cycle = window.setInterval(
      () => setLineIndex((i) => (i + 1) % introLines.length),
      1800,
    )
    const advance = window.setTimeout(() => setStage('brochure'), REEL_MS)
    return () => {
      window.clearInterval(cycle)
      window.clearTimeout(advance)
    }
  }, [stage])

  useEffect(() => {
    if (stage !== 'brochure') return
    const startedAt = performance.now()
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - startedAt
      setProgress(Math.min(100, (elapsed / BROCHURE_MS) * 100))
      setSecondsLeft(Math.max(0, Math.ceil((BROCHURE_MS - elapsed) / 1000)))
      if (elapsed >= BROCHURE_MS) {
        window.clearInterval(timer)
        setCanContinue(true)
        onEnter()
      }
    }, 100)
    return () => window.clearInterval(timer)
  }, [stage, onEnter])

  function continueToSite() {
    if (canContinue) onEnter()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!canContinue) return
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
      event.preventDefault()
      onEnter()
    }
  }

  const line = introLines[lineIndex]
  const duration = reducedMotion ? 0.01 : 0.75
  const founderLine = language === 'hi' ? copy.foundersHi : copy.foundersEn

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={canContinue ? t('common.tapAnywhere') : t('common.introPlaying')}
      aria-disabled={!canContinue}
      onClick={continueToSite}
      onKeyDown={handleKeyDown}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0.01 : 0.9 }}
      className="fixed inset-0 z-[100] flex cursor-default flex-col overflow-y-auto px-5 py-20 text-center sm:px-10"
      style={{ background: '#FAF6EE', color: '#211D19' }}
    >
      <button
        type="button"
        disabled={!canContinue}
        onClick={(event) => {
          event.stopPropagation()
          continueToSite()
        }}
        className="absolute right-4 top-4 z-10 inline-flex min-h-[52px] items-center gap-2 rounded-full border-2 px-5 text-lg font-semibold shadow-calm disabled:cursor-not-allowed disabled:opacity-60 sm:right-8 sm:top-6"
        style={{ background: '#FFFDF8', borderColor: '#77593C', color: '#77593C' }}
        aria-label={canContinue ? t('common.enterSite') : t('common.introPlaying')}
      >
        {canContinue ? t('common.enterSite') : `${t('common.pleaseWait')} ${secondsLeft}s`}
        <ArrowRight size={20} aria-hidden="true" />
      </button>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {stage === 'reel' ? (
            <motion.div
              key="reel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration }}
              className="flex flex-col items-center"
            >
              <p className="mb-8 text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: '#8A6B45' }}>
                Sacred Circle
              </p>
              <div className="min-h-[10rem] sm:min-h-[13rem]" aria-live="polite">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={lineIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p
                      className={
                        line.devanagari
                          ? 'devanagari font-display text-[2.2rem] leading-tight sm:text-[3.8rem]'
                          : 'font-display text-[2.2rem] leading-tight sm:text-[3.8rem]'
                      }
                    >
                      {line.name}
                    </p>
                    <p
                      className={line.devanagari ? 'devanagari mt-6 text-xl sm:text-3xl' : 'mt-6 text-xl sm:text-3xl'}
                      style={{ color: '#6B6357' }}
                    >
                      {line.teaching}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="mt-8 flex gap-3" aria-hidden="true">
                {introLines.map((_, i) => (
                  <span
                    key={i}
                    className="h-2.5 w-2.5 rounded-full transition-colors duration-500"
                    style={{ background: i === lineIndex ? '#B71C1C' : '#D9CBB4' }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="brochure"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.7 }}
              className="w-full"
            >
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: '#8A6B45' }}>
                {t('intro.storyEyebrow')}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl">{t('intro.storyTitle')}</h2>

              <div
                className="mx-auto mt-7 w-full max-w-xs overflow-hidden rounded-3xl border-2 p-2"
                style={{ borderColor: '#E4D8C5' }}
              >
                <img
                  src={getFounderImage('clientMF')}
                  alt={`${copy.foundersEn}, founders of Sacred Circle`}
                  className="block aspect-[5/3] w-full rounded-2xl object-cover object-top"
                />
                <p className={`mt-2 pb-1 text-base font-semibold ${language === 'hi' ? 'devanagari' : ''}`}>
                  {founderLine}
                </p>
              </div>

              <div className="mx-auto mt-7 grid max-w-4xl gap-4 sm:grid-cols-2">
                {aboutCards.map((card, i) => (
                  <motion.article
                    key={card.figure}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: reducedMotion ? 0.01 : 0.6,
                      delay: reducedMotion ? 0 : 0.15 + i * 0.35,
                    }}
                    className="rounded-3xl border p-5 text-left sm:p-6"
                    style={{ background: '#FFFDF8', borderColor: '#E4D8C5' }}
                  >
                    <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#8A6B45' }}>
                      {t(card.figure)}
                    </p>
                    <h3 className="mt-2 font-display text-xl">{t(card.title)}</h3>
                    <p className="mt-2 text-base" style={{ color: '#6B6357' }}>
                      {t(card.text)}
                    </p>
                  </motion.article>
                ))}
              </div>

              <div className="mx-auto mt-7 max-w-xl">
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full"
                  style={{ background: '#E4D8C5' }}
                  role="progressbar"
                  aria-label={t('intro.brochureProgress')}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress)}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${progress}%`,
                      background: '#B71C1C',
                      transition: reducedMotion ? 'none' : 'width 100ms linear',
                    }}
                  />
                </div>
                <p className="mt-3 text-base font-semibold" style={{ color: '#77593C' }} aria-live="polite">
                  {t('intro.continueIn').replace('{seconds}', String(secondsLeft))}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mx-auto mt-6 shrink-0 text-lg font-semibold" style={{ color: '#211D19' }}>
        {stage === 'reel' ? t('common.introPlaying') : t('intro.brochureNote')}
      </p>
    </motion.div>
  )
}
