import api from '../../../lib/axios'
import type {
  ApiResponse,
  CreateServiceOrderRequest,
  ServiceOrderResponse,
  ServiceOrderStatus,
  ServiceOrderStatusUpdateRequest,
  SpringPage,
} from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data
const unwrapPage = <T>(r: { data: ApiResponse<SpringPage<T>> }): SpringPage<T> => r.data.data

type QueryParams = Record<string, string | number>

/**
 * "Request this service" (place order) and the listing-scoped roster nest under `/services/{id}`;
 * "my orders"/"received orders" and single-order reads/status changes are flat, since an order id
 * is globally unique — the same nested-vs-flat split `jobApplicationApi` draws.
 */
export const serviceOrderApi = {
  /** Everyone but ADMIN; auto-opens/reuses a DM with the provider and posts a SYSTEM summary message. Rate-limited 10/60s. */
  createOrder: (listingId: number, body: CreateServiceOrderRequest): Promise<ServiceOrderResponse> =>
    api.post<ApiResponse<ServiceOrderResponse>>(`/services/${listingId}/orders`, body).then(unwrap),

  /** Owner/ADMIN only — the order roster for one listing. */
  listOrdersForListing: (
    listingId: number,
    status: ServiceOrderStatus | null,
    page: number,
    size = 20,
  ): Promise<SpringPage<ServiceOrderResponse>> => {
    const params: QueryParams = { page, size }
    if (status) params.status = status
    return api
      .get<ApiResponse<SpringPage<ServiceOrderResponse>>>(`/services/${listingId}/orders`, { params })
      .then(unwrapPage)
  },

  /** "My orders" — every order the caller has placed as a client, across every listing. */
  myOrders: (status: ServiceOrderStatus | null, page: number, size = 20): Promise<SpringPage<ServiceOrderResponse>> => {
    const params: QueryParams = { page, size }
    if (status) params.status = status
    return api.get<ApiResponse<SpringPage<ServiceOrderResponse>>>('/services/orders/me', { params }).then(unwrapPage)
  },

  /** "Orders received" — every order placed against a listing the caller provides, across every listing they own. */
  receivedOrders: (
    status: ServiceOrderStatus | null,
    page: number,
    size = 20,
  ): Promise<SpringPage<ServiceOrderResponse>> => {
    const params: QueryParams = { page, size }
    if (status) params.status = status
    return api
      .get<ApiResponse<SpringPage<ServiceOrderResponse>>>('/services/orders/received', { params })
      .then(unwrapPage)
  },

  /** Visible to the order's client, its listing's provider, or an ADMIN. */
  getOrder: (orderId: number): Promise<ServiceOrderResponse> =>
    api.get<ApiResponse<ServiceOrderResponse>>(`/services/orders/${orderId}`).then(unwrap),

  /** The single entry point for every actor in the order state machine — see `utils/permissions.ts`. */
  updateOrderStatus: (orderId: number, body: ServiceOrderStatusUpdateRequest): Promise<ServiceOrderResponse> =>
    api.patch<ApiResponse<ServiceOrderResponse>>(`/services/orders/${orderId}/status`, body).then(unwrap),
}
