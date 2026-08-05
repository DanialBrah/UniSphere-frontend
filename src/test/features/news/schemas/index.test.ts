import { describe, it, expect } from 'vitest'
import {
  NEWS_COMMENT_MAX,
  NEWS_CONTENT_MAX,
  NEWS_SUMMARY_MAX,
  NEWS_TAG_MAX,
  NEWS_TITLE_MAX,
  canPublish,
  newsArticleSchema,
  newsCommentSchema,
  newsTagSchema,
} from '../../../../features/news/schemas'

const valid = {
  title: 'A title',
  summary: '',
  content: '',
  category: 'GENERAL' as const,
  visibility: 'PUBLIC' as const,
}

describe('newsArticleSchema — title', () => {
  it('requires a title', () => {
    expect(newsArticleSchema.safeParse({ ...valid, title: '' }).success).toBe(false)
    expect(newsArticleSchema.safeParse({ ...valid, title: '   ' }).success).toBe(false)
  })

  it('accepts exactly the server limit and rejects one more', () => {
    expect(newsArticleSchema.safeParse({ ...valid, title: 'a'.repeat(NEWS_TITLE_MAX) }).success).toBe(true)
    expect(
      newsArticleSchema.safeParse({ ...valid, title: 'a'.repeat(NEWS_TITLE_MAX + 1) }).success,
    ).toBe(false)
  })
})

describe('newsArticleSchema — summary and content', () => {
  it('allows an empty summary and content, because a draft may be blank', () => {
    expect(newsArticleSchema.safeParse(valid).success).toBe(true)
  })

  it('enforces the summary boundary', () => {
    expect(
      newsArticleSchema.safeParse({ ...valid, summary: 'a'.repeat(NEWS_SUMMARY_MAX) }).success,
    ).toBe(true)
    expect(
      newsArticleSchema.safeParse({ ...valid, summary: 'a'.repeat(NEWS_SUMMARY_MAX + 1) }).success,
    ).toBe(false)
  })

  it('enforces the content boundary', () => {
    expect(
      newsArticleSchema.safeParse({ ...valid, content: 'a'.repeat(NEWS_CONTENT_MAX) }).success,
    ).toBe(true)
    expect(
      newsArticleSchema.safeParse({ ...valid, content: 'a'.repeat(NEWS_CONTENT_MAX + 1) }).success,
    ).toBe(false)
  })
})

describe('newsArticleSchema — enums', () => {
  it('rejects a category the API does not have', () => {
    expect(newsArticleSchema.safeParse({ ...valid, category: 'SCIENCE' }).success).toBe(false)
  })

  it('rejects a visibility borrowed from posts', () => {
    // PostVisibility also has FRIENDS and PRIVATE; news does not.
    expect(newsArticleSchema.safeParse({ ...valid, visibility: 'FRIENDS' }).success).toBe(false)
  })
})

describe('newsCommentSchema', () => {
  it('rejects an empty comment', () => {
    expect(newsCommentSchema.safeParse({ content: '   ' }).success).toBe(false)
  })

  it('enforces the 2000-character boundary', () => {
    expect(newsCommentSchema.safeParse({ content: 'a'.repeat(NEWS_COMMENT_MAX) }).success).toBe(true)
    expect(
      newsCommentSchema.safeParse({ content: 'a'.repeat(NEWS_COMMENT_MAX + 1) }).success,
    ).toBe(false)
  })
})

describe('newsTagSchema', () => {
  it('enforces the 100-character boundary', () => {
    expect(newsTagSchema.safeParse('a'.repeat(NEWS_TAG_MAX).toString()).success).toBe(true)
    expect(newsTagSchema.safeParse('a'.repeat(NEWS_TAG_MAX + 1)).success).toBe(false)
  })

  it('rejects a blank tag', () => {
    expect(newsTagSchema.safeParse('  ').success).toBe(false)
  })
})

describe('canPublish', () => {
  it('requires both a title and content', () => {
    expect(canPublish({ title: 'Title', content: 'Body' })).toBe(true)
    expect(canPublish({ title: 'Title', content: '' })).toBe(false)
    expect(canPublish({ title: '', content: 'Body' })).toBe(false)
  })

  it('treats whitespace-only values as empty, matching the server’s isBlank check', () => {
    expect(canPublish({ title: '   ', content: 'Body' })).toBe(false)
    expect(canPublish({ title: 'Title', content: '\n  \t' })).toBe(false)
  })

  it('handles missing fields', () => {
    expect(canPublish({})).toBe(false)
  })
})
