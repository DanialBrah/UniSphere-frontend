import { describe, it, expect } from 'vitest'
import { eventFormSchema } from '../../../../features/events/schemas'

/** A valid in-person, internal-registration event — the minimum the server accepts. */
function baseEvent(overrides: Record<string, unknown> = {}) {
  return {
    title: "Freshers' Welcome Night",
    description: '',
    category: 'SOCIAL',
    startDatetime: '2026-09-01T18:00',
    endDatetime: '2026-09-01T21:00',
    online: false,
    onlineUrl: '',
    venueName: 'Main auditorium',
    latitude: '3.0678',
    longitude: '101.5006',
    registrationMode: 'INTERNAL',
    externalRegistrationUrl: '',
    maxCapacity: '',
    ...overrides,
  }
}

function issuePaths(result: ReturnType<typeof eventFormSchema.safeParse>): string[] {
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'))
}

describe('eventFormSchema — online vs in-person', () => {
  it('accepts a valid in-person event', () => {
    expect(eventFormSchema.safeParse(baseEvent()).success).toBe(true)
  })

  it('accepts a valid online event', () => {
    const result = eventFormSchema.safeParse(
      baseEvent({
        online: true,
        onlineUrl: 'https://meet.example.com/room',
        venueName: '',
        latitude: '',
        longitude: '',
      }),
    )
    expect(result.success).toBe(true)
  })

  it('rejects an online event with no join link', () => {
    const result = eventFormSchema.safeParse(baseEvent({ online: true, onlineUrl: '' }))

    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('onlineUrl')
  })

  it('rejects an in-person event with no venue name', () => {
    const result = eventFormSchema.safeParse(baseEvent({ venueName: '' }))

    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('venueName')
  })

  it('rejects an in-person event with no map pin', () => {
    const result = eventFormSchema.safeParse(baseEvent({ latitude: '', longitude: '' }))

    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('latitude')
  })

  it('rejects a half-dropped pin', () => {
    const result = eventFormSchema.safeParse(baseEvent({ longitude: '' }))

    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('latitude')
  })
})

describe('eventFormSchema — registration mode', () => {
  it('accepts an external event with a registration link and no capacity', () => {
    const result = eventFormSchema.safeParse(
      baseEvent({
        registrationMode: 'EXTERNAL',
        externalRegistrationUrl: 'https://forms.example.com/rsvp',
        maxCapacity: '',
      }),
    )
    expect(result.success).toBe(true)
  })

  it('rejects an external event with no registration link', () => {
    const result = eventFormSchema.safeParse(
      baseEvent({ registrationMode: 'EXTERNAL', externalRegistrationUrl: '' }),
    )

    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('externalRegistrationUrl')
  })

  // Mirrors EventService: registrationMode = EXTERNAL forbids maxCapacity, since capacity is
  // meaningless without in-app tracking.
  it('rejects an external event that also sets a capacity', () => {
    const result = eventFormSchema.safeParse(
      baseEvent({
        registrationMode: 'EXTERNAL',
        externalRegistrationUrl: 'https://forms.example.com/rsvp',
        maxCapacity: '50',
      }),
    )

    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('maxCapacity')
  })

  it('accepts an internal event with a capacity set', () => {
    expect(eventFormSchema.safeParse(baseEvent({ maxCapacity: '50' })).success).toBe(true)
  })

  it('accepts an internal event with no capacity — unlimited', () => {
    expect(eventFormSchema.safeParse(baseEvent({ maxCapacity: '' })).success).toBe(true)
  })

  // Mirrors EventService: registrationMode = INTERNAL forbids externalRegistrationUrl.
  it('rejects an internal event that also sets a registration link', () => {
    const result = eventFormSchema.safeParse(
      baseEvent({ registrationMode: 'INTERNAL', externalRegistrationUrl: 'https://forms.example.com/rsvp' }),
    )

    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('externalRegistrationUrl')
  })
})

describe('eventFormSchema — date order', () => {
  it('rejects an end time before the start time', () => {
    const result = eventFormSchema.safeParse(
      baseEvent({ startDatetime: '2026-09-01T18:00', endDatetime: '2026-09-01T17:00' }),
    )

    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('endDatetime')
  })

  it('rejects an end time equal to the start time', () => {
    const result = eventFormSchema.safeParse(
      baseEvent({ startDatetime: '2026-09-01T18:00', endDatetime: '2026-09-01T18:00' }),
    )

    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('endDatetime')
  })

  it('accepts an end time after the start time', () => {
    expect(eventFormSchema.safeParse(baseEvent()).success).toBe(true)
  })
})

describe('eventFormSchema — required fields', () => {
  it('rejects a blank title', () => {
    const result = eventFormSchema.safeParse(baseEvent({ title: '   ' }))

    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('title')
  })

  it('rejects a title past the 255-character column limit', () => {
    const result = eventFormSchema.safeParse(baseEvent({ title: 'x'.repeat(256) }))

    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('title')
  })
})
