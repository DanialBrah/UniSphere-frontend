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

export function useToggleNewsSave() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (articleId: number) => newsApi.toggleSave(articleId),

    onMutate: async (articleId) => {
      await queryClient.cancelQueries({ queryKey: newsKeys.all })
      const snapshot = snapshotNewsQueries(queryClient)

      patchArticleEverywhere(queryClient, articleId, (article) => ({
        ...article,
        saved: !article.saved,
      }))

      return { snapshot }
    },

    onError: (err, _articleId, context) => {
      if (context?.snapshot) restoreNewsQueries(queryClient, context.snapshot)
      toast.error(newsErrorMessage(err))
    },

    onSuccess: (result, articleId) => {
      patchArticleEverywhere(queryClient, articleId, (article) => ({
        ...article,
        saved: result.saved,
      }))
      queryClient.invalidateQueries({ queryKey: newsKeys.saved() })
    },
  })
}
