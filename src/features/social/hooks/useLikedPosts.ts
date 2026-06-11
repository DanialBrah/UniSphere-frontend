import { useInfiniteQuery } from '@tanstack/react-query'
import { postApi } from '../api/postApi'
import { socialKeys } from '../types'

export function useLikedPosts() {
  return useInfiniteQuery({
    queryKey: socialKeys.likedInfinite(),
    queryFn: ({ pageParam }) => postApi.getLikedPosts(pageParam as number, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
  })
}
