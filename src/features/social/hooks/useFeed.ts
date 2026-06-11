import { useInfiniteQuery } from '@tanstack/react-query'
import { postApi } from '../api/postApi'
import { socialKeys } from '../types'

export function useFeed() {
  return useInfiniteQuery({
    queryKey: socialKeys.feedInfinite(),
    queryFn: ({ pageParam }) => postApi.getFeed(pageParam as number, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
  })
}
