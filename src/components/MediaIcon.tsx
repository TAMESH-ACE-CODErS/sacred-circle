import { AudioLines, PlayCircle } from 'lucide-react'

export function MediaIcon({ mediaType }: { mediaType: string }) {
  return mediaType === 'audio' ? (
    <AudioLines size={18} aria-hidden="true" />
  ) : (
    <PlayCircle size={18} aria-hidden="true" />
  )
}
