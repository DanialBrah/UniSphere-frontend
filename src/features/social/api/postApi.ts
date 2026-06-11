import api from '../../../lib/axios'
import type {
  ApiResponse,
  SpringPage,
  PostResponse,
  LikeToggleResponse,
  SaveToggleResponse,
  CreatePostRequest,
  UpdatePostRequest,
} from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data

// Spring's Page<T> is nested at response.data.data (ApiResponse envelope → data field)
const unwrapPage = <T>(r: { data: ApiResponse<SpringPage<T>> }): SpringPage<T> => r.data.data

export const postApi = {
  getFeed: (page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<PostResponse>>>('/posts', { params: { page, size } })
      .then(unwrapPage),

  getUserPosts: (userId: number, page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<PostResponse>>>(`/posts/user/${userId}`, {
        params: { page, size },
      })
      .then(unwrapPage),

  getPost: (postId: number) =>
    api.get<ApiResponse<PostResponse>>(`/posts/${postId}`).then(unwrap),

  createPost: (body: CreatePostRequest) =>
    api.post<ApiResponse<PostResponse>>('/posts', body).then(unwrap),

  updatePost: (postId: number, body: UpdatePostRequest) =>
    api.put<ApiResponse<PostResponse>>(`/posts/${postId}`, body).then(unwrap),

  deletePost: (postId: number) =>
    api.delete<ApiResponse<null>>(`/posts/${postId}`).then(() => undefined),

  toggleLike: (postId: number) =>
    api.post<ApiResponse<LikeToggleResponse>>(`/posts/${postId}/like`).then(unwrap),

  toggleSave: (postId: number) =>
    api.post<ApiResponse<SaveToggleResponse>>(`/posts/${postId}/save`).then(unwrap),

  getLikedPosts: (page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<PostResponse>>>('/posts/liked', { params: { page, size } })
      .then(unwrapPage),

  getSavedPosts: (page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<PostResponse>>>('/posts/saved', { params: { page, size } })
      .then(unwrapPage),

  search: (q: string, page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<PostResponse>>>('/posts/search', { params: { q, page, size } })
      .then(unwrapPage),
}
