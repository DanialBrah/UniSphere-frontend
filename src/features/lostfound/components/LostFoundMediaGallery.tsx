import { ImageOff, Lock } from 'lucide-react'
import type { LostFoundItemResponse } from '../types'

/**
 * The item's photo gallery, and the explainer that replaces it when the privacy guard has emptied
 * it.
 *
 * On a FOUND item the server returns `media: []` to anyone without an approved claim while still
 * sending `primaryImageUrl` — one photo is enough to recognise something, a full gallery is enough
 * to fake a claim. An unexplained empty section reads as "the reporter didn't bother", which is
 * both wrong and discouraging.
 */
export function LostFoundMediaGallery({ item }: Readonly<{ item: LostFoundItemResponse }>) {
  // Only a FOUND item is ever masked, and `coordinatesApproximate` is exactly the "unprivileged
  // viewer" condition the server used when it decided to withhold.
  const isWithheld = item.itemType === 'FOUND' && item.coordinatesApproximate

  if (item.media.length === 0) {
    if (!isWithheld) return null

    return (
      <div className="flex items-center gap-2.5 rounded-2xl border border-gray-200 bg-white p-4 text-sm dark:border-[#2D1F4D] dark:bg-[#1A1226]">
        <Lock className="h-4 w-4 shrink-0 text-primary" />
        <p className="text-gray-600 dark:text-gray-400">
          More photos of this item are shown once your claim is approved.
        </p>
      </div>
    )
  }

  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Photos</h2>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {item.media.map((media) =>
          media.mediaType === 'VIDEO' ? (
            <video
              key={media.id}
              // Presigned URL, ~60 min expiry — the query refetches on window focus to re-mint it.
              src={media.mediaUrl}
              controls
              className="aspect-square w-full rounded-xl bg-black object-cover"
            >
              <track kind="captions" />
            </video>
          ) : (
            <a
              key={media.id}
              href={media.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-square overflow-hidden rounded-xl border border-gray-200 dark:border-[#2D1F4D]"
            >
              <img
                src={media.mediaUrl}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </a>
          ),
        )}
      </div>
    </section>
  )
}

/** Placeholder used by the detail header when an item has no main photo at all. */
export function LostFoundImageFallback() {
  return (
    <div className="flex aspect-[16/9] w-full items-center justify-center rounded-2xl bg-gray-100 text-gray-300 dark:bg-white/5 dark:text-white/20">
      <ImageOff size={32} />
    </div>
  )
}
