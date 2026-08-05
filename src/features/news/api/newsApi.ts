import api from '../../../lib/axios'
import type {
  ApiResponse,
  SpringPage,
  NewsArticleResponse,
  NewsArticleSummaryResponse,
  NewsTagCountResponse,
  NewsLikeToggleResponse,
  NewsSaveToggleResponse,
  NewsFeedFilters,
  NewsStatus,
  CreateNewsArticleRequest,
  UpdateNewsArticleRequest,
  NewsStatusUpdateRequest,
} from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data

const unwrapPage = <T>(r: { data: ApiResponse<SpringPage<T>> }): SpringPage<T> => r.data.data

/**
 * Builds query params by omission rather than by spreading the filter object.
 *
 * Axios drops `undefined` params but serialises `null` as the literal string "null", and the
 * backend's GlobalExceptionHandler doesn't extend ResponseEntityExceptionHandler — so a
 * `?category=null` fails enum binding and falls through to a 500, not a 400. Never let a null
 * filter reach the wire.
 */
function feedParams(filters: NewsFeedFilters, page: number, size: number) {
  const params: Record<string, string | number | boolean> = { page, size }
  if (filters.category) params.category = filters.category
  if (filters.tag?.trim()) params.tag = filters.tag.trim()
  if (filters.featured != null) params.featured = filters.featured
  return params
}

function statusParams(status: NewsStatus | null, page: number, size: number) {
  const params: Record<string, string | number> = { page, size }
  if (status) params.status = status
  return params
}

export const newsApi = {
  getFeed: (filters: NewsFeedFilters, page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<NewsArticleSummaryResponse>>>('/news', {
        params: feedParams(filters, page, size),
      })
      .then(unwrapPage),

  // No `sort` param: /news/search runs a native FULLTEXT query that carries its own ORDER BY.
  search: (q: string, page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<NewsArticleSummaryResponse>>>('/news/search', {
        params: { q, page, size },
      })
      .then(unwrapPage),

  // Returns a plain array, not a Page — unwrap, not unwrapPage.
  getPopularTags: (limit = 20) =>
    api
      .get<ApiResponse<NewsTagCountResponse[]>>('/news/tags', { params: { limit } })
      .then(unwrap),

  /**
   * The Studio's data source. Deliberately not /news/author/{myId}: that endpoint sorts by
   * publishedAt DESC, drafts have a null publishedAt, and MySQL sorts NULLs last in DESC — so
   * an author's drafts would sink beneath every published article. /news/me sorts by createdAt.
   */
  getMyArticles: (status: NewsStatus | null, page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<NewsArticleSummaryResponse>>>('/news/me', {
        params: statusParams(status, page, size),
      })
      .then(unwrapPage),

  // Both exclude DRAFT but still include ARCHIVED, and both carry their own ORDER BY — no sort.
  getLiked: (page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<NewsArticleSummaryResponse>>>('/news/liked', {
        params: { page, size },
      })
      .then(unwrapPage),

  getSaved: (page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<NewsArticleSummaryResponse>>>('/news/saved', {
        params: { page, size },
      })
      .then(unwrapPage),

  getByAuthor: (authorId: number, status: NewsStatus | null, page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<NewsArticleSummaryResponse>>>(`/news/author/${authorId}`, {
        params: statusParams(status, page, size),
      })
      .then(unwrapPage),

  getArticle: (articleId: number) =>
    api.get<ApiResponse<NewsArticleResponse>>(`/news/${articleId}`).then(unwrap),

  create: (body: CreateNewsArticleRequest) =>
    api.post<ApiResponse<NewsArticleResponse>>('/news', body).then(unwrap),

  update: (articleId: number, body: UpdateNewsArticleRequest) =>
    api.put<ApiResponse<NewsArticleResponse>>(`/news/${articleId}`, body).then(unwrap),

  changeStatus: (articleId: number, body: NewsStatusUpdateRequest) =>
    api
      .patch<ApiResponse<NewsArticleResponse>>(`/news/${articleId}/status`, body)
      .then(unwrap),

  remove: (articleId: number) =>
    api.delete<ApiResponse<null>>(`/news/${articleId}`).then(() => undefined),

  toggleLike: (articleId: number) =>
    api
      .post<ApiResponse<NewsLikeToggleResponse>>(`/news/${articleId}/like`)
      .then(unwrap),

  toggleSave: (articleId: number) =>
    api
      .post<ApiResponse<NewsSaveToggleResponse>>(`/news/${articleId}/save`)
      .then(unwrap),
}
