import { useEffect, useRef } from 'react'
import type { StompSubscription } from '@stomp/stompjs'
import { useQueryClient } from '@tanstack/react-query'
import { stompClient, addStompConnectListener } from '../../../lib/stompClient'
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

  useEffect(() => {
    if (!conversationId) return

    const subscribe = () => {
      subscriptionRef.current?.unsubscribe()
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
            queryClient.invalidateQueries({ queryKey: messagingKeys.conversationsInfinite() })
            return
          }

          // MessageResponse — append to last page
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
          queryClient.invalidateQueries({ queryKey: messagingKeys.conversationsInfinite() })
        },
      )
    }

    if (stompClient.connected) subscribe()
    const removeListener = addStompConnectListener(subscribe)

    return () => {
      removeListener()
      subscriptionRef.current?.unsubscribe()
      subscriptionRef.current = null
    }
  }, [conversationId, queryClient, setTyping])
}
