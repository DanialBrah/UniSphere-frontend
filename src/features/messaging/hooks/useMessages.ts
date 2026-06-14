import { useInfiniteQuery } from '@tanstack/react-query'
import { messageApi } from '../api/messageApi'
import { messagingKeys } from './useConversations'

export function useMessages(conversationId: number | null) {
  return useInfiniteQuery({
    queryKey: messagingKeys.messagesInfinite(conversationId ?? 0),
    queryFn: ({ pageParam }) => messageApi.getMessages(conversationId!, pageParam as number, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
    enabled: conversationId !== null,
  })
}
