import { useRef } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  ACCEPTED_LOST_FOUND_MIME,
  isAllowedLostFoundFile,
  isWithinLostFoundSizeLimit,
} from '../api/lostFoundMediaApi'
import { LABEL_CLASS } from '../utils/formUtils'
import type { PendingLostFoundMedia } from '../types'

interface LostFoundPhotoPickerProps {
  label: string
  hint?: string
  /** The presigned URL of the photo already on the item, if any. */
  existingUrl: string | null
  /** Staged for upload at submit, inside the 5-minute presign window. */
  pending: PendingLostFoundMedia | null
  onPick: (pending: PendingLostFoundMedia | null) => void
  /** True once the reporter has explicitly removed the existing photo. */
  removed?: boolean
  onRemove?: () => void
}

/**
 * The single main photo for an item, or the proof image on a claim.
 *
 * The file is staged as a blob URL and uploaded at submit, not here: a presigned PUT URL expires
 * after five minutes and filling in a report routinely takes longer than that.
 */
export function LostFoundPhotoPicker({
  label,
  hint,
  existingUrl,
  pending,
  onPick,
  removed = false,
  onRemove,
}: Readonly<LostFoundPhotoPickerProps>) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    // Reset first, so picking the same file twice in a row still fires a change event.
    e.target.value = ''
    if (!file) return

    if (!isAllowedLostFoundFile(file)) {
      toast.error('Only JPG, PNG, GIF and WebP images can be used here.')
      return
    }
    if (!isWithinLostFoundSizeLimit(file)) {
      toast.error('Images must be 50MB or smaller.')
      return
    }

    // Replacing a staged photo leaks the previous blob URL unless it's released here.
    if (pending) URL.revokeObjectURL(pending.previewUrl)
    onPick({ file, previewUrl: URL.createObjectURL(file) })
  }

  function handleRemove() {
    if (pending) URL.revokeObjectURL(pending.previewUrl)
    onPick(null)
    onRemove?.()
  }

  const shownUrl = pending?.previewUrl ?? (removed ? null : existingUrl)

  return (
    <div>
      <span className={LABEL_CLASS}>{label}</span>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_LOST_FOUND_MIME}
        onChange={handleSelect}
        aria-label={label}
        className="hidden"
      />

      {shownUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-[#2D1F4D]">
          <img src={shownUrl} alt="" className="aspect-[16/9] w-full object-cover" />
          <div className="absolute right-2 top-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/75"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              aria-label={`Remove ${label.toLowerCase()}`}
              className="rounded-lg bg-black/60 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-red-500"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 transition-colors hover:border-primary/40 hover:text-primary dark:border-[#2D1F4D] dark:text-gray-500"
        >
          <ImagePlus size={24} />
          <span className="text-xs font-medium">Add a photo</span>
        </button>
      )}

      {hint && <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  )
}
