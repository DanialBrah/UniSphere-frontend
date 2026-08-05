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

export function useToggleSave() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postId: number) => postApi.toggleSave(postId),

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
              post.id === postId ? { ...post, saved: !post.saved } : post,
            ),
          })),
        }
      })

      queryClient.setQueryData<PostResponse>(socialKeys.post(postId), (old) => {
        if (!old) return old
        return { ...old, saved: !old.saved }
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
      // Same reasoning as useToggleLike.ts — a post can also live in a community's own post
      // feed cache, which this feature doesn't otherwise know about.
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey
          return Array.isArray(key) && key[0] === 'communities' && key.includes('posts')
        },
      })
    },
  })
}
