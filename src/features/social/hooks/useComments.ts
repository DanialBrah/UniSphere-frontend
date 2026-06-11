import { useInfiniteQuery } from '@tanstack/react-query'
import { commentApi } from '../api/commentApi'
import { socialKeys } from '../types'

export function useComments(postId: number) {
  return useInfiniteQuery({
    queryKey: socialKeys.postComments(postId),
    queryFn: ({ pageParam }) => commentApi.getComments(postId, pageParam as number, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    enabled: postId > 0,
  })
}
