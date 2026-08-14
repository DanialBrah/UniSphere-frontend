import api from '../../../lib/axios'
import type {
  ApiResponse,
  CreateServiceListingRequest,
  ServiceFilters,
  ServiceListingResponse,
  ServiceListingStatsResponse,
  ServiceListingStatus,
  ServiceListingStatusUpdateRequest,
  ServiceListingSummaryResponse,
  SpringPage,
  UpdateServiceListingRequest,
} from '../types'
import type { ConversationResponse } from '../../messaging/types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data
const unwrapPage = <T>(r: { data: ApiResponse<SpringPage<T>> }): SpringPage<T> => r.data.data

type QueryParams = Record<string, string | number | boolean>

/**
 * Params are built by omission, never by assignment of a null.
 *
 * axios drops an `undefined` value but serialises `null` as the literal string "null", which Spring
 * then fails to bind to an enum — and because GlobalExceptionHandler doesn't extend
 * ResponseEntityExceptionHandler, that surfaces as a 500 rather than a 400. Same rule as jobApi.
 */
function feedParams(filters: ServiceFilters, page: number, size: number): QueryParams {
  const params: QueryParams = { page, size }
  if (filters.category) params.category = filters.category
  if (filters.pricingType) params.pricingType = filters.pricingType
  if (filters.deliveryMode) params.deliveryMode = filters.deliveryMode
  if (filters.universityId != null) params.universityId = filters.universityId
  return params
}

export const serviceApi = {
  create: (body: CreateServiceListingRequest): Promise<ServiceListingResponse> =>
    api.post<ApiResponse<ServiceListingResponse>>('/services', body).then(unwrap),

  /** A `status=PAUSED` filter is rejected (400) — paused listings only surface via `/services/me`. */
  getFeed: (filters: ServiceFilters, page: number, size = 20): Promise<SpringPage<ServiceListingSummaryResponse>> =>
    api
      .get<ApiResponse<SpringPage<ServiceListingSummaryResponse>>>('/services', {
        params: feedParams(filters, page, size),
      })
      .then(unwrapPage),

  /** `q` is required — the server has no "match everything" branch. Always ACTIVE-only results. */
  search: (
    q: string,
    category: string | null,
    page: number,
    size = 20,
  ): Promise<SpringPage<ServiceListingSummaryResponse>> => {
    const params: QueryParams = { q, page, size }
    if (category) params.category = category
    return api
      .get<ApiResponse<SpringPage<ServiceListingSummaryResponse>>>('/services/search', { params })
      .then(unwrapPage)
  },

  /** The caller's own listings, every status including PAUSED. */
  getMyListings: (
    status: ServiceListingStatus | null,
    page: number,
    size = 20,
  ): Promise<SpringPage<ServiceListingSummaryResponse>> => {
    const params: QueryParams = { page, size }
    if (status) params.status = status
    return api.get<ApiResponse<SpringPage<ServiceListingSummaryResponse>>>('/services/me', { params }).then(unwrapPage)
  },

  /** A PAUSED listing is masked as 404 unless the caller is the provider or an ADMIN. */
  getListing: (listingId: number): Promise<ServiceListingResponse> =>
    api.get<ApiResponse<ServiceListingResponse>>(`/services/${listingId}`).then(unwrap),

  update: (listingId: number, body: UpdateServiceListingRequest): Promise<ServiceListingResponse> =>
    api.put<ApiResponse<ServiceListingResponse>>(`/services/${listingId}`, body).then(unwrap),

  /** ACTIVE<->PAUSED — the listing availability toggle. */
  changeStatus: (listingId: number, body: ServiceListingStatusUpdateRequest): Promise<ServiceListingResponse> =>
    api.patch<ApiResponse<ServiceListingResponse>>(`/services/${listingId}/status`, body).then(unwrap),

  /** Soft delete. Blocked (400) while the listing has any non-terminal order. */
  remove: (listingId: number): Promise<void> =>
    api.delete<ApiResponse<null>>(`/services/${listingId}`).then(() => undefined),

  /** Owner/ADMIN only. */
  getStats: (listingId: number): Promise<ServiceListingStatsResponse> =>
    api.get<ApiResponse<ServiceListingStatsResponse>>(`/services/${listingId}/stats`).then(unwrap),

  /**
   * "Message the provider" — finds or creates a DIRECT conversation, no order required. Delegates
   * straight to the existing messaging module server-side; the frontend just navigates there.
   */
  inquire: (listingId: number): Promise<ConversationResponse> =>
    api.post<ApiResponse<ConversationResponse>>(`/services/${listingId}/inquire`).then(unwrap),
}
