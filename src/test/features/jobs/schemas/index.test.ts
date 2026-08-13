import { describe, it, expect } from 'vitest'
import { buildJobFormSchema } from '../../../../features/jobs/schemas'

/** A valid on-site, internal-application job — the minimum the server accepts. */
function baseJob(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Software Engineer Intern',
    description: '',
    requirements: '',
    jobType: 'INTERNSHIP',
    workMode: 'ON_SITE',
    experienceLevel: 'INTERNSHIP',
    location: 'Kuala Lumpur, Malaysia',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'MYR',
    applicationMode: 'INTERNAL',
    externalApplyUrl: '',
    applicationDeadline: '',
    universityId: '',
    ...overrides,
  }
}

function issuePaths(result: ReturnType<ReturnType<typeof buildJobFormSchema>['safeParse']>): string[] {
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'))
}

describe('jobFormSchema — work mode vs location', () => {
  const schema = buildJobFormSchema(false)

  it('accepts an on-site job with a location', () => {
    expect(schema.safeParse(baseJob()).success).toBe(true)
  })

  it('accepts a remote job with no location', () => {
    const result = schema.safeParse(baseJob({ workMode: 'REMOTE', location: '' }))
    expect(result.success).toBe(true)
  })

  it('rejects an on-site job with no location', () => {
    const result = schema.safeParse(baseJob({ location: '' }))
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('location')
  })

  it('rejects a hybrid job with no location', () => {
    const result = schema.safeParse(baseJob({ workMode: 'HYBRID', location: '' }))
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('location')
  })

  it('rejects a remote job that also sets a location', () => {
    const result = schema.safeParse(baseJob({ workMode: 'REMOTE', location: 'Kuala Lumpur' }))
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('location')
  })
})

describe('jobFormSchema — application mode', () => {
  const schema = buildJobFormSchema(false)

  it('accepts an external job with an application link', () => {
    const result = schema.safeParse(
      baseJob({ applicationMode: 'EXTERNAL', externalApplyUrl: 'https://careers.example.com/apply' }),
    )
    expect(result.success).toBe(true)
  })

  it('rejects an external job with no application link', () => {
    const result = schema.safeParse(baseJob({ applicationMode: 'EXTERNAL', externalApplyUrl: '' }))
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('externalApplyUrl')
  })

  it('rejects an internal job that also sets an application link', () => {
    const result = schema.safeParse(
      baseJob({ applicationMode: 'INTERNAL', externalApplyUrl: 'https://careers.example.com/apply' }),
    )
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('externalApplyUrl')
  })

  it('accepts an internal job with no application link', () => {
    expect(schema.safeParse(baseJob()).success).toBe(true)
  })
})

describe('jobFormSchema — salary range', () => {
  const schema = buildJobFormSchema(false)

  it('accepts a minimum at or below the maximum', () => {
    expect(schema.safeParse(baseJob({ salaryMin: '3000', salaryMax: '5000' })).success).toBe(true)
    expect(schema.safeParse(baseJob({ salaryMin: '3000', salaryMax: '3000' })).success).toBe(true)
  })

  it('rejects a minimum above the maximum', () => {
    const result = schema.safeParse(baseJob({ salaryMin: '6000', salaryMax: '5000' }))
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('salaryMax')
  })

  it('accepts either bound left unset', () => {
    expect(schema.safeParse(baseJob({ salaryMin: '3000', salaryMax: '' })).success).toBe(true)
    expect(schema.safeParse(baseJob({ salaryMin: '', salaryMax: '5000' })).success).toBe(true)
  })
})

describe('jobFormSchema — application deadline, create vs edit', () => {
  it('rejects a past deadline on create', () => {
    const result = buildJobFormSchema(false).safeParse(baseJob({ applicationDeadline: '2020-01-01' }))
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('applicationDeadline')
  })

  it('accepts a future deadline on create', () => {
    const result = buildJobFormSchema(false).safeParse(baseJob({ applicationDeadline: '2099-01-01' }))
    expect(result.success).toBe(true)
  })

  // JobService only enforces @Future on create — UpdateJobRequest has no such rule, so the edit
  // schema variant must not reject a deadline that has already passed on an existing posting.
  it('accepts a past deadline on edit', () => {
    const result = buildJobFormSchema(true).safeParse(baseJob({ applicationDeadline: '2020-01-01' }))
    expect(result.success).toBe(true)
  })

  it('accepts no deadline at all on either variant', () => {
    expect(buildJobFormSchema(false).safeParse(baseJob()).success).toBe(true)
    expect(buildJobFormSchema(true).safeParse(baseJob()).success).toBe(true)
  })
})

describe('jobFormSchema — required fields', () => {
  const schema = buildJobFormSchema(false)

  it('rejects a blank title', () => {
    const result = schema.safeParse(baseJob({ title: '   ' }))
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('title')
  })

  it('rejects a title past the 255-character column limit', () => {
    const result = schema.safeParse(baseJob({ title: 'x'.repeat(256) }))
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('title')
  })

  it('rejects a currency that is not exactly 3 letters', () => {
    const result = schema.safeParse(baseJob({ salaryCurrency: 'US' }))
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('salaryCurrency')
  })
})
