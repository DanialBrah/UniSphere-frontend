import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { NewsMediaResponse } from '../types'

interface Props {
  media: NewsMediaResponse[]
}

export function NewsMediaGallery({ media }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const sorted = [...media].sort((a, b) => a.sortOrder - b.sortOrder)
  const total = sorted.length

  useEffect(() => {
    if (lightboxIndex === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i === null ? i : Math.min(total - 1, i + 1)))
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i === null ? i : Math.max(0, i - 1)))
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightboxIndex, total])

  if (total === 0) return null

  const active = lightboxIndex !== null ? sorted[lightboxIndex] : null

  return (
    <>
      <div
        className={[
          'grid gap-2 my-6',
          total === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3',
        ].join(' ')}
      >
        {sorted.map((item, index) =>
          item.mediaType === 'VIDEO' ? (
            <video
              key={item.id}
              src={item.mediaUrl}
              controls
              preload="metadata"
              className="w-full rounded-xl bg-black/5 dark:bg-black/20 aspect-video object-contain"
            />
          ) : (
            <button
              key={item.id}
              onClick={() => setLightboxIndex(index)}
              className="block rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label="Open image"
            >
              <img
                src={item.mediaUrl}
                alt=""
                loading="lazy"
                className={[
                  'w-full object-cover hover:opacity-90 transition-opacity',
                  total === 1 ? 'max-h-[28rem]' : 'aspect-square',
                ].join(' ')}
              />
            </button>
          ),
        )}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            aria-label="Close"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={18} />
          </button>

          {total > 1 && lightboxIndex! > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex((i) => (i === null ? i : i - 1))
              }}
              aria-label="Previous image"
              className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {total > 1 && lightboxIndex! < total - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex((i) => (i === null ? i : i + 1))
              }}
              aria-label="Next image"
              className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          )}

          <img
            src={active.mediaUrl}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-xl object-contain"
          />

          {total > 1 && (
            <div className="absolute bottom-5 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-medium">
              {lightboxIndex! + 1} / {total}
            </div>
          )}
        </div>
      )}
    </>
  )
}
