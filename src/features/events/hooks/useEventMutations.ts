import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { eventApi } from '../api/eventApi'
import { eventErrorMessage } from '../utils/eventErrors'
import { STATUS_LABEL } from '../utils/display'
import { eventKeys } from '../types'
import type { CreateEventRequest, EventResponse, EventStatusUpdateRequest, UpdateEventRequest } from '../types'

/** Every list surface that could contain the changed event. */
function invalidateEventLists(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
  queryClient.invalidateQueries({ queryKey: eventKeys.searches() })
  queryClient.invalidateQueries({ queryKey: eventKeys.mineAll() })
  queryClient.invalidateQueries({ queryKey: eventKeys.maps() })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateEventRequest) => eventApi.create(body),
    onSuccess: (event: EventResponse) => {
      queryClient.setQueryData(eventKeys.detail(event.id), event)
      invalidateEventLists(queryClient)
      toast.success('Event created as a draft — publish it when you\'re ready')
    },
    onError: (err) => toast.error(eventErrorMessage(err)),
  })
}

export function useUpdateEvent(eventId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateEventRequest) => eventApi.update(eventId, body),
    onSuccess: (event: EventResponse) => {
      queryClient.setQueryData(eventKeys.detail(event.id), event)
      invalidateEventLists(queryClient)
      toast.success('Event updated')
    },
    onError: (err) => toast.error(eventErrorMessage(err)),
  })
}

export function useChangeEventStatus(eventId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventStatusUpdateRequest) => eventApi.changeStatus(eventId, body),
    onSuccess: (event: EventResponse) => {
      queryClient.setQueryData(eventKeys.detail(event.id), event)
      invalidateEventLists(queryClient)
      toast.success(
        event.status === 'CANCELLED'
          ? 'Event cancelled — every active registrant was notified'
          : `Event ${STATUS_LABEL[event.status].toLowerCase()}`,
      )
    },
    onError: (err) => toast.error(eventErrorMessage(err)),
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: number) => eventApi.remove(eventId),
    onSuccess: (_data, eventId) => {
      // Removed rather than invalidated: the row is soft-deleted server-side, so a refetch of this
      // key would 404 and leave an error state cached behind the redirect.
      queryClient.removeQueries({ queryKey: eventKeys.detail(eventId) })
      queryClient.removeQueries({ queryKey: eventKeys.stats(eventId) })
      queryClient.removeQueries({ queryKey: eventKeys.rosterAll(eventId) })
      invalidateEventLists(queryClient)
      toast.success('Event deleted')
    },
    onError: (err) => toast.error(eventErrorMessage(err)),
  })
}
