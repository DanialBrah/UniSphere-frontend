import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PostMedia } from '../types'

interface Props {
  media: PostMedia[]
}

export function MediaGrid({ media }: Props) {
  const [index, setIndex] = useState(0)

  if (media.length === 0) return null

  const sorted = [...media].sort((a, b) => a.sortOrder - b.sortOrder)
  const total = sorted.length
  const safeIndex = Math.min(index, total - 1)

  function goTo(i: number) {
    setIndex(Math.max(0, Math.min(total - 1, i)))
  }

  const item = sorted[safeIndex]

  return (
    <div className="relative rounded-xl overflow-hidden bg-black/5 dark:bg-black/20 select-none">
      {/* Slide */}
      <div className="relative aspect-[4/3]">
        {item.mediaType === 'VIDEO' ? (
          <video
            key={item.id}
            src={item.mediaUrl}
            controls
            className="w-full h-full object-contain"
          />
        ) : (
          <img
            key={item.id}
            src={item.mediaUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </div>

      {total > 1 && (
        <>
          {/* Prev */}
          <button
            onClick={() => goTo(safeIndex - 1)}
            disabled={safeIndex === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-opacity disabled:opacity-0 hover:bg-black/70"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Next */}
          <button
            onClick={() => goTo(safeIndex + 1)}
            disabled={safeIndex === total - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-opacity disabled:opacity-0 hover:bg-black/70"
          >
            <ChevronRight size={16} />
          </button>

          {/* Counter badge */}
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
            {safeIndex + 1} / {total}
          </div>

          {/* Dot indicators */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {sorted.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-200 ${
                  i === safeIndex
                    ? 'w-4 h-1.5 bg-white'
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
