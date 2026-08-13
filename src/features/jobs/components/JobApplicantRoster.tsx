import { useState } from 'react'
import { Users, TriangleAlert } from 'lucide-react'
import type { InfiniteData } from '@tanstack/react-query'
import { JobApplicantRow } from './JobApplicantRow'
import { DecideApplicationModal } from './DecideApplicationModal'
import { JobRosterRowSkeleton } from './JobSkeleton'
import { JobErrorState, JobStateBlock } from './JobStateBlocks'
import { useJobApplicationRoster, useDecideJobApplication } from '../hooks/useJobApplications'
import { APPLICATION_STATUS_LABEL } from '../utils/display'
import type { JobApplicationResponse, JobApplicationStatus, SpringPage } from '../types'

const STATUS_ORDER: JobApplicationStatus[] = [
  'SUBMITTED',
  'REVIEWED',
  'SHORTLISTED',
  'REJECTED',
  'HIRED',
  'WITHDRAWN',
]

const CHIP_BASE =
  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap'
const CHIP_ACTIVE = 'bg-primary text-white border-primary'
const CHIP_IDLE =
  'bg-white dark:bg-[#1A1226] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2D1F4D] hover:border-primary/40 hover:text-primary'

const flatten = (
  data?: InfiniteData<SpringPage<JobApplicationResponse>>,
): JobApplicationResponse[] => data?.pages.flatMap((page) => page.content) ?? []

type DecisionTarget = Extract<JobApplicationStatus, 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED'>

/** Owner/ADMIN-only applicant roster — status-filterable, with a per-row decision action. */
export function JobApplicantRoster({ jobId }: Readonly<{ jobId: number }>) {
  const [status, setStatus] = useState<JobApplicationStatus | null>(null)
  const [pendingDecision, setPendingDecision] = useState<{
    application: JobApplicationResponse
    target: DecisionTarget
  } | null>(null)
  const query = useJobApplicationRoster(jobId, status, true)
  const decideMutation = useDecideJobApplication(jobId)

  const applications = flatten(query.data)

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
        <Users className="h-4 w-4 text-primary" />
        Applicants
      </h2>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setStatus(null)}
          className={`${CHIP_BASE} ${status === null ? CHIP_ACTIVE : CHIP_IDLE}`}
        >
          All
        </button>
        {STATUS_ORDER.map((value) => {
          const active = status === value
          return (
            <button
              key={value}
              onClick={() => setStatus(active ? null : value)}
              className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_IDLE}`}
            >
              {APPLICATION_STATUS_LABEL[value]}
            </button>
          )
        })}
      </div>

      {renderBody()}

      {pendingDecision && (
        <DecideApplicationModal
          applicantName={pendingDecision.application.applicant.displayName}
          target={pendingDecision.target}
          isPending={decideMutation.isPending}
          onCancel={() => setPendingDecision(null)}
          onConfirm={(reason) =>
            decideMutation.mutate(
              { applicationId: pendingDecision.application.id, status: pendingDecision.target, reason },
              { onSuccess: () => setPendingDecision(null) },
            )
          }
        />
      )}
    </section>
  )

  function renderBody() {
    if (query.isPending && query.fetchStatus !== 'idle') {
      return (
        <div className="space-y-2">
          <JobRosterRowSkeleton />
          <JobRosterRowSkeleton />
        </div>
      )
    }

    if (query.isError) {
      return (
        <JobErrorState
          icon={TriangleAlert}
          title="Couldn't load applicants"
          error={query.error}
          onRetry={() => query.refetch()}
        />
      )
    }

    if (applications.length === 0) {
      return (
        <JobStateBlock
          icon={Users}
          title={status ? `No ${APPLICATION_STATUS_LABEL[status].toLowerCase()} applicants` : 'No applicants yet'}
        />
      )
    }

    return (
      <>
        <div className="space-y-2">
          {applications.map((application) => (
            <JobApplicantRow
              key={application.id}
              application={application}
              isDeciding={decideMutation.isPending && decideMutation.variables?.applicationId === application.id}
              onDecide={(target) => setPendingDecision({ application, target })}
            />
          ))}
        </div>

        {query.hasNextPage && (
          <div className="text-center">
            <button
              onClick={() => query.fetchNextPage()}
              disabled={query.isFetchingNextPage}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50 dark:border-[#2D1F4D] dark:text-primary-50"
            >
              {query.isFetchingNextPage ? 'Loading…' : 'Load more applicants'}
            </button>
          </div>
        )}
      </>
    )
  }
}
