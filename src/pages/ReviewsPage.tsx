import { PageHero } from '../components/PageHero'
import { ReviewsSection } from '../components/ReviewsSection'
import { getReviewerImage } from '../config/mediaManifest'
import { useLanguage } from '../context/LanguageContext'

export function ReviewsPage() {
  const { t } = useLanguage()

  return (
    <>
      <PageHero
        eyebrow={t('reviewsPage.heroEyebrow')}
        title={t('reviewsPage.heroTitle')}
        description={t('reviewsPage.heroDescription')}
        image={getReviewerImage('reviewerMF') ?? undefined}
        imageAlt=""
      />
      <ReviewsSection />
    </>
  )
}
