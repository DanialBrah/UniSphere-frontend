import { useInfiniteQuery } from '@tanstack/react-query'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'
import type { CommunityResponse, SpringPage } from '../types'

const nextPage = (last: SpringPage<CommunityResponse>) => (last.last ? undefined : last.number + 1)

/** Discovery feed — every community regardless of visibility (existence is always public). */
export function useCommunities() {
  return useInfiniteQuery({
    queryKey: communityKeys.discoverInfinite(),
    queryFn: ({ pageParam }) => communityApi.discover(pageParam as number),
    initialPageParam: 0,
    getNextPageParam: nextPage,
  })
}

export function useCommunitySearch(query: string) {
  const q = query.trim()
  return useInfiniteQuery({
    queryKey: communityKeys.searchInfinite(q),
    queryFn: ({ pageParam }) => communityApi.search(q, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled: q.length > 0,
  })
}

/** Communities the caller is a member of. */
export function useMyCommunities() {
  return useInfiniteQuery({
    queryKey: communityKeys.mineInfinite(),
    queryFn: ({ pageParam }) => communityApi.mine(pageParam as number),
    initialPageParam: 0,
    getNextPageParam: nextPage,
  })
}
