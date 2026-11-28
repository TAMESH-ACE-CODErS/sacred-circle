import { PageHero } from '../components/PageHero'
import { EventsSection } from '../components/EventsSection'
import { mediaManifest } from '../config/mediaManifest'
import { useLanguage } from '../context/LanguageContext'

export function EventsPage() {
  const { t } = useLanguage()

  return (
    <>
      <PageHero
        eyebrow={t('eventsPage.heroEyebrow')}
        title={t('eventsPage.heroTitle')}
        description={t('eventsPage.heroDescription')}
        image={mediaManifest.remote.awareness}
        imageAlt="A peaceful outdoor meditation setting"
      />
      <EventsSection />
    </>
  )
}
