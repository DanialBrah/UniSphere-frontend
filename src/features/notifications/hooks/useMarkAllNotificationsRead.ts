import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { notificationApi } from '../api/notificationApi'
import { notificationKeys } from './useNotifications'
import type { NotificationResponse } from '../types'
import type { SpringPage } from '../../social/types'
import { getErrorMessage } from '../../../lib/utils'

type NotifsData = InfiniteData<SpringPage<NotificationResponse>>

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationApi.markAllRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.infinite() })
      const prev = queryClient.getQueryData<NotifsData>(notificationKeys.infinite())
      queryClient.setQueryData<NotifsData>(notificationKeys.infinite(), (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            content: page.content.map((n) => ({ ...n, read: true })),
          })),
        }
      })
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(notificationKeys.infinite(), ctx.prev)
      toast.error(getErrorMessage(err))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    },
  })
}
