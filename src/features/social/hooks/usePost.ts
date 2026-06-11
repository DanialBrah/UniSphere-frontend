import { useQuery } from '@tanstack/react-query'
import { postApi } from '../api/postApi'
import { socialKeys } from '../types'

export function usePost(postId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: socialKeys.post(postId),
    queryFn: () => postApi.getPost(postId),
    enabled: options?.enabled !== undefined ? options.enabled : postId > 0,
  })
}
