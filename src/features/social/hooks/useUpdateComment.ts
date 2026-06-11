import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { commentApi } from '../api/commentApi'
import { socialKeys } from '../types'
import type { UpdateCommentRequest } from '../types'

export function useUpdateComment(postId: number, commentId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateCommentRequest) =>
      commentApi.updateComment(postId, commentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.postComments(postId) })
      toast.success('Comment updated')
    },
    onError: () => {
      toast.error('Failed to update comment')
    },
  })
}
