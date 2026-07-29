import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { connectApi } from '../api/connectApi'
import { connectKeys } from '../types'
import type { SpringPage } from '../../social/types'
import type { PersonSummary } from '../types'

const nextPage = (last: SpringPage<PersonSummary>) => (last.last ? undefined : last.number + 1)

/** People you may know. A short curated list, so a plain query rather than infinite scroll. */
export function useRecommendations(limit = 12) {
  return useQuery({
    queryKey: connectKeys.recommendations(),
    queryFn: () => connectApi.getRecommendations(limit),
  })
}

export function usePeopleSearch(query: string) {
  const q = query.trim()
  return useInfiniteQuery({
    queryKey: connectKeys.search(q),
    queryFn: ({ pageParam }) => connectApi.searchPeople(q, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    // The backend requires a non-empty q, so don't fire on an empty box
    enabled: q.length > 0,
  })
}

export function useFollowers(userId: number | null) {
  return useInfiniteQuery({
    queryKey: connectKeys.followers(userId ?? 0),
    queryFn: ({ pageParam }) => connectApi.getFollowers(userId!, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled: userId !== null && userId > 0,
  })
}

export function useFollowing(userId: number | null) {
  return useInfiniteQuery({
    queryKey: connectKeys.following(userId ?? 0),
    queryFn: ({ pageParam }) => connectApi.getFollowing(userId!, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled: userId !== null && userId > 0,
  })
}

export function useFollowStats(userId: number | null) {
  return useQuery({
    queryKey: connectKeys.stats(userId ?? 0),
    queryFn: () => connectApi.getFollowStats(userId!),
    enabled: userId !== null && userId > 0,
  })
}
