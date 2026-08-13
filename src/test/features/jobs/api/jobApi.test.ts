import { describe, it, expect, vi, beforeEach } from 'vitest'

const get = vi.fn()
const post = vi.fn()

vi.mock('../../../../lib/axios', () => ({
  default: {
    get: (...args: unknown[]) => get(...args),
    post: (...args: unknown[]) => post(...args),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const { jobApi } = await import('../../../../features/jobs/api/jobApi')

/** Reads the `params` object off the most recent axios call. */
function lastParams(): Record<string, unknown> {
  const [, config] = get.mock.calls.at(-1) as [string, { params: Record<string, unknown> }]
  return config.params
}

function lastUrl(): string {
  return (get.mock.calls.at(-1) as [string])[0]
}

beforeEach(() => {
  get.mockReset()
  post.mockReset()
  get.mockResolvedValue({ data: { data: { content: [], last: true, number: 0 } } })
  post.mockResolvedValue({ data: { data: {} } })
})

/**
 * The rule these all guard: axios drops an `undefined` value but serialises `null` as the literal
 * string "null". Spring then fails to bind that to an enum, and because GlobalExceptionHandler
 * doesn't extend ResponseEntityExceptionHandler it surfaces as a 500 rather than a 400.
 */
describe('jobApi — params are built by omission, never by null', () => {
  it('omits every unset filter from the feed query', async () => {
    await jobApi.getFeed(
      { jobType: null, workMode: null, experienceLevel: null, universityId: null, status: null },
      0,
    )

    const params = lastParams()
    expect(params).toEqual({ page: 0, size: 20 })
    expect(params).not.toHaveProperty('jobType')
    expect(params).not.toHaveProperty('workMode')
    expect(params).not.toHaveProperty('experienceLevel')
    expect(params).not.toHaveProperty('universityId')
    expect(params).not.toHaveProperty('status')
  })

  it('includes only the filters that are set', async () => {
    await jobApi.getFeed(
      { jobType: 'INTERNSHIP', workMode: 'REMOTE', experienceLevel: 'ENTRY_LEVEL', universityId: 3, status: 'CLOSED' },
      2,
    )

    expect(lastParams()).toEqual({
      page: 2,
      size: 20,
      jobType: 'INTERNSHIP',
      workMode: 'REMOTE',
      experienceLevel: 'ENTRY_LEVEL',
      universityId: 3,
      status: 'CLOSED',
    })
  })

  it('never stringifies a null into the query', async () => {
    await jobApi.getFeed(
      { jobType: null, workMode: null, experienceLevel: null, universityId: null, status: null },
      0,
    )

    for (const value of Object.values(lastParams())) {
      expect(value).not.toBeNull()
      expect(value).not.toBe('null')
    }
  })

  it('omits an unset status on the my-jobs query', async () => {
    await jobApi.getMyJobs(null, 0)
    expect(lastParams()).toEqual({ page: 0, size: 20 })
  })
})

describe('jobApi — search', () => {
  it('always sends q, which is a required param the server cannot bind as null', async () => {
    await jobApi.search('software engineer', null, 0)

    expect(lastUrl()).toBe('/jobs/search')
    expect(lastParams()).toEqual({ q: 'software engineer', page: 0, size: 20 })
  })

  it('includes jobType when set', async () => {
    await jobApi.search('engineer', 'INTERNSHIP', 0)
    expect(lastParams()).toMatchObject({ jobType: 'INTERNSHIP' })
  })
})

describe('jobApi — endpoints', () => {
  it('targets the paths the controllers expose', async () => {
    await jobApi.getFeed(
      { jobType: null, workMode: null, experienceLevel: null, universityId: null, status: null },
      0,
    )
    expect(lastUrl()).toBe('/jobs')

    await jobApi.getMyJobs(null, 0)
    expect(lastUrl()).toBe('/jobs/me')

    get.mockResolvedValue({ data: { data: {} } })
    await jobApi.getJob(7)
    expect(lastUrl()).toBe('/jobs/7')

    await jobApi.getStats(7)
    expect(lastUrl()).toBe('/jobs/7/stats')
  })
})
