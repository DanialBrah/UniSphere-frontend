import api from '../../../lib/axios'
import type { ApiResponse } from '../../identity/types/auth'
import type { SpringPage } from '../../social/types'
import type { NotificationResponse, UnreadCountResponse } from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data
const unwrapPage = <T>(r: { data: ApiResponse<SpringPage<T>> }): SpringPage<T> => r.data.data

export const notificationApi = {
  getNotifications: (page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<NotificationResponse>>>('/notifications', {
        params: { page, size },
      })
      .then(unwrapPage),

  getUnreadCount: () =>
    api
      .get<ApiResponse<unknown>>('/notifications/unread-count')
      .then((r): UnreadCountResponse => {
        const d = r.data.data
        if (typeof d === 'number') return { count: d }
        if (d && typeof d === 'object' && 'count' in d) return d as UnreadCountResponse
        return { count: 0 }
      }),

  markRead: (id: number) =>
    api
      .patch<ApiResponse<null>>(`/notifications/${id}/read`)
      .then(() => undefined),

  markAllRead: () =>
    api
      .patch<ApiResponse<null>>('/notifications/read-all')
      .then(() => undefined),
}
