import { useEffect, useRef } from 'react'
import type { StompSubscription } from '@stomp/stompjs'
import { useQueryClient } from '@tanstack/react-query'
import { stompClient } from '../../../lib/stompClient'
import { useChatStore } from '../../../stores/chatStore'
import { messagingKeys } from './useConversations'
import type { MessageResponse } from '../types'

/**
 * Subscribes to every loaded conversation topic so the sidebar stays live
 * regardless of whether a conversation is currently open.
 *
 * For the active conversation, useStompChat (in MessageList) handles the
 * full message pipeline. This hook only handles:
 *   - invalidating the conversation list (last-message preview + order)
 *   - incrementing unread counts for conversations that are NOT active
 */
export function useConversationListSubscription(conversationIds: number[]) {
  const queryClient = useQueryClient()
  const { activeConversationId, incrementUnread } = useChatStore()
  const subscriptionsRef = useRef<Map<number, StompSubscription>>(new Map())

  useEffect(() => {
    if (!stompClient.connected) return

    // Subscribe to any ID not already tracked
    conversationIds.forEach((id) => {
      if (subscriptionsRef.current.has(id)) return

      const sub = stompClient.subscribe(`/topic/conversation/${id}`, (frame) => {
        const raw = JSON.parse(frame.body) as Record<string, unknown>

        // Only act on new MessageResponse events (skip typing / delete / read-receipt)
        if (!('senderId' in raw) || !('content' in raw)) return

        const msg = raw as unknown as MessageResponse

        // Refresh the sidebar so last-message preview and order update
        queryClient.invalidateQueries({ queryKey: messagingKeys.conversationsInfinite() })

        // Bump unread badge only for conversations the user is NOT looking at
        if (msg.conversationId !== activeConversationId) {
          incrementUnread(msg.conversationId)
        }
      })

      subscriptionsRef.current.set(id, sub)
    })

    // Unsubscribe from conversations that are no longer in the list
    subscriptionsRef.current.forEach((sub, id) => {
      if (!conversationIds.includes(id)) {
        sub.unsubscribe()
        subscriptionsRef.current.delete(id)
      }
    })
  }, [conversationIds, activeConversationId, queryClient, incrementUnread])

  // Unsubscribe everything on unmount
  useEffect(() => {
    const subs = subscriptionsRef.current
    return () => {
      subs.forEach((sub) => sub.unsubscribe())
      subs.clear()
    }
  }, [])
}
