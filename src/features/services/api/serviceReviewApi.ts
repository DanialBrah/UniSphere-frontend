import api from '../../../lib/axios'
import type { ApiResponse, CreateServiceReviewRequest, ServiceReviewResponse, SpringPage } from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data
const unwrapPage = <T>(r: { data: ApiResponse<SpringPage<T>> }): SpringPage<T> => r.data.data

export const serviceReviewApi = {
  /** Public — client-authored reviews of the provider for one listing. */
  listForListing: (listingId: number, page: number, size = 20): Promise<SpringPage<ServiceReviewResponse>> =>
    api
      .get<ApiResponse<SpringPage<ServiceReviewResponse>>>(`/services/${listingId}/reviews`, {
        params: { page, size },
      })
      .then(unwrapPage),

  /** COMPLETED orders only, one per person per order — client or provider. */
  create: (orderId: number, body: CreateServiceReviewRequest): Promise<ServiceReviewResponse> =>
    api.post<ApiResponse<ServiceReviewResponse>>(`/services/orders/${orderId}/reviews`, body).then(unwrap),

  /** Both sides' reviews for one order — used to tell whether the caller has already reviewed it. */
  listForOrder: (orderId: number): Promise<ServiceReviewResponse[]> =>
    api.get<ApiResponse<ServiceReviewResponse[]>>(`/services/orders/${orderId}/reviews`).then(unwrap),
}
