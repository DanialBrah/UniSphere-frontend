import { describe, it, expect } from 'vitest'
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  CLAIM_STATUS_CHIP,
  CLAIM_STATUS_LABEL,
  CLAIM_STATUS_ORDER,
  INCIDENT_PLACE_LABEL,
  OCCURRED_AT_LABEL,
  PICKUP_PLACE_LABEL,
  STATUS_CHIP,
  STATUS_HINT,
  STATUS_LABEL,
  STATUS_ORDER,
  TYPE_CHIP,
  TYPE_LABEL,
  TYPE_ORDER,
} from '../../../../features/lostfound/utils/display'
import type {
  LostFoundCategory,
  LostFoundClaimStatus,
  LostFoundItemStatus,
  LostFoundItemType,
} from '../../../../features/lostfound/types'

/**
 * These maps are declared as full `Record<Union, string>` so a new enum member is a compile error
 * everywhere. The tests guard the other half of that contract: that the *order* arrays and the
 * label maps stay in step, which the type system can't check.
 */

const ALL_TYPES: LostFoundItemType[] = ['LOST', 'FOUND']
const ALL_STATUSES: LostFoundItemStatus[] = [
  'OPEN',
  'CLAIMED',
  'RESOLVED',
  'EXPIRED',
  'CANCELLED',
]
const ALL_CLAIM_STATUSES: LostFoundClaimStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
]
const ALL_CATEGORIES: LostFoundCategory[] = [
  'ELECTRONICS',
  'DOCUMENTS',
  'CARDS_AND_KEYS',
  'CLOTHING',
  'BAGS',
  'ACCESSORIES',
  'BOOKS',
  'SPORTS',
  'PETS',
  'OTHER',
]

describe('label coverage', () => {
  it('names every item type, status, claim status and category', () => {
    for (const type of ALL_TYPES) expect(TYPE_LABEL[type]).toBeTruthy()
    for (const status of ALL_STATUSES) expect(STATUS_LABEL[status]).toBeTruthy()
    for (const status of ALL_CLAIM_STATUSES) expect(CLAIM_STATUS_LABEL[status]).toBeTruthy()
    for (const category of ALL_CATEGORIES) expect(CATEGORY_LABEL[category]).toBeTruthy()
  })

  it('styles every chip', () => {
    for (const type of ALL_TYPES) expect(TYPE_CHIP[type]).toBeTruthy()
    for (const status of ALL_STATUSES) expect(STATUS_CHIP[status]).toBeTruthy()
    for (const status of ALL_CLAIM_STATUSES) expect(CLAIM_STATUS_CHIP[status]).toBeTruthy()
  })

  it('explains every item status on the detail page', () => {
    for (const status of ALL_STATUSES) expect(STATUS_HINT[status]).toBeTruthy()
  })
})

describe('order arrays', () => {
  it('lists every member exactly once', () => {
    expect([...TYPE_ORDER].sort()).toEqual([...ALL_TYPES].sort())
    expect([...STATUS_ORDER].sort()).toEqual([...ALL_STATUSES].sort())
    expect([...CLAIM_STATUS_ORDER].sort()).toEqual([...ALL_CLAIM_STATUSES].sort())
    expect([...CATEGORY_ORDER].sort()).toEqual([...ALL_CATEGORIES].sort())
  })

  it('keeps OTHER last in the category picker', () => {
    expect(CATEGORY_ORDER.at(-1)).toBe('OTHER')
  })
})

describe('type-dependent field labels', () => {
  // One field, two meanings. Getting these backwards makes the report form incomprehensible, and
  // no type error would catch it.
  it('asks about losing on a LOST report and finding on a FOUND one', () => {
    expect(INCIDENT_PLACE_LABEL.LOST).toMatch(/lose/i)
    expect(INCIDENT_PLACE_LABEL.FOUND).toMatch(/find/i)
    expect(OCCURRED_AT_LABEL.LOST).toMatch(/lose/i)
    expect(OCCURRED_AT_LABEL.FOUND).toMatch(/find/i)
  })

  it('inverts the pickup question by item type', () => {
    // On a LOST report the pickup point is where a finder returns it to you.
    expect(PICKUP_PLACE_LABEL.LOST).toMatch(/returned to you/i)
    // On a FOUND report it's where the owner collects it.
    expect(PICKUP_PLACE_LABEL.FOUND).toMatch(/collect/i)
  })
})
