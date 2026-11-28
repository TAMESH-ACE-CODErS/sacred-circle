import { Link } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { AnnouncementsSection } from '../components/AnnouncementsSection'
import { mediaManifest } from '../config/mediaManifest'
import { useLanguage } from '../context/LanguageContext'

export function AnnouncementsPage() {
  const { t } = useLanguage()

  return (
    <>
      <PageHero
        eyebrow={t('announcementsPage.heroEyebrow')}
        title={t('announcementsPage.heroTitle')}
        description={t('announcementsPage.heroDescription')}
        image={mediaManifest.remote.healing}
        imageAlt="A calm natural landscape"
      >
        <Link to="/sunday-meditation" className="btn-primary">{t('announcementsPage.join')}</Link>
      </PageHero>
      <AnnouncementsSection />
    </>
  )
}
