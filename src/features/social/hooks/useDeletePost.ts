import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { postApi } from '../api/postApi'
import { socialKeys } from '../types'

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postId: number) => postApi.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.feedInfinite() })
      toast.success('Post deleted')
    },
    onError: () => {
      toast.error('Failed to delete post')
    },
  })
}
