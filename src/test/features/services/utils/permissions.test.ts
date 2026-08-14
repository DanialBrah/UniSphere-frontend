import { describe, it, expect } from 'vitest'
import {
  acceptNeedsAgreedPrice,
  allowedListingStatusTargets,
  allowedOrderStatusTargets,
  canCreateService,
  canModifyListing,
  canOrderService,
  canReviewOrder,
  isTerminalOrderStatus,
} from '../../../../features/services/utils/permissions'
import type { UserProfileResponse } from '../../../../features/identity/types/auth'
import type { ServiceOrderResponse, ServiceOrderStatus } from '../../../../features/services/types'

function user(id: number, role: UserProfileResponse['role'] = 'STUDENT'): UserProfileResponse {
  return { id, role, fullName: `User ${id}`, email: `u${id}@uni.edu` } as UserProfileResponse
}

function actor(id: number) {
  return { id, displayName: `User ${id}`, avatarUrl: null, role: 'STUDENT' }
}

function order(overrides: Partial<ServiceOrderResponse> = {}): ServiceOrderResponse {
  return {
    id: 1,
    listingId: 5,
    listingTitle: 'Calculus Tutoring',
    provider: actor(10),
    client: actor(20),
    requirements: null,
    agreedPrice: 50,
    scheduledAt: null,
    status: 'PENDING',
    decisionReason: null,
    conversationId: 99,
    createdAt: '2026-08-05T15:00:00',
    updatedAt: '2026-08-05T15:00:00',
    ...overrides,
  }
}

describe('canCreateService', () => {
  it('is STUDENT, ALUMNI or CLUB only — matches ServiceAccessService.assertCanCreate', () => {
    expect(canCreateService(user(1, 'STUDENT'))).toBe(true)
    expect(canCreateService(user(1, 'ALUMNI'))).toBe(true)
    expect(canCreateService(user(1, 'CLUB'))).toBe(true)
    expect(canCreateService(user(1, 'EMPLOYER'))).toBe(false)
    expect(canCreateService(user(1, 'UNIVERSITY'))).toBe(false)
    expect(canCreateService(user(1, 'ADMIN'))).toBe(false)
  })

  it('is false with no signed-in user', () => {
    expect(canCreateService(null)).toBe(false)
  })
})

describe('canOrderService', () => {
  it('is everyone but ADMIN — broader than canCreateService, matches assertCanOrder', () => {
    for (const role of ['STUDENT', 'ALUMNI', 'CLUB', 'EMPLOYER', 'UNIVERSITY'] as UserProfileResponse['role'][]) {
      expect(canOrderService(user(1, role))).toBe(true)
    }
    expect(canOrderService(user(1, 'ADMIN'))).toBe(false)
  })

  it('is false with no signed-in user', () => {
    expect(canOrderService(null)).toBe(false)
  })
})

describe('canModifyListing', () => {
  const listing = { provider: { id: 10 } }

  it("is the provider's call, and an admin's", () => {
    expect(canModifyListing(user(10, 'STUDENT'), listing)).toBe(true)
    expect(canModifyListing(user(99, 'ADMIN'), listing)).toBe(true)
  })

  it("is not a stranger's call", () => {
    expect(canModifyListing(user(20, 'STUDENT'), listing)).toBe(false)
  })

  it('is false with no signed-in user', () => {
    expect(canModifyListing(null, listing)).toBe(false)
  })
})

describe('allowedListingStatusTargets', () => {
  it('offers exactly the other of the two states', () => {
    expect(allowedListingStatusTargets('ACTIVE')).toEqual(['PAUSED'])
    expect(allowedListingStatusTargets('PAUSED')).toEqual(['ACTIVE'])
  })
})

describe('isTerminalOrderStatus', () => {
  it('covers exactly the three states with no outgoing transitions', () => {
    expect(isTerminalOrderStatus('COMPLETED')).toBe(true)
    expect(isTerminalOrderStatus('CANCELLED')).toBe(true)
    expect(isTerminalOrderStatus('DISPUTED')).toBe(true)
    expect(isTerminalOrderStatus('PENDING')).toBe(false)
    expect(isTerminalOrderStatus('ACCEPTED')).toBe(false)
    expect(isTerminalOrderStatus('IN_PROGRESS')).toBe(false)
  })
})

/**
 * Mirrors ServiceOrderService.updateOrderStatus's FSM exactly:
 * - PENDING -> ACCEPTED / ACCEPTED -> IN_PROGRESS / IN_PROGRESS -> COMPLETED: provider/ADMIN only.
 * - PENDING|ACCEPTED -> CANCELLED, ACCEPTED|IN_PROGRESS -> DISPUTED: client, provider or ADMIN.
 * - Nothing is ever offered from PENDING itself, or from a terminal state.
 */
describe('allowedOrderStatusTargets', () => {
  it('offers the provider ACCEPTED and CANCELLED from PENDING, never DISPUTED', () => {
    expect([...allowedOrderStatusTargets('PENDING', true, false)].sort()).toEqual(['ACCEPTED', 'CANCELLED'])
  })

  it('offers the client only CANCELLED from PENDING — no accept/start/complete power', () => {
    expect(allowedOrderStatusTargets('PENDING', false, true)).toEqual(['CANCELLED'])
  })

  it('offers the provider IN_PROGRESS, CANCELLED and DISPUTED from ACCEPTED', () => {
    expect([...allowedOrderStatusTargets('ACCEPTED', true, false)].sort()).toEqual(
      ['CANCELLED', 'DISPUTED', 'IN_PROGRESS'].sort(),
    )
  })

  it('offers the client CANCELLED and DISPUTED from ACCEPTED, never IN_PROGRESS', () => {
    expect([...allowedOrderStatusTargets('ACCEPTED', false, true)].sort()).toEqual(['CANCELLED', 'DISPUTED'])
  })

  it('offers the provider COMPLETED and DISPUTED from IN_PROGRESS, never CANCELLED', () => {
    expect([...allowedOrderStatusTargets('IN_PROGRESS', true, false)].sort()).toEqual(['COMPLETED', 'DISPUTED'])
  })

  it('offers the client only DISPUTED from IN_PROGRESS', () => {
    expect(allowedOrderStatusTargets('IN_PROGRESS', false, true)).toEqual(['DISPUTED'])
  })

  it('offers nothing to a bystander who is neither the client nor the provider/admin', () => {
    expect(allowedOrderStatusTargets('PENDING', false, false)).toEqual([])
    expect(allowedOrderStatusTargets('ACCEPTED', false, false)).toEqual([])
  })

  it('offers nothing from any terminal status, regardless of who is asking', () => {
    for (const status of ['COMPLETED', 'CANCELLED', 'DISPUTED'] as ServiceOrderStatus[]) {
      expect(allowedOrderStatusTargets(status, true, true)).toEqual([])
    }
  })
})

describe('acceptNeedsAgreedPrice', () => {
  it('is true only when the order has no price yet — a NEGOTIABLE order awaiting a figure', () => {
    expect(acceptNeedsAgreedPrice({ agreedPrice: null })).toBe(true)
    expect(acceptNeedsAgreedPrice({ agreedPrice: 50 })).toBe(false)
    expect(acceptNeedsAgreedPrice({ agreedPrice: 0 })).toBe(false)
  })
})

describe('canReviewOrder', () => {
  it('allows the client or the provider on a COMPLETED order, not yet reviewed', () => {
    const completed = order({ status: 'COMPLETED' })
    expect(canReviewOrder(user(20), completed, false)).toBe(true)
    expect(canReviewOrder(user(10), completed, false)).toBe(true)
  })

  it('blocks a bystander who is neither party', () => {
    expect(canReviewOrder(user(30), order({ status: 'COMPLETED' }), false)).toBe(false)
  })

  it('blocks a non-COMPLETED order', () => {
    for (const status of ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'CANCELLED', 'DISPUTED'] as ServiceOrderStatus[]) {
      expect(canReviewOrder(user(20), order({ status }), false)).toBe(false)
    }
  })

  it('blocks a second review once one is already on record', () => {
    expect(canReviewOrder(user(20), order({ status: 'COMPLETED' }), true)).toBe(false)
  })

  it('is false with no signed-in user', () => {
    expect(canReviewOrder(null, order({ status: 'COMPLETED' }), false)).toBe(false)
  })
})
