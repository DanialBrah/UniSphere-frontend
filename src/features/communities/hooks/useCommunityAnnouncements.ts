import { useInfiniteQuery } from '@tanstack/react-query'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'
import type { CommunityAnnouncementResponse, SpringPage } from '../types'

const nextPage = (last: SpringPage<CommunityAnnouncementResponse>) =>
  last.last ? undefined : last.number + 1

export function useCommunityAnnouncements(communityId: number) {
  return useInfiniteQuery({
    queryKey: communityKeys.announcementsInfinite(communityId),
    queryFn: ({ pageParam }) => communityApi.getAnnouncements(communityId, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled: communityId > 0,
  })
}
