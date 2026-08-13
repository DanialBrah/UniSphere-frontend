const SURFACE =
  'rounded-2xl border border-gray-200 bg-white dark:border-[#2D1F4D] dark:bg-[#1A1226]'
const SHIMMER = 'animate-pulse rounded bg-gray-200 dark:bg-white/10'

/** Matches ProjectCard's layout so the swap to real content doesn't shift the grid. */
export function ProjectCardSkeleton() {
  return (
    <div className={`${SURFACE} overflow-hidden`}>
      <div className={`aspect-[16/9] w-full ${SHIMMER} rounded-none`} />
      <div className="space-y-2 p-4">
        <div className={`h-4 w-3/4 ${SHIMMER}`} />
        <div className={`h-3 w-1/2 ${SHIMMER}`} />
        <div className="flex gap-2 pt-1">
          <div className={`h-5 w-16 ${SHIMMER}`} />
          <div className={`h-5 w-14 ${SHIMMER}`} />
        </div>
      </div>
    </div>
  )
}

export function ProjectGridSkeleton({ count = 6 }: Readonly<{ count?: number }>) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }, (_, index) => (
        <ProjectCardSkeleton key={index} />
      ))}
    </div>
  )
}

export function ProjectRosterRowSkeleton() {
  return (
    <div className={`${SURFACE} flex items-center gap-3 p-3.5`}>
      <div className={`h-9 w-9 shrink-0 rounded-full ${SHIMMER}`} />
      <div className="flex-1 space-y-1.5">
        <div className={`h-3.5 w-32 ${SHIMMER}`} />
        <div className={`h-3 w-20 ${SHIMMER}`} />
      </div>
      <div className={`h-6 w-16 ${SHIMMER}`} />
    </div>
  )
}

export function ProjectDetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className={`h-40 w-full ${SHIMMER} rounded-2xl`} />
      <div className={`h-6 w-2/3 ${SHIMMER}`} />
      <div className={`h-4 w-1/3 ${SHIMMER}`} />
      <div className={`h-24 w-full ${SHIMMER} rounded-2xl`} />
    </div>
  )
}
