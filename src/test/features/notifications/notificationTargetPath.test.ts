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
})
