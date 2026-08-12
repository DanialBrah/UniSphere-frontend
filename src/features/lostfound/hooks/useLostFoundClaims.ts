import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { lostFoundClaimApi } from '../api/lostFoundClaimApi'
import { lostFoundErrorMessage } from '../utils/lostFoundErrors'
import { PRESIGNED_URL_REFRESH } from './useLostFoundQueries'
import { lostFoundKeys } from '../types'
import type {
  CreateLostFoundClaimRequest,
  LostFoundClaimDecisionRequest,
  LostFoundClaimResponse,
  LostFoundClaimStatus,
  SpringPage,
} from '../types'

function nextPage(lastPage: SpringPage<LostFoundClaimResponse>): number | undefined {
  return lastPage.last ? undefined : lastPage.number + 1
}

/**
 * Approving a claim is one server transaction that does three things: approves it, flips the item
 * to CLAIMED, and auto-rejects every sibling PENDING claim. Any decision therefore has to refresh
 * the item alongside the claim lists, or the page shows an OPEN item with an approved claim on it.
 */
function invalidateAfterDecision(queryClient: QueryClient, itemId: number) {
  queryClient.invalidateQueries({ queryKey: lostFoundKeys.itemClaimsAll(itemId) })
  queryClient.invalidateQueries({ queryKey: lostFoundKeys.myClaimsAll() })
  queryClient.invalidateQueries({ queryKey: lostFoundKeys.detail(itemId) })
  queryClient.invalidateQueries({ queryKey: lostFoundKeys.lists() })
  queryClient.invalidateQueries({ queryKey: lostFoundKeys.mineAll() })
  queryClient.invalidateQueries({ queryKey: lostFoundKeys.maps() })
  queryClient.invalidateQueries({ queryKey: lostFoundKeys.stats() })
}

/**
 * Claims on one item. The reporter sees all of them, a claimant sees only their own, anyone else
 * gets a 403.
 *
 * `/lost-found/items/*&#47;claims` is rate-limited to 10 requests per 60 s per user and that covers
 * the GET, so this must never be polled. `enabled` is a required argument rather than an optional
 * one to make callers decide explicitly.
 */
export function useItemClaims(
  itemId: number,
  status: LostFoundClaimStatus | null,
  enabled: boolean,
) {
  return useInfiniteQuery({
    queryKey: lostFoundKeys.itemClaims(itemId, status ?? 'ALL'),
    queryFn: ({ pageParam }) => lostFoundClaimApi.listForItem(itemId, status, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled: enabled && itemId > 0,
    ...PRESIGNED_URL_REFRESH,
  })
}

export function useMyClaims(status: LostFoundClaimStatus | null, enabled = true) {
  return useInfiniteQuery({
    queryKey: lostFoundKeys.myClaims(status ?? 'ALL'),
    queryFn: ({ pageParam }) => lostFoundClaimApi.listMine(status, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled,
    ...PRESIGNED_URL_REFRESH,
  })
}

/** Backs the notification deep-link, which carries a claim id rather than an item id. */
export function useLostFoundClaim(claimId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: lostFoundKeys.claimDetail(claimId),
    queryFn: () => lostFoundClaimApi.get(claimId),
    enabled: options?.enabled ?? claimId > 0,
    ...PRESIGNED_URL_REFRESH,
  })
}

export function useSubmitLostFoundClaim(itemId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateLostFoundClaimRequest) => lostFoundClaimApi.submit(itemId, body),
    onSuccess: (claim: LostFoundClaimResponse) => {
      queryClient.setQueryData(lostFoundKeys.claimDetail(claim.id), claim)
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.itemClaimsAll(itemId) })
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.myClaimsAll() })
      // The item carries pendingClaimCount and the viewer's own viewerClaimStatus, both now stale.
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.detail(itemId) })
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.lists() })
      toast.success('Claim submitted — the reporter has been notified')
    },
    onError: (err) => toast.error(lostFoundErrorMessage(err)),
  })
}

const DECISION_TOAST: Record<LostFoundClaimDecisionRequest['status'], string> = {
  APPROVED: 'Claim approved — other pending claims on this item were declined',
  REJECTED: 'Claim declined',
  CANCELLED: 'Claim withdrawn',
}

/**
 * One mutation for all three outcomes: APPROVED and REJECTED by the item's reporter, CANCELLED by
 * the claimant. `itemId` is passed in rather than read off the response so the invalidation is
 * correct even when the request fails partway.
 */
export function useDecideLostFoundClaim(itemId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ claimId, ...body }: LostFoundClaimDecisionRequest & { claimId: number }) =>
      lostFoundClaimApi.decide(claimId, body),
    onSuccess: (claim: LostFoundClaimResponse) => {
      queryClient.setQueryData(lostFoundKeys.claimDetail(claim.id), claim)
      invalidateAfterDecision(queryClient, itemId)
      toast.success(DECISION_TOAST[claim.status as LostFoundClaimDecisionRequest['status']])
    },
    onError: (err) => toast.error(lostFoundErrorMessage(err)),
  })
}
