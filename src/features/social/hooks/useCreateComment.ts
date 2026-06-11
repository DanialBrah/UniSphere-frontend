import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { commentApi } from '../api/commentApi'
import { socialKeys } from '../types'
import type { CreateCommentRequest } from '../types'

export function useCreateComment(postId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateCommentRequest) => commentApi.createComment(postId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.postComments(postId) })
      queryClient.invalidateQueries({ queryKey: socialKeys.post(postId) })
    },
    onError: () => {
      toast.error('Failed to post comment')
    },
  })
}
