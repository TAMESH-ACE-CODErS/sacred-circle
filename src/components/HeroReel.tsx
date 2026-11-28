import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { copy, WHATSAPP_URL } from '../config/site'
import { getFounderImage, mediaManifest } from '../config/mediaManifest'
import { useLanguage } from '../context/LanguageContext'
import { useSiteContent } from '../hooks/useSiteContent'

export function HeroReel() {
  const { sundayTime } = useSiteContent()
  const { t, language } = useLanguage()
  const isHindi = language === 'hi'
  const name = isHindi ? copy.foundersHi : copy.foundersEn
  const teaching = isHindi ? copy.teachingHi : copy.teachingEn
  const time = isHindi ? t('sunday.time') : sundayTime

  return (
    <section id="home" className="relative overflow-hidden" aria-label={t('common.brand')}>
      <div
        className="hero-grain absolute inset-0 opacity-70"
        style={{
          backgroundImage: `linear-gradient(90deg, color-mix(in srgb, var(--bg) 94%, transparent), color-mix(in srgb, var(--bg) 74%, transparent)), url(${mediaManifest.remote.hero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden="true"
      />

      <div className="section-shell relative grid items-center gap-8 py-12 sm:gap-12 sm:py-20 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="eyebrow">{t('hero.eyebrow')}</p>

          <div className="min-h-[9.5rem] sm:min-h-[11rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={language}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 className={isHindi ? 'devanagari' : ''}>{name}</h1>
                <p
                  className={`mt-5 text-xl sm:text-2xl ${isHindi ? 'devanagari' : ''}`}
                  style={{ color: 'var(--muted)' }}
                >
                  {teaching}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="mt-4 max-w-xl text-lg" style={{ color: 'var(--muted)' }}>
            {time}. {t('hero.description')}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/sunday-meditation" className="btn-primary">
              {t('hero.join')}
              <ArrowRight size={19} />
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-secondary">
              <MessageCircle size={19} />
              {t('hero.whatsapp')}
            </a>
          </div>

          <p className="mt-6 text-base font-medium" style={{ color: 'var(--accent)' }}>
            {t('hero.freeNote')}
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-4 rounded-[2.5rem] opacity-60" style={{ background: 'var(--surface-2)' }} aria-hidden="true" />
          <img
            src={getFounderImage('clientMF')}
            alt={`${copy.foundersEn}, founders of Sacred Circle`}
            className="card relative w-full object-cover object-top !p-0 aspect-[4/5] overflow-hidden rounded-[2.25rem]"
          />
          <div className="card absolute -bottom-6 left-4 right-4 !rounded-2xl !p-4 text-center sm:left-8 sm:right-8">
            <p className="font-display text-lg">{t('hero.founders')}</p>
            <p className="text-base" style={{ color: 'var(--muted)' }}>{t('hero.guideRole')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
