import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { newsApi } from '../api/newsApi'
import { newsKeys } from '../types'
import type { NewsFeedFilters, NewsStatus, SpringPage, NewsArticleLike } from '../types'

/** Spring pages are 0-indexed and carry `last`, so this is the same for every list here. */
const nextPage = (lastPage: SpringPage<NewsArticleLike>) =>
  lastPage.last ? undefined : lastPage.number + 1

/**
 * Cover images, gallery media and avatars all arrive as presigned URLs that expire after about
 * an hour, and the global query config sets refetchOnWindowFocus: false. Without this override
 * a tab left open overnight renders broken images with no way to recover; refetching on focus
 * re-mints the URLs at exactly the moment the user would otherwise notice.
 *
 * Scoped per-query rather than changed in lib/queryClient.ts, which would alter messaging,
 * notifications and connect behaviour for a News-only problem.
 */
const PRESIGNED_URL_REFRESH = { refetchOnWindowFocus: true } as const

export function useNewsFeed(filters: NewsFeedFilters, enabled = true) {
  return useInfiniteQuery({
    queryKey: newsKeys.list(filters),
    queryFn: ({ pageParam }) => newsApi.getFeed(filters, pageParam as number, 20),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled,
    ...PRESIGNED_URL_REFRESH,
  })
}

/** The FULLTEXT boolean operators NewsService strips server-side before searching. */
const FULLTEXT_OPERATORS = /[+\-><()~*"@]/g

export function sanitizeNewsQuery(q: string): string {
  return q.replace(FULLTEXT_OPERATORS, ' ').trim()
}

export const NEWS_SEARCH_MIN_LENGTH = 3

/**
 * MySQL's innodb_ft_min_token_size defaults to 3 and applies **per token**, not to the query
 * as a whole — so a search is only worth sending if some word survives sanitisation at three
 * characters or more.
 *
 * Two cases this catches that a naive length check does not: "a+b" sanitizes to "a b", which
 * is three characters but two unindexed tokens; and "+++" sanitizes to nothing at all, which
 * the server answers with an empty page rather than an error.
 */
export function isSearchableNewsQuery(q: string): boolean {
  return sanitizeNewsQuery(q)
    .split(/\s+/)
    .some((token) => token.length >= NEWS_SEARCH_MIN_LENGTH)
}

export function useNewsSearch(q: string) {
  return useInfiniteQuery({
    queryKey: newsKeys.search(q.trim()),
    queryFn: ({ pageParam }) => newsApi.search(q.trim(), pageParam as number, 20),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled: isSearchableNewsQuery(q),
    ...PRESIGNED_URL_REFRESH,
  })
}

export function usePopularTags(limit = 20) {
  return useQuery({
    queryKey: newsKeys.tags(limit),
    queryFn: () => newsApi.getPopularTags(limit),
  })
}

export function useLikedNews(enabled = true) {
  return useInfiniteQuery({
    queryKey: newsKeys.liked(),
    queryFn: ({ pageParam }) => newsApi.getLiked(pageParam as number, 20),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled,
    ...PRESIGNED_URL_REFRESH,
  })
}

export function useSavedNews(enabled = true) {
  return useInfiniteQuery({
    queryKey: newsKeys.saved(),
    queryFn: ({ pageParam }) => newsApi.getSaved(pageParam as number, 20),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled,
    ...PRESIGNED_URL_REFRESH,
  })
}

/** The Studio's list. `null` status means "All"; the key uses 'ALL' so it can't collide. */
export function useMyNews(status: NewsStatus | null, enabled = true) {
  return useInfiniteQuery({
    queryKey: newsKeys.studioList(status ?? 'ALL'),
    queryFn: ({ pageParam }) => newsApi.getMyArticles(status, pageParam as number, 20),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled,
    ...PRESIGNED_URL_REFRESH,
  })
}

export function useNewsArticle(articleId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: newsKeys.detail(articleId),
    queryFn: () => newsApi.getArticle(articleId),
    enabled: options?.enabled !== undefined ? options.enabled : articleId > 0,
    ...PRESIGNED_URL_REFRESH,
  })
}
