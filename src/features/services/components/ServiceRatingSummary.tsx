import { Star } from 'lucide-react'

export function ServiceRatingSummary({
  ratingAvg,
  ratingCount,
}: Readonly<{ ratingAvg: number; ratingCount: number }>) {
  if (ratingCount === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No reviews yet</p>
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={15}
            className={i < Math.round(ratingAvg) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-white/15'}
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{ratingAvg.toFixed(1)}</span>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        ({ratingCount} review{ratingCount === 1 ? '' : 's'})
      </span>
    </div>
  )
}
