import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { postApi } from '../api/postApi'
import { socialKeys } from '../types'
import type { PostResponse, SpringPage } from '../types'
import { getErrorMessage } from '../../../lib/utils'

interface InfiniteData {
  pages: SpringPage<PostResponse>[]
  pageParams: unknown[]
}

export function useToggleLike() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postId: number) => postApi.toggleLike(postId),

    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: socialKeys.feedInfinite() })
      await queryClient.cancelQueries({ queryKey: socialKeys.post(postId) })

      const previousFeed = queryClient.getQueryData<InfiniteData>(socialKeys.feedInfinite())
      const previousPost = queryClient.getQueryData<PostResponse>(socialKeys.post(postId))

      queryClient.setQueryData<InfiniteData>(socialKeys.feedInfinite(), (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            content: page.content.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    liked: !post.liked,
                    likesCount: post.liked ? post.likesCount - 1 : post.likesCount + 1,
                  }
                : post,
            ),
          })),
        }
      })

      queryClient.setQueryData<PostResponse>(socialKeys.post(postId), (old) => {
        if (!old) return old
        return {
          ...old,
          liked: !old.liked,
          likesCount: old.liked ? old.likesCount - 1 : old.likesCount + 1,
        }
      })

      return { previousFeed, previousPost }
    },

    onError: (err, postId, context) => {
      if (context?.previousFeed !== undefined)
        queryClient.setQueryData(socialKeys.feedInfinite(), context.previousFeed)
      if (context?.previousPost !== undefined)
        queryClient.setQueryData(socialKeys.post(postId), context.previousPost)
      toast.error(getErrorMessage(err))
    },

    onSettled: (_data, _err, postId) => {
      queryClient.invalidateQueries({ queryKey: socialKeys.post(postId) })
      // A post can also be rendered inside a community's own post feed (via the shared
      // PostCard) — that cache lives under a different key namespace this feature doesn't
      // otherwise know about, so it's not covered by the optimistic patch above. A broad
      // invalidate-by-predicate here is cheaper than importing communities' query keys and
      // still only refetches queries that are actually mounted.
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey
          return Array.isArray(key) && key[0] === 'communities' && key.includes('posts')
        },
      })
    },
  })
}
