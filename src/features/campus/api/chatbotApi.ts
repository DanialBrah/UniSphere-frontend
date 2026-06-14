import api from '../../../lib/axios'
import type { ApiResponse } from '../../social/types'
import type { ChatTurn, ChatResponse, ChatRequest } from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data

export const chatbotApi = {
  // POST /campus/chatbot/chat → ChatResponse { reply, fromCache, timestamp }
  chat: (body: ChatRequest): Promise<ChatResponse> =>
    api.post<ApiResponse<ChatResponse>>('/campus/chatbot/chat', body).then(unwrap),

  // GET /campus/chatbot/history → List<ChatTurn> [ { role, text } ]
  getHistory: (): Promise<ChatTurn[]> =>
    api.get<ApiResponse<ChatTurn[]>>('/campus/chatbot/history').then(unwrap),

  // DELETE /campus/chatbot/session
  clearSession: (): Promise<void> =>
    api.delete<ApiResponse<null>>('/campus/chatbot/session').then(() => undefined),
}
