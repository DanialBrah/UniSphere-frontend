import { useQuery } from '@tanstack/react-query'
import { conversationApi } from '../api/conversationApi'
import { messagingKeys } from './useConversations'

export function useActiveConversation(id: number | null) {
  return useQuery({
    queryKey: messagingKeys.conversation(id ?? 0),
    queryFn: () => conversationApi.getConversation(id!),
    enabled: id !== null,
  })
}
