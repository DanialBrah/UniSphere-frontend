import { z } from 'zod'
import type { NewsCategory, NewsVisibility } from '../types'

// Limits mirror the Java bean-validation constraints so the client rejects what the server would.
export const NEWS_TITLE_MAX = 255
export const NEWS_SUMMARY_MAX = 500
export const NEWS_CONTENT_MAX = 100_000
export const NEWS_COMMENT_MAX = 2000
export const NEWS_TAG_MAX = 100
export const NEWS_TAGS_MAX = 20
export const NEWS_MEDIA_MAX = 20

export const newsArticleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(NEWS_TITLE_MAX, `Title must not exceed ${NEWS_TITLE_MAX} characters`),
  summary: z
    .string()
    .max(NEWS_SUMMARY_MAX, `Summary must not exceed ${NEWS_SUMMARY_MAX} characters`)
    .optional()
    .or(z.literal('')),
  // Not required here — a draft may legitimately be empty. Publishing is gated by canPublish.
  content: z
    .string()
    .max(NEWS_CONTENT_MAX, `Content must not exceed ${NEWS_CONTENT_MAX} characters`)
    .optional()
    .or(z.literal('')),
  category: z.enum(['GENERAL', 'ACADEMIC', 'SPORTS', 'EVENTS', 'TECH', 'ALUMNI']),
  visibility: z.enum(['PUBLIC', 'UNIVERSITY']),
})

export const newsCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(NEWS_COMMENT_MAX, `Comment must not exceed ${NEWS_COMMENT_MAX} characters`),
})

export const newsTagSchema = z
  .string()
  .trim()
  .min(1, 'Tag cannot be empty')
  .max(NEWS_TAG_MAX, `A tag must not exceed ${NEWS_TAG_MAX} characters`)

/**
 * Explicit interfaces — do not use z.infer here; @hookform/resolvers v5 + Zod v4 infers
 * unknown for some fields when the schema uses unions or refinements.
 */
export interface NewsArticleFormData {
  title: string
  summary?: string
  content?: string
  category: NewsCategory
  visibility: NewsVisibility
}

export interface NewsCommentFormData {
  content: string
}

/**
 * The server's assertPublishable rule, mirrored. It runs on DRAFT -> PUBLISHED *and* on every
 * PUT against an already-published article, so blanking the content of a live article is a 400
 * too — which is why this gates the Save button, not just Publish.
 */
export function canPublish(values: { title?: string; content?: string }): boolean {
  return (values.title?.trim().length ?? 0) > 0 && (values.content?.trim().length ?? 0) > 0
}
