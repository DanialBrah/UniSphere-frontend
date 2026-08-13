import { useState } from 'react'
import { ClipboardCheck } from 'lucide-react'
import { ConfirmModal } from './ConfirmModal'
import { JobApplicationStatusBadge } from './JobBadges'
import { JobResumeLink } from './JobResumeLink'
import { useMyJobApplication, useWithdrawJobApplication } from '../hooks/useJobApplications'
import { canWithdrawApplication } from '../utils/permissions'
import { formatJobDateTime } from '../utils/dateUtils'
import { useAuth } from '../../../hooks/useAuth'
import type { JobApplicationStatus } from '../types'

const PANEL = 'rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-[#2D1F4D] dark:bg-white/5'

interface JobApplicationStatusBannerProps {
  jobId: number
  status: JobApplicationStatus
}

/** "You applied — status: X" — shown whenever `job.viewerApplicationStatus` is non-null. */
export function JobApplicationStatusBanner({ jobId, status }: Readonly<JobApplicationStatusBannerProps>) {
  const { user } = useAuth()
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)
  const { data: application } = useMyJobApplication(jobId, true)
  const withdrawMutation = useWithdrawJobApplication(jobId)

  const canWithdraw = application ? canWithdrawApplication(user, application) : false

  return (
    <div className={PANEL}>
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          You applied to this job
        </p>
        <JobApplicationStatusBadge status={status} />
      </div>

      {application?.decisionReason && (
        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          &ldquo;{application.decisionReason}&rdquo;
        </p>
      )}

      {application?.withdrawnAt && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Withdrawn {formatJobDateTime(application.withdrawnAt)}
        </p>
      )}

      {application && (
        <div className="mt-3">
          <JobResumeLink resumeUrl={application.resumeUrl} />
        </div>
      )}

      {canWithdraw && application && (
        <button
          type="button"
          onClick={() => setShowWithdrawConfirm(true)}
          className="mt-3 text-xs font-medium text-gray-500 underline-offset-2 hover:underline dark:text-gray-400"
        >
          Withdraw application
        </button>
      )}

      {showWithdrawConfirm && application && (
        <ConfirmModal
          title="Withdraw your application?"
          body="The employer will no longer see you as an active applicant. This cannot be undone."
          confirmLabel="Withdraw"
          destructive
          isPending={withdrawMutation.isPending}
          onConfirm={() =>
            withdrawMutation.mutate(application.id, { onSuccess: () => setShowWithdrawConfirm(false) })
          }
          onCancel={() => setShowWithdrawConfirm(false)}
        />
      )}
    </div>
  )
}
