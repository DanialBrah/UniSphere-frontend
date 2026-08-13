import api from '../../../lib/axios'
import type {
  ApiResponse,
  EventCheckInRequest,
  EventRegistrationResponse,
  EventRegistrationStatus,
  SpringPage,
} from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data
const unwrapPage = <T>(r: { data: ApiResponse<SpringPage<T>> }): SpringPage<T> => r.data.data

type QueryParams = Record<string, string | number>

/**
 * `/register` and `/check-in` and the roster nest under `/events/{id}`; "my tickets" and the
 * single-registration status change are flat, since a registration id is globally unique — the
 * same split `lostFoundClaimApi` draws between item-scoped and flat claim endpoints.
 *
 * There is no DELETE — registrations are audit/attendance history. Withdrawal is
 * `cancel(registrationId)`, i.e. `PATCH .../registrations/{id} {status: 'CANCELLED'}`.
 */
export const eventRegistrationApi = {
  /** Seats the caller, or waitlists them if the event is at capacity. Rate-limited 10/min/user. */
  register: (eventId: number): Promise<EventRegistrationResponse> =>
    api.post<ApiResponse<EventRegistrationResponse>>(`/events/${eventId}/register`, {}).then(unwrap),

  /** Organizer/ADMIN only — the attendee roster / check-in list. */
  listRoster: (
    eventId: number,
    status: EventRegistrationStatus | null,
    page: number,
    size = 20,
  ): Promise<SpringPage<EventRegistrationResponse>> => {
    const params: QueryParams = { page, size }
    if (status) params.status = status
    return api
      .get<ApiResponse<SpringPage<EventRegistrationResponse>>>(
        `/events/${eventId}/registrations`,
        { params },
      )
      .then(unwrapPage)
  },

  /** The caller's own registration for one event, or a 404 if they have none. */
  getMyRegistration: (eventId: number): Promise<EventRegistrationResponse> =>
    api
      .get<ApiResponse<EventRegistrationResponse>>(`/events/${eventId}/registrations/me`)
      .then(unwrap),

  /** "My tickets" — every registration the caller holds, across every event. */
  listMyTickets: (
    status: EventRegistrationStatus | null,
    page: number,
    size = 20,
  ): Promise<SpringPage<EventRegistrationResponse>> => {
    const params: QueryParams = { page, size }
    if (status) params.status = status
    return api
      .get<ApiResponse<SpringPage<EventRegistrationResponse>>>('/events/registrations/me', {
        params,
      })
      .then(unwrapPage)
  },

  /**
   * Cancel — the registrant's own, or the event organizer's/an admin's on someone else's behalf.
   * `reason` is most meaningful on an organizer/admin removal; the registrant is notified of it
   * unless they're the one who made the change themselves.
   */
  cancel: (registrationId: number, reason?: string): Promise<EventRegistrationResponse> =>
    api
      .patch<ApiResponse<EventRegistrationResponse>>(`/events/registrations/${registrationId}`, {
        status: 'CANCELLED',
        ...(reason?.trim() ? { reason: reason.trim() } : {}),
      })
      .then(unwrap),

  /** Organizer/ADMIN only — scans/types a ticket code at the door. */
  checkIn: (eventId: number, body: EventCheckInRequest): Promise<EventRegistrationResponse> =>
    api
      .post<ApiResponse<EventRegistrationResponse>>(`/events/${eventId}/check-in`, body)
      .then(unwrap),
}
