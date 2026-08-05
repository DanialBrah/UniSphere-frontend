import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { newsApi } from '../api/newsApi'
import { newsKeys } from '../types'
import { newsErrorMessage } from '../utils/newsErrors'
import type {
  CreateNewsArticleRequest,
  NewsArticleResponse,
  NewsStatusUpdateRequest,
  UpdateNewsArticleRequest,
} from '../types'

/** Every reader surface that lists articles. A membership change has to touch all of them. */
function invalidateArticleLists(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: newsKeys.lists() })
  queryClient.invalidateQueries({ queryKey: newsKeys.searches() })
  queryClient.invalidateQueries({ queryKey: newsKeys.studio() })
  queryClient.invalidateQueries({ queryKey: newsKeys.authors() })
}

function invalidateTags(queryClient: QueryClient) {
  // The tag cloud is keyed by limit, so invalidate the prefix rather than guessing the number.
  queryClient.invalidateQueries({ queryKey: ['news', 'tags'] })
}

export function useCreateNewsArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateNewsArticleRequest) => newsApi.create(body),
    onSuccess: (article) => {
      queryClient.setQueryData(newsKeys.detail(article.id), article)
      invalidateArticleLists(queryClient)
      if (article.status === 'PUBLISHED') invalidateTags(queryClient)
      toast.success(article.status === 'PUBLISHED' ? 'Article published' : 'Draft saved')
    },
    onError: (err) => toast.error(newsErrorMessage(err)),
  })
}

export function useUpdateNewsArticle(articleId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateNewsArticleRequest) => newsApi.update(articleId, body),
    onSuccess: (article) => {
      queryClient.setQueryData(newsKeys.detail(articleId), article)
      invalidateArticleLists(queryClient)
      invalidateTags(queryClient)
      toast.success('Article updated')
    },
    onError: (err) => toast.error(newsErrorMessage(err)),
  })
}

export function useChangeNewsStatus(articleId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: NewsStatusUpdateRequest) => newsApi.changeStatus(articleId, body),
    onSuccess: (article: NewsArticleResponse) => {
      queryClient.setQueryData(newsKeys.detail(articleId), article)
      // A status change moves the article in or out of the feed, search, the tag counts and
      // both personal collections at once — every one of those needs re-fetching.
      invalidateArticleLists(queryClient)
      invalidateTags(queryClient)
      queryClient.invalidateQueries({ queryKey: newsKeys.liked() })
      queryClient.invalidateQueries({ queryKey: newsKeys.saved() })
    },
    onError: (err) => toast.error(newsErrorMessage(err)),
  })
}

export function useDeleteNewsArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (articleId: number) => newsApi.remove(articleId),
    onSuccess: (_result, articleId) => {
      queryClient.removeQueries({ queryKey: newsKeys.detail(articleId) })
      invalidateArticleLists(queryClient)
      invalidateTags(queryClient)
      queryClient.invalidateQueries({ queryKey: newsKeys.liked() })
      queryClient.invalidateQueries({ queryKey: newsKeys.saved() })
      toast.success('Article deleted')
    },
    onError: (err) => toast.error(newsErrorMessage(err)),
  })
}
