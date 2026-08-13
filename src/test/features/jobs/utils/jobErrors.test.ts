import { describe, it, expect } from 'vitest'
import { AxiosError } from 'axios'
import { jobErrorMessage } from '../../../../features/jobs/utils/jobErrors'

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

describe('jobErrorMessage — not found', () => {
  it('explains a missing or invisible job', () => {
    expect(jobErrorMessage(apiError(404, 'JOB_NOT_FOUND'))).toContain("doesn't exist")
  })

  it('explains a missing application', () => {
    expect(jobErrorMessage(apiError(404, 'JOB_APPLICATION_NOT_FOUND'))).toContain("doesn't exist")
  })
})

describe('jobErrorMessage — transitions', () => {
  it('explains a job already closed or filled', () => {
    const msg = jobErrorMessage(
      apiError(409, 'INVALID_JOB_STATUS_TRANSITION', 'Cannot move a job from CLOSED to OPEN'),
    )
    expect(msg).toMatch(/already closed or filled/i)
  })

  it('explains a job application that already reached a final decision', () => {
    const msg = jobErrorMessage(
      apiError(409, 'INVALID_JOB_APPLICATION_TRANSITION', 'Cannot move a job application from HIRED to WITHDRAWN'),
    )
    expect(msg).toMatch(/final decision/i)
  })

  it('falls back to generic copy for an unrecognised transition detail', () => {
    const msg = jobErrorMessage(
      apiError(409, 'INVALID_JOB_APPLICATION_TRANSITION', 'Cannot move a job application from SUBMITTED to HIRED'),
    )
    expect(msg).toMatch(/refresh/i)
  })
})

describe('jobErrorMessage — business rules', () => {
  it("tells the applicant this job's applications go through the employer's own site", () => {
    const msg = jobErrorMessage(
      apiError(400, 'BAD_REQUEST', "This job accepts applications on the employer's own site: https://careers.example.com"),
    )
    expect(msg).toMatch(/employer's own site/i)
  })

  it('explains an already-submitted application', () => {
    expect(
      jobErrorMessage(apiError(400, 'BAD_REQUEST', 'You have already applied to this job')),
    ).toMatch(/already applied/i)
  })

  it('explains a job that is not accepting applications', () => {
    expect(
      jobErrorMessage(apiError(400, 'BAD_REQUEST', 'Applications are only open for OPEN jobs')),
    ).toMatch(/not currently accepting/i)
  })

  it('explains a passed application deadline', () => {
    expect(
      jobErrorMessage(apiError(400, 'BAD_REQUEST', 'The application deadline for this job has passed')),
    ).toMatch(/deadline/i)
  })

  it('explains a salary range validation failure', () => {
    expect(jobErrorMessage(apiError(400, 'BAD_REQUEST', 'salaryMin must not exceed salaryMax'))).toMatch(
      /at least the minimum/i,
    )
  })

  it('explains a remote job with a location set', () => {
    expect(
      jobErrorMessage(apiError(400, 'BAD_REQUEST', 'A remote job cannot have a location')),
    ).toMatch(/remote roles have no location/i)
  })

  it('explains an on-site/hybrid job with no location', () => {
    expect(
      jobErrorMessage(apiError(400, 'BAD_REQUEST', 'An on-site or hybrid job requires a location')),
    ).toMatch(/add a location/i)
  })

  it('explains a delete blocked by existing applications', () => {
    expect(
      jobErrorMessage(
        apiError(400, 'BAD_REQUEST', 'This job has received applications — close it instead of deleting it'),
      ),
    ).toMatch(/close it instead/i)
  })

  it('explains an unsupported résumé file type', () => {
    expect(jobErrorMessage(apiError(400, 'BAD_REQUEST', 'File type not allowed: exe'))).toMatch(
      /PDF, DOC and DOCX/i,
    )
  })

  it('explains a résumé over the size cap', () => {
    expect(
      jobErrorMessage(apiError(400, 'BAD_REQUEST', 'Resume exceeds the maximum allowed size of 10485760 bytes')),
    ).toMatch(/too large/i)
  })
})

describe('jobErrorMessage — forbidden', () => {
  it('tells the applicant their upload expired when a media key is rejected', () => {
    expect(
      jobErrorMessage(apiError(403, 'FORBIDDEN', 'Media key does not belong to you: x')),
    ).toMatch(/upload has expired/i)
  })

  it('explains a non-applicant trying to withdraw', () => {
    expect(
      jobErrorMessage(apiError(403, 'FORBIDDEN', 'Only the applicant may withdraw their own application')),
    ).toMatch(/only the applicant/i)
  })

  it("explains a non-owner trying to decide an application", () => {
    expect(
      jobErrorMessage(apiError(403, 'FORBIDDEN', "Only the job's employer can update this application's status")),
    ).toMatch(/employer can decide/i)
  })

  it('falls back to a generic permission message otherwise', () => {
    expect(jobErrorMessage(apiError(403, 'FORBIDDEN', 'Something else entirely'))).toMatch(/permission/i)
  })
})

describe('jobErrorMessage — validation', () => {
  it('explains an unsupported content type on presign', () => {
    expect(jobErrorMessage(apiError(400, 'VALIDATION_ERROR', 'Unsupported content type'))).toMatch(
      /PDF, DOC or DOCX/i,
    )
  })

  it('passes an unmapped validation message through, since the server’s copy is user-facing', () => {
    expect(
      jobErrorMessage(apiError(400, 'VALIDATION_ERROR', 'Title must not exceed 255 characters')),
    ).toBe('Title must not exceed 255 characters')
  })
})

describe('jobErrorMessage — rate limiting', () => {
  // Applying is capped at 10 requests per 60s per user.
  it('surfaces the Retry-After value when the server sends one', () => {
    const err = apiError(429, 'RATE_LIMIT_EXCEEDED', '', { 'retry-after': '30' })
    expect(jobErrorMessage(err)).toContain('30 seconds')
  })

  it('handles a bare 429 with no error code', () => {
    expect(jobErrorMessage(apiError(429, ''))).toMatch(/too quickly/i)
  })

  it('falls back to generic copy with no Retry-After header', () => {
    expect(jobErrorMessage(apiError(429, 'RATE_LIMIT_EXCEEDED'))).toMatch(/wait a moment/i)
  })
})

describe('jobErrorMessage — fallbacks', () => {
  it('never leaks a raw stack for a non-Axios failure', () => {
    expect(jobErrorMessage(new Error('boom'))).toBe('Something went wrong. Please try again.')
  })
})
