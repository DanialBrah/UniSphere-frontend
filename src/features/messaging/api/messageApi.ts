import api from '../../../lib/axios'
import type { ApiResponse } from '../../social/types'
import type { SpringPage } from '../../social/types'
import type {
  MessageResponse,
  SendMessageRequest,
  MarkReadRequest,
} from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data
const unwrapPage = <T>(r: { data: ApiResponse<SpringPage<T>> }): SpringPage<T> => r.data.data

export const messageApi = {
  getMessages: (conversationId: number, page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<MessageResponse>>>('/messages', {
        params: { conversationId, page, size },
      })
      .then(unwrapPage),

  sendMessage: (body: SendMessageRequest) =>
    api.post<ApiResponse<MessageResponse>>('/messages', body).then(unwrap),

  deleteMessage: (messageId: number) =>
    api.delete<ApiResponse<null>>(`/messages/${messageId}`).then(() => undefined),

  markRead: (body: MarkReadRequest) =>
    api.post<ApiResponse<null>>('/messages/read', body).then(() => undefined),
}
