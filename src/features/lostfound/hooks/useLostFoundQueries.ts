import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { lostFoundApi } from '../api/lostFoundApi'
import { lostFoundKeys } from '../types'
import type {
  LostFoundFilters,
  LostFoundItemStatus,
  LostFoundItemSummaryResponse,
  LostFoundNearbyItemResponse,
  SpringPage,
} from '../types'

/** Spring pages are 0-indexed and carry `last`, so this is the same for every list here. */
function nextPage<T>(lastPage: SpringPage<T>): number | undefined {
  return lastPage.last ? undefined : lastPage.number + 1
}

/**
 * Item photos, gallery media, claim proof images and avatars all arrive as presigned URLs that
 * expire after about an hour, and the global query config sets refetchOnWindowFocus: false.
 * Without this override a tab left open overnight renders broken images with no way to recover;
 * refetching on focus re-mints the URLs at exactly the moment the user would otherwise notice.
 *
 * Scoped per-query rather than changed in lib/queryClient.ts, which would alter messaging,
 * notifications and connect behaviour for a Lost & Found-only problem.
 */
export const PRESIGNED_URL_REFRESH = { refetchOnWindowFocus: true } as const

export function useLostFoundFeed(filters: LostFoundFilters, enabled = true) {
  return useInfiniteQuery({
    queryKey: lostFoundKeys.list(filters),
    queryFn: ({ pageParam }) => lostFoundApi.getFeed(filters, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage: SpringPage<LostFoundItemSummaryResponse>) => nextPage(lastPage),
    enabled,
    ...PRESIGNED_URL_REFRESH,
  })
}

/** The FULLTEXT boolean operators LostFoundService strips server-side before searching. */
const FULLTEXT_OPERATORS = /[+\-><()~*"@]/g

export function sanitizeLostFoundQuery(q: string): string {
  return q.replace(FULLTEXT_OPERATORS, ' ').trim()
}

export const LOST_FOUND_SEARCH_MIN_LENGTH = 3

/**
 * MySQL's innodb_ft_min_token_size defaults to 3 and applies **per token**, not to the query as a
 * whole — so a search is only worth sending if some word survives sanitisation at three characters
 * or more. `q` is also a required param: omitting it binds to null and surfaces as a 500.
 */
export function isSearchableLostFoundQuery(q: string): boolean {
  return sanitizeLostFoundQuery(q)
    .split(/\s+/)
    .some((token) => token.length >= LOST_FOUND_SEARCH_MIN_LENGTH)
}

export function useLostFoundSearch(q: string, filters: LostFoundFilters) {
  const trimmed = q.trim()
  return useInfiniteQuery({
    queryKey: lostFoundKeys.search(`${trimmed}|${filters.type ?? ''}|${filters.status ?? ''}`),
    queryFn: ({ pageParam }) => lostFoundApi.search(trimmed, filters, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage: SpringPage<LostFoundItemSummaryResponse>) => nextPage(lastPage),
    enabled: isSearchableLostFoundQuery(q),
    ...PRESIGNED_URL_REFRESH,
  })
}

/** The caller's own reports, every status — the only list that shows CANCELLED and EXPIRED items. */
export function useMyLostFoundItems(status: LostFoundItemStatus | null, enabled = true) {
  return useInfiniteQuery({
    queryKey: lostFoundKeys.mine(status ?? 'ALL'),
    queryFn: ({ pageParam }) => lostFoundApi.getMyItems(status, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage: SpringPage<LostFoundItemSummaryResponse>) => nextPage(lastPage),
    enabled,
    ...PRESIGNED_URL_REFRESH,
  })
}

export function useNearbyLostFoundItems(
  lat: number | null,
  lng: number | null,
  radiusKm: number,
  filters: LostFoundFilters,
) {
  return useInfiniteQuery({
    queryKey: lostFoundKeys.nearby(lat ?? 0, lng ?? 0, radiusKm),
    queryFn: ({ pageParam }) =>
      lostFoundApi.getNearby(lat as number, lng as number, radiusKm, filters, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage: SpringPage<LostFoundNearbyItemResponse>) => nextPage(lastPage),
    enabled: lat != null && lng != null,
    ...PRESIGNED_URL_REFRESH,
  })
}

export function useLostFoundItem(itemId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: lostFoundKeys.detail(itemId),
    queryFn: () => lostFoundApi.getItem(itemId),
    enabled: options?.enabled ?? itemId > 0,
    ...PRESIGNED_URL_REFRESH,
  })
}

export function useLostFoundStats(enabled = true) {
  return useQuery({
    queryKey: lostFoundKeys.stats(),
    queryFn: () => lostFoundApi.getStats(),
    enabled,
  })
}

/**
 * Reporter or ADMIN only — the server answers everyone else with a 403, and the global retry
 * config already treats 403 as non-retryable. Gate `enabled` on ownership so the request is never
 * sent for a viewer who cannot see it.
 */
export function useLostFoundMatches(itemId: number, enabled: boolean) {
  return useQuery({
    queryKey: lostFoundKeys.matches(itemId),
    queryFn: () => lostFoundApi.getMatches(itemId),
    enabled: enabled && itemId > 0,
    ...PRESIGNED_URL_REFRESH,
  })
}
