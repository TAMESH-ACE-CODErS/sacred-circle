import type { Material } from '../types'
import { mediaManifest } from './mediaManifest'

/**
 * Fallback library built from public media on sacredcirclegroup.com.
 * When Supabase is configured these rows are replaced by `public_materials`.
 * Locked rows intentionally carry no media_url — the URL only arrives from
 * the verify_material_pin RPC after a correct PIN.
 */
export const materialSeeds: Material[] = [
  {
    id: 'welcome-video',
    title: 'Welcome to Sacred Circle',
    description:
      'A short introduction to our free Sunday meditation community and the path of healing, manifestation and awareness.',
    media_type: 'video',
    media_url: 'https://www.youtube.com/embed/fbtixdu4RUY',
    thumbnail_url: 'https://i.ytimg.com/vi/fbtixdu4RUY/hqdefault.jpg',
    category: 'Introduction',
    is_locked: false,
  },
  {
    id: 'experience-chai',
    title: 'An experience from Chai, USA',
    description: 'A participant shares her journey with the healing techniques.',
    media_type: 'video',
    media_url:
      'https://assets.zyrosite.com/mP4pkzQZ3KIeX7Da/rec1-YX4bj83jNEhg4VQo.mp4',
    thumbnail_url: mediaManifest.reviewers.reviewerMF[0],
    category: 'Experiences',
    is_locked: false,
  },
  {
    id: 'experience-2',
    title: 'An experience in our community',
    description: 'A participant shares what changed after regular meditation.',
    media_type: 'video',
    media_url:
      'https://assets.zyrosite.com/mP4pkzQZ3KIeX7Da/rec2-YBg4jqR731Hr7Zpy.mp4',
    thumbnail_url: mediaManifest.remote.sunday,
    category: 'Experiences',
    is_locked: false,
  },
  {
    id: 'experience-3',
    title: 'An experience in our community',
    description: 'A participant shares what changed after regular meditation.',
    media_type: 'video',
    media_url:
      'https://assets.zyrosite.com/mP4pkzQZ3KIeX7Da/rec3-dOq4Z9RbQ5fMOZo2.mp4',
    thumbnail_url: mediaManifest.remote.healing,
    category: 'Experiences',
    is_locked: false,
  },
  {
    id: 'experience-4',
    title: 'An experience in our community',
    description: 'A participant shares what changed after regular meditation.',
    media_type: 'video',
    media_url:
      'https://assets.zyrosite.com/mP4pkzQZ3KIeX7Da/rec4-A854MaRqOGfoOEq4.mp4',
    thumbnail_url: mediaManifest.remote.manifestation,
    category: 'Experiences',
    is_locked: false,
  },
  {
    id: 'experience-priyanka',
    title: 'An experience from Priyanka',
    description: 'A participant shares her experience of the meditations.',
    media_type: 'video',
    media_url:
      'https://assets.zyrosite.com/mP4pkzQZ3KIeX7Da/priyanka-exp-m2Wq6re1qMcQzwkp.mp4',
    thumbnail_url: mediaManifest.remote.awareness,
    category: 'Experiences',
    is_locked: false,
  },
  {
    id: 'aum-resonance',
    title: 'Aum — Gentle Resonance',
    description:
      'A soft, slow tone for quiet settling. Keep the volume low and let it fade into the background.',
    media_type: 'audio',
    media_url: '/audio/aum-soft.wav',
    thumbnail_url: mediaManifest.founders.clientMF[0],
    category: 'Audio',
    is_locked: false,
  },
  {
    id: 'sunday-recording-demo',
    title: 'Sunday Recording — PIN Demo',
    description:
      'A sample locked item so the PIN flow can be tested. Set or remove its PIN from the admin board.',
    media_type: 'audio',
    media_url: null,
    thumbnail_url: mediaManifest.remote.sunday,
    category: 'Sunday Recordings',
    is_locked: true,
  },
]
