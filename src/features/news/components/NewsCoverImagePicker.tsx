import { useRef } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  ACCEPTED_NEWS_MIME,
  isAllowedNewsFile,
  isWithinNewsSizeLimit,
} from '../api/newsMediaApi'
import { NewsCoverImage } from './NewsCoverImage'
import type { PendingNewsMedia } from '../types'

interface Props {
  /** The presigned URL of the cover already on the article, if any. */
  existingUrl: string | null
  /** Staged for upload at submit, inside the 5-minute presign window. */
  pending: PendingNewsMedia | null
  onPick: (pending: PendingNewsMedia | null) => void
  /** True once the author has explicitly removed the existing cover. */
  removed: boolean
  onRemove: () => void
}

export function NewsCoverImagePicker({
  existingUrl,
  pending,
  onPick,
  removed,
  onRemove,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!isAllowedNewsFile(file)) {
      toast.error('Only JPG, PNG, GIF and WebP images can be used as a cover.')
      return
    }
    if (!isWithinNewsSizeLimit(file)) {
      toast.error('Cover images must be 50MB or smaller.')
      return
    }

    // Replacing a staged cover leaks the previous blob URL unless it's released here.
    if (pending) URL.revokeObjectURL(pending.previewUrl)
    onPick({ file, previewUrl: URL.createObjectURL(file) })
  }

  function handleRemove() {
    if (pending) URL.revokeObjectURL(pending.previewUrl)
    onPick(null)
    onRemove()
  }

  const shownUrl = pending?.previewUrl ?? (removed ? null : existingUrl)
  const hasCover = shownUrl != null

  return (
    <div>
      <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        Cover image
      </span>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_NEWS_MIME}
        onChange={handleSelect}
        aria-label="Cover image"
        className="hidden"
      />

      {hasCover ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-[#2D1F4D]">
          <NewsCoverImage src={shownUrl} alt="Article cover" />
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-medium hover:bg-black/75 transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove cover image"
              className="p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white hover:bg-red-500 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-[16/9] rounded-xl border-2 border-dashed border-gray-200 dark:border-[#2D1F4D] flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500 hover:border-primary/40 hover:text-primary transition-colors"
        >
          <ImagePlus size={24} />
          <span className="text-xs font-medium">Add a cover image</span>
        </button>
      )}
    </div>
  )
}
