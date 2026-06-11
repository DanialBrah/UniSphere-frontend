import { useInfiniteQuery } from '@tanstack/react-query'
import { postApi } from '../api/postApi'
import { socialKeys } from '../types'

export function useSavedPosts() {
  return useInfiniteQuery({
    queryKey: socialKeys.savedInfinite(),
    queryFn: ({ pageParam }) => postApi.getSavedPosts(pageParam as number, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
  })
}
