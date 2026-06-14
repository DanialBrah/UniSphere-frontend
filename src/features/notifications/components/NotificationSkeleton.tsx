export function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-[#2D1F4D] shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 bg-gray-200 dark:bg-[#2D1F4D] rounded w-3/4" />
        <div className="h-2.5 bg-gray-100 dark:bg-[#241A38] rounded w-1/3" />
      </div>
    </div>
  )
}
