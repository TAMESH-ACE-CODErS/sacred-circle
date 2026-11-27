import { PageHero } from '../components/PageHero'
import { MaterialsGallery } from '../components/MaterialsGallery'
import { mediaManifest } from '../config/mediaManifest'
import { WHATSAPP_URL } from '../config/site'

export function MaterialsPage() {
  return (
    <>
      <PageHero
        eyebrow="Materials library"
        title="Practise at your own pace"
        description="Short videos, guided recordings and a gentle Aum practice. Most items are open to everyone; a few are PIN-protected and shared in the Sunday session."
        image={mediaManifest.remote.healing}
        imageAlt="A calm natural landscape"
      >
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-primary">
          Ask for the session PIN
        </a>
      </PageHero>

      <section className="section-shell">
        <MaterialsGallery />
      </section>
    </>
  )
}
