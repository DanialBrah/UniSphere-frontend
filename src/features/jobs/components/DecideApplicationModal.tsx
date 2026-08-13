import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { LABEL_CLASS, inputClass } from '../utils/formUtils'
import { APPLICATION_STATUS_LABEL } from '../utils/display'
import { JOB_APPLICATION_REASON_MAX } from '../schemas'
import type { JobApplicationStatus } from '../types'

interface DecideApplicationModalProps {
  applicantName: string
  target: Extract<JobApplicationStatus, 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED'>
  isPending: boolean
  onConfirm: (reason: string | undefined) => void
  onCancel: () => void
}

/**
 * Employer/ADMIN deciding on one applicant, with an optional reason surfaced in the
 * `JOB_APPLICATION_STATUS_CHANGED` notification the applicant receives. Copy of
 * `RemoveAttendeeModal`'s optional-reason `<dialog>` shape; destructive styling only for Reject.
 */
export function DecideApplicationModal({
  applicantName,
  target,
  isPending,
  onConfirm,
  onCancel,
}: Readonly<DecideApplicationModalProps>) {
  const [reason, setReason] = useState('')
  const destructive = target === 'REJECTED'

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
      aria-labelledby="decide-application-title"
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-[#2D1F4D] dark:bg-[#130D22]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="decide-application-title" className="mb-1.5 text-base font-semibold text-gray-900 dark:text-white">
          {APPLICATION_STATUS_LABEL[target]} {applicantName}?
        </h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          They're notified immediately, with the note below if you leave one.
        </p>

        <div>
          <label htmlFor="decide-application-reason" className={LABEL_CLASS}>
            Reason (optional)
          </label>
          <textarea
            id="decide-application-reason"
            rows={3}
            maxLength={JOB_APPLICATION_REASON_MAX}
            placeholder="Not enough experience for this role, great fit for the next round, etc."
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
            className={[
              'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50',
              destructive ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-700',
            ].join(' ')}
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {APPLICATION_STATUS_LABEL[target]}
          </button>
        </div>
      </div>
    </dialog>
  )
}
