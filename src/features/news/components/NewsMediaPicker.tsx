import { useRef } from 'react'
import { Film, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  ACCEPTED_NEWS_MIME,
  isAllowedNewsFile,
  isWithinNewsSizeLimit,
} from '../api/newsMediaApi'
import { NEWS_MEDIA_MAX } from '../schemas'
import type { NewsMediaResponse, PendingNewsMedia } from '../types'

interface Props {
  /** Media already attached to the article and not marked for removal. */
  existing: NewsMediaResponse[]
  onRemoveExisting: (mediaId: number) => void
  pending: PendingNewsMedia[]
  onChangePending: (files: PendingNewsMedia[]) => void
}

/**
 * Files are held locally and uploaded at submit, not on select — the presigned PUT URL is only
 * valid for five minutes, and an article routinely takes longer than that to write.
 *
 * Preview URLs are created here, in the change handler, and travel with the file. Deriving them
 * in a hook breaks under StrictMode, where the effect's cleanup revokes the URL between the two
 * mounts and the thumbnail renders blank.
 */
export function NewsMediaPicker({
  existing,
  onRemoveExisting,
  pending,
  onChangePending,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const total = existing.length + pending.length
  const atLimit = total >= NEWS_MEDIA_MAX

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return

    const accepted: File[] = []
    for (const file of files) {
      if (!isAllowedNewsFile(file)) {
        toast.error(`${file.name}: only JPG, PNG, GIF, WebP, MP4 and MOV are supported.`)
        continue
      }
      // The presigned PUT has no server-side size gate, so an oversized file would upload
      // successfully to storage and then be useless. Catch it here instead.
      if (!isWithinNewsSizeLimit(file)) {
        toast.error(`${file.name} is larger than 50MB.`)
        continue
      }
      accepted.push(file)
    }

    const room = NEWS_MEDIA_MAX - total
    if (accepted.length > room) {
      toast.error(`An article can have at most ${NEWS_MEDIA_MAX} files.`)
    }

    const added: PendingNewsMedia[] = accepted.slice(0, room).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    onChangePending([...pending, ...added])
  }

  function handleRemovePending(index: number) {
    const item = pending[index]
    if (item) URL.revokeObjectURL(item.previewUrl)
    onChangePending(pending.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        Gallery
      </label>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_NEWS_MIME}
        onChange={handleSelect}
        className="hidden"
      />

      <div className="grid grid-cols-3 gap-2">
        {existing.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-[#2D1F4D] bg-gray-50 dark:bg-[#130D22]"
          >
            {item.mediaType === 'VIDEO' ? (
              <div className="w-full h-full flex items-center justify-center">
                <Film size={20} className="text-gray-400" />
              </div>
            ) : (
              <img src={item.mediaUrl} alt="" className="w-full h-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => onRemoveExisting(item.id)}
              aria-label="Remove media"
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500 transition-colors"
            >
              <X size={11} />
            </button>
          </div>
        ))}

        {pending.map((item, index) => (
          <div
            key={item.previewUrl}
            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-[#2D1F4D] bg-gray-50 dark:bg-[#130D22]"
          >
            {item.file.type.startsWith('video') ? (
              <div className="w-full h-full flex items-center justify-center">
                <Film size={20} className="text-gray-400" />
              </div>
            ) : (
              <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => handleRemovePending(index)}
              aria-label="Remove file"
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500 transition-colors"
            >
              <X size={11} />
            </button>
          </div>
        ))}

        {!atLimit && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-200 dark:border-[#2D1F4D] flex items-center justify-center text-gray-400 hover:border-primary/40 hover:text-primary transition-colors"
            aria-label="Add media"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      <p className="mt-1.5 text-[11px] text-gray-400 dark:text-gray-500">
        {total}/{NEWS_MEDIA_MAX} files. Uploaded when you save. Reordering isn&rsquo;t supported —
        remove and re-add.
      </p>
    </div>
  )
}
