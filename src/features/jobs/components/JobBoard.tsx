import { motion } from 'framer-motion'
import { Briefcase, TriangleAlert } from 'lucide-react'
import { JobCard } from './JobCard'
import { JobGridSkeleton } from './JobSkeleton'
import { JobErrorState, JobStateBlock } from './JobStateBlocks'
import { stagger } from '../../../lib/animations'
import type { JobSummaryResponse } from '../types'

interface JobBoardProps {
  jobs: JobSummaryResponse[]
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  emptyTitle: string
  emptyHint?: string
  emptyActionLabel?: string
  onEmptyAction?: () => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
}

/**
 * The single skeleton -> error -> empty -> cards -> load-more sequence, shared by every list
 * surface: Browse, search results and My Postings.
 */
export function JobBoard({
  jobs,
  isLoading,
  isError,
  error,
  onRetry,
  emptyTitle,
  emptyHint,
  emptyActionLabel,
  onEmptyAction,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: Readonly<JobBoardProps>) {
  if (isLoading) return <JobGridSkeleton />

  if (isError) {
    return (
      <JobErrorState icon={TriangleAlert} title="Couldn't load these jobs" error={error} onRetry={onRetry} />
    )
  }

  if (jobs.length === 0) {
    return (
      <JobStateBlock
        icon={Briefcase}
        title={emptyTitle}
        hint={emptyHint}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    )
  }

  return (
    <>
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid gap-4 sm:grid-cols-2">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </motion.div>

      {hasNextPage && onLoadMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2D1F4D] dark:text-primary-50"
          >
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </>
  )
}
