import { useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { StompSubscription } from '@stomp/stompjs'
import { useQueryClient } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import {
  stompClient,
  addStompConnectListener,
  addStompDisconnectListener,
  addStompErrorListener,
} from '../../../lib/stompClient'
import { useChatStore } from '../../../stores/chatStore'
import { useAuthStore } from '../../../stores/authStore'
import { useConversations, messagingKeys } from './useConversations'
import { notificationKeys } from '../../notifications/hooks/useNotifications'
import { actorLabel } from '../../notifications/types'
import type { ConversationResponse, MessageResponse } from '../types'
import type { NotificationResponse, UnreadCountResponse } from '../../notifications/types'
import type { SpringPage } from '../../social/types'

type MessagesInfiniteData = InfiniteData<SpringPage<MessageResponse>>
type NotifsInfiniteData   = InfiniteData<SpringPage<NotificationResponse>>

// Keep in sync with TYPE_CONFIG in NotificationItem.tsx — both need an entry per emitted
// NotificationType, or the notification degrades to the generic fallback below.
const NOTIF_LABELS: Record<string, string> = {
  LIKE:    'liked your post',
  COMMENT: 'commented on your post',
  MENTION: 'mentioned you in a post',
  FOLLOW:  'started following you',
}

// ── sessionStorage helpers ────────────────────────────────────────────────────
// Persisting seen IDs across page refreshes means the unread diff survives an F5.
// We use sessionStorage (not localStorage) so the slate clears when the browser
// tab is closed — matching what users expect from a chat app.
const SEEN_KEY = 'unisphere_seen_convs'

function loadSeenIds(): Set<number> | null {
  try {
    const raw = sessionStorage.getItem(SEEN_KEY)
    if (!raw) return null
    return new Set(JSON.parse(raw) as number[])
  } catch {
    return null
  }
}

function persistSeenIds(ids: Set<number>) {
  try {
    sessionStorage.setItem(SEEN_KEY, JSON.stringify([...ids]))
  } catch {
    // ignore storage quota errors
  }
}

export function useGlobalMessagingSubscription() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { incrementUnread } = useChatStore()
  const subscriptionsRef = useRef<Map<number, StompSubscription>>(new Map())
  const notifSubRef      = useRef<StompSubscription | null>(null)
  const seenConvIdsRef   = useRef<Set<number> | null>(null)

  const activeIdRef = useRef<number | null>(useChatStore.getState().activeConversationId)
  useEffect(() => useChatStore.subscribe((s) => { activeIdRef.current = s.activeConversationId }), [])

  const currentUserIdRef = useRef<number | null>(useAuthStore.getState().user?.id ?? null)
  useEffect(() => useAuthStore.subscribe((s) => { currentUserIdRef.current = s.user?.id ?? null }), [])

  const { data } = useConversations()

  // Stable arrays — only recompute when the server data actually changes.
  // Without useMemo these were new references on every render, causing the
  // subscription effect to run on every render (harmless but wasteful).
  const allConversations = useMemo<ConversationResponse[]>(
    () => data?.pages.flatMap((p) => p.content) ?? [],
    [data],
  )
  const conversationIds = useMemo(
    () => allConversations.map((c) => c.id),
    [allConversations],
  )

  // ── Effect 1: /user/queue/notifications subscription ─────────────────────
  // Registered via the STOMP event system so it fires immediately on every
  // (re)connect regardless of where in the React lifecycle we are.
  // The disconnect listener clears all subscription refs so reconnect builds
  // fresh subscriptions against a clean slate.
  useEffect(() => {
    const setupNotifSub = () => {
      notifSubRef.current?.unsubscribe()
      notifSubRef.current = stompClient.subscribe('/user/queue/notifications', (frame) => {
        const raw = JSON.parse(frame.body) as Record<string, unknown>
        if (!raw.notifType) return

        const notification = raw as unknown as NotificationResponse
        const action = NOTIF_LABELS[notification.notifType]
        const label = action
          ? `${actorLabel(notification)} ${action}`
          : 'You have a new notification'

        toast(label, {
          description: 'Tap to view your notifications',
          action: { label: 'View', onClick: () => navigate('/notifications') },
        })

        // Prepend to the notifications list cache — instant update, no API call
        queryClient.setQueriesData<NotifsInfiniteData>(
          { queryKey: notificationKeys.infinite() },
          (old) => {
            if (!old?.pages?.length) return old
            const [first, ...rest] = old.pages
            return {
              ...old,
              pages: [
                { ...first, content: [notification, ...first.content] },
                ...rest,
              ],
            }
          },
        )

        // Increment the sidebar badge immediately
        queryClient.setQueryData<UnreadCountResponse>(
          notificationKeys.unreadCount(),
          (old) => ({ count: (old?.count ?? 0) + 1 }),
        )

        // Background sync with server
        queryClient.invalidateQueries({ queryKey: notificationKeys.infinite() })
        queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
      })
    }

    const teardown = () => {
      subscriptionsRef.current.forEach((sub) => sub.unsubscribe())
      subscriptionsRef.current.clear()
      notifSubRef.current?.unsubscribe()
      notifSubRef.current = null
    }

    if (stompClient.connected) setupNotifSub()

    const removeConnect    = addStompConnectListener(setupNotifSub)
    const removeDisconnect = addStompDisconnectListener(teardown)

    return () => {
      removeConnect()
      removeDisconnect()
      teardown()
    }
  }, [queryClient, navigate])

  // ── Effect 2: per-conversation topic subscriptions + new-conv detection ──
  // Runs when the conversation list changes (poll or STOMP-triggered refetch).
  // Also registers a STOMP connect listener so subscriptions are rebuilt after
  // a reconnect using the latest known conversation IDs.
  useEffect(() => {
    if (data === undefined) return

    // Seed seenConvIds once — restoring from sessionStorage so page refreshes
    // don't retroactively mark old conversations as unread.
    if (seenConvIdsRef.current === null) {
      seenConvIdsRef.current = loadSeenIds() ?? new Set(conversationIds)
      persistSeenIds(seenConvIdsRef.current)
    } else {
      // Diff against the set to find genuinely new conversations.
      // Works for both the STOMP fast path (invalidation triggers an early
      // refetch) and the 30s safety-net poll.
      allConversations.forEach((conv) => {
        if (seenConvIdsRef.current!.has(conv.id)) return
        seenConvIdsRef.current!.add(conv.id)
        persistSeenIds(seenConvIdsRef.current!)

        // FIX-NOTE (weakness 3 — partial): incrementUnread is called once here,
        // showing a badge of 1 regardless of how many messages were sent before
        // this poll cycle ran.  The exact count requires the backend to return
        // an `unreadCount` field in ConversationResponse.  When that field is
        // added, replace `incrementUnread(conv.id)` with:
        //   useConvUnreadStore.getState().setUnread(conv.id, conv.unreadCount)
        if (
          conv.lastMessage &&
          conv.lastMessage.senderId !== currentUserIdRef.current &&
          conv.id !== activeIdRef.current
        ) {
          incrementUnread(conv.id)
        }
      })
    }

    const subscribeToTopics = () => {
      conversationIds.forEach((id) => {
        if (subscriptionsRef.current.has(id)) return

        const sub = stompClient.subscribe(`/topic/conversation/${id}`, (frame) => {
          const raw = JSON.parse(frame.body) as Record<string, unknown>
          if (!('senderId' in raw) || !('content' in raw)) return

          const msg          = raw as unknown as MessageResponse
          const isOwnMessage = msg.senderId === currentUserIdRef.current
          const isActiveConv = msg.conversationId === activeIdRef.current

          queryClient.invalidateQueries({ queryKey: messagingKeys.conversationsInfinite() })

          if (!isActiveConv) {
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
          }

          if (!isOwnMessage && !isActiveConv) {
            incrementUnread(msg.conversationId)
          }
        })

        subscriptionsRef.current.set(id, sub)
      })

      // Drop subscriptions for conversations that are no longer in the list.
      subscriptionsRef.current.forEach((sub, id) => {
        if (!conversationIds.includes(id)) {
          sub.unsubscribe()
          subscriptionsRef.current.delete(id)
        }
      })
    }

    if (stompClient.connected) subscribeToTopics()

    // Re-register on every effect run so the connect listener always closes
    // over the latest conversationIds (cleanup removes the stale one).
    const removeConnect = addStompConnectListener(subscribeToTopics)
    return () => removeConnect()
  }, [data, allConversations, conversationIds, queryClient, incrementUnread])

  // ── Effect 3: surface STOMP ERROR frames ──────────────────────────────────
  // Covers both a CONNECT auth failure and a rate-limit breach on SEND (both
  // thrown server-side as MessageDeliveryException) — today these are silently
  // dropped with zero user-visible feedback since no onStompError handler exists.
  useEffect(() => addStompErrorListener((frame) => {
    const detail = frame.headers?.message ?? ''
    if (detail.includes('Too many messages')) {
      toast.error('Too many messages', { description: 'Please slow down and try again shortly.' })
    } else {
      toast.error('Connection error', { description: detail || 'Something went wrong with the live connection.' })
    }
  }), [])
}
