import { useLostFoundStats } from '../hooks/useLostFoundQueries'
import { LostFoundStatsSkeleton } from './LostFoundSkeleton'

const TILE =
  'rounded-2xl border border-gray-200 bg-white p-3.5 dark:border-[#2D1F4D] dark:bg-[#1A1226]'

/**
 * Board-wide counts.
 *
 * Renders nothing on failure rather than an error block: these numbers are context, not content,
 * and a broken stats call should not stand between a user and the board itself.
 */
export function LostFoundStatsBar() {
  const { data, isLoading, isError } = useLostFoundStats()

  if (isLoading) return <LostFoundStatsSkeleton />
  if (isError || !data) return null

  const tiles = [
    { label: 'Open reports', value: data.byStatus.OPEN },
    { label: 'Lost', value: data.byType.LOST },
    { label: 'Found', value: data.byType.FOUND },
    { label: 'Returned', value: data.byStatus.RESOLVED },
  ]

  return (
    <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map(({ label, value }) => (
        <div key={label} className={TILE}>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      ))}
    </div>
  )
}
