import { useEffect, useRef } from 'react'
import type { StompSubscription } from '@stomp/stompjs'
import { useQueryClient } from '@tanstack/react-query'
import { stompClient } from '../../../lib/stompClient'
import { useChatStore } from '../../../stores/chatStore'
import { messagingKeys } from './useConversations'
import type {
  MessageResponse,
  ReadReceiptEvent,
  TypingEvent,
  MessageDeletedEvent,
} from '../types'
import type { SpringPage } from '../../social/types'
import type { InfiniteData } from '@tanstack/react-query'

type MessagesInfiniteData = InfiniteData<SpringPage<MessageResponse>>

export function useStompChat(conversationId: number | null) {
  const queryClient = useQueryClient()
  const { setTyping } = useChatStore()
  const subscriptionRef = useRef<StompSubscription | null>(null)
  const stompConnected = useChatStore((s) => s.isStompConnected)

  useEffect(() => {
    if (!conversationId) return
    if (!stompConnected) return

    subscriptionRef.current = stompClient.subscribe(
      `/topic/conversation/${conversationId}`,
      (frame) => {
        const raw = JSON.parse(frame.body) as
          | MessageResponse
          | ReadReceiptEvent
          | TypingEvent
          | MessageDeletedEvent

        if ('typing' in raw && 'displayName' in raw) {
          const ev = raw as TypingEvent
          setTyping(ev.conversationId, ev.userId, ev.displayName, ev.typing)
          return
        }

        if ('type' in raw && (raw as MessageDeletedEvent).type === 'MESSAGE_DELETED') {
          const ev = raw as MessageDeletedEvent
          queryClient.setQueryData<MessagesInfiniteData>(
            messagingKeys.messagesInfinite(ev.conversationId),
            (old) => {
              if (!old) return old
              return {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  content: page.content.filter((m: MessageResponse) => m.id !== ev.messageId),
                })),
              }
            },
          )
          return
        }

        if ('lastReadMessageId' in raw) {
          // ReadReceiptEvent — invalidate conversations to refresh last-read indicators
          queryClient.invalidateQueries({ queryKey: messagingKeys.conversationsInfinite() })
          return
        }

        // MessageResponse — append to the last page so the sort in MessageList places it at bottom
        const msg = raw as MessageResponse
        queryClient.setQueryData<MessagesInfiniteData>(
          messagingKeys.messagesInfinite(msg.conversationId),
          (old) => {
            if (!old) return old
            const pages = old.pages
            if (pages.length === 0) return old
            const lastPage = pages[pages.length - 1]
            return {
              ...old,
              pages: [
                ...pages.slice(0, -1),
                { ...lastPage, content: [...lastPage.content, msg] },
              ],
            }
          },
        )
        // Also bump the conversation list order
        queryClient.invalidateQueries({ queryKey: messagingKeys.conversationsInfinite() })
      },
    )

    return () => {
      subscriptionRef.current?.unsubscribe()
      subscriptionRef.current = null
    }
  }, [conversationId, stompConnected, queryClient, setTyping])
}
