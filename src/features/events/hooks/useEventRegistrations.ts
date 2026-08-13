import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { eventRegistrationApi } from '../api/eventRegistrationApi'
import { eventErrorMessage } from '../utils/eventErrors'
import { eventKeys } from '../types'
import type { EventCheckInRequest, EventRegistrationResponse, EventRegistrationStatus, SpringPage } from '../types'

function nextPage(lastPage: SpringPage<EventRegistrationResponse>): number | undefined {
  return lastPage.last ? undefined : lastPage.number + 1
}

/** Register/cancel/promotion all touch registeredCount/waitlistedCount, so every derived surface refreshes. */
function invalidateAfterRegistrationChange(queryClient: QueryClient, eventId: number) {
  queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) })
  queryClient.invalidateQueries({ queryKey: eventKeys.stats(eventId) })
  queryClient.invalidateQueries({ queryKey: eventKeys.rosterAll(eventId) })
  queryClient.invalidateQueries({ queryKey: eventKeys.myRegistration(eventId) })
  queryClient.invalidateQueries({ queryKey: eventKeys.myTicketsAll() })
  queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
  queryClient.invalidateQueries({ queryKey: eventKeys.maps() })
}

// ── Reads ────────────────────────────────────────────────────────────────────

/** Attendee roster / check-in list. Organizer/ADMIN only — gate `enabled` on `event.canModify`. */
export function useEventRoster(eventId: number, status: EventRegistrationStatus | null, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: eventKeys.roster(eventId, status ?? 'ALL'),
    queryFn: ({ pageParam }) => eventRegistrationApi.listRoster(eventId, status, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled: enabled && eventId > 0,
  })
}

/**
 * The caller's own registration for one event — used to show the ticket/QR panel. Only enabled when
 * `event.viewerRegistrationStatus` is already non-null, to avoid a guaranteed 404 in the (common)
 * never-registered case.
 */
export function useMyEventRegistration(eventId: number, enabled: boolean) {
  return useQuery({
    queryKey: eventKeys.myRegistration(eventId),
    queryFn: () => eventRegistrationApi.getMyRegistration(eventId),
    enabled: enabled && eventId > 0,
    retry: false,
  })
}

/** "My tickets" across every event. */
export function useMyEventTickets(status: EventRegistrationStatus | null, enabled = true) {
  return useInfiniteQuery({
    queryKey: eventKeys.myTickets(status ?? 'ALL'),
    queryFn: ({ pageParam }) => eventRegistrationApi.listMyTickets(status, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled,
  })
}

// ── Writes ───────────────────────────────────────────────────────────────────

export function useRegisterForEvent(eventId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => eventRegistrationApi.register(eventId),
    onSuccess: (registration: EventRegistrationResponse) => {
      queryClient.setQueryData(eventKeys.myRegistration(eventId), registration)
      invalidateAfterRegistrationChange(queryClient, eventId)
      toast.success(
        registration.status === 'WAITLISTED'
          ? "You're on the waitlist — we'll notify you if a seat opens up"
          : "You're registered!",
      )
    },
    onError: (err) => toast.error(eventErrorMessage(err)),
  })
}

interface CancelRegistrationVariables {
  registrationId: number
  /** Most meaningful on an organizer/admin removal — surfaced in the notification to the registrant. */
  reason?: string
}

/** Cancel — the registrant's own seat/waitlist spot, or the organizer/an admin cancelling for them. */
export function useCancelEventRegistration(eventId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ registrationId, reason }: CancelRegistrationVariables) =>
      eventRegistrationApi.cancel(registrationId, reason),
    onSuccess: (registration: EventRegistrationResponse) => {
      queryClient.setQueryData(eventKeys.myRegistration(eventId), registration)
      invalidateAfterRegistrationChange(queryClient, eventId)
      toast.success('Registration cancelled')
    },
    onError: (err) => toast.error(eventErrorMessage(err)),
  })
}

/** Organizer/ADMIN only — scans/types a ticket code at the door. */
export function useCheckInEventTicket(eventId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventCheckInRequest) => eventRegistrationApi.checkIn(eventId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.rosterAll(eventId) })
      queryClient.invalidateQueries({ queryKey: eventKeys.stats(eventId) })
      toast.success('Checked in')
    },
    onError: (err) => toast.error(eventErrorMessage(err)),
  })
}
