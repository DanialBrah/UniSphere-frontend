import { useRef } from 'react'
import { FileText, Trash2, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
import { ACCEPTED_RESUME_MIME, isAllowedResumeFile, isWithinResumeSizeLimit } from '../api/jobMediaApi'
import { LABEL_CLASS } from '../utils/formUtils'

interface JobResumePickerProps {
  /** Staged for upload at Apply submit — the presigned PUT window is ~5 minutes. */
  file: File | null
  onPick: (file: File | null) => void
  error?: string
}

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * The single required résumé for an Easy Apply submission. No preview — a document has nothing to
 * render inline, unlike `EventCoverPicker`'s image — just a filename/size chip plus Replace/Remove.
 */
export function JobResumePicker({ file, onPick, error }: Readonly<JobResumePickerProps>) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    // Reset first, so picking the same file twice in a row still fires a change event.
    e.target.value = ''
    if (!picked) return

    if (!isAllowedResumeFile(picked)) {
      toast.error('Only PDF, DOC and DOCX files can be used here.')
      return
    }
    if (!isWithinResumeSizeLimit(picked)) {
      toast.error('Résumés must be 10MB or smaller.')
      return
    }

    onPick(picked)
  }

  return (
    <div>
      <span className={LABEL_CLASS}>
        Résumé / CV <span className="text-red-500">*</span>
      </span>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_RESUME_MIME}
        onChange={handleSelect}
        aria-label="Résumé"
        className="hidden"
      />

      {file ? (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 dark:border-[#2D1F4D]">
          <FileText className="h-8 w-8 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatBytes(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:text-primary dark:text-gray-400"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={() => onPick(null)}
            aria-label="Remove résumé"
            className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:text-red-500"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 text-gray-400 transition-colors hover:border-primary/40 hover:text-primary dark:text-gray-500 ${
            error ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-[#2D1F4D]'
          }`}
        >
          <UploadCloud size={22} />
          <span className="text-xs font-medium">Upload PDF, DOC or DOCX</span>
        </button>
      )}

      {error && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{error}</p>}
      {!error && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          Uploaded when you submit — max 10MB.
        </p>
      )}
    </div>
  )
}
