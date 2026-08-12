import api from '../../../lib/axios'
import type {
  ApiResponse,
  CreateLostFoundItemRequest,
  LostFoundFilters,
  LostFoundItemResponse,
  LostFoundItemStatus,
  LostFoundItemSummaryResponse,
  LostFoundMapPinResponse,
  LostFoundMatchResponse,
  LostFoundNearbyItemResponse,
  LostFoundStatsResponse,
  LostFoundStatusUpdateRequest,
  MapBounds,
  MapFilters,
  SpringPage,
  UpdateLostFoundItemRequest,
} from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data
const unwrapPage = <T>(r: { data: ApiResponse<SpringPage<T>> }): SpringPage<T> => r.data.data

type QueryParams = Record<string, string | number | boolean>

/**
 * Params are built by omission, never by assignment of a null.
 *
 * axios drops an `undefined` value but serialises `null` as the literal string "null", which Spring
 * then fails to bind to an enum — and because GlobalExceptionHandler doesn't extend
 * ResponseEntityExceptionHandler, that surfaces as a 500 rather than a 400. Same rule as newsApi.
 */
function feedParams(filters: LostFoundFilters, page: number, size: number): QueryParams {
  const params: QueryParams = { page, size }
  if (filters.type) params.type = filters.type
  if (filters.status) params.status = filters.status
  if (filters.category) params.category = filters.category
  return params
}

export const lostFoundApi = {
  getFeed: (
    filters: LostFoundFilters,
    page: number,
    size = 20,
  ): Promise<SpringPage<LostFoundItemSummaryResponse>> =>
    api
      .get<ApiResponse<SpringPage<LostFoundItemSummaryResponse>>>('/lost-found/items', {
        params: feedParams(filters, page, size),
      })
      .then(unwrapPage),

  /**
   * `q` is required — the server has no "match everything" branch, and an omitted param binds to
   * null and 500s. Callers gate on `isSearchableLostFoundQuery` before getting here.
   */
  search: (
    q: string,
    filters: Pick<LostFoundFilters, 'type' | 'status'>,
    page: number,
    size = 20,
  ): Promise<SpringPage<LostFoundItemSummaryResponse>> => {
    const params: QueryParams = { q, page, size }
    if (filters.type) params.type = filters.type
    if (filters.status) params.status = filters.status
    return api
      .get<ApiResponse<SpringPage<LostFoundItemSummaryResponse>>>('/lost-found/items/search', {
        params,
      })
      .then(unwrapPage)
  },

  getNearby: (
    lat: number,
    lng: number,
    radiusKm: number | null,
    filters: LostFoundFilters,
    page: number,
    size = 20,
  ): Promise<SpringPage<LostFoundNearbyItemResponse>> => {
    const params: QueryParams = { lat, lng, page, size }
    if (radiusKm != null) params.radiusKm = radiusKm
    if (filters.type) params.type = filters.type
    if (filters.status) params.status = filters.status
    if (filters.category) params.category = filters.category
    return api
      .get<ApiResponse<SpringPage<LostFoundNearbyItemResponse>>>('/lost-found/items/nearby', {
        params,
      })
      .then(unwrapPage)
  },

  /**
   * Unpaginated by design — the server hard-caps the result at `lost-found.map-max-pins` (500) and
   * expects the client to re-query as the viewport moves.
   */
  getMapPins: (bounds: MapBounds, filters: MapFilters): Promise<LostFoundMapPinResponse[]> => {
    const params: QueryParams = { ...bounds }
    if (filters.type) params.type = filters.type
    if (filters.status) params.status = filters.status
    return api
      .get<ApiResponse<LostFoundMapPinResponse[]>>('/lost-found/items/map', { params })
      .then(unwrap)
  },

  getMyItems: (
    status: LostFoundItemStatus | null,
    page: number,
    size = 20,
  ): Promise<SpringPage<LostFoundItemSummaryResponse>> => {
    const params: QueryParams = { page, size }
    if (status) params.status = status
    return api
      .get<ApiResponse<SpringPage<LostFoundItemSummaryResponse>>>('/lost-found/items/me', {
        params,
      })
      .then(unwrapPage)
  },

  getItem: (itemId: number): Promise<LostFoundItemResponse> =>
    api
      .get<ApiResponse<LostFoundItemResponse>>(`/lost-found/items/${itemId}`)
      .then(unwrap),

  getStats: (): Promise<LostFoundStatsResponse> =>
    api.get<ApiResponse<LostFoundStatsResponse>>('/lost-found/stats').then(unwrap),

  /** Reporter or ADMIN only — anyone else gets a 403, so don't render the tab for them. */
  getMatches: (itemId: number): Promise<LostFoundMatchResponse[]> =>
    api
      .get<ApiResponse<LostFoundMatchResponse[]>>(`/lost-found/items/${itemId}/matches`)
      .then(unwrap),

  create: (body: CreateLostFoundItemRequest): Promise<LostFoundItemResponse> =>
    api.post<ApiResponse<LostFoundItemResponse>>('/lost-found/items', body).then(unwrap),

  update: (itemId: number, body: UpdateLostFoundItemRequest): Promise<LostFoundItemResponse> =>
    api
      .put<ApiResponse<LostFoundItemResponse>>(`/lost-found/items/${itemId}`, body)
      .then(unwrap),

  changeStatus: (
    itemId: number,
    body: LostFoundStatusUpdateRequest,
  ): Promise<LostFoundItemResponse> =>
    api
      .patch<ApiResponse<LostFoundItemResponse>>(`/lost-found/items/${itemId}/status`, body)
      .then(unwrap),

  /** Soft delete server-side; the row stays for audit and subsequent reads 404. */
  remove: (itemId: number): Promise<void> =>
    api.delete<ApiResponse<null>>(`/lost-found/items/${itemId}`).then(() => undefined),
}
