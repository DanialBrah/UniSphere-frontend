import { describe, it, expect } from 'vitest'
import { buildRequestServiceOrderSchema, serviceListingFormSchema } from '../../../../features/services/schemas'

function issuePaths(result: ReturnType<typeof serviceListingFormSchema.safeParse>): string[] {
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'))
}

function orderIssuePaths(
  result: ReturnType<ReturnType<typeof buildRequestServiceOrderSchema>['safeParse']>,
): string[] {
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'))
}

/** A valid FIXED listing — the minimum the server accepts. */
function baseListing(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Calculus & Statistics Tutoring',
    description: '',
    category: 'Tutoring',
    pricingType: 'FIXED',
    price: '50',
    deliveryMode: 'BOTH',
    ...overrides,
  }
}

describe('serviceListingFormSchema — pricingType vs price', () => {
  it('accepts a FIXED listing with a price', () => {
    expect(serviceListingFormSchema.safeParse(baseListing()).success).toBe(true)
  })

  it('accepts an HOURLY listing with a price', () => {
    expect(serviceListingFormSchema.safeParse(baseListing({ pricingType: 'HOURLY', price: '25' })).success).toBe(
      true,
    )
  })

  it('rejects a FIXED listing with no price', () => {
    const result = serviceListingFormSchema.safeParse(baseListing({ price: '' }))
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('price')
  })

  it('rejects an HOURLY listing with no price', () => {
    const result = serviceListingFormSchema.safeParse(baseListing({ pricingType: 'HOURLY', price: '' }))
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('price')
  })

  it('accepts a NEGOTIABLE listing with no price', () => {
    const result = serviceListingFormSchema.safeParse(baseListing({ pricingType: 'NEGOTIABLE', price: '' }))
    expect(result.success).toBe(true)
  })

  it('rejects a NEGOTIABLE listing that also sets a price', () => {
    const result = serviceListingFormSchema.safeParse(baseListing({ pricingType: 'NEGOTIABLE', price: '50' }))
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('price')
  })
})

describe('serviceListingFormSchema — required fields', () => {
  it('rejects a blank title', () => {
    const result = serviceListingFormSchema.safeParse(baseListing({ title: '   ' }))
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('title')
  })

  it('rejects a blank category', () => {
    const result = serviceListingFormSchema.safeParse(baseListing({ category: '   ' }))
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('category')
  })

  it('rejects a title past the 255-character column limit', () => {
    const result = serviceListingFormSchema.safeParse(baseListing({ title: 'x'.repeat(256) }))
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('title')
  })
})

/**
 * `proposedPrice` only matters for a NEGOTIABLE listing — `buildRequestServiceOrderSchema` takes
 * that as a parameter rather than inferring it from the request's own fields, since the listing
 * being ordered isn't part of the order form itself.
 */
describe('buildRequestServiceOrderSchema', () => {
  it('requires a proposed price when the listing is negotiable', () => {
    const schema = buildRequestServiceOrderSchema(true)
    const result = schema.safeParse({ requirements: '', proposedPrice: '', scheduledAt: '' })
    expect(result.success).toBe(false)
    expect(orderIssuePaths(result)).toContain('proposedPrice')
  })

  it('accepts a proposed price when the listing is negotiable', () => {
    const schema = buildRequestServiceOrderSchema(true)
    expect(schema.safeParse({ requirements: '', proposedPrice: '40', scheduledAt: '' }).success).toBe(true)
  })

  it('does not require a proposed price for a FIXED/HOURLY listing', () => {
    const schema = buildRequestServiceOrderSchema(false)
    expect(schema.safeParse({ requirements: '', proposedPrice: '', scheduledAt: '' }).success).toBe(true)
  })
})
