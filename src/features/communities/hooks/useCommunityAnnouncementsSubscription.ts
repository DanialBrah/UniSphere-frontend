import { useEffect, useRef } from 'react'
import type { StompSubscription } from '@stomp/stompjs'
import { useQueryClient } from '@tanstack/react-query'
import { stompClient, addStompConnectListener } from '../../../lib/stompClient'
import { communityKeys } from '../types'

/**
 * Live-refreshes the Announcements tab when a moderator posts one, via the broadcast topic
 * the backend pushes to on create. Payload is untyped — this is purely an invalidation
 * signal, not a cache patch, so any frame just triggers a refetch.
 */
export function useCommunityAnnouncementsSubscription(communityId: number) {
  const queryClient = useQueryClient()
  const subscriptionRef = useRef<StompSubscription | null>(null)

  useEffect(() => {
    if (!communityId) return

    const subscribe = () => {
      subscriptionRef.current?.unsubscribe()
      subscriptionRef.current = stompClient.subscribe(
        `/topic/community/${communityId}/announcements`,
        () => {
          queryClient.invalidateQueries({
            queryKey: communityKeys.announcementsInfinite(communityId),
          })
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
  }, [communityId, queryClient])
}
