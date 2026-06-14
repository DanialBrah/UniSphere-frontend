import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { commentApi } from '../api/commentApi'
import { socialKeys } from '../types'
import type { CreateCommentRequest, PostResponse } from '../types'

export function useCreateComment(postId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateCommentRequest) => commentApi.createComment(postId, body),
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<PostResponse>(socialKeys.post(postId), (old) =>
        old ? { ...old, commentCount: old.commentCount + 1 } : old,
      )
      queryClient.invalidateQueries({ queryKey: socialKeys.postComments(postId) })
      queryClient.invalidateQueries({ queryKey: socialKeys.post(postId) })
      queryClient.invalidateQueries({ queryKey: socialKeys.feedInfinite() })
      if (variables.parentCommentId) {
        queryClient.invalidateQueries({ queryKey: socialKeys.commentReplies(postId, variables.parentCommentId) })
      }
    },
    onError: () => {
      toast.error('Failed to post comment')
    },
  })
}
