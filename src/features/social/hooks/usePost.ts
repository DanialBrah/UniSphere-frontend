import { useQuery } from '@tanstack/react-query'
import { postApi } from '../api/postApi'
import { socialKeys } from '../types'

export function usePost(postId: number) {
  return useQuery({
    queryKey: socialKeys.post(postId),
    queryFn: () => postApi.getPost(postId),
    enabled: postId > 0,
  })
}
