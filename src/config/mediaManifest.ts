import clientM1 from '../assets/media/clientM-warm.jpg'
import clientF1 from '../assets/media/clientF-warm.jpg'
import clientMF1 from '../assets/media/clientMF-warm.jpg'
import reviewerM1 from '../assets/media/reviewerM-1.jpg'
import reviewerMF1 from '../assets/media/reviewerMF-1.jpg'
import reviewerF1 from '../assets/media/reviewerF-1.jpg'
import reviewerF2 from '../assets/media/reviewerF-2.jpg'
import reviewerF3 from '../assets/media/reviewerF-3.jpg'
import reviewerF4 from '../assets/media/reviewerF-4.jpg'
import logo from '../assets/media/sacred-circle-logo.svg'

/**
 * Central media registry. Add a photo to src/assets/media/ and one line here —
 * every section of the site picks it up automatically.
 * Keys follow the required convention: clientM / clientF / clientMF and
 * reviewerM / reviewerF / reviewerMF, with numeric suffixes for multiples.
 */
export const mediaManifest = {
  logo,
  founders: {
    clientM: [clientM1],
    clientF: [clientF1],
    clientMF: [clientMF1],
  },
  reviewers: {
    reviewerM: [reviewerM1],
    reviewerF: [reviewerF1, reviewerF2, reviewerF3, reviewerF4],
    reviewerMF: [reviewerMF1],
  },
  // Public imagery from the reference site, kept as zero-cost remote URLs.
  remote: {
    hero:
      'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?auto=format&fit=crop&w=1920',
    sunday:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200',
    healing:
      'https://images.unsplash.com/photo-1505455184862-554165e5f6ba?auto=format&fit=crop&w=1000',
    manifestation:
      'https://images.unsplash.com/photo-1534630103086-5b1c106f74e0?auto=format&fit=crop&w=1000',
    awareness:
      'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?auto=format&fit=crop&w=1200',
  },
}

type FounderKey = keyof typeof mediaManifest.founders
type ReviewerKey = keyof typeof mediaManifest.reviewers

export function getFounderImage(key: FounderKey, index = 0): string {
  const list = mediaManifest.founders[key]
  return list[index % list.length] ?? mediaManifest.founders.clientMF[0]
}

export function getReviewerImage(key: string, index = 0): string | null {
  const safeKey = (key in mediaManifest.reviewers ? key : 'reviewerF') as ReviewerKey
  const list = mediaManifest.reviewers[safeKey]
  if (!list.length) return getFounderImage('clientMF')
  return list[index % list.length] ?? null
}
