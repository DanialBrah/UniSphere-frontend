import { useInfiniteQuery } from '@tanstack/react-query'
import { conversationApi } from '../api/conversationApi'

export const messagingKeys = {
  conversations: () => ['conversations'] as const,
  conversationsInfinite: () => ['conversations', 'infinite'] as const,
  conversation: (id: number) => ['conversations', id] as const,
  conversationMembers: (id: number) => ['conversations', id, 'members'] as const,
  messages: (conversationId: number) => ['messages', conversationId] as const,
  messagesInfinite: (conversationId: number) => ['messages', conversationId, 'infinite'] as const,
}

export function useConversations() {
  return useInfiniteQuery({
    queryKey: messagingKeys.conversationsInfinite(),
    queryFn: ({ pageParam }) => conversationApi.getConversations(pageParam as number, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
    // Safety-net poll in case a STOMP frame is missed.
    // Intentionally no refetchIntervalInBackground — polling pauses when the tab
    // is in the background so the Render free-tier server can sleep after inactivity.
    refetchInterval: 30_000,
  })
}
