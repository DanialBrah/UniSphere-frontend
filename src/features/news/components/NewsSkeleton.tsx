export function NewsSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1A1226] rounded-2xl border border-gray-200 dark:border-[#2D1F4D] overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-700" />
      <div className="p-5">
        <div className="flex gap-2 mb-3">
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-2.5" />
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/5" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-28" />
            <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}
