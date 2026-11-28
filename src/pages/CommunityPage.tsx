import { Link } from 'react-router-dom'
import { ArrowRight, Mail, MessageCircle, Youtube } from 'lucide-react'
import { PageHero } from '../components/PageHero'
import { SectionHeading } from '../components/SectionHeading'
import { useSiteContent } from '../hooks/useSiteContent'
import { useLanguage } from '../context/LanguageContext'
import { mediaManifest } from '../config/mediaManifest'
import type { TranslationKey } from '../i18n/translations'

type Channel = {
  icon: typeof MessageCircle
  title: TranslationKey
  text: TranslationKey
  label: string
  href: string
}

export function CommunityPage() {
  const { contact, sundayTime } = useSiteContent()
  const { t, language } = useLanguage()

  const channels: Channel[] = [
    {
      icon: MessageCircle,
      title: 'communityPage.c1Title',
      text: 'communityPage.c1Text',
      label: t('communityPage.c1Label'),
      href: contact.whatsapp,
    },
    {
      icon: Youtube,
      title: 'communityPage.c2Title',
      text: 'communityPage.c2Text',
      label: t('communityPage.c2Label'),
      href: contact.youtube,
    },
    {
      icon: Mail,
      title: 'communityPage.c3Title',
      text: 'communityPage.c3Text',
      label: contact.email,
      href: `mailto:${contact.email}`,
    },
  ]

  return (
    <>
      <PageHero
        eyebrow={t('communityPage.heroEyebrow')}
        title={t('communityPage.heroTitle')}
        description={`${t('communityPage.heroDescription')} ${language === 'hi' ? t('sunday.time') : sundayTime.toLowerCase()}.`}
        image={mediaManifest.remote.awareness}
        imageAlt="A peaceful outdoor meditation setting"
      >
        <Link to="/sunday-meditation" className="btn-primary">{t('communityPage.join')}</Link>
      </PageHero>

      <section className="section-shell">
        <SectionHeading
          eyebrow={t('communityPage.channelsEyebrow')}
          title={t('communityPage.channelsTitle')}
          description={t('communityPage.channelsDescription')}
          centered
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {channels.map(({ icon: Icon, title, text, label, href }) => (
            <article key={title} className="card flex flex-col">
              <span
                className="inline-flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
              >
                <Icon size={22} aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-2xl">{t(title)}</h3>
              <p className="mt-3 flex-1 text-base" style={{ color: 'var(--muted)' }}>{t(text)}</p>
              <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="btn-secondary mt-6 w-full !text-base">
                {label} <ArrowRight size={17} />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell !pt-12">
        <div className="soft-panel grid items-center gap-6 lg:grid-cols-2">
          <div>
            <p className="eyebrow">{t('communityPage.fromChannelEyebrow')}</p>
            <h2 className="!text-3xl">{t('communityPage.fromChannelTitle')}</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--muted)' }}>
              {t('communityPage.fromChannelDescription')}
            </p>
            <a href={contact.youtube} target="_blank" rel="noreferrer" className="btn-primary mt-7">
              <Youtube size={18} /> {t('communityPage.openYouTube')}
            </a>
          </div>
          <div className="card overflow-hidden !p-2">
            <iframe
              src="https://www.youtube.com/embed/fbtixdu4RUY"
              title={t('communityPage.iframeTitle')}
              className="aspect-video w-full rounded-2xl border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  )
}
