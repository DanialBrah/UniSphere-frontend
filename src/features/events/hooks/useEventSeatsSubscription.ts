import { useEffect, useRef } from 'react'
import type { StompSubscription } from '@stomp/stompjs'
import { useQueryClient } from '@tanstack/react-query'
import { stompClient, addStompConnectListener } from '../../../lib/stompClient'
import { eventKeys } from '../types'
import type { EventResponse, EventSeatsResponse } from '../types'

/**
 * Subscribes to `/topic/events/{eventId}/seats` and patches the cached `EventResponse` in place —
 * mirrors `useStompChat`'s subscribe/resubscribe pattern exactly. Push-only, no REST endpoint backs
 * this topic, and the payload is a raw `EventSeatsResponse` (NOT wrapped in `ApiResponse<T>`).
 *
 * Mount only on the event detail page — there is no reason to hold a live subscription open from a
 * list/card view.
 */
export function useEventSeatsSubscription(eventId: number | null) {
  const queryClient = useQueryClient()
  const subscriptionRef = useRef<StompSubscription | null>(null)

  useEffect(() => {
    if (!eventId) return

    const subscribe = () => {
      subscriptionRef.current?.unsubscribe()
      subscriptionRef.current = stompClient.subscribe(`/topic/events/${eventId}/seats`, (frame) => {
        const seats = JSON.parse(frame.body) as EventSeatsResponse
        queryClient.setQueryData<EventResponse>(eventKeys.detail(eventId), (old) =>
          old
            ? {
                ...old,
                registeredCount: seats.registeredCount,
                waitlistedCount: seats.waitlistedCount,
                availableSeats: seats.availableSeats,
              }
            : old,
        )
      })
    }

    if (stompClient.connected) subscribe()
    const removeListener = addStompConnectListener(subscribe)

    return () => {
      removeListener()
      subscriptionRef.current?.unsubscribe()
      subscriptionRef.current = null
    }
  }, [eventId, queryClient])
}
