import { useInfiniteQuery } from '@tanstack/react-query'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'
import type { CommunityJoinRequestResponse, JoinRequestStatus, SpringPage } from '../types'

const nextPage = (last: SpringPage<CommunityJoinRequestResponse>) =>
  last.last ? undefined : last.number + 1

export function useJoinRequests(communityId: number, status?: JoinRequestStatus) {
  return useInfiniteQuery({
    queryKey: communityKeys.joinRequestsInfinite(communityId, status),
    queryFn: ({ pageParam }) =>
      communityApi.getJoinRequests(communityId, status, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled: communityId > 0,
  })
}
