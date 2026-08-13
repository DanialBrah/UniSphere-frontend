import { Users } from 'lucide-react'

interface EventSeatsIndicatorProps {
  registeredCount: number
  waitlistedCount: number
  maxCapacity: number | null
  compact?: boolean
}

/**
 * "X going" (+ a capacity bar when maxCapacity is set, + a waitlist note when non-empty). Reused on
 * the card, the detail header, and the live-updating registration panel — `registeredCount`/
 * `waitlistedCount` are read straight off the (possibly STOMP-patched) `EventResponse`, never
 * recomputed client-side.
 */
export function EventSeatsIndicator({
  registeredCount,
  waitlistedCount,
  maxCapacity,
  compact = false,
}: Readonly<EventSeatsIndicatorProps>) {
  const going = `${registeredCount} going${maxCapacity != null ? ` / ${maxCapacity}` : ''}`
  const percent = maxCapacity ? Math.min((registeredCount / maxCapacity) * 100, 100) : null

  return (
    <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
      <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <Users className="h-3.5 w-3.5 shrink-0" />
        {going}
        {waitlistedCount > 0 && (
          <span className="text-amber-600 dark:text-amber-400">
            · {waitlistedCount} waitlisted
          </span>
        )}
      </p>
      {percent != null && !compact && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
          <div
            className={`h-full rounded-full transition-all ${percent >= 100 ? 'bg-amber-500' : 'bg-primary'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  )
}
