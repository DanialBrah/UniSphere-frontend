import { describe, it, expect } from 'vitest'
import {
  lostFoundClaimSchema,
  lostFoundItemSchema,
  LF_PROOF_TEXT_MIN,
} from '../../../../features/lostfound/schemas'

/** A valid LOST report — the minimum the server accepts, with no location at all. */
function baseItem(overrides: Record<string, unknown> = {}) {
  return {
    itemType: 'LOST',
    category: 'ELECTRONICS',
    title: 'Black Anker power bank',
    description: '',
    identifyingDetail: '',
    incidentPlace: '',
    incidentLatitude: '',
    incidentLongitude: '',
    pickupPlace: '',
    pickupLatitude: '',
    pickupLongitude: '',
    pickupInstructions: '',
    occurredAt: '2026-08-05T14:30',
    ...overrides,
  }
}

function issuePaths(result: ReturnType<typeof lostFoundItemSchema.safeParse>): string[] {
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'))
}

describe('lostFoundItemSchema — coordinate pairing', () => {
  it('accepts a report with no coordinates at all', () => {
    expect(lostFoundItemSchema.safeParse(baseItem()).success).toBe(true)
  })

  it('accepts a complete incident pair', () => {
    const result = lostFoundItemSchema.safeParse(
      baseItem({ incidentLatitude: '3.0678', incidentLongitude: '101.5006' }),
    )
    expect(result.success).toBe(true)
  })

  // Mirrors the LostFoundService rule: "incidentLatitude and incidentLongitude must be provided
  // together". Catching it here turns a 400 round-trip into an inline field error.
  it('rejects a latitude with no longitude', () => {
    const result = lostFoundItemSchema.safeParse(baseItem({ incidentLatitude: '3.0678' }))

    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('incidentLatitude')
  })

  it('rejects a longitude with no latitude', () => {
    const result = lostFoundItemSchema.safeParse(baseItem({ incidentLongitude: '101.5006' }))

    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('incidentLatitude')
  })

  it('applies the same rule to the pickup pair', () => {
    const result = lostFoundItemSchema.safeParse(
      baseItem({ pickupPlace: 'Security desk', pickupLatitude: '3.0678' }),
    )

    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('pickupLatitude')
  })
})

describe('lostFoundItemSchema — FOUND needs a pickup location', () => {
  it('rejects a FOUND report with neither a pickup place nor pickup coordinates', () => {
    const result = lostFoundItemSchema.safeParse(baseItem({ itemType: 'FOUND' }))

    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('pickupPlace')
  })

  it('accepts a FOUND report with only a pickup place', () => {
    const result = lostFoundItemSchema.safeParse(
      baseItem({ itemType: 'FOUND', pickupPlace: 'Security office, Block A' }),
    )

    expect(result.success).toBe(true)
  })

  it('accepts a FOUND report with only pickup coordinates', () => {
    const result = lostFoundItemSchema.safeParse(
      baseItem({ itemType: 'FOUND', pickupLatitude: '3.0678', pickupLongitude: '101.5006' }),
    )

    expect(result.success).toBe(true)
  })

  it('does not count a whitespace-only pickup place as a location', () => {
    const result = lostFoundItemSchema.safeParse(
      baseItem({ itemType: 'FOUND', pickupPlace: '   ' }),
    )

    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('pickupPlace')
  })

  // A LOST report may carry a pickup place — it means "where to return it to me".
  it('does not require a pickup location on a LOST report', () => {
    expect(lostFoundItemSchema.safeParse(baseItem({ itemType: 'LOST' })).success).toBe(true)
  })
})

describe('lostFoundItemSchema — required fields', () => {
  it('rejects a blank title', () => {
    const result = lostFoundItemSchema.safeParse(baseItem({ title: '   ' }))

    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('title')
  })

  it('rejects a missing occurredAt, which is @NotNull server-side', () => {
    const result = lostFoundItemSchema.safeParse(baseItem({ occurredAt: '' }))

    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('occurredAt')
  })

  it('rejects a title past the 255-character column limit', () => {
    const result = lostFoundItemSchema.safeParse(baseItem({ title: 'x'.repeat(256) }))

    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('title')
  })
})

describe('lostFoundClaimSchema', () => {
  it(`rejects proof shorter than the server's ${LF_PROOF_TEXT_MIN}-character minimum`, () => {
    expect(lostFoundClaimSchema.safeParse({ proofText: "That's mine" }).success).toBe(false)
  })

  it('accepts proof at exactly the minimum', () => {
    expect(
      lostFoundClaimSchema.safeParse({ proofText: 'x'.repeat(LF_PROOF_TEXT_MIN) }).success,
    ).toBe(true)
  })

  it('measures the trimmed length, so padding cannot game the minimum', () => {
    const padded = `${' '.repeat(30)}mine${' '.repeat(30)}`

    expect(lostFoundClaimSchema.safeParse({ proofText: padded }).success).toBe(false)
  })
})
