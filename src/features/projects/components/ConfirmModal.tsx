import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface ConfirmModalProps {
  title: string
  body: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  isPending?: boolean
  destructive?: boolean
}

/**
 * Same chrome as the app's other modals — backdrop, Escape to dismiss, stop-propagation body.
 *
 * The repo has no shared modal primitive and no cross-feature component imports anywhere —
 * features share types, not UI. This is a local copy, matching the existing precedent in Jobs,
 * Events, News, Communities and Lost & Found.
 */
export function ConfirmModal({
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
  isPending = false,
  destructive = false,
}: Readonly<ConfirmModalProps>) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <dialog
      open
      aria-labelledby="project-confirm-title"
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-[#2D1F4D] dark:bg-[#130D22]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="project-confirm-title"
          className="mb-1.5 text-base font-semibold text-gray-900 dark:text-white"
        >
          {title}
        </h3>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">{body}</p>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 disabled:opacity-50 dark:border-[#2D1F4D] dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={[
              'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50',
              destructive ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-700',
            ].join(' ')}
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}
