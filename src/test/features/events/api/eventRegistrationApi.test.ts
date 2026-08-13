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

const { eventRegistrationApi } = await import('../../../../features/events/api/eventRegistrationApi')

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

describe('eventRegistrationApi — params are built by omission', () => {
  it('omits an unset status on the roster query', async () => {
    await eventRegistrationApi.listRoster(7, null, 0)

    expect(lastUrl()).toBe('/events/7/registrations')
    expect(lastParams()).toEqual({ page: 0, size: 20 })
  })

  it('includes status when set on the roster query', async () => {
    await eventRegistrationApi.listRoster(7, 'WAITLISTED', 0)

    expect(lastParams()).toEqual({ page: 0, size: 20, status: 'WAITLISTED' })
  })

  it('omits an unset status on the my-tickets query, which is a flat route', async () => {
    await eventRegistrationApi.listMyTickets(null, 0)

    expect(lastUrl()).toBe('/events/registrations/me')
    expect(lastParams()).toEqual({ page: 0, size: 20 })
  })
})

describe('eventRegistrationApi — endpoints', () => {
  it('registers against the event-scoped path', async () => {
    await eventRegistrationApi.register(7)
    expect(lastUrl(post)).toBe('/events/7/register')
  })

  it('checks in against the event-scoped path with the ticket code in the body', async () => {
    await eventRegistrationApi.checkIn(7, { ticketCode: 'abc-123' })

    expect(lastUrl(post)).toBe('/events/7/check-in')
    expect(lastBody(post)).toEqual({ ticketCode: 'abc-123' })
  })

  it('fetches the caller’s own registration for one event', async () => {
    get.mockResolvedValue({ data: { data: {} } })
    await eventRegistrationApi.getMyRegistration(7)
    expect(lastUrl()).toBe('/events/7/registrations/me')
  })

  // A registration id is globally unique, so cancel is a flat route — no event id needed on the URL.
  it('cancels against the flat registration path, always with status CANCELLED', async () => {
    await eventRegistrationApi.cancel(42)

    expect(lastUrl(patch)).toBe('/events/registrations/42')
    expect(lastBody(patch)).toEqual({ status: 'CANCELLED' })
  })
})
