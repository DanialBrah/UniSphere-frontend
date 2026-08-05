import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { newsCommentApi } from '../api/newsCommentApi'
import { newsKeys } from '../types'
import { newsErrorMessage } from '../utils/newsErrors'
import type {
  CreateNewsCommentRequest,
  NewsArticleResponse,
  NewsCommentResponse,
  SpringPage,
  UpdateNewsCommentRequest,
} from '../types'

interface CommentPages {
  pages: SpringPage<NewsCommentResponse>[]
  pageParams: unknown[]
}

export function useNewsComments(articleId: number) {
  return useInfiniteQuery({
    queryKey: newsKeys.comments(articleId),
    queryFn: ({ pageParam }) => newsCommentApi.getComments(articleId, pageParam as number, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
    enabled: articleId > 0,
  })
}

export function useNewsCommentReplies(articleId: number, commentId: number, enabled: boolean) {
  return useQuery({
    queryKey: newsKeys.replies(articleId, commentId),
    queryFn: () =>
      newsCommentApi.getReplies(articleId, commentId, 0, 50).then((page) => page.content),
    enabled: enabled && articleId > 0 && commentId > 0,
  })
}

export function useCreateNewsComment(articleId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateNewsCommentRequest) =>
      newsCommentApi.createComment(articleId, body),

    onSuccess: (_comment, variables) => {
      queryClient.invalidateQueries({ queryKey: newsKeys.comments(articleId) })

      if (variables.parentCommentId) {
        queryClient.invalidateQueries({
          queryKey: newsKeys.replies(articleId, variables.parentCommentId),
        })
      } else {
        // commentCount is a count of top-level comments only, so a reply must not bump it —
        // an unconditional increment would drift upward and then snap back on the next refetch.
        queryClient.setQueryData<NewsArticleResponse>(newsKeys.detail(articleId), (old) =>
          old ? { ...old, commentCount: old.commentCount + 1 } : old,
        )
        queryClient.invalidateQueries({ queryKey: newsKeys.lists() })
      }
    },

    onError: (err) => toast.error(newsErrorMessage(err)),
  })
}

export function useUpdateNewsComment(articleId: number, commentId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateNewsCommentRequest) =>
      newsCommentApi.updateComment(articleId, commentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.comments(articleId) })
      queryClient.invalidateQueries({ queryKey: newsKeys.repliesFor(articleId) })
    },
    onError: (err) => toast.error(newsErrorMessage(err)),
  })
}

export function useDeleteNewsComment(articleId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: number) => newsCommentApi.deleteComment(articleId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.comments(articleId) })
      queryClient.invalidateQueries({ queryKey: newsKeys.repliesFor(articleId) })
      queryClient.invalidateQueries({ queryKey: newsKeys.detail(articleId) })
      queryClient.invalidateQueries({ queryKey: newsKeys.lists() })
      toast.success('Comment deleted')
    },
    onError: (err) => toast.error(newsErrorMessage(err)),
  })
}

export function useLikeNewsComment(articleId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: number) => newsCommentApi.toggleLike(articleId, commentId),

    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: newsKeys.comments(articleId) })
      const previous = queryClient.getQueryData<CommentPages>(newsKeys.comments(articleId))

      queryClient.setQueryData<CommentPages>(newsKeys.comments(articleId), (old) => {
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
                    likesCount: comment.liked ? comment.likesCount - 1 : comment.likesCount + 1,
                  }
                : comment,
            ),
          })),
        }
      })

      return { previous }
    },

    onError: (err, _commentId, context) => {
      // Checks !== undefined rather than truthiness so a legitimately-null entry restores.
      if (context?.previous !== undefined) {
        queryClient.setQueryData(newsKeys.comments(articleId), context.previous)
      }
      toast.error(newsErrorMessage(err))
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.comments(articleId) })
      queryClient.invalidateQueries({ queryKey: newsKeys.repliesFor(articleId) })
    },
  })
}
