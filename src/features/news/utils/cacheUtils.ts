import type { QueryClient } from '@tanstack/react-query'
import { newsKeys } from '../types'
import type { NewsArticleLike, SpringPage } from '../types'

interface InfiniteArticleData {
  pages: SpringPage<NewsArticleLike>[]
  pageParams: unknown[]
}

function isInfiniteArticleData(value: unknown): value is InfiniteArticleData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'pages' in value &&
    Array.isArray((value as InfiniteArticleData).pages)
  )
}

function isArticle(value: unknown): value is NewsArticleLike {
  return typeof value === 'object' && value !== null && 'id' in value && 'title' in value
}

/**
 * Applies a patch to one article wherever it is cached — the Latest tab, Featured, every
 * filter combination, search results, Saved, Liked, the Studio tabs and the detail entry.
 *
 * A like fired from the feed has to move the count on the detail page too, and enumerating the
 * keys by hand would miss whichever surface was added last. One setQueriesData over the `news`
 * root covers all of them; the type guards make the untouched shapes (the popular-tags array,
 * a page of comments) pass straight through.
 */
export function patchArticleEverywhere(
  queryClient: QueryClient,
  articleId: number,
  patch: (article: NewsArticleLike) => NewsArticleLike,
): void {
  queryClient.setQueriesData({ queryKey: newsKeys.all }, (value: unknown) => {
    if (isInfiniteArticleData(value)) {
      return {
        ...value,
        pages: value.pages.map((page) => ({
          ...page,
          content: page.content.map((article) =>
            article.id === articleId ? patch(article) : article,
          ),
        })),
      }
    }

    if (isArticle(value) && value.id === articleId) {
      return patch(value)
    }

    return value
  })
}

/** Snapshot of every `news` cache entry, for rollback when an optimistic patch fails. */
export function snapshotNewsQueries(queryClient: QueryClient): [readonly unknown[], unknown][] {
  return queryClient.getQueriesData({ queryKey: newsKeys.all })
}

export function restoreNewsQueries(
  queryClient: QueryClient,
  snapshot: [readonly unknown[], unknown][],
): void {
  for (const [key, value] of snapshot) {
    queryClient.setQueryData(key, value)
  }
}
