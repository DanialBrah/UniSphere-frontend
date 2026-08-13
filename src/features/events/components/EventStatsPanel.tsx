import { TriangleAlert } from 'lucide-react'
import { EventStatsSkeleton } from './EventSkeleton'
import { EventErrorState } from './EventStateBlocks'
import { useEventStats } from '../hooks/useEventQueries'

const TILE = 'rounded-2xl border border-gray-200 bg-white p-3.5 dark:border-[#2D1F4D] dark:bg-[#1A1226]'

/** Organizer/ADMIN-only per-event breakdown — `GET /events/{id}/stats`. */
export function EventStatsPanel({ eventId }: Readonly<{ eventId: number }>) {
  const { data: stats, isPending, isError, error, refetch } = useEventStats(eventId, true)

  if (isPending) return <EventStatsSkeleton />

  if (isError) {
    return (
      <EventErrorState icon={TriangleAlert} title="Couldn't load stats" error={error} onRetry={() => refetch()} />
    )
  }

  if (!stats) return null

  const tiles = [
    { label: 'Registered', value: stats.registeredCount },
    { label: 'Waitlisted', value: stats.waitlistedCount },
    { label: 'Attended', value: stats.attendedCount },
    { label: 'Cancelled', value: stats.cancelledCount },
  ]

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className={TILE}>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{tile.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{tile.label}</p>
          </div>
        ))}
      </div>
      {stats.maxCapacity != null && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {stats.availableSeats} of {stats.maxCapacity} seats still available.
        </p>
      )}
    </div>
  )
}
