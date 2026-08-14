import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { serviceReviewApi } from '../api/serviceReviewApi'
import { serviceErrorMessage } from '../utils/serviceErrors'
import { serviceKeys } from '../types'
import type { CreateServiceReviewRequest, ServiceReviewResponse, SpringPage } from '../types'

function nextPage(lastPage: SpringPage<ServiceReviewResponse>): number | undefined {
  return lastPage.last ? undefined : lastPage.number + 1
}

/** Public — client-authored reviews of the provider, shown on the listing detail page. */
export function useServiceListingReviews(listingId: number, enabled = true) {
  return useInfiniteQuery({
    queryKey: serviceKeys.reviewsForListing(listingId),
    queryFn: ({ pageParam }) => serviceReviewApi.listForListing(listingId, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled: enabled && listingId > 0,
  })
}

/** Both sides' reviews for one order — used to tell whether the caller has already reviewed it. */
export function useOrderReviews(orderId: number, enabled: boolean) {
  return useQuery({
    queryKey: serviceKeys.orderReviews(orderId),
    queryFn: () => serviceReviewApi.listForOrder(orderId),
    enabled: enabled && orderId > 0,
  })
}

export function useCreateServiceReview(orderId: number, listingId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateServiceReviewRequest) => serviceReviewApi.create(orderId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.orderReviews(orderId) })
      queryClient.invalidateQueries({ queryKey: serviceKeys.reviewsForListing(listingId) })
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(listingId) })
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() })
      toast.success('Review submitted')
    },
    onError: (err) => toast.error(serviceErrorMessage(err)),
  })
}
