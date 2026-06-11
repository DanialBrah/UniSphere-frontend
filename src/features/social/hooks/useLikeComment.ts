import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { commentApi } from '../api/commentApi'
import { socialKeys } from '../types'
import type { CommentResponse, SpringPage } from '../types'

interface InfiniteData {
  pages: SpringPage<CommentResponse>[]
  pageParams: unknown[]
}

export function useLikeComment(postId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: number) => commentApi.toggleLike(postId, commentId),

    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: socialKeys.postComments(postId) })

      const previous = queryClient.getQueryData<InfiniteData>(socialKeys.postComments(postId))

      queryClient.setQueryData<InfiniteData>(socialKeys.postComments(postId), (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            content: page.content.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    liked: !comment.liked,
                    likesCount: comment.liked
                      ? comment.likesCount - 1
                      : comment.likesCount + 1,
                  }
                : comment,
            ),
          })),
        }
      })

      return { previous }
    },

    onError: (_err, _commentId, context) => {
      if (context?.previous !== undefined)
        queryClient.setQueryData(socialKeys.postComments(postId), context.previous)
      toast.error('Failed to update like')
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.postComments(postId) })
    },
  })
}
