import { useState } from 'react'
import { CalendarDays, Clock3, HeartHandshake, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SectionHeading } from './SectionHeading'
import { mediaManifest } from '../config/mediaManifest'
import { useLanguage } from '../context/LanguageContext'
import { useSiteContent } from '../hooks/useSiteContent'
import { WHATSAPP_URL } from '../config/site'
import type { TranslationKey } from '../i18n/translations'

const details: { icon: typeof CalendarDays; title: TranslationKey; text: TranslationKey }[] = [
  { icon: CalendarDays, title: 'sunday.d1Title', text: 'sunday.d1Text' },
  { icon: Clock3, title: 'sunday.d2Title', text: 'sunday.d2Text' },
  { icon: HeartHandshake, title: 'sunday.d3Title', text: 'sunday.d3Text' },
  { icon: Video, title: 'sunday.d4Title', text: 'sunday.d4Text' },
]

export function SundaySection() {
  const { sundayTime } = useSiteContent()
  const { t, language } = useLanguage()
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <section id="sunday" className="section-shell !py-12 sm:!py-20">
      <div className="overflow-hidden rounded-[2.5rem] border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[280px] lg:min-h-full">
            {imageFailed ? (
              <div className="absolute inset-0" style={{ background: 'var(--surface-2)' }} aria-hidden="true" />
            ) : (
              <img
                src={mediaManifest.remote.sunday}
                alt={language === 'hi' ? 'प्राकृतिक प्रकाश में शांत ध्यान' : 'A person meditating quietly in natural light'}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                onError={() => setImageFailed(true)}
              />
            )}
          </div>
          <div className="p-8 sm:p-12">
            <SectionHeading
              eyebrow={t('sunday.eyebrow')}
              title={t('sunday.title')}
              description={t('sunday.description')}
            />
            <p className="mt-6 font-display text-xl" style={{ color: 'var(--accent-strong)' }}>
              {language === 'hi' ? t('sunday.time') : sundayTime} · {t('common.online')} · {t('common.free')}
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {details.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-3">
                  <Icon size={22} className="mt-1 shrink-0" style={{ color: 'var(--accent)' }} aria-hidden="true" />
                  <div>
                    <h3 className="font-display text-lg">{t(title)}</h3>
                    <p className="text-base" style={{ color: 'var(--muted)' }}>{t(text)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-primary">
                {t('sunday.zoom')}
              </a>
              <Link to="/materials" className="btn-secondary">{t('sunday.library')}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
