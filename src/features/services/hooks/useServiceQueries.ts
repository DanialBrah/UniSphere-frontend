import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { serviceApi } from '../api/serviceApi'
import { serviceKeys } from '../types'
import type { ServiceFilters, ServiceListingStatus, ServiceListingSummaryResponse, SpringPage } from '../types'

/** Spring pages are 0-indexed and carry `last`, so this is the same for every list here. */
function nextPage<T>(lastPage: SpringPage<T>): number | undefined {
  return lastPage.last ? undefined : lastPage.number + 1
}

/**
 * Avatar and portfolio-image URLs all arrive as presigned URLs that expire after about an hour, and
 * the global query config sets refetchOnWindowFocus: false. Without this override a tab left open
 * renders a dead image with no way to recover; refetching on focus re-mints the URLs at exactly the
 * moment the user would otherwise notice. Same precedent as Jobs/Lost & Found.
 */
export const PRESIGNED_URL_REFRESH = { refetchOnWindowFocus: true } as const

export function useServiceFeed(filters: ServiceFilters, enabled = true) {
  return useInfiniteQuery({
    queryKey: serviceKeys.list(filters),
    queryFn: ({ pageParam }) => serviceApi.getFeed(filters, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage: SpringPage<ServiceListingSummaryResponse>) => nextPage(lastPage),
    enabled,
    ...PRESIGNED_URL_REFRESH,
  })
}

/** The FULLTEXT boolean operators ServiceListingService strips server-side before searching. */
const FULLTEXT_OPERATORS = /[+\-><()~*"@]/g

export function sanitizeServiceQuery(q: string): string {
  return q.replace(FULLTEXT_OPERATORS, ' ').trim()
}

export const SERVICE_SEARCH_MIN_LENGTH = 3

/**
 * MySQL's innodb_ft_min_token_size defaults to 3 and applies per token, so a search is only worth
 * sending if some word survives sanitisation at three characters or more. `q` is also a required
 * param: omitting it binds to null and surfaces as a 500. Same gotcha as Jobs' search.
 */
export function isSearchableServiceQuery(q: string): boolean {
  return sanitizeServiceQuery(q)
    .split(/\s+/)
    .some((token) => token.length >= SERVICE_SEARCH_MIN_LENGTH)
}

export function useServiceSearch(q: string, category: string | null) {
  const trimmed = q.trim()
  return useInfiniteQuery({
    queryKey: serviceKeys.search(trimmed, category ?? 'ALL'),
    queryFn: ({ pageParam }) => serviceApi.search(trimmed, category, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage: SpringPage<ServiceListingSummaryResponse>) => nextPage(lastPage),
    enabled: isSearchableServiceQuery(q),
    ...PRESIGNED_URL_REFRESH,
  })
}

/** The caller's own listings, every status including PAUSED. */
export function useMyServiceListings(status: ServiceListingStatus | null, enabled = true) {
  return useInfiniteQuery({
    queryKey: serviceKeys.mine(status ?? 'ALL'),
    queryFn: ({ pageParam }) => serviceApi.getMyListings(status, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage: SpringPage<ServiceListingSummaryResponse>) => nextPage(lastPage),
    enabled,
    ...PRESIGNED_URL_REFRESH,
  })
}

export function useServiceListing(listingId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: serviceKeys.detail(listingId),
    queryFn: () => serviceApi.getListing(listingId),
    enabled: options?.enabled ?? listingId > 0,
    ...PRESIGNED_URL_REFRESH,
  })
}

/** Owner/ADMIN only — the server 403s everyone else, so gate `enabled` on `listing.canModify`. */
export function useServiceListingStats(listingId: number, enabled: boolean) {
  return useQuery({
    queryKey: serviceKeys.stats(listingId),
    queryFn: () => serviceApi.getStats(listingId),
    enabled: enabled && listingId > 0,
  })
}
