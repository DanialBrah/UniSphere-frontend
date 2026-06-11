import api from '../../../lib/axios'
import type {
  ApiResponse,
  SpringPage,
  CommentResponse,
  LikeToggleResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
} from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data

const unwrapPage = <T>(r: { data: ApiResponse<SpringPage<T>> }): SpringPage<T> => r.data.data

export const commentApi = {
  getComments: (postId: number, page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<CommentResponse>>>(`/posts/${postId}/comments`, {
        params: { page, size },
      })
      .then(unwrapPage),

  getReplies: (postId: number, commentId: number, page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<CommentResponse>>>(
        `/posts/${postId}/comments/${commentId}/replies`,
        { params: { page, size } },
      )
      .then(unwrapPage),

  createComment: (postId: number, body: CreateCommentRequest) =>
    api
      .post<ApiResponse<CommentResponse>>(`/posts/${postId}/comments`, body)
      .then(unwrap),

  updateComment: (postId: number, commentId: number, body: UpdateCommentRequest) =>
    api
      .put<ApiResponse<CommentResponse>>(`/posts/${postId}/comments/${commentId}`, body)
      .then(unwrap),

  deleteComment: (postId: number, commentId: number) =>
    api
      .delete<ApiResponse<null>>(`/posts/${postId}/comments/${commentId}`)
      .then(() => undefined),

  toggleLike: (postId: number, commentId: number) =>
    api
      .post<ApiResponse<LikeToggleResponse>>(`/posts/${postId}/comments/${commentId}/like`)
      .then(unwrap),
}
