import { Bell, Loader2, CheckCheck, AlertTriangle } from 'lucide-react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { NotificationItem } from '../components/NotificationItem'
import { NotificationSkeleton } from '../components/NotificationSkeleton'
import { useNotifications } from '../hooks/useNotifications'
import { useMarkNotificationRead } from '../hooks/useMarkNotificationRead'
import { useMarkAllNotificationsRead } from '../hooks/useMarkAllNotificationsRead'
import { getErrorMessage } from '../../../lib/utils'

export default function NotificationsPage() {
  const { data, isLoading, isError, error, refetch, isFetchingNextPage, hasNextPage, fetchNextPage } = useNotifications()
  const { mutate: markRead } = useMarkNotificationRead()
  const { mutate: markAll, isPending: isMarkingAll } = useMarkAllNotificationsRead()

  const notifications = data?.pages.flatMap((p) => p.content) ?? []
  const hasUnread = notifications.some((n) => !n.read)

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          {hasUnread && (
            <button
              onClick={() => markAll()}
              disabled={isMarkingAll}
              className="flex items-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 disabled:opacity-50 transition-colors"
            >
              <CheckCheck size={15} />
              Mark all as read
            </button>
          )}
        </div>

        {/* List */}
        <div className="bg-white dark:bg-[#130D22] rounded-2xl border border-gray-200 dark:border-[#2D1F4D] overflow-hidden divide-y divide-gray-100 dark:divide-[#2D1F4D]">
          {isLoading && !data ? (
            <>
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
            </>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-8">
              <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Couldn't load notifications</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">{getErrorMessage(error)}</p>
              <button
                onClick={() => refetch()}
                className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline"
              >
                Retry
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-8">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[#1E1430] flex items-center justify-center">
                <Bell size={24} className="text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No notifications yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">
                When someone likes, comments on, or mentions you in a post, it'll show up here.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} onRead={markRead} />
            ))
          )}
        </div>

        {/* Load more */}
        {hasNextPage && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2D1F4D] text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1E1430] disabled:opacity-50 transition-colors"
            >
              {isFetchingNextPage && <Loader2 size={14} className="animate-spin" />}
              {isFetchingNextPage ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
