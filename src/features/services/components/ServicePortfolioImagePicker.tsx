import { useRef } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  ACCEPTED_SERVICE_IMAGE_MIME,
  isAllowedServiceImageFile,
  isWithinServiceImageSizeLimit,
} from '../api/serviceMediaApi'
import { LABEL_CLASS } from '../utils/formUtils'
import type { PendingServiceImage } from '../types'

interface ServicePortfolioImagePickerProps {
  /** The presigned URL of the image already on the listing, if any. */
  existingUrl: string | null
  /** Staged for upload at submit, inside the presign window. */
  pending: PendingServiceImage | null
  onPick: (pending: PendingServiceImage | null) => void
  /** True once the provider has explicitly removed the existing image. */
  removed?: boolean
  onRemove?: () => void
}

/**
 * The single portfolio image a listing can carry. The file is staged as a blob URL and uploaded at
 * submit, not here — a presigned PUT URL is short-lived and filling in a listing form routinely
 * takes longer than that. Structural copy of `lostfound/components/LostFoundPhotoPicker.tsx`.
 */
export function ServicePortfolioImagePicker({
  existingUrl,
  pending,
  onPick,
  removed = false,
  onRemove,
}: Readonly<ServicePortfolioImagePickerProps>) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    // Reset first, so picking the same file twice in a row still fires a change event.
    e.target.value = ''
    if (!file) return

    if (!isAllowedServiceImageFile(file)) {
      toast.error('Only JPG, PNG and WebP images can be used here.')
      return
    }
    if (!isWithinServiceImageSizeLimit(file)) {
      toast.error('Images must be 5MB or smaller.')
      return
    }

    // Replacing a staged image leaks the previous blob URL unless it's released here.
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
      <span className={LABEL_CLASS}>Portfolio image</span>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_SERVICE_IMAGE_MIME}
        onChange={handleSelect}
        aria-label="Portfolio image"
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
              aria-label="Remove portfolio image"
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
          <span className="text-xs font-medium">Add a portfolio image</span>
        </button>
      )}

      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Optional — JPG, PNG or WebP, up to 5MB.</p>
    </div>
  )
}
