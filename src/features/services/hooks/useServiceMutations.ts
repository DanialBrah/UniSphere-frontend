import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { serviceApi } from '../api/serviceApi'
import { serviceErrorMessage } from '../utils/serviceErrors'
import { LISTING_STATUS_LABEL } from '../utils/display'
import { serviceKeys } from '../types'
import type { CreateServiceListingRequest, ServiceListingResponse, ServiceListingStatusUpdateRequest, UpdateServiceListingRequest } from '../types'

/** Every list surface that could contain the changed listing. */
function invalidateServiceLists(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: serviceKeys.lists() })
  queryClient.invalidateQueries({ queryKey: serviceKeys.searches() })
  queryClient.invalidateQueries({ queryKey: serviceKeys.mineAll() })
}

export function useCreateServiceListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateServiceListingRequest) => serviceApi.create(body),
    onSuccess: (listing: ServiceListingResponse) => {
      queryClient.setQueryData(serviceKeys.detail(listing.id), listing)
      invalidateServiceLists(queryClient)
      toast.success('Service listing created')
    },
    onError: (err) => toast.error(serviceErrorMessage(err)),
  })
}

export function useUpdateServiceListing(listingId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateServiceListingRequest) => serviceApi.update(listingId, body),
    onSuccess: (listing: ServiceListingResponse) => {
      queryClient.setQueryData(serviceKeys.detail(listing.id), listing)
      invalidateServiceLists(queryClient)
      toast.success('Listing updated')
    },
    onError: (err) => toast.error(serviceErrorMessage(err)),
  })
}

export function useChangeServiceListingStatus(listingId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: ServiceListingStatusUpdateRequest) => serviceApi.changeStatus(listingId, body),
    onSuccess: (listing: ServiceListingResponse) => {
      queryClient.setQueryData(serviceKeys.detail(listing.id), listing)
      invalidateServiceLists(queryClient)
      toast.success(
        listing.status === 'PAUSED'
          ? `Listing ${LISTING_STATUS_LABEL.PAUSED.toLowerCase()} — it drops off Browse until you resume it`
          : `Listing ${LISTING_STATUS_LABEL.ACTIVE.toLowerCase()}`,
      )
    },
    onError: (err) => toast.error(serviceErrorMessage(err)),
  })
}

export function useDeleteServiceListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (listingId: number) => serviceApi.remove(listingId),
    onSuccess: (_data, listingId) => {
      // Removed rather than invalidated: the row is soft-deleted server-side, so a refetch of this
      // key would 404 and leave an error state cached behind the redirect.
      queryClient.removeQueries({ queryKey: serviceKeys.detail(listingId) })
      queryClient.removeQueries({ queryKey: serviceKeys.stats(listingId) })
      queryClient.removeQueries({ queryKey: serviceKeys.orderRosterAll(listingId) })
      invalidateServiceLists(queryClient)
      toast.success('Listing deleted')
    },
    onError: (err) => toast.error(serviceErrorMessage(err)),
  })
}

/**
 * "Message the provider" — no order, just a DM. The caller (`ServiceOrderPanel`) is responsible for
 * navigating to `/messages` and activating the returned conversation on success; this hook only
 * performs the request and surfaces an error.
 */
export function useInquireService(listingId: number) {
  return useMutation({
    mutationFn: () => serviceApi.inquire(listingId),
    onError: (err) => toast.error(serviceErrorMessage(err)),
  })
}
