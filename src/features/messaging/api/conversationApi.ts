import api from '../../../lib/axios'
import type { ApiResponse } from '../../social/types'
import type { SpringPage } from '../../social/types'
import type {
  ConversationResponse,
  ConversationMemberInfo,
  CreateConversationRequest,
  MemberSummary,
} from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data
const unwrapPage = <T>(r: { data: ApiResponse<SpringPage<T>> }): SpringPage<T> => r.data.data

export const conversationApi = {
  getConversations: (page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<ConversationResponse>>>('/conversations', { params: { page, size } })
      .then(unwrapPage),

  getConversation: (id: number) =>
    api.get<ApiResponse<ConversationResponse>>(`/conversations/${id}`).then(unwrap),

  createConversation: (body: CreateConversationRequest) =>
    api.post<ApiResponse<ConversationResponse>>('/conversations', body).then(unwrap),

  addMember: (conversationId: number, userId: number) =>
    api
      .post<ApiResponse<ConversationResponse>>(`/conversations/${conversationId}/members`, { userId })
      .then(unwrap),

  removeMember: (conversationId: number, userId: number) =>
    api
      .delete<ApiResponse<null>>(`/conversations/${conversationId}/members/${userId}`)
      .then(() => undefined),

  getMembers: (conversationId: number) =>
    api
      .get<ApiResponse<ConversationMemberInfo[]>>(`/conversations/${conversationId}/members`)
      .then(unwrap),

  promoteMember: (conversationId: number, userId: number) =>
    api
      .put<ApiResponse<MemberSummary>>(`/conversations/${conversationId}/members/${userId}/promote`)
      .then(unwrap),

  deleteConversation: (conversationId: number) =>
    api.delete<ApiResponse<null>>(`/conversations/${conversationId}`).then(() => undefined),
}
