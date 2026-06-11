import type { ApiResponse, UserRole } from '../../identity/types/auth'

export type { ApiResponse, UserRole }

export type PostType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK' | 'POLL'
export type PostVisibility = 'PUBLIC' | 'UNIVERSITY' | 'FRIENDS' | 'PRIVATE'

export interface PostAuthor {
  id: number
  displayName: string
  avatarUrl: string | null
  role: UserRole
}

export interface PostMedia {
  id: number
  mediaUrl: string
  mediaType: 'IMAGE' | 'VIDEO'
  sortOrder: number
}

export interface PostResponse {
  id: number
  author: PostAuthor
  title?: string
  content?: string
  postType: PostType
  visibility: PostVisibility
  pinned: boolean
  likesCount: number
  viewsCount: number
  commentCount: number
  liked: boolean
  saved: boolean
  media: PostMedia[]
  taggedUserIds: number[]
  createdAt: string
  updatedAt: string
}

export interface CommentResponse {
  id: number
  postId: number
  parentCommentId?: number
  author: PostAuthor
  content: string
  likesCount: number
  replyCount: number
  liked: boolean
  createdAt: string
  updatedAt: string
}

export interface LikeToggleResponse {
  liked: boolean
  likesCount: number
}

export interface SaveToggleResponse {
  saved: boolean
}

// Spring Data Page<T> — what the backend actually serialises for paginated endpoints
export interface SpringPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number      // current page (0-indexed)
  size: number
  last: boolean
  first: boolean
  numberOfElements: number
  empty: boolean
}

export interface CreatePostRequest {
  title?: string
  content?: string
  postType?: PostType
  visibility?: PostVisibility
  universityId?: number
  taggedUserIds?: number[]
  media?: { mediaKey: string; mediaType: string }[]
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  visibility?: PostVisibility
  addMedia?: { mediaKey: string; mediaType: string }[]
  removeMediaIds?: number[]
}

export interface CreateCommentRequest {
  content: string
  parentCommentId?: number
}

export interface UpdateCommentRequest {
  content: string
}

export const socialKeys = {
  feedInfinite: () => ['social', 'feed', 'infinite'] as const,
  likedInfinite: () => ['social', 'liked'] as const,
  savedInfinite: () => ['social', 'saved'] as const,
  post: (id: number) => ['social', 'post', id] as const,
  postComments: (postId: number) => ['social', 'comments', postId] as const,
  commentReplies: (postId: number, cid: number) => ['social', 'replies', postId, cid] as const,
} as const
