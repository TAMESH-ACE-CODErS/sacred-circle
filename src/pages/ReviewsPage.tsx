import { PageHero } from '../components/PageHero'
import { ReviewsSection } from '../components/ReviewsSection'
import { getReviewerImage } from '../config/mediaManifest'

export function ReviewsPage() {
  return (
    <>
      <PageHero
        eyebrow="Community experiences"
        title="In their own words"
        description="Some people have kindly shared what changed for them. We offer these as honest experiences, not promises — every path unfolds differently."
        image={getReviewerImage('reviewerMF') ?? undefined}
        imageAlt=""
      />
      <ReviewsSection />
    </>
  )
}
