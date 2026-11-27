import { useEffect, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { copy } from '../config/site'
import { getFounderImage } from '../config/mediaManifest'

const introLines = [
  { name: copy.foundersEn, teaching: copy.teachingEn, devanagari: false },
  { name: copy.foundersHi, teaching: copy.teachingHi, devanagari: true },
]

// Drawn from the founders' own about page at sacredcirclegroup.com/about.
const aboutCards = [
  {
    figure: '28 years',
    title: 'A life of practice',
    text: 'Diwakar and Lina have studied scientific principles and spiritual methods together for nearly three decades.',
  },
  {
    figure: 'IIT Madras · Nagpur',
    title: 'Grounded in learning',
    text: 'Diwakar holds an M.Tech. from IIT Madras; Lina holds an M.Sc. from the Institute of Science, Nagpur.',
  },
  {
    figure: '100+ modalities',
    title: 'Many paths, one circle',
    text: 'Rich experience from spiritual trainings in India and abroad, distilled into techniques that are easy to learn.',
  },
  {
    figure: 'Always free',
    title: 'Every Sunday, open to all',
    text: 'Their awakening and teaching are shared quietly, as seva — no fee, no registration, no prior experience needed.',
  },
]

type Props = { onEnter: () => void }

export function EntryReel({ onEnter }: Props) {
  const [stage, setStage] = useState<'intro' | 'about'>('intro')
  const [lineIndex, setLineIndex] = useState(0)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (stage !== 'intro') return
    const cycle = window.setInterval(() => setLineIndex((i) => (i + 1) % introLines.length), 6500)
    const advance = window.setTimeout(() => setStage('about'), 13000)
    return () => {
      window.clearInterval(cycle)
      window.clearTimeout(advance)
    }
  }, [stage])

  useEffect(() => {
    const onKeyDown = () => onEnter()
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onEnter])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onEnter()
    }
  }

  const line = introLines[lineIndex]
  const fade = reducedMotion ? 0.01 : 0.9

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label="Tap anywhere to enter the website"
      onClick={onEnter}
      onKeyDown={handleKeyDown}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: fade }}
      className="fixed inset-0 z-[100] flex cursor-pointer flex-col overflow-y-auto px-6 py-10 text-center sm:px-10"
      style={{ background: '#FAF6EE', color: '#211D19' }}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {stage === 'intro' ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: reducedMotion ? 0.01 : 1.1 }}
              className="flex flex-col items-center"
            >
              <p className="mb-8 text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: '#8A6B45' }}>
                Sacred Circle
              </p>
              <div className="min-h-[9rem] sm:min-h-[12rem]" aria-live="polite">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={lineIndex}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: reducedMotion ? 0.01 : 1.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p
                      className={
                        line.devanagari
                          ? 'devanagari font-display text-[2.4rem] leading-tight sm:text-[4rem]'
                          : 'font-display text-[2.4rem] leading-tight sm:text-[4rem]'
                      }
                    >
                      {line.name}
                    </p>
                    <p
                      className={
                        line.devanagari
                          ? 'devanagari mt-6 text-xl sm:text-3xl'
                          : 'mt-6 text-xl sm:text-3xl'
                      }
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
                    className="h-2.5 w-2.5 rounded-full transition-colors duration-700"
                    style={{ background: i === lineIndex ? '#B71C1C' : '#D9CBB4' }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0.01 : 1.1 }}
              className="w-full"
            >
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: '#8A6B45' }}>
                Our story
              </p>
              <h2 className="font-display text-3xl sm:text-4xl">Two lives of practice, shared gently</h2>

              <div className="mx-auto mt-8 w-full max-w-xs overflow-hidden rounded-3xl border-2 p-2" style={{ borderColor: '#E4D8C5' }}>
                <img
                  src={getFounderImage('clientMF')}
                  alt="Diwakar Raipur and Lina Bhave, founders of Sacred Circle"
                  className="block aspect-[5/3] w-full rounded-2xl object-cover object-top"
                />
              </div>

              <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-2">
                {aboutCards.map((card, i) => (
                  <motion.article
                    key={card.figure}
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: reducedMotion ? 0.01 : 0.8,
                      delay: reducedMotion ? 0 : 0.25 + i * 0.45,
                    }}
                    className="rounded-3xl border p-5 text-left sm:p-6"
                    style={{ background: '#FFFDF8', borderColor: '#E4D8C5' }}
                  >
                    <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#8A6B45' }}>
                      {card.figure}
                    </p>
                    <h3 className="mt-2 font-display text-xl">{card.title}</h3>
                    <p className="mt-2 text-base" style={{ color: '#6B6357' }}>
                      {card.text}
                    </p>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mx-auto mt-8 shrink-0 text-lg font-semibold" style={{ color: '#211D19' }}>
        Tap anywhere to enter the website
      </p>
    </motion.div>
  )
}
