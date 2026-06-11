import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { commentApi } from '../api/commentApi'
import { socialKeys } from '../types'

export function useDeleteComment(postId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: number) => commentApi.deleteComment(postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.postComments(postId) })
      queryClient.invalidateQueries({ queryKey: socialKeys.post(postId) })
      toast.success('Comment deleted')
    },
    onError: () => {
      toast.error('Failed to delete comment')
    },
  })
}
