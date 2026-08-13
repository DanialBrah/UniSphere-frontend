import { useState } from 'react'
import { ExternalLink, Info } from 'lucide-react'
import { JobApplyModal } from './JobApplyModal'
import { JobApplicationStatusBanner } from './JobApplicationStatusBanner'
import { useAuth } from '../../../hooks/useAuth'
import type { JobResponse } from '../types'

const PANEL = 'rounded-2xl border p-4'
const NEUTRAL_PANEL = `${PANEL} border-gray-200 bg-gray-50 dark:border-[#2D1F4D] dark:bg-white/5`

function NoticePanel({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={NEUTRAL_PANEL}>
      <p className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{children}</span>
      </p>
    </div>
  )
}

/** `applicationMode` is EXTERNAL — always an outbound link, never an in-app form. */
function ExternalApplyPanel({ url }: Readonly<{ url: string | null }>) {
  return (
    <div className={`${PANEL} border-gray-200 dark:border-[#2D1F4D]`}>
      <a
        href={url ?? '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
      >
        Apply on employer's site
        <ExternalLink className="h-4 w-4" />
      </a>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        This job's applications are handled outside UniSphere.
      </p>
    </div>
  )
}

/**
 * The detail page's apply CTA — a small state machine over `job.status`, `job.applicationMode` and
 * `job.viewerApplicationStatus`, dispatching to one panel per state. The direct Jobs analogue of
 * `EventRegistrationPanel`.
 */
export function JobApplyPanel({ job }: Readonly<{ job: JobResponse }>) {
  const { user, role } = useAuth()
  const [showApplyModal, setShowApplyModal] = useState(false)
  const isOwner = user?.id === job.employer.employerId

  if (job.status === 'DRAFT') {
    return <NoticePanel>This job is still a draft. Publish it from the Manage tab to start accepting applications.</NoticePanel>
  }

  if (job.status === 'CLOSED' || job.status === 'FILLED') {
    return (
      <>
        <div className={`${PANEL} border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10`}>
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            {job.status === 'FILLED' ? 'This position has been filled.' : 'This job is closed.'}
          </p>
        </div>
        {job.viewerApplicationStatus && (
          <div className="mt-3">
            <JobApplicationStatusBanner jobId={job.id} status={job.viewerApplicationStatus} />
          </div>
        )}
      </>
    )
  }

  // job.status === 'OPEN' from here.

  if (job.viewerApplicationStatus) {
    return <JobApplicationStatusBanner jobId={job.id} status={job.viewerApplicationStatus} />
  }

  if (isOwner) {
    return (
      <NoticePanel>
        You're the employer for this posting, so there's nothing to apply for here — see the Manage
        tab for applicants.
      </NoticePanel>
    )
  }

  if (job.applicationMode === 'EXTERNAL') {
    return <ExternalApplyPanel url={job.externalApplyUrl} />
  }

  if (role !== 'STUDENT' && role !== 'ALUMNI') {
    return <NoticePanel>Only students and alumni can apply to jobs.</NoticePanel>
  }

  return (
    <>
      <div className={`${PANEL} border-gray-200 dark:border-[#2D1F4D]`}>
        <button
          type="button"
          onClick={() => setShowApplyModal(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          Easy Apply
        </button>
      </div>

      {showApplyModal && (
        <JobApplyModal jobId={job.id} jobTitle={job.title} onClose={() => setShowApplyModal(false)} />
      )}
    </>
  )
}
