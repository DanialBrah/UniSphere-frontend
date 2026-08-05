import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface Props {
  title: string
  body: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  isPending?: boolean
  destructive?: boolean
}

/** Same chrome as the app's other modals — backdrop, Escape to dismiss, stop-propagation body. */
export function ConfirmModal({
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
  isPending = false,
  destructive = false,
}: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-[#130D22] rounded-2xl border border-gray-200 dark:border-[#2D1F4D] shadow-xl w-full max-w-sm p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{body}</p>

        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-[#2D1F4D] text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={[
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50',
              destructive ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-700',
            ].join(' ')}
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
