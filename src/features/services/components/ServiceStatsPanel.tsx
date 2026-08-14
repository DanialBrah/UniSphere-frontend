import { TriangleAlert } from 'lucide-react'
import { ServiceStatsSkeleton } from './ServiceSkeleton'
import { ServiceErrorState } from './ServiceStateBlocks'
import { useServiceListingStats } from '../hooks/useServiceQueries'

const TILE = 'rounded-2xl border border-gray-200 bg-white p-3.5 dark:border-[#2D1F4D] dark:bg-[#1A1226]'

/** Owner/ADMIN-only per-listing breakdown — `GET /services/{id}/stats`. */
export function ServiceStatsPanel({ listingId }: Readonly<{ listingId: number }>) {
  const { data: stats, isPending, isError, error, refetch } = useServiceListingStats(listingId, true)

  if (isPending) return <ServiceStatsSkeleton />

  if (isError) {
    return <ServiceErrorState icon={TriangleAlert} title="Couldn't load stats" error={error} onRetry={() => refetch()} />
  }

  if (!stats) return null

  const tiles = [
    { label: 'Pending', value: stats.pending },
    { label: 'Accepted', value: stats.accepted },
    { label: 'In progress', value: stats.inProgress },
    { label: 'Completed', value: stats.completed },
    { label: 'Cancelled', value: stats.cancelled },
    { label: 'Disputed', value: stats.disputed },
    { label: 'Total', value: stats.totalOrders },
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
