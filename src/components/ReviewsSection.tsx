import { Link } from 'react-router-dom'
import { Quote } from 'lucide-react'
import { SectionHeading } from './SectionHeading'
import { useSiteContent } from '../hooks/useSiteContent'
import { getReviewerImage } from '../config/mediaManifest'

const hasDevanagari = (text: string) => /[\u0900-\u097F]/.test(text)

export function ReviewsSection({ limit }: { limit?: number }) {
  const { reviews } = useSiteContent()
  const shown = typeof limit === 'number' ? reviews.slice(0, limit) : reviews

  return (
    <section id="reviews" className="section-shell">
      <SectionHeading
        eyebrow="Experiences from the circle"
        title="Words shared by our community"
        description="These are the experiences people chose to share, in their own words and in their own language."
        centered
      />

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {shown.map((review, i) => (
          <figure key={review.id} className="card flex flex-col gap-5">
            <Quote size={28} style={{ color: 'var(--accent)' }} aria-hidden="true" />
            <blockquote
              className={`flex-1 whitespace-pre-line text-base leading-[1.75] ${hasDevanagari(review.review_text) ? 'devanagari' : ''}`}
            >
              {review.review_text}
            </blockquote>
            <figcaption className="flex items-center gap-4 border-t pt-5" style={{ borderColor: 'var(--border)' }}>
              <img
                src={getReviewerImage(review.avatar_key, i) ?? undefined}
                alt=""
                loading="lazy"
                className="h-14 w-14 shrink-0 rounded-full object-cover"
              />
              <span className="font-medium">{review.reviewer_name}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {limit !== undefined && reviews.length > limit && (
        <div className="mt-10 text-center">
          <Link to="/reviews" className="btn-secondary">Read all experiences</Link>
        </div>
      )}
    </section>
  )
}
