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
  | 'COMMUNITY_ANNOUNCEMENT'
  | 'COMMUNITY_JOIN_REQUEST'
  | 'COMMUNITY_JOIN_APPROVED'
  | 'COMMUNITY_JOIN_REJECTED'
  | 'COMMUNITY_ROLE_CHANGED'

/**
 * What `targetId` points at. FOLLOW sends `USER`; LIKE/COMMENT/MENTION send `POST`. Ignoring this
 * is what made a follow notification navigate to `/post/{userId}`.
 *
 * Campus News reuses LIKE and COMMENT with `NEWS_ARTICLE`, so the same notification type can
 * point at either a post or an article — the target type is the only thing that distinguishes them.
 */
export type NotifTargetType =
  | 'POST'
  | 'USER'
  | 'NEWS_ARTICLE'
  | 'COMMUNITY'
  | 'LOST_FOUND_ITEM'
  // Events puts the notification's sub-kind here instead of a single stable entity type — every
  // one of these five points at an event id via targetId. See EventRegistrationService /
  // EventService.notifyRegistrantsOfCancellation, which pass these literal strings as targetType.
  | 'EVENT_REGISTRATION_CONFIRMED'
  | 'EVENT_REGISTRATION_WAITLISTED'
  | 'EVENT_WAITLIST_PROMOTED'
  | 'EVENT_CANCELLED'
  | 'EVENT_REMINDER'
  // Sent when an organizer/admin removes someone else's registration — EventRegistrationService.cancel.
  | 'EVENT_REGISTRATION_REMOVED'
  // Jobs puts the notification's sub-kind here too (mirrors Events) — always paired with
  // notifType: "JOB". See JobApplicationService / JobService for the emit sites.
  | 'JOB_APPLICATION_RECEIVED'
  | 'JOB_APPLICATION_STATUS_CHANGED'
  | 'JOB_CLOSED'
  | 'JOB_FILLED'

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
    case 'COMMUNITY':
      return `/community/${notification.targetId}`
    // Despite the name, targetId here is the CLAIM id, not the item id — LostFoundClaimService
    // sends targetType "LOST_FOUND_ITEM" with claim.getId() so a client can deep-link to the
    // claim being decided. /lost-found/claims/:claimId resolves it and forwards to the item.
    case 'LOST_FOUND_ITEM':
      return `/lost-found/claims/${notification.targetId}`
    case 'EVENT_REGISTRATION_CONFIRMED':
    case 'EVENT_REGISTRATION_WAITLISTED':
    case 'EVENT_WAITLIST_PROMOTED':
    case 'EVENT_CANCELLED':
    case 'EVENT_REMINDER':
    case 'EVENT_REGISTRATION_REMOVED':
      return `/events/${notification.targetId}`
    case 'JOB_APPLICATION_RECEIVED':
    case 'JOB_APPLICATION_STATUS_CHANGED':
    case 'JOB_CLOSED':
    case 'JOB_FILLED':
      return `/jobs/${notification.targetId}`
    default:
      return null
  }
}
