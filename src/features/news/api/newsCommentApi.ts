import api from '../../../lib/axios'
import type {
  ApiResponse,
  SpringPage,
  NewsCommentResponse,
  NewsLikeToggleResponse,
  CreateNewsCommentRequest,
  UpdateNewsCommentRequest,
} from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data

const unwrapPage = <T>(r: { data: ApiResponse<SpringPage<T>> }): SpringPage<T> => r.data.data

/**
 * Every method takes `articleId` because it's part of the route, even on the /{commentId}
 * sub-paths where the server resolves the article from the comment itself and ignores the
 * segment. Passing the real id keeps the URLs honest and the cache keys consistent.
 */
export const newsCommentApi = {
  // Top-level comments only, ordered createdAt ASC.
  getComments: (articleId: number, page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<NewsCommentResponse>>>(`/news/${articleId}/comments`, {
        params: { page, size },
      })
      .then(unwrapPage),

  getReplies: (articleId: number, commentId: number, page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<NewsCommentResponse>>>(
        `/news/${articleId}/comments/${commentId}/replies`,
        { params: { page, size } },
      )
      .then(unwrapPage),

  // 400 BAD_REQUEST unless the article is PUBLISHED — drafts and archived articles are read-only.
  createComment: (articleId: number, body: CreateNewsCommentRequest) =>
    api
      .post<ApiResponse<NewsCommentResponse>>(`/news/${articleId}/comments`, body)
      .then(unwrap),

  updateComment: (articleId: number, commentId: number, body: UpdateNewsCommentRequest) =>
    api
      .put<ApiResponse<NewsCommentResponse>>(`/news/${articleId}/comments/${commentId}`, body)
      .then(unwrap),

  deleteComment: (articleId: number, commentId: number) =>
    api
      .delete<ApiResponse<null>>(`/news/${articleId}/comments/${commentId}`)
      .then(() => undefined),

  toggleLike: (articleId: number, commentId: number) =>
    api
      .post<ApiResponse<NewsLikeToggleResponse>>(
        `/news/${articleId}/comments/${commentId}/like`,
      )
      .then(unwrap),
}
