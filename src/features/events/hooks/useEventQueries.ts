import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { eventApi } from '../api/eventApi'
import { eventKeys } from '../types'
import type { EventCategory, EventFilters, EventNearbyResponse, EventStatus, EventSummaryResponse, SpringPage } from '../types'

/** Spring pages are 0-indexed and carry `last`, so this is the same for every list here. */
function nextPage<T>(lastPage: SpringPage<T>): number | undefined {
  return lastPage.last ? undefined : lastPage.number + 1
}

/**
 * Cover images, avatars and organizer avatars all arrive as presigned URLs that expire after about
 * an hour, and the global query config sets refetchOnWindowFocus: false. Without this override a
 * tab left open renders broken images with no way to recover; refetching on focus re-mints the URLs
 * at exactly the moment the user would otherwise notice. Same precedent as Lost & Found.
 */
export const PRESIGNED_URL_REFRESH = { refetchOnWindowFocus: true } as const

export function useEventFeed(filters: EventFilters, enabled = true) {
  return useInfiniteQuery({
    queryKey: eventKeys.list(filters),
    queryFn: ({ pageParam }) => eventApi.getFeed(filters, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage: SpringPage<EventSummaryResponse>) => nextPage(lastPage),
    enabled,
    ...PRESIGNED_URL_REFRESH,
  })
}

/** The FULLTEXT boolean operators EventService strips server-side before searching. */
const FULLTEXT_OPERATORS = /[+\-><()~*"@]/g

export function sanitizeEventQuery(q: string): string {
  return q.replace(FULLTEXT_OPERATORS, ' ').trim()
}

export const EVENT_SEARCH_MIN_LENGTH = 3

/**
 * MySQL's innodb_ft_min_token_size defaults to 3 and applies per token, so a search is only worth
 * sending if some word survives sanitisation at three characters or more. `q` is also a required
 * param: omitting it binds to null and surfaces as a 500.
 */
export function isSearchableEventQuery(q: string): boolean {
  return sanitizeEventQuery(q)
    .split(/\s+/)
    .some((token) => token.length >= EVENT_SEARCH_MIN_LENGTH)
}

export function useEventSearch(q: string, category: EventCategory | null) {
  const trimmed = q.trim()
  return useInfiniteQuery({
    queryKey: eventKeys.search(trimmed, category ?? 'ALL'),
    queryFn: ({ pageParam }) => eventApi.search(trimmed, category, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage: SpringPage<EventSummaryResponse>) => nextPage(lastPage),
    enabled: isSearchableEventQuery(q),
    ...PRESIGNED_URL_REFRESH,
  })
}

export function useNearbyEvents(
  lat: number | null,
  lng: number | null,
  radiusKm: number,
  category: EventCategory | null,
) {
  return useInfiniteQuery({
    queryKey: eventKeys.nearby(lat ?? 0, lng ?? 0, radiusKm, category ?? 'ALL'),
    queryFn: ({ pageParam }) =>
      eventApi.getNearby(lat as number, lng as number, radiusKm, category, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage: SpringPage<EventNearbyResponse>) => nextPage(lastPage),
    enabled: lat != null && lng != null,
    ...PRESIGNED_URL_REFRESH,
  })
}

/** The caller's own events, every status including DRAFT. */
export function useMyEvents(status: EventStatus | null, enabled = true) {
  return useInfiniteQuery({
    queryKey: eventKeys.mine(status ?? 'ALL'),
    queryFn: ({ pageParam }) => eventApi.getMyEvents(status, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage: SpringPage<EventSummaryResponse>) => nextPage(lastPage),
    enabled,
    ...PRESIGNED_URL_REFRESH,
  })
}

export function useEvent(eventId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: eventKeys.detail(eventId),
    queryFn: () => eventApi.getEvent(eventId),
    enabled: options?.enabled ?? eventId > 0,
    ...PRESIGNED_URL_REFRESH,
  })
}

/** Organizer/ADMIN only — the server 403s everyone else, so gate `enabled` on `event.canModify`. */
export function useEventStats(eventId: number, enabled: boolean) {
  return useQuery({
    queryKey: eventKeys.stats(eventId),
    queryFn: () => eventApi.getStats(eventId),
    enabled: enabled && eventId > 0,
  })
}
