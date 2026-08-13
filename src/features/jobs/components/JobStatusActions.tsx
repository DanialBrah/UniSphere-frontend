import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Pencil, Trash2, XCircle } from 'lucide-react'
import { ConfirmModal } from './ConfirmModal'
import { useChangeJobStatus, useDeleteJob } from '../hooks/useJobMutations'
import { allowedJobStatusTargets, hasApplications } from '../utils/permissions'
import type { JobResponse, JobStatus } from '../types'

const ACTION_BUTTON =
  'inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary/40 hover:text-primary dark:border-[#2D1F4D] dark:text-primary-50'
const DISABLED_BUTTON =
  'inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-400 opacity-60 dark:border-[#2D1F4D] dark:text-gray-500'

type JobUserStatusTarget = Extract<JobStatus, 'OPEN' | 'CLOSED' | 'FILLED'>

/**
 * Copy for each transition the FSM allows. DRAFT never appears as a target — it's only the
 * starting state. CLOSED and FILLED are both terminal and irreversible, so both get the
 * destructive `ConfirmModal` treatment, unlike Events where only CANCELLED was destructive.
 */
const ACTION_COPY: Record<JobUserStatusTarget, { label: string; title: string; body: string; icon: typeof CheckCircle2 }> = {
  OPEN: {
    label: 'Publish',
    title: 'Publish this job?',
    body: 'It becomes visible on the browse feed, search and "My Postings", and applications open.',
    icon: CheckCircle2,
  },
  CLOSED: {
    label: 'Close',
    title: 'Close this job?',
    body: 'Every in-pipeline applicant is notified. This cannot be undone.',
    icon: XCircle,
  },
  FILLED: {
    label: 'Mark as filled',
    title: 'Mark this job as filled?',
    body: 'Every in-pipeline applicant is notified. This cannot be undone.',
    icon: CheckCircle2,
  },
}

/**
 * Owner/ADMIN controls: the status transitions the server will actually accept, plus edit and
 * delete. Rendered only when `job.canModify` is true — that flag is computed server-side from the
 * same rule the API enforces, so it is the honest gate.
 */
export function JobStatusActions({ job }: Readonly<{ job: JobResponse }>) {
  const navigate = useNavigate()
  const [pendingStatus, setPendingStatus] = useState<JobUserStatusTarget | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const changeStatus = useChangeJobStatus(job.id)
  const deleteJob = useDeleteJob()

  const targets = allowedJobStatusTargets(job.status)
  const blockedByApplications = hasApplications(job)

  return (
    <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Manage this posting</h2>

      <div className="flex flex-wrap gap-2">
        {targets.map((target) => {
          const { label, icon: Icon } = ACTION_COPY[target]
          return (
            <button key={target} onClick={() => setPendingStatus(target)} className={ACTION_BUTTON}>
              <Icon className="h-4 w-4" />
              {label}
            </button>
          )
        })}

        <button onClick={() => navigate(`/jobs/${job.id}/edit`)} className={ACTION_BUTTON}>
          <Pencil className="h-4 w-4" />
          Edit
        </button>

        <button
          onClick={() => !blockedByApplications && setConfirmDelete(true)}
          disabled={blockedByApplications}
          title={blockedByApplications ? 'Close this job first — it has received applications' : undefined}
          className={blockedByApplications ? DISABLED_BUTTON : `${ACTION_BUTTON} hover:!border-red-400 hover:!text-red-500`}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      {blockedByApplications && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          This job has received applications — close it instead of deleting it.
        </p>
      )}

      {pendingStatus && (
        <ConfirmModal
          title={ACTION_COPY[pendingStatus].title}
          body={ACTION_COPY[pendingStatus].body}
          confirmLabel={ACTION_COPY[pendingStatus].label}
          destructive={pendingStatus === 'CLOSED' || pendingStatus === 'FILLED'}
          isPending={changeStatus.isPending}
          onCancel={() => setPendingStatus(null)}
          onConfirm={() =>
            changeStatus.mutate({ status: pendingStatus }, { onSettled: () => setPendingStatus(null) })
          }
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete this job posting?"
          body="It disappears from the board straight away. This cannot be undone."
          confirmLabel="Delete"
          destructive
          isPending={deleteJob.isPending}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() =>
            deleteJob.mutate(job.id, {
              onSuccess: () => navigate('/jobs', { replace: true }),
              onError: () => setConfirmDelete(false),
            })
          }
        />
      )}
    </section>
  )
}
