import { useRef } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  ACCEPTED_LOST_FOUND_MIME,
  isAllowedLostFoundFile,
  isWithinLostFoundSizeLimit,
} from '../api/lostFoundMediaApi'
import { LF_MEDIA_MAX } from '../schemas'
import { LABEL_CLASS } from '../utils/formUtils'
import type { LostFoundMediaResponse, PendingLostFoundMedia } from '../types'

interface LostFoundMediaPickerProps {
  /** Media already attached to the item. Removal is by id, sent as `removeMediaIds`. */
  existing: LostFoundMediaResponse[]
  removedIds: number[]
  onRemoveExisting: (mediaId: number) => void
  pending: PendingLostFoundMedia[]
  onPendingChange: (pending: PendingLostFoundMedia[]) => void
}

/**
 * The extra-photos gallery, capped at the server's ten per item.
 *
 * Existing media and staged files are counted together against the cap, because the server
 * validates the post-update total rather than the number being added.
 */
export function LostFoundMediaPicker({
  existing,
  removedIds,
  onRemoveExisting,
  pending,
  onPendingChange,
}: Readonly<LostFoundMediaPickerProps>) {
  const inputRef = useRef<HTMLInputElement>(null)

  const keptExisting = existing.filter((media) => !removedIds.includes(media.id))
  const total = keptExisting.length + pending.length
  const remaining = LF_MEDIA_MAX - total

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])]
    e.target.value = ''
    if (files.length === 0) return

    const accepted: PendingLostFoundMedia[] = []
    for (const file of files) {
      if (accepted.length >= remaining) {
        toast.error(`You can attach up to ${LF_MEDIA_MAX} photos in total.`)
        break
      }
      if (!isAllowedLostFoundFile(file)) {
        toast.error(`${file.name} isn't a supported file type.`)
        continue
      }
      if (!isWithinLostFoundSizeLimit(file)) {
        toast.error(`${file.name} is larger than 50MB.`)
        continue
      }
      accepted.push({ file, previewUrl: URL.createObjectURL(file) })
    }

    if (accepted.length > 0) onPendingChange([...pending, ...accepted])
  }

  function removePending(index: number) {
    // Release the blob URL before dropping the reference, or it leaks for the page's lifetime.
    URL.revokeObjectURL(pending[index].previewUrl)
    onPendingChange(pending.filter((_, i) => i !== index))
  }

  return (
    <div>
      <span className={LABEL_CLASS}>More photos (optional)</span>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_LOST_FOUND_MIME}
        onChange={handleSelect}
        aria-label="Additional photos"
        className="hidden"
      />

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {keptExisting.map((media) => (
          <div
            key={media.id}
            className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 dark:border-[#2D1F4D]"
          >
            <img src={media.mediaUrl} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onRemoveExisting(media.id)}
              aria-label="Remove photo"
              className="absolute right-1 top-1 rounded-lg bg-black/60 p-1 text-white backdrop-blur-sm transition-colors hover:bg-red-500"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}

        {pending.map((item, index) => (
          <div
            key={item.previewUrl}
            className="relative aspect-square overflow-hidden rounded-xl border border-primary/40"
          >
            <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removePending(index)}
              aria-label="Remove staged photo"
              className="absolute right-1 top-1 rounded-lg bg-black/60 p-1 text-white backdrop-blur-sm transition-colors hover:bg-red-500"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}

        {remaining > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 transition-colors hover:border-primary/40 hover:text-primary dark:border-[#2D1F4D] dark:text-gray-500"
          >
            <Plus size={18} />
            <span className="text-[10px] font-medium">Add</span>
          </button>
        )}
      </div>

      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
        {total} of {LF_MEDIA_MAX} used. Extra photos are hidden from other people on a found item
        until you approve their claim.
      </p>
    </div>
  )
}
