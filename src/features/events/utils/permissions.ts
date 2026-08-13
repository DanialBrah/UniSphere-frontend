import type { UserProfileResponse } from '../../identity/types/auth'
import type { EventResponse, EventStatus, EventUserStatusTarget } from '../types'

/**
 * UI mirroring only. Every rule here is enforced independently by EventAccessService and
 * EventService/EventRegistrationService server-side; these predicates exist to avoid showing a
 * control that would fail, not to authorise anything. A stale token or a role change makes the
 * client's view wrong, so never treat a passing check as permission.
 */

/**
 * The server also sends `canModify` on every event, computed from the same rule. Prefer that when
 * it's available; this exists for the places holding only a user and an organizer id.
 */
export function canModifyEvent(
  user: UserProfileResponse | null | undefined,
  event: { organizer: { id: number } },
): boolean {
  if (!user) return false
  return user.id === event.organizer.id || user.role === 'ADMIN'
}

/**
 * Internal registration is open while the event is PUBLISHED, hasn't started yet, the viewer isn't
 * the organizer, and they have no active (REGISTERED/WAITLISTED) registration already.
 *
 * The organizer block mirrors `EventRegistrationService.register`'s server-side check — an
 * organizer doesn't occupy a capacity-limited seat slot as a registrant on their own event.
 */
export function canRegister(user: UserProfileResponse | null | undefined, event: EventResponse): boolean {
  if (!user) return false
  if (user.id === event.organizer.id) return false
  if (event.registrationMode !== 'INTERNAL') return false
  if (event.status !== 'PUBLISHED') return false
  if (new Date(event.startDatetime).getTime() <= Date.now()) return false
  return event.viewerRegistrationStatus == null || event.viewerRegistrationStatus === 'CANCELLED'
}

/** Cancelling your own seat/waitlist spot, or the event's organizer/an admin cancelling it for you. */
export function canCancelRegistration(
  user: UserProfileResponse | null | undefined,
  event: { organizer: { id: number } },
  registration: { userId: number; status: 'REGISTERED' | 'WAITLISTED' | 'CANCELLED' | 'ATTENDED' },
): boolean {
  if (!user) return false
  if (registration.status !== 'REGISTERED' && registration.status !== 'WAITLISTED') return false
  return user.id === registration.userId || user.id === event.organizer.id || user.role === 'ADMIN'
}

/** Organizer/ADMIN only — checking a ticket in at the door is never self-service. */
export function canCheckIn(
  user: UserProfileResponse | null | undefined,
  event: { organizer: { id: number } },
): boolean {
  return canModifyEvent(user, event)
}

/**
 * The status transitions a user may actually pick, mirroring the FSM in `EventService.changeStatus`.
 * `COMPLETED` is written only by the scheduled sweep — `PATCH /events/{id}/status` rejects it
 * outright with a 409 — so it never appears here.
 */
export function allowedEventStatusTargets(status: EventStatus): readonly EventUserStatusTarget[] {
  switch (status) {
    case 'DRAFT':
      return ['PUBLISHED', 'CANCELLED']
    case 'PUBLISHED':
      return ['CANCELLED']
    case 'CANCELLED':
    case 'COMPLETED':
      return []
  }
}

export function isTerminalEventStatus(status: EventStatus): boolean {
  return status === 'CANCELLED' || status === 'COMPLETED'
}

/** Deleting is blocked server-side (400) while any registration is still active. */
export function hasActiveRegistrations(event: { registeredCount: number; waitlistedCount: number }): boolean {
  return event.registeredCount > 0 || event.waitlistedCount > 0
}
