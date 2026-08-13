import { useRef } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  ACCEPTED_PROJECT_COVER_MIME,
  isAllowedProjectCoverFile,
  isWithinProjectCoverSizeLimit,
} from '../api/projectMediaApi'
import { LABEL_CLASS } from '../utils/formUtils'
import type { PendingProjectCover } from '../types'

interface ProjectCoverPickerProps {
  /** The presigned URL of the cover image already on the project, if any. */
  existingUrl: string | null
  /** Staged for upload at submit, inside the ~5-minute presign window. */
  pending: PendingProjectCover | null
  onPick: (pending: PendingProjectCover | null) => void
  /** True once the owner has explicitly removed the existing cover. */
  removed?: boolean
  onRemove?: () => void
}

/**
 * The single optional cover image for a project.
 *
 * The file is staged as a blob URL and uploaded at submit, not here: a presigned PUT URL expires
 * after about five minutes and filling in the project form routinely takes longer than that. Same
 * pattern as `EventCoverPicker`.
 */
export function ProjectCoverPicker({
  existingUrl,
  pending,
  onPick,
  removed = false,
  onRemove,
}: Readonly<ProjectCoverPickerProps>) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    // Reset first, so picking the same file twice in a row still fires a change event.
    e.target.value = ''
    if (!file) return

    if (!isAllowedProjectCoverFile(file)) {
      toast.error('Only JPG, PNG and WebP images can be used here.')
      return
    }
    if (!isWithinProjectCoverSizeLimit(file)) {
      toast.error('Images must be 5MB or smaller.')
      return
    }

    // Replacing a staged cover leaks the previous blob URL unless it's released here.
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
      <span className={LABEL_CLASS}>Cover image</span>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_PROJECT_COVER_MIME}
        onChange={handleSelect}
        aria-label="Cover image"
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
              aria-label="Remove cover image"
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
          <span className="text-xs font-medium">Add a cover image</span>
        </button>
      )}

      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
        Optional. Shown on the project card and detail page.
      </p>
    </div>
  )
}
