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

const { lostFoundApi } = await import('../../../../features/lostfound/api/lostFoundApi')

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
describe('lostFoundApi — params are built by omission, never by null', () => {
  it('omits every unset filter from the feed query', async () => {
    await lostFoundApi.getFeed({ type: null, status: null, category: null }, 0)

    const params = lastParams()
    expect(params).toEqual({ page: 0, size: 20 })
    expect(params).not.toHaveProperty('type')
    expect(params).not.toHaveProperty('status')
    expect(params).not.toHaveProperty('category')
  })

  it('includes only the filters that are set', async () => {
    await lostFoundApi.getFeed({ type: 'LOST', status: null, category: 'ELECTRONICS' }, 2)

    expect(lastParams()).toEqual({
      page: 2,
      size: 20,
      type: 'LOST',
      category: 'ELECTRONICS',
    })
  })

  it('never stringifies a null into the query', async () => {
    await lostFoundApi.getFeed({ type: null, status: null, category: null }, 0)

    for (const value of Object.values(lastParams())) {
      expect(value).not.toBe(null)
      expect(value).not.toBe('null')
    }
  })

  it('omits an unset status on the my-items query', async () => {
    await lostFoundApi.getMyItems(null, 0)

    expect(lastParams()).toEqual({ page: 0, size: 20 })
  })

  it('omits an unset radius on the nearby query but keeps the required coordinates', async () => {
    await lostFoundApi.getNearby(3.0678, 101.5006, null, {
      type: null,
      status: null,
      category: null,
    }, 0)

    expect(lastParams()).toEqual({ lat: 3.0678, lng: 101.5006, page: 0, size: 20 })
  })

  it('passes a radius through when one is given', async () => {
    await lostFoundApi.getNearby(3.0678, 101.5006, 2.5, {
      type: 'FOUND',
      status: null,
      category: null,
    }, 0)

    expect(lastParams()).toMatchObject({ radiusKm: 2.5, type: 'FOUND' })
  })
})

describe('lostFoundApi — map pins', () => {
  it('sends all four bounding-box params, which are all required', async () => {
    get.mockResolvedValue({ data: { data: [] } })

    await lostFoundApi.getMapPins(
      { minLat: 3.06, maxLat: 3.08, minLng: 101.49, maxLng: 101.51 },
      { type: null, status: 'OPEN' },
    )

    expect(lastUrl()).toBe('/lost-found/items/map')
    expect(lastParams()).toEqual({
      minLat: 3.06,
      maxLat: 3.08,
      minLng: 101.49,
      maxLng: 101.51,
      status: 'OPEN',
    })
  })
})

describe('lostFoundApi — search', () => {
  it('always sends q, which is a required param the server cannot bind as null', async () => {
    await lostFoundApi.search('power bank', { type: null, status: null }, 0)

    expect(lastUrl()).toBe('/lost-found/items/search')
    expect(lastParams()).toEqual({ q: 'power bank', page: 0, size: 20 })
  })
})

describe('lostFoundApi — endpoints', () => {
  it('targets the paths the controllers expose', async () => {
    await lostFoundApi.getFeed({ type: null, status: null, category: null }, 0)
    expect(lastUrl()).toBe('/lost-found/items')

    await lostFoundApi.getMyItems(null, 0)
    expect(lastUrl()).toBe('/lost-found/items/me')

    get.mockResolvedValue({ data: { data: {} } })
    await lostFoundApi.getItem(7)
    expect(lastUrl()).toBe('/lost-found/items/7')

    await lostFoundApi.getStats()
    expect(lastUrl()).toBe('/lost-found/stats')

    get.mockResolvedValue({ data: { data: [] } })
    await lostFoundApi.getMatches(7)
    expect(lastUrl()).toBe('/lost-found/items/7/matches')
  })
})
