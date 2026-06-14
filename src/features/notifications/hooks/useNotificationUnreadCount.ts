import { useQuery } from '@tanstack/react-query'
import { notificationApi } from '../api/notificationApi'
import { notificationKeys } from './useNotifications'

export function useNotificationUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: notificationApi.getUnreadCount,
    refetchInterval: 30_000,
    refetchOnMount: 'always',
  })
}
