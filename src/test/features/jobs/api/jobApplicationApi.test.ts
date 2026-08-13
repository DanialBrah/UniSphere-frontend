import { describe, it, expect, vi, beforeEach } from 'vitest'

const get = vi.fn()
const post = vi.fn()
const patch = vi.fn()

vi.mock('../../../../lib/axios', () => ({
  default: {
    get: (...args: unknown[]) => get(...args),
    post: (...args: unknown[]) => post(...args),
    patch: (...args: unknown[]) => patch(...args),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const { jobApplicationApi } = await import('../../../../features/jobs/api/jobApplicationApi')

function lastUrl(mock = get): string {
  return (mock.mock.calls.at(-1) as [string])[0]
}

function lastParams(): Record<string, unknown> {
  const [, config] = get.mock.calls.at(-1) as [string, { params: Record<string, unknown> }]
  return config.params
}

function lastBody(mock: typeof post | typeof patch): unknown {
  return (mock.mock.calls.at(-1) as [string, unknown])[1]
}

beforeEach(() => {
  get.mockReset()
  post.mockReset()
  patch.mockReset()
  get.mockResolvedValue({ data: { data: { content: [], last: true, number: 0 } } })
  post.mockResolvedValue({ data: { data: {} } })
  patch.mockResolvedValue({ data: { data: {} } })
})

describe('jobApplicationApi — nested vs flat paths', () => {
  it('applies against the job-scoped path', async () => {
    await jobApplicationApi.apply(7, { resumeKey: 'job-applications/9/uuid.pdf' })
    expect(lastUrl(post)).toBe('/jobs/7/applications')
    expect(lastBody(post)).toEqual({ resumeKey: 'job-applications/9/uuid.pdf' })
  })

  it('lists the roster against the job-scoped path', async () => {
    await jobApplicationApi.listRoster(7, null, 0)
    expect(lastUrl()).toBe('/jobs/7/applications')
    expect(lastParams()).toEqual({ page: 0, size: 20 })
  })

  it('includes status when set on the roster query', async () => {
    await jobApplicationApi.listRoster(7, 'SHORTLISTED', 0)
    expect(lastParams()).toEqual({ page: 0, size: 20, status: 'SHORTLISTED' })
  })

  it("fetches the caller's own application for one job against the job-scoped path", async () => {
    get.mockResolvedValue({ data: { data: {} } })
    await jobApplicationApi.getMyApplication(7)
    expect(lastUrl()).toBe('/jobs/7/applications/me')
  })

  it('lists every application the caller has submitted against the flat path', async () => {
    await jobApplicationApi.listMyApplications(null, 0)
    expect(lastUrl()).toBe('/jobs/applications/me')
    expect(lastParams()).toEqual({ page: 0, size: 20 })
  })

  // An application id is globally unique, so decide is a flat route — no job id needed on the URL.
  it('decides against the flat application path', async () => {
    await jobApplicationApi.decide(42, 'SHORTLISTED')
    expect(lastUrl(patch)).toBe('/jobs/applications/42')
    expect(lastBody(patch)).toEqual({ status: 'SHORTLISTED' })
  })
})

describe('jobApplicationApi — decide reason is trimmed and omitted, not sent blank', () => {
  it('omits reason entirely when not given', async () => {
    await jobApplicationApi.decide(42, 'WITHDRAWN')
    expect(lastBody(patch)).toEqual({ status: 'WITHDRAWN' })
  })

  it('omits reason when it is only whitespace', async () => {
    await jobApplicationApi.decide(42, 'REJECTED', '   ')
    expect(lastBody(patch)).toEqual({ status: 'REJECTED' })
  })

  it('trims and includes a real reason', async () => {
    await jobApplicationApi.decide(42, 'REJECTED', '  Not enough experience  ')
    expect(lastBody(patch)).toEqual({ status: 'REJECTED', reason: 'Not enough experience' })
  })
})
