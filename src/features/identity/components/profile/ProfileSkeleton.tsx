export function ProfileSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-white dark:bg-[#130D22] rounded-2xl border border-gray-200 dark:border-[#2D1F4D] p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-56" />
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-[#130D22] rounded-2xl border border-gray-200 dark:border-[#2D1F4D] p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
