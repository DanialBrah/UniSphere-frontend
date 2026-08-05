import { describe, it, expect } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { patchArticleEverywhere } from '../../../../features/news/utils/cacheUtils'
import { newsKeys, EMPTY_NEWS_FILTERS } from '../../../../features/news/types'
import type {
  NewsArticleLike,
  NewsArticleResponse,
  SpringPage,
} from '../../../../features/news/types'

function article(id: number, overrides: Partial<NewsArticleLike> = {}): NewsArticleLike {
  return {
    id,
    author: { id: 99, displayName: 'Uni', avatarUrl: null, role: 'UNIVERSITY' },
    title: `Article ${id}`,
    summary: null,
    coverImageUrl: null,
    category: 'GENERAL',
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    universityId: null,
    featured: false,
    viewsCount: 0,
    likesCount: 3,
    commentCount: 0,
    liked: false,
    saved: false,
    tags: [],
    publishedAt: '2026-08-01T10:00:00',
    createdAt: '2026-08-01T09:00:00',
    ...overrides,
  }
}

function page(content: NewsArticleLike[]): SpringPage<NewsArticleLike> {
  return {
    content,
    totalElements: content.length,
    totalPages: 1,
    number: 0,
    size: 20,
    last: true,
    first: true,
    numberOfElements: content.length,
    empty: content.length === 0,
  }
}

describe('patchArticleEverywhere', () => {
  it('patches the same article across an infinite feed, a search list and the detail entry', () => {
    const qc = new QueryClient()

    qc.setQueryData(newsKeys.list(EMPTY_NEWS_FILTERS), {
      pages: [page([article(1), article(2)])],
      pageParams: [0],
    })
    qc.setQueryData(newsKeys.search('exchange'), {
      pages: [page([article(1)])],
      pageParams: [0],
    })
    qc.setQueryData(newsKeys.detail(1), article(1) as NewsArticleResponse)

    patchArticleEverywhere(qc, 1, (a) => ({ ...a, liked: true, likesCount: 4 }))

    const feed = qc.getQueryData<{ pages: SpringPage<NewsArticleLike>[] }>(
      newsKeys.list(EMPTY_NEWS_FILTERS),
    )
    expect(feed!.pages[0].content[0].liked).toBe(true)
    expect(feed!.pages[0].content[0].likesCount).toBe(4)

    const search = qc.getQueryData<{ pages: SpringPage<NewsArticleLike>[] }>(
      newsKeys.search('exchange'),
    )
    expect(search!.pages[0].content[0].liked).toBe(true)

    const detail = qc.getQueryData<NewsArticleLike>(newsKeys.detail(1))
    expect(detail!.liked).toBe(true)
    expect(detail!.likesCount).toBe(4)
  })

  it('leaves other articles in the same page untouched', () => {
    const qc = new QueryClient()
    qc.setQueryData(newsKeys.list(EMPTY_NEWS_FILTERS), {
      pages: [page([article(1), article(2)])],
      pageParams: [0],
    })

    patchArticleEverywhere(qc, 1, (a) => ({ ...a, liked: true }))

    const feed = qc.getQueryData<{ pages: SpringPage<NewsArticleLike>[] }>(
      newsKeys.list(EMPTY_NEWS_FILTERS),
    )
    expect(feed!.pages[0].content[1].liked).toBe(false)
  })

  it('passes non-article cache shapes through unchanged', () => {
    // The popular-tags entry lives under the same `news` root but is a plain array; the type
    // guards must not corrupt it.
    const qc = new QueryClient()
    const tags = [{ tag: 'exchange', articleCount: 4 }]
    qc.setQueryData(newsKeys.tags(20), tags)

    patchArticleEverywhere(qc, 1, (a) => ({ ...a, liked: true }))

    expect(qc.getQueryData(newsKeys.tags(20))).toEqual(tags)
  })

  it('is a no-op when the article is not cached anywhere', () => {
    const qc = new QueryClient()
    qc.setQueryData(newsKeys.list(EMPTY_NEWS_FILTERS), {
      pages: [page([article(2)])],
      pageParams: [0],
    })

    patchArticleEverywhere(qc, 1, (a) => ({ ...a, liked: true }))

    const feed = qc.getQueryData<{ pages: SpringPage<NewsArticleLike>[] }>(
      newsKeys.list(EMPTY_NEWS_FILTERS),
    )
    expect(feed!.pages[0].content[0].liked).toBe(false)
  })
})
