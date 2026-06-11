import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { postApi } from '../api/postApi'
import { socialKeys } from '../types'

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postId: number) => postApi.deletePost(postId),
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: socialKeys.feedInfinite() })
      queryClient.invalidateQueries({ queryKey: socialKeys.post(postId) })
      queryClient.invalidateQueries({ queryKey: socialKeys.likedInfinite() })
      queryClient.invalidateQueries({ queryKey: socialKeys.savedInfinite() })
      // Invalidate user posts cache
      queryClient.invalidateQueries({ queryKey: ['social', 'userPosts'], exact: false })
      toast.success('Post deleted')
    },
    onError: () => {
      toast.error('Failed to delete post')
    },
  })
}
