import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { serviceOrderApi } from '../api/serviceOrderApi'
import { serviceErrorMessage } from '../utils/serviceErrors'
import { serviceKeys } from '../types'
import type {
  CreateServiceOrderRequest,
  ServiceOrderResponse,
  ServiceOrderStatus,
  ServiceOrderStatusUpdateRequest,
  SpringPage,
} from '../types'

function nextPage(lastPage: SpringPage<ServiceOrderResponse>): number | undefined {
  return lastPage.last ? undefined : lastPage.number + 1
}

/** Every surface an order write could be reflected on. */
function invalidateAfterOrderChange(queryClient: QueryClient, listingId: number, orderId?: number) {
  queryClient.invalidateQueries({ queryKey: serviceKeys.orderRosterAll(listingId) })
  queryClient.invalidateQueries({ queryKey: serviceKeys.stats(listingId) })
  queryClient.invalidateQueries({ queryKey: serviceKeys.myOrdersAll() })
  queryClient.invalidateQueries({ queryKey: serviceKeys.receivedOrdersAll() })
  if (orderId) queryClient.invalidateQueries({ queryKey: serviceKeys.orderDetail(orderId) })
}

// ── Reads ────────────────────────────────────────────────────────────────────

/** Owner/ADMIN only — the order roster for one listing. */
export function useServiceOrderRoster(listingId: number, status: ServiceOrderStatus | null, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: serviceKeys.orderRoster(listingId, status ?? 'ALL'),
    queryFn: ({ pageParam }) => serviceOrderApi.listOrdersForListing(listingId, status, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled: enabled && listingId > 0,
  })
}

/** "My orders" — every order the caller has placed as a client, across every listing. */
export function useMyServiceOrders(status: ServiceOrderStatus | null, enabled = true) {
  return useInfiniteQuery({
    queryKey: serviceKeys.myOrders(status ?? 'ALL'),
    queryFn: ({ pageParam }) => serviceOrderApi.myOrders(status, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled,
  })
}

/** "Orders received" — every order placed against a listing the caller provides. */
export function useReceivedServiceOrders(status: ServiceOrderStatus | null, enabled = true) {
  return useInfiniteQuery({
    queryKey: serviceKeys.receivedOrders(status ?? 'ALL'),
    queryFn: ({ pageParam }) => serviceOrderApi.receivedOrders(status, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled,
  })
}

export function useServiceOrder(orderId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: serviceKeys.orderDetail(orderId),
    queryFn: () => serviceOrderApi.getOrder(orderId),
    enabled: options?.enabled ?? orderId > 0,
  })
}

// ── Writes ───────────────────────────────────────────────────────────────────

/**
 * "Request this service" — creates the order; the backend auto-opens/reuses a DM with the provider
 * and drops a SYSTEM summary message into it. The caller navigates to `/messages` and activates
 * `conversationId` on success — the concrete "reach out via messaging" step for a formal request.
 */
export function useCreateServiceOrder(listingId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateServiceOrderRequest) => serviceOrderApi.createOrder(listingId, body),
    onSuccess: (order: ServiceOrderResponse) => {
      queryClient.setQueryData(serviceKeys.orderDetail(order.id), order)
      invalidateAfterOrderChange(queryClient, listingId, order.id)
      toast.success('Service order placed')
    },
    onError: (err) => toast.error(serviceErrorMessage(err)),
  })
}

/** The single entry point for every actor in the order state machine — see `utils/permissions.ts`. */
export function useUpdateServiceOrderStatus(orderId: number, listingId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: ServiceOrderStatusUpdateRequest) => serviceOrderApi.updateOrderStatus(orderId, body),
    onSuccess: (order: ServiceOrderResponse) => {
      queryClient.setQueryData(serviceKeys.orderDetail(order.id), order)
      invalidateAfterOrderChange(queryClient, listingId, order.id)
      toast.success('Order updated')
    },
    onError: (err) => toast.error(serviceErrorMessage(err)),
  })
}
