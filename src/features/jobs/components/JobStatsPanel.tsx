import { TriangleAlert } from 'lucide-react'
import { JobStatsSkeleton } from './JobSkeleton'
import { JobErrorState } from './JobStateBlocks'
import { useJobStats } from '../hooks/useJobQueries'

const TILE = 'rounded-2xl border border-gray-200 bg-white p-3.5 dark:border-[#2D1F4D] dark:bg-[#1A1226]'

/** Owner/ADMIN-only per-job breakdown — `GET /jobs/{id}/stats`. */
export function JobStatsPanel({ jobId }: Readonly<{ jobId: number }>) {
  const { data: stats, isPending, isError, error, refetch } = useJobStats(jobId, true)

  if (isPending) return <JobStatsSkeleton />

  if (isError) {
    return <JobErrorState icon={TriangleAlert} title="Couldn't load stats" error={error} onRetry={() => refetch()} />
  }

  if (!stats) return null

  const tiles = [
    { label: 'Submitted', value: stats.submitted },
    { label: 'Reviewed', value: stats.reviewed },
    { label: 'Shortlisted', value: stats.shortlisted },
    { label: 'Rejected', value: stats.rejected },
    { label: 'Hired', value: stats.hired },
    { label: 'Withdrawn', value: stats.withdrawn },
    { label: 'Total', value: stats.totalApplications },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.label} className={TILE}>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{tile.value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{tile.label}</p>
        </div>
      ))}
    </div>
  )
}
