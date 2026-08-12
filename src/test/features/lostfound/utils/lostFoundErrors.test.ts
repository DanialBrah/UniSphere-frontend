import { describe, it, expect } from 'vitest'
import { AxiosError } from 'axios'
import { lostFoundErrorMessage } from '../../../../features/lostfound/utils/lostFoundErrors'

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

describe('lostFoundErrorMessage — not found', () => {
  // The server answers "deleted" and "not visible to you" with the same 404 so a 403 can't be
  // used to confirm a row exists. Saying "no permission" here would undo that.
  it('stays deliberately vague about whether the item exists', () => {
    const msg = lostFoundErrorMessage(apiError(404, 'LOST_FOUND_ITEM_NOT_FOUND'))

    expect(msg).toContain("doesn't exist")
    expect(msg).not.toMatch(/permission/i)
  })

  it('does the same for a claim', () => {
    expect(lostFoundErrorMessage(apiError(404, 'LOST_FOUND_CLAIM_NOT_FOUND'))).toContain(
      "doesn't exist",
    )
  })
})

describe('lostFoundErrorMessage — transitions', () => {
  it('explains a closed item when a status change is refused', () => {
    const msg = lostFoundErrorMessage(
      apiError(409, 'INVALID_LOST_FOUND_STATUS_TRANSITION', 'Cannot move from RESOLVED to OPEN'),
    )

    expect(msg).toMatch(/already closed/i)
  })

  it('falls back to a refresh prompt for any other refused transition', () => {
    const msg = lostFoundErrorMessage(
      apiError(409, 'INVALID_LOST_FOUND_STATUS_TRANSITION', 'Cannot move from OPEN to CLAIMED'),
    )

    expect(msg).toMatch(/refresh/i)
  })

  it('tells the reporter a claim was already decided', () => {
    expect(lostFoundErrorMessage(apiError(409, 'INVALID_LOST_FOUND_CLAIM_TRANSITION'))).toMatch(
      /already been decided/i,
    )
  })
})

describe('lostFoundErrorMessage — business rules', () => {
  it('turns the paired-coordinate rule into an instruction', () => {
    const msg = lostFoundErrorMessage(
      apiError(400, 'BAD_REQUEST', 'incidentLatitude and incidentLongitude must be provided together'),
    )

    expect(msg).toMatch(/latitude and a longitude/i)
  })

  it('turns the FOUND pickup rule into an instruction', () => {
    const msg = lostFoundErrorMessage(
      apiError(
        400,
        'BAD_REQUEST',
        'A FOUND item needs a pickup location — set pickupPlace or pickup coordinates',
      ),
    )

    expect(msg).toMatch(/where to collect it/i)
  })

  it('explains a duplicate claim', () => {
    expect(
      lostFoundErrorMessage(
        apiError(400, 'BAD_REQUEST', 'You already have a pending claim on this item'),
      ),
    ).toMatch(/already have a claim/i)
  })

  it('explains claiming your own item', () => {
    expect(
      lostFoundErrorMessage(
        apiError(400, 'BAD_REQUEST', 'You cannot claim an item you reported yourself'),
      ),
    ).toMatch(/you reported this item/i)
  })

  it('explains the 20-character proof minimum', () => {
    expect(
      lostFoundErrorMessage(
        apiError(400, 'VALIDATION_ERROR', 'Describe what proves the item is yours (at least 20 characters)'),
      ),
    ).toMatch(/at least 20 characters/i)
  })
})

describe('lostFoundErrorMessage — media', () => {
  it('tells the reporter their upload expired when a media key is rejected', () => {
    expect(
      lostFoundErrorMessage(apiError(403, 'FORBIDDEN', 'Media key does not belong to you: x')),
    ).toMatch(/upload has expired/i)
  })

  it('explains a 403 on someone else’s claim list', () => {
    expect(
      lostFoundErrorMessage(apiError(403, 'FORBIDDEN', 'You cannot view claims on this item')),
    ).toMatch(/who reported this item/i)
  })
})

describe('lostFoundErrorMessage — rate limiting', () => {
  // The claim endpoints are capped at 10 requests per 60s per user, including GETs, so 429 is a
  // routine outcome rather than an edge case.
  it('surfaces the Retry-After value when the server sends one', () => {
    const err = apiError(429, 'RATE_LIMIT_EXCEEDED', '', { 'retry-after': '42' })

    expect(lostFoundErrorMessage(err)).toContain('42 seconds')
  })

  it('handles a bare 429 with no error code', () => {
    expect(lostFoundErrorMessage(apiError(429, ''))).toMatch(/too quickly/i)
  })

  it('falls back to generic copy with no Retry-After header', () => {
    expect(lostFoundErrorMessage(apiError(429, 'RATE_LIMIT_EXCEEDED'))).toMatch(/wait a moment/i)
  })
})

describe('lostFoundErrorMessage — fallbacks', () => {
  it('never leaks a raw stack for a non-Axios failure', () => {
    expect(lostFoundErrorMessage(new Error('boom'))).toBe(
      'Something went wrong. Please try again.',
    )
  })

  it('passes an unmapped validation message through, since the server’s copy is user-facing', () => {
    expect(
      lostFoundErrorMessage(apiError(400, 'VALIDATION_ERROR', 'Title must not exceed 255 characters')),
    ).toBe('Title must not exceed 255 characters')
  })
})
