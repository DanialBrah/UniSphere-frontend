import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, TriangleAlert } from 'lucide-react'
import type { InfiniteData } from '@tanstack/react-query'
import { MyJobApplicationCard } from './MyJobApplicationCard'
import { JobRosterRowSkeleton } from './JobSkeleton'
import { JobErrorState, JobStateBlock } from './JobStateBlocks'
import { useMyJobApplications } from '../hooks/useJobApplications'
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

/** The "My applications" tab — every application the caller has submitted, across every job. */
export function MyJobApplicationsList() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<JobApplicationStatus | null>(null)
  const query = useMyJobApplications(status)

  const applications = flatten(query.data)

  return (
    <div className="space-y-4">
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
    </div>
  )

  function renderBody() {
    if (query.isPending && query.fetchStatus !== 'idle') {
      return (
        <div className="space-y-3">
          <JobRosterRowSkeleton />
          <JobRosterRowSkeleton />
        </div>
      )
    }

    if (query.isError) {
      return (
        <JobErrorState
          icon={TriangleAlert}
          title="Couldn't load your applications"
          error={query.error}
          onRetry={() => query.refetch()}
        />
      )
    }

    if (applications.length === 0) {
      return (
        <JobStateBlock
          icon={ClipboardList}
          title={status ? `No ${APPLICATION_STATUS_LABEL[status].toLowerCase()} applications` : 'No applications yet'}
          hint="When you Easy Apply to a job, it shows up here."
          actionLabel="Browse jobs"
          onAction={() => navigate('/jobs')}
        />
      )
    }

    return (
      <>
        <div className="space-y-3">
          {applications.map((application) => (
            <MyJobApplicationCard key={application.id} application={application} />
          ))}
        </div>

        {query.hasNextPage && (
          <div className="text-center">
            <button
              onClick={() => query.fetchNextPage()}
              disabled={query.isFetchingNextPage}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2D1F4D] dark:text-primary-50"
            >
              {query.isFetchingNextPage ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </>
    )
  }
}
