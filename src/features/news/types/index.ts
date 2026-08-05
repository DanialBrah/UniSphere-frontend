import type { ApiResponse, UserRole } from '../../identity/types/auth'
import type { SpringPage } from '../../social/types'

export type { ApiResponse, UserRole, SpringPage }

// String-literal unions rather than TS enums — tsconfig sets `erasableSyntaxOnly`.
export type NewsCategory = 'GENERAL' | 'ACADEMIC' | 'SPORTS' | 'EVENTS' | 'TECH' | 'ALUMNI'
export type NewsStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type NewsVisibility = 'PUBLIC' | 'UNIVERSITY'
export type NewsMediaType = 'IMAGE' | 'VIDEO'

/**
 * The backend types `NewsAuthorResponse.role` as a plain String and falls back to the literal
 * "UNKNOWN" when the author row is missing, so this can be a value `UserRole` doesn't cover.
 */
export type NewsAuthorRole = UserRole | 'UNKNOWN'

export interface NewsAuthorResponse {
  id: number
  displayName: string
  /** Presigned GET URL — expires after ~60 minutes. Never persist it. */
  avatarUrl: string | null
  role: NewsAuthorRole
}

export interface NewsMediaResponse {
  id: number
  /** Presigned GET URL minted per read. The entity stores a bare key. */
  mediaUrl: string
  mediaType: NewsMediaType
  sortOrder: number
}

export interface NewsTagCountResponse {
  tag: string
  articleCount: number
}

export interface NewsArticleResponse {
  id: number
  author: NewsAuthorResponse
  title: string
  summary: string | null
  content: string | null
  /** Presigned GET URL, ~60 min expiry. */
  coverImageUrl: string | null
  category: NewsCategory
  status: NewsStatus
  visibility: NewsVisibility
  universityId: number | null
  featured: boolean
  viewsCount: number
  likesCount: number
  /** Top-level comments only — replies are not counted. */
  commentCount: number
  liked: boolean
  saved: boolean
  tags: string[]
  media: NewsMediaResponse[]
  /** Null on drafts — fall back to createdAt when rendering a timestamp. */
  publishedAt: string | null
  scheduledAt: string | null
  createdAt: string
  updatedAt: string
}

/** Feed/search payload: the full response minus content, media, scheduledAt and updatedAt. */
export interface NewsArticleSummaryResponse {
  id: number
  author: NewsAuthorResponse
  title: string
  summary: string | null
  coverImageUrl: string | null
  category: NewsCategory
  status: NewsStatus
  visibility: NewsVisibility
  universityId: number | null
  featured: boolean
  viewsCount: number
  likesCount: number
  commentCount: number
  liked: boolean
  saved: boolean
  tags: string[]
  publishedAt: string | null
  createdAt: string
}

/**
 * Anything a card can render. `NewsArticleResponse` is structurally assignable to the summary
 * (it has every field plus more), so one card component serves both the feed and the detail page.
 */
export type NewsArticleLike = NewsArticleSummaryResponse

export interface NewsCommentResponse {
  id: number
  articleId: number
  parentCommentId: number | null
  author: NewsAuthorResponse
  content: string
  likesCount: number
  replyCount: number
  liked: boolean
  createdAt: string
  updatedAt: string
}

export interface NewsLikeToggleResponse {
  liked: boolean
  likesCount: number
}

export interface NewsSaveToggleResponse {
  saved: boolean
}

export interface NewsMediaPresignResponse {
  uploadUrl: string
  mediaKey: string
}

export interface NewsMediaUploadResponse {
  mediaKey: string
  mediaUrl: string
  mediaType: string
}

/** What create/update accept — a bare object key, never a URL. */
export interface NewsMediaItem {
  mediaKey: string
  mediaType: string
}

/**
 * A file staged for upload, paired with the blob URL used to preview it.
 *
 * The URL is created in the file-input change handler and revoked when the item is removed or
 * the editor unmounts — deliberately not derived in a hook. Under StrictMode an effect runs
 * mount → cleanup → mount, so creating the URL in a `useMemo` and revoking it in the effect's
 * cleanup leaves a revoked URL behind and the preview never renders.
 */
export interface PendingNewsMedia {
  file: File
  previewUrl: string
}

/**
 * No `universityId` field by design: the server derives it from the author, so a client
 * cannot scope an article to a university it doesn't belong to.
 */
export interface CreateNewsArticleRequest {
  title: string
  summary?: string
  content?: string
  category?: NewsCategory
  visibility?: NewsVisibility
  /** null -> DRAFT. ARCHIVED is rejected on create with a 409. */
  status?: NewsStatus
  /** Naive local date-time ("YYYY-MM-DDTHH:mm:ss") interpreted in the server's timezone. */
  scheduledAt?: string
  coverImageKey?: string
  tags?: string[]
  media?: NewsMediaItem[]
}

/**
 * Partial update — an omitted field means "leave alone". There is deliberately no `status`
 * here; transitions go through PATCH /news/{id}/status so the state machine has one entrance.
 */
export interface UpdateNewsArticleRequest {
  title?: string
  summary?: string
  content?: string
  category?: NewsCategory
  visibility?: NewsVisibility
  /** "" clears the cover; omitting the field keeps the existing one. */
  coverImageKey?: string
  /** Replace semantics: a non-null array replaces the whole tag set, [] clears it. */
  tags?: string[]
  removeMediaIds?: number[]
  addMedia?: NewsMediaItem[]
}

export interface NewsStatusUpdateRequest {
  status: NewsStatus
  scheduledAt?: string
}

export interface CreateNewsCommentRequest {
  content: string
  parentCommentId?: number
}

export interface UpdateNewsCommentRequest {
  content: string
}

export interface NewsFeedFilters {
  category: NewsCategory | null
  tag: string | null
  featured: boolean | null
}

export const EMPTY_NEWS_FILTERS: NewsFeedFilters = {
  category: null,
  tag: null,
  featured: null,
}

/**
 * Every level is a valid invalidation prefix, so a mutation can drop a whole surface
 * (`lists()`) or one entry (`detail(id)`) without a bespoke predicate.
 *
 * Two deliberate choices:
 *  - `list` keys on the whole filter object. TanStack hashes objects with sorted keys, so the
 *    order of properties doesn't matter — but every field must be passed explicitly (as `null`,
 *    not omitted) or two logically-identical filter states produce two cache entries.
 *  - Optional statuses use the literal 'ALL' rather than `undefined`; the hasher strips
 *    `undefined`, which would silently collide an "All" tab with a missing-argument bug.
 */
export const newsKeys = {
  all: ['news'] as const,

  lists: () => ['news', 'list'] as const,
  list: (filters: NewsFeedFilters) => ['news', 'list', filters] as const,
  searches: () => ['news', 'search'] as const,
  search: (q: string) => ['news', 'search', q] as const,
  tags: (limit: number) => ['news', 'tags', limit] as const,

  liked: () => ['news', 'liked'] as const,
  saved: () => ['news', 'saved'] as const,

  studio: () => ['news', 'studio'] as const,
  studioList: (status: NewsStatus | 'ALL') => ['news', 'studio', status] as const,
  authors: () => ['news', 'author'] as const,
  author: (authorId: number, status: NewsStatus | 'ALL') =>
    ['news', 'author', authorId, status] as const,

  detail: (id: number) => ['news', 'detail', id] as const,
  comments: (articleId: number) => ['news', 'comments', articleId] as const,
  repliesFor: (articleId: number) => ['news', 'replies', articleId] as const,
  replies: (articleId: number, commentId: number) =>
    ['news', 'replies', articleId, commentId] as const,
} as const
