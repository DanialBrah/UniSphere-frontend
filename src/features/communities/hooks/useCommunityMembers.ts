import { useInfiniteQuery } from '@tanstack/react-query'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'
import type { CommunityMemberResponse, SpringPage } from '../types'

const nextPage = (last: SpringPage<CommunityMemberResponse>) =>
  last.last ? undefined : last.number + 1

export function useCommunityMembers(communityId: number) {
  return useInfiniteQuery({
    queryKey: communityKeys.membersInfinite(communityId),
    queryFn: ({ pageParam }) => communityApi.getMembers(communityId, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled: communityId > 0,
  })
}
