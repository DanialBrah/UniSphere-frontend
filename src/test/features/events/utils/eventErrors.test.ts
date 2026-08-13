import { describe, it, expect } from 'vitest'
import { AxiosError } from 'axios'
import { eventErrorMessage } from '../../../../features/events/utils/eventErrors'

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

describe('eventErrorMessage — not found', () => {
  it('explains a missing or invisible event', () => {
    expect(eventErrorMessage(apiError(404, 'EVENT_NOT_FOUND'))).toContain("doesn't exist")
  })

  it('explains a missing registration', () => {
    expect(eventErrorMessage(apiError(404, 'EVENT_REGISTRATION_NOT_FOUND'))).toContain(
      "doesn't exist",
    )
  })
})

describe('eventErrorMessage — transitions', () => {
  it('explains that COMPLETED is set automatically', () => {
    const msg = eventErrorMessage(
      apiError(409, 'INVALID_EVENT_STATUS_TRANSITION', 'COMPLETED is set by the automatic completion sweep, not directly'),
    )
    expect(msg).toMatch(/automatically/i)
  })

  it('explains a cancelled event', () => {
    const msg = eventErrorMessage(
      apiError(409, 'INVALID_EVENT_STATUS_TRANSITION', 'Cannot move an event from CANCELLED to PUBLISHED'),
    )
    expect(msg).toMatch(/already cancelled/i)
  })

  it('explains a waitlisted ticket that cannot be checked in yet', () => {
    const msg = eventErrorMessage(
      apiError(409, 'INVALID_EVENT_REGISTRATION_TRANSITION', 'This ticket is on the waitlist, not a confirmed seat'),
    )
    expect(msg).toMatch(/waitlist/i)
  })

  it('explains an already-checked-in ticket', () => {
    const msg = eventErrorMessage(
      apiError(409, 'INVALID_EVENT_REGISTRATION_TRANSITION', 'Already checked in at 2026-09-01T18:05:00'),
    )
    expect(msg).toMatch(/already been checked in/i)
  })
})

describe('eventErrorMessage — business rules', () => {
  it('tells the caller registration moved to an external link', () => {
    const msg = eventErrorMessage(
      apiError(400, 'BAD_REQUEST', 'This event uses external registration: https://forms.example.com/rsvp'),
    )
    expect(msg).toMatch(/external link/i)
  })

  it('explains an already-active registration', () => {
    expect(
      eventErrorMessage(apiError(400, 'BAD_REQUEST', 'You are already registered for this event')),
    ).toMatch(/already registered/i)
  })

  it('explains an organizer blocked from registering for their own event', () => {
    expect(
      eventErrorMessage(apiError(400, 'BAD_REQUEST', 'You cannot register for an event you organize')),
    ).toMatch(/organizer/i)
  })

  it('explains a started event', () => {
    expect(
      eventErrorMessage(
        apiError(400, 'BAD_REQUEST', 'Registration is closed — this event has already started'),
      ),
    ).toMatch(/already started/i)
  })

  it('explains an invalid ticket code at check-in', () => {
    expect(
      eventErrorMessage(apiError(400, 'BAD_REQUEST', 'Invalid ticket code for this event')),
    ).toMatch(/no ticket with that code/i)
  })

  it('explains a delete blocked by active registrations', () => {
    expect(
      eventErrorMessage(
        apiError(400, 'BAD_REQUEST', 'This event still has active registrations — cancel it instead of deleting it'),
      ),
    ).toMatch(/cancel it instead/i)
  })
})

describe('eventErrorMessage — media', () => {
  it('tells the organizer their upload expired when a media key is rejected', () => {
    expect(
      eventErrorMessage(apiError(403, 'FORBIDDEN', 'Media key does not belong to you: x')),
    ).toMatch(/upload has expired/i)
  })

  it('falls back to a generic permission message otherwise', () => {
    expect(eventErrorMessage(apiError(403, 'FORBIDDEN', 'Only the organizer can modify this event'))).toMatch(
      /organizer/i,
    )
  })
})

describe('eventErrorMessage — rate limiting', () => {
  // /register is capped at 10 requests per 60s per user.
  it('surfaces the Retry-After value when the server sends one', () => {
    const err = apiError(429, 'RATE_LIMIT_EXCEEDED', '', { 'retry-after': '30' })
    expect(eventErrorMessage(err)).toContain('30 seconds')
  })

  it('handles a bare 429 with no error code', () => {
    expect(eventErrorMessage(apiError(429, ''))).toMatch(/too quickly/i)
  })

  it('falls back to generic copy with no Retry-After header', () => {
    expect(eventErrorMessage(apiError(429, 'RATE_LIMIT_EXCEEDED'))).toMatch(/wait a moment/i)
  })
})

describe('eventErrorMessage — fallbacks', () => {
  it('never leaks a raw stack for a non-Axios failure', () => {
    expect(eventErrorMessage(new Error('boom'))).toBe('Something went wrong. Please try again.')
  })

  it('passes an unmapped validation message through, since the server’s copy is user-facing', () => {
    expect(
      eventErrorMessage(apiError(400, 'VALIDATION_ERROR', 'Title must not exceed 255 characters')),
    ).toBe('Title must not exceed 255 characters')
  })
})
