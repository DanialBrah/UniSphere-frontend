import { describe, it, expect } from 'vitest'
import { AxiosError } from 'axios'
import { newsErrorMessage } from '../../../../features/news/utils/newsErrors'

function apiError(
  status: number,
  code: string,
  message = '',
  headers: Record<string, string> = {},
): AxiosError {
  const err = new AxiosError('Request failed')
  Object.defineProperty(err, 'response', {
    value: { status, data: { error: { code, message } }, headers },
  })
  return err
}

describe('newsErrorMessage — authoring and ownership', () => {
  it('explains which account types can publish', () => {
    const msg = newsErrorMessage(apiError(403, 'NEWS_AUTHORING_NOT_ALLOWED'))
    expect(msg).toContain('university, club, employer and admin')
  })

  it('tells the author their upload expired when a media key is rejected', () => {
    const msg = newsErrorMessage(
      apiError(403, 'FORBIDDEN', 'Media key does not belong to you'),
    )
    expect(msg).toContain('upload has expired')
  })

  it('falls back to a plain permission message for other 403s', () => {
    expect(newsErrorMessage(apiError(403, 'FORBIDDEN', 'You cannot modify this article'))).toContain(
      "don't have permission",
    )
  })
})

describe('newsErrorMessage — the 404 must not leak existence', () => {
  it('never mentions permissions for a missing article', () => {
    // The API answers 404 for both "deleted" and "not visible to you" precisely so that a 403
    // can't be used to confirm an article exists. Saying "no permission" would undo that.
    const msg = newsErrorMessage(apiError(404, 'NEWS_ARTICLE_NOT_FOUND'))
    expect(msg.toLowerCase()).not.toContain('permission')
    expect(msg).toContain("doesn't exist")
  })

  it('has its own copy for a missing comment', () => {
    expect(newsErrorMessage(apiError(404, 'NEWS_COMMENT_NOT_FOUND'))).toContain('been removed')
  })
})

describe('newsErrorMessage — status transitions', () => {
  it('explains the draft -> archived rejection in the right direction', () => {
    const msg = newsErrorMessage(
      apiError(409, 'INVALID_NEWS_STATUS_TRANSITION', 'Cannot move from DRAFT to ARCHIVED'),
    )
    expect(msg).toContain("Drafts can't be archived")
  })

  it('explains the archived -> draft rejection in the right direction', () => {
    const msg = newsErrorMessage(
      apiError(409, 'INVALID_NEWS_STATUS_TRANSITION', 'Cannot move from ARCHIVED to DRAFT'),
    )
    expect(msg).toContain('Restore it to published first')
  })

  it('has a generic fallback for an unrecognised transition message', () => {
    expect(
      newsErrorMessage(apiError(409, 'INVALID_NEWS_STATUS_TRANSITION', 'something else')),
    ).toContain("isn't allowed")
  })
})

describe('newsErrorMessage — validation and bad requests', () => {
  it('maps the publish precondition', () => {
    expect(
      newsErrorMessage(apiError(400, 'BAD_REQUEST', 'A published article must have content')),
    ).toContain('Add a title and some content')
  })

  it('maps the university-affiliation rejection', () => {
    expect(
      newsErrorMessage(
        apiError(400, 'BAD_REQUEST', 'UNIVERSITY visibility requires a university affiliation'),
      ),
    ).toContain("isn't linked to a university")
  })

  it('maps the closed-comments rejection', () => {
    expect(
      newsErrorMessage(
        apiError(400, 'BAD_REQUEST', 'Comments are only open on published articles'),
      ),
    ).toContain('once the article is published')
  })

  it('explains a rejected schedule in terms of the server clock', () => {
    const msg = newsErrorMessage(
      apiError(400, 'VALIDATION_ERROR', 'scheduledAt must be in the future'),
    )
    expect(msg).toContain('already passed on the server')
  })

  it('passes a plain field-validation message straight through', () => {
    const msg = newsErrorMessage(
      apiError(400, 'VALIDATION_ERROR', 'Title must not exceed 255 characters'),
    )
    expect(msg).toBe('Title must not exceed 255 characters')
  })
})

describe('newsErrorMessage — rate limiting', () => {
  it('includes the retry delay when the server sends one', () => {
    const err = apiError(429, 'RATE_LIMIT_EXCEEDED', 'Too many requests', { 'retry-after': '30' })
    expect(newsErrorMessage(err)).toContain('30 seconds')
  })

  it('still explains the situation without a Retry-After header', () => {
    expect(newsErrorMessage(apiError(429, 'RATE_LIMIT_EXCEEDED'))).toContain('too quickly')
  })
})

describe('newsErrorMessage — fallbacks', () => {
  it('handles a server error', () => {
    expect(newsErrorMessage(apiError(500, 'INTERNAL_ERROR'))).toContain('our end')
  })

  it('handles an upload failure', () => {
    expect(newsErrorMessage(apiError(500, 'MEDIA_UPLOAD_FAILED'))).toContain("didn't go through")
  })

  it('falls back to the generic message for a non-Axios error', () => {
    expect(newsErrorMessage(new Error('boom'))).toBe('Something went wrong. Please try again.')
  })
})
