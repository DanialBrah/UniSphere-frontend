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

const { eventApi } = await import('../../../../features/events/api/eventApi')

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
describe('eventApi — params are built by omission, never by null', () => {
  it('omits every unset filter from the feed query', async () => {
    await eventApi.getFeed({ category: null, status: null, isOnline: null }, 0)

    const params = lastParams()
    expect(params).toEqual({ page: 0, size: 20 })
    expect(params).not.toHaveProperty('category')
    expect(params).not.toHaveProperty('status')
    expect(params).not.toHaveProperty('isOnline')
  })

  it('includes only the filters that are set', async () => {
    await eventApi.getFeed({ category: 'TECH', status: 'COMPLETED', isOnline: true }, 2)

    expect(lastParams()).toEqual({
      page: 2,
      size: 20,
      category: 'TECH',
      status: 'COMPLETED',
      isOnline: true,
    })
  })

  it('keeps isOnline=false rather than dropping a falsy-but-set filter', async () => {
    // isOnline is a tri-state (null/true/false); `!= null` is what has to gate it, not truthiness.
    await eventApi.getFeed({ category: null, status: null, isOnline: false }, 0)

    expect(lastParams()).toMatchObject({ isOnline: false })
  })

  it('never stringifies a null into the query', async () => {
    await eventApi.getFeed({ category: null, status: null, isOnline: null }, 0)

    for (const value of Object.values(lastParams())) {
      expect(value).not.toBeNull()
      expect(value).not.toBe('null')
    }
  })

  it('omits an unset status on the my-events query', async () => {
    await eventApi.getMyEvents(null, 0)

    expect(lastParams()).toEqual({ page: 0, size: 20 })
  })

  it('omits an unset radius on the nearby query but keeps the required coordinates', async () => {
    await eventApi.getNearby(3.0678, 101.5006, null, null, 0)

    expect(lastParams()).toEqual({ lat: 3.0678, lng: 101.5006, page: 0, size: 20 })
  })

  it('passes a radius through when one is given', async () => {
    await eventApi.getNearby(3.0678, 101.5006, 2.5, 'TECH', 0)

    expect(lastParams()).toMatchObject({ radiusKm: 2.5, category: 'TECH' })
  })
})

describe('eventApi — map pins', () => {
  it('sends all four bounding-box params, which are all required', async () => {
    get.mockResolvedValue({ data: { data: [] } })

    await eventApi.getMapPins(
      { minLat: 3.06, maxLat: 3.08, minLng: 101.49, maxLng: 101.51 },
      { category: 'SOCIAL' },
    )

    expect(lastUrl()).toBe('/events/map')
    expect(lastParams()).toEqual({
      minLat: 3.06,
      maxLat: 3.08,
      minLng: 101.49,
      maxLng: 101.51,
      category: 'SOCIAL',
    })
  })
})

describe('eventApi — search', () => {
  it('always sends q, which is a required param the server cannot bind as null', async () => {
    await eventApi.search('welcome night', null, 0)

    expect(lastUrl()).toBe('/events/search')
    expect(lastParams()).toEqual({ q: 'welcome night', page: 0, size: 20 })
  })
})

describe('eventApi — endpoints', () => {
  it('targets the paths the controllers expose', async () => {
    await eventApi.getFeed({ category: null, status: null, isOnline: null }, 0)
    expect(lastUrl()).toBe('/events')

    await eventApi.getMyEvents(null, 0)
    expect(lastUrl()).toBe('/events/me')

    get.mockResolvedValue({ data: { data: {} } })
    await eventApi.getEvent(7)
    expect(lastUrl()).toBe('/events/7')

    await eventApi.getStats(7)
    expect(lastUrl()).toBe('/events/7/stats')
  })
})
