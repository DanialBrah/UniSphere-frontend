import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmModal } from './ConfirmModal'
import { ProjectApplicationStatusBadge } from './ProjectBadges'
import { useWithdrawProjectApplication } from '../hooks/useProjectApplications'
import { canWithdrawApplication } from '../utils/permissions'
import { formatProjectDateTime } from '../utils/dateUtils'
import { useAuth } from '../../../hooks/useAuth'
import type { ProjectApplicationResponse } from '../types'

/** One row in "My applications" — spans every project the caller has ever applied to. */
export function MyProjectApplicationCard({ application }: Readonly<{ application: ProjectApplicationResponse }>) {
  const { user } = useAuth()
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)
  const withdrawMutation = useWithdrawProjectApplication(application.projectId)

  const canWithdraw = canWithdrawApplication(user, application)

  return (
    <article className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            to={`/projects/${application.projectId}`}
            className="block truncate text-sm font-semibold text-gray-900 hover:text-primary dark:text-white"
          >
            {application.projectTitle ?? 'Untitled project'}
          </Link>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Applied for {application.roleTitle ?? 'a role'} · {formatProjectDateTime(application.createdAt)}
          </p>
        </div>
        <ProjectApplicationStatusBadge status={application.status} />
      </div>

      {application.message && (
        <p className="whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-300">{application.message}</p>
      )}

      {application.decisionReason && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          &ldquo;{application.decisionReason}&rdquo;
        </p>
      )}

      {canWithdraw && (
        <button
          onClick={() => setShowWithdrawConfirm(true)}
          className="block text-xs font-medium text-gray-500 underline-offset-2 hover:underline dark:text-gray-400"
        >
          Withdraw application
        </button>
      )}

      {showWithdrawConfirm && (
        <ConfirmModal
          title="Withdraw your application?"
          body="The project owner will no longer see you as an active applicant. This cannot be undone."
          confirmLabel="Withdraw"
          destructive
          isPending={withdrawMutation.isPending}
          onConfirm={() =>
            withdrawMutation.mutate(application.id, { onSuccess: () => setShowWithdrawConfirm(false) })
          }
          onCancel={() => setShowWithdrawConfirm(false)}
        />
      )}
    </article>
  )
}
