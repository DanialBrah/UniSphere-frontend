import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { postApi } from '../api/postApi'
import { socialKeys } from '../types'

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postApi.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.feedInfinite() })
      // Invalidate user posts cache
      queryClient.invalidateQueries({ queryKey: ['social', 'userPosts'], exact: false })
      toast.success('Post created')
    },
    onError: () => {
      toast.error('Failed to create post')
    },
  })
}
