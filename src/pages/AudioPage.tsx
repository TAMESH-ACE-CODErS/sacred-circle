import { PageHero } from '../components/PageHero'
import { AudioLibrary } from '../components/AudioLibrary'
import { mediaManifest } from '../config/mediaManifest'
import { useLanguage } from '../context/LanguageContext'

export function AudioPage() {
  const { t } = useLanguage()

  return (
    <>
      <PageHero
        eyebrow={t('audioPage.heroEyebrow')}
        title={t('audioPage.heroTitle')}
        description={t('audioPage.heroDescription')}
        image={mediaManifest.remote.healing}
        imageAlt="A calm place to listen"
      />
      <AudioLibrary />
    </>
  )
}
