import { useInfiniteQuery } from '@tanstack/react-query'
import { notificationApi } from '../api/notificationApi'

export const notificationKeys = {
  infinite: () => ['notifications', 'infinite'] as const,
  unreadCount: () => ['notifications', 'unread-count'] as const,
}

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: notificationKeys.infinite(),
    queryFn: ({ pageParam }) => notificationApi.getNotifications(pageParam as number, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
    refetchInterval: 30_000,
    refetchOnMount: 'always',
  })
}
