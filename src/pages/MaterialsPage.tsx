import { PageHero } from '../components/PageHero'
import { MaterialsGallery } from '../components/MaterialsGallery'
import { mediaManifest } from '../config/mediaManifest'
import { WHATSAPP_URL } from '../config/site'
import { useLanguage } from '../context/LanguageContext'

export function MaterialsPage() {
  const { t } = useLanguage()

  return (
    <>
      <PageHero
        eyebrow={t('materials.heroEyebrow')}
        title={t('materials.heroTitle')}
        description={t('materials.heroDescription')}
        image={mediaManifest.remote.healing}
        imageAlt="A calm natural landscape"
      >
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-primary">
          {t('materials.pinCta')}
        </a>
      </PageHero>

      <section className="section-shell">
        <MaterialsGallery />
      </section>
    </>
  )
}
