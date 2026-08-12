import { describe, it, expect } from 'vitest'
import {
  allowedStatusTargets,
  canCancelClaim,
  canDecideClaim,
  canModifyItem,
  canSubmitClaim,
  isReporter,
  isTerminalStatus,
} from '../../../../features/lostfound/utils/permissions'
import { STATUS_ORDER } from '../../../../features/lostfound/utils/display'
import type { UserProfileResponse } from '../../../../features/identity/types/auth'
import type {
  LostFoundClaimResponse,
  LostFoundClaimStatus,
  LostFoundItemStatus,
  LostFoundItemSummaryResponse,
} from '../../../../features/lostfound/types'

function user(id: number, role: UserProfileResponse['role'] = 'STUDENT'): UserProfileResponse {
  return { id, role, fullName: `User ${id}`, email: `u${id}@uni.edu` } as UserProfileResponse
}

function item(
  overrides: Partial<LostFoundItemSummaryResponse> = {},
): LostFoundItemSummaryResponse {
  return {
    id: 1,
    reporter: { id: 10, displayName: 'Reporter', avatarUrl: null, role: 'STUDENT' },
    itemType: 'FOUND',
    category: 'ELECTRONICS',
    status: 'OPEN',
    title: 'Power bank',
    primaryImageUrl: null,
    incidentPlace: null,
    incidentLatitude: null,
    incidentLongitude: null,
    coordinatesApproximate: false,
    pickupPlace: null,
    pickupLatitude: null,
    pickupLongitude: null,
    universityId: 1,
    occurredAt: '2026-08-05T14:30:00',
    pendingClaimCount: 0,
    viewerClaimStatus: null,
    canModify: false,
    createdAt: '2026-08-05T15:00:00',
    ...overrides,
  }
}

function claim(
  overrides: Partial<LostFoundClaimResponse> = {},
): LostFoundClaimResponse {
  return {
    id: 5,
    itemId: 1,
    itemTitle: 'Power bank',
    claimant: { id: 20, displayName: 'Claimant', avatarUrl: null, role: 'STUDENT' },
    status: 'PENDING',
    proofText: 'It has a chipped corner and a blue sticker on the back.',
    proofImageUrl: null,
    decisionNote: null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: '2026-08-06T09:00:00',
    updatedAt: '2026-08-06T09:00:00',
    ...overrides,
  }
}

describe('isReporter / canModifyItem', () => {
  it('recognises the reporter', () => {
    expect(isReporter(user(10), item())).toBe(true)
    expect(isReporter(user(20), item())).toBe(false)
  })

  it('lets an admin modify someone else’s item, but a plain student not', () => {
    expect(canModifyItem(user(99, 'ADMIN'), item())).toBe(true)
    expect(canModifyItem(user(20), item())).toBe(false)
  })

  it('is false with no signed-in user', () => {
    expect(canModifyItem(null, item())).toBe(false)
    expect(isReporter(undefined, item())).toBe(false)
  })
})

describe('canSubmitClaim', () => {
  it('allows a stranger to claim an open item', () => {
    expect(canSubmitClaim(user(20), item())).toBe(true)
  })

  it('blocks the reporter claiming their own item', () => {
    expect(canSubmitClaim(user(10), item())).toBe(false)
  })

  it('blocks a claim once the item is no longer open', () => {
    for (const status of ['CLAIMED', 'RESOLVED', 'EXPIRED', 'CANCELLED'] as LostFoundItemStatus[]) {
      expect(canSubmitClaim(user(20), item({ status }))).toBe(false)
    }
  })

  it('blocks a second claim while one is pending or approved', () => {
    expect(canSubmitClaim(user(20), item({ viewerClaimStatus: 'PENDING' }))).toBe(false)
    expect(canSubmitClaim(user(20), item({ viewerClaimStatus: 'APPROVED' }))).toBe(false)
  })

  // The server has no unique constraint on rejected claims, deliberately — someone rejected in
  // error must be able to try again with better proof.
  it('allows a fresh claim after a rejection or a withdrawal', () => {
    expect(canSubmitClaim(user(20), item({ viewerClaimStatus: 'REJECTED' }))).toBe(true)
    expect(canSubmitClaim(user(20), item({ viewerClaimStatus: 'CANCELLED' }))).toBe(true)
  })
})

describe('canDecideClaim', () => {
  it('is the reporter’s call, and an admin’s', () => {
    expect(canDecideClaim(user(10), item(), claim())).toBe(true)
    expect(canDecideClaim(user(99, 'ADMIN'), item(), claim())).toBe(true)
  })

  it('is not the claimant’s call', () => {
    expect(canDecideClaim(user(20), item(), claim())).toBe(false)
  })

  it('is unavailable once the claim has been decided', () => {
    for (const status of ['APPROVED', 'REJECTED', 'CANCELLED'] as LostFoundClaimStatus[]) {
      expect(canDecideClaim(user(10), item(), claim({ status }))).toBe(false)
    }
  })
})

describe('canCancelClaim', () => {
  it('belongs to the claimant alone', () => {
    expect(canCancelClaim(user(20), claim())).toBe(true)
    expect(canCancelClaim(user(10), claim())).toBe(false)
    // Deliberately not an admin power — nobody withdraws on someone else's behalf.
    expect(canCancelClaim(user(99, 'ADMIN'), claim())).toBe(false)
  })

  it('only applies while the claim is pending', () => {
    expect(canCancelClaim(user(20), claim({ status: 'APPROVED' }))).toBe(false)
  })
})

describe('allowedStatusTargets', () => {
  // PATCH /items/{id}/status rejects both outright with a 409: CLAIMED is written only by claim
  // approval, EXPIRED only by the nightly sweep.
  it('never offers CLAIMED or EXPIRED from any state', () => {
    for (const status of STATUS_ORDER) {
      const targets = allowedStatusTargets(status)
      expect(targets).not.toContain('CLAIMED')
      expect(targets).not.toContain('EXPIRED')
    }
  })

  it('mirrors the server FSM', () => {
    expect(allowedStatusTargets('OPEN')).toEqual(['RESOLVED', 'CANCELLED'])
    expect(allowedStatusTargets('CLAIMED')).toEqual(['RESOLVED', 'CANCELLED', 'OPEN'])
    expect(allowedStatusTargets('EXPIRED')).toEqual(['OPEN'])
  })

  it('offers nothing from a terminal state', () => {
    expect(allowedStatusTargets('RESOLVED')).toEqual([])
    expect(allowedStatusTargets('CANCELLED')).toEqual([])
  })

  it('never offers a no-op transition to the state the item is already in', () => {
    // from === to is a 409 server-side.
    for (const status of STATUS_ORDER) {
      expect(allowedStatusTargets(status)).not.toContain(status)
    }
  })
})

describe('isTerminalStatus', () => {
  it('covers exactly the two states with no outgoing transitions', () => {
    expect(isTerminalStatus('RESOLVED')).toBe(true)
    expect(isTerminalStatus('CANCELLED')).toBe(true)
    expect(isTerminalStatus('OPEN')).toBe(false)
    expect(isTerminalStatus('CLAIMED')).toBe(false)
    expect(isTerminalStatus('EXPIRED')).toBe(false)
  })
})
