import { useInfiniteQuery } from '@tanstack/react-query'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'
import type { CommunityBanResponse, SpringPage } from '../types'

const nextPage = (last: SpringPage<CommunityBanResponse>) =>
  last.last ? undefined : last.number + 1

export function useCommunityBans(communityId: number) {
  return useInfiniteQuery({
    queryKey: communityKeys.bansInfinite(communityId),
    queryFn: ({ pageParam }) => communityApi.getBans(communityId, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled: communityId > 0,
  })
}
