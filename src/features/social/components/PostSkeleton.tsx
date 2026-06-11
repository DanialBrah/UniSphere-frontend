export function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1A1226] rounded-2xl border border-gray-200 dark:border-[#2D1F4D] p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/5" />
      </div>
      <div className="flex gap-4 pt-3 border-t border-gray-100 dark:border-[#2D1F4D]">
        <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  )
}
