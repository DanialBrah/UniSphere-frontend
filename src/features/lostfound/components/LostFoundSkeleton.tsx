const SURFACE =
  'rounded-2xl border border-gray-200 bg-white dark:border-[#2D1F4D] dark:bg-[#1A1226]'
const SHIMMER = 'animate-pulse rounded bg-gray-200 dark:bg-white/10'

/** Matches LostFoundCard's layout so the swap to real content doesn't shift the grid. */
export function LostFoundCardSkeleton() {
  return (
    <div className={`${SURFACE} overflow-hidden`}>
      <div className={`h-36 w-full ${SHIMMER} rounded-none`} />
      <div className="space-y-2.5 p-4">
        <div className="flex gap-2">
          <div className={`h-5 w-14 ${SHIMMER}`} />
          <div className={`h-5 w-16 ${SHIMMER}`} />
        </div>
        <div className={`h-4 w-3/4 ${SHIMMER}`} />
        <div className={`h-3 w-1/2 ${SHIMMER}`} />
      </div>
    </div>
  )
}

export function LostFoundGridSkeleton({ count = 6 }: Readonly<{ count?: number }>) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }, (_, index) => (
        <LostFoundCardSkeleton key={index} />
      ))}
    </div>
  )
}

export function LostFoundClaimSkeleton() {
  return (
    <div className={`${SURFACE} space-y-3 p-4`}>
      <div className="flex items-center gap-3">
        <div className={`h-9 w-9 shrink-0 rounded-full ${SHIMMER}`} />
        <div className="flex-1 space-y-1.5">
          <div className={`h-3.5 w-32 ${SHIMMER}`} />
          <div className={`h-3 w-20 ${SHIMMER}`} />
        </div>
      </div>
      <div className={`h-3 w-full ${SHIMMER}`} />
      <div className={`h-3 w-2/3 ${SHIMMER}`} />
    </div>
  )
}

export function LostFoundStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className={`${SURFACE} p-3.5`}>
          <div className={`mb-2 h-6 w-10 ${SHIMMER}`} />
          <div className={`h-3 w-16 ${SHIMMER}`} />
        </div>
      ))}
    </div>
  )
}
