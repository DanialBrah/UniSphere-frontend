import { useInfiniteQuery } from '@tanstack/react-query'
import { postApi } from '../api/postApi'

export function useUserPosts(userId: number) {
  return useInfiniteQuery({
    queryKey: ['social', 'userPosts', userId],
    queryFn: ({ pageParam }) => postApi.getUserPosts(userId, pageParam as number, 10),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    enabled: userId > 0,
  })
}
