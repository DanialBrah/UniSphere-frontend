import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { LABEL_CLASS, inputClass } from '../utils/formUtils'

const REASON_MAX = 255

interface RemoveAttendeeModalProps {
  attendeeName: string
  isPending: boolean
  onConfirm: (reason: string | undefined) => void
  onCancel: () => void
}

/**
 * Organizer/admin removing someone else's registration — the one cancel path that takes an
 * optional reason (`EventRegistrationStatusUpdateRequest.reason`), since it's surfaced in the
 * `EVENT_REGISTRATION_REMOVED` notification sent to the person removed. A self-cancel never goes
 * through this modal — see `ConfirmModal`, used everywhere the registrant cancels their own spot.
 */
export function RemoveAttendeeModal({
  attendeeName,
  isPending,
  onConfirm,
  onCancel,
}: Readonly<RemoveAttendeeModalProps>) {
  const [reason, setReason] = useState('')

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
      aria-labelledby="remove-attendee-title"
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-[#2D1F4D] dark:bg-[#130D22]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="remove-attendee-title" className="mb-1.5 text-base font-semibold text-gray-900 dark:text-white">
          Remove {attendeeName}?
        </h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          They're notified immediately, with the note below if you leave one. If they were
          registered (not waitlisted), the next person in line is promoted to their seat.
        </p>

        <div>
          <label htmlFor="remove-attendee-reason" className={LABEL_CLASS}>
            Reason (optional)
          </label>
          <textarea
            id="remove-attendee-reason"
            rows={3}
            maxLength={REASON_MAX}
            placeholder="No longer eligible, duplicate registration, etc."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={inputClass()}
          />
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 disabled:opacity-50 dark:border-[#2D1F4D] dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason.trim() || undefined)}
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Remove
          </button>
        </div>
      </div>
    </dialog>
  )
}
