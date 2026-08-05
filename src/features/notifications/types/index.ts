/**
 * Mirrors the backend `NotificationType` enum in full. Only LIKE, COMMENT, FOLLOW and MENTION are
 * actually emitted today (see `createAndPush` call sites), but typing the whole enum means an
 * unhandled type is a visible gap rather than something that silently falls through — which is how
 * FOLLOW notifications ended up rendering as "sent you a notification".
 */
export type NotifType =
  | 'LIKE'
  | 'COMMENT'
  | 'FOLLOW'
  | 'MENTION'
  | 'EVENT'
  | 'JOB'
  | 'MESSAGE'
  | 'ORDER'
  | 'SERVICE_ORDER'
  | 'CLUB_INVITE'
  | 'PROJECT_INVITE'
  | 'MATCH'
  | 'STUDY_SESSION'
  | 'LOST_FOUND_CLAIM'
  | 'VERIFICATION'

/**
 * What `targetId` points at. FOLLOW sends `USER`; LIKE/COMMENT/MENTION send `POST`. Ignoring this
 * is what made a follow notification navigate to `/post/{userId}`.
 *
 * Campus News reuses LIKE and COMMENT with `NEWS_ARTICLE`, so the same notification type can
 * point at either a post or an article — the target type is the only thing that distinguishes them.
 */
export type NotifTargetType = 'POST' | 'USER' | 'NEWS_ARTICLE'

export interface NotificationResponse {
  id: number
  actorId: number
  /** Null when the actor's account has been deleted — render "Someone" instead. */
  actorName: string | null
  actorAvatarUrl: string | null
  notifType: NotifType
  targetId: number
  targetType: NotifTargetType
  read: boolean
  createdAt: string
}

export interface UnreadCountResponse {
  count: number
}

/** Display name for the person who triggered a notification. */
export function actorLabel(notification: NotificationResponse): string {
  return notification.actorName?.trim() || 'Someone'
}

/** Where a notification should navigate, or null when the target isn't linkable. */
export function notificationTargetPath(notification: NotificationResponse): string | null {
  switch (notification.targetType) {
    case 'USER':
      return `/profile/${notification.targetId}`
    case 'POST':
      return `/post/${notification.targetId}`
    case 'NEWS_ARTICLE':
      return `/news/${notification.targetId}`
    default:
      return null
  }
}
