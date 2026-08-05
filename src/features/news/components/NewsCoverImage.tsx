import { useState } from 'react'
import { Newspaper } from 'lucide-react'

interface Props {
  src: string | null
  alt: string
  /** 16/9 on cards, 21/9 for the full-bleed detail header. */
  aspect?: '16/9' | '21/9'
  className?: string
}

/**
 * Cover URLs are presigned and expire after about an hour, so an open tab will eventually get
 * a 403 on the image. Rendering the placeholder on error keeps that from showing as a broken
 * image icon — the query's refetchOnWindowFocus re-mints the URL when the user comes back.
 */
export function NewsCoverImage({ src, alt, aspect = '16/9', className = '' }: Props) {
  // Remembers *which* source failed rather than a bare boolean, so picking a new image after a
  // load error clears the placeholder on its own — no effect needed to reset the flag.
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const failed = src != null && src === failedSrc

  const aspectClass = aspect === '21/9' ? 'aspect-[21/9]' : 'aspect-[16/9]'

  if (!src || failed) {
    return (
      <div
        className={`${aspectClass} ${className} bg-gradient-to-br from-primary-50 to-primary-100 dark:from-[#1A1226] dark:to-[#2D1F4D] flex items-center justify-center`}
      >
        <Newspaper size={32} className="text-primary/40" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailedSrc(src)}
      className={`${aspectClass} ${className} w-full object-cover`}
    />
  )
}
