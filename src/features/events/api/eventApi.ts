import api from '../../../lib/axios'
import type {
  ApiResponse,
  CreateEventRequest,
  EventCategory,
  EventFilters,
  EventMapFilters,
  EventMapPinResponse,
  EventNearbyResponse,
  EventResponse,
  EventStatsResponse,
  EventStatusUpdateRequest,
  EventSummaryResponse,
  MapBounds,
  SpringPage,
  UpdateEventRequest,
} from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data
const unwrapPage = <T>(r: { data: ApiResponse<SpringPage<T>> }): SpringPage<T> => r.data.data

type QueryParams = Record<string, string | number | boolean>

/**
 * Params are built by omission, never by assignment of a null.
 *
 * axios drops an `undefined` value but serialises `null` as the literal string "null", which Spring
 * then fails to bind to an enum — and because GlobalExceptionHandler doesn't extend
 * ResponseEntityExceptionHandler, that surfaces as a 500 rather than a 400. Same rule as lostFoundApi.
 */
function feedParams(filters: EventFilters, page: number, size: number): QueryParams {
  const params: QueryParams = { page, size }
  if (filters.category) params.category = filters.category
  if (filters.status) params.status = filters.status
  if (filters.isOnline != null) params.isOnline = filters.isOnline
  return params
}

export const eventApi = {
  create: (body: CreateEventRequest): Promise<EventResponse> =>
    api.post<ApiResponse<EventResponse>>('/events', body).then(unwrap),

  /** A null/omitted `status` defaults server-side to PUBLISHED. `status=DRAFT` is rejected with a 400. */
  getFeed: (
    filters: EventFilters,
    page: number,
    size = 20,
  ): Promise<SpringPage<EventSummaryResponse>> =>
    api
      .get<ApiResponse<SpringPage<EventSummaryResponse>>>('/events', {
        params: feedParams(filters, page, size),
      })
      .then(unwrapPage),

  /** `q` is required — the server has no "match everything" branch. */
  search: (
    q: string,
    category: EventCategory | null,
    page: number,
    size = 20,
  ): Promise<SpringPage<EventSummaryResponse>> => {
    const params: QueryParams = { q, page, size }
    if (category) params.category = category
    return api
      .get<ApiResponse<SpringPage<EventSummaryResponse>>>('/events/search', { params })
      .then(unwrapPage)
  },

  getNearby: (
    lat: number,
    lng: number,
    radiusKm: number | null,
    category: EventCategory | null,
    page: number,
    size = 20,
  ): Promise<SpringPage<EventNearbyResponse>> => {
    const params: QueryParams = { lat, lng, page, size }
    if (radiusKm != null) params.radiusKm = radiusKm
    if (category) params.category = category
    return api
      .get<ApiResponse<SpringPage<EventNearbyResponse>>>('/events/nearby', { params })
      .then(unwrapPage)
  },

  /**
   * Unpaginated by design — the server hard-caps the result (~500 pins) and expects the client to
   * re-query as the viewport moves. PUBLISHED events only.
   */
  getMapPins: (bounds: MapBounds, filters: EventMapFilters): Promise<EventMapPinResponse[]> => {
    const params: QueryParams = { ...bounds }
    if (filters.category) params.category = filters.category
    return api.get<ApiResponse<EventMapPinResponse[]>>('/events/map', { params }).then(unwrap)
  },

  /** The caller's own events, every status including DRAFT. */
  getMyEvents: (
    status: EventFilters['status'] | 'DRAFT' | null,
    page: number,
    size = 20,
  ): Promise<SpringPage<EventSummaryResponse>> => {
    const params: QueryParams = { page, size }
    if (status) params.status = status
    return api
      .get<ApiResponse<SpringPage<EventSummaryResponse>>>('/events/me', { params })
      .then(unwrapPage)
  },

  /** A DRAFT is masked as 404 unless the caller is the organizer or an ADMIN. */
  getEvent: (eventId: number): Promise<EventResponse> =>
    api.get<ApiResponse<EventResponse>>(`/events/${eventId}`).then(unwrap),

  update: (eventId: number, body: UpdateEventRequest): Promise<EventResponse> =>
    api.put<ApiResponse<EventResponse>>(`/events/${eventId}`, body).then(unwrap),

  /** Only DRAFT->PUBLISHED, DRAFT->CANCELLED, PUBLISHED->CANCELLED are valid here. */
  changeStatus: (eventId: number, body: EventStatusUpdateRequest): Promise<EventResponse> =>
    api.patch<ApiResponse<EventResponse>>(`/events/${eventId}/status`, body).then(unwrap),

  /** Soft delete. Blocked (400) while the event has any active registration — cancel it instead. */
  remove: (eventId: number): Promise<void> =>
    api.delete<ApiResponse<null>>(`/events/${eventId}`).then(() => undefined),

  /** Organizer/ADMIN only. */
  getStats: (eventId: number): Promise<EventStatsResponse> =>
    api.get<ApiResponse<EventStatsResponse>>(`/events/${eventId}/stats`).then(unwrap),
}
