import { describe, it, expect } from 'vitest'
import { notificationTargetPath } from '../../../features/notifications/types'
import type {
  NotificationResponse,
  NotifTargetType,
} from '../../../features/notifications/types'

function notification(
  targetType: NotifTargetType,
  targetId: number,
): NotificationResponse {
  return {
    id: 1,
    actorId: 2,
    actorName: 'Someone',
    actorAvatarUrl: null,
    notifType: 'LOST_FOUND_CLAIM',
    targetId,
    targetType,
    read: false,
    createdAt: '2026-08-07T09:00:00',
  }
}

describe('notificationTargetPath', () => {
  it('routes the existing target types unchanged', () => {
    expect(notificationTargetPath(notification('USER', 5))).toBe('/profile/5')
    expect(notificationTargetPath(notification('POST', 5))).toBe('/post/5')
    expect(notificationTargetPath(notification('NEWS_ARTICLE', 5))).toBe('/news/5')
    expect(notificationTargetPath(notification('COMMUNITY', 5))).toBe('/community/5')
  })

  /**
   * The trap in this one: LostFoundClaimService sends targetType "LOST_FOUND_ITEM" but passes
   * `claim.getId()` as the targetId. Linking to `/lost-found/{targetId}` would open whichever
   * *item* happens to share that number — a real, silent mis-navigation.
   */
  it('routes a Lost & Found claim notification to the claim resolver, not to an item', () => {
    expect(notificationTargetPath(notification('LOST_FOUND_ITEM', 42))).toBe(
      '/lost-found/claims/42',
    )
    expect(notificationTargetPath(notification('LOST_FOUND_ITEM', 42))).not.toBe('/lost-found/42')
  })

  it('returns null for an unrecognised target type instead of a broken link', () => {
    expect(notificationTargetPath(notification('SOMETHING_NEW' as NotifTargetType, 5))).toBeNull()
  })

  /**
   * Events is a real divergence from every other feature here: instead of one stable entity-kind
   * value (like COMMUNITY or LOST_FOUND_ITEM), the backend puts the notification's *sub-kind* into
   * targetType — six distinct literal strings, all pointing at an event id via targetId.
   */
  it('routes all six Events notification sub-kinds to the event they describe', () => {
    const eventTargetTypes: NotifTargetType[] = [
      'EVENT_REGISTRATION_CONFIRMED',
      'EVENT_REGISTRATION_WAITLISTED',
      'EVENT_WAITLIST_PROMOTED',
      'EVENT_CANCELLED',
      'EVENT_REMINDER',
      'EVENT_REGISTRATION_REMOVED',
    ]

    for (const targetType of eventTargetTypes) {
      expect(notificationTargetPath(notification(targetType, 42))).toBe('/events/42')
    }
  })

  /**
   * Jobs follows the same sub-kind-in-targetType pattern Events introduced: notifType is always
   * the single literal 'JOB', and these four literal strings point at a job id via targetId.
   */
  it('routes all four Jobs notification sub-kinds to the job they describe', () => {
    const jobTargetTypes: NotifTargetType[] = [
      'JOB_APPLICATION_RECEIVED',
      'JOB_APPLICATION_STATUS_CHANGED',
      'JOB_CLOSED',
      'JOB_FILLED',
    ]

    for (const targetType of jobTargetTypes) {
      expect(notificationTargetPath(notification(targetType, 42))).toBe('/jobs/42')
    }
  })
})
