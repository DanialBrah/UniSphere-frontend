import { useInfiniteQuery } from '@tanstack/react-query'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'
import type { PostResponse, SpringPage } from '../../social/types'

const nextPage = (last: SpringPage<PostResponse>) => (last.last ? undefined : last.number + 1)

export function useCommunityPosts(communityId: number) {
  return useInfiniteQuery({
    queryKey: communityKeys.postsInfinite(communityId),
    queryFn: ({ pageParam }) => communityApi.getPosts(communityId, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled: communityId > 0,
  })
}
