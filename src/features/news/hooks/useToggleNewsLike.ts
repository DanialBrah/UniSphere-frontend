import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { newsApi } from '../api/newsApi'
import { newsKeys } from '../types'
import {
  patchArticleEverywhere,
  restoreNewsQueries,
  snapshotNewsQueries,
} from '../utils/cacheUtils'
import { newsErrorMessage } from '../utils/newsErrors'

export function useToggleNewsLike() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (articleId: number) => newsApi.toggleLike(articleId),

    onMutate: async (articleId) => {
      await queryClient.cancelQueries({ queryKey: newsKeys.all })
      const snapshot = snapshotNewsQueries(queryClient)

      patchArticleEverywhere(queryClient, articleId, (article) => ({
        ...article,
        liked: !article.liked,
        likesCount: article.liked ? article.likesCount - 1 : article.likesCount + 1,
      }))

      return { snapshot }
    },

    onError: (err, _articleId, context) => {
      if (context?.snapshot) restoreNewsQueries(queryClient, context.snapshot)
      toast.error(newsErrorMessage(err))
    },

    onSuccess: (result, articleId) => {
      // Write the server's count into every cached copy and stop there.
      //
      // Deliberately unlike social's useToggleLike, which invalidates the detail query in
      // onSettled: the toggle response is a straight DB count, while the article payload adds
      // a Redis delta that only flushes to MySQL every 60s. Refetching here would replace an
      // authoritative number with a staler one and make the count visibly jump.
      patchArticleEverywhere(queryClient, articleId, (article) => ({
        ...article,
        liked: result.liked,
        likesCount: result.likesCount,
      }))

      // The Liked tab's membership genuinely changed, so that list does need refreshing.
      queryClient.invalidateQueries({ queryKey: newsKeys.liked() })
    },
  })
}
