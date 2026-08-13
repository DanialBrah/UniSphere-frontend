import { describe, it, expect } from 'vitest'
import {
  allowedEventStatusTargets,
  canCancelRegistration,
  canCheckIn,
  canModifyEvent,
  canRegister,
  hasActiveRegistrations,
  isTerminalEventStatus,
} from '../../../../features/events/utils/permissions'
import type { UserProfileResponse } from '../../../../features/identity/types/auth'
import type { EventResponse, EventStatus } from '../../../../features/events/types'

function user(id: number, role: UserProfileResponse['role'] = 'STUDENT'): UserProfileResponse {
  return { id, role, fullName: `User ${id}`, email: `u${id}@uni.edu` } as UserProfileResponse
}

function event(overrides: Partial<EventResponse> = {}): EventResponse {
  return {
    id: 1,
    organizer: { id: 10, displayName: 'Organizer', avatarUrl: null, role: 'CLUB' },
    category: 'SOCIAL',
    status: 'PUBLISHED',
    title: "Freshers' Welcome Night",
    description: null,
    coverImageUrl: null,
    startDatetime: '2099-09-01T18:00:00',
    endDatetime: '2099-09-01T21:00:00',
    online: false,
    onlineUrl: null,
    venueName: 'Main auditorium',
    latitude: 3.0678,
    longitude: 101.5006,
    registrationMode: 'INTERNAL',
    externalRegistrationUrl: null,
    maxCapacity: null,
    registeredCount: 0,
    waitlistedCount: 0,
    availableSeats: null,
    universityId: 1,
    viewerRegistrationStatus: null,
    canModify: false,
    createdAt: '2026-08-05T15:00:00',
    updatedAt: '2026-08-05T15:00:00',
    ...overrides,
  }
}

describe('canModifyEvent', () => {
  it('is the organizer’s call, and an admin’s', () => {
    expect(canModifyEvent(user(10), event())).toBe(true)
    expect(canModifyEvent(user(99, 'ADMIN'), event())).toBe(true)
  })

  it('is not a stranger’s call', () => {
    expect(canModifyEvent(user(20), event())).toBe(false)
  })

  it('is false with no signed-in user', () => {
    expect(canModifyEvent(null, event())).toBe(false)
  })
})

describe('canRegister', () => {
  it('allows a stranger to register for a published, internal, not-yet-started event', () => {
    expect(canRegister(user(20), event())).toBe(true)
  })

  // Mirrors EventRegistrationService.register's server-side block — an organizer doesn't occupy a
  // capacity-limited seat slot as a registrant on their own event.
  it('blocks the organizer from registering for their own event', () => {
    expect(canRegister(user(10), event())).toBe(false)
  })

  it('blocks registration for an external event', () => {
    expect(canRegister(user(20), event({ registrationMode: 'EXTERNAL' }))).toBe(false)
  })

  it('blocks registration unless the event is PUBLISHED', () => {
    for (const status of ['DRAFT', 'CANCELLED', 'COMPLETED'] as EventStatus[]) {
      expect(canRegister(user(20), event({ status }))).toBe(false)
    }
  })

  it('blocks registration once the event has started', () => {
    expect(canRegister(user(20), event({ startDatetime: '2020-01-01T00:00:00' }))).toBe(false)
  })

  it('blocks a second registration while one is active', () => {
    expect(canRegister(user(20), event({ viewerRegistrationStatus: 'REGISTERED' }))).toBe(false)
    expect(canRegister(user(20), event({ viewerRegistrationStatus: 'WAITLISTED' }))).toBe(false)
  })

  it('allows registering again after cancelling', () => {
    expect(canRegister(user(20), event({ viewerRegistrationStatus: 'CANCELLED' }))).toBe(true)
  })
})

describe('canCancelRegistration', () => {
  it('belongs to the registrant, the organizer, or an admin', () => {
    const e = event()
    const reg = { userId: 20, status: 'REGISTERED' as const }

    expect(canCancelRegistration(user(20), e, reg)).toBe(true)
    expect(canCancelRegistration(user(10), e, reg)).toBe(true)
    expect(canCancelRegistration(user(99, 'ADMIN'), e, reg)).toBe(true)
  })

  it('is not a stranger’s call', () => {
    expect(
      canCancelRegistration(user(30), event(), { userId: 20, status: 'REGISTERED' }),
    ).toBe(false)
  })

  it('only applies while the registration is active', () => {
    const e = event()
    expect(canCancelRegistration(user(20), e, { userId: 20, status: 'CANCELLED' })).toBe(false)
    expect(canCancelRegistration(user(20), e, { userId: 20, status: 'ATTENDED' })).toBe(false)
  })
})

describe('canCheckIn', () => {
  it('is organizer/admin only — never the registrant themselves', () => {
    const e = event()
    expect(canCheckIn(user(10), e)).toBe(true)
    expect(canCheckIn(user(99, 'ADMIN'), e)).toBe(true)
    expect(canCheckIn(user(20), e)).toBe(false)
  })
})

describe('allowedEventStatusTargets', () => {
  // PATCH /events/{id}/status rejects COMPLETED outright with a 409 — it's written only by the
  // scheduled completion sweep.
  it('never offers COMPLETED from any state', () => {
    for (const status of ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'] as EventStatus[]) {
      expect(allowedEventStatusTargets(status)).not.toContain('COMPLETED')
    }
  })

  it('mirrors the server FSM', () => {
    expect(allowedEventStatusTargets('DRAFT')).toEqual(['PUBLISHED', 'CANCELLED'])
    expect(allowedEventStatusTargets('PUBLISHED')).toEqual(['CANCELLED'])
  })

  it('offers nothing from a terminal state', () => {
    expect(allowedEventStatusTargets('CANCELLED')).toEqual([])
    expect(allowedEventStatusTargets('COMPLETED')).toEqual([])
  })
})

describe('isTerminalEventStatus', () => {
  it('covers exactly the two states with no outgoing transitions', () => {
    expect(isTerminalEventStatus('CANCELLED')).toBe(true)
    expect(isTerminalEventStatus('COMPLETED')).toBe(true)
    expect(isTerminalEventStatus('DRAFT')).toBe(false)
    expect(isTerminalEventStatus('PUBLISHED')).toBe(false)
  })
})

describe('hasActiveRegistrations', () => {
  it('is true when either counter is non-zero', () => {
    expect(hasActiveRegistrations({ registeredCount: 1, waitlistedCount: 0 })).toBe(true)
    expect(hasActiveRegistrations({ registeredCount: 0, waitlistedCount: 1 })).toBe(true)
  })

  it('is false when both counters are zero — the only case DELETE actually allows', () => {
    expect(hasActiveRegistrations({ registeredCount: 0, waitlistedCount: 0 })).toBe(false)
  })
})
